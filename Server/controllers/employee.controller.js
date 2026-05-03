import Employee from "../models/Employee.model.js";
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin, Manager
export const getAllEmployees = async (req, res) => {
  try {
    const { department, role, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (department) query.department = department;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate("department", "name")
      .populate("manager", "name employeeId")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("department", "name description")
      .populate("manager", "name email employeeId");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Admin
export const createEmployee = async (req, res) => {
  try {
    const { name, email, role, ...rest } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user exists, check if they already have an employee profile
      const existingEmployee = await Employee.findOne({ user: user._id });
      if (existingEmployee) {
        return res.status(400).json({ success: false, message: "Employee with this email already exists" });
      }
    } else {
      // 2. Create User record first
      // Default password is 'ems@0123' if not provided
      user = await User.create({
        name,
        email,
        password: "ems@0123", 
        role: role || "employee",
      });
    }

    // 3. Create Employee profile linked to the User
    const employee = await Employee.create({
      ...rest,
      user: user._id,
      name,
      email,
      role: role || "employee",
    });

    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin, Manager
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("department", "name");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (deactivate) employee
// @route   DELETE /api/employees/:id
// @access  Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    // Also deactivate user account
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    res.json({ success: true, message: "Employee deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/employees/:id/profile-picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check for placeholder credentials
    if (process.env.CLOUDINARY_API_KEY === "your_api_key") {
      return res.status(400).json({ 
        success: false, 
        message: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET in your .env file." 
      });
    }

    // Check for placeholder credentials
    if (process.env.CLOUDINARY_API_KEY === "your_api_key") {
      return res.status(400).json({ 
        success: false, 
        message: "Cloudinary is not configured. Please set your credentials in the .env file." 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "ems/profiles", transformation: [{ width: 400, height: 400, crop: "fill" }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { profilePicture: result.secure_url },
      { new: true }
    );

    res.json({ success: true, profilePicture: result.secure_url, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload document
// @route   POST /api/employees/:id/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check for placeholder credentials
    if (process.env.CLOUDINARY_API_KEY === "your_api_key") {
      return res.status(400).json({ 
        success: false, 
        message: "Cloudinary is not configured. Please set your credentials in the .env file." 
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "ems/documents", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: { name: req.file.originalname, url: result.secure_url } } },
      { new: true }
    );

    res.json({ success: true, document: { name: req.file.originalname, url: result.secure_url }, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
