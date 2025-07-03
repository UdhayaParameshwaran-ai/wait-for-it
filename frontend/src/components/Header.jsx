import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo-2.png";

const Header = () => {
  const navLinks = [
    // { name: "Home", path: "/" },
    { name: "Create Note", path: "/create-note" },
    { name: "Your Notes", path: "/your-notes" },
    // { name: "View Note", path: "/note:id" },
  ];

  return (
    <nav className="bg-[#D6C7F4] text-black font-montserrat md:px-10 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap  items-center justify-center space-y-2 md:justify-between">
        {/* Logo / App Name */}
        <NavLink
          to="/"
          id="head"
          className="text-3xl flex flex-row items-center font-medium"
        >
          <img src={logo} className="w-10 sm:w-10 rounded-md mr-2" alt="logo" />
          Wait For It
        </NavLink>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center space-x-10 text-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-lg text-black ${
                  isActive ? "border-b-1" : "hover:cursor-pointer"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Header;
