const express = require('express');
const { loginAdminUser, getCurrentAdminUser, updateCurrentAdminUser, changePassword, getAllAdminUsers, getAdminUserById, updateAdminUserById, deleteAdminUserById } = require('../controllers/adminAuthController');
const { createCompany, createAdminUser,getDoorsByAdmin,getUsersByAdmin, getDoorsHistoryByAdmin, updateExpirationDate, getAllRecentAccess, getAllUsers ,getAllDoors} = require('../controllers/superAdminController');
const { getCompaniesWithAdmins, getCompanies, getCompanyById, updateCompany, deleteCompany, addLocation, deleteLocation, checkCompanyNameAndAddressUnique, toggleCompanyStatus } = require('../controllers/companyController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { toggleCompanyRequestStatus } = require('../controllers/companyRequestController');
const router = express.Router();

// Login an admin user
router.post('/login', loginAdminUser);

// Get current admin user
router.get('/me', authMiddleware, getCurrentAdminUser);

// Get all admin users (SuperAdmin only)
router.get('/admin-users', authMiddleware, roleMiddleware(['SuperAdmin']), getAllAdminUsers);

// Get an admin user by ID
router.get('/admin-users/:id', authMiddleware, getAdminUserById);

// Fetch users created by admin
router.get('/admin-users/:adminId/users', authMiddleware, roleMiddleware(['SuperAdmin']), getUsersByAdmin);

// Fetch doors created by admin
router.get('/admin-users/:adminId/doors', authMiddleware, roleMiddleware(['SuperAdmin']), getDoorsByAdmin);

//fetch
router.get('/admin-users/:adminId/recentaccess', authMiddleware, roleMiddleware(['SuperAdmin']), getDoorsHistoryByAdmin);

router.get('/recent-access', authMiddleware, roleMiddleware(['SuperAdmin']), getAllRecentAccess);

// Add this to your admin routes file
router.get('/all-users', authMiddleware, roleMiddleware(['SuperAdmin']), getAllUsers);

router.get('/all-doors', authMiddleware, roleMiddleware(['SuperAdmin']), getAllDoors);

// Update an admin user by ID
router.put('/admin-users/:id', authMiddleware, updateAdminUserById);

// Delete an admin user by ID
router.delete('/admin-users/:id', authMiddleware, deleteAdminUserById);

// Update current admin user
router.put('/me', authMiddleware, updateCurrentAdminUser);

// Change password
router.put('/change-password', authMiddleware, changePassword);

// Create a new company (SuperAdmin only)
router.post('/create-company', authMiddleware, roleMiddleware(['SuperAdmin']), createCompany);

// Get all companies with their admins
router.get('/companies-with-admins', authMiddleware, getCompaniesWithAdmins);

// Get all companies
router.get('/companies', authMiddleware, getCompanies);

// Check if company name and address combination is unique
router.get('/companies/check-name-address-update', authMiddleware, checkCompanyNameAndAddressUnique);

// Get a company by ID
router.get('/companies/:id', authMiddleware, getCompanyById);

// Update a company
router.put('/companies/:id', authMiddleware, updateCompany);

// Route for updating the expiration date
router.put('/companies/:companyId/update-expiration', authMiddleware, roleMiddleware(['SuperAdmin']), updateExpirationDate);

// Delete a company
router.delete('/companies/:id', authMiddleware, deleteCompany);

// Add a location to a company
router.post('/add-location', authMiddleware, addLocation);

//delete a location
router.delete('/delete-location',authMiddleware, deleteLocation)

// Create a new admin user (SuperAdmin only)
router.post('/create-admin', authMiddleware, roleMiddleware(['SuperAdmin']), createAdminUser);

// Add a route to toggle company status (active/inactive)
router.patch('/companies/toggle-status/:companyId', authMiddleware, roleMiddleware(['SuperAdmin']), toggleCompanyStatus);

// change status in company request
router.patch('/company-request/:id/status', authMiddleware, roleMiddleware(['SuperAdmin']), toggleCompanyRequestStatus);

module.exports = router;