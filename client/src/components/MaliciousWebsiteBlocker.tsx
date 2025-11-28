import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from '@tanstack/react-query';

interface WebsiteAnalysis {
  url: string;
  category: string;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  securityScore: number;
  ismalicious: boolean;
  usesHttps: boolean;
  isTrustedDomain: boolean;
  hasSecurityCertificate: boolean;
  aiRecommendation?: string;
  aiThreatAssessment?: string;
}

const MaliciousWebsiteBlocker = () => {
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [flashingAlert, setFlashingAlert] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (analysis?.ismalicious) {
      const interval = setInterval(() => {
        setFlashingAlert(prev => !prev);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [analysis?.ismalicious]);

  const generateAIRecommendation = (analysis: any) => {
    const score = analysis.securityScore;
    
    if (score >= 85) {
      return "✅ AI Assessment: This website appears completely safe. No suspicious indicators detected.";
    } else if (score >= 70) {
      return "⚠️ AI Assessment: Minor security concerns detected. Proceed with caution. Verify the domain is legitimate.";
    } else if (score >= 50) {
      return "🚨 AI Assessment: Moderate threat level. The website has several suspicious indicators. We recommend avoiding this site.";
    } else {
      return "⛔ AI Assessment: High-risk website detected. Multiple security red flags. This is likely malicious. Block immediately.";
    }
  };

  const generateAIThreatAssessment = (analysis: any) => {
    const indicators = analysis.indicators || [];
    
    if (analysis.ismalicious) {
      if (indicators.some(i => i.includes('Domain spoofing') || i.includes('phishing'))) {
        return "AI Threat Type: PHISHING ATTEMPT - Website designed to steal credentials by impersonating legitimate services.";
      } else if (indicators.some(i => i.includes('IP address'))) {
        return "AI Threat Type: SUSPICIOUS HOSTING - Website uses IP address instead of domain, common phishing tactic.";
      } else if (indicators.some(i => i.includes('HTTP'))) {
        return "AI Threat Type: UNENCRYPTED CONNECTION - No HTTPS encryption means your data could be intercepted.";
      } else {
        return "AI Threat Type: GENERAL MALICIOUS WEBSITE - Multiple security red flags suggest malicious intent.";
      }
    }
    return "AI Threat Type: No significant threats detected. Website appears legitimate.";
  };

  const analyzeUrl = async () => {
    if (!urlInput.trim()) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      // Normalize URL
      let urlToAnalyze = urlInput.trim();
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlToAnalyze })
      });

      const data = await response.json();
      
      if (response.ok && data.analysis) {
        const analysisData = {
          url: urlToAnalyze,
          ...data.analysis
        };

        // Add AI recommendations
        analysisData.aiRecommendation = generateAIRecommendation(analysisData);
        analysisData.aiThreatAssessment = generateAIThreatAssessment(analysisData);

        setAnalysis(analysisData);

        // Invalidate queries to update threat data
        queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getRiskBg = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-yellow-100 border-yellow-200';
      case 'medium': return 'bg-orange-100 border-orange-200';
      case 'high': return 'bg-red-100 border-red-200';
      case 'critical': return 'bg-red-200 border-red-300';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`w-full mb-6 ${analysis?.ismalicious && flashingAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
      <CardHeader className={`px-6 py-4 border-b border-border ${analysis?.ismalicious ? 'bg-red-500/10' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-green-500">web</span>
            Malicious Website Blocker
          </CardTitle>
          <Badge variant="outline" className={`px-3 py-1 flex items-center text-xs ${analysis?.ismalicious ? 'bg-red-500/20 text-red-500' : analyzing ? 'bg-blue-500/20 text-blue-500' : ''}`}>
            <span className={`material-icons text-xs mr-1 ${analyzing ? "text-blue-500 animate-pulse" : analysis?.ismalicious ? "text-red-500" : "text-green-500"}`}>
              {analyzing ? "search" : analysis?.ismalicious ? "warning" : "security"}
            </span>
            {analyzing ? "Analyzing..." : analysis?.ismalicious ? "Threat Detected" : "Protected"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={`p-6 ${analysis?.ismalicious ? 'bg-red-500/5' : ''}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
              disabled={analyzing}
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
            />
            <Button 
              onClick={analyzeUrl} 
              disabled={analyzing || !urlInput.trim()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <span className="material-icons text-sm mr-2">web</span>
              {analyzing ? 'Analyzing...' : 'Check URL'}
            </Button>
          </div>

          {analysis && (
            <div className="space-y-4">
              {/* AI Recommendation Alert */}
              <Alert className={`mb-4 ${
                analysis.riskLevel === 'critical' ? 'bg-red-600 text-white border-red-500' :
                analysis.riskLevel === 'high' ? 'bg-orange-600 text-white border-orange-500' :
                analysis.riskLevel === 'medium' ? 'bg-yellow-600 text-white border-yellow-500' :
                'bg-green-600 text-white border-green-500'
              }`}>
                <span className="material-icons mr-2">auto_awesome</span>
                <AlertTitle className="text-sm font-semibold">{analysis.aiRecommendation}</AlertTitle>
              </Alert>

              {/* AI Threat Assessment */}
              <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-blue-400">psychology</span>
                  <div>
                    <h4 className="text-blue-100 font-medium text-sm">AI Threat Analysis</h4>
                    <p className="text-blue-200 text-sm mt-1">{analysis.aiThreatAssessment}</p>
                  </div>
                </div>
              </div>

              {analysis.ismalicious && (
                <Alert variant="destructive" className={`mb-4 ${flashingAlert ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
                  <span className="material-icons mr-2 animate-pulse">warning</span>
                  <AlertTitle className="text-lg">Malicious Website Detected!</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="text-white/90">{analysis.description}</p>
                  </AlertDescription>
                </Alert>
              )}

              {!analysis.ismalicious && (
                <Alert className="bg-green-50 border-green-200">
                  <span className="material-icons mr-2 text-green-600">check_circle</span>
                  <AlertTitle className="text-green-900">Website Safe</AlertTitle>
                  <AlertDescription className="text-green-800 mt-2">
                    This website appears to be safe and secure.
                  </AlertDescription>
                </Alert>
              )}

              <div className={`p-4 border rounded-lg ${getRiskBg(analysis.riskLevel)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`material-icons text-2xl ${getRiskColor(analysis.riskLevel)}`}>
                      {analysis.ismalicious ? 'dangerous' : 'check_circle'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 font-mono text-sm break-all">{analysis.url}</div>
                      <div className="text-sm text-gray-600">{analysis.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysis.riskLevel === 'critical' || analysis.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {analysis.riskLevel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Score: {analysis.securityScore}/100
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Security Indicators:</div>
                  <ul className="text-sm space-y-1">
                    {analysis.indicators.slice(0, 5).map((indicator, i) => (
                      <li key={i} className="text-gray-700">• {indicator}</li>
                    ))}
                  </ul>
                  {analysis.indicators.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">+{analysis.indicators.length - 5} more indicators</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!analysis && !analyzing && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Enter a website URL to check if it's malicious or safe.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-500 mr-2">lock</span>
                    <h3 className="font-medium text-foreground">HTTPS Check</h3>
                  </div>
                  <p className="text-xs">Verifies encrypted connection and valid SSL certificate.</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-orange-500 mr-2">verified</span>
                    <h3 className="font-medium text-foreground">Domain Analysis</h3>
                  </div>
                  <p className="text-xs">Checks against trusted domain database and phishing patterns.</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-blue-500 mr-2">shield</span>
                    <h3 className="font-medium text-foreground">Security Score</h3>
                  </div>
                  <p className="text-xs">Rates website based on multiple security indicators.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaliciousWebsiteBlocker;