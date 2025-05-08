const { getUserGrowthData, getCompanyGrowthData, getDoorGrowthData } = require('../../controllers/growthController');
const User = require('../../models/User');
const Company = require('../../models/Company');
const Door = require('../../models/Door');

jest.mock('../../models/User');
jest.mock('../../models/Company');
jest.mock('../../models/Door');

describe('Growth Controller', () => {
  let req, res;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    // Spy on console.error before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
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
      const dbError = new Error('Database error');
      User.aggregate = jest.fn().mockRejectedValue(dbError);

      await getUserGrowthData(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user growth data:', dbError);
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

    it('should handle errors properly', async () => {
      const dbError = new Error('Database error');
      Company.aggregate = jest.fn().mockRejectedValue(dbError);

      await getCompanyGrowthData(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching company growth data:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching company growth data' });
    });
  });
});
