import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"EMS System" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// ── Email Templates ────────────────────────────────────────────────────────────

export const leaveStatusEmail = (employeeName, status, leaveType, startDate, endDate) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #4f46e5;">EMS Leave Notification</h2>
    <p>Dear <strong>${employeeName}</strong>,</p>
    <p>Your <strong>${leaveType}</strong> leave request from 
       <strong>${new Date(startDate).toDateString()}</strong> to 
       <strong>${new Date(endDate).toDateString()}</strong> 
       has been <strong style="color:${status === "approved" ? "green" : "red"}">${status}</strong>.
    </p>
    <p>Please log in to EMS for more details.</p>
    <hr/>
    <small style="color:#888;">This is an automated message. Please do not reply.</small>
  </div>
`;

export const payslipEmail = (employeeName, month, year, netSalary) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #4f46e5;">EMS Payslip Notification</h2>
    <p>Dear <strong>${employeeName}</strong>,</p>
    <p>Your payslip for <strong>${month}/${year}</strong> has been generated.</p>
    <p>Net Salary: <strong style="color: #16a34a;">₹${netSalary}</strong></p>
    <p>Please log in to EMS to download your payslip.</p>
    <hr/>
    <small style="color:#888;">This is an automated message. Please do not reply.</small>
  </div>
`;
