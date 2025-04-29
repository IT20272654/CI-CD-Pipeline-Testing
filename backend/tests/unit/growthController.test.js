const { getUserGrowthData, getCompanyGrowthData, getDoorGrowthData } = require('../../controllers/growthController');
const User = require('../../models/User');
const Company = require('../../models/Company');
const Door = require('../../models/Door');

jest.mock('../../models/User');
jest.mock('../../models/Company');
jest.mock('../../models/Door');

describe('Growth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getUserGrowthData', () => {
    it('should fetch user growth data successfully', async () => {
      const mockGrowthData = [
        { month: 1, year: 2024, count: 5 },
        { month: 2, year: 2024, count: 8 }
      ];

      User.aggregate = jest.fn().mockResolvedValue(mockGrowthData);

      await getUserGrowthData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGrowthData);
    });

    it('should handle errors properly', async () => {
      User.aggregate = jest.fn().mockRejectedValue(new Error('Database error'));

      await getUserGrowthData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching user growth data' });
    });
  });

  describe('getCompanyGrowthData', () => {
    it('should fetch company growth data successfully', async () => {
      const mockGrowthData = [
        { month: 1, year: 2024, count: 2 },
        { month: 2, year: 2024, count: 3 }
      ];

      Company.aggregate = jest.fn().mockResolvedValue(mockGrowthData);

      await getCompanyGrowthData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGrowthData);
    });
  });
});
