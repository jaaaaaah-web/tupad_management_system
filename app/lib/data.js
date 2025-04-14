import { Announcements, User, Transactions, Admins } from './models';
import { connectToDB } from './utils';

export const fetchUsers = async (q, page, sort, direction, rowCount = "all") => {
  const regex = new RegExp(q, "i");
  // If rowCount is "all" or not a number, don't limit the results
  const ITEMS_PER_PAGE = rowCount === "all" ? 0 : parseInt(rowCount);

  try {
    await connectToDB(); // Ensure DB is connected
    
    // Update search to use the new field structure
    const count = await User.countDocuments({
      $or: [
        { firstName: { $regex: regex } },
        { middleName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { cpNumber: { $regex: regex } }
      ]
    });
    
    // Create sort object dynamically based on sort field and direction
    const sortObj = {};
    if (sort) {
      sortObj[sort] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj.rowNumber = 1; // Default sort
    }
    
    let query = User.find({
      $or: [
        { firstName: { $regex: regex } },
        { middleName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { cpNumber: { $regex: regex } }
      ]
    }).sort(sortObj);
    
    // Only apply limit if ITEMS_PER_PAGE is greater than 0
    if (ITEMS_PER_PAGE > 0) {
      query = query
        .limit(ITEMS_PER_PAGE)
        .skip(ITEMS_PER_PAGE * (page - 1));
    }
    
    const result = await query;
    
    // Convert Mongoose documents to plain JavaScript objects
    const users = JSON.parse(JSON.stringify(result));

    return { count, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { count: 0, users: [] }; // Avoid breaking the app
  }
};

export const fetchUser = async (id) => {
  try {
    await connectToDB(); // Ensure DB is connected
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Avoid breaking the app
  }
};

export const fetchAnnoucements = async (q, page, sort, direction, rowCount = "all") => {
  const regex = new RegExp(q, "i");
  // If rowCount is "all" or not a number, don't limit the results
  const ITEMS_PER_PAGE = rowCount === "all" ? 0 : parseInt(rowCount);

  try {
    await connectToDB(); // Ensure DB is connected
    const count = await Announcements.countDocuments({ 
      $or: [
        { createdBy: { $regex: regex } },
        { title: { $regex: regex } },
        { desc: { $regex: regex } }
      ] 
    });
    
    // Create sort object dynamically based on sort field and direction
    const sortObj = {};
    if (sort) {
      sortObj[sort] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // Default sort by creation date (newest first)
    }
    
    let query = Announcements.find({ 
      $or: [
        { createdBy: { $regex: regex } },
        { title: { $regex: regex } },
        { desc: { $regex: regex } }
      ] 
    }).sort(sortObj);
    
    // Only apply limit if ITEMS_PER_PAGE is greater than 0
    if (ITEMS_PER_PAGE > 0) {
      query = query
        .limit(ITEMS_PER_PAGE)
        .skip(ITEMS_PER_PAGE * (page - 1));
    }
    
    const result = await query;
    
    // Convert Mongoose documents to plain JavaScript objects
    const announcements = JSON.parse(JSON.stringify(result));

    return { count, announcements };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { count: 0, announcements: [] }; // Avoid breaking the app
  }
};

export const fetchAnnouncement = async (id) => {
  try {
    await connectToDB(); // Ensure DB is connected
    const announcement = await Announcements.findById(id);
    return announcement;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { count: 0, users: [] }; // Avoid breaking the app
  }
};

export const fetchAnnoucementById = async (id) => {
  try {
    await connectToDB();
    
    const announcement = await Announcements.findById(id);
    if (!announcement) return null;
    
    return JSON.parse(JSON.stringify(announcement));
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return null;
  }
};

export const fetchTransaction = async (q, page, sort, direction, rowCount = "all") => {
  const regex = new RegExp(q, "i");
  // If rowCount is "all" or not a number, don't limit the results
  const ITEMS_PER_PAGE = rowCount === "all" ? 0 : parseInt(rowCount);

  try {
    await connectToDB(); // Ensure DB is connected
    
    // Update search to use the new field structure
    const count = await Transactions.countDocuments({
      $or: [
        { cb: { $regex: regex } }, 
        { lastName: { $regex: regex } },
        { middleName: { $regex: regex } },
        { firstName: { $regex: regex } },
        { extension: { $regex: regex } },
        { status: { $regex: regex } }
      ]
    });
    
    // Create sort object dynamically based on sort field and direction
    const sortObj = {};
    if (sort) {
      sortObj[sort] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj.rowNumber = 1; // Default sort
    }
    
    let query = Transactions.find({
      $or: [
        { cb: { $regex: regex } }, 
        { lastName: { $regex: regex } },
        { middleName: { $regex: regex } },
        { firstName: { $regex: regex } },
        { extension: { $regex: regex } },
        { status: { $regex: regex } }
      ]
    }).sort(sortObj);
    
    // Only apply limit if ITEMS_PER_PAGE is greater than 0
    if (ITEMS_PER_PAGE > 0) {
      query = query
        .limit(ITEMS_PER_PAGE)
        .skip(ITEMS_PER_PAGE * (page - 1));
    }
    
    const result = await query;
    
    // Convert Mongoose documents to plain JavaScript objects
    const transactions = JSON.parse(JSON.stringify(result)).map(transaction => {
      // Add an id field that maps to _id for consistency
      return {
        ...transaction,
        id: transaction._id
      };
    });

    return { count, transactions };
  } catch (error) {
    console.error("Error fetching transactions", error);
    return { count: 0, transactions: [] }; // Avoid breaking the app
  }
};

export const fetchTransactions = async (id) => {
  try {
    // Check if id is undefined or not a valid ObjectId
    if (!id || id === 'undefined') {
      console.error("Invalid transaction ID provided:", id);
      return {
        id: 'N/A',
        cb: '',
        lastName: '',
        firstName: '',
        middleName: '',
        extension: '',
        beneficiaries: '',
        status: 'Pending',
        amount: 0,
        createdAt: new Date()
      };
    }
    
    await connectToDB(); // Ensure DB is connected
    const transaction = await Transactions.findById(id);
    
    // If transaction not found, return default object
    if (!transaction) {
      return {
        id: 'N/A',
        cb: '',
        lastName: '',
        firstName: '',
        middleName: '',
        extension: '',
        beneficiaries: '',
        status: 'Pending',
        amount: 0,
        createdAt: new Date()
      };
    }
    
    // Convert to plain object and ensure id field is set
    const transactionData = JSON.parse(JSON.stringify(transaction));
    return {
      ...transactionData,
      id: transactionData._id
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    // Return a default transaction object to prevent UI errors
    return {
      id: 'N/A',
      cb: '',
      lastName: '',
      firstName: '',
      middleName: '',
      extension: '',
      beneficiaries: '',
      status: 'Pending',
      amount: 0,
      createdAt: new Date()
    };
  }
};

export const fetchAdmins = async (q, page, sort, direction, rowCount = "all") => {
  const regex = new RegExp(q, "i");
  // If rowCount is "all" or not a number, don't limit the results
  const ITEMS_PER_PAGE = rowCount === "all" ? 0 : parseInt(rowCount);

  try {
    await connectToDB(); // Ensure DB is connected
    
    // Direct check if the Admins model is actually defined and initialized
    if (!Admins || !Admins.collection) {
      console.error("Admins collection is not available - returning empty results");
      return { count: 0, admins: [] };
    }
    
    // Try to handle possible model initialization issues in serverless environment
    try {
      // First try a simple operation to test if collection is working
      await Admins.findOne({}).exec();
    } catch (collectionError) {
      console.error("Error accessing Admins collection:", collectionError);
      return { count: 0, admins: [] };
    }
    
    // Now proceed with the actual query
    const count = await Admins.countDocuments({ 
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } }
      ] 
    });
    
    // Create sort object dynamically based on sort field and direction
    const sortObj = {};
    if (sort) {
      sortObj[sort] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // Default sort by creation date (newest first)
    }
    
    let query = Admins.find({ 
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } }
      ] 
    }).sort(sortObj);
    
    // Only apply limit if ITEMS_PER_PAGE is greater than 0
    if (ITEMS_PER_PAGE > 0) {
      query = query
        .limit(ITEMS_PER_PAGE)
        .skip(ITEMS_PER_PAGE * (page - 1));
    }
    
    const result = await query;
    
    // Convert Mongoose documents to plain JavaScript objects
    const admins = JSON.parse(JSON.stringify(result));

    return { count, admins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { count: 0, admins: [] }; // Return empty data instead of crashing
  }
};

