const express = require('express');
const { getCompanyRequests, getCompanyRequestById, updateCompanyRequest, deleteCompanyRequest, createCompanyRequest, getCompanyRequestsWithAdmins, toggleCompanyRequestStatus } = require("../controllers/companyRequestController");
const { getAllTrialRequests } = require('../controllers/TrialRequestController');
const router = express.Router();

// Create Company Request
router.post('/create-company-request', createCompanyRequest)

// Get all companies
router.get('/company-requests', getCompanyRequests);

// Get a company by ID
router.get('/company-request/:id', getCompanyRequestById);

// Update a company
router.put('/company-request/:id', updateCompanyRequest);

// Delete a company
router.delete('/company-request/:id', deleteCompanyRequest);

// retrive admins with company
router.get('/companies-with-admins', getCompanyRequestsWithAdmins)

// Get all trial requests with pagination
router.get('/trial-requests', getAllTrialRequests);

module.exports = router;