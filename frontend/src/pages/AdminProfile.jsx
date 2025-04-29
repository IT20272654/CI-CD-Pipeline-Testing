import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDoorsList from "../components/AdminDoorsList";
import AdminUsersList from "../components/AdminUsersList";
import ConfirmationModal from "../components/ConfirmationModal";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BiError } from "react-icons/bi";

const AdminProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyId: "",
  });
  const [companies, setCompanies] = useState([]);
  const [doors, setDoors] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(false);
  const [emailUnique, setEmailUnique] = useState(true);
  const [emailError, setEmailError] = useState(null);
  const [initialAdminData, setInitialAdminData] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/admin-users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setAdmin(response.data);
        setInitialAdminData(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          companyId: response.data.company ? response.data.company._id : "",
          userId: response.data._id,
          password: "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setCompanies(response.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    const fetchDoors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/admin-users/${id}/doors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setDoors(response.data);
      } catch (err) {
        console.error("Error fetching doors:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/admin/admin-users/${id}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    
    fetchAdmin();
    fetchCompanies();
    fetchDoors();
    fetchUsers();
  }, [id, formData.companyId]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/admin-users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const response = await axios.get(`/api/admin/admin-users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      // Update the state with the newly fetched admin data
      setAdmin(response.data);
      setInitialAdminData(response.data);
  
      setIsEditModalOpen(false);
      toast.success("Admin information updated successfully!");
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Failed to update admin information. Please try again.");
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
      await axios.delete(`/api/admin/admin-users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      navigate("/admin-users");
      toast.success("Admin deleted successfully!");
    } catch (err) {
      console.error("Error deleting admin:", err);
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

    if (name === "email") {
      if (!formData.userId) {
        console.error("User ID is not set, skipping email uniqueness check");
        return; // Don't proceed with email check if userId is undefined
      }
    
      if (value.includes('@')) {
        setEmailError("");
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `/api/users/check-email-update?email=${value}&userId=${formData.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
        
          setEmailUnique(response.data.isUnique);
          setEmailError(response.data.isUnique ? "" : "Email already taken");
        } catch (error) {
          console.error("Error checking email uniqueness", error);
          setEmailUnique(null);
          setEmailError("Failed to check email uniqueness");
        }
      } else {
        setEmailError("Please enter a valid email address");
        setEmailUnique(false);
      }
    }
    const isModified = (
      formData.firstName !== initialAdminData.firstName ||
      formData.lastName !== initialAdminData.lastName ||
      formData.email !== initialAdminData.email ||
      formData.companyId !== initialAdminData.companyId ||
      formData.password !== ""
    );
    setIsSaveButtonVisible(isModified && !emailError && emailUnique);
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
            Admin Profile
          </h2>

          <div className="p-4 border dark:border-none rounded-lg shadow-sm bg-white dark:bg-slate-600">
            <div className="flex items-center justify-between">
              {/* Admin Profile and Details */}
              <div className="flex items-center">
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                    {admin.firstName} {admin.lastName}
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Email:</strong> {admin.email}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Company:</strong> {admin.company ? admin.company.name : "N/A"}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Address:</strong> {admin.company ? admin.company.address : "N/A"}
                  </p>
                </div>

              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Edit Admin
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
          


          {/* Users Table */}
          <AdminUsersList users={users} />

          {/* Doors Table */}
          <AdminDoorsList doors={doors} />


          
         {/* Edit Admin Modal */}
          <Modal isVisible={isEditModalOpen} onClose={handleCloseEditModal}>
            <h2 className="text-xl text-slate-700 dark:text-slate-200 font-bold mb-4">
              Edit Admin
            </h2>
            <div className="mb-4">
              <label className="block text-slate-700 dark:text-slate-200">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 dark:text-slate-200">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
              />
              {emailUnique !== null && (
                <span className="absolute right-3 top-10 transform -translate-y-1/2 text-lg">
                  {emailUnique ? (
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
            <div className="mb-4">
              <label className="block text-slate-700 dark:text-slate-200">
                Company
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder='********'
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2  dark:bg-slate-600 dark:text-slate-100 focus:ring-blue-400"
              />
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
                  !isSaveButtonVisible 
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
                disabled={!isSaveButtonVisible } // Disable submit if email is not unique
              >
                Save
              </button>
            </div>
          </Modal>

          {/* Delete Admin Modal */}
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            message="Are you sure you want to delete this admin? This action cannot be undone."
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminProfile;