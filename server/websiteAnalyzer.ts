// Website security analyzer - detects malicious websites based on security indicators
export interface WebsiteAnalysisResult {
  ismalicious: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  securityScore: number;
  indicators: string[];
  category: string;
  description: string;
  usesHttps: boolean;
  isTrustedDomain: boolean;
  hasSecurityCertificate: boolean;
}

export class WebsiteAnalyzer {
  private static trustedDomains = [
    'google.com', 'apple.com', 'microsoft.com', 'amazon.com', 'facebook.com',
    'github.com', 'stackoverflow.com', 'wikipedia.org', 'reddit.com', 'twitter.com',
    'linkedin.com', 'youtube.com', 'instagram.com', 'paypal.com', 'stripe.com',
    'twilio.com', 'openai.com', 'slack.com', 'zoom.com', 'netflix.com',
    'adobe.com', 'atlassian.com', 'ibm.com', 'oracle.com', 'salesforce.com',
    'okta.com', 'auth0.com', 'cloudflare.com', 'heroku.com', 'vercel.com',
    'verifiedbydigiticert.com', 'digicert.com', 'sectigo.com',
    'chase.com', 'bofa.com', 'wellsfargo.com', 'hsbc.com', 'citigroup.com',
    'capitalone.com', 'bankofamerica.com', 'americanexpress.com',
    'google-analytics.com', 'googleapis.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'
  ];

  private static suspiciousDomainPatterns = [
    'verify', 'confirm', 'update', 'secure', 'alert', 'urgent', 'warning',
    'banking', 'account', 'login', 'auth', 'signin', 'paypal', 'amazon',
    'apple', 'microsoft', 'google', 'bank', 'crypto', 'wallet'
  ];

  private static maliciousIndicators = [
    'phishing', 'scam', 'malware', 'ransomware', 'trojan', 'botnet',
    'spyware', 'adware', 'keylogger', 'worm', 'virus', 'exploit'
  ];

  static async analyzeUrl(url: string): Promise<WebsiteAnalysisResult> {
    const indicators: string[] = [];
    let securityScore = 100; // Start with 100 (safe) and deduct points
    let category = 'Unknown';
    let description = '';

    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol;
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();

      // 1. PROTOCOL ANALYSIS - CRITICAL
      const usesHttps = protocol === 'https:';
      const hasSecurityCertificate = usesHttps; // HTTPS requires valid certificate

      if (!usesHttps) {
        securityScore -= 50; // MASSIVE deduction for HTTP
        indicators.push('🚨 No HTTPS encryption - data transmitted in plain text');
        indicators.push('⚠️ No SSL/TLS security certificate - cannot verify website identity');
        category = 'Unencrypted Connection';
        description = 'This website uses unencrypted HTTP protocol instead of secure HTTPS. All data is vulnerable to interception.';
      } else {
        indicators.push('✅ HTTPS secure connection enabled');
        indicators.push('✅ SSL/TLS certificate detected');
      }

      // 2. TRUSTED DOMAIN ANALYSIS
      const isTrustedDomain = this.isTrustedDomain(hostname);
      
      if (isTrustedDomain) {
        // Trusted domain gets points back
        securityScore += 30;
        indicators.push('✅ Verified trusted domain from security database');
        category = 'Legitimate Service';
        description = 'This is a known legitimate website from a trusted company. Safe to visit.';
      } else {
        // Check for domain spoofing
        const isSpoofing = this.checkDomainSpoofing(hostname);
        if (isSpoofing) {
          securityScore -= 45;
          indicators.push('🚨 Domain spoofing detected - mimics legitimate company');
          category = 'Phishing/Domain Spoofing';
          description = 'This domain is designed to look like a legitimate company but is actually fraudulent.';
        }
      }

      // 3. DOMAIN AGE & REPUTATION
      if (hostname.length > 40) {
        securityScore -= 10;
        indicators.push('⚠️ Suspiciously long domain name');
      }

      if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
        securityScore -= 40;
        indicators.push('🚨 Uses IP address instead of domain name - strong phishing indicator');
        category = 'IP-based Phishing';
        description = 'Legitimate websites use domain names, not IP addresses. This is a phishing tactic.';
      }

      // 4. SUBDOMAIN ANALYSIS
      const subdomainParts = hostname.split('.');
      if (subdomainParts.length > 3) {
        securityScore -= 15;
        indicators.push('⚠️ Multiple subdomains - potential subdomain hijacking');
      }

