import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import { formatTime } from '@/lib/utils';

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  type: string;
  timestamp: Date;
  relatedThreatId: number | null;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  // Get color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'blocked':
        return 'bg-secondary';
      case 'detected':
        return 'bg-warning';
      case 'updated':
        return 'bg-info';
      case 'scan':
        return 'bg-success';
      case 'mitigated':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-border flex justify-between items-center">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center text-xs h-8">
          <span>View All</span>
          <span className="material-icons text-sm ml-1">chevron_right</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`mb-4 pl-6 ${index < activities.length - 1 ? 'pb-4 border-l border-muted' : ''} relative`}
            >
              <div className={`absolute left-[-8px] top-0 h-4 w-4 rounded-full ${getActivityColor(activity.type)}`}></div>
              <div className="text-sm">
                <p className="font-medium">{activity.title}</p>
                <p className="text-muted-foreground text-xs mt-1">{activity.description}</p>
                <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                  <span>{formatTime(new Date(activity.timestamp))}</span>
                  {activity.relatedThreatId && (
                    <Link href={`/threat/${activity.relatedThreatId}`}>
                      <a className="text-primary hover:underline">View Details</a>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
