import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from 'chart.js/auto';
import { cn } from "@/lib/utils";

interface ThreatDistributionData {
  malware: number;
  phishing: number;
  ddos: number;
  unauthorized: number;
}

interface ThreatDistributionChartProps {
  data: ThreatDistributionData;
}

const ThreatDistributionChart = ({ data }: ThreatDistributionChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const total = data.malware + data.phishing + data.ddos + data.unauthorized;
    
    // Create chart
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Malware', 'Phishing', 'DDoS', 'Unauthorized'],
        datasets: [
          {
            data: [data.malware, data.phishing, data.ddos, data.unauthorized],
            backgroundColor: [
              'hsl(var(--secondary))',
              'hsl(var(--warning))',
              'hsl(var(--info))',
              'hsl(var(--primary))',
            ],
            borderColor: 'hsl(var(--card))',
            borderWidth: 2,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'hsl(var(--card))',
            titleColor: 'hsl(var(--foreground))',
            bodyColor: 'hsl(var(--foreground))',
            borderColor: 'hsl(var(--border))',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${percentage}%`;
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  // Calculate percentages
  const total = data.malware + data.phishing + data.ddos + data.unauthorized;
  const malwarePercent = Math.round((data.malware / total) * 100);
  const phishingPercent = Math.round((data.phishing / total) * 100);
  const ddosPercent = Math.round((data.ddos / total) * 100);
  const unauthorizedPercent = Math.round((data.unauthorized / total) * 100);

  return (
    <div className="mb-6">
      <h4 className="text-sm text-muted-foreground mb-2">Threat Distribution by Type</h4>
      <div className="h-64 w-full relative">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-sm text-muted-foreground">Total Threats</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 mt-6">
        <div className="bg-muted rounded p-3">
          <div className="flex items-center mb-2">
            <span className="material-icons text-secondary text-sm mr-2">bug_report</span>
            <span className="text-sm">Malware</span>
          </div>
          <p className="text-xl font-medium">{malwarePercent}%</p>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="flex items-center mb-2">
            <span className="material-icons text-warning text-sm mr-2">phishing</span>
            <span className="text-sm">Phishing</span>
          </div>
          <p className="text-xl font-medium">{phishingPercent}%</p>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="flex items-center mb-2">
            <span className="material-icons text-info text-sm mr-2">lan</span>
            <span className="text-sm">DDoS</span>
          </div>
          <p className="text-xl font-medium">{ddosPercent}%</p>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="flex items-center mb-2">
            <span className="material-icons text-primary text-sm mr-2">vpn_key</span>
            <span className="text-sm">Unauthorized</span>
          </div>
          <p className="text-xl font-medium">{unauthorizedPercent}%</p>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <span className="font-medium text-info">AI Insight:</span> Based on recent patterns, we've detected an 18% increase in sophisticated phishing attempts targeting your organization's financial department.
        </p>
        <p>
          <span className="font-medium text-primary">Recommendation:</span> Consider implementing additional security training for finance team members.
        </p>
      </div>
    </div>
  );
};

export default ThreatDistributionChart;
