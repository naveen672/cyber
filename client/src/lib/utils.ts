import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Threat severity levels
export type SeverityLevel = "critical" | "high" | "medium" | "low";

// Threat types
export type ThreatType = "malware" | "phishing" | "ddos" | "unauthorized" | "ransomware";

// Map threat type to icon and color
export const threatTypeConfig: Record<
  ThreatType,
  { icon: string; color: string }
> = {
  malware: { icon: "virus_alert", color: "text-secondary" },
  phishing: { icon: "phishing", color: "text-warning" },
  ddos: { icon: "lan", color: "text-info" },
  unauthorized: { icon: "vpn_key", color: "text-primary" },
  ransomware: { icon: "lock", color: "text-purple-500" },
};

// Map severity level to color
export const severityConfig: Record<
  SeverityLevel,
  { bgColor: string; textColor: string }
> = {
  critical: { bgColor: "bg-secondary", textColor: "text-white" },
  high: { bgColor: "bg-warning", textColor: "text-white" },
  medium: { bgColor: "bg-info", textColor: "text-white" },
  low: { bgColor: "bg-success", textColor: "text-white" },
};

// Format date to readable time
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format a number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get a confidence class based on percentage
export function getConfidenceClass(confidence: number): string {
  if (confidence >= 90) return "bg-secondary";
  if (confidence >= 70) return "bg-warning";
  if (confidence >= 50) return "bg-info";
  return "bg-primary";
}

// Format a date to readable format
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Format risk score to color class
export function getRiskScoreClass(score: number): string {
  if (score >= 80) return "text-secondary";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-info";
  return "text-success";
}

// Get appropriate icon for mitigation priority
export function getMitigationPriorityIcon(priority: string): string {
  switch (priority.toLowerCase()) {
    case "critical":
      return "priority_high";
    case "high":
      return "arrow_upward";
    case "medium":
      return "drag_handle";
    case "low":
      return "arrow_downward";
    default:
      return "info";
  }
}

// Format security score to color and label
export function getSecurityPostureInfo(score: number): { color: string; label: string } {
  if (score >= 90) return { color: "bg-success", label: "Excellent" };
  if (score >= 75) return { color: "bg-info", label: "Good" };
  if (score >= 50) return { color: "bg-warning", label: "Fair" };
  return { color: "bg-secondary", label: "Poor" };
}

// Get anomaly score class
export function getAnomalyScoreClass(score: number): string {
  if (score >= 80) return "text-secondary";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-info";
  return "text-muted-foreground";
}

// Get trend direction icon and class
export function getTrendInfo(trend: string): { icon: string; class: string } {
  switch (trend.toLowerCase()) {
    case "increasing":
      return { icon: "trending_up", class: "text-secondary" };
    case "stable":
      return { icon: "trending_flat", class: "text-info" };
    case "decreasing":
      return { icon: "trending_down", class: "text-success" };
    default:
      return { icon: "help", class: "text-muted-foreground" };
  }
}

// Format probability percentage with appropriate class
export function getProbabilityInfo(probability: number): { value: string; class: string } {
  const value = `${probability}%`;
  if (probability >= 75) return { value, class: "text-secondary" };
  if (probability >= 50) return { value, class: "text-warning" };
  if (probability >= 25) return { value, class: "text-info" };
  return { value, class: "text-muted-foreground" };
}
