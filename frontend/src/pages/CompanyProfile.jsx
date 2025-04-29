import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiError } from "react-icons/bi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import RecentAccessDoors from "../components/RecentAccessDoors";

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [nameAddressUnique, setNameAddressUnique] = useState(true); // Default to true
  const [nameAddressError, setNameAddressError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [success, setSuccess] = useState('');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailUnique, setIsEmailUnique] = useState(null);
const [emailError, setEmailError] = useState('');
const [accessRecords, setAccessRecords] = useState([]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/companies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCompany(response.data);
        setFormData({
          name: response.data.name,
          address: response.data.address,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchRecentAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/admin-users/${id}/recentaccess`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log("Recent access records:", response.data);
        setAccessRecords(response.data);
      } catch (error) {
        console.error("Error fetching recent access records:", error);
        setError(error.message);
      }
    };

    fetchRecentAccess();
    fetchCompany();
  }, [id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/companies/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      // Refetch the updated company details
      const response = await axios.get(`/api/admin/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setCompany(response.data); // Update the state with the new data
  
      setIsEditModalOpen(false);
      toast.success("Company information updated successfully!");
    } catch (err) {
      console.error("Error updating company:", err);
      setError(err.message);
    }
  };
  

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      navigate("/companies");
      toast.success("Company deleted successfully!");
    } catch (err) {
      console.error("Error deleting company:", err);
      setError(err.message);
    }
  };

  const handleUpdateExpiration = async () => {
    if (!company) return;
  
    const today = new Date();
    const expiredDate = new Date(company.expiredDate);
    let newExpiredDate;
  
    // Check if today is greater than or less than the expired date
    if (today > expiredDate) {
      // If the current date is past the expiration date
      if (company.package === "7days") {
        newExpiredDate = new Date(today);
        newExpiredDate.setDate(today.getDate() + 8); // Set to today + 8 days
      } else if (company.package === "30daysLimited" || company.package === "30daysUnlimited") {
        newExpiredDate = new Date(today);
        newExpiredDate.setDate(today.getDate() + 31); // Set to today + 31 days
      }
    } else {
      // If the current date is before or equal to the expiration date
      if (company.package === "7days") {
        newExpiredDate = new Date(today);
        newExpiredDate.setDate(today.getDate() + 8); // Set to today + 8 days
      } else if (company.package === "30daysLimited" || company.package === "30daysUnlimited") {
        newExpiredDate = new Date(today);
        newExpiredDate.setDate(today.getDate() + 31); // Set to today + 31 days
      }
    }
  
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/companies/${company._id}/update-expiration`, { expiredDate: newExpiredDate }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      // Refetch the updated company details
      const response = await axios.get(`/api/admin/companies/${company._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setCompany(response.data); // Update the state with the new data
  
      toast.success("Expiration date updated successfully!");
    } catch (err) {
      console.error("Error updating expiration date:", err);
      setError(err.message);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "name" || name === "address") {
      if (formData.name.trim() === "" || formData.address.trim() === "") {
        setNameAddressUnique(true);
        setNameAddressError("");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/admin/companies/check-name-address-update?name=${formData.name}&address=${formData.address}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setNameAddressUnique(response.data.isUnique);
        setNameAddressError(response.data.isUnique ? "" : "Name and address combination already taken");
      } catch (error) {
        console.error("Error checking name and address uniqueness", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post("/api/admin/create-admin", {
        firstName,
        lastName,
        email,
        password,
        companyId: company._id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Response from API:", response);
  
      setSuccess('Admin user created successfully');
      setError('');
  
      // Copy login credentials to clipboard
      const credentials = `Email: ${email}\nPassword: ${password}`;
      await navigator.clipboard.writeText(credentials);
      toast.success("Login credentials copied to clipboard. Please store them in a safe place and share them with the new admin user.", {
        autoClose: 5000,
      });
  
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
  
      // Refetch the company data to update the admin list
      const updatedCompanyResponse = await axios.get(`/api/admin/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      setCompany(updatedCompanyResponse.data); // Update the company data with the new admin
    } catch (err) {
      console.error("Error creating admin user:", err);
      if (err.response) {
        const errorMessage = err.response.data.error || err.response.data.message || err.response.statusText;
        toast.error(`${errorMessage}`);
      } else {
        setError("An error occurred, please try again later.");
      }
      setSuccess('');
    }
    setIsModalVisible(false);
  };

  const handleEmailChange = async (e) => {
    const { value } = e.target;
    setEmail(value);

    try {
      const token = localStorage.getItem('token');
      
      // Ensure the token exists before making the request
      if (!token) {
        throw new Error('Authentication token is missing');
      }
  
      const response = await axios.get(`/api/users/check-email-update?email=${value}&userId=${formData.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // If response is successful and email is not in use
      if (value.includes('@')) {
        setIsEmailUnique(true);
        setEmailError('');
        if (!response.data.isUnique) {
          setIsEmailUnique(false);
          setEmailError('Email is already taken');
        }
      } else {
        setIsEmailUnique(false);
        setEmailError('Please enter a valid email address');
      }
    } catch (err) {
      console.error('Error checking email uniqueness:', err);
      setIsEmailUnique(false);
      setEmailError('An error occurred while checking the email');
    }
  };

  const daysLeft = company && company.expiredDate
  ? Math.floor((new Date(company.expiredDate) - Date.now()) / (1000 * 60 * 60 * 24))
  : null;


  const getExpirationClass = (days) => {
    if (days <= 1) {
      return 'text-red-600'; // Red color for "Expired" or "1 day left"
    } else if (days <= 3) {
      return 'text-red-500'; // Red color for "3 days left", "2 days left"
    } else if (days <= 10) {
      return 'text-yellow-500'; // Yellow color for "10 days left", "9 days left", etc.
    } else {
      return 'text-green-500'; // Green color for anything greater than 10 days
    }
  };
  
  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex dark:bg-slate-700">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Company Profile
          </h2>

          <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
            <div className="flex items-center justify-between">
              {/* Company Profile and Details */}
              <div className="flex items-center">
                <div className="ml-4">
                  <div className="flex items-baseline mb-5">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mr-4">
                      {company.name}
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300">
                      {company.address}
                    </p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Created Date: </strong> 
                    {company && company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'No Date'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Subcribed Package: </strong>
                    {company.package ? company.package : 'N/A'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Expiration Date: </strong>
                    {company && company.expiredDate ? (
                      <>
                        {new Date(company.expiredDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })} | 
                        <span className={getExpirationClass(daysLeft)}>
                          {daysLeft > 0 
                            ? ` ${daysLeft} days to expire`
                            : <b> Expired</b>
                          }
                        </span>
                      </>
                    ) : 'No expiration date available'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Edit Company
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Delete Company
                </button>
                <button
                  onClick={handleUpdateExpiration}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Update Expiration
                </button>
              </div>
            </div>
          </div>

          {/* Locations Tiles */}
          <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Locations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {company.locations.map((location, index) => (
                <div key={index} className="p-4 border rounded-lg shadow-sm bg-white dark:bg-slate-700 dark:text-slate-300">
                  <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-100 mb-2">
                    {location}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Users List */}
          <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
          <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Company Admins
              </h3>
              <button
                onClick={() => setIsModalVisible(true)}
                className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
              >
                Create Admin
              </button>
            </div>
            <table className="w-full mt-4 bg-white dark:bg-slate-700 shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="text-left bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-slate-400">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {company.admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <td className="p-3 border-t border-gray-200 dark:border-slate-500">{admin.firstName} {admin.lastName}</td>
                    <td className="py-2 px-4 border-t dark:border-slate-500 text-slate-500 dark:text-slate-300">{admin.email}</td>
                    <td className="py-2 px-4 border-t dark:border-slate-500 text-center">
                      <button
                        onClick={() => navigate(`/admin-users/${admin._id}`)}
                        className="bg-blue-500 dark:bg-blue-800 dark:text-slate-300 text-sm text-white py-1 px-3 rounded hover:bg-blue-600 dark:hover:bg-blue-900"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Recent Access Doors Section */}
          <RecentAccessDoors accessRecords={accessRecords} />

          {/* Edit Company Modal */}
          <Modal isVisible={isEditModalOpen} onClose={handleCloseEditModal}>
            <h2 className="text-xl text-slate-700 dark:text-slate-200 font-bold mb-4">
              Edit Company
            </h2>
            <div className="mb-4 relative">
              <label className="block text-slate-700 dark:text-slate-200">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
                />
                {nameAddressUnique !== null && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
                    {nameAddressUnique ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </span>
                )}
              </div>
              {nameAddressError && (
                <p className="text-red-500 mt-1 flex items-center">
                  <BiError className="mr-1" /> {nameAddressError}
                </p>
              )}
            </div>
            <div className="mb-4 relative">
              <label className="block text-slate-700 dark:text-slate-200">
                Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
                />
                {nameAddressUnique !== null && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
                    {nameAddressUnique ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </span>
                )}
              </div>
              {nameAddressError && (
                <p className="text-red-500 mt-1 flex items-center">
                  <BiError className="mr-1" /> {nameAddressError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseEditModal}
                className="bg-gray-500 w-20 dark:bg-slate-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`w-20 px-4 py-2 rounded ${
                  !nameAddressUnique
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
                disabled={!nameAddressUnique} // Disable submit if name and address combination is not unique
              >
                Save
              </button>
            </div>
          </Modal>

          {/* Modal for Creating Admin */}
          <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Admin User</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-slate-700 dark:text-slate-200">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400 ${
                    emailError ? 'border-red-500' : ''
                  }`}
                  required
                />
                {isEmailUnique !== null && (
                  <span className="absolute right-3 top-10 transform -translate-y-1/2 text-lg">
                    {isEmailUnique ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </span>
                )}
                {emailError && (
                  <p className="text-red-500 mt-1 flex items-center">
                    <BiError className="mr-1" /> {emailError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 w-20 dark:bg-slate-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsModalVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-20 px-4 py-2 rounded bg-blue-500 text-white`}
                >
                  Save
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Company Modal */}
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            message="Are you sure you want to delete this company? This action cannot be undone."
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CompanyProfile;