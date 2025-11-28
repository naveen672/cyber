// Advanced phishing detection algorithm with multiple indicators
export interface PhishingAnalysisResult {
  isPhishing: boolean;
  riskScore: number;
  indicators: string[];
  confidence: number;
  threatClassification: string | null;
  domainReputation: string;
}

export interface EmailData {
  sender: string;
  senderName?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  recipient: string;
  ipAddress?: string;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  attachments?: { name: string; mimeType: string }[];
  replyTo?: string;
}

export class PhishingDetector {
  private static suspiciousDomains = [
    'amaz0n-verify.com', 'paypal-security.net', 'microsoft-365.org',
    'google-security.net', 'apple-verification.com', 'facebook-security.org',
    'instagram-support.net', 'twitter-verification.org', 'linkedin-security.com',
    'bank-update.com', 'account-verify.net', 'security-alert.org'
  ];

  private static phishingKeywords = [
    'verify account', 'suspended account', 'urgent action required',
    'click here immediately', 'confirm identity', 'security alert',
    'unusual activity', 'account limitation', 'expires today',
    'act now', 'limited time', 'winning prize', 'congratulations you won',
    'tax refund', 'inheritance', 'lottery winner', 'prince nigeria',
    'update payment', 'confirm billing', 'update card', 'confirm password',
    're-activate account', 'unlock account', 'verify banking', 'confirm transaction',
    'click here now', 'do not ignore', 'urgent notice', 'final notice',
    'immediate action', 'action required', 'respond now', 'confirm details',
    'validate account', 'authorize transaction', 'resolve issue', 'complete verification',
    'attack', 'compromised', 'breached', 'hacked', 'malware', 'virus', 'threat',
    'infected', 'unauthorized access', 'data breach', 'ransomware', 'click link',
    'open attachment', 'download file', 'enable macros', 'install update'
  ];

  private static legitimateDomains = [
    'amazon.com', 'paypal.com', 'microsoft.com', 'google.com', 'apple.com',
    'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com',
    'bank.com', 'chase.com', 'wellsfargo.com', 'bankofamerica.com',
    'gmail.com', 'outlook.com', 'yahoo.com', 'zoho.com'
  ];

  private static maliciousTldPatterns = [
    '.tk', '.ml', '.ga', '.cf', '.xyz', '.download', '.racing', '.webcam',
    '.accountant', '.cricket', '.faith', '.gdn', '.loan', '.science'
  ];

  private static maliciousAttachmentExtensions = [
    '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js',
    '.jar', '.zip', '.rar', '.7z', '.iso'
  ];

  static async analyzeEmail(emailData: EmailData): Promise<PhishingAnalysisResult> {
    const indicators: string[] = [];
    let riskScore = 0;
    let threatClassification: string | null = null;

    // Domain analysis
    const senderDomain = this.extractDomain(emailData.sender);
    const domainAnalysis = this.analyzeDomain(senderDomain);
    riskScore += domainAnalysis.score;
    indicators.push(...domainAnalysis.indicators);

    // Content analysis
    const contentAnalysis = this.analyzeContent(emailData.subject, emailData.body);
    riskScore += contentAnalysis.score;
    indicators.push(...contentAnalysis.indicators);

    // URL analysis
    const urlAnalysis = this.analyzeUrls(emailData.body, emailData.htmlBody);
    riskScore += urlAnalysis.score;
    indicators.push(...urlAnalysis.indicators);

    // Authentication analysis
    const authAnalysis = this.analyzeAuthentication(emailData);
    riskScore += authAnalysis.score;
    indicators.push(...authAnalysis.indicators);

    // Sender reputation analysis
    const senderAnalysis = this.analyzeSender(emailData.sender, emailData.senderName, emailData.replyTo);
    riskScore += senderAnalysis.score;
    indicators.push(...senderAnalysis.indicators);

    // Attachment analysis
    const attachmentAnalysis = this.analyzeAttachments(emailData.attachments);
    riskScore += attachmentAnalysis.score;
    indicators.push(...attachmentAnalysis.indicators);

    // Behavioral pattern analysis
    const behavioralAnalysis = this.analyzeBehavioralPatterns(
      emailData.subject,
      emailData.body,
      emailData.sender
    );
    riskScore += behavioralAnalysis.score;
    indicators.push(...behavioralAnalysis.indicators);

    // HTML injection / phishing template detection
    const templateAnalysis = this.analyzeHtmlTemplate(emailData.htmlBody);
    riskScore += templateAnalysis.score;
    indicators.push(...templateAnalysis.indicators);

    // Determine threat classification
    if (riskScore >= 70) {
      if (indicators.some(i => i.toLowerCase().includes('credential') || i.toLowerCase().includes('password'))) {
        threatClassification = 'credential_theft';
      } else if (indicators.some(i => i.toLowerCase().includes('malware') || i.toLowerCase().includes('attachment'))) {
        threatClassification = 'malware_delivery';
      } else if (indicators.some(i => i.toLowerCase().includes('financial') || i.toLowerCase().includes('banking') || i.toLowerCase().includes('payment'))) {
        threatClassification = 'financial_fraud';
      } else if (indicators.some(i => i.toLowerCase().includes('brand') || i.toLowerCase().includes('impersonation'))) {
        threatClassification = 'business_email_compromise';
      } else {
        threatClassification = 'social_engineering';
      }
    }

    const isPhishing = riskScore >= 30; // Very low threshold for maximum sensitivity
    const confidence = Math.min(100, Math.max(0, Math.round((riskScore / 100) * 100)));

    return {
      isPhishing,
      riskScore: Math.min(100, riskScore),
      indicators: [...new Set(indicators)], // Remove duplicates
      confidence,
      threatClassification,
      domainReputation: domainAnalysis.reputation
    };
  }

