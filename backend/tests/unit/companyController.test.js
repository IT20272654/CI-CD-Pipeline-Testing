const {
  getCompanies,
  addLocation,
  deleteLocation,
  toggleCompanyStatus
} = require('../../controllers/companyController');
const Company = require('../../models/Company');
const AdminUser = require('../../models/AdminUser');
const User = require('../../models/User');

jest.mock('../../models/Company');
jest.mock('../../models/AdminUser');
jest.mock('../../models/User');

describe('Company Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getCompanies', () => {
    it('should fetch all companies successfully', async () => {
      const mockCompanies = [
        { _id: '1', name: 'Company 1' },
        { _id: '2', name: 'Company 2' }
      ];

      Company.find = jest.fn().mockResolvedValue(mockCompanies);

      await getCompanies(req, res);

      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });
  });

  describe('addLocation', () => {
    it('should add location to company successfully', async () => {
      const mockCompany = {
        _id: 'companyId',
        locations: ['Location 1'],
        save: jest.fn()
      };

      req.body = {
        companyId: 'companyId',
        location: 'New Location'
      };

      Company.findById = jest.fn().mockResolvedValue(mockCompany);

      await addLocation(req, res);

      expect(mockCompany.locations).toContain('New Location');
      expect(mockCompany.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location from company', async () => {
      const mockCompany = {
        _id: '1',
        name: 'Test Company',
        locations: ['Location 1', 'Location 2']
      };

      req.body = {
        companyId: '1',
        location: 'Location 1'
      };

      Company.findByIdAndUpdate = jest.fn().mockResolvedValue(mockCompany);

      await deleteLocation(req, res);

      expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $pull: { locations: 'Location 1' } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('toggleCompanyStatus', () => {
    it('should toggle company status successfully', async () => {
      const mockCompany = {
        _id: 'companyId',
        name: 'Test Company',
        status: 'active',
        save: jest.fn()
      };

      req.params = { companyId: 'companyId' };
      Company.findById = jest.fn().mockResolvedValue(mockCompany);

      await toggleCompanyStatus(req, res);

      expect(mockCompany.status).toBe('inactive');
      expect(mockCompany.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
