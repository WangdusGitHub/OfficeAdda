import Joi from 'joi';

// Generic validation middleware
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ success: false, message: errorMessage });
  }
  next();
};

// Auth Schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Employee Schemas
export const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'manager', 'employee').required(),
  department: Joi.string().required(),
  salary: Joi.number().min(0).required(),
  designation: Joi.string().allow(''),
  phone: Joi.string().allow(''),
  gender: Joi.string().valid('male', 'female', 'other').allow(''),
  dateOfBirth: Joi.date().allow(''),
  address: Joi.string().allow(''),
  manager: Joi.string().allow(null, ''),
});

// Leave Schemas

export const leaveSchema = Joi.object({
  leaveType: Joi.string().valid('casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  reason: Joi.string().min(5).required(),
});