  private static extractDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || '';
  }

  private static analyzeDomain(domain: string): { score: number; indicators: string[]; reputation: string } {
    const indicators: string[] = [];
    let score = 0;
    let reputation = 'unknown';

    if (!domain) return { score: 20, indicators: ['Invalid sender domain'], reputation: 'malicious' };

    if (this.suspiciousDomains.includes(domain)) {
      score += 40;
      indicators.push('Known phishing domain detected');
      reputation = 'malicious';
    } else if (this.legitimateDomains.some(legitDomain => domain.includes(legitDomain) && domain !== legitDomain)) {
      score += 35;
      indicators.push('Domain spoofing detected - mimics legitimate domain');
      reputation = 'suspicious';
    } else if (this.legitimateDomains.includes(domain)) {
      reputation = 'trusted';
    } else {
      // Check for suspicious patterns
      if (domain.includes('-') && (domain.includes('verify') || domain.includes('secure') || domain.includes('update') || domain.includes('alert'))) {
        score += 28;
        indicators.push('Suspicious domain pattern detected');
        reputation = 'suspicious';
      }

      // Check domain age and registration
      if (domain.length > 25) {
        score += 18;
        indicators.push('Unusually long domain name');
      }

      // Check for numeric patterns
      if (/\d{2,}/.test(domain) && domain.includes('.')) {
        score += 22;
        indicators.push('Multiple numbers in domain - suspicious pattern');
      }

      // Check for common typosquatting patterns
      const commonTypos = ['micorsoft', 'gogle', 'amazn', 'paypa', 'appel', 'facebok', 'linkedn'];
      if (commonTypos.some(typo => domain.includes(typo))) {
        score += 38;
        indicators.push('Typosquatting domain detected');
        reputation = 'malicious';
      }

      // Check for suspicious TLDs
      if (this.maliciousTldPatterns.some(tld => domain.endsWith(tld))) {
        score += 25;
        indicators.push('Suspicious top-level domain used');
        reputation = 'suspicious';
      }

      // Check for subdomain abuse
      const parts = domain.split('.');
      if (parts.length > 3) {
        score += 15;
        indicators.push('Multiple subdomains - potential subdomain spoofing');
      }
    }

    return { score, indicators, reputation };
  }

  private static analyzeContent(subject: string, body: string): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;
    const content = (subject + ' ' + body).toLowerCase();

    // Check for phishing keywords with weighting
    let keywordMatches = 0;
    const matchedKeywords: string[] = [];
    
    for (const keyword of this.phishingKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        keywordMatches++;
        matchedKeywords.push(keyword);
      }
    }

    if (keywordMatches >= 3) {
      score += keywordMatches * 15; // Much higher weight for multiple keywords
      indicators.push(`Multiple phishing keywords detected (${keywordMatches}): ${matchedKeywords.slice(0, 3).join(', ')}`);
    } else if (keywordMatches > 0) {
      score += keywordMatches * 12; // Higher weight per keyword
      indicators.push(`Phishing keyword detected: "${matchedKeywords[0]}"`);
    }

    // Check for urgency indicators with context
    const urgencyWords = ['urgent', 'immediately', 'expires', 'suspend', 'limited time', 'act now', 'asap', 'quickly'];
    const urgencyCount = urgencyWords.filter(word => content.includes(word)).length;
    if (urgencyCount >= 3) {
      score += 28;
      indicators.push('Excessive urgency tactics - hallmark of phishing');
    } else if (urgencyCount >= 2) {
      score += 18;
      indicators.push('Multiple urgency indicators detected');
    }

    // Check for credential harvesting
    const credentialWords = ['password', 'pin', 'ssn', 'social security', 'credit card', 'cvv'];
    const verifyWords = ['verify', 'confirm', 'validate', 'authenticate', 'authorize'];
    
    const hasCredentialWord = credentialWords.some(word => content.includes(word));
    const hasVerifyWord = verifyWords.some(word => content.includes(word));
    
    if (hasCredentialWord && hasVerifyWord) {
      score += 32;
      indicators.push('Credential harvesting attempt detected');
    }

    // Check for financial threats
    const accountThreats = ['suspend', 'close', 'freeze', 'lock', 'block', 'deactivate', 'terminate'];
    const hasAccountThreat = accountThreats.some(word => content.includes('account') && content.includes(word));
    
    if (hasAccountThreat) {
      score += 30;
      indicators.push('Account threat detected - common phishing tactic');
    }

    // Check for spelling/grammar issues
    const misspellings = ['recieve', 'seperate', 'occured', 'untill', 'goverment', 'adress', 'sincerly'];
    const misspellingCount = misspellings.filter(word => content.includes(word)).length;
    if (misspellingCount > 0) {
      score += misspellingCount * 6;
      indicators.push(`Poor spelling/grammar detected (${misspellingCount}) - professional emails are spell-checked`);
    }

    // Check for poor sentence structure or informal language
    const poorGrammarIndicators = ['u r', 'ur', 'wud', 'shud', 'cud'];
    if (poorGrammarIndicators.some(indicator => content.includes(indicator))) {
      score += 12;
      indicators.push('Informal/poor language usage detected');
    }

    // Check for generic greetings (common in phishing)
    if (content.includes('dear user') || content.includes('dear customer') || content.includes('dear valued') || content.includes('dear sir') || content.includes('dear madam')) {
      score += 15;
      indicators.push('Generic greeting instead of personalized - phishing indicator');
    }

    return { score, indicators };
  }

  private static analyzeUrls(body: string, htmlBody?: string): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;
    const content = body + (htmlBody || '');

    // Extract URLs
    const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`\[\]]*[^\s<>"'{}|\\^`\[\],.]/gi;
    const urls = content.match(urlRegex) || [];

    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        
        // Check for URL shorteners
        const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'shortened.link', 'short.link'];
        if (shorteners.some(shortener => domain.includes(shortener))) {
          score += 35; // Very high for URL shorteners
          indicators.push('URL shortener detected - hides real destination');
        }

        // Check if URL domain doesn't match email domain
        if (body.includes('paypal') || body.includes('amazon') || body.includes('microsoft') || body.includes('bank')) {
          const expectedBrand = ['paypal', 'amazon', 'microsoft', 'bank'].find(brand => body.includes(brand));
          if (expectedBrand && !domain.includes(expectedBrand)) {
            score += 45; // Very high for domain mismatch
            indicators.push(`URL domain mismatch - claims to be ${expectedBrand} but links to ${domain}`);
          }
        }

        // Check for suspicious TLDs
        if (this.maliciousTldPatterns.some(tld => domain.endsWith(tld))) {
          score += 35; // Higher weight
          indicators.push('Suspicious TLD in URL');
        }

        // Check for IP addresses as domains
        if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
          score += 40; // Much higher
          indicators.push('URL uses IP address - strong phishing indicator');
        }

        // Check for suspicious subdomains
        const parts = domain.split('.');
        if (parts.length > 3) {
          score += 12;
          indicators.push('Complex subdomain structure - potential phishing');
        }

      } catch (e) {
        score += 12;
        indicators.push('Malformed URL detected');
      }
    }

    return { score, indicators };
  }

  private static analyzeAuthentication(emailData: EmailData): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;

    if (emailData.spfResult === 'fail') {
      score += 28;
      indicators.push('SPF authentication failed - spoofing likely');
    }

    if (emailData.dkimResult === 'fail') {
      score += 22;
      indicators.push('DKIM signature invalid - email not from legitimate sender');
    }

    if (emailData.dmarcResult === 'fail') {
      score += 32;
      indicators.push('DMARC policy violation - email failed authentication checks');
    }

    // Check for missing authentication (all failed)
    if (emailData.spfResult === 'fail' && emailData.dkimResult === 'fail' && emailData.dmarcResult === 'fail') {
      score += 15; // Additional penalty for complete authentication failure
      indicators.push('All email authentication methods failed');
    }

    return { score, indicators };
  }

  private static analyzeSender(sender: string, senderName?: string, replyTo?: string): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;

    // Check if Reply-To doesn't match sender
    if (replyTo && replyTo !== sender) {
      score += 20;
      indicators.push('Reply-To address differs from sender - potential phishing');
    }

    // Check if sender name doesn't match domain
    if (senderName && sender) {
      const domain = this.extractDomain(sender);
      const senderLower = senderName.toLowerCase();
      
      // Look for brand impersonation
      const brands = ['amazon', 'paypal', 'microsoft', 'google', 'apple', 'facebook', 'bank', 'chase', 'wells', 'irs', 'netflix', 'uber'];
      const mentionedBrand = brands.find(brand => senderLower.includes(brand));
      
      if (mentionedBrand && !domain.includes(mentionedBrand)) {
        score += 40;
        indicators.push(`Brand impersonation: Claims to be ${mentionedBrand} but from ${domain}`);
      }
    }

    // Check for suspicious email patterns
    if (sender.includes('+') || sender.includes('noreply') || sender.includes('donotreply') || sender.includes('no-reply')) {
      score += 12;
      indicators.push('Suspicious sender pattern detected');
    }

    // Check for free email services impersonating companies
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const senderDomain = this.extractDomain(sender);
    if (freeEmailDomains.includes(senderDomain)) {
      const senderLower = (sender + (senderName || '')).toLowerCase();
      if (senderLower.includes('bank') || senderLower.includes('paypal') || senderLower.includes('amazon') || senderLower.includes('company')) {
        score += 25;
        indicators.push('Free email service impersonating business entity');
      }
    }

    return { score, indicators };
  }

  private static analyzeAttachments(attachments?: { name: string; mimeType: string }[]): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;

    if (!attachments || attachments.length === 0) return { score, indicators };

    for (const attachment of attachments) {
      const ext = attachment.name.split('.').pop()?.toLowerCase();
      
      // Check for malicious extensions
      if (ext && this.maliciousAttachmentExtensions.includes(`.${ext}`)) {
        score += 35;
        indicators.push(`Malicious attachment detected: .${ext} file`);
      }

      // Check for double extensions
      if (attachment.name.match(/\.\w+\.\w+$/)) {
        score += 20;
        indicators.push('Double file extension detected - potential malware');
      }

      // Check for suspicious MIME types
      if (attachment.mimeType.includes('x-msdownload') || attachment.mimeType.includes('x-msdos')) {
        score += 30;
        indicators.push('Executable file disguised as document');
      }
    }

    return { score, indicators };
  }

  private static analyzeBehavioralPatterns(subject: string, body: string, sender: string): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;
    const content = (subject + ' ' + body).toLowerCase();

    // Check for fake invoices/receipts
    if ((content.includes('invoice') || content.includes('receipt') || content.includes('billing')) &&
        (content.includes('click') || content.includes('verify') || content.includes('confirm'))) {
      score += 25;
      indicators.push('Fake invoice/receipt with action request');
    }

    // Check for fake support messages
    if ((content.includes('support') || content.includes('help') || content.includes('ticket')) &&
        (content.includes('click') || content.includes('confirm') || content.includes('verify'))) {
      score += 20;
      indicators.push('Fake support message with action request');
    }

    // Check for prize/reward scams
    if ((content.includes('winner') || content.includes('prize') || content.includes('reward') || content.includes('congratulations')) &&
        (content.includes('claim') || content.includes('click') || content.includes('verify'))) {
      score += 32;
      indicators.push('Prize/reward scam detected');
    }

    // Check for CEO fraud patterns
    if ((content.includes('urgent') || content.includes('confidential')) &&
        (content.includes('transfer') || content.includes('wire') || content.includes('payment'))) {
      score += 28;
      indicators.push('CEO fraud / business email compromise pattern');
    }

    return { score, indicators };
  }

  private static analyzeHtmlTemplate(htmlBody?: string): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;

    if (!htmlBody) return { score, indicators };

    // Check for embedded forms
    if (htmlBody.includes('<form') && htmlBody.includes('password')) {
      score += 38;
      indicators.push('HTML form for credential harvesting detected');
    }

    // Check for fake login forms
    if (htmlBody.includes('username') && htmlBody.includes('password') && htmlBody.includes('<input')) {
      score += 35;
      indicators.push('Login form injection detected');
    }

    // Check for hidden content
    if (htmlBody.includes('display:none') || htmlBody.includes('visibility:hidden') || htmlBody.includes('color:#ffffff')) {
      score += 15;
      indicators.push('Hidden content in HTML - potential phishing');
    }

    // Check for obfuscated links
    if (htmlBody.includes('onclick') || htmlBody.includes('onload') || htmlBody.includes('onerror')) {
      score += 20;
      indicators.push('Event handlers in HTML - potential malicious behavior');
    }

    return { score, indicators };
  }
}
