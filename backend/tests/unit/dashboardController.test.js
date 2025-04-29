const { getDashboardMetrics } = require('../../controllers/dashboardController');
const User = require('../../models/User');
const AdminUser = require('../../models/AdminUser');
const Company = require('../../models/Company');
const Door = require('../../models/Door');
const History = require('../../models/History');
const Message = require('../../models/Messages');
const CompanyRequest = require('../../models/CompanyRequest');

jest.mock('../../models/User');
jest.mock('../../models/AdminUser');
jest.mock('../../models/Company');
jest.mock('../../models/Door');
jest.mock('../../models/History');
jest.mock('../../models/Messages');
jest.mock('../../models/CompanyRequest');

describe('Dashboard Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getDashboardMetrics', () => {
    it('should fetch all dashboard metrics successfully', async () => {
      User.countDocuments = jest.fn().mockResolvedValue(10);
      AdminUser.countDocuments = jest.fn().mockResolvedValue(5);
      Company.countDocuments = jest.fn().mockResolvedValue(3);
      Door.countDocuments = jest.fn().mockResolvedValue(15);
      History.countDocuments = jest.fn().mockResolvedValue(100);
      Message.countDocuments = jest.fn().mockResolvedValue(25);
      CompanyRequest.countDocuments = jest.fn()
        .mockResolvedValueOnce(2)  // Pending requests
        .mockResolvedValueOnce(1)  // Rejected requests
        .mockResolvedValueOnce(3); // Paid requests

      await getDashboardMetrics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalUsersCount: 10,
        totalAdminUsersCount: 5,
        totalCompaniesCount: 3,
        totalDoorsCount: 15,
        totalHistoriesCount: 100,
        totalMessagesCount: 25,
        totalPendingRequestCount: 2,
        totalRejectedRequestCount: 1,
        totalPaidRequestCount: 3
      });
    });

    it('should handle errors properly', async () => {
      User.countDocuments = jest.fn().mockRejectedValue(new Error('Database error'));

      await getDashboardMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});
