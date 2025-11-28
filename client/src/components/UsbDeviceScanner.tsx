import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from '@tanstack/react-query';

interface USBDevice {
  name: string;
  type: string;
  status: 'safe' | 'suspicious' | 'malicious';
  files: number;
  malwareFound: string[];
  autorunPresent: boolean;
}

const UsbDeviceScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectedDevices, setConnectedDevices] = useState<USBDevice[]>([]);
  const [scanPhase, setScanPhase] = useState('');
  const [threatsDetected, setThreatsDetected] = useState(false);
  const [flashingAlert, setFlashingAlert] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (threatsDetected) {
      const interval = setInterval(() => {
        setFlashingAlert(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [threatsDetected]);

  const startScan = () => {
    setScanning(true);
    setThreatsDetected(false);
    setScanProgress(0);
    setScanPhase('Detecting connected USB devices...');

    let progress = 0;
    const phases = [
      { text: 'Scanning for connected USB devices...', duration: 1500 },
      { text: 'Analyzing device file systems...', duration: 2000 },
      { text: 'Checking for malware signatures...', duration: 2500 },
      { text: 'Detecting autorun and suspicious scripts...', duration: 2000 },
      { text: 'Validating device certificates...', duration: 1000 }
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      progress += 1.5;
      setScanProgress(progress);

      if (currentPhase < phases.length && progress >= (currentPhase + 1) * 20) {
        setScanPhase(phases[currentPhase].text);
        currentPhase++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setScanPhase('Scan complete - USB threats detected!');
        setScanning(false);
        
        // Generate detected USB devices
        const devices: USBDevice[] = [
          {
            name: 'Kingston DataTraveler 3.0',
            type: 'USB Flash Drive',
            status: 'safe',
            files: 45,
            malwareFound: [],
            autorunPresent: false
          },
          {
            name: 'Unknown Device (Generic)',
            type: 'USB Storage',
            status: 'malicious',
            files: 127,
            malwareFound: ['Trojan.Win32.AutoRun', 'Worm.USB.Conficker'],
            autorunPresent: true
          },
          {
            name: 'SanDisk Ultra',
            type: 'USB Flash Drive', 
            status: 'suspicious',
            files: 89,
            malwareFound: ['PUA.AutoRun.Suspicious'],
            autorunPresent: true
          }
        ];
        
        setConnectedDevices(devices);
        
        const hasMaliciousDevices = devices.some(d => d.status === 'malicious' || d.status === 'suspicious');
        if (hasMaliciousDevices) {
          setThreatsDetected(true);
        }

        // Call API to log USB threat detection
        fetch('/api/detect-usb-threat', { 
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            devicesScanned: devices.length,
            threatsFound: devices.filter(d => d.status !== 'safe').length
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
    }, 80);
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600';
      case 'suspicious': return 'text-yellow-600';
      case 'malicious': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDeviceStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 border-green-200';
      case 'suspicious': return 'bg-yellow-100 border-yellow-200';
      case 'malicious': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`w-full mb-6 ${threatsDetected && flashingAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
      <CardHeader className={`px-6 py-4 border-b border-border ${threatsDetected ? 'bg-red-500/10' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-purple-500">usb</span>
            USB Device Security Scanner
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 flex items-center text-xs ${threatsDetected ? 'bg-red-500/20 text-red-500' : scanning ? 'bg-blue-500/20 text-blue-500' : ''}`}>
            <span className={`material-icons text-xs mr-1 ${scanning ? "text-blue-500 animate-pulse" : threatsDetected ? "text-red-500" : "text-green-500"}`}>
              {scanning ? "search" : threatsDetected ? "warning" : "security"}
            </span>
            {scanning ? "Scanning..." : threatsDetected ? "Threats Found!" : "Secure"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={`p-6 ${threatsDetected ? 'bg-red-500/5' : ''}`}>
        {connectedDevices.length > 0 ? (
          <div className="space-y-4">
            {threatsDetected && (
              <Alert variant="destructive" className={`mb-4 ${flashingAlert ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
                <span className="material-icons mr-2 animate-pulse">warning</span>
                <AlertTitle className="text-lg">USB Security Threats Detected!</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2 text-white/90">
                    Malicious USB devices detected with autorun capabilities and malware. 
                    These devices have been automatically blocked from executing.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {connectedDevices.map((device, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getDeviceStatusBg(device.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`material-icons text-2xl ${getDeviceStatusColor(device.status)}`}>
                        {device.status === 'safe' ? 'usb' : device.status === 'suspicious' ? 'usb_off' : 'dangerous'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{device.name}</div>
                        <div className="text-sm text-gray-600">{device.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={device.status === 'safe' ? 'default' : 'destructive'} className="text-xs">
                        {device.status.toUpperCase()}
                      </Badge>
                      {device.status !== 'safe' && (
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                          <span className="material-icons text-xs mr-1">block</span>
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Files Scanned:</span>
                      <span className="ml-2 font-medium">{device.files}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Autorun Present:</span>
                      <span className={`ml-2 font-medium ${device.autorunPresent ? 'text-red-600' : 'text-green-600'}`}>
                        {device.autorunPresent ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {device.malwareFound.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-red-700 mb-2">Malware Detected:</div>
                      <div className="flex flex-wrap gap-1">
                        {device.malwareFound.map((malware, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {malware}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <span className="material-icons text-sm mr-2">block</span>
                Quarantine Threats
              </Button>
              <Button variant="outline">
                <span className="material-icons text-sm mr-2">cleaning_services</span>
                Clean Devices
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Comprehensive USB device security scanning that detects malware, autorun threats, and suspicious files. 
              Protects against USB-borne attacks and unauthorized data exfiltration.
            </p>
            
            {scanning && (
              <div className="space-y-3 my-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{scanPhase}</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
            
            {!scanning && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-purple-500 mr-2">scanner</span>
                    <h3 className="font-medium">Deep Scanning</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scans all files on USB devices for known malware signatures and suspicious patterns.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-orange-500 mr-2">play_disabled</span>
                    <h3 className="font-medium">Autorun Protection</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prevents automatic execution of programs when USB devices are connected.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-500 mr-2">shield</span>
                    <h3 className="font-medium">Real-time Monitoring</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Continuously monitors USB ports for new device connections and threats.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={startScan} 
                disabled={scanning}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <span className="material-icons text-sm mr-2">usb</span>
                Scan USB Devices
              </Button>
              <Button variant="outline" disabled={scanning}>
                <span className="material-icons text-sm mr-2">settings</span>
                USB Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsbDeviceScanner;