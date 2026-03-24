/**
 * Landing page — the entry point for new visitors.
 *
 * Why split-screen layout: The left panel (Hero) draws attention with
 * the brand and CTA, while the right panel (Sidebar + Content) provides
 * context without overwhelming the visitor.
 */

import { useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Content from "../components/Content";

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="min-h-screen w-full font-montserrat flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-[#14051E] text-[#D6C7F4] flex items-center justify-center">
        <Hero />
      </div>

      <div className="w-full md:w-1/2 bg-[#D6C7F4] px-6 py-8 flex flex-col justify-between">
        <div>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <Content activeTab={activeTab} />
        </div>
        <footer className="mt-10 text-xs text-center opacity-80 pt-4">
          Made with 💜 to protect your secrets · © 2025 Wait For It
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
