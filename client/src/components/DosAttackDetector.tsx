import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useQueryClient } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IPTraffic {
  ip: string;
  requests: number;
  country: string;
  suspicious: boolean;
}

const DosAttackDetector = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [attackDetected, setAttackDetected] = useState(false);
  const [requestsPerSecond, setRequestsPerSecond] = useState(125);
  const [serverLoad, setServerLoad] = useState(15);
  const [threshold, setThreshold] = useState([1000]);
  const [manualTraffic, setManualTraffic] = useState([500]);
  const [topIPs, setTopIPs] = useState<IPTraffic[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    setTopIPs([
      { ip: '192.168.1.100', requests: 45, country: 'Local', suspicious: false },
      { ip: '10.0.0.15', requests: 32, country: 'Local', suspicious: false },
      { ip: '203.45.67.89', requests: 28, country: 'US', suspicious: false },
      { ip: '151.101.193.140', requests: 21, country: 'UK', suspicious: false },
      { ip: '172.16.254.1', requests: 18, country: 'Local', suspicious: false }
    ]);
    
    setTerminalLogs([
      '[INIT] DOS Detection System v2.1.0 loaded',
      '[INIT] Network monitoring interface ready',
      '[INIT] Firewall rules initialized',
      '[READY] Waiting for monitoring activation...'
    ]);

    // Initialize chart data
    const now = new Date();
    const initialLabels = Array.from({ length: 20 }, (_, i) => {
      const time = new Date(now.getTime() - (19 - i) * 2000);
      return time.toLocaleTimeString();
    });
    setTimeLabels(initialLabels);
    setTrafficHistory(Array(20).fill(125));
  }, []);

  // Add log function
  const addLog = (message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'BLOCK' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    setTerminalLogs(prev => [...prev.slice(-20), logMessage]);
  };

  // Real-time monitoring effect
  useEffect(() => {
    if (monitoring) {
      addLog('Network monitoring started', 'INFO');
      
      intervalRef.current = setInterval(() => {
        const currentTraffic = manualTraffic[0] + (Math.random() * 100 - 50);
        
        setRequestsPerSecond(currentTraffic);
        setServerLoad(Math.min(100, Math.max(5, (currentTraffic / 20) + (Math.random() * 10 - 5))));

        // Update chart data
        setTrafficHistory(prev => {
          const newHistory = [...prev.slice(1), Math.floor(currentTraffic)];
          return newHistory;
        });
        setTimeLabels(prev => {
          const newLabels = [...prev.slice(1), new Date().toLocaleTimeString()];
          return newLabels;
        });
        
        // Update top IPs based on current traffic level
        if (currentTraffic > threshold[0]) {
          // High traffic - show attacking IPs
          const attackingIPs = [
            { ip: '185.220.101.42', requests: Math.floor(currentTraffic * 0.3), country: 'Russia', suspicious: true },
            { ip: '94.142.241.194', requests: Math.floor(currentTraffic * 0.25), country: 'China', suspicious: true },
            { ip: '162.247.74.201', requests: Math.floor(currentTraffic * 0.2), country: 'Iran', suspicious: true },
            { ip: '192.42.116.16', requests: Math.floor(currentTraffic * 0.15), country: 'North Korea', suspicious: true },
            { ip: '149.248.8.134', requests: Math.floor(currentTraffic * 0.1), country: 'Unknown', suspicious: true }
          ];
          
          setTopIPs(attackingIPs);
          
          if (!attackDetected) {
            setAttackDetected(true);
            addLog(`DOS ATTACK DETECTED! Traffic: ${Math.floor(currentTraffic)} req/sec`, 'ERROR');
            
            // Block attacking IPs
            const attackingIPsList = attackingIPs.map(ip => ip.ip);
            setBlockedIPs(attackingIPsList);
            
            attackingIPsList.forEach(ip => {
              addLog(`IP ${ip} blocked by firewall`, 'BLOCK');
            });
            
            // Call API to log DOS attack
            fetch('/api/detect-dos', { 
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentTraffic: Math.floor(currentTraffic),
                threshold: threshold[0],
                attackingIPs: attackingIPsList,
                severity: currentTraffic > threshold[0] * 2 ? 'critical' : 'high',
                timestamp: new Date().toISOString(),
                realTimeData: true
              })
            })
            .then(response => response.json())
            .then((data) => {
              addLog('Email alert sent to security team', 'INFO');
              queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
            })
            .catch(error => {
              addLog('Failed to send alert notification', 'ERROR');
            });
          }
        } else {
          // Normal traffic
          const baseRequests = Math.floor(currentTraffic / 5);
          setTopIPs([
            { ip: '192.168.1.100', requests: baseRequests + Math.floor(Math.random() * 20), country: 'Local', suspicious: false },
            { ip: '10.0.0.15', requests: Math.floor(baseRequests * 0.8) + Math.floor(Math.random() * 15), country: 'Local', suspicious: false },
            { ip: '203.45.67.89', requests: Math.floor(baseRequests * 0.6) + Math.floor(Math.random() * 10), country: 'US', suspicious: false },
            { ip: '151.101.193.140', requests: Math.floor(baseRequests * 0.5) + Math.floor(Math.random() * 8), country: 'UK', suspicious: false },
            { ip: '172.16.254.1', requests: Math.floor(baseRequests * 0.4) + Math.floor(Math.random() * 5), country: 'Local', suspicious: false }
          ]);
          
          if (attackDetected) {
            setAttackDetected(false);
            setBlockedIPs([]);
            addLog('Traffic normalized - threat neutralized', 'INFO');
          }
        }
      }, 2000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [monitoring, manualTraffic, threshold, attackDetected, queryClient]);

  const startMonitoring = () => {
    setMonitoring(true);
    setAttackDetected(false);
    setBlockedIPs([]);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    addLog('Network monitoring stopped', 'WARN');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const simulateAttack = () => {
    setManualTraffic([Math.floor(Math.random() * 5000) + 2000]);
    addLog('Simulating high traffic attack scenario', 'WARN');
  };

  const getTrafficStatus = () => {
    if (requestsPerSecond > threshold[0]) return { color: 'text-red-400', label: '[ATTACK-DETECTED]' };
    if (requestsPerSecond > threshold[0] * 0.8) return { color: 'text-yellow-400', label: '[HIGH-TRAFFIC]' };
    if (requestsPerSecond > threshold[0] * 0.5) return { color: 'text-orange-400', label: '[ELEVATED]' };
    return { color: 'text-green-400', label: '[NORMAL]' };
  };

  const trafficStatus = getTrafficStatus();

  // Chart configuration
  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Network Traffic (req/sec)',
        data: trafficHistory,
        borderColor: attackDetected ? '#dc2626' : '#059669',
        backgroundColor: attackDetected ? 'rgba(220, 38, 38, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: attackDetected ? '#dc2626' : '#059669',
        borderWidth: 3,
      },
      {
        label: 'Attack Threshold',
        data: Array(timeLabels.length).fill(threshold[0]),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        borderDash: [8, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        borderColor: '#6b7280',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 8,
          font: {
            size: 11,
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + ' req/s';
          }
        },
        beginAtZero: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      }
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Professional Header */}
      <Card className={`${attackDetected ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${attackDetected ? 'bg-red-500' : monitoring ? 'bg-yellow-500' : 'bg-green-500'}`}>
                <span className="material-icons text-white">security</span>
              </div>
              <div>
                <CardTitle className="text-xl">DOS Attack Detection System</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time network traffic monitoring and threat mitigation</p>
              </div>
            </div>
            <Badge 
              variant={attackDetected ? "destructive" : monitoring ? "secondary" : "default"}
              className="text-sm px-4 py-2"
            >
              {monitoring ? "Active Monitoring" : attackDetected ? "Attack Detected" : "Standby"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="ml-2 font-medium">Network monitoring system operational</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
              <span className="ml-2 font-medium">{threshold[0]} requests/second</span>
            </div>
            {attackDetected && (
              <div>
                <span className="text-red-600">Alert:</span>
                <span className="ml-2 font-medium text-red-600">DOS attack detected - countermeasures active</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Traffic Graph - Large */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="material-icons mr-2 text-blue-600">show_chart</span>
            Real-time Network Traffic Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full bg-white dark:bg-gray-900 border rounded-lg p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-600 dark:text-gray-400">Current Traffic</div>
              <div className={`text-xl font-bold ${trafficStatus.color.replace('text-', 'text-')}`}>
                {Math.floor(requestsPerSecond)} req/sec
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 dark:text-gray-400">Threshold</div>
              <div className="text-xl font-bold text-orange-600">{threshold[0]} req/sec</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 dark:text-gray-400">Server Load</div>
              <div className={`text-xl font-bold ${serverLoad > 80 ? 'text-red-600' : serverLoad > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                {Math.floor(serverLoad)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 dark:text-gray-400">Status</div>
              <div className={`text-lg font-medium ${trafficStatus.color.replace('text-', 'text-')}`}>
                {trafficStatus.label.replace(/\[|\]/g, '')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls and Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2 text-purple-600">tune</span>
              Detection Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Attack Threshold: {threshold[0]} requests/second
              </label>
              <Slider
                value={threshold}
                onValueChange={setThreshold}
                max={5000}
                min={100}
                step={100}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Simulate Traffic: {manualTraffic[0]} requests/second
              </label>
              <Slider
                value={manualTraffic}
                onValueChange={setManualTraffic}
                max={8000}
                min={50}
                step={50}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={monitoring ? stopMonitoring : startMonitoring}
                className={monitoring ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
              >
                <span className="material-icons text-sm mr-2">
                  {monitoring ? 'stop' : 'play_arrow'}
                </span>
                {monitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
              <Button 
                onClick={simulateAttack} 
                disabled={!monitoring}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                <span className="material-icons text-sm mr-2">warning</span>
                Simulate Attack
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - IP Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2 text-indigo-600">language</span>
              IP Address Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIPs.map((ipData, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    ipData.suspicious 
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' 
                      : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`material-icons ${ipData.suspicious ? 'text-red-600' : 'text-green-600'}`}>
                      {ipData.suspicious ? 'dangerous' : 'verified'}
                    </span>
                    <div>
                      <div className="font-mono text-lg font-semibold">{ipData.ip}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{ipData.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{ipData.requests.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">requests</div>
                  </div>
                  {ipData.suspicious && (
                    <Badge variant="destructive" className="ml-3">
                      <span className="material-icons text-xs mr-1">block</span>
                      Blocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="material-icons mr-2 text-gray-600">article</span>
            System Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4 h-48 overflow-y-auto">
            <div className="space-y-2 text-sm font-mono">
              {terminalLogs.map((log, index) => (
                <div key={index} className={`${
                  log.includes('[ERROR]') ? 'text-red-600' :
                  log.includes('[WARN]') ? 'text-orange-600' :
                  log.includes('[BLOCK]') ? 'text-purple-600' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attack Alert Banner */}
      {attackDetected && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500 rounded-full">
                  <span className="material-icons text-white text-2xl">warning</span>
                </div>
                <div>
                  <div className="text-red-600 font-bold text-lg">CRITICAL: DOS Attack Detected</div>
                  <div className="text-red-600 text-sm">
                    {blockedIPs.length} attacking IP addresses have been automatically blocked
                  </div>
                </div>
              </div>
              <Badge variant="destructive" className="text-sm px-4 py-2">
                Email Alert Sent
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DosAttackDetector;