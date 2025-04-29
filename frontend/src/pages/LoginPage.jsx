import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaThumbsUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password, navigate);
    } catch (err) {
      console.error("Login failed:", err);
      if (err.response?.data?.error === 'Company is inactive. Cannot log in.') {
        setError("Your company's account is inactive. Please contact support.");
      } else if (err.response?.data?.error === 'Company subscription has expired. Cannot log in.') {
        setError("Company subscription has expired. Cannot log in.");
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-800">
      <div className="h-full w-full flex bg-white overflow-hidden">
        <div className="w-1/2 bg-gray-100 flex flex-col justify-center items-center p-6">
          <img src={logo} alt="Logo" className="w-60 h-60 " />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-6">Login into your account</p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full max-w-[350px]">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />

            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition"
            >
              Log In
            </button>
          </form>
        </div>

        <div className="w-1/2 relative">
          <img
            src="/login.png"
            alt="Smart Door"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-8 bg-white/60 backdrop-blur-lg rounded-lg p-4 flex items-center shadow-lg">
            <FaThumbsUp className="text-green-500 text-2xl mr-2" />
            <div>
              <h3 className="font-bold text-green-500">
                Smart Door Access System
              </h3>
              <p className="text-gray-600 text-sm">
                Today, we create innovative solutions to the challenges that
                consumers face in both their everyday lives and events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;