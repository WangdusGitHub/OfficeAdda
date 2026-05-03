import Performance from "../models/Performance.model.js";
import Employee from "../models/Employee.model.js";

// @desc    Add performance review
// @route   POST /api/performance
// @access  Admin, Manager
export const addReview = async (req, res) => {
  try {
    const period = req.body.period || `Q${Math.floor((new Date().getMonth() + 3) / 3)}-${new Date().getFullYear()}`;
    
    // Map frontend's single rating to the backend's categorized schema
    let payload = { ...req.body };
    if (!payload.ratings && payload.rating) {
      payload.ratings = {
        productivity: payload.rating,
        teamwork: payload.rating,
        communication: payload.rating,
        punctuality: payload.rating,
        leadership: payload.rating
      };
    }
    
    const review = await Performance.create({ 
      ...payload, 
      period,
      reviewedBy: req.user._id 
    });
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Admin, Manager
export const getAllPerformance = async (req, res) => {
  try {
    const reviews = await Performance.find()
      .populate("employee", "name employeeId")
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee performance
// @route   GET /api/performance/:employeeId
// @access  Admin, Manager
export const getEmployeePerformance = async (req, res) => {
  try {
    const reviews = await Performance.find({ employee: req.params.employeeId })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my performance
// @route   GET /api/performance/my
// @access  Private
export const getMyPerformance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const reviews = await Performance.find({ employee: employee._id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/performance/:id
// @access  Admin, Manager
export const updateReview = async (req, res) => {
  try {
    const review = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
