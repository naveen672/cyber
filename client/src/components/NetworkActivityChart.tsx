import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Chart from 'chart.js/auto';
import { cn } from "@/lib/utils";

const NetworkActivityChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Generate data based on selected period
    const data = generateChartData(selectedPeriod);
    
    // Create chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Normal Traffic',
            data: data.normal,
            borderColor: 'hsl(var(--info))',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Suspicious Traffic',
            data: data.suspicious,
            borderColor: 'hsl(var(--warning))',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Malicious Traffic',
            data: data.malicious,
            borderColor: 'hsl(var(--secondary))',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: false,
            pointRadius: (context) => {
              // Make anomaly points larger
              const value = context.dataset.data[context.dataIndex] as number;
              if (value > 80) return 6;
              return 3;
            },
          },
          {
            label: 'Protected',
            data: data.protected,
            borderColor: 'hsl(var(--success))',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))'
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'hsl(var(--card))',
            titleColor: 'hsl(var(--foreground))',
            bodyColor: 'hsl(var(--foreground))',
            borderColor: 'hsl(var(--border))',
            borderWidth: 1,
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selectedPeriod]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-lg">Network Activity</CardTitle>
            <p className="text-muted-foreground text-sm">Real-time traffic analysis</p>
          </div>
          <div className="flex mt-3 sm:mt-0">
            <Button 
              variant={selectedPeriod === 'today' ? 'secondary' : 'ghost'} 
              size="sm"
              className="mr-2 text-xs h-8"
              onClick={() => setSelectedPeriod('today')}
            >
              Today
            </Button>
            <Button 
              variant={selectedPeriod === 'week' ? 'secondary' : 'ghost'} 
              size="sm"
              className="mr-2 text-xs h-8"
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'secondary' : 'ghost'} 
              size="sm"
              className="text-xs h-8"
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full h-64 relative">
          <canvas ref={canvasRef} />
          <Badge className="absolute top-0 right-0 m-2 bg-secondary text-white alert-pulse">
            Anomaly Detected
          </Badge>
        </div>
        
        <div className="flex flex-wrap justify-between mt-6 text-sm">
          <div className="flex items-center mr-4 mb-2">
            <span className="h-3 w-3 bg-info rounded-full mr-2"></span>
            <span className="text-muted-foreground">Normal Traffic</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <span className="h-3 w-3 bg-warning rounded-full mr-2"></span>
            <span className="text-muted-foreground">Suspicious</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <span className="h-3 w-3 bg-secondary rounded-full mr-2"></span>
            <span className="text-muted-foreground">Malicious</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="h-3 w-3 bg-success rounded-full mr-2"></span>
            <span className="text-muted-foreground">Protected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Generate random chart data based on the selected period
function generateChartData(period: 'today' | 'week' | 'month') {
  let labels: string[] = [];
  const dataPoints = period === 'today' ? 24 : period === 'week' ? 7 : 30;
  
  // Generate labels
  if (period === 'today') {
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  } else if (period === 'week') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else {
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  }
  
  // Create base fluctuating data
  const normal = Array.from({ length: dataPoints }, () => 40 + Math.random() * 20);
  const suspicious = Array.from({ length: dataPoints }, () => 20 + Math.random() * 30);
  
  // Add a spike for malicious traffic
  const malicious = Array.from({ length: dataPoints }, () => 10 + Math.random() * 20);
  const spikeIndex = Math.floor(dataPoints * 0.7); // Spike at 70% through the period
  malicious[spikeIndex] = 90 + Math.random() * 10; // Big spike
  
  if (spikeIndex > 0 && spikeIndex < dataPoints - 1) {
    malicious[spikeIndex - 1] = 30 + Math.random() * 20; // Build up
    malicious[spikeIndex + 1] = 30 + Math.random() * 20; // Decline
  }
  
  // Protected traffic follows the malicious but with a slight delay
  const protected_data = [...malicious].map((val, i) => {
    if (i < dataPoints - 1) {
      return Math.max(0, malicious[i] - 5 - Math.random() * 10);
    }
    return val - 5 - Math.random() * 10;
  });
  
  return {
    labels,
    normal,
    suspicious,
    malicious,
    protected: protected_data
  };
}

export default NetworkActivityChart;
