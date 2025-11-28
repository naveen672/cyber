import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import { Progress } from "@/components/ui/progress";
import { 
  getConfidenceClass, 
  threatTypeConfig, 
  severityConfig,
  type ThreatType, 
  type SeverityLevel 
} from '@/lib/utils';

interface ThreatItem {
  id: number;
  threatId: string;
  type: ThreatType;
  source: string;
  target: string;
  confidence: number;
  severity: SeverityLevel;
  timestamp: Date;
}

interface ThreatTableProps {
  threats: ThreatItem[];
}

const ThreatTable = ({ threats }: ThreatTableProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border flex justify-between items-center">
        <CardTitle className="text-base font-medium">Threat Intelligence</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8">Export</Button>
          <Button variant="default" size="sm" className="h-8">Refresh</Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Threat ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Source</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Target</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Confidence</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {threats.map(threat => {
              const { icon, color } = threatTypeConfig[threat.type as ThreatType];
              const { bgColor, textColor } = severityConfig[threat.severity as SeverityLevel];
              const confidenceClass = getConfidenceClass(threat.confidence);
              
              return (
                <tr key={threat.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm font-mono">{threat.threatId}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className={`material-icons ${color} text-sm mr-2`}>{icon}</span>
                      <span className="text-sm capitalize">{threat.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{threat.source}</td>
                  <td className="py-3 px-4 text-sm">{threat.target}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`${confidenceClass} rounded-full h-1.5`} style={{ width: `${threat.confidence}%` }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{threat.confidence}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`${bgColor} bg-opacity-10 ${color} text-xs px-2 py-1 rounded-full capitalize`}>{threat.severity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/threat/${threat.id}`}>
                      <a className="text-primary hover:underline text-sm">Details</a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ThreatTable;
