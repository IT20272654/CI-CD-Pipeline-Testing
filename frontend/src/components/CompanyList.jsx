import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaList, FaTh, FaCalendarDay, FaLongArrowAltUp, FaLongArrowAltDown, FaSortAlphaUp, FaSortAlphaDown } from 'react-icons/fa'; // Import icons
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const CompanyList = () => {
  const { user, token } = useAuth(); // Get user and token from context
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', address: '', package: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // State for view mode
  const [currentPage, setCurrentPage] = useState(0); // State for current page
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedPackage, setSelectedPackage] = useState(''); // New state for package filter
  const [selectedStatus, setSelectedStatus] = useState(''); // New state for status filter
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortBy, setSortBy] = useState('createdAt');
  const navigate = useNavigate();
  const [value, setValue] = useState('null');

  const companiesPerPage = 12;
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/admin/companies-with-admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanies(response.data);
        setFilteredCompanies(response.data); // Set initial filtered companies to all companies
      } catch (err) {
        console.error('Failed to fetch companies', err);
        toast.error('Failed to fetch companies. Please try again.');
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;
  
    // Filter based on search query
    if (searchQuery) {
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    // Filter based on selected package
    if (selectedPackage) {
      filtered = filtered.filter((company) => company.package === selectedPackage);
    }
  
    // Filter based on selected status
    if (selectedStatus) {
      filtered = filtered.filter((company) => company.status === selectedStatus);
    }
  
    // Apply sorting
    const sorted = sortCompanies(filtered);
    setFilteredCompanies(sorted);
  
  }, [searchQuery, selectedPackage, selectedStatus, companies, sortBy, sortOrder]);
  

  const sortCompanies = (filteredCompanies) => {
    const sortedCompanies = [...filteredCompanies];  // Make a copy of the filtered companies array

    sortedCompanies.sort((a, b) => {
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

    return sortedCompanies;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc'); // Default to ascending order for new column
    }
  };  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany({ ...newCompany, [name]: value });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const checkResponse = await axios.get(
        "/api/admin/companies/check-name-address-update",
        {
          params: { name: newCompany.name, address: newCompany.address, package: newCompany.package },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!checkResponse.data.isUnique) {
        toast.error('Company name and address combination already taken');
        return;
      }

      const response = await axios.post("/api/admin/create-company", newCompany, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompanies([...companies, response.data]);
      setNewCompany({ name: '', address: '', package: '' });
      setShowModal(false);
      setError('');
      toast.success('Company created successfully');
    } catch (err) {
      setError('Failed to create company');
      toast.error('Failed to create company');
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

  const handleTileClick = (id) => {
    navigate(`/companies/${id}`);
  };

  /*const StatusToggle = ({ company, handleToggleStatus }) => {
    const handleToggleClick = (e) => {
      e.stopPropagation(); // Prevent the parent div click handler from being triggered
      handleToggleStatus(company._id); // Call the status toggle function
    };
  
    return (
      <div className="flex items-center mt-4">
        <label className="relative inline-block w-14 h-8 mr-4 align-middle select-none">
          <input
            type="checkbox"
            checked={company.status === 'active'}
            onChange={handleToggleClick}
            className="sr-only peer"
          />
          <span
            className={`block w-14 h-8 rounded-full transition-all duration-300 ease-in-out ${
              company.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            } peer-checked:bg-green-500`} // Change background color on check
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full border-2 border-gray-300 transition-all duration-300 ease-in-out ${
                company.status === 'active' ? 'translate-x-6' : ''
              }`} // Move the circle to the right when active and keep it small
            />
          </span>
        </label>
        <span className="ml-2 text-sm font-semibold">
          {company.status === 'active' ? (
            <span className="text-green-500">Active</span>
          ) : (
            <span className="text-red-500">Inactive</span>
          )}
        </span>
      </div>
    );
  }; */

  const StatusToggle = ({ company, handleToggleStatus }) => {
    return (
      <div className="flex items-center mt-4">
        <select
          className="px-2 py-1 border dark:border-none dark:bg-slate-800 dark:text-slate-300 rounded"
          value={company.status}
          onChange={(e) => {
            handleToggleStatus(company._id, e.target.value); // Call handleToggleStatus with new status
          }}
        >
          <option disabled>Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    );
  };  
  
  // Toggle function to activate/deactivate a company
  const handleToggleStatus = async (companyId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage

      const response = await fetch(`/api/admin/companies/toggle-status/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, // Send token in the headers for authorization
          'Content-Type': 'application/json', // Content type is JSON
        },
      });

      const data = await response.json(); // Parse JSON from the response

      if (response.ok) {
        console.log('Status updated:', data);

        // Assuming companies state is an array, update the status of the toggled company
        const updatedCompanies = companies.map((company) =>
          company._id === companyId ? { ...company, status: data.company.status } : company
        );

        setCompanies(updatedCompanies); // Update the companies state with the new status
      } else {
        console.error('Error:', data.message); // Log error message if response is not OK
      }
    } catch (error) {
      console.error('Error:', error); // Catch any errors from the fetch or other async code
    }
  };

  const currentCompanies = filteredCompanies.slice(
    currentPage * companiesPerPage,
    (currentPage + 1) * companiesPerPage
  );

  return (
    <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600" aria-hidden={showModal}>
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <FaTh
            aria-label="Grid View"
            onClick={() => setViewMode('grid')}
            className={`cursor-pointer text-2xl ${viewMode === 'grid' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'} hover:text-blue-600`}
          />
          <FaList
            aria-label="List View"
            onClick={() => setViewMode('list')}
            className={`ml-2 cursor-pointer text-2xl ${viewMode === 'list' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'} hover:text-blue-600`}
          />
        </div>

        {/* Filtering Options */}
        <div className="mb-1 flex gap-4">
          {/* <p className="py-2 text-gray-400 dark:text-slate-400 px-2">Filter by:</p> */}
          <select
            className="px-2 py-2 rounded dark:bg-slate-700 dark:text-slate-100"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
          >
            <option value="">All Packages</option>
            <option value="Starter">Starter</option>
            <option value="Essential">Essential</option>
            <option value="Premium">Premium</option>
          </select>

          <select
            className="px-2 py-2 rounded dark:bg-slate-700 dark:text-slate-100"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>         
        </div>

        {/* Sorting */}
        <div className="flex gap-4 mb-1">
          {/* <p className="py-2 text-gray-400 dark:text-slate-400 px-2">Sort by:</p> */}
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
            className="border dark:border-none px-4 py-2 rounded w-80 dark:bg-slate-700 dark:text-slate-100"
          />
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Company
          </button>
        </div>
        
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCompanies.map((company) => (
            <div
              key={company._id}
              className={`p-4 border dark:border-none rounded-lg shadow-sm ${
                company.status === "active" ? "bg-slate-50 dark:bg-slate-700" : "bg-red-50 dark:bg-red-950 dark:bg-opacity-30"
              }`}
              onClick={(e) => {
                // Only navigate if the click isn't on the toggle area
                if (!e.target.closest("select")) {
                  handleTileClick(company._id);
                }
              }}
            >
              <div className="flex py-1 justify-between items-center text-slate-700 dark:text-gray-200 mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{company.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{company.address}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    company.status === 'active'
                      ? 'bg-green-700 text-green-100 dark:bg-green-600 dark:text-green-100'
                      : 'bg-red-600 bg-opacity-80 text-red-100 dark:bg-red-600 dark:text-red-100'
                  }`}
                >
                  {company.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex justify-between items-center w-full">
                <span>
                  {company.package} | {company.expiredDate ? (
                    <>
                      {new Date(company.expiredDate) > new Date() ? (
                        <strong>Expires: </strong>
                      ) : (
                        <strong>Expired at: </strong>
                      )}
                      {new Date(company.expiredDate).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </>
                  ) : 'No Expiration Date'}
                </span>
                {StatusToggle({ company, handleToggleStatus })}
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
              {currentCompanies.map((company) => (
                <tr
                  key={company._id}
                  className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  onClick={(e) => {
                    // Only navigate if the click isn't on the toggle area
                    if (!e.target.closest("select")) {
                      handleTileClick(company._id);
                    }
                  }}
                >
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <p className="text-m font-medium"><strong>{company.name}</strong></p>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <p className="text-m font-medium">{company.address}</p>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                    <ul className="list-disc list-inside">
                      <li className="text-sm font-small">{company.package}</li>
                      <li className="text-sm font-small">{company.expiredDate ? (
                    <>
                      {new Date(company.expiredDate) > new Date() ? (
                        <b>Expires: </b>
                      ) : (
                        <b>Expired at: </b>
                      )}
                      {new Date(company.expiredDate).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </>
                  ) : 'No Expiration Date'}</li>
                    </ul>
                  </td>
                  <td className="p-3 border-t border-gray-200 dark:border-slate-500">
                  {StatusToggle({ company, handleToggleStatus })}
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
          className={`px-4 py-2 rounded ${
            currentPage === 0
              ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'
          }`}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`px-3 py-1 rounded ${
                currentPage === index
                  ? 'bg-blue-700 dark:bg-slate-800 text-white'
                  : 'bg-gray-200 dark:bg-slate-500 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages - 1
              ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold dark:text-slate-100 text-gray-800 mb-4">Create Company</h2>
            <form onSubmit={handleCreateCompany}>
              <div className="mb-4">
                <label className="block mb-2 dark:text-slate-200 text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newCompany.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border dark:bg-slate-600 dark:border-slate-500 rounded dark:text-slate-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 dark:text-slate-200 text-gray-700">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={newCompany.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border dark:bg-slate-600 dark:border-slate-500 rounded dark:text-slate-100"
                  required
                />
              </div>
              <label className="block mb-2 dark:text-slate-200 text-gray-700">Choose a Plan:</label>
              <div className="flex space-x-8">
                {/* Starter Plan */}
                <label htmlFor="Starter" className="flex items-center cursor-pointer space-x-2">
                  <input
                    type="radio"
                    id="Starter"
                    name="package"
                    value="Starter"
                    checked={newCompany.package === 'Starter'}
                    onChange={() => setNewCompany({ ...newCompany, package: 'Starter' })}  // Update state correctly
                    className="text-blue-600 rounded-full focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-gray-700 dark:text-slate-200 text-lg">Starter</span>
                </label>

                {/* Essential Plan */}
                <label htmlFor="Essential" className="flex items-center cursor-pointer space-x-2">
                  <input
                    type="radio"
                    id="Essential"
                    name="package"
                    value="Essential"
                    checked={newCompany.package === 'Essential'}
                    onChange={() => setNewCompany({ ...newCompany, package: 'Essential' })}  // Update state correctly
                    className="text-blue-600 rounded-full focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-gray-700 dark:text-slate-200 text-lg">Essential</span>
                </label>

                {/* Premium Plan */}
                <label htmlFor="Premium" className="flex items-center cursor-pointer space-x-2">
                  <input
                    type="radio"
                    id="Premium"
                    name="package"
                    value="Premium"
                    checked={newCompany.package === 'Premium'}
                    onChange={() => setNewCompany({ ...newCompany, package: 'Premium' })}  // Update state correctly
                    className="text-blue-600 rounded-full focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-gray-700 dark:text-slate-200 text-lg">Premium</span>
                </label>
              </div>
              <br/>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-slate-500 text-gray-700 dark:text-slate-200 rounded hover:bg-gray-400 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-slate-800 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
