import mongoose from "mongoose";

// Global variable to maintain connection state across function calls
const connection = { isConnected: false };

export const connectToDB = async () => {
  try {
    // If we're already connected, reuse the connection
    if (connection.isConnected) {
      console.log("Using existing database connection");
      return;
    }

    // Configure mongoose options for better performance
    const mongooseOptions = {
      maxPoolSize: 10, // Keep up to 10 connections in the pool
      serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Make sure we have a MongoDB URI
    if (!process.env.MONGO) {
      throw new Error("MONGO environment variable is not defined");
    }

    // Ensure username and password are properly URI-encoded if present
    let mongoUri = process.env.MONGO;
    try {
      // Only attempt to modify the URI if it contains credentials
      if (mongoUri.includes('@')) {
        const uriParts = mongoUri.split('@');
        const credentialsPart = uriParts[0];
        const hostPart = uriParts[1];
        
        // Split credentials into protocol and user:pass
        const protocolSplit = credentialsPart.split('://');
        const protocol = protocolSplit[0];
        const userPass = protocolSplit[1];
        
        // Split user:pass
        const userPassSplit = userPass.split(':');
        const username = encodeURIComponent(userPassSplit[0]);
        const password = userPassSplit[1] ? encodeURIComponent(userPassSplit[1]) : '';
        
        // Reconstruct the URI with encoded parts
        mongoUri = `${protocol}://${username}:${password}@${hostPart}`;
      }
    } catch (uriError) {
      console.warn("Error encoding MongoDB URI, using original:", uriError);
      // Continue with original URI if parsing fails
    }

    // Connect to the database
    const db = await mongoose.connect(mongoUri, mongooseOptions);
    
    // Update the connection state
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Proper disconnect function for development environments
export const disconnectFromDB = async () => {
  if (process.env.NODE_ENV === 'development') {
    if (connection.isConnected) {
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log("Database disconnected");
    }
  }
};