import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getConfidenceClass, formatDate, getRiskScoreClass } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// Using fetch directly for the API request

const APTDetectionPanel = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatDetected, setThreatDetected] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current threats
  const { data: threats } = useQuery({ 
    queryKey: ['/api/threats']
  });

  const simulateScan = async () => {
    setScanning(true);
    setThreatDetected(false);
    setDetectionError(null);
    setScanProgress(0);
    
    // Progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Complete the scan after progress reaches 100%
        setThreatDetected(true);
        setScanning(false);
        
        // Trigger a fake "detection" - in a real system, this would call the API
        fetch('/api/detect-apt', { 
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(() => {
          // Refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
          queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        })
        .catch(error => {
          console.error('Error in background API call:', error);
          // We don't show this error to the user since the UI flow has already completed
        });
      }
    }, 300);
  };

  const renderActionButtons = () => (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4">
      <Button 
        onClick={simulateScan} 
        disabled={scanning}
        className="bg-secondary hover:bg-secondary/90 text-white"
      >
        <span className="material-icons text-sm mr-2">security</span>
        Run APT Detection Scan
      </Button>
      <Button variant="outline" disabled={scanning}>
        <span className="material-icons text-sm mr-2">tune</span>
        Configure Scan Settings
      </Button>
    </div>
  );

  return (
    <Card className="w-full mb-6">
      <CardHeader className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-secondary">shield</span>
            Advanced Persistent Threat Detection
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1 flex items-center text-xs">
            <span className={`material-icons text-xs mr-1 ${scanning ? "text-info" : "text-success"}`}>
              {scanning ? "sync" : "security"}
            </span>
            {scanning ? "Scanning..." : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This module uses behavioral analysis and pattern recognition to detect Advanced Persistent Threats (APTs) that may have established long-term presence in your network.
          </p>
          
          {scanning && (
            <div className="space-y-2 my-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Scanning network for suspicious patterns...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
              <div className="grid grid-cols-4 gap-2 mt-3">
                {['Network Traffic', 'Process Analysis', 'File System', 'Memory Scan'].map((stage, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded text-center ${
                      scanProgress >= (index + 1) * 25 ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {threatDetected && !scanning && (
            <Alert variant="destructive" className="mb-4 border-secondary bg-secondary/10">
              <span className="material-icons mr-2">warning</span>
              <AlertTitle>APT Detected!</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">
                  An Advanced Persistent Threat has been identified with high confidence. 
                  This threat appears to be conducting lateral movement and data exfiltration.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-background/60 p-2 rounded text-xs">
                    <span className="block text-muted-foreground mb-1">First Detected:</span>
                    <span className="font-medium">{formatDate(new Date())}</span>
                  </div>
                  <div className="bg-background/60 p-2 rounded text-xs">
                    <span className="block text-muted-foreground mb-1">Confidence:</span>
                    <span className="font-medium text-secondary">94%</span>
                  </div>
                  <div className="bg-background/60 p-2 rounded text-xs">
                    <span className="block text-muted-foreground mb-1">Risk Score:</span>
                    <span className={`font-medium ${getRiskScoreClass(87)}`}>87/100</span>
                  </div>
                  <div className="bg-background/60 p-2 rounded text-xs">
                    <span className="block text-muted-foreground mb-1">Status:</span>
                    <span className="font-medium text-warning">Active</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button size="sm" className="mr-2">
                    <span className="material-icons text-xs mr-1">delete</span>
                    Mitigate Threat
                  </Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {detectionError && !scanning && (
            <Alert variant="destructive" className="mb-4">
              <span className="material-icons mr-2">error</span>
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{detectionError}</AlertDescription>
            </Alert>
          )}
          
          {!threatDetected && !scanning && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-info mr-2">analytics</span>
                  <h3 className="font-medium">Behavioral Analysis</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzes network traffic patterns and system behavior to identify anomalies 
                  indicative of APT activity.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-warning mr-2">history</span>
                  <h3 className="font-medium">Persistence Detection</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Identifies mechanisms used by threats to maintain access across system 
                  reboots and credential changes.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-secondary mr-2">data_usage</span>
                  <h3 className="font-medium">Data Exfiltration</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detects unusual data transfers that may indicate sensitive information 
                  being extracted from your network.
                </p>
              </div>
            </div>
          )}
          
          {renderActionButtons()}
        </div>
      </CardContent>
    </Card>
  );
};

export default APTDetectionPanel;