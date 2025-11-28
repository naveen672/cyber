import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="material-icons text-white text-sm">shield</span>
              </div>
              <h3 className="text-white font-bold">CyberShield AI</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Advanced threat detection and cybersecurity platform powered by AI-driven intelligence.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Security Modules</h4>
            <ul className="space-y-2">
              <li><a href="/dos-detection" className="text-slate-400 hover:text-cyan-400 text-sm transition">DOS Detection</a></li>
              <li><a href="/email-inbox" className="text-slate-400 hover:text-cyan-400 text-sm transition">Email Security</a></li>
              <li><a href="/brute-force-detection" className="text-slate-400 hover:text-cyan-400 text-sm transition">Brute Force Detection</a></li>
              <li><a href="/website-blocker" className="text-slate-400 hover:text-cyan-400 text-sm transition">Website Blocker</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Contact Support</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Security Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition">Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700"></div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm">
            <p>&copy; {currentYear} CyberShield AI. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-slate-400 text-xs">🔒 Enterprise Security</span>
            <span className="text-slate-400 text-xs">✓ ISO 27001 Compliant</span>
            <span className="text-slate-400 text-xs">🛡️ Military-Grade Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
