import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = ["about", "how it works"];

  return (
    <nav className="mb-6 space-x-4 text-md justify-around flex flex-row">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize px-3 py-3 ease-in ${
            activeTab === tab ? "border-b-1" : " hover:cursor-pointer"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
