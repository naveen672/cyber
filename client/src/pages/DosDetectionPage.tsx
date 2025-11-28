import React from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import DosAttackDetector from '@/components/DosAttackDetector';

const DosDetectionPage = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Modern Header */}
      <div className="relative z-10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-b border-white/20 sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium mr-4 shadow-lg"
              >
                <span className="material-icons text-sm mr-2">arrow_back</span>
                Back
              </Button>
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mr-3 shadow-lg shadow-red-500/50">
                  <span className="material-icons text-white text-2xl">security</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">DOS Attack Detection</h1>
                  <p className="text-blue-200 text-sm">Real-time Network Traffic Analysis & IP Blocking</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <span className="text-sm text-blue-200">User: </span>
                <span className="font-semibold text-cyan-300">{localStorage.getItem('username')}</span>
              </div>
              <div className="text-xs text-blue-300">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DosAttackDetector />
      </div>
    </div>
  );
};

export default DosDetectionPage;