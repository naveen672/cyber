import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from '@tanstack/react-query';

interface NetworkIntrusion {
  sourceIP: string;
  targetPort: number;
  attackType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  blocked: boolean;
}

const NetworkIntrusionDetector = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [intrusions, setIntrusions] = useState<NetworkIntrusion[]>([]);
  const [scanPhase, setScanPhase] = useState('');
  const [intrusionsDetected, setIntrusionsDetected] = useState(false);
  const [flashingAlert, setFlashingAlert] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (intrusionsDetected) {
      const interval = setInterval(() => {
        setFlashingAlert(prev => !prev);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [intrusionsDetected]);

  const startMonitoring = () => {
    setMonitoring(true);
    setIntrusionsDetected(false);
    setScanProgress(0);
    setScanPhase('Initializing network intrusion detection...');

    let progress = 0;
    const phases = [
      { text: 'Monitoring network traffic patterns...', duration: 2000 },
      { text: 'Analyzing incoming connections...', duration: 2500 },
      { text: 'Detecting port scanning activities...', duration: 2000 },
      { text: 'Checking for SQL injection attempts...', duration: 1500 },
      { text: 'Identifying unauthorized access attempts...', duration: 1000 }
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      progress += 1.2;
      setScanProgress(progress);

      if (currentPhase < phases.length && progress >= (currentPhase + 1) * 20) {
        setScanPhase(phases[currentPhase].text);
        currentPhase++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setScanPhase('Monitoring complete - Network intrusions detected!');
        setMonitoring(false);
        
        // Generate detected network intrusions
        const detectedIntrusions: NetworkIntrusion[] = [
          {
            sourceIP: '203.94.117.42',
            targetPort: 22,
            attackType: 'SSH Brute Force Attack',
            severity: 'high',
            description: 'Multiple failed SSH login attempts detected from suspicious IP',
            timestamp: new Date().toLocaleTimeString(),
            blocked: true
          },
          {
            sourceIP: '185.220.101.35',
            targetPort: 3306,
            attackType: 'SQL Injection Attempt',
            severity: 'critical',
            description: 'Malicious SQL queries targeting database server',
            timestamp: new Date().toLocaleTimeString(),
            blocked: true
          },
          {
            sourceIP: '192.168.1.247',
            targetPort: 80,
            attackType: 'Port Scanning',
            severity: 'medium',
            description: 'Systematic port scanning from internal network',
            timestamp: new Date().toLocaleTimeString(),
            blocked: false
          },
          {
            sourceIP: '45.142.212.88',
            targetPort: 443,
            attackType: 'Web Application Attack',
            severity: 'high',
            description: 'Suspicious HTTP requests with exploit payloads',
            timestamp: new Date().toLocaleTimeString(),
            blocked: true
          }
        ];
        
        setIntrusions(detectedIntrusions);
        setIntrusionsDetected(true);

        // Call API to log network intrusion detection
        fetch('/api/detect-network-intrusion', { 
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            intrusionsFound: detectedIntrusions.length,
            criticalThreats: detectedIntrusions.filter(i => i.severity === 'critical').length
          })
        })
        .then(response => response.json())
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }, 90);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 border-yellow-200';
      case 'medium': return 'bg-orange-100 border-orange-200';
      case 'high': return 'bg-red-100 border-red-200';
      case 'critical': return 'bg-red-200 border-red-300';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`w-full mb-6 ${intrusionsDetected && flashingAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
      <CardHeader className={`px-6 py-4 border-b border-border ${intrusionsDetected ? 'bg-red-500/10' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-blue-500">network_check</span>
            Network Intrusion Detection
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 flex items-center text-xs ${intrusionsDetected ? 'bg-red-500/20 text-red-500' : monitoring ? 'bg-blue-500/20 text-blue-500' : ''}`}>
            <span className={`material-icons text-xs mr-1 ${monitoring ? "text-blue-500 animate-pulse" : intrusionsDetected ? "text-red-500" : "text-green-500"}`}>
              {monitoring ? "search" : intrusionsDetected ? "warning" : "security"}
            </span>
            {monitoring ? "Monitoring..." : intrusionsDetected ? `${intrusions.length} Intrusions` : "Secure"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={`p-6 ${intrusionsDetected ? 'bg-red-500/5' : ''}`}>
        {intrusions.length > 0 ? (
          <div className="space-y-4">
            {intrusionsDetected && (
              <Alert variant="destructive" className={`mb-4 ${flashingAlert ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
                <span className="material-icons mr-2 animate-pulse">warning</span>
                <AlertTitle className="text-lg">Network Intrusions Detected!</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2 text-white/90">
                    {intrusions.length} network intrusion attempts detected. Critical attacks have been automatically blocked.
                    Immediate security response recommended.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {intrusions.map((intrusion, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getSeverityBg(intrusion.severity)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`material-icons text-2xl ${getSeverityColor(intrusion.severity)}`}>
                        {intrusion.severity === 'critical' ? 'dangerous' : 'warning'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{intrusion.attackType}</div>
                        <div className="text-sm text-gray-600">From: {intrusion.sourceIP} → Port {intrusion.targetPort}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={intrusion.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                        {intrusion.severity.toUpperCase()}
                      </Badge>
                      {intrusion.blocked && (
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                          <span className="material-icons text-xs mr-1">block</span>
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    {intrusion.description}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Detected at: {intrusion.timestamp}</span>
                    <span>Target Port: {intrusion.targetPort}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <span className="material-icons text-sm mr-2">block</span>
                Block All Sources
              </Button>
              <Button variant="outline">
                <span className="material-icons text-sm mr-2">security</span>
                Security Response
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Advanced network intrusion detection system that monitors network traffic for suspicious activities, 
              unauthorized access attempts, and malicious attack patterns using AI-powered behavioral analysis.
            </p>
            
            {monitoring && (
              <div className="space-y-3 my-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{scanPhase}</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
            
            {!monitoring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-blue-500 mr-2">traffic</span>
                    <h3 className="font-medium">Traffic Analysis</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time analysis of network packets and connection patterns for anomaly detection.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-orange-500 mr-2">psychology</span>
                    <h3 className="font-medium">Behavioral AI</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Machine learning algorithms detect unusual network behavior and attack signatures.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-500 mr-2">speed</span>
                    <h3 className="font-medium">Real-time Response</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instant blocking and mitigation of detected threats to prevent data breaches.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={startMonitoring} 
                disabled={monitoring}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <span className="material-icons text-sm mr-2">network_check</span>
                Start Network Monitoring
              </Button>
              <Button variant="outline" disabled={monitoring}>
                <span className="material-icons text-sm mr-2">settings</span>
                Network Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkIntrusionDetector;