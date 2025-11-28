import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// New schemas for the threat detection system

// Threat schema
export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  threatId: varchar("threat_id", { length: 10 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // malware, phishing, ddos, unauthorized, ransomware
  source: varchar("source", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // critical, high, medium, low
  status: varchar("status", { length: 20 }).notNull(), // active, mitigated, analyzing, quarantined
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  mitigated: boolean("mitigated").default(false).notNull(),
  attackVector: varchar("attack_vector", { length: 50 }), // initial access method
  targetedAssets: text("targeted_assets"), // JSON array of affected systems
  potentialImpact: varchar("potential_impact", { length: 30 }), // high, moderate, low business impact
  aiConfidenceScore: integer("ai_confidence_score"), // 0-100 AI model confidence
  relatedThreats: text("related_threats"), // JSON array of related threat IDs
  mitigationSteps: text("mitigation_steps"), // JSON array of recommended actions
  falsePositiveProbability: integer("false_positive_probability"), // 0-100 chance it's a false positive
  geolocation: varchar("geolocation", { length: 100 }), // geographic origin of threat
  behavioralIndicators: text("behavioral_indicators"), // JSON array of MITRE ATT&CK patterns
  dataExfiltration: boolean("data_exfiltration").default(false), // indicates data theft attempt
});

export const insertThreatSchema = createInsertSchema(threats).omit({
  id: true
});

export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type Threat = typeof threats.$inferSelect;

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // blocked, detected, updated, scan
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  relatedThreatId: integer("related_threat_id"),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// System stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  threatLevel: varchar("threat_level", { length: 20 }).notNull(), // low, medium, high, critical
  malwareCount: integer("malware_count").notNull(),
  blockedAttacks: integer("blocked_attacks").notNull(),
  aiProtectionStatus: varchar("ai_protection_status", { length: 20 }).notNull(), // active, inactive
  threatsDetectedToday: integer("threats_detected_today").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  
  // Enhanced AI Analytics
  threatTrend: varchar("threat_trend", { length: 20 }), // increasing, stable, decreasing
  predictedAttackVolume: integer("predicted_attack_volume"), // forecasted attacks next 24hrs
  networkAnomalyLevel: integer("network_anomaly_level"), // 0-100 anomaly detection score
  securityPostureScore: integer("security_posture_score"), // 0-100 overall security rating
  modelAccuracy: integer("model_accuracy"), // 0-100 AI model prediction accuracy
  falsePositiveRate: integer("false_positive_rate"), // percentage of false alarms
  meanTimeToDetect: integer("mean_time_to_detect"), // average detection time in seconds
  meanTimeToResolve: integer("mean_time_to_resolve"), // average resolution time in minutes
  threatIntelFeedStatus: varchar("threat_intel_feed_status", { length: 20 }), // active, delayed, inactive
  vulnerableAssets: integer("vulnerable_assets"), // count of systems needing patches
  patchComplianceRate: integer("patch_compliance_rate"), // percentage of systems up-to-date
  riskTolerance: varchar("risk_tolerance", { length: 20 }), // conservative, balanced, aggressive
  aiModelVersion: varchar("ai_model_version", { length: 50 }), // version identifier of AI model
  lastAiTraining: timestamp("last_ai_training"), // when AI was last trained
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true
});

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// Email schema for storing received emails
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  messageId: varchar("message_id", { length: 255 }).notNull().unique(),
  sender: varchar("sender", { length: 255 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  htmlBody: text("html_body"),
  attachments: text("attachments"), // JSON array of attachment info
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  
  // Phishing analysis fields
  isPhishing: boolean("is_phishing").default(false).notNull(),
  phishingScore: integer("phishing_score").default(0), // 0-100 risk score
  phishingIndicators: text("phishing_indicators"), // JSON array of detected indicators
  analysisStatus: varchar("analysis_status", { length: 20 }).default("pending"), // pending, analyzing, completed
  quarantined: boolean("quarantined").default(false).notNull(),
  
  // Email headers and metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  spfResult: varchar("spf_result", { length: 20 }), // pass, fail, neutral, none
  dkimResult: varchar("dkim_result", { length: 20 }), // pass, fail, none
  dmarcResult: varchar("dmarc_result", { length: 20 }), // pass, fail, none
  
  // Additional security fields
  domainReputation: varchar("domain_reputation", { length: 20 }), // trusted, suspicious, malicious, unknown
  linkAnalysis: text("link_analysis"), // JSON array of analyzed URLs
  threatClassification: varchar("threat_classification", { length: 50 }), // credential_theft, malware, spam, etc
  relatedThreatId: integer("related_threat_id"), // Links to threats table
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
