import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Email {
  id: number;
  messageId: string;
  sender: string;
  senderName?: string;
  recipient: string;
  subject: string;
  body: string;
  htmlBody?: string;
  receivedAt: string;
  isPhishing: boolean;
  phishingScore: number;
  phishingIndicators?: string;
  analysisStatus: string;
  quarantined: boolean;
  domainReputation?: string;
  threatClassification?: string;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
}

const EmailInbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  const [showTestForm, setShowTestForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test email form state
  const [testEmail, setTestEmail] = useState({
    from: '',
    subject: '',
    text: ''
  });

  // Fetch all emails
  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ['/api/emails'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch phishing emails
  const { data: phishingEmails = [] } = useQuery<Email[]>({
    queryKey: ['/api/emails/phishing/true'],
    refetchInterval: 30000,
  });

  // Fetch safe emails  
  const { data: safeEmails = [] } = useQuery<Email[]>({
    queryKey: ['/api/emails/phishing/false'],
    refetchInterval: 30000,
  });

  // Quarantine mutation
  const quarantineMutation = useMutation({
    mutationFn: async ({ emailId, quarantined }: { emailId: number; quarantined: boolean }) => {
      return await apiRequest('PATCH', `/api/emails/${emailId}/quarantine`, { quarantined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/phishing/true'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/phishing/false'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Email Status Updated",
        description: "Email quarantine status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update email status.",
        variant: "destructive",
      });
    },
  });

  // Re-analyze email mutation
  const analyzeMutation = useMutation({
    mutationFn: async (emailId: number) => {
      return await apiRequest('POST', `/api/emails/${emailId}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      toast({
        title: "Analysis Complete",
        description: "Email has been re-analyzed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to analyze email.",
        variant: "destructive",
      });
    },
  });

  // Send test email mutation
  const sendTestMutation = useMutation({
    mutationFn: async (emailData: { from: string; subject: string; text: string }) => {
      return await apiRequest('POST', '/api/emails/test-send', emailData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/phishing/true'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/phishing/false'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setTestEmail({ from: '', subject: '', text: '' });
      setShowTestForm(false);
      toast({
        title: "Test Email Sent",
        description: "Email has been processed and analyzed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  const handleQuarantine = (email: Email, quarantined: boolean) => {
    quarantineMutation.mutate({ emailId: email.id, quarantined });
  };

  const handleReAnalyze = (email: Email) => {
    analyzeMutation.mutate(email.id);
  };

  const handleSendTest = () => {
    if (!testEmail.from || !testEmail.subject || !testEmail.text) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      });
      return;
    }
    sendTestMutation.mutate(testEmail);
  };

  const loadTemplate = (templateType: string) => {
    const templates = {
      'phishing-bank': {
        from: 'security@chase-verify.com',
        subject: 'URGENT: Account Suspension Notice',
        text: 'Your account has been suspended due to suspicious activity. Click here immediately to verify your identity: http://chase-security-verify.malicious-domain.com/login'
      },
      'phishing-paypal': {
        from: 'service@paypal-security.net',
        subject: 'Confirm Your PayPal Account',
        text: 'We noticed unusual activity on your PayPal account. Please confirm your account details within 24 hours: http://paypal-confirm.suspicious-site.org/verify'
      },
      'phishing-crypto': {
        from: 'support@blockchain-security.io',
        subject: 'Your Wallet Has Been Compromised',
        text: 'URGENT: Your crypto wallet shows unauthorized access. Secure your funds now by entering your private key here: http://wallet-security.fake-crypto.biz/emergency'
      },
      'safe-newsletter': {
        from: 'newsletter@legitimate-company.com',
        subject: 'Monthly Security Updates',
        text: 'Here are this month\'s cybersecurity best practices and tips to keep your organization secure. Visit our official website for more resources.'
      },
      'safe-notification': {
        from: 'noreply@your-bank.com',
        subject: 'Account Statement Ready',
        text: 'Your monthly account statement is now available in your secure online banking portal. Log in through our official website to view your statement.'
      }
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setTestEmail(template);
    }
  };

  const getEmailsForTab = () => {
    switch (currentTab) {
      case "phishing":
        return phishingEmails;
      case "safe":
        return safeEmails;
      default:
        return emails;
    }
  };

  const getSecurityBadge = (email: Email) => {
    if (email.isPhishing) {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white">
          <span className="material-icons text-xs mr-1">warning</span>
          Phishing ({email.phishingScore}%)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <span className="material-icons text-xs mr-1">shield</span>
        Safe ({email.phishingScore}%)
      </Badge>
    );
  };

  const getQuarantineBadge = (email: Email) => {
    if (email.quarantined) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <span className="material-icons text-xs mr-1">block</span>
          Quarantined
        </Badge>
      );
    }
    return null;
  };

  const getAuthBadges = (email: Email) => {
    const badges = [];
    
    if (email.spfResult) {
      const isPass = email.spfResult === 'pass';
      badges.push(
        <Badge 
          key="spf"
          variant="outline" 
          className={isPass ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
        >
          SPF: {email.spfResult}
        </Badge>
      );
    }
    
    if (email.dkimResult) {
      const isPass = email.dkimResult === 'pass';
      badges.push(
        <Badge 
          key="dkim"
          variant="outline" 
          className={isPass ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
        >
          DKIM: {email.dkimResult}
        </Badge>
      );
    }
    
    return badges;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="material-icons mr-2 text-blue-500 animate-spin">refresh</span>
            Loading Email Inbox...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center">
                <span className="material-icons mr-2 text-blue-600">email</span>
                Email Security Inbox
              </CardTitle>
              <p className="text-sm text-gray-600">
                Real-time email monitoring with AI-powered phishing detection
              </p>
            </div>
            <Button 
              onClick={() => setShowTestForm(!showTestForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="material-icons text-sm mr-2">send</span>
              {showTestForm ? 'Hide' : 'Send Test Email'}
            </Button>
          </div>
        </CardHeader>
        
        {/* Test Email Form */}
        {showTestForm && (
          <CardContent className="border-t bg-gray-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Send Test Email</h3>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Load Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phishing-bank">🎯 Phishing: Bank Alert</SelectItem>
                      <SelectItem value="phishing-paypal">🎯 Phishing: PayPal Scam</SelectItem>
                      <SelectItem value="phishing-crypto">🎯 Phishing: Crypto Scam</SelectItem>
                      <SelectItem value="safe-newsletter">✅ Safe: Newsletter</SelectItem>
                      <SelectItem value="safe-notification">✅ Safe: Bank Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-from">From Email Address</Label>
                  <Input
                    id="test-from"
                    value={testEmail.from}
                    onChange={(e) => setTestEmail(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="sender@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="test-subject">Subject Line</Label>
                  <Input
                    id="test-subject"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="test-text">Email Content</Label>
                <Textarea
                  id="test-text"
                  value={testEmail.text}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Email body content..."
                  className="mt-1 h-32"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  💡 Use templates above to test phishing detection with realistic examples
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTestForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendTest}
                    disabled={sendTestMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sendTestMutation.isPending ? (
                      <>
                        <span className="material-icons text-sm mr-2 animate-spin">refresh</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm mr-2">send</span>
                        Send & Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-blue-500">email</span>
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold">{emails.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-red-500">warning</span>
              <div>
                <p className="text-sm text-gray-600">Phishing Detected</p>
                <p className="text-2xl font-bold text-red-600">{phishingEmails.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-green-500">shield</span>
              <div>
                <p className="text-sm text-gray-600">Safe Emails</p>
                <p className="text-2xl font-bold text-green-600">{safeEmails.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-orange-500">block</span>
              <div>
                <p className="text-sm text-gray-600">Quarantined</p>
                <p className="text-2xl font-bold text-orange-600">
                  {emails.filter(email => email.quarantined).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Emails ({emails.length})</TabsTrigger>
              <TabsTrigger value="phishing">Phishing ({phishingEmails.length})</TabsTrigger>
              <TabsTrigger value="safe">Safe ({safeEmails.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={currentTab} className="mt-6">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {getEmailsForTab().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="material-icons text-4xl mb-2 block">email</span>
                    No emails in this category
                  </div>
                ) : (
                  getEmailsForTab().map((email) => (
                    <Card 
                      key={email.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        email.isPhishing ? 'border-red-200 bg-red-50' : 
                        email.quarantined ? 'border-orange-200 bg-orange-50' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {email.senderName || email.sender}
                              </span>
                              {email.senderName && (
                                <span className="text-sm text-gray-500">
                                  &lt;{email.sender}&gt;
                                </span>
                              )}
                              {getSecurityBadge(email)}
                              {getQuarantineBadge(email)}
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {email.subject}
                            </h3>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {email.body.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {format(new Date(email.receivedAt), 'MMM dd, yyyy HH:mm')}
                                </span>
                                {getAuthBadges(email)}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <span className="material-icons text-sm mr-1">visibility</span>
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Email Details</DialogTitle>
                                    </DialogHeader>
                                    <EmailDetailView 
                                      email={email}
                                      onQuarantine={handleQuarantine}
                                      onReAnalyze={handleReAnalyze}
                                      isAnalyzing={analyzeMutation.isPending}
                                      isUpdating={quarantineMutation.isPending}
                                    />
                                  </DialogContent>
                                </Dialog>
                                
                                {email.isPhishing && !email.quarantined && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleQuarantine(email, true)}
                                    disabled={quarantineMutation.isPending}
                                  >
                                    <span className="material-icons text-sm mr-1">block</span>
                                    Quarantine
                                  </Button>
                                )}
                                
                                {email.quarantined && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleQuarantine(email, false)}
                                    disabled={quarantineMutation.isPending}
                                  >
                                    <span className="material-icons text-sm mr-1">check</span>
                                    Release
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Email Detail View Component
const EmailDetailView = ({ 
  email, 
  onQuarantine, 
  onReAnalyze, 
  isAnalyzing, 
  isUpdating 
}: {
  email: Email;
  onQuarantine: (email: Email, quarantined: boolean) => void;
  onReAnalyze: (email: Email) => void;
  isAnalyzing: boolean;
  isUpdating: boolean;
}) => {
  const indicators = email.phishingIndicators ? JSON.parse(email.phishingIndicators) : [];

  return (
    <div className="space-y-6">
      {/* Email Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{email.subject}</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReAnalyze(email)}
              disabled={isAnalyzing}
            >
              <span className="material-icons text-sm mr-1">
                {isAnalyzing ? "refresh" : "search"}
              </span>
              {isAnalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
            
            {email.quarantined ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuarantine(email, false)}
                disabled={isUpdating}
              >
                <span className="material-icons text-sm mr-1">check</span>
                Release
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onQuarantine(email, true)}
                disabled={isUpdating}
              >
                <span className="material-icons text-sm mr-1">block</span>
                Quarantine
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">From:</span> {email.senderName || email.sender}</p>
            <p><span className="font-medium">To:</span> {email.recipient}</p>
            <p><span className="font-medium">Date:</span> {format(new Date(email.receivedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
          </div>
          <div>
            <p><span className="font-medium">Risk Score:</span> {email.phishingScore}%</p>
            <p><span className="font-medium">Status:</span> {email.isPhishing ? "Phishing" : "Safe"}</p>
            <p><span className="font-medium">Domain Rep:</span> {email.domainReputation || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Security Analysis */}
      {indicators.length > 0 && (
        <Alert variant={email.isPhishing ? "destructive" : "default"}>
          <span className="material-icons">security</span>
          <AlertTitle>Security Analysis</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {indicators.map((indicator: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="material-icons text-sm">info</span>
                  <span>{indicator}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Email Body */}
      <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <h3 className="font-medium mb-2">Email Content</h3>
        <div className="whitespace-pre-wrap text-sm">
          {email.body}
        </div>
      </div>
    </div>
  );
};

export default EmailInbox;