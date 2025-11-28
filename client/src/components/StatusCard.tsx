import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  footer?: React.ReactNode;
  progressValue?: number;
  progressColor?: string;
  footerText?: string;
}

const StatusCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  footer,
  progressValue,
  progressColor,
  footerText,
}: StatusCardProps) => {
  return (
    <Card className="p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className={`text-2xl font-medium mt-1 ${iconColor}`}>{value}</h3>
        </div>
        <div className={cn("rounded-full p-2", iconBgColor)}>
          <span className={`material-icons ${iconColor}`}>{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        {progressValue !== undefined && (
          <Progress
            value={progressValue}
            className="h-2 bg-muted"
            indicatorClassName={progressColor}
          />
        )}
        {footer ? (
          footer
        ) : (
          footerText && <p className="text-xs text-muted-foreground mt-2">{footerText}</p>
        )}
      </div>
    </Card>
  );
};

export default StatusCard;
