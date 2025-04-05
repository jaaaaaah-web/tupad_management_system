import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    rowNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: true,
    },
    cpNumber: {
      type: String,
      required: true,
    },
    purok: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    profession: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
  },
  { timestamps: true }
);

const annoucementsSchema = new mongoose.Schema(
  {
    createdBy: { 
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const transactionsSchema = new mongoose.Schema(
  {
    rowNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    cb: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    beneficiaries: {
      type: String,
      required: false, // Making this optional since we're now using the separate name fields
      default: function() {
        // Create a default value based on the name fields if they exist
        if (this.lastName || this.firstName) {
          return `${this.lastName || ''}, ${this.firstName || ''} ${this.middleName || ''}`.trim();
        }
        return '';
      }
    },
    status: {
      type: String,
      enum: ["Pending", "Cancelled", "Done"],
      required: true,
      default: " ", 
    },
    amount: {
      type: String,
      required: true,
    }
  },
  { timestamps: true } 
);

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcements' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const adminsSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    profileImage: {
      type: String,
    },
    name: {
      type: String,
    },
    password: {
      type: String,
      required: true, // Store hashed passwords
    },
    number: {
      type: String,
      
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['system_admin', 'data_encoder'],
      default: 'data_encoder'
    },
  },
  { timestamps: true }
);

// Safely get or create a model - works in both development and production
const getModel = (modelName, schema) => {
  return mongoose.models[modelName] || mongoose.model(modelName, schema);
};

// Export models using the safer approach
export const User = getModel("User", userSchema);
export const Announcements = getModel("Announcements", annoucementsSchema);
export const Transactions = getModel("Transaction", transactionsSchema);
export const Admins = getModel("Admins", adminsSchema);
export const Notification = getModel("Notification", NotificationSchema);

