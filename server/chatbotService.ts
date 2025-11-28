export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface KnowledgeEntry {
  patterns: RegExp[];
  keywords: string[];
  response: string;
  followUp?: string;
}

interface KnowledgeCategory {
  name: string;
  entries: KnowledgeEntry[];
}

const knowledgeBase: KnowledgeCategory[] = [
  {
    name: "phishing",
    entries: [
      {
        patterns: [/what.*(is|are).*phishing/i, /phishing.*mean/i, /define.*phishing/i, /explain.*phishing/i],
        keywords: ["phishing", "fake email", "scam email", "fraudulent"],
        response: "Phishing is a type of cyber attack where criminals send fake emails, messages, or create fake websites that look legitimate to trick you into revealing sensitive information like passwords, credit card numbers, or personal data. These attacks often create urgency or fear to make you act quickly without thinking.",
        followUp: "Would you like tips on how to identify phishing emails?"
      },
      {
        patterns: [/how.*(identify|spot|recognize|detect).*phishing/i, /phishing.*signs/i, /phishing.*red.?flags/i],
        keywords: ["identify phishing", "spot phishing", "recognize phishing", "detect phishing", "phishing signs"],
        response: "Here are key signs of a phishing attempt:\n\n1. Urgent or threatening language (\"Your account will be closed!\")\n2. Suspicious sender email addresses (misspelled domains)\n3. Generic greetings like \"Dear Customer\" instead of your name\n4. Requests for sensitive information via email\n5. Suspicious links (hover to check the real URL)\n6. Poor grammar and spelling errors\n7. Unexpected attachments\n\nWhen in doubt, contact the company directly through their official website.",
        followUp: "Would you like to know what to do if you clicked a phishing link?"
      },
      {
        patterns: [/clicked.*phishing/i, /fell.*phishing/i, /victim.*phishing/i, /phishing.*what.*(do|now)/i],
        keywords: ["clicked phishing", "phishing victim", "fell for phishing"],
        response: "If you clicked a phishing link or provided information:\n\n1. Immediately change passwords for affected accounts\n2. Enable two-factor authentication (2FA)\n3. Monitor your accounts for suspicious activity\n4. Run a full antivirus scan on your device\n5. Report the phishing attempt to the impersonated company\n6. If you shared financial info, contact your bank immediately\n7. Consider placing a fraud alert on your credit report\n\nAct quickly - the sooner you respond, the less damage can be done."
      }
    ]
  },
  {
    name: "passwords",
    entries: [
      {
        patterns: [/strong.*password/i, /good.*password/i, /create.*password/i, /password.*tips/i, /secure.*password/i],
        keywords: ["strong password", "good password", "password tips", "secure password", "password security"],
        response: "Tips for creating strong passwords:\n\n1. Use at least 12-16 characters\n2. Mix uppercase, lowercase, numbers, and symbols\n3. Avoid personal info (birthdays, names, pet names)\n4. Don't use common words or patterns (password123)\n5. Use unique passwords for each account\n6. Consider using a passphrase (\"Purple-Elephant-Dances-Quickly!\")\n\nPro tip: Use a password manager to generate and store complex passwords securely.",
        followUp: "Would you like to know more about password managers?"
      },
      {
        patterns: [/password.*manager/i, /what.*password.*manager/i, /should.*use.*password.*manager/i],
        keywords: ["password manager", "password vault", "password storage"],
        response: "A password manager is a secure application that stores and manages your passwords in an encrypted vault. Benefits include:\n\n1. Generates strong, unique passwords automatically\n2. Stores all passwords securely with one master password\n3. Auto-fills login forms safely\n4. Syncs across all your devices\n5. Alerts you about weak or reused passwords\n\nPopular options include Bitwarden, 1Password, and LastPass. Using a password manager is one of the best things you can do for your online security."
      },
      {
        patterns: [/two.?factor|2fa|mfa|multi.?factor/i, /what.*2fa/i, /enable.*authentication/i],
        keywords: ["two factor", "2fa", "mfa", "multi factor", "authentication"],
        response: "Two-Factor Authentication (2FA) adds an extra layer of security beyond your password. Even if someone steals your password, they can't access your account without the second factor.\n\nTypes of 2FA:\n1. SMS codes (better than nothing, but less secure)\n2. Authenticator apps (Google Authenticator, Authy) - recommended\n3. Hardware keys (YubiKey) - most secure\n4. Biometrics (fingerprint, face)\n\nEnable 2FA on all important accounts: email, banking, social media, and work accounts."
      }
    ]
  },
  {
    name: "malware",
    entries: [
      {
        patterns: [/what.*(is|are).*malware/i, /malware.*mean/i, /types.*malware/i],
        keywords: ["malware", "malicious software", "virus", "trojan"],
        response: "Malware (malicious software) is any program designed to harm your computer or steal your data. Common types include:\n\n1. Viruses - attach to files and spread when shared\n2. Trojans - disguise as legitimate software\n3. Worms - spread across networks automatically\n4. Spyware - secretly monitors your activity\n5. Adware - displays unwanted advertisements\n6. Keyloggers - record your keystrokes\n\nMalware can steal data, damage files, slow your computer, or give hackers access to your system.",
        followUp: "Would you like tips on protecting against malware?"
      },
      {
        patterns: [/protect.*malware/i, /prevent.*malware/i, /avoid.*malware/i, /malware.*protection/i],
        keywords: ["protect malware", "prevent malware", "malware protection", "antivirus"],
        response: "Protect yourself from malware with these steps:\n\n1. Keep your operating system and software updated\n2. Use reputable antivirus/anti-malware software\n3. Don't download files from untrusted sources\n4. Be cautious with email attachments\n5. Avoid clicking suspicious links\n6. Use a firewall\n7. Back up your data regularly\n8. Don't use pirated software\n\nRemember: No single tool provides complete protection - security is about layers of defense."
      },
      {
        patterns: [/think.*infected|computer.*infected|have.*virus|got.*malware/i],
        keywords: ["infected", "have virus", "computer slow", "strange behavior"],
        response: "Signs your device might be infected:\n- Unusual slowness or crashes\n- Pop-ups appearing everywhere\n- Programs opening/closing on their own\n- Files missing or changed\n- Unknown programs installed\n- High network activity\n\nIf you suspect infection:\n1. Disconnect from the internet\n2. Run a full antivirus scan\n3. Boot in Safe Mode for deep scans\n4. Remove suspicious programs\n5. Change your passwords from a clean device\n6. Consider professional help for severe infections"
      }
    ]
  },
  {
    name: "ransomware",
    entries: [
      {
        patterns: [/what.*(is|are).*ransomware/i, /ransomware.*mean/i, /explain.*ransomware/i],
        keywords: ["ransomware", "encrypt files", "ransom", "locked files"],
        response: "Ransomware is malware that encrypts your files and demands payment (usually in cryptocurrency) to unlock them. It's one of the most dangerous cyber threats today.\n\nHow it spreads:\n- Phishing emails with malicious attachments\n- Infected websites\n- Exploiting security vulnerabilities\n- Malicious downloads\n\nVictims face a difficult choice: pay the ransom (with no guarantee of recovery) or lose access to their files. Prevention and backups are your best defense.",
        followUp: "Would you like to know how to protect against ransomware?"
      },
      {
        patterns: [/protect.*ransomware|prevent.*ransomware|ransomware.*protection/i],
        keywords: ["protect ransomware", "prevent ransomware", "ransomware protection", "backup"],
        response: "Protect against ransomware:\n\n1. Back up regularly using the 3-2-1 rule (3 copies, 2 different media, 1 offsite)\n2. Keep all software updated\n3. Use strong antivirus protection\n4. Train yourself to recognize phishing\n5. Don't enable macros in documents from unknown sources\n6. Use network segmentation\n7. Implement least-privilege access\n8. Consider endpoint detection and response (EDR) tools\n\nIf attacked: Don't pay the ransom - it funds criminals and doesn't guarantee recovery."
      }
    ]
  },
  {
    name: "ddos",
    entries: [
      {
        patterns: [/what.*(is|are).*(ddos|dos|denial)/i, /ddos.*mean/i, /explain.*(ddos|dos)/i],
        keywords: ["ddos", "dos", "denial of service", "attack server"],
        response: "A DDoS (Distributed Denial of Service) attack overwhelms a website or server with so much traffic that it can't respond to legitimate users. It's like thousands of people trying to enter a store at once - the door gets blocked.\n\nTypes of DDoS attacks:\n1. Volumetric - floods with traffic\n2. Protocol - exploits network protocols\n3. Application layer - targets specific services\n\nThese attacks can take websites offline for hours or days, causing significant business damage.",
        followUp: "Would you like to know how businesses protect against DDoS attacks?"
      },
      {
        patterns: [/protect.*ddos|prevent.*ddos|ddos.*protection|stop.*ddos/i],
        keywords: ["protect ddos", "ddos protection", "ddos mitigation"],
        response: "DDoS protection strategies:\n\n1. Use a CDN (Content Delivery Network) to distribute traffic\n2. Implement rate limiting to control request flow\n3. Deploy Web Application Firewalls (WAF)\n4. Use DDoS mitigation services (Cloudflare, AWS Shield)\n5. Have excess bandwidth capacity\n6. Monitor traffic patterns for anomalies\n7. Create an incident response plan\n\nFor most websites, using a service like Cloudflare provides excellent protection against common DDoS attacks."
      }
    ]
  },
  {
    name: "network_security",
    entries: [
      {
        patterns: [/secure.*(wifi|network|router)/i, /wifi.*security/i, /home.*network.*safe/i],
        keywords: ["wifi security", "secure network", "router security", "home network"],
        response: "Secure your home network:\n\n1. Change default router username and password\n2. Use WPA3 encryption (or WPA2 if WPA3 unavailable)\n3. Create a strong WiFi password\n4. Hide your network name (SSID) if desired\n5. Enable your router's firewall\n6. Keep router firmware updated\n7. Create a guest network for visitors\n8. Disable WPS (WiFi Protected Setup)\n9. Consider MAC address filtering\n\nA secure home network protects all your connected devices.",
        followUp: "Would you like tips on using public WiFi safely?"
      },
      {
        patterns: [/public.*wifi|hotel.*wifi|coffee.*shop.*wifi|free.*wifi/i],
        keywords: ["public wifi", "free wifi", "hotel wifi", "coffee shop"],
        response: "Stay safe on public WiFi:\n\n1. Use a VPN (Virtual Private Network) - essential!\n2. Avoid accessing sensitive accounts (banking, email)\n3. Disable auto-connect to open networks\n4. Turn off file sharing\n5. Verify the network name with staff\n6. Use HTTPS websites only\n7. Enable your firewall\n8. Forget the network after use\n\nPublic WiFi is inherently insecure - anyone on the same network could potentially intercept your data. When in doubt, use your mobile data instead."
      },
      {
        patterns: [/what.*(is|are).*vpn/i, /vpn.*mean/i, /should.*use.*vpn/i, /need.*vpn/i],
        keywords: ["vpn", "virtual private network", "privacy"],
        response: "A VPN (Virtual Private Network) creates an encrypted tunnel for your internet traffic, hiding your activity from your ISP, hackers, and websites.\n\nWhen to use a VPN:\n- On public WiFi (essential!)\n- When you want privacy from your ISP\n- To access geo-restricted content\n- When working remotely\n\nChoose a reputable paid VPN service - free VPNs often sell your data. Look for no-log policies and strong encryption."
      }
    ]
  },
  {
    name: "social_engineering",
    entries: [
      {
        patterns: [/what.*(is|are).*social.*engineering/i, /social.*engineering.*mean/i],
        keywords: ["social engineering", "manipulation", "trick", "deceive"],
        response: "Social engineering is manipulating people into revealing confidential information or taking actions that compromise security. Unlike technical hacking, it exploits human psychology.\n\nCommon tactics:\n1. Phishing - fake emails/websites\n2. Pretexting - creating false scenarios\n3. Baiting - offering something enticing\n4. Tailgating - following authorized people into secure areas\n5. Quid pro quo - offering help in exchange for information\n\nRemember: Attackers often target people because they're easier to exploit than systems.",
        followUp: "Would you like to know how to protect yourself from social engineering?"
      },
      {
        patterns: [/protect.*social.*engineering|prevent.*social.*engineering/i],
        keywords: ["protect social engineering", "prevent manipulation"],
        response: "Protect yourself from social engineering:\n\n1. Be skeptical of unsolicited contacts\n2. Verify identities through official channels\n3. Don't share sensitive info over phone/email\n4. Take time to think - don't let urgency pressure you\n5. Trust your instincts - if something feels wrong, it probably is\n6. Use multi-factor authentication\n7. Keep personal info off social media\n8. Train yourself to recognize manipulation tactics\n\nThe best defense is awareness and healthy skepticism."
      }
    ]
  },
  {
    name: "incident_response",
    entries: [
      {
        patterns: [/been.*hacked|got.*hacked|account.*compromised|someone.*my.*account/i],
        keywords: ["hacked", "compromised", "breach", "unauthorized access"],
        response: "If you've been hacked, act fast:\n\n1. Change passwords immediately (start with email)\n2. Enable 2FA on all accounts\n3. Check for unauthorized transactions\n4. Review account recovery options\n5. Log out of all sessions\n6. Scan devices for malware\n7. Check for unauthorized forwarding rules in email\n8. Notify your bank if financial accounts affected\n9. Report identity theft if personal info was stolen\n\nAfter securing accounts, try to determine how the breach happened to prevent future attacks."
      },
      {
        patterns: [/data.*breach|company.*breach|personal.*data.*stolen/i],
        keywords: ["data breach", "personal data stolen", "information leaked"],
        response: "After a data breach affecting you:\n\n1. Find out what data was exposed\n2. Change passwords for affected accounts\n3. Enable 2FA everywhere\n4. Monitor your credit reports\n5. Consider a credit freeze\n6. Watch for phishing attempts using leaked info\n7. Check haveibeenpwned.com regularly\n\nIf Social Security number exposed:\n- Place fraud alerts with credit bureaus\n- Consider identity theft protection services\n- File taxes early to prevent fraud"
      }
    ]
  },
  {
    name: "general",
    entries: [
      {
        patterns: [/how.*stay.*safe.*online/i, /online.*safety.*tips/i, /internet.*security.*basics/i, /cyber.*security.*tips/i],
        keywords: ["stay safe online", "online safety", "internet security", "cyber security tips"],
        response: "Essential cybersecurity practices:\n\n1. Use strong, unique passwords with a password manager\n2. Enable two-factor authentication everywhere\n3. Keep software and systems updated\n4. Think before you click links or attachments\n5. Back up your data regularly\n6. Use antivirus software\n7. Be careful what you share online\n8. Use secure WiFi and VPNs when needed\n9. Review privacy settings on accounts\n10. Stay informed about current threats\n\nSecurity is a habit - small consistent actions make a big difference!"
      },
      {
        patterns: [/thanks|thank you|helpful|great/i],
        keywords: ["thanks", "thank you", "helpful"],
        response: "You're welcome! I'm here to help with any cybersecurity questions. Stay safe online!"
      },
      {
        patterns: [/hello|hi|hey|greetings/i],
        keywords: ["hello", "hi", "hey"],
        response: "Hello! I'm CyberShield AI Assistant. I can help you with cybersecurity questions about phishing, malware, passwords, network security, and more. What would you like to know?"
      },
      {
        patterns: [/help|what.*can.*you.*do/i],
        keywords: ["help", "what can you do", "capabilities"],
        response: "I can help you with:\n\n- Understanding cyber threats (phishing, malware, ransomware)\n- Password security and best practices\n- Two-factor authentication\n- Network and WiFi security\n- What to do if you've been hacked\n- DDoS attacks and protection\n- Social engineering awareness\n- General online safety tips\n\nJust ask me anything about cybersecurity!"
      }
    ]
  }
];

