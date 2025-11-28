import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ThreatDashboard = () => {
  const [, setLocation] = useLocation();

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
      id: 'usb-scanner',
      title: 'USB Device Scanner',
      description: 'Comprehensive malware scanning for connected USB devices and removable storage',
      icon: 'usb',
      status: 'active',
      severity: 'high',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      features: ['Deep File Scanning', 'Malware Detection', 'Autorun Protection', 'Device Quarantine'],
      path: '/usb-scanner'
    },
    {
      id: 'network-intrusion',
      title: 'Network Intrusion Detection',
      description: 'Advanced monitoring for unauthorized access attempts and network-based attacks',
      icon: 'network_check',
      status: 'active',
      severity: 'critical',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      features: ['Traffic Analysis', 'Behavioral Detection', 'Port Scanning Detection', 'Real-time Response'],
      path: '/network-intrusion'
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setLocation('/');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <span className="material-icons text-white text-2xl">security</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CyberShield AI</h1>
                <p className="text-blue-200 text-sm">Advanced Threat Detection Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setLocation('/dashboard')}
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <span className="material-icons text-sm mr-2">dashboard</span>
                Full Dashboard
              </Button>
              <div className="text-white">
                <span className="text-sm text-blue-200">Welcome, </span>
                <span className="font-medium">{localStorage.getItem('username')}</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <span className="material-icons text-sm mr-2">logout</span>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Threat Detection Center</h2>
          <p className="text-blue-200">Select a threat detection module to monitor and analyze security threats</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threatCategories.map((threat) => (
            <Card 
              key={threat.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden glow-blue"
              onClick={() => setLocation(threat.path)}
            >
              {/* Card glow effect based on severity */}
              <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${
                threat.severity === 'critical' ? 'bg-red-500' : 
                threat.severity === 'high' ? 'bg-orange-500' : 
                threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${threat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-icons text-white text-2xl">{threat.icon}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getSeverityColor(threat.severity)} text-white text-xs`}>
                      {threat.severity.toUpperCase()}
                    </Badge>
                    <Badge className="bg-green-500 text-white text-xs">
                      {threat.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4 group-hover:text-blue-200 transition-colors">
                  {threat.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  {threat.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <h4 className="text-white font-medium text-sm">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {threat.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-blue-200">
                        <span className="material-icons text-xs mr-1 text-green-400">check_circle</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(threat.path);
                  }}
                >
                  <span className="material-icons text-sm mr-2">launch</span>
                  Open Detection Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 glow-green">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="material-icons mr-2 text-green-400">health_and_safety</span>
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-center mb-2">
                    <span className="material-icons text-green-400 mr-1">check_circle</span>
                    <div className="text-2xl font-bold text-green-400">5</div>
                  </div>
                  <div className="text-sm text-green-200">Active Modules</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-center mb-2">
                    <span className="material-icons text-blue-400 mr-1">sync</span>
                    <div className="text-2xl font-bold text-blue-400">24/7</div>
                  </div>
                  <div className="text-sm text-blue-200">Monitoring</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-center mb-2">
                    <span className="material-icons text-yellow-400 mr-1">speed</span>
                    <div className="text-2xl font-bold text-yellow-400">~2ms</div>
                  </div>
                  <div className="text-sm text-yellow-200">Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-center mb-2">
                    <span className="material-icons text-purple-400 mr-1">psychology</span>
                    <div className="text-2xl font-bold text-purple-400">AI</div>
                  </div>
                  <div className="text-sm text-purple-200">Analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border border-white/10 glow-red">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="material-icons mr-2 text-red-400">report</span>
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center">
                    <span className="material-icons text-red-400 mr-2">warning</span>
                    <span className="text-white text-sm">DOS Attacks Blocked</span>
                  </div>
                  <span className="text-red-400 font-bold">{todayDosAttacks}</span>
                </div>
                <div 
                  className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-all"
                  onClick={() => setLocation('/email-inbox')}
                >
                  <div className="flex items-center">
                    <span className="material-icons text-orange-400 mr-2">email</span>
                    <span className="text-white text-sm">Phishing Emails Detected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400 font-bold">{todayPhishingEmails}</span>
                    <span className="material-icons text-orange-400 text-sm">arrow_forward</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center">
                    <span className="material-icons text-green-400 mr-2">security</span>
                    <span className="text-white text-sm">Clean Scans</span>
                  </div>
                  <span className="text-green-400 font-bold">{todayCleanScans}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThreatDashboard;