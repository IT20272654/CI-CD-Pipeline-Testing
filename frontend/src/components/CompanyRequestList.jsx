import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaList, FaTh, FaCalendarDay, FaLongArrowAltUp, FaLongArrowAltDown, FaSortAlphaUp, FaSortAlphaDown } from 'react-icons/fa'; // Import icons
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompanyRequestList = () => {
  const [companyRequests, setCompanyRequests] = useState([]);
  const [filteredCompanyRequests, setFilteredCompanyRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompanyRequest, setSelectedCompanyRequest] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // State for view mode
  const [currentPage, setCurrentPage] = useState(0); // State for current page
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    packageType: '',
    payment: '',
  });
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortBy, setSortBy] = useState('createdAt');
  const navigate = useNavigate();
  const [trialRequest, setTrialRequest] = useState([]);
  const [trialTotalRecords, setTrialTotalRecords] = useState(0); // Add this state

  const companyRequestsPerPage = 12;
  const totalPages = Math.ceil(filteredCompanyRequests.length / companyRequestsPerPage);
  const [trialRequestsPerPage] = useState(10); // Set the number of trial requests per page
  const [trialCurrentPage, setTrialCurrentPage] = useState(0); // State for current page of trial requests
  const trialTotalPages = Math.ceil(trialTotalRecords / trialRequestsPerPage); // Use total records instead

  useEffect(() => {
    const fetchCompanyRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("/api/guest/company-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanyRequests(response.data);
        setFilteredCompanyRequests(response.data); // Set initial filtered companies to all companies
      } catch (err) {
        console.error('Failed to fetch companyRequests', err);
        toast.error('Failed to fetch companyRequests. Please try again.');
      }
    };

    fetchCompanyRequests();
  }, []);

  const fetchTrialRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("/api/guest/trial-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: trialCurrentPage + 1, // Backend expects 1-based page numbers
          limit: trialRequestsPerPage
        },
        withCredentials: true,
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setTrialRequest(response.data.data);
        setTrialTotalRecords(response.data.pagination.totalRequests); // Update total records
      } else {
        console.error("API response does not contain valid data:", response.data);
        setError("Invalid response structure.");
      }
  
      console.log("Trial Requests:", response.data);
    } catch (error) {
      console.error("Error fetching Trial Requests:", error);
      setError("Failed to fetch trial requests. Please try again.");
    }
  };

  useEffect(() => {
    fetchTrialRequests();
  }, [trialCurrentPage, trialRequestsPerPage]); // Add dependencies

  useEffect(() => {
    let filtered = companyRequests;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (companyRequest) =>
          companyRequest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          companyRequest.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.status) {
      filtered = filtered.filter((companyRequest) => companyRequest.status === filters.status);
    }

    if (filters.packageType) {
      filtered = filtered.filter((companyRequest) => companyRequest.packageType === filters.packageType);
    }

    if (filters.payment) {
      filtered = filtered.filter((companyRequest) => 
        filters.payment === 'paid' ? companyRequest.payment === true : companyRequest.payment === false
      );
    }

    const sorted = sortCompanyRequests(filtered); // Sort the filtered company requests
    setFilteredCompanyRequests(sorted);
  }, [searchQuery, companyRequests, filters, sortBy, sortOrder]);

  const sortCompanyRequests = (filteredCompanyRequests) => {
    const sortedCompanyRequests = [...filteredCompanyRequests];

    sortedCompanyRequests.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)  // Sort by name in ascending order
          : b.name.localeCompare(a.name); // Sort by name in descending order
      } else if (sortBy === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)  // Sort by created date in ascending order
          : new Date(b.createdAt) - new Date(a.createdAt); // Sort by created date in descending order
      }
      return 0;
    });

    return sortedCompanyRequests;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc'); // Default to ascending order for new column
    }
  };  

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Function to handle previous page for trial requests
  const handleTrialPrev = () => {
    if (trialCurrentPage > 0) setTrialCurrentPage((prev) => prev - 1);
  };

  // Function to handle next page for trial requests
  const handleTrialNext = () => {
    if (trialCurrentPage < trialTotalPages - 1) setTrialCurrentPage((prev) => prev + 1);
  };

  // Function to handle page click for trial requests
  const handleTrialPageClick = (page) => {
    setTrialCurrentPage(page);
  };

  const handleTileClick = (id) => {
    const selectedCompanyRequest = companyRequests.find((companyRequest) => companyRequest._id === id);
    setSelectedCompanyRequest(selectedCompanyRequest);

    const allAdminsIds = selectedCompanyRequest.admins.map(admin => admin._id);
    setSelectedAdmins(allAdminsIds);

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompanyRequest(null);
  };

  const StatusToggle = ({ companyRequest, handleButtonStatus }) => {
    return (
      <div className="flex items-center mt-4 space-x-4">
        <button disabled={companyRequest.payment === false || companyRequest.status === 'Approved'}
          onClick={() => handleButtonStatus(companyRequest._id, 'Approve')}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
            companyRequest.payment === false || companyRequest.status === 'Approved'
              ? 'bg-gray-400 cursor-not-allowed' // Disabled styles
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Approve
        </button>

        <button disabled={companyRequest.status === 'Rejected' || companyRequest.status === 'Approved'}
          onClick={() => handleButtonStatus(companyRequest._id, 'Reject')}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
            companyRequest.status === 'Rejected' || companyRequest.status === 'Approved'
              ? 'bg-gray-400 cursor-not-allowed' // Disabled styles
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Reject
        </button>
      </div>
    );  
  };  

  const handleSelectAdmin = (adminId, isSelected) => {
    setSelectedAdmins((prevSelectedAdmins) => {
      if (isSelected) {
        // Add admin ID to selected admins array
        return [...prevSelectedAdmins, adminId];
      } else {
        // Remove admin ID from selected admins array
        return prevSelectedAdmins.filter(id => id !== adminId);
      }
    });
  };  
  
  // Function to handle the status toggle
  const handleButtonStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token is missing');
        return;
      }
  
      // Call the backend API to update the status
      const response = await fetch(`/api/admin/company-request/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, selectedAdmins }),
      });
  
      if (response.ok) {
        // Get the updated request from the response
        const updatedRequest = await response.json();
  
        // Find the request in the state and update it
        setCompanyRequests((prevRequests) => {
          return prevRequests.map((req) =>
            req._id === updatedRequest._id ? updatedRequest : req
          );
        });
  
        // Optionally update filteredCompanyRequests as well if necessary
        setFilteredCompanyRequests((prevRequests) => {
          return prevRequests.map((req) =>
            req._id === updatedRequest._id ? updatedRequest : req
          );
        });
  
        setShowModal(false);
        toast.success('Status updated successfully!');
      } else {
        console.error('Failed to update status');
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating the status.');
    }
  };

  function getDaysAgo(date) {
    const today = new Date();
    const createdDate = new Date(date);
    const timeDiff = today - createdDate; // Difference in milliseconds
    const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert ms to days
    return daysAgo;
  }  

  // Handle filters change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  
  const currentCompanyRequests = filteredCompanyRequests.slice(
    currentPage * companyRequestsPerPage,
    (currentPage + 1) * companyRequestsPerPage
  );

  return (
    <><div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600" aria-hidden={showModal}>
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <FaTh
            aria-label="Grid View"
            onClick={() => setViewMode('grid')}
            className={`cursor-pointer text-2xl ${viewMode === 'grid' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'} hover:text-blue-600`} />
          <FaList
            aria-label="List View"
            onClick={() => setViewMode('list')}
            className={`ml-2 cursor-pointer text-2xl ${viewMode === 'list' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'} hover:text-blue-600`} />
        </div>
        {/* Filters */}
        <div className="mb-1 flex gap-4">
          <p className="py-2 text-gray-400 dark:text-slate-400">Filter by:</p>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-2 py-2 rounded dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            name="payment"
            value={filters.payment}
            onChange={handleFilterChange}
            className="px-2 py-2 rounded dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <select
            name="packageType"
            value={filters.packageType}
            onChange={handleFilterChange}
            className="px-2 py-2 rounded dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All Packages</option>
            <option value="Starter">Starter</option>
            <option value="Essential">Essential</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex gap-4 mb-1">
          <p className="py-2 text-gray-400 dark:text-slate-400">Sort by:</p>
          <button
            onClick={() => handleSort('name')}
            className=" rounded-lg flex items-center"
          >
            {sortBy === 'name' && sortOrder === 'asc' ? (
              <FaSortAlphaDown className="ml-1 text-blue-500 text-3xl" />
            ) : sortBy === 'name' && sortOrder === 'desc' ? (
              <FaSortAlphaUp className="ml-1 text-blue-500 text-3xl" />
            ) : (
              <FaSortAlphaDown className="ml-1 text-gray-400 text-3xl" />
            )}
          </button>

          <button
            onClick={() => handleSort('createdAt')}
            className="rounded-lg flex items-center"
          >
            {sortBy === 'createdAt' && sortOrder === 'asc' ? (
              <FaLongArrowAltDown className="text-blue-500 text-3xl" />
            ) : sortBy === 'createdAt' && sortOrder === 'desc' ? (
              <FaLongArrowAltUp className="text-blue-500 text-3xl" />
            ) : (
              <FaLongArrowAltDown className="text-transparent text-3xl" />
            )}
            <FaCalendarDay className={sortBy === 'createdAt' ? 'text-blue-500 text-2xl' : 'text-gray-400 text-2xl'} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or address"
            className="border dark:border-none px-4 py-2 rounded w-80 dark:bg-slate-700 dark:text-slate-100" />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCompanyRequests.map((companyRequest) => (
            <div
              key={companyRequest._id}
              className={`p-4 border dark:border-none rounded-lg shadow-sm ${companyRequest.status === 'Approved'
                  ? 'bg-slate-50 dark:bg-slate-700'
                  : companyRequest.status === 'Rejected'
                    ? 'bg-red-50 dark:bg-red-950 dark:bg-opacity-30'
                    : 'bg-blue-50 dark:bg-blue-950 dark:bg-opacity-30' // Blue background for Pending status
                }`}
              onClick={(e) => {
                if (!e.target.closest('select')) {
                  handleTileClick(companyRequest._id);
                }
              } }
            >
              <div className="flex py-1 justify-between items-center text-slate-700 dark:text-gray-200 mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{companyRequest.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{companyRequest.address}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${companyRequest.status === 'Approved'
                      ? 'bg-green-700 text-green-100 dark:bg-green-600 dark:text-green-100'
                      : companyRequest.status === 'Rejected'
                        ? 'bg-red-600 bg-opacity-80 text-red-100 dark:bg-red-600 dark:text-red-100'
                        : 'bg-blue-700 text-blue-100 dark:bg-blue-600 dark:text-blue-100' // Blue background for Pending status
                    }`}
                >
                  {companyRequest.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {companyRequest.packageType ? companyRequest.packageType : 'N/A'} | Payment: {companyRequest.payment === true ?
                  'Paid' : 'Pending'} | {companyRequest.createdAt ? new Date(companyRequest.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) : 'No Date'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
                <th className="p-4">Name</th>
                <th className="p-4">Address</th>
                <th className="p-4">Package</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanyRequests.map((companyRequest) => (
                <tr
                  key={companyRequest._id}
                  className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  onClick={(e) => {
                    if (!e.target.closest('select')) {
                      handleTileClick(companyRequest._id);
                    }
                  } }
                >
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <p className="text-m font-medium"><strong>{companyRequest.name}</strong></p>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <p className="text-m font-medium">{companyRequest.address}</p>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <ul className="list-disc list-inside">
                      <li className="text-sm text-gray-900 dark:text-slate-200">
                        {companyRequest.packageType ? companyRequest.packageType : 'N/A'}
                      </li>
                      <li><b>Payment: </b>{companyRequest.payment === true ? 'Paid' : 'Pending'}</li>
                    </ul>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <b
                      className={`px-2 py-1 rounded text-sm ${companyRequest.status === 'Approved'
                          ? 'text-green-600 dark:text-green-400'
                          : companyRequest.status === 'Rejected'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-500' // Blue background for Pending status
                        }`}
                    >
                      {companyRequest.status}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded ${currentPage === 0
              ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`px-3 py-1 rounded ${currentPage === index
                  ? 'bg-blue-700 dark:bg-slate-800 text-white'
                  : 'bg-gray-200 dark:bg-slate-500 text-gray-600 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded ${currentPage === totalPages - 1
              ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
      {/* Show Modal if showModal is true */}
      {showModal && selectedCompanyRequest && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-1/2">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-slate-400">Company Request</h3>
              <button onClick={closeModal} className="text-red-500">Close</button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mt-4">
                <div>
                  {/* Left section: Name and Address */}
                  <div className="flex items-baseline mb-3">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mr-4">{selectedCompanyRequest.name}</h2>
                    <p className="text-slate-700 dark:text-slate-300">
                      {selectedCompanyRequest.address}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    <strong>Package: </strong>{selectedCompanyRequest.packageType ? selectedCompanyRequest.packageType : 'N/A'} | <strong>Payment: </strong>{selectedCompanyRequest.payment === true ? 'Paid' : 'Pending'}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    <strong>Requested Date: </strong>
                    {selectedCompanyRequest.createdAt ? (
                      <>
                        {new Date(selectedCompanyRequest.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        {' | '}
                        <span>{getDaysAgo(selectedCompanyRequest.createdAt)} Days ago</span>
                      </>
                    ) : (
                      'No Date'
                    )}
                  </p>
                </div>
                <div>
                  {/* Right section: Status Toggle */}
                  <StatusToggle companyRequest={selectedCompanyRequest} handleButtonStatus={handleButtonStatus} />
                </div>
              </div>
              <br></br>
              <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                <strong>Admins:</strong>
                <ul className="list-disc ml-5">
                  <table className="min-w-full mt-2 table-auto border-collapse bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-500">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-1 text-center">Select Admins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompanyRequest.admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                          <td className="p-3 border-t border-gray-200 dark:border-slate-500">{admin.firstName} {admin.lastName}</td>
                          <td className="p-3 border-t border-gray-200 dark:border-slate-500">{admin.email}</td>
                          <td className="p-1 border-t border-gray-200 dark:border-slate-500 text-center">
                            <input
                              type="checkbox"
                              id={`select-admin-${admin._id}`}
                              onChange={(e) => handleSelectAdmin(admin._id, e.target.checked)}
                              checked={selectedAdmins.includes(admin._id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
    <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
  <h2 className="text-xl font-semibold dark:text-slate-100 mb-4">Trial Request</h2>

  {/* Table */}
  <div>
    <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
      <thead>
        <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
          <th className="p-4">Company Name</th>
          <th className="p-4">Address</th>
          <th className="p-4">User</th>
          <th className="p-4">Email</th>
          <th className="p-4">Requested At</th>
        </tr>
      </thead>
      <tbody>
            {trialRequest.length > 0 ? (
              trialRequest
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((request, index) => (
                <tr key={index} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{request.companyName}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{request.address}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                    {request.firstName && request.lastName ? `${request.firstName} ${request.lastName}` : 'Unknown User'}
                  </td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">{request.email}</td>
                  <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No trial requests available.</td>
              </tr>
            )}
          </tbody>
    </table>
  </div>
{/* Pagination Controls for Trial Requests */}
<div className="flex justify-between items-center mt-4">
        <button
          onClick={handleTrialPrev}
          disabled={trialCurrentPage === 0}
          className={`px-4 py-2 rounded ${trialCurrentPage === 0 ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Previous
        </button>

        {/* Page Numbers for Trial Requests */}
        <div className="flex gap-2">
          {Array.from({ length: trialTotalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleTrialPageClick(index)}
              className={`px-3 py-1 rounded ${trialCurrentPage === index ? 'bg-blue-700 dark:bg-slate-800 text-white' : 'bg-gray-200 dark:bg-slate-500 dark:text-gray-100 text-gray-600 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleTrialNext}
          disabled={trialCurrentPage >= trialTotalPages - 1}
          className={`px-4 py-2 rounded ${trialCurrentPage >= trialTotalPages - 1 ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed' : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
</div>
</>
  );
};

export default CompanyRequestList;
