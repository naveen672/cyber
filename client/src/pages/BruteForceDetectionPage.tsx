import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BruteForceDetector from '@/components/BruteForceDetector';

const BruteForceDetectionPage = () => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <span className="material-icons mr-2">arrow_back</span>
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg mr-3">
                  <span className="material-icons text-white text-2xl">vpn_key</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Brute Force Detection</h1>
                  <p className="text-cyan-200 text-sm">Monitor and block credential attack attempts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Attacks Blocked</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-1">847</p>
                </div>
                <span className="material-icons text-4xl text-cyan-500 opacity-20">block</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">IPs Blacklisted</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">34</p>
                </div>
                <span className="material-icons text-4xl text-orange-500 opacity-20">dangerous</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Detection Rate</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">99.8%</p>
                </div>
                <span className="material-icons text-4xl text-green-500 opacity-20">check_circle</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Detector */}
        <BruteForceDetector />

        {/* Details */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-100">
            <div className="flex items-start space-x-4">
              <Badge className="bg-cyan-500 text-white">1</Badge>
              <div>
                <h3 className="font-semibold text-white">Monitor Failed Logins</h3>
                <p className="text-sm">System tracks all failed authentication attempts across all accounts.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Badge className="bg-cyan-500 text-white">2</Badge>
              <div>
                <h3 className="font-semibold text-white">Identify Attack Patterns</h3>
                <p className="text-sm">Detects suspicious patterns like rapid successive attempts from same IP.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Badge className="bg-cyan-500 text-white">3</Badge>
              <div>
                <h3 className="font-semibold text-white">Automatic Response</h3>
                <p className="text-sm">Blocks attacker IPs, locks accounts, and sends immediate alerts.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Badge className="bg-cyan-500 text-white">4</Badge>
              <div>
                <h3 className="font-semibold text-white">Detailed Reporting</h3>
                <p className="text-sm">Generates comprehensive reports for security team analysis.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BruteForceDetectionPage;
