import axios from "axios";
import React, { useEffect, useState } from "react";
import CollectionCounts from "../components/CollectionCounts";
import CombinedGrowthChart from "../components/CombinedGrowthChart";
import DashboardMetrics from "../components/DashboardMetrics";
import Header from "../components/Header";
import Messages from "../components/Messages";
import PendingRequests from "../components/PendingRequests";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user,token } = useAuth();
  const userRole = localStorage.getItem('role'); // Assuming you store the role in localStorage
  const [expireDate, setExpireDate] = useState(null);
  const [expireColor, setExpireColor] = useState("");
  const [growthData, setGrowthData] = useState({
    userGrowth: [],
    companyGrowth: [],
    doorGrowth: []
  });
  

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const [userGrowthResponse, companyGrowthResponse, doorGrowthResponse] = await Promise.all([
          axios.get('/api/growth/user-growth'),
          axios.get('/api/growth/company-growth'),
          axios.get('/api/growth/door-growth')
        ]);

        setGrowthData({
          userGrowth: userGrowthResponse.data,
          companyGrowth: companyGrowthResponse.data,
          doorGrowth: doorGrowthResponse.data
        });
      } catch (error) {
        console.error('Error fetching growth data:', error);
      }
    };

    fetchGrowthData();
  }, []);

  useEffect(() => {
    const fetchAdminAndCompanyDetails = async () => {
      try {

        // Fetch the logged-in admin user's data
        const userResponse = await fetch(`/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const userData = await userResponse.json();
        localStorage.setItem("userId", userData.company._id); // Store user ID in localStorage
        // Fetch the company associated with the logged-in user
        if (userData && userData.company) {
          const companyResponse = await fetch(`/api/admin/companies/${userData.company._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          const companyData = await companyResponse.json();
          const expirationDate = companyData.expiredDate ? new Date(companyData.expiredDate) : null;
          if (expirationDate) {
            const currentDate = new Date();
            const timeDifference = expirationDate - currentDate;
            const daysToExpire = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days
            if (daysToExpire <= 1) {
              setExpireDate(`Expires in ${daysToExpire} day.`);
              setExpireColor('text-red-600'); // Red color for "Expired" or "1 day left"
            } else if (daysToExpire <= 3) {
              setExpireDate(`Expires in ${daysToExpire} days.`);
              setExpireColor('text-red-500'); // Red color for "3 days left", "2 days left"
            } else if (daysToExpire <= 10) {
              setExpireDate(`Expires in ${daysToExpire} days.`);
              setExpireColor('text-yellow-500'); // Yellow color for "10 days left", "9 days left", etc.
            } else {
              setExpireDate(`Expires in ${daysToExpire} days.`);
              setExpireColor('text-green-500'); // Green color for anything greater than 10 days
            }
          } else {
            setExpireDate("Not Available");
            setExpireColor('text-gray-500');
          }
        }
      } catch (error) {
        console.error("Error fetching admin or company data:", error);
      }
    };

    fetchAdminAndCompanyDetails();
  }, []);

  return (
    <div className="flex h-full bg-white dark:bg-slate-700 max-h-screen overflow-y-auto  [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-slate-800
                      dark:[&::-webkit-scrollbar-thumb]:bg-slate-500">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="flex-1 p-6">
          {/* Dashboard Metrics Section for Super Admin */}
          {user === 'SuperAdmin' && (
            <div className="mt-2">
              <DashboardMetrics />
              <div className="p-6 bg-white dark:bg-slate-600 dark:text-slate-200 border dark:border-none rounded-lg shadow-md mt-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">Growth Metrics</h3>
                <CombinedGrowthChart data={growthData} />
              </div>
            </div>
          )}

          {/* Collection Counts Section for Admin */}
          {user !== 'SuperAdmin' && (
            <div>
              <div>
              <p className={`${expireColor} text-gray-600 font-bold text-2xl text-right`}>
                {expireDate !== null ? expireDate : "Loading..."}
              </p>
                <CollectionCounts />
              </div>
              {/* Access Requests Section */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-slate-600 dark:text-slate-200 border dark:border-none rounded-lg shadow-md ">
                  <h3 className="text-gray-600 dark:text-slate-200 text-lg mb-4">Pending Requests</h3>
                  <PendingRequests />
                </div>
                {/* Messages */}
                <div className="p-6 bg-white dark:bg-slate-600 dark:text-slate-200 border dark:border-none rounded-lg shadow-md">
                  <Messages />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;