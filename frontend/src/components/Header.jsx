import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo-2.png";

const Header = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Create Note", path: "/create-note" },
    { name: "Your Note", path: "/your-notes" },
    // { name: "View Note", path: "/note:id" },
  ];

  return (
    <nav className="bg-[#D6C7F4] text-black font-montserrat px-4 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo / App Name */}
        <NavLink to="/" className="text-3xl flex flex-row font-medium">
          <img src={logo} className="w-10 mx-2 rounded-md" alt="logo" />
          Wait For It
        </NavLink>

        {/* Navigation Links */}
        <div className="flex space-x-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-lg  text-black ${
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
