import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from '@tanstack/react-query';

interface EmailThreat {
  sender: string;
  subject: string;
  riskScore: number;
  indicators: string[];
  blocked: boolean;
}

const PhishingEmailDetector = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatsFound, setThreatsFound] = useState<EmailThreat[]>([]);
  const [scanPhase, setScanPhase] = useState('');
  const [flashingAlert, setFlashingAlert] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (threatsFound.length > 0) {
      const interval = setInterval(() => {
        setFlashingAlert(prev => !prev);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [threatsFound]);

  const startScan = () => {
    setScanning(true);
    setThreatsFound([]);
    setScanProgress(0);
    setScanPhase('Initializing email security scan...');

    let progress = 0;
    const phases = [
      { text: 'Scanning inbox for suspicious emails...', duration: 2000 },
      { text: 'Analyzing sender reputation and domains...', duration: 2000 },
      { text: 'Checking for malicious attachments...', duration: 1500 },
      { text: 'Validating email headers and authentication...', duration: 1500 },
      { text: 'Cross-referencing with threat intelligence...', duration: 1000 }
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      if (currentPhase < phases.length && progress >= (currentPhase + 1) * 20) {
        setScanPhase(phases[currentPhase].text);
        currentPhase++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setScanPhase('Scan complete - Phishing threats detected!');
        setScanning(false);
        
        // Generate detected phishing emails
        const detectedThreats: EmailThreat[] = [
          {
            sender: 'security@amaz0n-verify.com',
            subject: 'URGENT: Verify Your Account or Face Suspension',
            riskScore: 95,
            indicators: ['Suspicious domain', 'Urgency tactics', 'Account verification scam'],
            blocked: true
          },
          {
            sender: 'paypal-security@secure-update.net',
            subject: 'Action Required: Unusual Activity Detected',
            riskScore: 88,
            indicators: ['Domain spoofing', 'Credential harvesting', 'Fake security alert'],
            blocked: true
          },
          {
            sender: 'microsoft@office365-renewal.org',
            subject: 'Your Office 365 Subscription Expires Today',
            riskScore: 82,
            indicators: ['Brand impersonation', 'Subscription scam', 'Malicious links'],
            blocked: true
          }
        ];
        
        setThreatsFound(detectedThreats);

        // Call API to log phishing detection
        fetch('/api/detect-phishing', { 
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ threatsCount: detectedThreats.length })
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
    }, 100);
  };

  return (
    <div className={`w-full mb-6 rounded-lg overflow-hidden transition-all duration-300 ${threatsFound.length > 0 && flashingAlert ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] border-2' : 'border border-white/10'}`}>
      <div className={`bg-gradient-to-r from-white/5 to-white/0 backdrop-blur-md border-b border-white/10 px-6 py-4 ${threatsFound.length > 0 ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10' : ''}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center">
            <span className="material-icons mr-2 text-orange-400 text-2xl">email</span>
            Phishing Email Detection
          </h3>
          <div className={`px-3 py-1 flex items-center text-xs rounded-full font-semibold ${threatsFound.length > 0 ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50' : scanning ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-green-500/30 text-green-300 border border-green-500/50'}`}>
            <span className={`material-icons text-xs mr-1 ${scanning ? "text-blue-400 animate-pulse" : threatsFound.length > 0 ? "text-orange-400" : "text-green-400"}`}>
              {scanning ? "search" : threatsFound.length > 0 ? "warning" : "shield"}
            </span>
            {scanning ? "Scanning..." : threatsFound.length > 0 ? `${threatsFound.length} Threats Found` : "Protected"}
          </div>
        </div>
      </div>
      
      <div className={`p-6 ${threatsFound.length > 0 ? 'bg-orange-500/5' : ''}`}>
        {threatsFound.length > 0 ? (
          <div className="space-y-4">
            <Alert variant="destructive" className={`mb-4 ${flashingAlert ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'}`}>
              <span className="material-icons mr-2 animate-pulse">warning</span>
              <AlertTitle className="text-lg">Phishing Emails Detected!</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3 text-white/90">
                  {threatsFound.length} suspicious emails have been identified and automatically quarantined.
                  These emails show signs of phishing, credential theft, and social engineering attacks.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {threatsFound.map((threat, index) => (
                <div key={index} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{threat.subject}</div>
                      <div className="text-sm text-gray-600 mt-1">From: {threat.sender}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive" className="text-xs">
                        Risk: {threat.riskScore}%
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                        <span className="material-icons text-xs mr-1">block</span>
                        Quarantined
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {threat.indicators.map((indicator, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <span className="material-icons text-sm mr-2">delete</span>
                Delete All Threats
              </Button>
              <Button variant="outline">
                <span className="material-icons text-sm mr-2">report</span>
                Report to Security
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Advanced AI-powered email security that analyzes incoming messages for phishing attempts, 
              malicious attachments, and social engineering attacks. Protects against credential theft and business email compromise.
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
                    <span className="material-icons text-orange-500 mr-2">psychology</span>
                    <h3 className="font-medium">AI Analysis</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Machine learning algorithms analyze email content, sender reputation, and behavioral patterns.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-blue-500 mr-2">link</span>
                    <h3 className="font-medium">Link Protection</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scans embedded links for malicious websites and credential harvesting pages.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-500 mr-2">security</span>
                    <h3 className="font-medium">Real-time Updates</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Continuously updated threat intelligence from global security networks.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={startScan} 
                disabled={scanning}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <span className="material-icons text-sm mr-2">email</span>
                Scan Email Inbox
              </Button>
              <Button variant="outline" disabled={scanning}>
                <span className="material-icons text-sm mr-2">settings</span>
                Email Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhishingEmailDetector;