import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AuditLogsPage = () => {
  // State for access records
  const [accessRecords, setAccessRecords] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // State for users list
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersCompanyFilter, setUsersCompanyFilter] = useState('');
  const [usersDateFilter, setUsersDateFilter] = useState('');

  // State for doors list
  const [doors, setDoors] = useState([]);
  const [doorsError, setDoorsError] = useState(null);
  const [doorsPage, setDoorsPage] = useState(0);
  const [doorsCompanyFilter, setDoorsCompanyFilter] = useState('');
  const [doorsDateFilter, setDoorsDateFilter] = useState('');

  const [activeTab, setActiveTab] = useState('accessLogs');

  // Fetch access records
  const fetchRecentAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('/api/admin/recent-access', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      setAccessRecords(response.data);
    } catch (error) {
      console.error("Error fetching recent access records:", error);
      setAccessError(error.response?.data?.message || 'An error occurred');
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('/api/admin/all-users', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError(error.response?.data?.message || 'Failed to load users');
    }
  };

  // Fetch all doors
  const fetchAllDoors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('/api/admin/all-doors', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      setDoors(response.data);
    } catch (error) {
      console.error("Error fetching doors:", error);
      setDoorsError(error.response?.data?.message || 'Failed to load doors');
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setAllCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError('Failed to load companies');
    }
  };

  useEffect(() => {
    fetchCompanies();
    if (activeTab === 'accessLogs') {
      fetchRecentAccess();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'doors') {
      fetchAllDoors();
    }
  }, [activeTab]);

  // Utility function to get visible page numbers
  const getVisiblePageNumbers = (totalPages, currentPage) => {
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Access records filtering and pagination
  const filteredRecords = accessRecords.filter(record =>
    (companyFilter ? record.company?._id === companyFilter : true) &&
    (dateFilter ? new Date(record.entryTime).toISOString().split('T')[0] === dateFilter : true)
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentRecords = filteredRecords.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Users filtering and pagination
  const filteredUsers = users.filter(user =>
    (usersCompanyFilter ? user.company?._id === usersCompanyFilter : true) &&
    (usersDateFilter ? new Date(user.createdAt).toISOString().split('T')[0] === usersDateFilter : true)
  );

  const totalUsersPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    usersPage * itemsPerPage,
    (usersPage + 1) * itemsPerPage
  );

  // Doors filtering and pagination
  const filteredDoors = doors.filter(door =>
    (doorsCompanyFilter ? door.company?._id === doorsCompanyFilter : true) &&
    (doorsDateFilter ? new Date(door.createdAt).toISOString().split('T')[0] === doorsDateFilter : true)
  );

  const totalDoorsPages = Math.ceil(filteredDoors.length / itemsPerPage);
  const currentDoors = filteredDoors.slice(
    doorsPage * itemsPerPage,
    (doorsPage + 1) * itemsPerPage
  );

  // Navigation handlers
  const handleNext = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);
  const handlePrev = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleUsersNext = () => usersPage < totalUsersPages - 1 && setUsersPage(usersPage + 1);
  const handleUsersPrev = () => usersPage > 0 && setUsersPage(usersPage - 1);
  const handleDoorsNext = () => doorsPage < totalDoorsPages - 1 && setDoorsPage(doorsPage + 1);
  const handleDoorsPrev = () => doorsPage > 0 && setDoorsPage(doorsPage - 1);
  
  const handlePageClick = (index) => setCurrentPage(index);
  const handleUsersPageClick = (index) => setUsersPage(index);
  const handleDoorsPageClick = (index) => setDoorsPage(index);
  
  const handleReset = () => {
    setCompanyFilter('');
    setDateFilter('');
    setCurrentPage(0);
  };

  const handleUsersReset = () => {
    setUsersCompanyFilter('');
    setUsersDateFilter('');
    setUsersPage(0);
  };

  const handleDoorsReset = () => {
    setDoorsCompanyFilter('');
    setDoorsDateFilter('');
    setDoorsPage(0);
  };

  // Pagination rendering function
  const renderPagination = (currentPage, totalPages, handlePageClick, handlePrev, handleNext) => {
    const visiblePages = getVisiblePageNumbers(totalPages, currentPage);

    return (
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
          {visiblePages.map((index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`px-3 py-1 rounded ${
                currentPage === index
                  ? 'bg-blue-700 dark:bg-slate-800 text-white'
                  : 'bg-gray-200 dark:bg-slate-500 dark:text-gray-100 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          {totalPages > 5 && currentPage < totalPages - 5 && (
            <span className="px-3 py-1"></span>
          )}
        </div>
        <button 
          onClick={handleNext} 
          disabled={currentPage >= totalPages - 1}
          className={`px-4 py-2 rounded ${
            currentPage >= totalPages - 1
              ? 'bg-gray-200 text-gray-400 dark:bg-slate-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-slate-800 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full dark:bg-slate-700">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4 dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
          <div className="flex mb-4 border-b border-gray-200 dark:border-slate-500">
            <button
              onClick={() => setActiveTab('accessLogs')}
              className={`px-4 py-2 font-medium ${activeTab === 'accessLogs' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Access Logs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Users Logs
            </button>
            <button
              onClick={() => setActiveTab('doors')}
              className={`px-4 py-2 font-medium ${activeTab === 'doors' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Doors Logs
            </button>
          </div>

          {activeTab === 'accessLogs' ? (
            <>
              <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-slate-100">Recent Access Users</h2>
                  
                  {accessError ? (
                    <div className="flex-1 p-6">
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{accessError}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={companyFilter}
                        onChange={(e) => {
                          setCompanyFilter(e.target.value);
                          setCurrentPage(0);
                        }}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">All Companies</option>
                        {allCompanies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>

                      <input 
                        type="date" 
                        value={dateFilter} 
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      />
                      
                      <button 
                        onClick={handleReset} 
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>

                {accessError ? null : (
                  <>
                    <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
                          <th className="p-4">Company</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Door Code</th>
                          <th className="p-4">Room Name</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Entry Time</th>
                          <th className="p-4">Exit Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.map((record, index) => (
                          <tr key={record._id || index} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.company?.name || 'Unknown Company'}</td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.location || 'N/A'}</td>                    
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.doorCode || 'N/A'}</td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.roomName || 'Unknown'}</td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown User'}</td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.entryTime ? new Date(record.entryTime).toLocaleString() : 'N/A'}</td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">{record.exitTime ? new Date(record.exitTime).toLocaleString() : 'Still in the room'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {renderPagination(
                      currentPage, 
                      totalPages, 
                      handlePageClick, 
                      handlePrev, 
                      handleNext
                    )}
                  </>
                )}
              </div>
            </>
          ) : activeTab === 'users' ? (
            <>
              <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-slate-100">All Users</h2>
                  
                  {usersError ? (
                    <div className="flex-1 p-6">
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{usersError}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={usersCompanyFilter}
                        onChange={(e) => {
                          setUsersCompanyFilter(e.target.value);
                          setUsersPage(0);
                        }}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">All Companies</option>
                        {allCompanies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>

                      <input 
                        type="date" 
                        value={usersDateFilter} 
                        onChange={(e) => setUsersDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      />
                      
                      <button 
                        onClick={handleUsersReset} 
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>

                {usersError ? null : (
                  <>
                    <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
                          <th className="p-4">Company</th>
                          <th className="p-4">User Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Created Admin</th>
                          <th className="p-4">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user, index) => (
                          <tr key={user._id || index} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {user.company?.name || 'Unknown Company'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {`${user.firstName} ${user.lastName}`}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {user.email}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {user.admin ? `${user.admin.firstName} ${user.admin.lastName}` : 'Unknown Admin'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {new Date(user.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {renderPagination(
                      usersPage, 
                      totalUsersPages, 
                      handleUsersPageClick, 
                      handleUsersPrev, 
                      handleUsersNext
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-slate-100">All Doors</h2>
                  
                  {doorsError ? (
                    <div className="flex-1 p-6">
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{doorsError}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={doorsCompanyFilter}
                        onChange={(e) => {
                          setDoorsCompanyFilter(e.target.value);
                          setDoorsPage(0);
                        }}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">All Companies</option>
                        {allCompanies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>

                      <input 
                        type="date" 
                        value={doorsDateFilter} 
                        onChange={(e) => setDoorsDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg w-1/3 dark:bg-slate-800 dark:text-white"
                      />
                      
                      <button 
                        onClick={handleDoorsReset} 
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>

                {doorsError ? null : (
                  <>
                    <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
                      <thead>
                        <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
                          <th className="p-4">Company</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Door Code</th>
                          <th className="p-4">Room Name</th>
                          <th className="p-4">Created Admin</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDoors.map((door, index) => (
                          <tr key={door._id || index} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.company?.name || 'Unknown Company'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.location || 'N/A'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.doorCode || 'N/A'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.roomName || 'N/A'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.admin ? `${door.admin.firstName} ${door.admin.lastName}` : 'Unknown Admin'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {door.status || 'N/A'}
                            </td>
                            <td className="p-3 border-t border-gray-400 dark:border-slate-500">
                              {new Date(door.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {renderPagination(
                      doorsPage, 
                      totalDoorsPages, 
                      handleDoorsPageClick, 
                      handleDoorsPrev, 
                      handleDoorsNext
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;