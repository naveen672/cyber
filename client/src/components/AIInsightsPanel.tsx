import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAnomalyScoreClass, getTrendInfo, getProbabilityInfo, getRiskScoreClass, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PredictedThreat {
  type: string;
  probability: number;
}

interface AnomalyData {
  timestamp: Date;
  score: number;
  description: string;
}

interface TrendData {
  period: string;
  count: number;
}

interface SecurityPostureData {
  timestamp: Date;
  score: number;
}

const AIInsightsPanel = () => {
  // Get predicted threats
  const { 
    data: predictedThreats, 
    isLoading: isLoadingPredictions 
  } = useQuery({ 
    queryKey: ['/api/analytics/predicted-threats'],
    select: (data: PredictedThreat[]) => data.sort((a, b) => b.probability - a.probability)
  });

  // Get anomaly detection data
  const { 
    data: anomalies, 
    isLoading: isLoadingAnomalies 
  } = useQuery({ 
    queryKey: ['/api/analytics/anomalies'],
    select: (data: AnomalyData[]) => {
      // Convert string timestamps to Date objects
      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  });

  // Get trend data
  const { 
    data: trends, 
    isLoading: isLoadingTrends 
  } = useQuery({ 
    queryKey: ['/api/analytics/threat-trends']
  });

  // Get security posture history
  const { 
    data: securityPosture, 
    isLoading: isLoadingPosture 
  } = useQuery({ 
    queryKey: ['/api/analytics/security-posture'],
    select: (data: SecurityPostureData[]) => {
      // Convert string timestamps to Date objects
      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  });

  // Get system stats for enhanced info
  const { data: stats } = useQuery({ queryKey: ['/api/stats'] });
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-info">smart_toy</span>
            AI Security Insights
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1 flex items-center text-xs">
            <span className="material-icons mr-1 text-xs text-success">sync</span>
            Updated 2m ago
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="predictions" className="w-full">
        <div className="px-6 pt-3">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="predictions" className="text-xs md:text-sm">
              <span className="material-icons mr-1 text-sm">trending_up</span>
              <span className="hidden sm:inline">Threat</span> Predictions
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs md:text-sm">
              <span className="material-icons mr-1 text-sm">warning</span>
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs md:text-sm">
              <span className="material-icons mr-1 text-sm">analytics</span>
              <span className="hidden sm:inline">Threat</span> Trends
            </TabsTrigger>
            <TabsTrigger value="posture" className="text-xs md:text-sm">
              <span className="material-icons mr-1 text-sm">security</span>
              <span className="hidden sm:inline">Security</span> Posture
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-6">
          {/* Threat Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Predicted Threats in Next 24 Hours</h3>
              <div className="flex items-center text-xs text-success">
                <span className="material-icons text-xs mr-1">check_circle</span>
                <span>94% Model Accuracy</span>
              </div>
            </div>
            
            {isLoadingPredictions ? (
              <>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="w-full max-w-[50%] mx-4">
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </>
            ) : (
              <div className="space-y-4">
                {predictedThreats?.map((threat, index) => {
                  const probabilityInfo = getProbabilityInfo(threat.probability);
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                          <span className="material-icons text-sm">
                            {threat.type === 'malware' ? 'bug_report' :
                             threat.type === 'phishing' ? 'phishing' :
                             threat.type === 'ddos' ? 'lan' :
                             threat.type === 'ransomware' ? 'lock' : 'vpn_key'}
                          </span>
                        </div>
                        <span className="font-medium capitalize">{threat.type}</span>
                      </div>
                      <div className="w-full max-w-[50%] mx-4">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${probabilityInfo.class.replace('text-', 'bg-')}`}
                            style={{ width: `${threat.probability}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${probabilityInfo.class}`}>
                        {probabilityInfo.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">AI Recommendation:</p>
              <p className="text-muted-foreground text-xs">
                Based on observed patterns, we recommend strengthening phishing detection filters and implementing additional authentication safeguards.
              </p>
            </div>
          </TabsContent>
          
          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Anomalies Detected</h3>
              <Badge variant="outline" className="text-info text-xs">Network Anomaly Level: {stats?.networkAnomalyLevel || 68}</Badge>
            </div>
            
            {isLoadingAnomalies ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex justify-between items-center mt-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies?.map((anomaly, index) => {
                  const scoreClass = getAnomalyScoreClass(anomaly.score);
                  
                  return (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">Anomaly Detected</h4>
                        <span className="text-sm text-muted-foreground">
                          {anomaly.timestamp.toLocaleTimeString()} - {anomaly.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{anomaly.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Confidence Score</span>
                        <Badge className={`${scoreClass.replace('text-', 'bg-')} text-white`}>
                          {anomaly.score}/100
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">AI Analysis:</p>
              <p className="text-muted-foreground text-xs">
                Authentication anomalies suggest a potential credential stuffing attack. Our AI model has identified unusual login patterns from multiple geographic regions.
              </p>
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Threat Activity Trends</h3>
              {stats?.threatTrend && (
                <div className="flex items-center text-xs">
                  <span className={`material-icons text-xs mr-1 ${getTrendInfo(stats.threatTrend).class}`}>
                    {getTrendInfo(stats.threatTrend).icon}
                  </span>
                  <span className={getTrendInfo(stats.threatTrend).class}>
                    {stats.threatTrend.charAt(0).toUpperCase() + stats.threatTrend.slice(1)}
                  </span>
                </div>
              )}
            </div>
            
            {isLoadingTrends ? (
              <div className="space-y-5">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {trends?.map((trend, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Last {trend.period}</span>
                      <span className="text-sm font-medium">{trend.count} threats</span>
                    </div>
                    <div className="h-8 w-full bg-muted rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-info"
                        style={{ width: `${Math.min(100, (trend.count / 400) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">Trend Analysis:</p>
              <p className="text-muted-foreground text-xs">
                There has been an 18% increase in threats over the past 7 days, primarily driven by phishing attempts. This correlates with a recent security breach at a major service provider.
              </p>
            </div>
          </TabsContent>
          
          {/* Security Posture Tab */}
          <TabsContent value="posture" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Security Posture Overview</h3>
              <Badge 
                variant="outline" 
                className={`text-xs ${stats?.securityPostureScore && getRiskScoreClass(stats.securityPostureScore)}`}
              >
                Current Score: {stats?.securityPostureScore || 72}/100
              </Badge>
            </div>
            
            {isLoadingPosture ? (
              <>
                <div className="mb-6">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-muted rounded p-3">
                      <Skeleton className="h-3 w-28 mb-2" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
                
                <Skeleton className="h-32 w-full rounded" />
              </>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs text-muted-foreground mb-1 block">Historical Security Score</span>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-6 text-xs flex rounded bg-muted">
                      {securityPosture?.map((item, index) => (
                        <div
                          key={index}
                          style={{ width: `${100 / securityPosture.length}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center ${
                            item.score >= 80 ? 'bg-success' :
                            item.score >= 70 ? 'bg-info' :
                            item.score >= 50 ? 'bg-warning' : 'bg-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex text-xs justify-between mt-1">
                      {securityPosture?.map((item, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp).split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded p-3">
                    <span className="text-xs text-muted-foreground block mb-1">Vulnerable Assets</span>
                    <span className="text-lg font-medium">{stats?.vulnerableAssets || 15}</span>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <span className="text-xs text-muted-foreground block mb-1">Patch Compliance</span>
                    <span className="text-lg font-medium">{stats?.patchComplianceRate || 86}%</span>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <span className="text-xs text-muted-foreground block mb-1">Mean Time to Detect</span>
                    <span className="text-lg font-medium">{stats?.meanTimeToDetect || 42}s</span>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <span className="text-xs text-muted-foreground block mb-1">Mean Time to Resolve</span>
                    <span className="text-lg font-medium">{stats?.meanTimeToResolve || 120}m</span>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Security Recommendations:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Update 15 systems with critical security patches</li>
                    <li>Enable multi-factor authentication for admin portals</li>
                    <li>Review firewall rules for potential misconfigurations</li>
                    <li>Implement additional logging for database access</li>
                  </ul>
                </div>
              </>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Powered by {stats?.aiModelVersion || "CyberAI-3.2.1"}</span>
        <Button variant="outline" size="sm" className="text-xs">
          <span className="material-icons text-xs mr-1">tune</span>
          Configure AI Settings
        </Button>
      </div>
    </Card>
  );
};

export default AIInsightsPanel;