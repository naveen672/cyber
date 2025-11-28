import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getRiskScoreClass } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const RansomwareDetector = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [detected, setDetected] = useState(false);
  const [affectedFiles, setAffectedFiles] = useState<string[]>([]);
  const [flashingAlert, setFlashingAlert] = useState(false);
  const queryClient = useQueryClient();

  // Visual effect for warning alert
  useEffect(() => {
    if (detected) {
      const interval = setInterval(() => {
        setFlashingAlert(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [detected]);

  const simulateDetection = () => {
    setScanning(true);
    setDetected(false);
    setScanProgress(0);
    setScanPhase('Initializing file system scan');
    setAffectedFiles([]);

    // Simulate a multi-phase scan
    const totalTime = 8000; // 8 seconds total
    const phases = [
      { name: 'Scanning for file encryption patterns', time: 2000 },
      { name: 'Analyzing file integrity', time: 2000 },
      { name: 'Checking for encryption signatures', time: 2000 },
      { name: 'Correlating with threat intelligence', time: 2000 }
    ];

    let elapsedTime = 0;
    let currentPhase = 0;

    const interval = setInterval(() => {
      elapsedTime += 100;
      
      // Update progress
      const overallProgress = Math.min(100, Math.floor((elapsedTime / totalTime) * 100));
      setScanProgress(overallProgress);
      
      // Update phase if needed
      if (currentPhase < phases.length && elapsedTime >= (phases.slice(0, currentPhase + 1).reduce((sum, phase) => sum + phase.time, 0))) {
        currentPhase++;
        if (currentPhase < phases.length) {
          setScanPhase(phases[currentPhase].name);
        }
      }
      
      // Complete scan
      if (elapsedTime >= totalTime) {
        clearInterval(interval);
        setScanning(false);
        setDetected(true);
        setScanPhase('Scan complete - Ransomware detected!');
        
        // Set simulated affected files
        setAffectedFiles([
          'financial_records.xlsx',
          'customer_database.sql',
          'employee_information.docx',
          'strategic_plan_2025.pptx',
          'research_data.zip',
          'project_designs.pdf'
        ]);
        
        // Call API to create ransomware threat
        fetch('/api/detect-ransomware', { 
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          // Refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }, 100);
  };

  return (
    <Card className={`w-full mb-6 ${detected && flashingAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
      <CardHeader className={`px-6 py-4 border-b border-border ${detected ? 'bg-red-500/10' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-red-500">lock</span>
            Ransomware Detection & Protection
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 flex items-center text-xs ${detected ? 'bg-red-500/20 text-red-500' : ''}`}>
            <span className={`material-icons text-xs mr-1 ${scanning ? "text-amber-500 animate-pulse" : detected ? "text-red-500" : "text-green-500"}`}>
              {scanning ? "sync" : detected ? "warning" : "security"}
            </span>
            {scanning ? "Scanning..." : detected ? "Threat Detected!" : "Protected"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={`p-6 ${detected ? 'bg-red-500/5' : ''}`}>
        {detected ? (
          <div className="space-y-4">
            <Alert variant="destructive" className={`mb-4 ${flashingAlert ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
              <span className="material-icons mr-2 animate-pulse">warning</span>
              <AlertTitle className="text-lg">CRITICAL: Ransomware Detected!</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2 text-white/90">
                  Our AI engine has detected signatures of ransomware activity in your system. 
                  The attack appears to be targeting critical files with encryption.
                </p>
                
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Affected Files:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-white/90">
                    {affectedFiles.map((file, index) => (
                      <li key={index} className="animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>{file}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/20">
                  <div>
                    <span className="block text-sm">Threat Level: <span className="font-bold">Critical</span></span>
                    <span className="block text-sm mt-1">Encryption Progress: <span className="font-bold">27%</span></span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-white text-red-600 hover:bg-white/90">
                      <span className="material-icons text-sm mr-1">emergency</span>
                      Isolate Systems
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">Analyze Details</Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background/80 rounded-lg">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <span className="material-icons text-red-500 mr-1">info</span>
                  Ransomware Details
                </h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium">Family:</span> CryptoLock-23</li>
                  <li><span className="font-medium">Encryption:</span> AES-256 + RSA-2048</li>
                  <li><span className="font-medium">Propagation:</span> Network Shares, Email</li>
                  <li><span className="font-medium">First Detected:</span> 11:42 AM Today</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <span className="material-icons text-green-500 mr-1">verified</span>
                  Recovery Options
                </h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium">Backup Status:</span> <span className="text-green-500">Available</span></li>
                  <li><span className="font-medium">Last Backup:</span> 6:00 AM Today</li>
                  <li><span className="font-medium">Estimated Recovery Time:</span> 45 minutes</li>
                  <li><span className="font-medium">Data Loss Risk:</span> Minimal</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our advanced ransomware protection uses AI-powered behavioral analysis to detect and block 
              ransomware before it can encrypt your files. Run a scan to check for potential threats.
            </p>
            
            {scanning && (
              <div className="space-y-3 my-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{scanPhase}...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
            
            {!scanning && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-amber-500 mr-2">local_police</span>
                    <h3 className="font-medium">Real-time Protection</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Continuously monitors file system activity to detect suspicious encryption patterns.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-purple-500 mr-2">psychology</span>
                    <h3 className="font-medium">Behavioral Analysis</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uses machine learning to identify ransomware behaviors before encryption begins.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-500 mr-2">backup</span>
                    <h3 className="font-medium">Automated Recovery</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maintains secure backups of critical files for immediate restoration if needed.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={simulateDetection} 
                disabled={scanning}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <span className="material-icons text-sm mr-2">security</span>
                Run Ransomware Scan
              </Button>
              <Button variant="outline" disabled={scanning}>
                <span className="material-icons text-sm mr-2">settings</span>
                Protection Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RansomwareDetector;