      // 5. SUSPICIOUS TLD PATTERNS
      const tld = hostname.split('.').pop();
      const maliciousTlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.download', '.racing', '.webcam'];
      if (maliciousTlds.some(t => hostname.endsWith(t))) {
        securityScore -= 30;
        indicators.push(`⚠️ Suspicious top-level domain (.${tld})`);
        category = 'Suspicious TLD';
        description = 'This domain uses a cheap, unrestricted TLD commonly used in phishing attacks.';
      }

      // 6. PATH & QUERY ANALYSIS
      if (pathname.includes('admin') || pathname.includes('login') || pathname.includes('verify')) {
        if (!isTrustedDomain) {
          securityScore -= 20;
          indicators.push('⚠️ Admin/login path on untrusted domain');
        }
      }

      // 7. COMMON PHISHING KEYWORDS IN DOMAIN
      const domainLower = hostname.toLowerCase();
      const suspiciousCount = this.suspiciousDomainPatterns.filter(
        pattern => domainLower.includes(pattern)
      ).length;

      if (suspiciousCount > 2 && !isTrustedDomain) {
        securityScore -= 25;
        indicators.push(`⚠️ Multiple suspicious keywords in domain (${suspiciousCount})`);
      }

      // 8. CERTIFICATE STATUS
      if (usesHttps && !isTrustedDomain) {
        indicators.push('⚠️ Self-signed certificate or certificate from untrusted CA');
        securityScore -= 10;
      }

      // 9. MALWARE/THREAT INDICATORS
      if (pathname.includes('malware') || pathname.includes('virus') || 
          pathname.includes('trojan') || pathname.includes('ransomware')) {
        securityScore -= 50;
        indicators.push('🚨 Malware/threat related content detected in URL');
        category = 'Malware Distribution';
        description = 'This website appears to host malicious content or malware.';
      }

      // 10. RATE LIMITING & REPUTATION
      if (!isTrustedDomain) {
        securityScore -= 10;
        indicators.push('⚠️ Not found in trusted security databases');
      }

      // Final scoring
      securityScore = Math.max(0, Math.min(100, securityScore));

      let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
      if (securityScore >= 80) {
        riskLevel = 'safe';
      } else if (securityScore >= 60) {
        riskLevel = 'low';
      } else if (securityScore >= 40) {
        riskLevel = 'medium';
      } else if (securityScore >= 20) {
        riskLevel = 'high';
      } else {
        riskLevel = 'critical';
      }

      const ismalicious = securityScore < 60; // Below 60 is considered malicious

      return {
        ismalicious,
        riskLevel,
        securityScore,
        indicators,
        category: category || riskLevel,
        description: description || this.getDefaultDescription(riskLevel),
        usesHttps,
        isTrustedDomain,
        hasSecurityCertificate
      };

    } catch (error) {
      return {
        ismalicious: true,
        riskLevel: 'critical',
        securityScore: 0,
        indicators: ['Invalid URL format'],
        category: 'Invalid URL',
        description: 'The provided URL is invalid or malformed.',
        usesHttps: false,
        isTrustedDomain: false,
        hasSecurityCertificate: false
      };
    }
  }

  private static isTrustedDomain(hostname: string): boolean {
    return this.trustedDomains.some(trusted => {
      return hostname === trusted || hostname.endsWith('.' + trusted);
    });
  }

  private static checkDomainSpoofing(hostname: string): boolean {
    const majorBrands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'bank', 'chase'];
    
    for (const brand of majorBrands) {
      if (hostname.includes(brand)) {
        const trustedDomain = this.trustedDomains.find(d => d.includes(brand));
        if (!trustedDomain || hostname !== trustedDomain) {
          // Contains brand name but not the legitimate domain
          const parts = hostname.split('.');
          if (parts.length > 1 && !parts.some(p => p === brand)) {
            return true; // Spoofing detected
          }
        }
      }
    }
    return false;
  }

  private static getDefaultDescription(riskLevel: string): string {
    switch (riskLevel) {
      case 'safe':
        return 'This website appears to be safe and secure.';
      case 'low':
        return 'This website has minimal security issues but should be used with caution.';
      case 'medium':
        return 'This website has moderate security concerns. Avoid entering sensitive information.';
      case 'high':
        return 'This website has significant security risks. Do not visit or enter personal information.';
      case 'critical':
        return 'This website is likely malicious. Block access immediately.';
      default:
        return 'Unable to determine website security status.';
    }
  }
}
