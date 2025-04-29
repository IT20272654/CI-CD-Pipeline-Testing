const AdminUser = require('../models/AdminUser');
const Company = require('../models/Company');
const Door = require('../models/Door');
const History = require('../models/History');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendRegistrationEmail = async (email, password) => {
  try {
    const pdfPath = path.join(__dirname, '../resources/Admin-Guide-SecurePassAI.pdf');
    const pdfAttachment = fs.readFileSync(pdfPath);

    const mailOptions = {
      from: `SLT mobitel <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to Our System</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p>Your account has been successfully created!</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p style="color: #ef4444;">Please keep your credentials secure and do not share them with anyone.</p>
          </div>
          <p style="margin-top: 20px;">Find attached our welcome documentation.</p>
        </div>
      `,
      attachments: [{
        filename: 'Admin-Guide-SecurePassAI.pdf',
        content: pdfAttachment
      }]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

const createCompany = async (req, res) => {
  const { name, address, package: packageType } = req.body;
  if (!name || !address || !packageType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  let expiredDate;
  const today = new Date();

  if (packageType === 'Premium') {
    expiredDate = new Date(today);
    expiredDate.setDate(today.getDate() + 366);
  } else if (packageType === 'Essential' || packageType === 'Starter') {
    expiredDate = new Date(today);
    expiredDate.setDate(today.getDate() + 31);
  } else {
    return res.status(400).json({ error: 'Invalid package type' });
  }
  try {
    const company = new Company({ name, address, package: packageType, expiredDate });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createAdminUser = async (req, res) => {
  const { firstName, lastName, email, password, companyId } = req.body;
  try {
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (company.package === 'Starter') {
      const adminCount = await AdminUser.countDocuments({ company: companyId });

      if (adminCount >= 5) {
        return res.status(400).json({ error: 'Cannot create more than 5 admins for a Starter package' });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new AdminUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'Admin',
      company: companyId,
    });
    await adminUser.save();

    // Add the admin user to the company's admins array
    // Add the admin user to the company's admins array
    company.admins.push(adminUser._id);
    await company.save();

    res.status(201).json(adminUser);
    
    // ✅ Send email asynchronously using setImmediate()
    setImmediate(async () => {
      try {
        await sendRegistrationEmail(email, password);
        console.log("Email sent successfully to:", email);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getDoorsByAdmin = async (req, res) => {
  try {
    const doors = await Door.find({ admin: req.params.adminId });
    res.status(200).json(doors);
  } catch (error) {
    console.error('Error fetching doors:', error);
    res.status(500).json({ error: 'Error fetching doors' });
  }
};

const getDoorsHistoryByAdmin = async (req, res) => {
  try {
    console.log('Fetching recent access doors'); // Log the action

    // Find the recent access records for the admin's company and populate user details
    const recentAccess = await History.find({ company: req.params.adminId })
      .sort({ entryTime: -1 })
      .limit(50)
      .populate('user', 'firstName lastName'); // Populate user with first name and last name

    if (!recentAccess) {
      return res.status(404).json({ error: 'No recent access records found' });
    }

    console.log('Fetched recent access doors:', recentAccess); // Log the fetched records
    res.status(200).json(recentAccess);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error fetching recent access doors' });
  }
};


const getAllRecentAccess = async (req, res) => {
  try {
    // Find recent access records with full population
    const recentAccess = await History.find()
      .sort({ entryTime: -1 })
      .limit(100)
      .populate({
        path: 'user',
        model: 'User',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'company',
        model: 'Company',
        select: 'name address locations'
      });

    // Filter out records with null or undefined references
    const validAccess = recentAccess.filter(record => 
      record.user && record.company
    );

    // If no valid records found
    if (validAccess.length === 0) {
      return res.status(404).json({ 
        message: 'No valid recent access records found',
        data: [] 
      });
    }

    // Transform data with comprehensive null checks
    const formattedAccess = validAccess.map(record => ({
      _id: record._id,
      doorCode: record.doorCode || 'N/A',
      entryTime: record.entryTime,
      exitTime: record.exitTime || null,
      location: record.location || 'Unknown',
      roomName: record.roomName || 'Unspecified',
      user: {
        _id: record.user?._id || null,
        firstName: record.user?.firstName || 'Unknown',
        lastName: record.user?.lastName || '',
        email: record.user?.email || 'No email'
      },
      company: {
        _id: record.company?._id || null,
        name: record.company?.name || 'Unknown Company',
        address: record.company?.address || 'No Address',
        locations: record.company?.locations || []
      }
    }));

    res.status(200).json(formattedAccess);
  } catch (error) {
    console.error('Error in getAllRecentAccess:', {
      message: error.message,
      stack: error.stack,
      line: error.stack?.split('\n')[1]
    });

    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Unable to fetch recent access records',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('company', 'name')
      .populate({
        path: 'admin',
        select: 'firstName lastName', // Changed from 'name' to 'firstName lastName'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Optionally format the admin name before sending response
    const formattedUsers = users.map(user => ({
      ...user,
      admin: user.admin ? {
        ...user.admin,
        name: `${user.admin.firstName} ${user.admin.lastName}`
      } : null
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getAllDoors = async (req, res) => {
  try {
    const doors = await Door.find()
      .populate('company', 'name')
      .populate('admin', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(doors);
  } catch (error) {
    console.error('Error fetching doors:', error);
    res.status(500).json({ error: 'Failed to fetch doors' });
  }
};

const getUsersByAdmin = async (req, res) => {
  try {
    const users = await User.find({ admin: req.params.adminId });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

const updateExpirationDate = async (req, res) => {
  const { companyId } = req.params; // Get the company ID from the request parameters
  const today = new Date();

  try {
    // Find the company by ID
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let newExpiredDate;

      if (company.package === 'Premium') {
        newExpiredDate = new Date(company.expiredDate); // Use the existing expired date
        newExpiredDate.setDate(newExpiredDate.getDate() + 366); // Set to existing expired date + 8 days
      } else if (company.package === 'Essential' || company.package === 'Starter') {
        newExpiredDate = new Date(company.expiredDate); // Use the existing expired date
        newExpiredDate.setDate(newExpiredDate.getDate() + 31); // Set to existing expired date + 31 days
      }

    // Update the company's expired date
    company.expiredDate = newExpiredDate;
    await company.save();

    res.status(200).json({ message: 'Expiration date updated successfully', expiredDate: newExpiredDate });
  } catch (error) {
    console.error('Error updating expiration date:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createCompany, createAdminUser,getDoorsByAdmin, getUsersByAdmin,getDoorsHistoryByAdmin, updateExpirationDate, getAllRecentAccess, getAllUsers, getAllDoors };