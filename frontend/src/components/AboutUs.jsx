import React from 'react';
import { useNavigate } from "react-router-dom";
import { GoChevronLeft } from "react-icons/go";
import logo from "../assets/logo-round.png";
import img1 from "../assets/Our Group/Chathura_Dissanayake.jpg";
import img2 from "../assets/Our Group/Yoosuf_Aathil.jpg";
import img3 from "../assets/Our Group/Shavindu_Rajapaksha.jpg";
import img4 from "../assets/Our Group/Mohamed_Afraar.jpg";
import img5 from "../assets/Our Group/Rashmi_Kavindya.jpeg";
import nodp from "../assets/Our Group/no-dp.jpg";
import img6 from "../assets/Our Group/Malisha_Sandeep.jpeg";
import img7 from "../assets/Our Group/Supipi_Jayasinghe.jpeg";

const AboutUs = () => {
  const navigate = useNavigate();
  const handleBackNavigation = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div>
      <div className="title flex items-center space-x-2 mb-8 dark:text-white">
        <GoChevronLeft className="cursor-pointer" onClick={handleBackNavigation} />
        <span className="font-semibold dark:text-white">About us</span>
      </div>

      <div className="flex justify-center mb-6">
        <img src={logo} alt="Logo" className="h-40" />
      </div>

      <p className="text-gray-600 text-sm mb-6 dark:text-slate-200 text-justify">
        Welcome to <span className="font-semibold">SecurePass AI</span>, an innovative room access solution designed to simplify and modernize access management for enterprises and companies. Say goodbye to the hassle of physical keycards. With our system, users can unlock doors using their mobile devices by scanning a QR code and verifying their identity through facial recognition.
      </p>

      <h2 className="text-lg font-semibold text-gray-800 mb-3 dark:text-slate-100">Our Mission</h2>
      <p className="text-gray-600 mb-6 text-sm dark:text-slate-200 text-justify">
        To revolutionize room access management by providing businesses with a hassle-free, efficient, and modern solution that promotes smooth workflows and eliminates the need for physical tools.
      </p>

      <h2 className="text-lg font-semibold text-gray-800 mb-3 dark:text-slate-100">Our Vision</h2>
      <p className="text-gray-600 mb-6 text-sm dark:text-slate-200 text-justify">
        Our mission is to deliver a secure, user-friendly, and efficient room access system that simplifies access management for enterprises. By integrating QR code and facial recognition technology, we aim to help Sri Lankan businesses enhance workplace security, streamline daily operations, and transition to a more modern and digital approach, reducing the dependence on physical tools.
      </p>

      <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-slate-100">Meet Our Team</h3>

      {/* First Row */}
      <div className="flex justify-center space-x-4 mt-6">
        {[{ img: img1, name: "Chathura Dissanayake", link: "https://www.linkedin.com/in/chathura-dissanayake/" },
          { img: img3, name: "Shavindu Rajapaksha", link: "http://www.linkedin.com/in/shavindu-rajapaksha-953007223" },
          { img: img2, name: "Yoosuf Aathil", link: "https://www.linkedin.com/in/yoosuf-aathil/" },
          { img: img4, name: "Mohamed Afraar", link: "https://www.linkedin.com/in/mohamed-afraar/" }].map((dev, index) => (
            <div key={index} className="text-center">
              <img src={dev.img} alt={dev.name} className="w-36 h-36 object-cover rounded-md shadow-md" />
              <a href={dev.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-gray-500 hover:underline text-xs">
                {dev.name}
              </a>
            </div>
          ))
        }
      </div>

      {/* Second Row */}
      <div className="flex justify-center space-x-4 mt-6">
        {[{ img: img6, name: "Malisha Sandeep", link: "" },
          { img: nodp, name: "Ravindu Rashmika", link: "https://www.linkedin.com/in/ravindukarunarathne/" },
          { img: img5, name: "Rashmi Kavindya", link: "https://lk.linkedin.com/in/rashmi-kavindya-8a8a4225b" },
          { img: img7, name: "Supipi Jayasinghe", link: "" }].map((dev, index) => (
            <div key={index} className="text-center">
              <img src={dev.img} alt={dev.name} className="w-36 h-36 object-cover rounded-md shadow-md" />
              <a href={dev.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-gray-500 hover:underline text-xs">
                {dev.name}
              </a>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default AboutUs;
