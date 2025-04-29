import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState('pending');

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (!orderId) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payment/succes/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        });

        if (!response.ok) {
          throw new Error('Failed to update order status');
        }

        const data = await response.json();
        setOrderStatus(data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h1>
          <p className="text-gray-600">Invalid order reference. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Update Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-600">Your payment was successful but we failed to update the order status. Please contact support with your order ID: {orderId}</p>
          </>
        ) : (
          <>
            <div className="text-green-500 mx-auto flex items-center justify-center w-16 h-16 mb-4">
              <FaCheckCircle className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Thank you for your purchase!</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold text-gray-700">Order ID</p>
              <p className="text-gray-600 font-mono">{orderId}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Order Status: <span className="font-semibold capitalize">{orderStatus}</span>
              </p>
              <p className="text-sm text-gray-500">A confirmation email has been sent to your registered address.</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Need Help?</h3>
              <div className="flex justify-center space-x-6">
                <div className="flex items-center text-gray-500 hover:text-blue-600">
                  <FaEnvelope className="mr-2" />
                  <a href="mailto:support@example.com">Email Support</a>
                </div>
                <div className="flex items-center text-gray-500 hover:text-blue-600">
                  <FaPhoneAlt className="mr-2" />
                  <a href="tel:+11234567890">+1 (123) 456-7890</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;