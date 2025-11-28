import { 
  users, type User, type InsertUser,
  threats, type Threat, type InsertThreat,
  activities, type Activity, type InsertActivity,
  stats, type Stats, type InsertStats,
  emails, type Email, type InsertEmail
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Threat methods
  getAllThreats(): Promise<Threat[]>;
  getThreat(id: number): Promise<Threat | undefined>;
  getThreatByThreatId(threatId: string): Promise<Threat | undefined>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreat(id: number, threat: Partial<Threat>): Promise<Threat | undefined>;
  getRelatedThreats(threatId: number): Promise<Threat[]>;
  getThreatsByType(type: string): Promise<Threat[]>;
  getThreatsBySeverity(severity: string): Promise<Threat[]>;
  getThreatsByTimeRange(startDate: Date, endDate: Date): Promise<Threat[]>;
  
  // Activity methods
  getAllActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByType(type: string, limit?: number): Promise<Activity[]>;
  getActivitiesByRelatedThreat(threatId: number, limit?: number): Promise<Activity[]>;
  
  // Stats methods
  getStats(): Promise<Stats>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats>;
  getThreatTrends(): Promise<{period: string, count: number}[]>;
  getPredictedThreats(): Promise<{type: string, probability: number}[]>;
  getAnomalyDetection(): Promise<{timestamp: Date, score: number, description: string}[]>;
  getSecurityPostureHistory(): Promise<{timestamp: Date, score: number}[]>;
  
  // Email methods
  getAllEmails(limit?: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  getEmailByMessageId(messageId: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, email: Partial<Email>): Promise<Email | undefined>;
  getEmailsByPhishingStatus(isPhishing: boolean, limit?: number): Promise<Email[]>;
  getEmailsByQuarantineStatus(quarantined: boolean, limit?: number): Promise<Email[]>;
  getEmailsByAnalysisStatus(status: string, limit?: number): Promise<Email[]>;
  
  // AI Analysis methods
  analyzeAttackPattern(threatId: number): Promise<{pattern: string, confidence: number, similarThreats: number[]}>;
  generateMitigationSteps(threatId: number): Promise<{step: string, priority: string, description: string}[]>;
  calculateRiskScore(threatId: number): Promise<{score: number, factors: {factor: string, impact: number}[]}>;
  predictAttackVector(sourceIp: string): Promise<{vector: string, probability: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private threats: Map<number, Threat>;
  private emails: Map<number, Email>;
  private activities: Activity[];
  private statData: Stats;
  private threatTrends: {period: string, count: number}[];
  private predictedThreats: {type: string, probability: number}[];
  private anomalyDetection: {timestamp: Date, score: number, description: string}[];
  private securityPostureHistory: {timestamp: Date, score: number}[];
  
  currentUserId: number;
  currentThreatId: number;
  currentEmailId: number;
  currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.threats = new Map();
    this.emails = new Map();
    this.activities = [];
    this.threatTrends = [];
    this.predictedThreats = [];
    this.anomalyDetection = [];
    this.securityPostureHistory = [];
    
    this.currentUserId = 1;
    this.currentThreatId = 1;
    this.currentEmailId = 1;
    this.currentActivityId = 1;
    
    // Initialize with default stats
    this.statData = {
      id: 1,
      threatLevel: "high",
      malwareCount: 5,
      blockedAttacks: 437,
      aiProtectionStatus: "active",
      threatsDetectedToday: 7,
      lastUpdated: new Date(),
      
      // Enhanced AI Analytics fields
      threatTrend: "increasing",
      predictedAttackVolume: 12,
      networkAnomalyLevel: 68,
      securityPostureScore: 72,
      modelAccuracy: 94,
      falsePositiveRate: 8,
      meanTimeToDetect: 42,
      meanTimeToResolve: 120,
      threatIntelFeedStatus: "active",
      vulnerableAssets: 15,
      patchComplianceRate: 86,
      riskTolerance: "balanced",
      aiModelVersion: "CyberAI-3.2.1",
      lastAiTraining: new Date(Date.now() - 86400000) // 24 hours ago
    };
    
    // Initialize with sample threats
    this.seedData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Threat methods
  async getAllThreats(): Promise<Threat[]> {
    return Array.from(this.threats.values()).sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  
  async getThreat(id: number): Promise<Threat | undefined> {
    return this.threats.get(id);
  }
  
  async getThreatByThreatId(threatId: string): Promise<Threat | undefined> {
    return Array.from(this.threats.values()).find(
      (threat) => threat.threatId === threatId
    );
  }
  
  async createThreat(threat: InsertThreat): Promise<Threat> {
    const id = this.currentThreatId++;
    // Ensure timestamp and mitigated are always present and nullable fields are null instead of undefined
    const newThreat: Threat = { 
      ...threat, 
      id,
      timestamp: threat.timestamp || new Date(),
      mitigated: threat.mitigated !== undefined ? threat.mitigated : false,
      attackVector: threat.attackVector || null,
      targetedAssets: threat.targetedAssets || null,
      potentialImpact: threat.potentialImpact || null,
      aiConfidenceScore: threat.aiConfidenceScore || null,
      relatedThreats: threat.relatedThreats || null,
      mitigationSteps: threat.mitigationSteps || null,
      falsePositiveProbability: threat.falsePositiveProbability || null,
      geolocation: threat.geolocation || null,
      behavioralIndicators: threat.behavioralIndicators || null,
      dataExfiltration: threat.dataExfiltration !== undefined ? threat.dataExfiltration : false
    };
    this.threats.set(id, newThreat);
    
    // Update stats
    const stats = await this.getStats();
    if (threat.type === 'malware') {
      await this.updateStats({ malwareCount: stats.malwareCount + 1 });
    }
    await this.updateStats({ 
      threatsDetectedToday: stats.threatsDetectedToday + 1,
      lastUpdated: new Date()
    });
    
    return newThreat;
  }
  
  async updateThreat(id: number, threatUpdate: Partial<Threat>): Promise<Threat | undefined> {
    const threat = this.threats.get(id);
    if (!threat) return undefined;
    
    const updatedThreat = { ...threat, ...threatUpdate };
    this.threats.set(id, updatedThreat);
    return updatedThreat;
  }
  
  // Activity methods
  async getAllActivities(limit?: number): Promise<Activity[]> {
    const sorted = this.activities.sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    if (limit) {
      return sorted.slice(0, limit);
    }
    
    return sorted;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const newActivity: Activity = { 
      ...activity, 
      id,
      timestamp: activity.timestamp || new Date(),
      relatedThreatId: activity.relatedThreatId !== undefined ? activity.relatedThreatId : null
    };
    this.activities.push(newActivity);
    return newActivity;
  }
  
  // Stats methods
  async getStats(): Promise<Stats> {
    return this.statData;
  }
  
  async updateStats(statsUpdate: Partial<InsertStats>): Promise<Stats> {
    this.statData = { ...this.statData, ...statsUpdate, lastUpdated: new Date() };
    return this.statData;
  }

  // Email methods
  async getAllEmails(limit?: number): Promise<Email[]> {
    const sorted = Array.from(this.emails.values()).sort((a, b) => {
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });
    
    if (limit) {
      return sorted.slice(0, limit);
    }
    
    return sorted;
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async getEmailByMessageId(messageId: string): Promise<Email | undefined> {
    return Array.from(this.emails.values()).find(
      (email) => email.messageId === messageId
    );
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const id = this.currentEmailId++;
    const newEmail: Email = { 
      ...email, 
      id,
      receivedAt: email.receivedAt || new Date(),
      isPhishing: email.isPhishing !== undefined ? email.isPhishing : false,
      phishingScore: email.phishingScore || 0,
      analysisStatus: email.analysisStatus || "pending",
      quarantined: email.quarantined !== undefined ? email.quarantined : false,
      senderName: email.senderName || null,
      htmlBody: email.htmlBody || null,
      attachments: email.attachments || null,
      phishingIndicators: email.phishingIndicators || null,
      ipAddress: email.ipAddress || null,
      userAgent: email.userAgent || null,
      spfResult: email.spfResult || null,
      dkimResult: email.dkimResult || null,
      dmarcResult: email.dmarcResult || null,
      domainReputation: email.domainReputation || null,
      linkAnalysis: email.linkAnalysis || null,
      threatClassification: email.threatClassification || null,
      relatedThreatId: email.relatedThreatId || null
    };
    this.emails.set(id, newEmail);
    return newEmail;
  }

  async updateEmail(id: number, emailUpdate: Partial<Email>): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updatedEmail = { ...email, ...emailUpdate };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }

  async getEmailsByPhishingStatus(isPhishing: boolean, limit?: number): Promise<Email[]> {
    const filtered = Array.from(this.emails.values())
      .filter(email => email.isPhishing === isPhishing)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    
    if (limit) {
      return filtered.slice(0, limit);
    }
    
    return filtered;
  }

  async getEmailsByQuarantineStatus(quarantined: boolean, limit?: number): Promise<Email[]> {
    const filtered = Array.from(this.emails.values())
      .filter(email => email.quarantined === quarantined)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    
    if (limit) {
      return filtered.slice(0, limit);
    }
    
    return filtered;
  }

  async getEmailsByAnalysisStatus(status: string, limit?: number): Promise<Email[]> {
    const filtered = Array.from(this.emails.values())
      .filter(email => email.analysisStatus === status)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    
    if (limit) {
      return filtered.slice(0, limit);
    }
    
    return filtered;
  }

  // Missing threat methods
  async getRelatedThreats(threatId: number): Promise<Threat[]> {
    return Array.from(this.threats.values()).filter(threat => 
      threat.relatedThreats && JSON.parse(threat.relatedThreats).includes(threatId)
    );
  }

  async getThreatsByType(type: string): Promise<Threat[]> {
    return Array.from(this.threats.values()).filter(threat => threat.type === type);
  }

  async getThreatsBySeverity(severity: string): Promise<Threat[]> {
    return Array.from(this.threats.values()).filter(threat => threat.severity === severity);
  }

  async getThreatsByTimeRange(startDate: Date, endDate: Date): Promise<Threat[]> {
    return Array.from(this.threats.values()).filter(threat => {
      const threatTime = new Date(threat.timestamp);
      return threatTime >= startDate && threatTime <= endDate;
    });
  }

  // Missing activity methods
  async getActivitiesByType(type: string, limit?: number): Promise<Activity[]> {
    const filtered = this.activities
      .filter(activity => activity.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (limit) {
      return filtered.slice(0, limit);
    }
    
    return filtered;
  }

  async getActivitiesByRelatedThreat(threatId: number, limit?: number): Promise<Activity[]> {
    const filtered = this.activities
      .filter(activity => activity.relatedThreatId === threatId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (limit) {
      return filtered.slice(0, limit);
    }
    
    return filtered;
  }

  // Missing stats methods
  async getThreatTrends(): Promise<{period: string, count: number}[]> {
    return this.threatTrends;
  }

  async getPredictedThreats(): Promise<{type: string, probability: number}[]> {
    return this.predictedThreats;
  }

  async getAnomalyDetection(): Promise<{timestamp: Date, score: number, description: string}[]> {
    return this.anomalyDetection;
  }

  async getSecurityPostureHistory(): Promise<{timestamp: Date, score: number}[]> {
    return this.securityPostureHistory;
  }

  // AI Analysis methods
  async analyzeAttackPattern(threatId: number): Promise<{pattern: string, confidence: number, similarThreats: number[]}> {
    const threat = await this.getThreat(threatId);
    if (!threat) {
      return { pattern: "unknown", confidence: 0, similarThreats: [] };
    }
    
    // Simulate AI analysis
    const patterns = ["credential_harvesting", "social_engineering", "domain_spoofing", "malware_delivery"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100
    const similarThreats = Array.from(this.threats.values())
      .filter(t => t.type === threat.type && t.id !== threatId)
      .slice(0, 3)
      .map(t => t.id);
    
    return { pattern, confidence, similarThreats };
  }

  async generateMitigationSteps(threatId: number): Promise<{step: string, priority: string, description: string}[]> {
    const threat = await this.getThreat(threatId);
    if (!threat) return [];
    
    // Generate appropriate mitigation steps based on threat type
    const steps = [
      { step: "Quarantine threat", priority: "high", description: "Isolate affected systems immediately" },
      { step: "Update signatures", priority: "medium", description: "Update detection rules with new patterns" },
      { step: "Notify security team", priority: "high", description: "Alert incident response team" },
      { step: "Monitor for similar threats", priority: "medium", description: "Increase monitoring for related patterns" }
    ];
    
    return steps;
  }

  async calculateRiskScore(threatId: number): Promise<{score: number, factors: {factor: string, impact: number}[]}> {
    const threat = await this.getThreat(threatId);
    if (!threat) {
      return { score: 0, factors: [] };
    }
    
    const factors = [
      { factor: "Confidence Level", impact: threat.confidence },
      { factor: "Severity Rating", impact: threat.severity === "critical" ? 95 : threat.severity === "high" ? 75 : 50 },
      { factor: "Target Criticality", impact: Math.floor(Math.random() * 40) + 60 }
    ];
    
    const score = Math.floor(factors.reduce((acc, f) => acc + f.impact, 0) / factors.length);
    
    return { score, factors };
  }

  async predictAttackVector(sourceIp: string): Promise<{vector: string, probability: number}[]> {
    const vectors = [
      { vector: "brute_force", probability: Math.floor(Math.random() * 30) + 20 },
      { vector: "phishing", probability: Math.floor(Math.random() * 25) + 15 },
      { vector: "malware", probability: Math.floor(Math.random() * 20) + 10 },
      { vector: "social_engineering", probability: Math.floor(Math.random() * 15) + 5 }
    ];
    
    return vectors.sort((a, b) => b.probability - a.probability);
  }
  
  // Seed with initial data
  private seedData() {
    // Sample threats
    const sampleThreats: InsertThreat[] = [
      {
        threatId: 'THR-1082',
        type: 'malware',
        source: 'download.example.com',
        target: 'System Files',
        description: 'Trojan.Emotet variant detected in a file download',
        confidence: 95,
        severity: 'critical',
        status: 'active',
        timestamp: new Date(Date.now() - 45 * 60000), // 45 mins ago
        mitigated: false
      },
      {
        threatId: 'THR-1081',
        type: 'phishing',
        source: 'mail-server.example.net',
        target: 'User Credentials',
        description: 'Email claiming to be from PayPal contains suspicious link',
        confidence: 87,
        severity: 'high',
        status: 'quarantined',
        timestamp: new Date(Date.now() - 180 * 60000), // 3 hours ago
        mitigated: true
      },
      {
        threatId: 'THR-1080',
        type: 'ddos',
        source: 'Multiple IPs',
        target: 'Web Server',
        description: 'Distributed denial of service attack detected from multiple sources',
        confidence: 72,
        severity: 'medium',
        status: 'mitigated',
        timestamp: new Date(Date.now() - 240 * 60000), // 4 hours ago
        mitigated: true
      },
      {
        threatId: 'THR-1079',
        type: 'unauthorized',
        source: '192.168.1.45',
        target: 'Admin Portal',
        description: 'Multiple failed login attempts detected',
        confidence: 65,
        severity: 'medium',
        status: 'analyzing',
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        mitigated: false
      }
    ];
    
    // Add sample threats
    sampleThreats.forEach(threat => {
      const id = this.currentThreatId++;
      // Ensure required properties are present and nullable fields are null instead of undefined
      this.threats.set(id, { 
        ...threat, 
        id,
        timestamp: threat.timestamp || new Date(),
        mitigated: threat.mitigated !== undefined ? threat.mitigated : false,
        attackVector: threat.attackVector || null,
        targetedAssets: threat.targetedAssets || null,
        potentialImpact: threat.potentialImpact || null,
        aiConfidenceScore: threat.aiConfidenceScore || null,
        relatedThreats: threat.relatedThreats || null,
        mitigationSteps: threat.mitigationSteps || null,
        falsePositiveProbability: threat.falsePositiveProbability || null,
        geolocation: threat.geolocation || null,
        behavioralIndicators: threat.behavioralIndicators || null,
        dataExfiltration: threat.dataExfiltration !== undefined ? threat.dataExfiltration : false
      });
    });
    
    // Sample activities
    const sampleActivities: InsertActivity[] = [
      {
        title: 'Malware Blocked',
        description: 'System prevented execution of malicious script from untrusted source',
        type: 'blocked',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
        relatedThreatId: 1
      },
      {
        title: 'Suspicious Login',
        description: 'Unusual login location detected for user admin@example.com',
        type: 'detected',
        timestamp: new Date(Date.now() - 90 * 60000), // 1.5 hours ago
        relatedThreatId: 4
      },
      {
        title: 'AI Model Updated',
        description: 'Threat detection algorithm enhanced with latest patterns',
        type: 'updated',
        timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
        relatedThreatId: null
      },
      {
        title: 'Security Scan Completed',
        description: 'Full system scan completed with 3 items requiring attention',
        type: 'scan',
        timestamp: new Date(Date.now() - 150 * 60000), // 2.5 hours ago
        relatedThreatId: null
      }
    ];
    
    // Add sample activities
    sampleActivities.forEach(activity => {
      const id = this.currentActivityId++;
      // Ensure required properties are present
      this.activities.push({ 
        ...activity, 
        id,
        timestamp: activity.timestamp || new Date(),
        relatedThreatId: activity.relatedThreatId !== undefined ? activity.relatedThreatId : null
      });
    });
  }
}

export const storage = new MemStorage();