export const fetchAdmin = async (id) => {
  try {
    await connectToDB(); // Ensure DB is connected
    const admin = await Admins.findById(id);
    return admin;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { count: 0, admins: [] }; // Avoid breaking the app
  }
};

// Fetch total beneficiaries count
export const fetchBeneficiariesCount = async () => {
  try {
    await connectToDB();
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching beneficiaries count:", error);
    return 0;
  }
};

// Fetch percentage change in beneficiaries (last 7 days vs previous 7 days)
export const fetchBeneficiariesChange = async () => {
  try {
    await connectToDB();
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    const fourteenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    
    // Count users created in last 7 days
    const recentCount = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Count users created in previous 7 days
    const previousCount = await User.countDocuments({
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });
    
    // Calculate percentage change
    const percentChange = previousCount === 0 
      ? recentCount * 100 // If previous count was 0, consider it 100% increase
      : ((recentCount - previousCount) / previousCount) * 100;
    
    return parseFloat(percentChange.toFixed(2));
  } catch (error) {
    console.error("Error calculating beneficiaries change:", error);
    return 0;
  }
};

// Fetch latest dashboard transactions (limit to 5)
export const fetchLatestTransactions = async () => {
  try {
    await connectToDB();
    const transactions = await Transactions.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    console.error("Error fetching latest transactions:", error);
    return [];
  }
};

