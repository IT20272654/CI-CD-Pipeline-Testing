import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const { data } = await axios.get(`/api/payment/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCompany(data);

      } catch (error) {
        toast.error('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handlePaymentProceed = () => {
    if (!company) return;
    
    navigate('/checkout', {
      state: {
        companyId: company._id,
        packageName: company.package,
        price: company.payments?.[0]?.amount || 0 // Adjust based on your data structure
      }
    });
  };

 
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-700">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Payment Management
          </h2>
        </div>
        <main className="p-6 space-y-8 max-w-4xl mx-auto">
          {/* Company Status Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">
                {company ? `${company.name} Subscription` : 'No company data'}
              </h2>
              {company && (
                <span className={`px-4 py-2 rounded-full ${
                  company.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {company.status.toUpperCase()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
              <div>
                <p className="font-semibold">Current Package:</p>
                <p>{company?.package || 'No active package'}</p>
              </div>
              <div>
                <p className="font-semibold">Renewal Date:</p>
                <p>
                  {company?.expiredDate 
                    ? new Date(company.expiredDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold">Company Address:</p>
                <p>{company?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Registration Date:</p>
                <p>
                  {company?.createdAt 
                    ? new Date(company.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* Payment History Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {company?.payments?.map(payment => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        LKR {payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {payment.orderId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!company?.payments?.length && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No transaction history available
                </p>
              )}
            </div>
          </section>
          <div className="text-center">
            <button
              onClick={handlePaymentProceed}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Proceed to Payment
            </button>
          </div>
        </main>
      </div>

      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default Payment;