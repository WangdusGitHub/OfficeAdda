import Department from "../models/Department.model.js";
import Employee from "../models/Employee.model.js";

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).populate("manager", "name email");
    
    // Add employee counts and sample avatars
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id, isActive: true });
        const sampleEmployees = await Employee.find({ department: dept._id, isActive: true })
          .select("profilePicture name")
          .limit(3);
        
        return { 
          ...dept.toObject(), 
          employeeCount: count,
          avatars: sampleEmployees.map(emp => emp.profilePicture || `https://ui-avatars.com/api/?name=${emp.name}&background=random`)
        };
      })
    );

    res.json({ success: true, departments: departmentsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: "Department not found" });
    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: "Department not found" });
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentStats = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
      { $unwind: "$dept" },
      { $project: { name: "$dept.name", count: 1 } },
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
