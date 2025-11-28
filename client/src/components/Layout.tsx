import React from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const pageTitle = getPageTitle(location);
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 border-b border-slate-700 py-4 px-6 flex items-center justify-between shadow-lg">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {pageTitle.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{pageTitle.subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative group cursor-pointer">
              <span className="material-icons text-slate-400 hover:text-cyan-400 transition-colors text-2xl">
                notifications
              </span>
              <span className="absolute top-1 right-0 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 border border-slate-700 p-3">
                <p className="text-slate-400 text-xs">No new alerts</p>
              </div>
            </div>
            
            {/* Help */}
            <div className="relative group cursor-pointer">
              <span className="material-icons text-slate-400 hover:text-cyan-400 transition-colors text-2xl">
                help_outline
              </span>
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 border border-slate-700 p-3">
                <p className="text-white text-xs font-semibold mb-2">Need Help?</p>
                <p className="text-slate-400 text-xs">Contact support or view documentation</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="material-icons text-white text-sm">person</span>
                </div>
                <span className="text-slate-400 text-sm hidden sm:block">{username}</span>
                <span className="material-icons text-slate-400 text-sm">expand_more</span>
              </div>
              
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 border border-slate-700 overflow-hidden">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-white text-sm font-semibold">{username}</p>
                  <p className="text-slate-400 text-xs">{localStorage.getItem('userEmail') || 'user@cybershield.ai'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors text-sm flex items-center"
                >
                  <span className="material-icons text-sm mr-2">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

function getPageTitle(location: string): { title: string; subtitle: string } {
  switch (true) {
    case location === "/dashboard":
      return {
        title: "Security Dashboard",
        subtitle: "Real-time threat monitoring and analysis",
      };
    case location === "/dos-detection":
      return {
        title: "DOS Attack Detection",
        subtitle: "Monitor and detect denial of service attacks",
      };
    case location === "/email-inbox":
      return {
        title: "Email Security",
        subtitle: "Phishing detection and email analysis",
      };
    case location === "/brute-force-detection":
      return {
        title: "Brute Force Detection",
        subtitle: "Password strength analyzer and attack prevention",
      };
    case location === "/website-blocker":
      return {
        title: "Malicious Website Blocker",
        subtitle: "Real-time web protection and security analysis",
      };
    case location === "/settings":
      return {
        title: "Account Settings",
        subtitle: "Manage your account, security, and preferences",
      };
    case location.startsWith("/threat/"):
      return {
        title: "Threat Details",
        subtitle: "Comprehensive threat analysis and mitigation",
      };
    default:
      return {
        title: "CyberShield AI",
        subtitle: "AI-Powered Cyber Threat Detection System",
      };
  }
}

export default Layout;