// Fetch beneficiaries count by Purok for chart
export const fetchBeneficiariesByPurok = async () => {
  try {
    await connectToDB();
    
    // Aggregate users by purok field
    const result = await User.aggregate([
      {
        $group: {
          _id: "$purok", // Group by purok field
          beneficiaries: { $sum: 1 } // Count users in each group
        }
      },
      {
        $project: {
          name: "$_id", // Rename _id to name for chart compatibility
          beneficiaries: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } } // Sort by purok name
    ]);
    
    return result;
  } catch (error) {
    console.error("Error fetching beneficiaries by purok:", error);
    return [];
  }
};

// Fetch beneficiaries data grouped by purok and age groups for chart
export const fetchBeneficiariesByPurokAndAge = async () => {
  try {
    await connectToDB();
    
    // First, get all beneficiaries with their purok and birthday
    const beneficiaries = await User.find({}, { purok: 1, birthday: 1 });
    
    // Define age groups
    const ageGroups = [
      { name: '18-25', min: 18, max: 25 },
      { name: '26-35', min: 26, max: 35 },
      { name: '36-45', min: 36, max: 45 },
      { name: '46-55', min: 46, max: 55 },
      { name: '56+', min: 56, max: 150 }
    ];
    
    // Get unique puroks safely (avoiding Set constructor for build compatibility)
    const puroksArray = beneficiaries.map(b => b.purok).filter(Boolean);
    const puroks = [];
    
    // Manual deduplication for compatibility with all environments
    for (const purok of puroksArray) {
      if (!puroks.includes(purok)) {
        puroks.push(purok);
      }
    }
    puroks.sort();
    
    // Current date for age calculation
    const currentDate = new Date();
    
    // Initialize result object with structure for grouped bar chart
    const result = puroks.map(purok => {
      // Create a result object for this purok with all age groups initialized to 0
      const purokData = {
        name: purok,
      };
      
      // Initialize count for each age group to 0
      ageGroups.forEach(group => {
        purokData[group.name] = 0;
      });
      
      return purokData;
    });
    
    // Count beneficiaries in each purok by age group
    beneficiaries.forEach(beneficiary => {
      if (!beneficiary.purok || !beneficiary.birthday) return;
      
      // Calculate age
      const birthDate = new Date(beneficiary.birthday);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const m = currentDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Find which age group this beneficiary belongs to
      const ageGroup = ageGroups.find(group => age >= group.min && age <= group.max);
      if (!ageGroup) return;
      
      // Find the purok data in our result and increment the appropriate age group count
      const purokData = result.find(item => item.name === beneficiary.purok);
      if (purokData) {
        purokData[ageGroup.name]++;
      }
    });
    
    console.log("Generated chart data:", result);
    return { data: result, ageGroups: ageGroups.map(g => g.name) };
  } catch (error) {
    console.error("Error fetching beneficiaries by purok and age:", error);
    return { data: [], ageGroups: [] };
  }
};

// Fetch total payout amount by year
export const fetchTotalPayoutAmount = async (year = null) => {
  try {
    await connectToDB();
    
    // Create query to filter by year if specified
    let query = {};
    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      
      query = {
        createdAt: { 
          $gte: startDate, 
          $lte: endDate 
        }
      };
    }
    
    // First get all matching transactions
    const transactions = await Transactions.find(query);
    
    // Manually calculate the sum since amount is stored as string
    let totalAmount = 0;
    for (const transaction of transactions) {
      // Convert amount to number, removing any non-numeric characters except decimal point
      // This handles cases where amount might have currency symbols or commas
      const cleanAmount = transaction.amount.replace(/[^0-9.]/g, '');
      const numericAmount = parseFloat(cleanAmount);
      
      if (!isNaN(numericAmount)) {
        totalAmount += numericAmount;
      }
    }
    
    console.log(`Calculated total amount: ${totalAmount} from ${transactions.length} transactions`);
    return totalAmount;
  } catch (error) {
    console.error("Error calculating total payout amount:", error);
    return 0;
  }
};

// Get available transaction years for filter
export const fetchTransactionYears = async () => {
  try {
    await connectToDB();
    
    // Aggregate to get the unique years from the createdAt field
    const result = await Transactions.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" }
        }
      },
      { $sort: { _id: -1 } } // Sort in descending order (newest first)
    ]);
    
    // Map the result to an array of years
    return result.map(item => item._id);
  } catch (error) {
    console.error("Error fetching transaction years:", error);
    return [];
  }
};