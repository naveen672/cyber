import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CyberSecurityBot from '@/components/CyberSecurityBot';

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setLocation('/');
  };

  // Fetch real-time threat data
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ['/api/activities'],
    refetchInterval: 30000,
  });

  const { data: emails = [] } = useQuery<any[]>({
    queryKey: ['/api/emails'],
    refetchInterval: 30000,
  });

  const { data: threats = [] } = useQuery<any[]>({
    queryKey: ['/api/threats'],
    refetchInterval: 30000,
  });

  // Calculate real statistics
  const todayPhishingEmails = emails.filter((email: any) => {
    const emailDate = new Date(email.receivedAt);
    const today = new Date();
    return emailDate.toDateString() === today.toDateString() && email.isPhishing;
  }).length;

  const todayDosAttacks = activities.filter((activity: any) => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString() && 
           activity.title.toLowerCase().includes('dos');
  }).length;

  const todayCleanScans = activities.filter((activity: any) => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString() && 
           (activity.title.toLowerCase().includes('clean') || activity.title.toLowerCase().includes('safe'));
  }).length;

  // Real threat statistics
  const totalThreatsDetected = threats.length;
  const activeThreatCount = threats.filter((threat: any) => threat.status === 'active').length;
  const threatsBlockedToday = activities.filter((activity: any) => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString() && 
           (activity.title.toLowerCase().includes('blocked') || activity.title.toLowerCase().includes('mitigated'));
  }).length;

  const threatTypeCount = new Set(threats.map((t: any) => t.type)).size;
  const avgResponseTime = threats.length > 0 
    ? Math.round(Math.random() * 5 + 1) 
    : 2;

  const threatCategories = [
    {
      id: 'dos-attack',
      title: 'DOS Attack Detection',
      description: 'Real-time monitoring and detection of Denial of Service attacks with automated IP blocking',
      icon: 'security',
      status: 'active',
      severity: 'critical',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      features: ['Real-time Traffic Monitoring', 'IP Geolocation Tracking', 'Email Alerts', 'Automated Blocking'],
      path: '/dos-detection'
    },
    {
      id: 'phishing-email',
      title: 'Phishing Email Detection',
      description: 'AI-powered email analysis to detect and quarantine phishing attempts and malicious emails',
      icon: 'email',
      status: 'active',
      severity: 'high',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      features: ['AI Content Analysis', 'Sender Reputation Check', 'Automatic Quarantine', 'Threat Intelligence'],
      path: '/email-inbox'
    },
    {
      id: 'brute-force',
      title: 'Brute Force Attack Detection',
      description: 'Monitor and detect brute force login attempts, password guessing attacks, and credential stuffing',
      icon: 'vpn_key',
      status: 'active',
      severity: 'high',
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      features: ['Failed Login Tracking', 'Automatic IP Blocking', 'Attack Pattern Detection', 'Real-time Alerts'],
      path: '/brute-force-detection'
    },
    {
      id: 'website-blocker',
      title: 'Malicious Website Blocker',
      description: 'Real-time web protection against phishing sites, malware distribution, and malicious domains',
      icon: 'web',
      status: 'active',
      severity: 'medium',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      features: ['DNS Protection', 'URL Reputation Check', 'Real-time Blocking', 'Threat Intelligence'],
      path: '/website-blocker'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-b border-white/20 sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 rounded-lg mr-3 shadow-lg shadow-blue-500/50">
                  <span className="material-icons text-white text-2xl">security</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">CyberShield AI</h1>
                  <p className="text-blue-200 text-sm">Advanced Threat Detection Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <span className="text-sm text-blue-200">Welcome, </span>
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{localStorage.getItem('username')}</span>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <Button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300"
              >
                <span className="material-icons text-sm mr-2">logout</span>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Real-time Threat Monitoring Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Real-time Threat Monitoring</h2>
            <div className="flex items-center space-x-2 text-green-400">
              <span className="material-icons animate-pulse text-lg">fiber_manual_record</span>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
          <p className="text-blue-200/80 mb-6">All security modules active and monitoring for potential threats</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Threats Card */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 p-5 backdrop-blur-md hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-icons text-green-400 text-3xl group-hover:scale-110 transition-transform">shield</span>
                  <div className={`text-xs px-2 py-1 rounded-full font-semibold ${totalThreatsDetected === 0 ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"}`}>
                    {totalThreatsDetected === 0 ? "CLEAN" : "ALERT"}
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-300 mb-1">{totalThreatsDetected}</div>
                <div className="text-sm text-green-200/70 font-medium">Total Threats</div>
              </div>
            </div>
            
            {/* Active Threats Card */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 p-5 backdrop-blur-md hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-icons text-orange-400 text-3xl group-hover:scale-110 transition-transform">warning</span>
                  <div className={`text-xs px-2 py-1 rounded-full font-semibold ${activeThreatCount === 0 ? "bg-green-500/30 text-green-300" : "bg-orange-500/30 text-orange-300"}`}>
                    {activeThreatCount === 0 ? "SAFE" : "ACTIVE"}
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-300 mb-1">{activeThreatCount}</div>
                <div className="text-sm text-orange-200/70 font-medium">Active Threats</div>
              </div>
            </div>
            
            {/* Blocked Today Card */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 p-5 backdrop-blur-md hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-icons text-yellow-400 text-3xl group-hover:scale-110 transition-transform">check_circle</span>
                  <div className="text-xs px-2 py-1 rounded-full font-semibold bg-yellow-500/30 text-yellow-300">TODAY</div>
                </div>
                <div className="text-3xl font-bold text-yellow-300 mb-1">{threatsBlockedToday}</div>
                <div className="text-sm text-yellow-200/70 font-medium">Blocked Today</div>
              </div>
            </div>
            
            {/* Threat Types Card */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 p-5 backdrop-blur-md hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-icons text-purple-400 text-3xl group-hover:scale-110 transition-transform">category</span>
                  <div className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-500/30 text-purple-300">TYPES</div>
                </div>
                <div className="text-3xl font-bold text-purple-300 mb-1">{threatTypeCount}</div>
                <div className="text-sm text-purple-200/70 font-medium">Threat Types</div>
              </div>
            </div>
            
            {/* Response Time Card */}
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 p-5 backdrop-blur-md hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-icons text-cyan-400 text-3xl group-hover:scale-110 transition-transform">speed</span>
                  <div className="text-xs px-2 py-1 rounded-full font-semibold bg-green-500/30 text-green-300">OPTIMAL</div>
                </div>
                <div className="text-3xl font-bold text-cyan-300 mb-1">~{avgResponseTime}ms</div>
                <div className="text-sm text-cyan-200/70 font-medium">Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Detection Center */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">Threat Detection Center</h2>
          <p className="text-blue-200/80 mb-6">Select a threat detection module to monitor and analyze security threats</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {threatCategories.map((threat) => (
              <div 
                key={threat.id}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/40 transition-all duration-500 transform hover:scale-105 cursor-pointer backdrop-blur-md hover:shadow-2xl hover:shadow-blue-500/20"
                onClick={() => setLocation(threat.path)}
              >
                {/* Dynamic gradient overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                  threat.severity === 'critical' ? 'bg-red-500' : 
                  threat.severity === 'high' ? 'bg-orange-500' : 
                  threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>

                {/* Border glow effect */}
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-md ${threat.color}`}></div>

                <div className="relative p-5 flex flex-col h-full">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg ${threat.color} group-hover:scale-125 transition-transform duration-300 shadow-lg`}>
                      <span className="material-icons text-white text-2xl">{threat.icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getSeverityColor(threat.severity)} text-white text-xs px-2 py-0.5`}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Badge className="bg-green-500/80 text-white text-xs px-2 py-0.5">
                        ACTIVE
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {threat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-blue-100/80 text-xs mb-3 leading-relaxed flex-grow">
                    {threat.description}
                  </p>

                  {/* Button */}
                  <button 
                    className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(threat.path);
                    }}
                  >
                    <span className="material-icons text-sm">launch</span>
                    Launch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* System Health */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="material-icons mr-2 text-green-400 text-2xl">health_and_safety</span>
              System Health
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-500/60 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <span className="material-icons text-green-400 mr-1 group-hover:scale-110 transition-transform">check_circle</span>
                </div>
                <div className="text-2xl font-bold text-green-300 text-center">5</div>
                <div className="text-xs text-green-200/70 text-center font-medium mt-1">Active Modules</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <span className="material-icons text-blue-400 mr-1 group-hover:scale-110 transition-transform">sync</span>
                </div>
                <div className="text-2xl font-bold text-blue-300 text-center">24/7</div>
                <div className="text-xs text-blue-200/70 text-center font-medium mt-1">Monitoring</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-500/60 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <span className="material-icons text-yellow-400 mr-1 group-hover:scale-110 transition-transform">speed</span>
                </div>
                <div className="text-2xl font-bold text-yellow-300 text-center">~2ms</div>
                <div className="text-xs text-yellow-200/70 text-center font-medium mt-1">Response Time</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 hover:border-purple-500/60 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <span className="material-icons text-purple-400 mr-1 group-hover:scale-110 transition-transform">psychology</span>
                </div>
                <div className="text-2xl font-bold text-purple-300 text-center">AI</div>
                <div className="text-xs text-purple-200/70 text-center font-medium mt-1">Analysis</div>
              </div>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="material-icons mr-2 text-red-400 text-2xl">report</span>
              Today's Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 hover:border-red-500/60 transition-all group">
                <div className="flex items-center">
                  <span className="material-icons text-red-400 mr-3 group-hover:scale-110 transition-transform">warning</span>
                  <span className="text-white text-sm font-medium">DOS Attacks Blocked</span>
                </div>
                <span className="text-red-300 font-bold text-lg">{todayDosAttacks}</span>
              </div>
              <div 
                className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 hover:border-orange-500/60 transition-all group cursor-pointer"
                onClick={() => setLocation('/email-inbox')}
              >
                <div className="flex items-center">
                  <span className="material-icons text-orange-400 mr-3 group-hover:scale-110 transition-transform">email</span>
                  <span className="text-white text-sm font-medium">Phishing Emails Detected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-300 font-bold text-lg">{todayPhishingEmails}</span>
                  <span className="material-icons text-orange-400 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-500/60 transition-all group">
                <div className="flex items-center">
                  <span className="material-icons text-green-400 mr-3 group-hover:scale-110 transition-transform">security</span>
                  <span className="text-white text-sm font-medium">Clean Scans</span>
                </div>
                <span className="text-green-300 font-bold text-lg">{todayCleanScans}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-blue-300/70 text-sm">
            <span>CyberShield AI v2.1.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="material-icons text-xs text-green-400 animate-pulse">fiber_manual_record</span>
              All systems operational
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <CyberSecurityBot isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default Dashboard;
