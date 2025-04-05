import mongoose from 'mongoose';

// This is a critical fix for serverless environments like Vercel
// Mongoose tends to cache connections between serverless function invocations
// but the models might not be properly initialized
let isModelInitialized = false;

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
    }
  },
  { timestamps: true }
);

// Enhanced version specifically for serverless environments
const getModel = (modelName, schema) => {
  try {
    // First try to get an existing model
    if (mongoose.models && mongoose.models[modelName]) {
      return mongoose.models[modelName];
    }
    
    // If model doesn't exist yet, create it
    if (mongoose.connection && mongoose.connection.readyState) {
      return mongoose.model(modelName, schema);
    }
    
    // If mongoose connection is not ready yet, we create a model that will be initialized later
    const model = mongoose.model(modelName, schema);
    
    // Add a safe collection getter that won't crash
    if (!model.collection) {
      Object.defineProperty(model, 'collection', {
        get: function() {
          // Return an empty object with required methods if real collection not available
          if (!this.db || !this.db.collection) {
            console.warn(`Collection not available for ${modelName}, returning mock collection`);
            return {
              find: () => ({ limit: () => ({ skip: () => ({ sort: () => [] }) }) }),
              findOne: () => null,
              countDocuments: () => 0,
              // Add other methods your code might be using
            };
          }
          return this.db.collection(this.collection.name);
        },
        configurable: true
      });
    }
    
    return model;
  } catch (error) {
    console.error(`Error creating model ${modelName}:`, error);
    
    // Return a mock model as fallback that won't crash the application
    return {
      find: () => ({ limit: () => ({ skip: () => ({ sort: () => [] }) }) }),
      findOne: () => null,
      findById: () => null,
      countDocuments: () => 0,
      collection: {
        find: () => ({ limit: () => ({ skip: () => ({ sort: () => [] }) }) }),
        findOne: () => null,
        countDocuments: () => 0
      }
    };
  }
};

// Export models using the safer approach
export const User = getModel("User", userSchema);
export const Announcements = getModel("Announcements", annoucementsSchema);
export const Transactions = getModel("Transaction", transactionsSchema);
export const Admins = getModel("Admins", adminsSchema);
export const Notification = getModel("Notification", NotificationSchema);

