"use server"
import { revalidatePath } from "next/cache";
import { Announcements, Transactions, User, Admins } from "./models";
import { connectToDB } from "./utils";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { sendAnnouncementNotifications } from "./notificationUtils";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Simple image saving function that returns a proper image path in both environments
async function saveProfileImage(file) {
  try {
    // Check if file is valid
    if (!file || file.size === 0) {
      console.error("Invalid file received");
      return null;
    }
    
    // Extract file info for debugging
    console.log("Processing file:", {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(file.name)}`;
    
    // In production (Vercel), we can't write to the filesystem directly
    if (process.env.NODE_ENV === 'production') {
      try {
        // Get file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // For Vercel, we store the image data in the database as base64
        // This lets us create a data URL that will work without filesystem access
        const base64Data = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        
        // Return the data URL with a special prefix so we can identify it later
        return `dataurl:${filename}:${dataUrl}`;
      } catch (error) {
        console.error("Error processing file in production:", error);
        return null;
      }
    } else {
      // In development, save to the public/uploads directory
      const { writeFile, mkdir } = await import('fs/promises');
      const { existsSync } = await import('fs');
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
        console.log("Created uploads directory:", uploadDir);
      }
      
      const filepath = path.join(uploadDir, filename);
      
      // Get file buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save file to disk
      await writeFile(filepath, buffer);
      console.log("File saved successfully at:", filepath);
      
      // Return just the filename to be consistent with production
      return filename;
    }
  } catch (error) {
    console.error("Error saving profile image:", error);
    // Return null on error
    return null;
  }
}

export const addUser = async (formData) => {
  try {
    await connectToDB(); // Ensure DB connection

    // Extract values from form
    const formValues = Object.fromEntries(formData);
    const { firstName, middleName, lastName, cpNumber, purok, birthday, profession } = formValues;

    // More robust way to calculate next row number
    let nextRowNumber = 1; // Default to 1 if no users exist
    try {
      const lastUser = await User.findOne({}, {}, { sort: { rowNumber: -1 } });
      if (lastUser && lastUser.rowNumber && typeof lastUser.rowNumber === 'number') {
        nextRowNumber = lastUser.rowNumber + 1;
      }
      // Extra safeguard against NaN
      if (isNaN(nextRowNumber)) {
        console.warn("Generated row number was NaN, defaulting to 1");
        nextRowNumber = 1;
      }
    } catch (err) {
      console.error("Error calculating row number:", err);
      // Default to 1 if any error occurs
      nextRowNumber = 1;
    }

    console.log(`Creating new user with row number: ${nextRowNumber}`);

    // Create new user with updated schema
    const newUser = new User({
      rowNumber: nextRowNumber,
      firstName,
      middleName,
      lastName,
      cpNumber,
      purok,
      birthday: new Date(birthday),
      profession
    });

    await newUser.save();
    console.log("User saved successfully!");
    
  } catch (error) {
    console.error("Error adding user:", error);
    // Don't redirect on error so user can try again
    return { success: false, error: error.message };
  }
  
  revalidatePath("/dashboard/users"); // Ensure updated data
  redirect("/dashboard/users"); // Redirect after update
};


export const updateUser = async (formData) => {
  const formValues = Object.fromEntries(formData);
  const { id, firstName, middleName, lastName, cpNumber, purok, birthday, profession } = formValues;

  try {
    await connectToDB();
    
    const updateFields = {
      firstName,
      middleName,
      lastName,
      cpNumber,
      purok,
      birthday: birthday ? new Date(birthday) : undefined,
      profession
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(
      (key) => 
      (updateFields[key] === undefined) && delete updateFields[key]
    );

    await User.findByIdAndUpdate(id, updateFields);
    
  } catch (error) {
    console.error("Failed to update user:", error);
  }
  revalidatePath("/dashboard/users")
  redirect("/dashboard/users")
}

export const deleteUser = async (formData) => {
  const {id}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
     await User.findByIdAndDelete(id);

   
  } catch (error) {
    console.error("Failed to delete users:", error);
  }
  revalidatePath("/dashboard/users")
  
  
}

export const addAnnouncements = async (formData) => {
  const {createdBy, title, desc}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
    const newAnnouncements = new Announcements({
      createdBy, title, desc
    });

    await newAnnouncements.save();
  } catch (error) {
    console.error("Error creating announcement:", error);
  }
  revalidatePath("/dashboard/announcement")
  redirect("/dashboard/announcement")
}
export const updateAnnouncement = async (formData) => {
  
  
  const { id, createdBy, title, desc}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
    
    const updateFields = {
      createdBy, title, desc
    }
    Object.keys(updateFields).forEach(
    (key) => 
    (updateFields[key] === undefined) && delete updateFields[key]
  );

  await Announcements.findByIdAndUpdate(id, updateFields);
    
  } catch (error) {
    console.error("Failed to update announcement:", error);
    
  }
  revalidatePath("/dashboard/announcement")
  redirect("/dashboard/announcement")
}

export const deleteAnnouncements = async (formData) => {
  const {id}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
     await Announcements.findByIdAndDelete(id);

   
  } catch (error) {
    console.error("Failed to delete announcement:", error);
  }
  revalidatePath("/dashboard/announcement")
  
}

export const addTransactions = async (formData) => {
  const { cb, lastName, middleName, firstName, status, amount } = Object.fromEntries(formData);

  try {
    await connectToDB();

    // Calculate the next row number (similar to addUser function)
    let nextRowNumber = 1; // Default to 1 if no transactions exist
    try {
      const lastTransaction = await Transactions.findOne({}, {}, { sort: { rowNumber: -1 } });
      if (lastTransaction && lastTransaction.rowNumber && typeof lastTransaction.rowNumber === 'number') {
        nextRowNumber = lastTransaction.rowNumber + 1;
      }
      // Extra safeguard against NaN
      if (isNaN(nextRowNumber)) {
        console.warn("Generated row number was NaN, defaulting to 1");
        nextRowNumber = 1;
      }
    } catch (err) {
      console.error("Error calculating row number:", err);
      nextRowNumber = 1;
    }

    // Combine the name fields to create the beneficiaries field
    const beneficiaries = `${lastName || ''}, ${firstName || ''} ${middleName || ''}`.trim();

    const newTransactions = new Transactions({
      rowNumber: nextRowNumber,
      cb, 
      lastName,
      middleName,
      firstName,
      beneficiaries, // Explicitly set the beneficiaries field
      status,
      amount,
      createdAt: new Date()
    });

    await newTransactions.save();
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
  revalidatePath("/dashboard/transaction")
  redirect("/dashboard/transaction")
}

export const updateTransactions = async (formData) => {
  const { id, cb, lastName, middleName, firstName, status, amount } = Object.fromEntries(formData);

  try {
    await connectToDB();
    
    // Combine the name fields to create the beneficiaries field
    const beneficiaries = `${lastName || ''}, ${firstName || ''} ${middleName || ''}`.trim();
    
    const updateFields = {
      cb, 
      lastName,
      middleName,
      firstName,
      beneficiaries, // Add the combined beneficiaries field
      status, 
      amount
    }
    
    // Remove undefined fields
    Object.keys(updateFields).forEach(
      (key) => 
      (updateFields[key] === undefined) && delete updateFields[key]
    );

    await Transactions.findByIdAndUpdate(id, updateFields);
    
  } catch (error) {
    console.error("Failed to update transaction:", error);
  }
  revalidatePath("/dashboard/transaction")
  redirect("/dashboard/transaction")
}

export const deleteTransactions = async (formData) => {
  const {id}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
     await Transactions.findByIdAndDelete(id);

   
  } catch (error) {
    console.error("Failed to delete transaction:", error);
  }
  revalidatePath("/dashboard/transaction")
  
}

// Update the addAdmin action to properly handle image uploads
export const addAdmin = async (formData) => {
  "use server"
  
  try {
    await connectToDB();
    
    // Get form values
    const username = formData.get("username");
    const password = formData.get("password");
    const name = formData.get("name");
    const email = formData.get("email"); 
    const role = formData.get("role") || "system_admin"; // Default to system_admin if not provided
    
    console.log("Adding admin:", { username, name, email });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Process profile image
    let profileImageUrl = null;
    const profileImage = formData.get("profileImage");
    
    if (profileImage && profileImage.size > 0) {
      console.log("Processing profile image:", profileImage.name);
      profileImageUrl = await saveProfileImage(profileImage);
      console.log("Profile image saved with URL:", profileImageUrl);
    } else {
      console.log("No profile image provided");
    }
    
    // Create admin object
    const adminData = {
      username,
      password: hashedPassword,
      name: name || username,  // Default to username if name is not provided
      profileImage: profileImageUrl,
      email,
      role: role || "system_admin", // Default to system_admin if not provided
    };
    
    console.log("Creating admin with data:", {
      ...adminData,
      password: "[HIDDEN]"  // Don't log the password
    });
    
    // Save admin to database
    const newAdmin = new Admins(adminData);
    const savedAdmin = await newAdmin.save();
    
    console.log("Admin saved successfully:", {
      id: savedAdmin._id,
      username: savedAdmin.username
    });
    
    revalidatePath("/dashboard/admins");
    return { success: true };
  } catch (err) {
    console.error("Error creating admin:", err);
    return { error: err.message };
  }
};

export const deleteAdmin = async (formData) => {
  const {id}=
  Object.fromEntries(formData);

  try {
    await connectToDB();
     await Admins.findByIdAndDelete(id);

   
  } catch (error) {
    console.error("Failed to delete admins:", error);
  }
  revalidatePath("/dashboard/admins")
  
  
}

// Update the updateAdmin action
export const updateAdmin = async (formData) => {
  "use server"
  
  const id = formData.get("id");
  const role = formData.get("role");
  
  console.log("Updating admin with ID:", id);
  console.log("Setting role to:", role); // Log role value for debugging
  
  try {
    await connectToDB();
    
    // Prepare update data
    const updateData = {
      username: formData.get("username"),
      name: formData.get("name"),
      email: formData.get("email"),
      role: role, // Explicitly include the role field
    };
    
    // Update password if provided
    const password = formData.get("password");
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update profile image if provided
    const profileImage = formData.get("profileImage");
    if (profileImage && profileImage.size > 0) {
      console.log("Updating profile image for admin:", id);
      updateData.profileImage = await saveProfileImage(profileImage);
      console.log("New profile image URL:", updateData.profileImage);
    }
    
    // Log the update data for verification (excluding password)
    const logData = {...updateData};
    if (logData.password) logData.password = "[REDACTED]";
    console.log("Update data:", logData);
    
    // Use Mongoose to update the admin record
    const updatedAdmin = await Admins.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedAdmin) {
      throw new Error("Admin not found");
    }
    
    console.log("Admin updated successfully:", {
      id: updatedAdmin._id,
      username: updatedAdmin.username,
      role: updatedAdmin.role
    });
    
    revalidatePath("/dashboard/admins");
    return { success: true };
  } catch (err) {
    console.error("Error updating admin:", err);
    return { error: err.message };
  }
};

export const authenticate = async (prevState, formData) => {
  const username = formData.get("username");
  const password = formData.get("password");
  const captchaToken = formData.get("captchaToken"); // Get CAPTCHA token
  
  console.log("Login attempt:", { username });

  try {
    await connectToDB();
    const admin = await Admins.findOne({ username });

    if (!admin) {
      return { 
        success: false, 
        error: "User not found" 
      };
    }
    
    // Handle account locking due to too many failed attempts
    if (admin.accountLocked) {
      if (admin.lockUntil && admin.lockUntil > new Date()) {
        return { 
          success: false, 
          error: "Account is locked due to too many failed attempts. Try again later.",
          isLocked: true
        };
      } else {
        // Unlock account if lock period is over
        admin.accountLocked = false;
        admin.loginAttempts = 0;
        admin.lockUntil = null;
        await admin.save();
      }
    }

    // Enforce CAPTCHA after 2 failed attempts
    if (admin.loginAttempts >= 2 && !captchaToken) {
      return { 
        success: false, 
        error: "Please complete the CAPTCHA verification",
        requireCaptcha: true
      };
    }

    // Verify CAPTCHA if provided
    if (captchaToken) {
      const verifyCaptcha = async (token) => {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        });
        return response.json();
      };

      const captchaVerification = await verifyCaptcha(captchaToken);
      if (!captchaVerification.success) {
        return { 
          success: false, 
          error: "CAPTCHA verification failed",
          requireCaptcha: true
        };
      }
    }

    // Verify password
    let isPasswordCorrect = false;
    if (admin.password.startsWith("$2")) {
      isPasswordCorrect = await bcrypt.compare(password, admin.password);
    } else {
      isPasswordCorrect = admin.password === password;
    }

    if (!isPasswordCorrect) {
      // Increment failed attempts
      admin.loginAttempts += 1;
      
      // Calculate remaining attempts
      const remainingAttempts = 3 - admin.loginAttempts;

      // Lock account after 3 failed attempts
      if (admin.loginAttempts >= 3) {
        admin.accountLocked = true;
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await admin.save();
        
        return { 
          success: false, 
          error: "Account locked due to too many failed attempts. Try again after 30 minutes.",
          isLocked: true
        };
      }

      await admin.save();
      
      // Return warning message with remaining attempts
      return { 
        success: false, 
        error: "Invalid credentials",
        requireCaptcha: admin.loginAttempts >= 2,
        remainingAttempts: remainingAttempts,
        showWarning: true,
        warningMessage: `Warning: You have ${remainingAttempts} more ${remainingAttempts === 1 ? 'attempt' : 'attempts'} before your account is locked.`
      };
    }

    // Reset login attempts on success
    admin.loginAttempts = 0;
    admin.accountLocked = false;
    admin.lockUntil = null;
    await admin.save();

    // Set authentication cookie
    cookies().set({
      name: "auth-token",
      value: admin._id.toString(),
      httpOnly: true,
      path: "/",
      
    });

    return { success: true };
  } catch (err) {
    console.error("Authentication error:", err);
    return { 
      success: false, 
      error: "An error occurred: " + err.message
    };
  }
};

export const createTestAdmin = async () => {
  "use server"
  
  try {
    await connectToDB();
    
    // Check if test admin already exists
    const existingAdmin = await Admins.findOne({ username: "testadmin" });
    if (existingAdmin) {
      console.log("Test admin already exists");
      return "Test admin already exists";
    }
    
    // Create a new test admin
    const hashedPassword = await bcrypt.hash("testpass123", 10);
    
    const newAdmin = new Admins({
      username: "testadmin",
      password: hashedPassword,
      // Add any other required fields
    });
    
    await newAdmin.save();
    console.log("Test admin created successfully");
    return "Test admin created successfully";
  } catch (err) {
    console.error("Error creating test admin:", err);
    return "Error: " + err.message;
  }
};

export const logout = async () => {
  "use server"
  
  // Clear the auth-token cookie
  cookies().set({
    name: "auth-token",
    value: "",
    expires: new Date(0),
    path: "/",
  });
  
  // Redirect to login page
  redirect("/login");
};

export const notifyAnnouncement = async (formData) => {
  "use server"
  
  try {
    const id = formData.get("id");
    const result = await sendAnnouncementNotifications(id);
    
    return result;
  } catch (error) {
    console.error("Error notifying about announcement:", error);
    return { success: false, message: "Failed to send notifications" };
  }
};

export const unlockAccount = async (formData) => {
  "use server"
  
  const id = formData.get("id");
  
  try {
    await connectToDB();
    
    const admin = await Admins.findById(id);
    if (!admin) {
      throw new Error("User not found");
    }
    
    // Reset lock status
    admin.accountLocked = false;
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    
    revalidatePath("/dashboard/admins");
    return { success: true };
  } catch (error) {
    console.error("Failed to unlock account:", error);
    return { success: false, error: error.message };
  }
};