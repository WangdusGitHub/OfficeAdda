import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // ── Connection Options ────────────────────────────────────────────────────
    const options = {
      serverSelectionTimeoutMS: 5000,  // Timeout after 5s if no server found
      socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // ── Connection Event Listeners ─────────────────────────────────────────
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`🔴 Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("🟡 Mongoose disconnected from MongoDB");
    });

    // Graceful shutdown on app termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed due to app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("👉 Check your MONGO_URI in the .env file");
    process.exit(1);
  }
};

export default connectDB;
