/**
 * Site-wide navigation header displayed on all pages except the landing page.
 *
 * Why conditional rendering in App.tsx rather than here: The Header
 * doesn't know about routes — App.tsx decides visibility based on pathname.
 */

import { NavLink } from "react-router-dom";
import logo from "../assets/logo-2.png";

interface NavItem {
  name: string;
  path: string;
}

const NAV_LINKS: NavItem[] = [
  { name: "Create Note", path: "/create-note" },
  { name: "Your Notes", path: "/your-notes" },
];

const Header: React.FC = () => {
  return (
    <nav className="bg-[#D6C7F4] text-black font-montserrat md:px-10 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center space-y-2 md:justify-between">
        <NavLink
          to="/"
          id="head"
          className="text-3xl flex flex-row items-center font-medium"
        >
          <img
            src={logo}
            className="w-10 sm:w-10 rounded-md mr-2"
            alt="logo"
          />
          Wait For It
        </NavLink>

        <div className="flex flex-wrap justify-center space-x-10 text-center">
          {NAV_LINKS.map((link) => (
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
