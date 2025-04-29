import React, { useEffect, useState } from "react";
import axios from "axios";
import { Payhere, AccountCategory } from "@payhere-js-sdk/client";
import md5 from "crypto-js/md5";
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const { packageName, price, companyId } = location.state || {};
  const token = localStorage.getItem('token');

  // State for the unique payment id and checkout attributes
  const [payId, setPayId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutAttributes, setCheckoutAttributes] = useState({
    returnUrl: "http://localhost:3000/notify",
    cancelUrl: "http://localhost:3000/notify",
    notifyUrl: "http://localhost:3000/notify",
    order_id: "",
    items: packageName || "",
    currency: "LKR",
    amount: price || "",
    merchant_id: 1226643, // Replace with your merchant ID
    merchant_secret:
      "MjM3ODE4NDE0MzU5NzQ4NTM4MzI4NTAzMTE3NjUyODA1MzY4MjIw", // Replace with your merchant secret
    hash: "",
  });

  // State for customer details that will be manually entered
  const [customerAttributes, setCustomerAttributes] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    city: "",
  });

  // PayHere Initialization
  useEffect(() => {
    Payhere.init(checkoutAttributes.merchant_id, AccountCategory.SANDBOX);
  }, [checkoutAttributes.merchant_id]);

  // Unique Payment ID Generation
  const generateUniqueId = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/payment/generateid', {
        headers: { Authorization: `Bearer ${token}` },
      }); // Ensure correct endpoint
      console.log('Generated Order ID:', response.data.uniquePaymentId);
      // Verify response structure matches your backend
      if (!response.data?.uniquePaymentId) {
        throw new Error('Invalid order ID format from server');
      }

      const backendOrderId = response.data.uniquePaymentId;
      
      // Update both payId and checkoutAttributes
      setPayId(backendOrderId);
      setCheckoutAttributes(prev => ({
        ...prev,
        order_id: backendOrderId
      }));

    } catch (error) {
      console.error('Order ID fetch failed:', error);
      // Fallback mechanism
      const fallbackId = Date.now().toString() + Math.floor(100 + Math.random() * 900);
      setPayId(fallbackId);
      setCheckoutAttributes(prev => ({
        ...prev,
        order_id: fallbackId
      }));
      // Show error to user
      setError('Failed to get server-generated ID. Using temporary identifier.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateUniqueId();
  }, []);

  useEffect(() => {
    generateUniqueId();
  }, []);

  // Hash Calculation for Payment Security
  useEffect(() => {
    if (!checkoutAttributes.amount || !payId) return;
    // Format the amount as a float with 2 decimals (without commas)
    const amountFormatted = parseFloat(checkoutAttributes.amount)
      .toLocaleString("en-US", { minimumFractionDigits: 2 })
      .replaceAll(",", "");
    // Hash the merchant secret first
    const hashedSecret = md5(checkoutAttributes.merchant_secret)
      .toString()
      .toUpperCase();
    const hash = md5(
      checkoutAttributes.merchant_id +
        checkoutAttributes.order_id +
        amountFormatted +
        checkoutAttributes.currency +
        hashedSecret
    )
      .toString()
      .toUpperCase();
    setCheckoutAttributes((prev) => ({
      ...prev,
      hash: hash,
    }));
  }, [
    checkoutAttributes.merchant_id,
    checkoutAttributes.order_id,
    checkoutAttributes.amount,
    checkoutAttributes.currency,
    checkoutAttributes.merchant_secret,
    payId,
  ]);

  // Form input handler for customer details and manual checkout inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Payment submission function
  const addPayment = async () => {
    try {
      setIsLoading(true);
      await axios.post("api/payment/", {
        paymentID: payId,
        companyId: companyId,
        amount: checkoutAttributes.amount,
        currency: checkoutAttributes.currency,
        paymentMethod: "Payhere",
        billingFirstName: customerAttributes.first_name,
        billingLastName: customerAttributes.last_name,
        billingPhone: customerAttributes.phone,
        billingEmail: customerAttributes.email,
        billingAddress: customerAttributes.address,
        billingCity: customerAttributes.city,
        billingCountry: customerAttributes.country,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    console.log("Payment added successfully");
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission. This will post payment details and then let PayHere process the checkout.
  const handleSubmit = (e) => {
    e.preventDefault();
    addPayment();
    // The form action will redirect to PayHere's checkout
    e.target.submit();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* SecurePass AI Navigation Bar */}

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-800 text-white py-4 px-6">
              <h2 className="text-xl font-semibold">Payment Details</h2>
            </div>
            <form
              method="post"
              action="https://sandbox.payhere.lk/pay/checkout"
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Hidden inputs required by PayHere */}
              <input
                type="hidden"
                name="merchant_id"
                value={checkoutAttributes.merchant_id}
              />
              <input
                type="hidden"
                name="return_url"
                value={checkoutAttributes.returnUrl}
              />
              <input
                type="hidden"
                name="cancel_url"
                value={checkoutAttributes.cancelUrl}
              />
              <input
                type="hidden"
                name="notify_url"
                value={checkoutAttributes.notifyUrl}
              />
              <input
                type="hidden"
                name="order_id"
                value={checkoutAttributes.order_id}
              />
              <input
                type="hidden"
                name="currency"
                value={checkoutAttributes.currency}
              />
              <input
                type="hidden"
                name="hash"
                value={checkoutAttributes.hash}
              />

              {/* Display package name and amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Package Name</label>
                  <input
                    type="text"
                    name="items"
                    value={checkoutAttributes.items}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    name="amount"
                    value={checkoutAttributes.items == 'Starter' ? 5000 : checkoutAttributes.items == 'Essential' ? 8000 : checkoutAttributes.items == 'Premium' ? 80000 : 100000}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter address"
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-800 text-white py-4 px-6 rounded-md hover:bg-blue-900 transition-colors font-semibold text-lg flex justify-center items-center"
              >
                {isLoading ? "Processing..." : "Complete Payment"}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-8">
              <div className="bg-blue-800 text-white py-4 px-6">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-pulse h-6 w-6 rounded-full border-4 border-blue-800 border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">
        {checkoutAttributes.order_id || "Generating..."}
      </span>
                      </div>
                      <div className="flex justify-between pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Package Name:</span>
                        <span className="font-medium">{checkoutAttributes.items || "Not set"}</span>
                      </div>
                      <div className="flex justify-between pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">
                          {checkoutAttributes.amount = checkoutAttributes.items == 'Starter' ? 5000 : checkoutAttributes.items == 'Essential' ? 8000 : checkoutAttributes.items == 'Premium' ? 80000 : 100000
                            ? `${checkoutAttributes.amount} ${checkoutAttributes.currency}`
                            : "Not set"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-800 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-800 font-medium">Secure Payment</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Your payment information is encrypted and processed securely. 
                        We do not store your payment details.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;