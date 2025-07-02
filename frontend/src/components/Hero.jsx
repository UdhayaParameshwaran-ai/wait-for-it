import React from "react";
import logo from "../assets/logo.png";

const Hero = () => (
  <div className="flex items-center justify-center text-center px-6 min-h-screen">
    <div className="space-y-6 max-w-xl">
      <img src={logo} className="w-50 mx-auto" alt="logo" />
      <h1 className="text-4xl font-bold">Wait For It</h1>
      <p className="text-lg">
        Your secrets. <span className="text-purple-400">Locked tight.</span>{" "}
        Revealed just right.
      </p>
      <p className="text-lg md:text-xl px-2 md:px-8">
        Send a message they can’t open… until it’s time.
      </p>
      <button className="text-black bg-gradient-to-r from-[#6C1E9C] my-2 to-[#C287F5] hover:from-[#8146C1] hover:to-[#D6C7F4] transition duration-300 px-6 py-3 rounded-full shadow-md">
        Write a Secret Note
      </button>
    </div>
  </div>
);

export default Hero;
