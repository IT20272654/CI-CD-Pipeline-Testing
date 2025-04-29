import { useState } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { BrowserRouter as Router } from 'react-router-dom';
import { LockClosedIcon, FingerPrintIcon, UserGroupIcon, ChartBarIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [admins, setAdmins] = useState([{ firstName: '', lastName: '', email: '' }]);

  const handleChange = (e, index, field) => {
    const value = e.target.value;

    if (field === 'companyName') {
      setCompanyName(value);
    } else if (field === 'address') {
      setAddress(value);
    } else if (field === 'adminFirstName') {
      const updatedAdmins = [...admins];
      updatedAdmins[index].firstName = value;
      setAdmins(updatedAdmins);
    } else if (field === 'adminLastName') {
      const updatedAdmins = [...admins];
      updatedAdmins[index].lastName = value;
      setAdmins(updatedAdmins);
    } else if (field === 'adminEmail') {
      const updatedAdmins = [...admins];
      updatedAdmins[index].email = value;
      setAdmins(updatedAdmins);
    }
  };

  const features = [
    { icon: FingerPrintIcon, title: "Face Recognition", desc: "Biometric authentication for secure entry" },
    { icon: UserGroupIcon, title: "Role-Based Access", desc: "Multi-level admin controls" },
    { icon: LockClosedIcon, title: "Automated Permissions", desc: "Schedule access by time/location" },
    { icon: ChartBarIcon, title: "Audit Logs", desc: "Real-time entry/exit tracking" },
    { icon: DevicePhoneMobileIcon, title: "Mobile App", desc: "Manage access remotely" }
  ];

  const testimonials = [
    { text: "Reduced our security costs by 40%", author: "Tech Corp CIO" },
    { text: "Most reliable access system we've used", author: "SecureCo CTO" }
  ];

  const handleAddAdmin = () => {
    setAdmins([...admins, { firstName: '', lastName: '', email: '' }]);
  };

  const validateAdmins = () => {
    return admins.every(admin => admin.firstName && admin.lastName && admin.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateAdmins()) {
      alert("All admin fields must be filled out.");
      return;
    }
  
    const data = { name: companyName, address, admins };
    console.log("Payload being sent to backend:", data);
  
    try {
      const response = await axios.post('api/guest/create-company-request', data, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      console.log('Response:', response.data);
      alert(response.data.message || "Company created successfully!");
    } catch (error) {
      console.error('Error creating company:', error.response || error);
      const errorMsg = error.response ? error.response.data.error || error.response.data.message : 'Something went wrong!';
      alert(`Error: ${errorMsg}`);
    }
    setIsSubmitting(true);
  };
  
  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">SecurePass</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link to="#features" className="text-gray-700 hover:text-blue-600">Features</Link>
                <Link to="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</Link>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modernize Door Access with AI Security
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automate building access with facial recognition and centralized control for enterprises
            </p>
            <div className="flex justify-center space-x-4">
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg hover:bg-blue-50">
                Watch Demo
              </button>
            </div>
            {/* Replace the existing image preview with this video player */}
            <div className="mt-12 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <video 
              autoPlay
              muted
              loop
              playsInline
              className="rounded-lg w-full h-auto"
            >
              <source src="/videos/sltvideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Enterprise-Grade Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request Form Section */}
        <section className="bg-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started in 3 Minutes</h2>
            <p className="text-blue-200">Set up your company's secure access system today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                id="companyName"
                placeholder="Company Name"
                className="p-3 rounded-lg bg-blue-800 border border-blue-700"
                required
                value={companyName}
                onChange={(e) => handleChange(e, 0, 'companyName')}
              />
              <input
                type="text"
                id="address"
                placeholder="Company Address"
                value={address}
                onChange={(e) => handleChange(e, 0, 'address')}
                className="p-3 rounded-lg bg-blue-800 border border-blue-700"
                required
              />
            </div>

            {/* Admin Details */}
            {admins.map((admin, index) => (
              <div key={index} className="bg-blue-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Admin {index + 1} Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="p-3 rounded-lg bg-blue-700 border border-blue-600"
                    required
                    value={admin.firstName}
                    onChange={(e) => handleChange(e, index, 'adminFirstName')}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="p-3 rounded-lg bg-blue-700 border border-blue-600"
                    required
                    value={admin.lastName}
                    onChange={(e) => handleChange(e, index, 'adminLastName')}
                  />
                  <input
                    type="email"
                    placeholder="Admin Email"
                    className="p-3 rounded-lg bg-blue-700 border border-blue-600"
                    required
                    value={admin.email}
                    onChange={(e) => handleChange(e, index, 'adminEmail')}
                  />
                </div>
              </div>
            ))}
            <button
            type="button"
            onClick={handleAddAdmin}
            className="bg-blue-500 text-white p-2 rounded-md mt-4"
          >
            Add More Admins
          </button>
            {/* Demo Request Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-600"
                //onChange={(e) => setFormData({...formData, requestDemo: e.target.checked})}
              />
              <span>Request a personalized demo</span>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-4 rounded-lg font-semibold transition-colors`}
            >
              {isSubmitting ? 'Submitting...' : 'Request Access'}
            </button>
            
            <p className="text-center text-blue-200 text-sm">
              We comply with GDPR regulations. Your data is 100% secure.
            </p>
          </form>
        </div>
      </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">SecureAccess Pro</h3>
                <p className="text-sm">Enterprise door access automation platform</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                  <li><a href="#" className="hover:text-white">GDPR</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
              © 2024 SecureAccess Pro. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
  );
}