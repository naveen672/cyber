import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThreatSchema, insertActivitySchema, insertEmailSchema } from "@shared/schema";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { PhishingDetector, type EmailData } from "./phishingDetector";
import { WebsiteAnalyzer } from "./websiteAnalyzer";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Get system stats
  apiRouter.get("/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system stats" });
    }
  });

  // Get all threats
  apiRouter.get("/threats", async (req, res) => {
    try {
      const threats = await storage.getAllThreats();
      res.json(threats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threats" });
    }
  });

  // Get a specific threat
  apiRouter.get("/threats/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }

      const threat = await storage.getThreat(id);
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }

      res.json(threat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threat" });
    }
  });

  // Create a new threat
  apiRouter.post("/threats", async (req, res) => {
    try {
      const threatData = insertThreatSchema.parse(req.body);
      const threat = await storage.createThreat(threatData);
      
      // Create an activity record for this threat
      const activityData = {
        title: `New ${threatData.type} Threat Detected`,
        description: threatData.description,
        type: 'detected',
        timestamp: new Date(),
        relatedThreatId: threat.id
      };
      
      await storage.createActivity(activityData);
      
      res.status(201).json(threat);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create threat" });
    }
  });

  // Update a threat
  apiRouter.patch("/threats/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }

      const existingThreat = await storage.getThreat(id);
      if (!existingThreat) {
        return res.status(404).json({ error: "Threat not found" });
      }

      // Validate partial schema
      const updateSchema = insertThreatSchema.partial();
      const threatUpdate = updateSchema.parse(req.body);
      
      const updatedThreat = await storage.updateThreat(id, threatUpdate);
      
      // If threat is mitigated, create an activity
      if (threatUpdate.mitigated === true && !existingThreat.mitigated) {
        const activityData = {
          title: `${existingThreat.type.charAt(0).toUpperCase() + existingThreat.type.slice(1)} Threat Mitigated`,
          description: `Successfully mitigated threat: ${existingThreat.description}`,
          type: 'mitigated',
          timestamp: new Date(),
          relatedThreatId: existingThreat.id
        };
        
        await storage.createActivity(activityData);
        
        // Update blocked attacks count
        const stats = await storage.getStats();
        await storage.updateStats({ 
          blockedAttacks: stats.blockedAttacks + 1,
          lastUpdated: new Date()
        });
      }
      
      res.json(updatedThreat);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to update threat" });
    }
  });

  // Get recent activities
  apiRouter.get("/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getAllActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Create a new activity
  apiRouter.post("/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // Trigger a security scan
  apiRouter.post("/scan", async (req, res) => {
    try {
      // Create an activity for the scan
      const scanActivity = {
        title: "Security Scan Initiated",
        description: "Running comprehensive security scan of the system",
        type: "scan",
        timestamp: new Date(),
        relatedThreatId: null
      };
      
      await storage.createActivity(scanActivity);
      
      // Simulate finding new threats during scan
      // This would be replaced with actual scanning logic in a real system
      const threatTypes: ("malware" | "phishing" | "ddos" | "unauthorized")[] = ["malware", "phishing", "ddos", "unauthorized"];
      const severity: ("critical" | "high" | "medium" | "low")[] = ["critical", "high", "medium", "low"];
      const status: ("active" | "mitigated" | "analyzing" | "quarantined")[] = ["active", "analyzing"];
      
      // Generate a random threat as an example
      const randomType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const randomSeverity = severity[Math.floor(Math.random() * severity.length)];
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      
      const newThreat = {
        threatId: `THR-${1083 + Math.floor(Math.random() * 100)}`,
        type: randomType,
        source: randomType === "ddos" ? "Multiple IPs" : `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        target: ["System Files", "User Credentials", "Web Server", "Database", "Admin Portal"][Math.floor(Math.random() * 5)],
        description: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} attempt detected during security scan`,
        confidence: 50 + Math.floor(Math.random() * 50),
        severity: randomSeverity,
        status: randomStatus,
        timestamp: new Date(),
        mitigated: false
      };
      
      const threat = await storage.createThreat(newThreat);
      
      // Create an activity for the found threat
      const threatActivity = {
        title: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Threat Found`,
        description: newThreat.description,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: threat.id
      };
      
      await storage.createActivity(threatActivity);
      
      // Complete the scan
      const completionActivity = {
        title: "Security Scan Completed",
        description: "Scan completed with 1 new threat identified",
        type: "scan",
        timestamp: new Date(Date.now() + 5000), // 5 seconds later
        relatedThreatId: null
      };
      
      const savedActivity = await storage.createActivity(completionActivity);
      
      res.json({ 
        message: "Security scan initiated",
        threatFound: threat,
        scanId: savedActivity.id
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate security scan" });
    }
  });

  // Suspicious login detection endpoint
  apiRouter.post("/detect-suspicious-login", async (req, res) => {
    try {
      // Generate random IP
      const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      
      // Create a new unauthorized access threat
      const newLoginThreat = {
        threatId: `THR-${9000 + Math.floor(Math.random() * 999)}`,
        type: "unauthorized",
        source: randomIP,
        target: "Admin Portal",
        description: "Multiple failed login attempts detected from unknown IP address",
        confidence: 85,
        severity: "high",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };
      
      // Use the storage method to create the threat
      const newThreat = await storage.createThreat(newLoginThreat);
      
      // Create an activity for this threat
      const newActivity = {
        title: "Suspicious Login Attempt",
        description: `Multiple failed login attempts from IP ${randomIP}`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: newThreat.id
      };
      
      // Use the storage method to create the activity
      await storage.createActivity(newActivity);
      
      // Update stats
      const stats = await storage.getStats();
      await storage.updateStats({
        threatsDetectedToday: stats.threatsDetectedToday + 1,
        lastUpdated: new Date()
      });
      
      // Respond with success
      res.json({
        success: true,
        message: "New suspicious login threat detected",
        threatDetails: newThreat
      });
    } catch (error) {
      console.error("Error creating threat:", error);
      res.status(500).json({ error: "Failed to create threat" });
    }
  });

  // DOS Attack Detection Endpoint
  apiRouter.post("/detect-dos", async (req, res) => {
    try {
      const { currentTraffic, threshold, attackingIPs, severity } = req.body;
      
      // Import email service dynamically
      const { sendDOSAlert } = await import('./emailService');
      
      // Create new DOS attack threat with real data
      const newThreat = {
        threatId: `THR-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "ddos",
        source: `${attackingIPs?.length || 'Multiple'} Suspicious IPs`,
        target: "Web Server",
        description: `DOS attack detected: ${currentTraffic} req/sec from ${attackingIPs?.length || 'multiple'} sources (threshold: ${threshold} req/sec)`,
        confidence: 94,
        severity: severity || "critical",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };

      await storage.createThreat(newThreat);
      
      // Send email alert with real attack data
      try {
        await sendDOSAlert({
          currentTraffic: currentTraffic || 0,
          threshold: threshold || 1000,
          attackingIPs: attackingIPs || [],
          timestamp: new Date(),
          severity: severity || 'critical'
        });
        console.log('DOS attack email alert sent successfully');
      } catch (emailError) {
        console.error('Failed to send DOS alert email:', emailError);
      }
      
      // Add activity log
      await storage.createActivity({
        title: "DOS Attack Detected",
        description: `Critical DOS attack blocked - ${currentTraffic} req/sec detected`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json({ 
        success: true, 
        message: "DOS attack detected and blocked",
        emailSent: true,
        threatId: newThreat.threatId
      });
    } catch (error) {
      console.error("Error detecting DOS attack:", error);
      res.status(500).json({ error: "Failed to process DOS detection" });
    }
  });

  // Real-time traffic monitoring endpoint
  apiRouter.get("/traffic-data", async (req, res) => {
    try {
      const { generateTrafficData, getClientRealIP } = await import('./ipService');
      
      // Get current traffic level from query params or generate realistic data
      const currentLevel = parseInt(req.query.level as string) || Math.floor(Math.random() * 1500) + 100;
      
      // Generate real-time traffic data
      const trafficData = generateTrafficData(currentLevel);
      
      // Get client's real IP for reference
      const clientIP = await getClientRealIP();
      
      res.json({
        success: true,
        data: {
          ...trafficData,
          clientIP,
          serverTime: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      res.status(500).json({ error: "Failed to fetch traffic data" });
    }
  });

  // Test email connection endpoint
  apiRouter.post("/test-email", async (req, res) => {
    try {
      const { testEmailConnection } = await import('./emailService');
      const isConnected = await testEmailConnection();
      
      res.json({
        success: isConnected,
        message: isConnected ? "Email service connected successfully" : "Email service connection failed"
      });
    } catch (error) {
      console.error("Error testing email connection:", error);
      res.status(500).json({ error: "Failed to test email connection" });
    }
  });

  // Phishing Email Detection Endpoint
  apiRouter.post("/detect-phishing", async (req, res) => {
    try {
      const { threatsCount } = req.body;
      
      // Create new phishing threat
      const newThreat = {
        threatId: `PHI-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "phishing",
        source: "Email Security Scanner",
        target: "Email System",
        description: `${threatsCount} phishing emails detected and quarantined automatically`,
        confidence: 91,
        severity: "high",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };

      await storage.createThreat(newThreat);

      // Add activity log
      await storage.createActivity({
        title: "Phishing Emails Blocked",
        description: `${threatsCount} phishing attempts quarantined`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json({ success: true, message: "Phishing emails detected and blocked" });
    } catch (error) {
      console.error("Error detecting phishing:", error);
      res.status(500).json({ error: "Failed to process phishing detection" });
    }
  });

  // USB Threat Detection Endpoint
  apiRouter.post("/detect-usb-threat", async (req, res) => {
    try {
      const { devicesScanned, threatsFound } = req.body;
      
      // Create new USB threat
      const newThreat = {
        threatId: `USB-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "malware",
        source: "USB Security Scanner",
        target: "USB Devices",
        description: `USB scan completed: ${threatsFound} malicious devices found out of ${devicesScanned} scanned`,
        confidence: 88,
        severity: threatsFound > 0 ? "high" : "low",
        status: threatsFound > 0 ? "active" : "resolved",
        timestamp: new Date(),
        mitigated: threatsFound === 0
      };

      await storage.createThreat(newThreat);

      // Add activity log
      await storage.createActivity({
        title: "USB Device Scan",
        description: `${devicesScanned} USB devices scanned, ${threatsFound} threats found`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json({ success: true, message: "USB threat scan completed" });
    } catch (error) {
      console.error("Error detecting USB threats:", error);
      res.status(500).json({ error: "Failed to process USB threat detection" });
    }
  });

  // Network Intrusion Detection Endpoint
  apiRouter.post("/detect-network-intrusion", async (req, res) => {
    try {
      const { intrusionsFound, criticalThreats } = req.body;
      
      // Create new network intrusion threat
      const newThreat = {
        threatId: `NET-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "unauthorized",
        source: "Network Intrusion Detection System",
        target: "Network Infrastructure",
        description: `${intrusionsFound} network intrusion attempts detected, ${criticalThreats} critical threats`,
        confidence: 92,
        severity: criticalThreats > 0 ? "critical" : "high",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };

      await storage.createThreat(newThreat);

      // Add activity log
      await storage.createActivity({
        title: "Network Intrusions Blocked",
        description: `${intrusionsFound} intrusion attempts stopped`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json({ success: true, message: "Network intrusions detected and blocked" });
    } catch (error) {
      console.error("Error detecting network intrusions:", error);
      res.status(500).json({ error: "Failed to process network intrusion detection" });
    }
  });

  // Malicious Website Detection Endpoint
  apiRouter.post("/detect-malicious-website", async (req, res) => {
    try {
      const { sitesBlocked, criticalThreats } = req.body;
      
      // Create new malicious website threat
      const newThreat = {
        threatId: `WEB-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "phishing",
        source: "Web Protection System",
        target: "Web Browsing",
        description: `${sitesBlocked} malicious websites blocked, ${criticalThreats} critical phishing sites`,
        confidence: 96,
        severity: criticalThreats > 0 ? "critical" : "high",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };

      await storage.createThreat(newThreat);

      // Add activity log
      await storage.createActivity({
        title: "Malicious Websites Blocked",
        description: `${sitesBlocked} dangerous websites prevented access`,
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json({ success: true, message: "Malicious websites detected and blocked" });
    } catch (error) {
      console.error("Error detecting malicious websites:", error);
      res.status(500).json({ error: "Failed to process malicious website detection" });
    }
  });

  // AI Analytics API Endpoints
  
  // Get threat trends data
  apiRouter.get("/analytics/threat-trends", async (req, res) => {
    try {
      const trends = await storage.getThreatTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threat trends" });
    }
  });
  
  // Get predicted threats
  apiRouter.get("/analytics/predicted-threats", async (req, res) => {
    try {
      const predictions = await storage.getPredictedThreats();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threat predictions" });
    }
  });
  
  // Get anomaly detection data
  apiRouter.get("/analytics/anomalies", async (req, res) => {
    try {
      const anomalies = await storage.getAnomalyDetection();
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anomaly data" });
    }
  });
  
  // Get security posture history
  apiRouter.get("/analytics/security-posture", async (req, res) => {
    try {
      const history = await storage.getSecurityPostureHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security posture history" });
    }
  });
  
  // Analyze attack pattern for a specific threat
  apiRouter.get("/threats/:id/attack-pattern", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }
      
      const threat = await storage.getThreat(id);
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }
      
      const pattern = await storage.analyzeAttackPattern(id);
      res.json(pattern);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze attack pattern" });
    }
  });
  
  // Get mitigation steps for a specific threat
  apiRouter.get("/threats/:id/mitigation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }
      
      const threat = await storage.getThreat(id);
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }
      
      const steps = await storage.generateMitigationSteps(id);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate mitigation steps" });
    }
  });
  
  // Calculate risk score for a specific threat
  apiRouter.get("/threats/:id/risk-score", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }
      
      const threat = await storage.getThreat(id);
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }
      
      const riskScore = await storage.calculateRiskScore(id);
      res.json(riskScore);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate risk score" });
    }
  });
  
  // Predict attack vectors from a specific IP
  apiRouter.get("/predict-attack-vector", async (req, res) => {
    try {
      const sourceIp = req.query.ip as string;
      if (!sourceIp) {
        return res.status(400).json({ error: "Source IP is required" });
      }
      
      const vectors = await storage.predictAttackVector(sourceIp);
      res.json(vectors);
    } catch (error) {
      res.status(500).json({ error: "Failed to predict attack vectors" });
    }
  });
  
  // Filter threats by type
  apiRouter.get("/threats/filter/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const threats = await storage.getThreatsByType(type);
      res.json(threats);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter threats by type" });
    }
  });
  
  // Filter threats by severity
  apiRouter.get("/threats/filter/severity/:severity", async (req, res) => {
    try {
      const severity = req.params.severity;
      const threats = await storage.getThreatsBySeverity(severity);
      res.json(threats);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter threats by severity" });
    }
  });
  
  // Get related threats
  apiRouter.get("/threats/:id/related", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid threat ID" });
      }
      
      const relatedThreats = await storage.getRelatedThreats(id);
      res.json(relatedThreats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch related threats" });
    }
  });

  // Advanced Persistent Threat (APT) detection endpoint
  apiRouter.post("/detect-apt", async (req, res) => {
    try {
      // Generate random target based on what would make sense for an APT
      const targets = ["Database Server", "Authentication System", "User Directory", "File Storage", "Admin Console"];
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      
      // Create a new APT threat with relevant characteristics - only use required fields
      const newAptThreat = {
        threatId: `THR-${9000 + Math.floor(Math.random() * 999)}`,
        type: "malware", // APTs typically use sophisticated malware
        source: "Multiple IPs", // APTs often use multiple sources
        target: randomTarget,
        description: "Advanced Persistent Threat detected with evidence of lateral movement and data exfiltration attempts",
        confidence: 94, // High confidence
        severity: "critical", // APTs are always critical threats
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };
      
      // Use the storage method to create the threat
      const newThreat = await storage.createThreat(newAptThreat);
      
      // Create detailed activity logs for the APT detection
      const aptDetectionActivity = {
        title: "Advanced Persistent Threat Detected",
        description: "AI detection system identified signs of an APT campaign in the network",
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: newThreat.id
      };
      
      // Log the initial detection activity
      await storage.createActivity(aptDetectionActivity);
      
      // Log additional details as separate activities for better incident timeline
      const additionalActivities = [
        {
          title: "Lateral Movement Detected",
          description: "APT showing signs of privilege escalation and lateral movement between systems",
          type: "detected",
          timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
          relatedThreatId: newThreat.id
        },
        {
          title: "Data Exfiltration Attempt",
          description: "Unusual encrypted data transfers detected to external endpoints",
          type: "detected",
          timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
          relatedThreatId: newThreat.id
        }
      ];
      
      // Log the additional activities
      for (const activity of additionalActivities) {
        await storage.createActivity(activity);
      }
      
      // Update stats to reflect the critical APT detection
      const stats = await storage.getStats();
      await storage.updateStats({
        threatLevel: "critical", // Escalate threat level
        threatsDetectedToday: stats.threatsDetectedToday + 1,
        lastUpdated: new Date()
      });
      
      // Respond with success
      res.json({
        success: true,
        message: "Advanced Persistent Threat detected",
        threatDetails: newThreat,
        recommendedActions: "Immediate isolation and investigation required"
      });
    } catch (error) {
      console.error("Error detecting APT:", error);
      res.status(500).json({ error: "Failed to process APT detection" });
    }
  });

  // DOS attack detection endpoint
  apiRouter.post("/detect-dos", async (req, res) => {
    try {
      // Create a new DOS attack threat
      const newDosThreat = {
        threatId: `THR-${7000 + Math.floor(Math.random() * 999)}`,
        type: "ddos",
        source: "Multiple IPs (Botnet)",
        target: "Web Server",
        description: "Distributed Denial of Service attack detected with traffic spike to 15,000+ requests/second",
        confidence: 99,
        severity: "critical",
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };
      
      const newThreat = await storage.createThreat(newDosThreat);
      
      // Create activity logs for DOS attack
      const dosDetectionActivity = {
        title: "DOS Attack Detected",
        description: "Massive traffic spike detected from botnet - automatic mitigation engaged",
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: newThreat.id
      };
      
      await storage.createActivity(dosDetectionActivity);
      
      // Log mitigation activities
      const mitigationActivities = [
        {
          title: "IP Addresses Blocked",
          description: "5 attacking IP addresses automatically blocked by firewall",
          type: "mitigated",
          timestamp: new Date(Date.now() - 2 * 60000),
          relatedThreatId: newThreat.id
        },
        {
          title: "Rate Limiting Applied",
          description: "Emergency rate limiting activated to protect server resources",
          type: "mitigated",
          timestamp: new Date(Date.now() - 1 * 60000),
          relatedThreatId: newThreat.id
        }
      ];
      
      for (const activity of mitigationActivities) {
        await storage.createActivity(activity);
      }
      
      // Update stats
      const stats = await storage.getStats();
      await storage.updateStats({
        threatLevel: "critical",
        threatsDetectedToday: stats.threatsDetectedToday + 1,
        lastUpdated: new Date()
      });
      
      res.json({
        success: true,
        message: "DOS attack detected and mitigated",
        threatDetails: newThreat,
        blockedIPs: ["185.220.101.42", "94.142.241.194", "162.247.74.201", "192.42.116.16", "149.248.8.134"]
      });
    } catch (error) {
      console.error("Error detecting DOS attack:", error);
      res.status(500).json({ error: "Failed to process DOS attack detection" });
    }
  });

  // Ransomware detection endpoint
  apiRouter.post("/detect-ransomware", async (req, res) => {
    try {
      // Create a new ransomware threat with relevant characteristics
      const newRansomwareThreat = {
        threatId: `THR-${8000 + Math.floor(Math.random() * 999)}`,
        type: "ransomware", // Specific ransomware type
        source: "Email Attachment", // Common ransomware vector
        target: "File System",
        description: "CryptoLock-23 ransomware detected attempting to encrypt critical files",
        confidence: 98, // Very high confidence
        severity: "critical", // Ransomware is always critical
        status: "active",
        timestamp: new Date(),
        mitigated: false
      };
      
      // Use the storage method to create the threat
      const newThreat = await storage.createThreat(newRansomwareThreat);
      
      // Create detailed activity logs for the ransomware detection
      const initialDetectionActivity = {
        title: "Ransomware Attack Detected",
        description: "CryptoLock-23 ransomware detected by behavioral analysis engine",
        type: "detected",
        timestamp: new Date(),
        relatedThreatId: newThreat.id
      };
      
      // Log the initial detection activity
      await storage.createActivity(initialDetectionActivity);
      
      // Log additional ransomware-specific activities
      const additionalActivities = [
        {
          title: "File Encryption Attempted",
          description: "Ransomware attempting to encrypt documents with AES-256 encryption",
          type: "detected",
          timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
          relatedThreatId: newThreat.id
        },
        {
          title: "Backup Protection Engaged",
          description: "Secure file backups isolated to prevent encryption",
          type: "scan",
          timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
          relatedThreatId: newThreat.id
        }
      ];
      
      // Log the additional activities
      for (const activity of additionalActivities) {
        await storage.createActivity(activity);
      }
      
      // Update stats to reflect the critical ransomware detection
      const stats = await storage.getStats();
      await storage.updateStats({
        threatLevel: "critical", // Escalate threat level
        threatsDetectedToday: stats.threatsDetectedToday + 1,
        lastUpdated: new Date()
      });
      
      // Respond with success
      res.json({
        success: true,
        message: "Ransomware detected and contained",
        threatDetails: newThreat,
        affectedFiles: [
          'financial_records.xlsx',
          'customer_database.sql',
          'employee_information.docx',
          'strategic_plan_2025.pptx',
          'research_data.zip',
          'project_designs.pdf'
        ]
      });
    } catch (error) {
      console.error("Error detecting ransomware:", error);
      res.status(500).json({ error: "Failed to process ransomware detection" });
    }
  });

  // Email webhook endpoint for receiving emails (SendGrid Inbound Parse)
  const upload = multer();
  apiRouter.post("/email-webhook", upload.none(), async (req, res) => {
    try {
      // SendGrid sends form data, not JSON
      const {
        from,
        to,
        subject,
        text: body,
        html: htmlBody,
        envelope
      } = req.body;

      if (!from || !to || !subject || !body) {
        return res.status(400).json({ error: "Missing required email fields" });
      }

      // Generate unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Extract sender info
      const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, '', from];
      const senderName = senderMatch[1]?.trim() || null;
      const senderEmail = senderMatch[2] || from;

      // Parse envelope data if available
      let spfResult, dkimResult, dmarcResult, ipAddress;
      try {
        const envelopeData = JSON.parse(envelope || '{}');
        spfResult = envelopeData.spf || null;
        dkimResult = envelopeData.dkim || null;
        dmarcResult = envelopeData.dmarc || null;
        ipAddress = envelopeData.from_ip || null;
      } catch (e) {
        // Envelope parsing failed, continue without it
      }

      // Prepare email data for phishing analysis
      const emailData: EmailData = {
        sender: senderEmail,
        senderName,
        subject,
        body,
        htmlBody,
        recipient: to,
        ipAddress,
        spfResult,
        dkimResult,
        dmarcResult
      };

      // Perform phishing analysis
      const analysis = await PhishingDetector.analyzeEmail(emailData);

      // Create email record
      const emailRecord = {
        messageId,
        sender: senderEmail,
        senderName,
        recipient: to,
        subject,
        body,
        htmlBody,
        isPhishing: analysis.isPhishing,
        phishingScore: analysis.riskScore,
        phishingIndicators: JSON.stringify(analysis.indicators),
        analysisStatus: 'completed',
        quarantined: analysis.isPhishing,
        ipAddress,
        spfResult,
        dkimResult,
        dmarcResult,
        domainReputation: analysis.domainReputation,
        threatClassification: analysis.threatClassification
      };

      // Store the email
      const savedEmail = await storage.createEmail(emailRecord);

      // If phishing detected, create threat record and activity
      if (analysis.isPhishing) {
        const threat = {
          threatId: `PHI-${Math.floor(Math.random() * 9000) + 1000}`,
          type: "phishing",
          source: senderEmail,
          target: "Email System",
          description: `Phishing email detected from ${senderEmail}: ${subject}`,
          confidence: analysis.confidence,
          severity: analysis.riskScore >= 80 ? "critical" : analysis.riskScore >= 60 ? "high" : "medium",
          status: "quarantined",
          timestamp: new Date(),
          mitigated: true,
          threatClassification: analysis.threatClassification,
          relatedThreatId: savedEmail.id
        };

        const createdThreat = await storage.createThreat(threat);

        // Create activity log
        await storage.createActivity({
          title: "Phishing Email Quarantined",
          description: `Automatically quarantined phishing email from ${senderEmail} with ${analysis.riskScore}% risk score`,
          type: "blocked",
          timestamp: new Date(),
          relatedThreatId: createdThreat.id
        });

        console.log(`🚨 Phishing email detected and quarantined: ${subject} from ${senderEmail}`);
      } else {
        console.log(`✅ Email processed safely: ${subject} from ${senderEmail}`);
      }

      res.status(200).json({ 
        success: true, 
        message: "Email processed successfully",
        analysis: {
          isPhishing: analysis.isPhishing,
          riskScore: analysis.riskScore,
          quarantined: analysis.isPhishing
        }
      });

    } catch (error) {
      console.error("Error processing email webhook:", error);
      res.status(500).json({ error: "Failed to process email" });
    }
  });

  // Get all emails
  apiRouter.get("/emails", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const emails = await storage.getAllEmails(limit);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  // Get a specific email
  apiRouter.get("/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid email ID" });
      }

      const email = await storage.getEmail(id);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }

      res.json(email);
    } catch (error) {
      console.error("Error fetching email:", error);
      res.status(500).json({ error: "Failed to fetch email" });
    }
  });

  // Get phishing emails
  apiRouter.get("/emails/phishing/:status", async (req, res) => {
    try {
      const status = req.params.status === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const emails = await storage.getEmailsByPhishingStatus(status, limit);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching phishing emails:", error);
      res.status(500).json({ error: "Failed to fetch phishing emails" });
    }
  });

  // Update email quarantine status
  apiRouter.patch("/emails/:id/quarantine", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid email ID" });
      }

      const { quarantined } = req.body;
      if (typeof quarantined !== 'boolean') {
        return res.status(400).json({ error: "quarantined must be a boolean" });
      }

      const updatedEmail = await storage.updateEmail(id, { quarantined });
      if (!updatedEmail) {
        return res.status(404).json({ error: "Email not found" });
      }

      // Log activity
      await storage.createActivity({
        title: quarantined ? "Email Quarantined" : "Email Released",
        description: `Email "${updatedEmail.subject}" ${quarantined ? 'quarantined' : 'released from quarantine'}`,
        type: quarantined ? "blocked" : "updated",
        timestamp: new Date(),
        relatedThreatId: null
      });

      res.json(updatedEmail);
    } catch (error) {
      console.error("Error updating email quarantine:", error);
      res.status(500).json({ error: "Failed to update email quarantine status" });
    }
  });

  // Manually analyze email for phishing
  apiRouter.post("/emails/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid email ID" });
      }

      const email = await storage.getEmail(id);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }

      // Prepare email data for analysis
      const emailData: EmailData = {
        sender: email.sender,
        senderName: email.senderName || undefined,
        subject: email.subject,
        body: email.body,
        htmlBody: email.htmlBody || undefined,
        recipient: email.recipient,
        ipAddress: email.ipAddress || undefined,
        spfResult: email.spfResult || undefined,
        dkimResult: email.dkimResult || undefined,
        dmarcResult: email.dmarcResult || undefined
      };

      // Re-analyze the email
      const analysis = await PhishingDetector.analyzeEmail(emailData);

      // Update email with new analysis
      const updatedEmail = await storage.updateEmail(id, {
        isPhishing: analysis.isPhishing,
        phishingScore: analysis.riskScore,
        phishingIndicators: JSON.stringify(analysis.indicators),
        analysisStatus: 'completed',
        domainReputation: analysis.domainReputation,
        threatClassification: analysis.threatClassification
      });

      res.json({
        email: updatedEmail,
        analysis
      });

    } catch (error) {
      console.error("Error analyzing email:", error);
      res.status(500).json({ error: "Failed to analyze email" });
    }
  });

  // Send test email endpoint (internal testing)
  apiRouter.post("/emails/test-send", async (req, res) => {
    try {
      const { from, subject, text } = req.body;
      
      if (!from || !subject || !text) {
        return res.status(400).json({ error: "Missing required fields: from, subject, text" });
      }

      // Prepare test email data
      const testEmailData: EmailData = {
        sender: from,
        subject: subject,
        body: text,
        recipient: "security-test@cyberai.app",
        ipAddress: "127.0.0.1" // Test IP
      };

      // Run phishing detection analysis
      const analysis = await PhishingDetector.analyzeEmail(testEmailData);

      // Create email record with analysis results
      const emailRecord = {
        messageId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: from,
        senderName: undefined,
        recipient: "security-test@cyberai.app",
        subject: subject,
        body: text,
        htmlBody: undefined,
        receivedAt: new Date(),
        isPhishing: analysis.isPhishing,
        phishingScore: analysis.riskScore,
        phishingIndicators: JSON.stringify(analysis.indicators),
        analysisStatus: 'completed',
        quarantined: analysis.riskScore >= 60, // Auto-quarantine high-risk emails
        ipAddress: "127.0.0.1",
        domainReputation: analysis.domainReputation,
        threatClassification: analysis.threatClassification,
        spfResult: 'pass', // Default for test emails
        dkimResult: 'pass',
        dmarcResult: 'pass'
      };

      // Store the test email
      const savedEmail = await storage.createEmail(emailRecord);

      // If phishing detected, create threat record
      if (analysis.isPhishing) {
        const threatData = {
          threatId: `PHI-${Math.floor(Math.random() * 9999)}`,
          type: "phishing",
          source: from,
          target: "Email System",
          description: `Test phishing email detected: ${analysis.threatClassification || 'Unknown'} from ${from}`,
          confidence: analysis.riskScore,
          severity: analysis.riskScore >= 80 ? "critical" : analysis.riskScore >= 60 ? "high" : "medium",
          status: "active",
          timestamp: new Date(),
          mitigated: false
        };

        await storage.createThreat(threatData);

        // Create activity log for threat detection
        await storage.createActivity({
          title: "Test Phishing Email Detected",
          description: `Phishing test email analyzed: ${subject} (${analysis.riskScore}% risk)`,
          type: "detected",
          timestamp: new Date(),
          relatedThreatId: null
        });

        console.log(`🧪 Test phishing email detected: ${subject} from ${from} (${analysis.riskScore}% risk)`);
      } else {
        // Create activity log for safe email
        await storage.createActivity({
          title: "Safe Test Email Processed",
          description: `Test email analyzed and marked as safe: ${subject}`,
          type: "analysis",
          timestamp: new Date(),
          relatedThreatId: null
        });

        console.log(`✅ Test email processed as safe: ${subject} from ${from}`);
      }

      res.json({
        success: true,
        message: `Test email processed successfully. ${analysis.isPhishing ? 'Phishing detected!' : 'Email is safe.'}`,
        email: savedEmail,
        analysis: {
          isPhishing: analysis.isPhishing,
          riskScore: analysis.riskScore,
          threatType: analysis.threatClassification,
          indicators: analysis.indicators
        }
      });

    } catch (error) {
      console.error("Error processing test email:", error);
      res.status(500).json({ error: "Failed to process test email" });
    }
  });

  // Website Security Analyzer Endpoint
  apiRouter.post("/analyze-website", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required" });
      }

      const analysis = await WebsiteAnalyzer.analyzeUrl(url);
      
      // Log the analysis as a threat if malicious
      if (analysis.ismalicious) {
        const newThreat = {
          threatId: `WEB-${Math.floor(Math.random() * 9000) + 1000}`,
          type: "malware",
          source: "Website Security Analyzer",
          target: "Web Browser",
          description: `Malicious website detected: ${analysis.category} - ${analysis.description}`,
          confidence: Math.round(((100 - analysis.securityScore) / 100) * 100),
          severity: analysis.riskLevel === 'critical' ? 'critical' : analysis.riskLevel === 'high' ? 'high' : 'medium',
          status: "active",
          timestamp: new Date(),
          mitigated: false
        };

        await storage.createThreat(newThreat);

        await storage.createActivity({
          title: "Malicious Website Blocked",
          description: `${analysis.category}: ${url}`,
          type: "detected",
          timestamp: new Date(),
          relatedThreatId: null
        });
      }

      res.json({ 
        success: true, 
        analysis 
      });
    } catch (error: any) {
      console.error("Error analyzing website:", error);
      res.status(500).json({ 
        error: error.message || "Failed to analyze website" 
      });
    }
  });

  // Cybersecurity Chatbot API Endpoint
  apiRouter.post("/chat", async (req, res) => {
    try {
      const { messages, userMessage } = req.body;
      
      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: "User message is required" });
      }

      const { getChatResponse } = await import('./chatbotService');
      const response = await getChatResponse(messages || [], userMessage);
      
      res.json({ 
        success: true, 
        response 
      });
    } catch (error: any) {
      console.error("Error in chatbot:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat message" 
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
