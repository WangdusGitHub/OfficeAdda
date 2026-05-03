import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Employee from './models/Employee.model.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@ems.com' });
    if (adminExists) {
      console.log('✅ Admin already exists');
      process.exit();
    }

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@ems.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create Admin Employee Profile
    await Employee.create({
      user: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: 'admin',
      designation: 'System Administrator',
      department: null, // Update later in UI
    });

    console.log('🚀 Admin User Created Successfully!');
    console.log('📧 Email: admin@ems.com');
    console.log('🔑 Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