const fallbackResponses = [
  "I'm not sure I understand that question. Could you try rephrasing it? I can help with topics like phishing, malware, passwords, network security, and more.",
  "I don't have specific information about that. I specialize in cybersecurity topics - would you like to know about password security, phishing protection, or malware prevention?",
  "That's outside my expertise. I'm here to help with cybersecurity questions. Try asking about things like two-factor authentication, safe browsing, or protecting against hackers."
];

function normalizeInput(input: string): string {
  return input.toLowerCase().trim().replace(/[^\w\s?]/g, '');
}

function calculateKeywordScore(input: string, keywords: string[]): number {
  const normalizedInput = normalizeInput(input);
  let score = 0;
  
  for (const keyword of keywords) {
    if (normalizedInput.includes(keyword.toLowerCase())) {
      score += keyword.split(' ').length;
    }
  }
  
  return score;
}

function findBestMatch(userMessage: string): { response: string; followUp?: string } | null {
  const normalizedMessage = normalizeInput(userMessage);
  
  let bestMatch: { response: string; followUp?: string; score: number } | null = null;
  
  for (const category of knowledgeBase) {
    for (const entry of category.entries) {
      for (const pattern of entry.patterns) {
        if (pattern.test(userMessage)) {
          return { response: entry.response, followUp: entry.followUp };
        }
      }
      
      const keywordScore = calculateKeywordScore(userMessage, entry.keywords);
      if (keywordScore > 0 && (!bestMatch || keywordScore > bestMatch.score)) {
        bestMatch = { response: entry.response, followUp: entry.followUp, score: keywordScore };
      }
    }
  }
  
  if (bestMatch && bestMatch.score >= 1) {
    return { response: bestMatch.response, followUp: bestMatch.followUp };
  }
  
  return null;
}

export async function getChatResponse(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const match = findBestMatch(userMessage);
  
  if (match) {
    let response = match.response;
    if (match.followUp) {
      response += `\n\n${match.followUp}`;
    }
    return response;
  }
  
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
