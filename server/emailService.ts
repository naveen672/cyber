import nodemailer from 'nodemailer';

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify the transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

export interface DOSAlertData {
  currentTraffic: number;
  threshold: number;
  attackingIPs: string[];
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export async function sendDOSAlert(alertData: DOSAlertData): Promise<boolean> {
  try {
    const { currentTraffic, threshold, attackingIPs, timestamp, severity } = alertData;
    
    const severityColors = {
      low: '#FFC107',
      medium: '#FF9800', 
      high: '#F44336',
      critical: '#D32F2F'
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: ${severityColors[severity]}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; }
        .ip-list { background-color: #f8f9fa; border-radius: 4px; padding: 10px; margin: 10px 0; }
        .footer { background-color: #343a40; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background-color: #e9ecef; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 DOS Attack Alert - ${severity.toUpperCase()}</h1>
          <p>CyberShield AI Security System</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h3>⚠️ DOS Attack Detected</h3>
            <p>A Denial of Service attack has been detected and is currently being mitigated by our security systems.</p>
          </div>
          
          <h3>Attack Details:</h3>
          <div class="metric">
            <strong>Current Traffic:</strong> ${currentTraffic.toLocaleString()} req/sec
          </div>
          <div class="metric">
            <strong>Threshold:</strong> ${threshold.toLocaleString()} req/sec
          </div>
          <div class="metric">
            <strong>Severity:</strong> ${severity.toUpperCase()}
          </div>
          <div class="metric">
            <strong>Time:</strong> ${timestamp.toLocaleString()}
          </div>
          
          <h3>Attacking IP Addresses:</h3>
          <div class="ip-list">
            ${attackingIPs.map(ip => `<div style="margin: 5px 0; font-family: monospace; font-weight: bold;">${ip}</div>`).join('')}
          </div>
          
          <h3>Automated Response:</h3>
          <ul>
            <li>✅ Malicious IP addresses have been automatically blocked</li>
            <li>✅ Traffic filtering rules have been applied</li>
            <li>✅ Rate limiting is active for suspicious sources</li>
            <li>✅ Legitimate traffic is being prioritized</li>
          </ul>
          
          <div class="alert-box">
            <p><strong>Action Required:</strong> Please review the security logs and consider implementing additional protective measures if the attack persists.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>CyberShield AI Security Platform | Automated Security Alert</p>
          <p>This is an automated message from your cybersecurity monitoring system.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: 'CyberShield AI Security <naveenravi.ch@gmail.com>',
      to: 'naveenravi.ch@gmail.com',
      subject: `🚨 DOS Attack Alert - ${severity.toUpperCase()} | ${currentTraffic} req/sec detected`,
      html: htmlContent,
      text: `
DOS ATTACK ALERT - ${severity.toUpperCase()}

A Denial of Service attack has been detected:
- Current Traffic: ${currentTraffic.toLocaleString()} req/sec
- Threshold: ${threshold.toLocaleString()} req/sec
- Time: ${timestamp.toLocaleString()}
- Attacking IPs: ${attackingIPs.join(', ')}

Automated response is active:
- Malicious IPs blocked
- Traffic filtering applied
- Rate limiting active

CyberShield AI Security Platform
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('DOS alert email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send DOS alert email:', error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}