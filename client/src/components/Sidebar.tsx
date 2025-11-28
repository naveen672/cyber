import React from "react";
import { Link, useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();
  const username = localStorage.getItem('username') || 'Admin User';

  const menuItems = [
    { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
    { icon: "security", label: "DOS Detection", path: "/dos-detection" },
    { icon: "email", label: "Email Security", path: "/email-inbox" },
    { icon: "vpn_key", label: "Brute Force", path: "/brute-force-detection" },
    { icon: "web", label: "Website Blocker", path: "/website-blocker" },
    { icon: "settings", label: "Settings", path: "/settings" },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 w-16 md:w-64 flex flex-col border-r border-slate-700 shadow-lg">
      {/* Logo Section */}
      <div className="p-4 flex justify-center md:justify-start items-center space-x-3 border-b border-slate-700">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="material-icons text-white text-xl">shield</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-white text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CyberShield
          </h1>
          <p className="text-xs text-slate-400">AI Threat Detection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <span className="material-icons text-xl">{item.icon}</span>
                  <span className="hidden md:block ml-3 font-medium text-sm">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="material-icons text-white text-sm">person</span>
          </div>
          <div className="hidden md:block">
            <p className="text-white text-sm font-semibold truncate">{username}</p>
            <p className="text-slate-400 text-xs">Authenticated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
