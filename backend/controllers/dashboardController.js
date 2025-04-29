const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const Company = require('../models/Company');
const Door = require('../models/Door');
const History = require('../models/History');
const Message = require('../models/Messages');
const CompanyRequest = require('../models/CompanyRequest');

// Fetch dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const totalUsersCount = await User.countDocuments();
    const totalAdminUsersCount = await AdminUser.countDocuments();
    const totalCompaniesCount = await Company.countDocuments();
    const totalDoorsCount = await Door.countDocuments();
    const totalHistoriesCount = await History.countDocuments();
    const totalMessagesCount = await Message.countDocuments();
    const totalPendingRequestCount = await CompanyRequest.countDocuments({ status: { $exists: false }, payment: false });
    const totalRejectedRequestCount = await CompanyRequest.countDocuments({ status: 'Rejected' });
    const totalPaidRequestCount = await CompanyRequest.countDocuments({ status: { $exists: false }, payment: true });

    res.json({
      totalUsersCount,
      totalAdminUsersCount,
      totalCompaniesCount,
      totalDoorsCount,
      totalHistoriesCount,
      totalMessagesCount,
      totalPendingRequestCount,
      totalRejectedRequestCount,
      totalPaidRequestCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getDashboardMetrics };