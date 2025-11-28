import React from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { cn, threatTypeConfig, severityConfig, formatTime, type SeverityLevel, type ThreatType } from "@/lib/utils";

interface ThreatCardProps {
  id: number;
  threatType: ThreatType;
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  severity: SeverityLevel;
  status: string;
  statusIcon: string;
  statusColor: string;
}

const ThreatCard = ({
  id,
  threatType,
  title,
  description,
  source,
  timestamp,
  severity,
  status,
  statusIcon,
  statusColor
}: ThreatCardProps) => {
  const { icon, color } = threatTypeConfig[threatType];
  const { bgColor, textColor } = severityConfig[severity];
  
  return (
    <Card className="overflow-hidden shadow-lg transition-all duration-200 threat-card">
      <div className={cn(`bg-${threatType} bg-opacity-10 px-4 py-3 flex justify-between items-center`)}>
        <div className="flex items-center">
          <span className={`material-icons ${color} mr-2`}>{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded`}>{severity}</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>Source: {source}</span>
          <span>{formatTime(timestamp)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`material-icons ${statusColor} text-sm mr-1`}>{statusIcon}</span>
            <span className={`text-xs ${statusColor}`}>{status}</span>
          </div>
          <Link href={`/threat/${id}`}>
            <a className="text-primary text-sm hover:underline">Details</a>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ThreatCard;
