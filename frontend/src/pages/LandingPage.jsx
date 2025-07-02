import { useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Content from "../components/Content";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="h-screen w-screen font-montserrat flex">
      <div className="w-1/2 bg-[#14051E] text-[#D6C7F4] flex items-center justify-center">
        <Hero />
      </div>
      <div className="w-1/2 bg-[#D6C7F4] p-8 flex flex-col">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Content activeTab={activeTab} />
        <footer className="mt-10 text-xs absolute bottom-1 mx-20 px-10 border-t my-2 py-5 text-center opacity-80">
          Made with 💜 to protect your secrets · © 2025 Wait For It
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
