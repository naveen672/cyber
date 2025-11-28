import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Timer, Shield, ArrowLeft } from "lucide-react";
import { threatTypeConfig, severityConfig, getConfidenceClass, formatTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const ThreatDetails = () => {
  const [_, params] = useRoute("/threat/:id");
  const threatId = params?.id ? parseInt(params.id) : null;

  // Fetch threat details
  const { 
    data: threat, 
    isLoading, 
    error,
    refetch
  } = useQuery({ 
    queryKey: ['/api/threats/' + threatId],
    enabled: !!threatId
  });

  // Fetch related activities
  const { 
    data: activities
  } = useQuery({ 
    queryKey: ['/api/activities'],
    select: (data) => data.filter(activity => activity.relatedThreatId === threatId),
    enabled: !!threatId
  });

  // Handle threat mitigation
  const handleMitigate = async () => {
    if (!threat || threat.mitigated) return;
    
    try {
      await apiRequest('PATCH', `/api/threats/${threatId}`, {
        mitigated: true,
        status: 'mitigated'
      });
      refetch();
    } catch (error) {
      console.error('Failed to mitigate threat:', error);
    }
  };

  // Error fallback
  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto mt-8 max-w-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load threat details. Please try again.
        </AlertDescription>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Skeleton className="h-7 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24 rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Skeleton className="h-[400px] w-full rounded" />
      </div>
    );
  }

  if (!threat) {
    return (
      <Alert className="mx-auto mt-8 max-w-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          This threat could not be found or may have been removed.
        </AlertDescription>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </Alert>
    );
  }

  // Get type and severity config
  const { icon, color } = threatTypeConfig[threat.type];
  const { bgColor, textColor } = severityConfig[threat.severity];
  const confidenceClass = getConfidenceClass(threat.confidence);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Threat Details</h1>
        </div>
        
        {!threat.mitigated && (
          <Button onClick={handleMitigate} className="sm:self-end">
            <Shield className="h-4 w-4 mr-2" />
            Mitigate Threat
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-icons ${color}`}>{icon}</span>
                <CardTitle className="text-xl capitalize">{threat.type} Threat</CardTitle>
                <Badge className={bgColor}>{threat.severity}</Badge>
                {threat.mitigated && (
                  <Badge variant="outline" className="border-success text-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Mitigated
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">{threat.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">ID: {threat.threatId}</p>
              <p className="text-sm text-muted-foreground">
                Detected {formatTime(new Date(threat.timestamp))}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Threat Source</h3>
              <p className="font-medium">{threat.source}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Target</h3>
              <p className="font-medium">{threat.target}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <div className="flex items-center">
                {threat.mitigated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                    <span className="text-success">Mitigated</span>
                  </>
                ) : (
                  <>
                    <span className={`material-icons text-sm mr-2 ${
                      threat.status === 'active' ? 'text-warning' :
                      threat.status === 'analyzing' ? 'text-info' :
                      'text-muted-foreground'
                    }`}>
                      {threat.status === 'active' ? 'warning' : 
                       threat.status === 'analyzing' ? 'search' : 'info'}
                    </span>
                    <span className="capitalize">{threat.status}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Confidence</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{threat.confidence}%</span>
                  <Badge variant="outline" className={color}>
                    {threat.confidence > 90 ? 'Very High' :
                     threat.confidence > 75 ? 'High' :
                     threat.confidence > 50 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
                <Progress value={threat.confidence} className="h-2" indicatorClassName={confidenceClass} />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="analysis">
            <TabsList>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="mitigation">Mitigation Steps</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="space-y-4 mt-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Threat Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI has analyzed this {threat.type} threat and determined it to be a {threat.severity} risk. 
                  The threat was detected in {threat.target} originating from {threat.source}.
                </p>
                
                <h4 className="font-medium mt-4 mb-2">Threat Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  This threat exhibits characteristics of known {threat.type} attacks, matching patterns in our threat intelligence database.
                  {threat.type === 'malware' && ' The malware appears to be designed to exfiltrate sensitive data and establish a backdoor connection.'}
                  {threat.type === 'phishing' && ' The phishing attempt is using social engineering techniques to trick users into revealing login credentials.'}
                  {threat.type === 'ddos' && ' The DDoS attack is using a botnet of compromised devices to overwhelm network resources.'}
                  {threat.type === 'unauthorized' && ' The unauthorized access attempt uses brute force techniques to gain admin privileges.'}
                </p>
                
                <h4 className="font-medium mt-4 mb-2">Potential Impact</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Compromise of {threat.target} security</li>
                  <li>Potential data exfiltration or loss</li>
                  <li>System instability or downtime</li>
                  {threat.severity === 'critical' && <li>Possible regulatory compliance violations</li>}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <div className="relative pl-6 border-l border-muted">
                {activities && activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={activity.id} className="mb-6 relative">
                      <div className={`absolute left-[-22px] top-0 h-4 w-4 rounded-full ${
                        activity.type === 'detected' ? 'bg-warning' :
                        activity.type === 'blocked' ? 'bg-secondary' :
                        activity.type === 'mitigated' ? 'bg-success' : 'bg-info'
                      }`}></div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatTime(new Date(activity.timestamp))}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No timeline events recorded yet.</p>
                )}
                
                <div className="relative mb-6">
                  <div className="absolute left-[-22px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                  <h4 className="font-medium">Initial Detection</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)} threat initially detected by AI monitoring system.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{formatTime(new Date(threat.timestamp))}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mitigation" className="mt-4">
              <div className="space-y-4">
                <Alert>
                  <Timer className="h-4 w-4" />
                  <AlertTitle>Status: {threat.mitigated ? 'Mitigated' : 'Pending Mitigation'}</AlertTitle>
                  <AlertDescription>
                    {threat.mitigated 
                      ? 'This threat has been successfully mitigated. Preventative measures have been applied.' 
                      : 'This threat requires mitigation. Follow the steps below to secure your system.'}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-3">Recommended Mitigation Steps</h3>
                  <div className="space-y-3">
                    {threat.type === 'malware' && (
                      <>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Isolate Affected Systems</h4>
                            <p className="text-xs text-muted-foreground">Disconnect affected systems from the network to prevent lateral movement.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Run Full System Scan</h4>
                            <p className="text-xs text-muted-foreground">Conduct a comprehensive anti-malware scan on all potentially affected systems.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Update Security Signatures</h4>
                            <p className="text-xs text-muted-foreground">Ensure all security tools have the latest threat signatures.</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {threat.type === 'phishing' && (
                      <>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Block Suspicious Domain</h4>
                            <p className="text-xs text-muted-foreground">Add the source domain to your DNS block list and email filters.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Alert Users</h4>
                            <p className="text-xs text-muted-foreground">Send notification to all users about the phishing attempt and provide guidance.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Check for Compromised Accounts</h4>
                            <p className="text-xs text-muted-foreground">Monitor for unusual account activity and reset passwords if necessary.</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {threat.type === 'ddos' && (
                      <>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Enable Traffic Filtering</h4>
                            <p className="text-xs text-muted-foreground">Configure firewall rules to filter malicious traffic patterns.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Scale Resources</h4>
                            <p className="text-xs text-muted-foreground">Temporarily increase server resources to handle increased traffic.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Contact Service Provider</h4>
                            <p className="text-xs text-muted-foreground">Inform your ISP or cloud provider about the attack for upstream mitigation.</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {threat.type === 'unauthorized' && (
                      <>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Lock Affected Accounts</h4>
                            <p className="text-xs text-muted-foreground">Temporarily disable any potentially compromised accounts.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Implement IP Blocking</h4>
                            <p className="text-xs text-muted-foreground">Block the source IP address at the firewall level.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary bg-opacity-10 rounded-full p-1 mr-3 mt-0.5">
                            <span className="text-xs text-primary font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Enable Multi-Factor Authentication</h4>
                            <p className="text-xs text-muted-foreground">Ensure MFA is enabled for all administrative accounts.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Protected by:</span> CyberShield AI
          </div>
          {!threat.mitigated && (
            <Button onClick={handleMitigate} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Apply Mitigation
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThreatDetails;
