// data/interview-questions.js
export const interviewQuestions = [
  {
    id: 1,
    category: "Network Security",
    question: "What is a DDoS attack and what are its types?",
    answer: "A Distributed Denial of Service (DDoS) attack attempts to make a service unavailable by overwhelming it with traffic from multiple sources. Main types include: Volumetric (UDP floods, ICMP floods), Protocol (SYN floods, Ping of Death), and Application Layer (HTTP floods, Slowloris).",
    codeExample: `# Detect SYN flood with netstat
netstat -n | grep :80 | grep SYN_RECV | wc -l
# If count > 500, possible attack`,
    tips: [
      "Use Cloudflare or AWS Shield for DDoS protection",
      "Implement rate limiting at load balancer level",
      "Consider geo-blocking for non-essential regions"
    ],
    difficulty: "Intermediate",
    correctAnswer: "distributed denial of service"
  },
  {
    id: 2,
    category: "Network Security",
    question: "What is the difference between DDoS and CC attack?",
    answer: "DDoS attacks typically target network/transport layers (L3/L4) with high-volume traffic. CC (Challenge Collapsar) attacks target application layer (L7) with seemingly legitimate HTTP requests, making them harder to detect. CC attacks use fewer resources but are more sophisticated.",
    tips: [
      "CC attacks require behavioral analysis to detect",
      "Use CAPTCHA and WAF rules for CC mitigation",
      "Monitor abnormal user behavior patterns"
    ]
  },
  {
    id: 3,
    category: "Web Security",
    question: "How do you prevent XSS attacks from both frontend and backend?",
    answer: "Backend: Input validation, output encoding (HTML entity encoding), Content Security Policy headers, HttpOnly cookies. Frontend: Sanitize user input with DOMPurify, use textContent instead of innerHTML, React's JSX escaping, avoid eval() and innerHTML.",
    codeExample: `// Backend (Node.js)
const sanitizeHtml = require('sanitize-html');
const clean = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
});

// Frontend (React - safe by default)
<div>{userInput}</div> // Automatically escaped

// Dangerous (avoid)
<div dangerouslySetInnerHTML={{__html: userInput}} />`,
    tips: [
      "Implement CSP header: Content-Security-Policy: default-src 'self'",
      "Use frameworks that auto-escape (React, Angular, Vue)",
      "Regular XSS testing with tools like OWASP ZAP"
    ]
  },
  {
    id: 4,
    category: "Penetration Testing",
    question: "What are the most common penetration testing tools?",
    answer: "Nmap (most used - network discovery), Burp Suite (web app testing), Metasploit (exploitation), Wireshark (packet analysis), John the Ripper (password cracking), SQLmap (SQL injection), Nikto (web server scanning), Aircrack-ng (WiFi security).",
    tips: [
      "Master Nmap - it's the most frequently mentioned tool",
      "Learn Burp Suite Community Edition thoroughly",
      "Practice with HackTheBox or TryHackMe"
    ]
  },
  {
    id: 5,
    category: "Web Security",
    question: "How do you detect and remove a webshell?",
    answer: "Detection methods: File integrity monitoring (tripwire), scanning for suspicious files (.php, .jsp in upload dirs), checking for eval/base64_decode functions, analyzing process lists, monitoring outbound connections, reviewing access logs for POST requests to unusual files.",
    codeExample: `# Find PHP webshells
grep -r "eval(" --include="*.php" /var/www/
grep -r "base64_decode" --include="*.php" /var/www/
grep -r "system(" --include="*.php" /var/www/

# Check modified files in last 24 hours
find /var/www/ -type f -mtime -1 -name "*.php"`,
    tips: [
      "Use OWASP WebShell Detector",
      "Implement application whitelisting",
      "Regular vulnerability scanning"
    ]
  },
  {
    id: 6,
    category: "Network Security",
    question: "Explain the TCP 3-way handshake process",
    answer: "Step 1: Client sends SYN packet with sequence number x. Step 2: Server responds with SYN-ACK (sequence y, acknowledgement x+1). Step 3: Client sends ACK (acknowledgement y+1). This establishes a reliable connection before data transfer.",
    tips: [
      "SYN flood attacks exploit step 2 by not completing handshake",
      "SYN cookies help mitigate SYN flood attacks",
      "Understanding handshake crucial for firewall configuration"
    ]
  },
  {
    id: 7,
    category: "Network Security",
    question: "What are the 7 layers of the OSI model?",
    answer: "7-Application (HTTP/SMTP), 6-Presentation (SSL/TLS), 5-Session (NetBIOS), 4-Transport (TCP/UDP), 3-Network (IP/ICMP), 2-Data Link (Ethernet/MAC), 1-Physical (Cables/Hubs). Mnemonic: 'Please Do Not Throw Sausage Pizza Away'.",
    tips: [
      "DDoS attacks often target layers 3,4, and 7",
      "Firewalls operate at different layers",
      "Know which security controls at each layer"
    ]
  },
  {
    id: 8,
    category: "Cloud Security",
    question: "What is your understanding of cloud security?",
    answer: "Cloud security encompasses policies, controls, and technologies protecting cloud-based systems. Key areas: Identity and Access Management (IAM), data encryption (at rest and in transit), network security (VPCs, security groups), compliance (GDPR, HIPAA), shared responsibility model, and cloud-native protections (CWPP, CASB, CSPM).",
    tips: [
      "Understand shared responsibility model deeply",
      "Learn AWS/Azure/GCP security services",
      "Know common misconfigurations (open S3 buckets)"
    ]
  },
  {
    id: 9,
    category: "Information Gathering",
    question: "How would you approach information gathering (reconnaissance)?",
    answer: "Phases: 1) Passive OSINT (Google dorks, Shodan, Censys, GitHub, LinkedIn), 2) Active reconnaissance (DNS enumeration - dig, nslookup, subdomain discovery), 3) Network scanning (Nmap port scanning), 4) Service enumeration (banner grabbing), 5) Web application mapping (directory brute force), 6) Technology fingerprinting (Wappalyzer, WhatWeb).",
    codeExample: `# Subdomain discovery
amass enum -d target.com
subfinder -d target.com

# Google dorks
site:target.com filetype:pdf
intitle:"index of" "target.com"

# DNS enumeration
dig axfr @ns1.target.com target.com`,
    tips: [
      "Always respect scope and get permission",
      "Document everything for reporting",
      "Use automation but verify manually"
    ]
  },
  {
    id: 10,
    category: "Web Security",
    question: "What is CRLF injection attack?",
    answer: "CRLF (Carriage Return Line Feed) injection occurs when an attacker can inject CRLF characters (%0d%0a) into application inputs, causing HTTP header splitting or log injection. This can lead to response splitting, XSS, session fixation, or log forgery.",
    codeExample: `# Vulnerable code
header("Location: " . $_GET['url']);

# Attack
https://site.com/redirect?url=example.com%0d%0aSet-Cookie:%20session=hijacked

# Prevention
$clean_url = str_replace(array("\r", "\n"), '', $_GET['url']);`,
    tips: [
      "Always sanitize CRLF characters from user input",
      "Use framework header functions that auto-encode",
      "Validate and whitelist redirect domains"
    ]
  },
  // ... add 90+ more questions following this pattern
];

export const categories = [
  "Network Security",
  "Web Security",
  "Cryptography",
  "Cloud Security",
  "Incident Response",
  "Penetration Testing",
  "Malware Analysis",
  "Identity & Access Management",
  "Compliance & Governance",
  "SOC Operations"
];
