/* Career portfolio projects: hands-on labs that prove job skills to employers.
   steps: [phase title, [step, ...]] — every step and deliverable becomes a checkbox. */
SP.projects = [
{
  id: 'p1', title: 'Home Lab Foundation', icon: '🏗', level: 'Beginner', time: '1–2 days', roles: ['All roles'],
  objs: ['3.1', '3.2', '4.1'],
  why: "Every other project runs on this. Employers ask 'tell me about your home lab' in almost every entry-level interview — a clean, documented, segmented lab shows you understand virtualization, networking and planning before you touch security tools.",
  build: "A hypervisor running a firewall/router VM and an isolated internal network, with a network diagram and an IP plan you can reuse for every later project.",
  tools: [['Proxmox VE', 'free hypervisor (or VirtualBox / VMware Workstation Pro, free for personal use)'], ['pfSense CE or OPNsense', 'free firewall/router'], ['draw.io (diagrams.net)', 'free diagrams'], ['Hardware', 'any PC with 16–32 GB RAM, 500 GB+ SSD, CPU with virtualization (VT-x / AMD-V) enabled in BIOS']],
  steps: [
    ['Plan', [
      "Write down your goal and constraints: RAM, disk, budget. 16 GB works for 3–4 small VMs at once; 32 GB is comfortable.",
      "Design an IP plan: e.g. `10.10.10.0/24` LAN (clients), `10.10.20.0/24` SERVERS, `10.10.30.0/24` SECURITY (SIEM), `10.10.99.0/24` ATTACK (Kali, isolated).",
      "Draw the network diagram in draw.io: Internet → home router → hypervisor → pfSense → internal networks."]],
    ['Build', [
      "Enable virtualization in BIOS/UEFI and install Proxmox VE (or your chosen hypervisor).",
      "Create a second, internal-only virtual bridge/network with no physical uplink — this is your lab LAN.",
      "Install pfSense/OPNsense with two NICs: WAN on your home network, LAN on the internal bridge.",
      "Configure DHCP and DNS on pfSense for the lab LAN; confirm a test VM gets an address and reaches the Internet through pfSense.",
      "Add a firewall rule so lab networks cannot reach your home network (block RFC1918 home subnet from LAN) — your lab must never touch family devices.",
      "Create VM templates (Ubuntu Server, Windows 11 evaluation) so later projects can clone machines in minutes.",
      "Take snapshots of every clean VM so you can roll back after breaking things."]],
    ['Document', [
      "Record hardware specs, VM list (name, OS, IP, role, RAM) and the IP plan in a table.",
      "Write the README: goal, diagram, build steps, problems you hit and how you solved them."]]
  ],
  deliver: ['GitHub repo `homelab` with README and network diagram', 'VM inventory table', 'Screenshot of pfSense dashboard and hypervisor VM list', 'Short LinkedIn post: “Built my security home lab — here is the design”'],
  bullet: "Designed and built a virtualized security home lab (Proxmox, pfSense) with segmented networks and documented IP plan, isolating lab traffic from production home network.",
  interview: ['Why did you segment the lab from your home network?', 'What would you change if you had more hardware?', 'How do snapshots help you test safely?'],
  stretch: ['Add VLANs on a managed switch', 'Back up VMs to a second disk (3-2-1 rule)', 'Remote access to the lab through a VPN instead of open ports']
},
{
  id: 'p2', title: 'Active Directory Build & Administration', icon: '🏢', level: 'Beginner', time: '1–2 days', roles: ['Sysadmin', 'SOC analyst', 'IT support'],
  objs: ['4.5', '4.1', '1.1'],
  why: "Over 90% of enterprises run Active Directory. Help desk, sysadmin and SOC roles all expect you to understand users, groups, OUs, Group Policy and domain joins. Building it yourself makes AD attacks and logs make sense later.",
  build: "A Windows Server domain controller (DC) with DNS, a realistic OU structure, 20+ users in department groups, Group Policies, and two domain-joined Windows 11 clients.",
  tools: [['Windows Server 2022/2025 Evaluation', 'free 180-day trial from Microsoft Evaluation Center'], ['Windows 11 Enterprise Evaluation', 'free 90-day trial'], ['PowerShell', 'ActiveDirectory module']],
  steps: [
    ['Domain controller', [
      "Create the Windows Server VM in the SERVERS network; set a static IP and a clear hostname (e.g. `DC01`).",
      "Install the AD DS role and promote it to a new forest (e.g. `corp.lab`). Use a lab-only domain name you do not own on the Internet.",
      "Confirm DNS works: the DC is its own DNS server; create a reverse lookup zone."]],
    ['Structure', [
      "Create OUs: `Corp > Users > (IT, HR, Finance, Sales)`, `Corp > Computers`, `Corp > Servers`, `Corp > Admins`.",
      "Bulk-create 20+ users from a CSV with PowerShell (`New-ADUser`) — keep the script in your repo.",
      "Create security groups per department and use AGDLP-style nesting for a shared folder.",
      "Create separate admin accounts (e.g. `adm-yourname`) — never use daily accounts for admin work."]],
    ['Group Policy', [
      "Password & lockout policy: 14+ character minimum, lockout after 5–10 failed attempts.",
      "Advanced audit policy: logon events, account management, process creation (with command line), Kerberos — you will need these logs in the SIEM project.",
      "Restrict Control Panel / USB storage for the Sales OU and map a drive for Finance.",
      "Deploy a desktop wallpaper or login banner GPO to prove policies apply; verify with `gpresult /r`."]],
    ['Clients & operations', [
      "Join two Windows 11 VMs to the domain; log in as different department users.",
      "Practice help-desk tasks: reset a password, unlock an account, disable a leaver, move a user between OUs.",
      "Create a file share with NTFS + share permissions following least privilege; test access as users from different groups."]]
  ],
  deliver: ['README with OU diagram and GPO list', 'PowerShell bulk user-creation script', 'Screenshots: ADUC tree, GPO results (`gpresult`), access-denied test', 'Short write-up: “Joiner / mover / leaver process in AD”'],
  bullet: "Deployed an Active Directory domain with 25+ users, department OUs, least-privilege file shares and 6 Group Policies (password, lockout, audit, device control), automating user provisioning with PowerShell.",
  interview: ['What is the difference between an OU and a group?', 'Why separate admin and daily accounts?', 'How do you troubleshoot a GPO that does not apply?', 'What happens when a user is disabled vs deleted?'],
  stretch: ['Add a second DC and test replication', 'Implement LAPS for local admin passwords', 'Set up fine-grained password policies for admins']
},
{
  id: 'p3', title: 'SIEM & Endpoint Detection Lab', icon: '📡', level: 'Intermediate', time: '2–4 days', roles: ['SOC analyst', 'Detection engineer'],
  objs: ['4.4', '4.8', '2.5'],
  why: "This is the single most requested skill for entry-level SOC jobs: collect logs, spot malicious behaviour, write detections and triage alerts. A working SIEM with custom rules and documented investigations is the strongest portfolio piece you can have.",
  build: "Wazuh (or Splunk Free / Elastic) collecting Windows Security + Sysmon logs from your domain, with simulated attacks, custom detection rules mapped to MITRE ATT&CK, and alert triage write-ups.",
  tools: [['Wazuh', 'free open-source SIEM/XDR (all-in-one installer on Ubuntu, 8 GB RAM recommended)'], ['Sysmon', 'free Microsoft Sysinternals tool for detailed endpoint logs'], ['Sysmon config', 'SwiftOnSecurity sysmon-config or Olaf Hartong sysmon-modular'], ['Atomic Red Team', 'free library of safe attack simulations (Invoke-AtomicRedTeam)'], ['MITRE ATT&CK', 'attack.mitre.org']],
  steps: [
    ['Deploy the SIEM', [
      "Create an Ubuntu Server VM in the SECURITY network (4 vCPU, 8 GB RAM, 50 GB+ disk).",
      "Install Wazuh with the official all-in-one quickstart (`curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash ./wazuh-install.sh -a`) and log in to the dashboard.",
      "Install the Wazuh agent on the DC and both Windows clients; confirm they show as active."]],
    ['Better telemetry', [
      "Install Sysmon on every Windows host with a community config: `Sysmon64.exe -accepteula -i sysmonconfig.xml`.",
      "Configure the agents to forward the `Microsoft-Windows-Sysmon/Operational` channel and PowerShell Operational logs.",
      "Verify you can search key events: 4624/4625 logons, 4720 user created, 4732/4728 group changes, 4688 process creation, Sysmon 1 (process), 3 (network), 11 (file), 22 (DNS)."]],
    ['Simulate attacks (on your own lab only)', [
      "Install Invoke-AtomicRedTeam on one client and snapshot it first.",
      "Run at least 6 techniques, e.g. T1059.001 PowerShell, T1053.005 scheduled task, T1136.001 local account, T1547.001 Run key persistence, T1003.001 LSASS access, T1070.001 clear event logs.",
      "Brute-force a domain account with wrong passwords to generate a burst of 4625 events.",
      "For each test, record the time, technique ID and what you expect to see in the logs."]],
    ['Detect & triage', [
      "Find each simulated attack in the SIEM; note which ones alerted by default and which were missed.",
      "Write at least 5 custom rules for the missed ones (e.g. new scheduled task by non-admin, encoded PowerShell `-enc`, 10+ failed logons in 2 minutes, security log cleared — Event ID 1102).",
      "Re-run the atomics and prove each custom rule now fires; tune out false positives you notice.",
      "Write 3 triage reports like a SOC ticket: alert, evidence, ATT&CK mapping, severity, verdict (true/false positive), recommended action."]]
  ],
  deliver: ['Architecture diagram (endpoints → agents → SIEM)', 'Detection rules file in the repo with comments', 'Detection coverage table: technique → default alert? → custom rule → tested ✔', '3 alert triage reports (Markdown or PDF)', 'Screenshots of dashboards and fired alerts', '3–5 minute video walkthrough'],
  bullet: "Built a Wazuh SIEM ingesting Windows Security and Sysmon logs from 3 endpoints; simulated 8 MITRE ATT&CK techniques with Atomic Red Team and wrote 6 custom detections, raising coverage from 3/8 to 8/8.",
  interview: ['Walk me through how you would triage a brute-force alert.', 'What is the difference between Event ID 4624 and 4625? What do logon types 3 and 10 mean?', 'Why add Sysmon if Windows already has logs?', 'How do you handle a noisy rule with many false positives?'],
  stretch: ['Add Linux auditd logs from the Ubuntu server', 'Build the same detections in Splunk SPL or Elastic KQL', 'Integrate VirusTotal enrichment into Wazuh alerts']
},
{
  id: 'p4', title: 'Active Directory Attack & Defense', icon: '⚔', level: 'Intermediate', time: '2–3 days', roles: ['SOC analyst', 'Pentester', 'Sysadmin'],
  objs: ['2.4', '2.5', '4.5', '4.8'],
  why: "Shows you understand how real breaches spread through a network — and, more importantly to defenders, how to detect and stop it. A 'purple team' write-up (attack → detection → fix) impresses both SOC and pentest hiring managers.",
  build: "Your AD lab deliberately weakened, attacked from Kali (password spraying, Kerberoasting, AS-REP roasting, BloodHound path analysis), detected in your SIEM, then hardened and re-tested.",
  tools: [['Kali Linux', 'attacker VM in the isolated ATTACK network'], ['Impacket', 'GetUserSPNs.py, GetNPUsers.py'], ['NetExec (formerly CrackMapExec)', 'password spraying'], ['BloodHound CE + SharpHound', 'attack path mapping'], ['Hashcat', 'offline cracking (modes 13100 and 18200)']],
  steps: [
    ['Set up weaknesses (lab only)', [
      "Snapshot the DC and clients first.",
      "Create a service account with an SPN and a weak password (e.g. `svc-sql`) — the Kerberoasting target.",
      "Create one user with 'Do not require Kerberos preauthentication' — the AS-REP roasting target.",
      "Give a helpdesk group excessive rights (e.g. GenericAll on a privileged group) to create a BloodHound attack path."]],
    ['Attack', [
      "Password spray one common password against all users with NetExec; respect your lockout threshold.",
      "Run BloodHound collection (SharpHound) with a normal user and find the shortest path to Domain Admins.",
      "Kerberoast: `GetUserSPNs.py corp.lab/user:pass -dc-ip <DC> -request`, then crack with `hashcat -m 13100`.",
      "AS-REP roast: `GetNPUsers.py corp.lab/ -usersfile users.txt -dc-ip <DC>`, crack with `hashcat -m 18200`.",
      "Write an attack timeline: time, technique, ATT&CK ID (T1110.003, T1558.003, T1558.004, T1087), result."]],
    ['Detect', [
      "Spraying: many 4625 / 4771 events across different accounts from one source IP.",
      "Kerberoasting: Event ID 4769 with ticket encryption type `0x17` (RC4) for a service account.",
      "AS-REP roasting: Event ID 4768 with pre-authentication type 0.",
      "Write SIEM rules for all three and confirm they fire on a re-run."]],
    ['Harden & re-test', [
      "Long random password (25+ chars) or a gMSA for the service account; remove the preauth exemption; fix the excessive ACL.",
      "Enforce AES for Kerberos where possible and review privileged group membership.",
      "Re-run every attack and document which now fail, and which detections still fire."]]
  ],
  deliver: ['Purple-team report: attack → evidence → detection → remediation → re-test', 'BloodHound screenshot of the attack path (before and after fix)', 'Detection rules for 3 AD attacks', 'Mitigation checklist for AD admins'],
  bullet: "Performed a purple-team assessment of a lab Active Directory: executed password spraying, Kerberoasting and AS-REP roasting, built SIEM detections (Event IDs 4769/4768/4771) and remediated attack paths identified with BloodHound.",
  interview: ['Explain Kerberoasting to a non-technical manager.', 'Why is RC4 encryption in a 4769 event suspicious?', 'How would you defend service accounts?', 'What is a gMSA?'],
  stretch: ['Add Microsoft Defender for Identity trial or a honeytoken account', 'Detect DCSync (Event ID 4662 with replication GUIDs)', 'Try LLMNR poisoning with Responder and disable LLMNR via GPO']
},
{
  id: 'p5', title: 'Network Segmentation, IDS & VPN', icon: '🧱', level: 'Intermediate', time: '2–3 days', roles: ['Network security', 'Security engineer', 'SOC analyst'],
  objs: ['3.2', '4.1', '4.4', '1.3'],
  why: "Firewall rules, segmentation and IDS alerts are core Security+ PBQ topics and daily work for network/security engineers. Showing a least-privilege rule base and a working IDS proves you can protect infrastructure, not just describe it.",
  build: "pfSense/OPNsense with separate LAN / SERVERS / DMZ / SECURITY networks, a documented least-privilege rule base, Suricata IDS/IPS with tuned rules, and remote access through a WireGuard VPN.",
  tools: [['pfSense / OPNsense', 'firewall, VLANs/interfaces'], ['Suricata', 'IDS/IPS package with ET Open rules'], ['WireGuard', 'VPN package'], ['Nmap', 'verify what is reachable'], ['Ubuntu + nginx', 'a DMZ web server']],
  steps: [
    ['Segment', [
      "Create interfaces (or VLANs) for LAN, SERVERS, DMZ and SECURITY; give each its own subnet and DHCP scope.",
      "Place a web server (Ubuntu + nginx with a self-signed or internal-CA TLS certificate) in the DMZ."]],
    ['Least-privilege rules', [
      "Start from default deny between all internal networks.",
      "Allow only what is needed: LAN → DC (DNS 53, Kerberos 88, LDAP 389, SMB 445…), LAN → DMZ web 443, DMZ → nothing internal, SECURITY → agents on required ports.",
      "Port-forward/NAT only HTTPS to the DMZ server if you expose anything; never expose RDP or SSH.",
      "Enable logging on deny rules and important allows; write a rule table: #, source, destination, port, action, justification.",
      "Prove it with Nmap from each network: document what is reachable and what is blocked (expected vs actual)."]],
    ['Detect', [
      "Install Suricata on the WAN and LAN interfaces with the ET Open ruleset (IDS mode first).",
      "Generate test alerts safely: `curl http://testmynids.org/uid/index.html` and an Nmap scan from Kali.",
      "Send Suricata alerts to your SIEM (syslog or EVE JSON) and build a small dashboard.",
      "Tune: disable or threshold 2–3 noisy rules and document why; then switch one interface to IPS (blocking) mode and test."]],
    ['Remote access', [
      "Configure a WireGuard VPN for remote admin access with its own tunnel subnet and rules limiting what VPN users reach.",
      "Test from your phone or laptop on another network (mobile hotspot); document the key-based authentication."]]
  ],
  deliver: ['Network diagram with zones and trust boundaries', 'Firewall rule table with justification for every rule', 'Nmap reachability matrix (before/after)', 'Suricata alert screenshots + tuning notes', 'VPN design notes'],
  bullet: "Segmented a lab network into 4 security zones on pfSense with a default-deny, documented rule base; deployed Suricata IDS/IPS with ET Open rules forwarding alerts to a SIEM, and configured WireGuard VPN for secure remote administration.",
  interview: ['Why put a web server in a DMZ?', 'Stateful vs stateless firewalls?', 'IDS vs IPS — when would you choose each?', 'How do you decide rule order?'],
  stretch: ['Add pfBlockerNG DNS filtering', 'Add a reverse proxy / WAF (e.g. ModSecurity) in front of the web server', '802.1X / NAC concepts write-up']
},
{
  id: 'p6', title: 'Vulnerability Management Program', icon: '🩺', level: 'Beginner–Intermediate', time: '1–2 days', roles: ['Vulnerability analyst', 'SOC analyst', 'Sysadmin', 'GRC'],
  objs: ['4.3', '2.4', '4.2', '5.2'],
  why: "Every security team runs a scan → prioritize → patch → verify cycle. Employers want people who can read a scan report, separate real risk from noise, and communicate fixes to IT owners. A before/after report proves exactly that.",
  build: "A full vulnerability management cycle on your lab: asset inventory, authenticated scans, risk-based prioritization (CVSS + EPSS + CISA KEV), remediation, re-scan and an executive summary.",
  tools: [['Nessus Essentials', 'free, up to 16 IPs (or OpenVAS / Greenbone Community)'], ['Metasploitable 2/3', 'intentionally vulnerable VM — isolated network only, never exposed'], ['CISA KEV catalog', 'known exploited vulnerabilities'], ['FIRST EPSS', 'exploit prediction scores']],
  steps: [
    ['Prepare', [
      "Build an asset inventory: hostname, IP, OS, owner, criticality (high/medium/low).",
      "Add a deliberately vulnerable VM (Metasploitable) to an isolated network segment.",
      "Install Nessus Essentials (or OpenVAS) in the SECURITY network."]],
    ['Scan', [
      "Run an unauthenticated network scan of all lab hosts.",
      "Run an authenticated (credentialed) scan using a dedicated scan account; compare how many more findings it reveals and explain why.",
      "Export the raw results."]],
    ['Prioritize', [
      "For the top 15 findings record: CVE, CVSS base score, EPSS probability, in CISA KEV (yes/no), asset criticality.",
      "Create a risk-based priority: e.g. KEV or EPSS > 10% on a critical asset = fix in 7 days; high CVSS only = 30 days.",
      "Mark false positives and accepted risks with a justification (exceptions need an owner and an expiry date)."]],
    ['Remediate & report', [
      "Patch/upgrade or reconfigure at least 5 findings on hosts you control (Windows Updates, disable SMBv1, remove weak TLS ciphers, update packages).",
      "Re-scan and show the before/after numbers by severity.",
      "Write a 1-page executive summary (risk in business terms) and a technical remediation table for IT."]]
  ],
  deliver: ['Asset inventory', 'Prioritized findings table (CVSS, EPSS, KEV, asset criticality, SLA)', 'Before/after chart of findings by severity', 'Executive summary + technical report (PDF)', 'Vulnerability management policy (1 page: scan frequency, SLAs, exceptions)'],
  bullet: "Ran a vulnerability management cycle across 6 lab assets using Nessus authenticated scans; prioritized findings with CVSS, EPSS and CISA KEV, remediated 12 issues and reduced critical/high findings by 80% on re-scan.",
  interview: ['Why are authenticated scans more accurate?', 'A critical CVSS 9.8 on an isolated test box vs a CVSS 7.5 in KEV on a web server — which first?', 'How do you handle a system that cannot be patched?', 'What is a false positive in scanning and how do you validate it?'],
  stretch: ['Scan a container image with Trivy', 'Automate weekly scans and email the report', 'Add web app scanning with OWASP ZAP against DVWA']
},
{
  id: 'p7', title: 'System Hardening & Compliance Baselines', icon: '🛡', level: 'Intermediate', time: '1–2 days', roles: ['Sysadmin', 'Security engineer', 'GRC / compliance'],
  objs: ['4.1', '2.4', '5.4', '1.2'],
  why: "Companies must prove systems meet CIS / NIST / DISA standards for audits and cyber insurance. Showing measured before/after compliance scores proves you can secure systems and speak the language of auditors.",
  build: "Windows and Linux servers hardened to CIS Benchmarks, with compliance scores measured before and after, deployed through Group Policy, and changes handled through a simple change-management record.",
  tools: [['CIS Benchmarks + CIS-CAT Lite', 'free benchmark PDFs and scanner'], ['Microsoft Security Compliance Toolkit', 'security baselines, Policy Analyzer, LGPO'], ['Lynis', 'free Linux auditing (`sudo lynis audit system`)'], ['OpenSCAP', 'optional Linux compliance scanner']],
  steps: [
    ['Baseline', [
      "Run CIS-CAT Lite (or Wazuh SCA) on a Windows 11 client and record the score.",
      "Run `sudo lynis audit system` on the Ubuntu server and record the hardening index and top warnings."]],
    ['Change management', [
      "Write a change request: what changes, why, risk, rollback plan, test plan, approval (you play the CAB).",
      "Snapshot the systems (your rollback)."]],
    ['Harden Windows', [
      "Import the Microsoft security baseline GPOs and link them to a test OU first.",
      "Disable SMBv1, LLMNR and NetBIOS over TCP/IP; enable Windows Firewall on all profiles; enforce BitLocker on a client.",
      "Remove local admin rights from standard users; enable Credential Guard / LSA protection if supported.",
      "Verify nothing broke (logins, file shares, mapped drives), then roll out to the production OU."]],
    ['Harden Linux', [
      "SSH: key-only authentication, disable root login, change idle timeout; enable `ufw` with default deny inbound.",
      "Enable automatic security updates, remove unused packages/services, set file permissions on sensitive files.",
      "Enable `auditd` with basic rules and forward logs to the SIEM."]],
    ['Measure', [
      "Re-run CIS-CAT / Lynis and record the new scores.",
      "List any controls you deliberately did not apply and why (business exceptions)."]]
  ],
  deliver: ['Before/after compliance scores (table or chart)', 'Change request document with rollback plan', 'Hardening checklist for Windows and Linux', 'Exceptions register'],
  bullet: "Hardened Windows 11 and Ubuntu systems to CIS Benchmarks using Microsoft security baselines, GPO and Linux configuration, raising compliance scores from 52% to 89% under a documented change-management process.",
  interview: ['What is a security baseline?', 'How do you roll out a hardening change without breaking production?', 'Why disable LLMNR and SMBv1?', 'What do you do when a business app needs an insecure setting?'],
  stretch: ['Automate Linux hardening with an Ansible playbook', 'Configuration drift detection with Wazuh SCA', 'Map each control to NIST SP 800-53 families']
},
{
  id: 'p8', title: 'Phishing Analysis & Email Security', icon: '🎣', level: 'Beginner', time: '1 day', roles: ['SOC analyst (Tier 1)', 'Security awareness'],
  objs: ['2.3', '2.5', '4.5', '5.6'],
  why: "Phishing is the #1 initial attack vector and reported-phish triage is the most common Tier-1 SOC task. Showing you can analyze headers, URLs and attachments safely and write a clear verdict is directly job-relevant.",
  build: "Five analyzed phishing samples with full investigation reports, extracted IOCs, an SPF/DKIM/DMARC explainer, and a short user awareness guide.",
  tools: [['Public phishing samples', 'e.g. the phishing_pot repository on GitHub (.eml files)'], ['Email header analyzers', 'MXToolbox, Google Admin Toolbox Messageheader'], ['URL / file reputation', 'VirusTotal, urlscan.io, AbuseIPDB'], ['Sandbox', 'any.run or Hybrid Analysis (free tiers)'], ['PhishTool', 'free community edition']],
  steps: [
    ['Set up safely', [
      "Work inside an isolated analysis VM; never open samples on your host or click links directly.",
      "Download 5 different sample types: credential harvest, malicious attachment, invoice/BEC, fake delivery notice, QR-code phish."]],
    ['Analyze each email', [
      "Headers: trace the Received chain, compare From vs Return-Path vs Reply-To, note the sending IP.",
      "Read Authentication-Results: SPF, DKIM, DMARC pass/fail and what each means.",
      "Extract URLs (defanged, e.g. `hxxps://evil[.]com`) and check them in urlscan.io / VirusTotal without visiting them.",
      "Hash any attachment (`Get-FileHash` / `sha256sum`) and check the hash; detonate in a public sandbox only if allowed.",
      "List social-engineering tricks used: urgency, authority, lookalike domain, mismatched link text."]],
    ['Respond', [
      "Write the verdict (malicious / suspicious / benign) and recommended actions: block sender/domain/URL, search and purge from other mailboxes, reset credentials if clicked.",
      "Compile all IOCs in a table (type, value, source, confidence)."]],
    ['Prevent', [
      "Write a 1-page explainer of SPF, DKIM and DMARC with example DNS records (`v=spf1 …`, `v=DMARC1; p=reject; …`).",
      "Create a one-page 'how to spot phishing' guide for employees."]]
  ],
  deliver: ['5 phishing investigation reports (ticket format)', 'IOC table (defanged)', 'SPF/DKIM/DMARC explainer', 'Employee awareness one-pager'],
  bullet: "Investigated 5 real-world phishing samples (credential harvesting, BEC, malicious attachments), analyzing headers, SPF/DKIM/DMARC and sandbox results; documented verdicts, IOCs and containment steps in SOC ticket format.",
  interview: ['A user reports a suspicious email — walk me through your process.', 'SPF passes but it is still phishing — how?', 'What does DMARC p=reject do?', 'The user already entered their password — now what?'],
  stretch: ['Run an authorized simulated phishing campaign in your lab with GoPhish', 'Automate header parsing with a Python script', 'Write a Wazuh/SIEM rule for mail-gateway logs']
},
{
  id: 'p9', title: 'Incident Response: Network & Memory Forensics', icon: '🔬', level: 'Intermediate', time: '2–3 days', roles: ['SOC analyst', 'Incident responder', 'DFIR'],
  objs: ['4.7', '4.8', '2.5', '2.4'],
  why: "When an alert is real, employers need people who can investigate evidence, build a timeline and write a report that management can act on. Real packet captures and memory images make this project credible.",
  build: "Two full investigations — one from a malware packet capture and one from a Windows memory image — each with a timeline, IOCs, ATT&CK mapping and a formal incident report following the IR lifecycle.",
  tools: [['Wireshark', 'packet analysis'], ['malware-traffic-analysis.net', 'free real malware PCAP exercises'], ['Volatility 3', 'memory forensics'], ['Memory samples', 'CyberDefenders or MemLabs challenges'], ['Zeek / NetworkMiner', 'optional extraction tools']],
  steps: [
    ['Case 1 — network', [
      "Pick a malware-traffic-analysis.net exercise and download it in your analysis VM.",
      "Identify the infected host: IP, MAC, hostname (DHCP/NBNS), user account (Kerberos/SMB).",
      "Use filters: `http.request`, `dns`, `tls.handshake.type == 1` (SNI), and Statistics → Conversations / Endpoints.",
      "Find the initial download, the command-and-control (C2) traffic and any data exfiltration; export suspicious objects and hash them.",
      "Build a timeline (UTC) from first malicious event to last."]],
    ['Case 2 — memory', [
      "Load a memory image in Volatility 3: `vol -f mem.raw windows.info`.",
      "List processes and parents: `windows.pslist`, `windows.pstree` — look for odd parents (e.g. Word spawning PowerShell).",
      "Network connections: `windows.netscan`; injected code: `windows.malfind`; command lines: `windows.cmdline`.",
      "Correlate suspicious PIDs with network connections and extract IOCs."]],
    ['Report', [
      "Write each report with the IR lifecycle: preparation, detection & analysis, containment, eradication, recovery, lessons learned.",
      "Include an executive summary, timeline, IOC table, ATT&CK mapping and recommendations.",
      "Note chain-of-custody basics: evidence hashes (SHA-256), who handled it and when."]]
  ],
  deliver: ['2 incident reports (PDF) with executive summary', 'Timelines', 'IOC tables', 'Wireshark and Volatility screenshots with filters/commands used'],
  bullet: "Conducted two end-to-end incident investigations using Wireshark and Volatility 3 on real malware evidence, identifying infected hosts, C2 infrastructure and injected processes; produced IR reports with timelines, IOCs and ATT&CK mappings.",
  interview: ['What is the order of volatility and why does it matter?', 'How do you find the infected user from a PCAP?', 'What would make a process look suspicious in memory?', 'Contain first or investigate first — how do you decide?'],
  stretch: ['Capture memory from your own lab VM after an Atomic test and analyze it', 'Build a triage script with KAPE or Velociraptor', 'Write a playbook for ransomware response']
},
{
  id: 'p10', title: 'Cloud Security on AWS', icon: '☁', level: 'Intermediate', time: '2–3 days', roles: ['Cloud security', 'SOC analyst', 'Security engineer'],
  objs: ['3.1', '4.5', '4.4', '3.3'],
  why: "Most companies run workloads in the cloud and misconfigurations cause most cloud breaches. Hands-on IAM, logging and posture management is one of the fastest ways to stand out from other entry-level candidates.",
  build: "A secured AWS account with least-privilege IAM, CloudTrail and GuardDuty monitoring, a deliberately misconfigured resource that you detect and fix, and a cloud posture scan report.",
  tools: [['AWS Free Tier', 'set a budget alarm before anything else'], ['IAM Identity Center / IAM', 'least-privilege access'], ['CloudTrail, GuardDuty, AWS Config, Security Hub', 'GuardDuty and Security Hub have free trials'], ['Prowler', 'free open-source cloud security scanner']],
  steps: [
    ['Secure the account first', [
      "Create a billing budget alert (e.g. $5) and enable MFA on the root user; then stop using root.",
      "Create an admin identity (IAM Identity Center or IAM user with MFA) and a read-only auditor identity.",
      "Enable CloudTrail for all regions, logging to an encrypted S3 bucket with Block Public Access on."]],
    ['Monitor', [
      "Enable GuardDuty and Security Hub (CIS AWS Foundations Benchmark standard).",
      "Enable AWS Config with rules such as `s3-bucket-public-read-prohibited` and `restricted-ssh`."]],
    ['Break it on purpose, then catch it', [
      "Create an S3 bucket and briefly make a test object public (no real data); create a security group allowing SSH from 0.0.0.0/0.",
      "Find both in Config / Security Hub; trace who made the change in CloudTrail (event name, user, source IP, time).",
      "Remediate: re-enable Block Public Access, restrict SSH to your IP or use Session Manager instead.",
      "Run Prowler against the account and summarize the top findings."]],
    ['Least privilege', [
      "Write a custom IAM policy that allows read-only access to one S3 bucket only; test that other actions are denied.",
      "Use IAM Access Analyzer to check for unintended external access."]],
    ['Clean up', [
      "Delete test resources and disable paid trials you no longer need; confirm the bill is $0–$2."]]
  ],
  deliver: ['Account security checklist (root MFA, budget, CloudTrail…)', 'Misconfiguration detection write-up with CloudTrail evidence', 'Custom least-privilege IAM policy (JSON) with test results', 'Prowler / Security Hub summary report'],
  bullet: "Secured an AWS account with MFA, least-privilege IAM and multi-region CloudTrail; enabled GuardDuty, Config and Security Hub (CIS benchmark), detected and remediated public S3 and open-SSH misconfigurations, and validated posture with Prowler.",
  interview: ['Explain the shared responsibility model for IaaS.', 'How would you investigate who made an S3 bucket public?', 'Security group vs network ACL?', 'Why should you never use the root account day to day?'],
  stretch: ['Repeat the core ideas in Azure with Microsoft Sentinel free trial', 'Infrastructure as code with Terraform + a scan using Checkov', 'Automate remediation with an EventBridge rule and Lambda']
},
{
  id: 'p11', title: 'Security Automation with Python & PowerShell', icon: '🤖', level: 'Intermediate', time: '2–3 days', roles: ['SOC analyst', 'Security engineer', 'Detection engineer'],
  objs: ['4.6', '4.8', '4.4'],
  why: "Teams are overloaded, so analysts who can automate repetitive work get hired and promoted faster. Even small, well-documented scripts on GitHub show problem-solving and coding ability that most entry-level applicants lack.",
  build: "Three useful tools: an IOC enrichment script, a Windows failed-logon reporter, and a log parser — each with a README, sample output and safe secret handling.",
  tools: [['Python 3', 'requests, csv, argparse'], ['PowerShell 7', 'Get-WinEvent'], ['VirusTotal & AbuseIPDB APIs', 'free API keys with rate limits'], ['Git + GitHub', 'version control']],
  steps: [
    ['Tool 1 — IOC enricher (Python)', [
      "Read a list of IPs, domains and hashes from a file.",
      "Query VirusTotal (API v3) and AbuseIPDB; respect free-tier rate limits (sleep between calls).",
      "Output a CSV with indicator, type, detections, reputation score and a verdict column.",
      "Load API keys from environment variables — never commit keys; add a `.gitignore`."]],
    ['Tool 2 — failed logon report (PowerShell)', [
      "Query Security events 4625 with `Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625}`.",
      "Group by target account and source IP; flag any source with 10+ failures in 10 minutes.",
      "Export an HTML or CSV report and schedule it with Task Scheduler."]],
    ['Tool 3 — log parser', [
      "Parse an Apache/nginx access log or Linux `auth.log`.",
      "Report top IPs, failed SSH logins, 404 scanning patterns and suspicious user agents."]],
    ['Quality', [
      "Add argparse/parameters, error handling and a `--help` message.",
      "Write a README for each tool: problem it solves, usage, example output, limitations.",
      "Estimate time saved (e.g. 'enriching 50 IOCs manually takes ~40 min, the script takes 3 min')."]]
  ],
  deliver: ['GitHub repo `security-scripts` with 3 tools', 'README per tool with sample output', 'Short demo GIF or video', 'Time-saved estimate in the README'],
  bullet: "Developed Python and PowerShell security tools for IOC enrichment (VirusTotal, AbuseIPDB), failed-logon reporting and log parsing, reducing manual triage time for 50 indicators from ~40 minutes to 3 minutes.",
  interview: ['How do you protect API keys in scripts?', 'What would you automate first in a SOC?', 'How do you handle API rate limits?', 'Walk me through your code.'],
  stretch: ['Turn the enricher into a Wazuh/Shuffle SOAR workflow', 'Add unit tests and a GitHub Actions workflow', 'Build a small Flask dashboard for results']
},
{
  id: 'p12', title: 'GRC: Risk Assessment, Policies & IR Plan', icon: '📋', level: 'Beginner–Intermediate', time: '2–3 days', roles: ['GRC analyst', 'Compliance', 'Security analyst'],
  objs: ['5.1', '5.2', '5.3', '5.4', '5.5', '4.7'],
  why: "Governance, risk and compliance roles are a common entry point into security and do not require deep technical skills — but they require clear writing and frameworks. A complete risk package for a fictional company is a strong, unusual portfolio piece.",
  build: "A security program package for a fictional 50-person company: asset inventory, risk register with quantitative examples, NIST CSF 2.0 gap assessment, core policies, vendor risk questionnaire, incident response plan and a tabletop exercise.",
  tools: [['NIST Cybersecurity Framework 2.0', 'free'], ['NIST SP 800-61', 'incident handling guide'], ['CIS Controls v8', 'free'], ['Spreadsheet + document editor', 'any']],
  steps: [
    ['Company profile', [
      "Invent a company: industry, size, data handled (e.g. customer PII, card payments), main systems, cloud vs on-prem.",
      "List applicable regulations/standards (e.g. PCI DSS for cards, GDPR/state privacy laws for PII)."]],
    ['Risk', [
      "Create an asset inventory with owners and classification (public, internal, confidential, restricted).",
      "Build a risk register with 15+ risks: threat, vulnerability, likelihood, impact, inherent risk, control, residual risk, owner, treatment (mitigate/transfer/accept/avoid).",
      "Add quantitative examples: SLE = asset value × exposure factor, ALE = SLE × ARO; compare ALE with control cost.",
      "Define the risk appetite and which risks exceed it."]],
    ['Framework gap assessment', [
      "Score current maturity for each NIST CSF 2.0 function (Govern, Identify, Protect, Detect, Respond, Recover) from 0–4.",
      "List the top 10 gaps and a 12-month roadmap with priorities."]],
    ['Policies & third parties', [
      "Write concise policies: Acceptable Use, Password/Access Control, Data Classification & Handling, Backup.",
      "Create a vendor security questionnaire (SOC 2 report? encryption? breach notification time? right to audit?)."]],
    ['Incident response', [
      "Write an IR plan following NIST SP 800-61: roles (RACI), severity levels, communication plan, escalation contacts, evidence handling.",
      "Run a tabletop exercise (ransomware scenario with 4–5 injects) and write the after-action report with lessons learned."]]
  ],
  deliver: ['Risk register spreadsheet', 'NIST CSF 2.0 gap assessment + roadmap', '4 policies', 'Vendor risk questionnaire', 'Incident response plan', 'Tabletop exercise after-action report'],
  bullet: "Produced a complete security program for a fictional 50-employee company: asset inventory, 15-item risk register with ALE calculations, NIST CSF 2.0 gap assessment and roadmap, four policies, vendor risk questionnaire and a NIST 800-61 incident response plan validated by a tabletop exercise.",
  interview: ['How do you calculate ALE? Give an example.', 'What is the difference between a policy, standard and procedure?', 'How would you prioritize 10 gaps with a small budget?', 'What happens in a tabletop exercise?'],
  stretch: ['Business impact analysis with RTO/RPO for each system', 'Map controls across NIST CSF, CIS Controls and ISO 27001', 'Security awareness training plan with metrics']
},
{
  id: 'p13', title: 'Capstone: Full Attack Simulation & Response', icon: '🎯', level: 'Advanced', time: '3–5 days', roles: ['SOC analyst', 'Incident responder', 'Detection engineer'],
  objs: ['4.7', '4.8', '4.4', '2.5'],
  why: "This ties everything together into one story you can tell in every interview: a realistic multi-stage attack, detected by your monitoring, investigated, contained and fixed. It proves you can work end to end like a real analyst.",
  build: "A multi-stage adversary emulation in your lab (initial access → execution → persistence → credential access → lateral movement → exfiltration), detected in the SIEM/IDS, fully investigated and reported, with an ATT&CK coverage map.",
  tools: [['MITRE Caldera or Atomic Red Team', 'adversary emulation'], ['Your SIEM, Sysmon, Suricata', 'from earlier projects'], ['ATT&CK Navigator', 'coverage heat map'], ['Everything you built so far', '']],
  steps: [
    ['Plan the operation', [
      "Choose a threat profile (e.g. a ransomware affiliate) and pick 8–12 ATT&CK techniques across at least 6 tactics.",
      "Write rules of engagement: scope (lab only), timing, success criteria, rollback snapshots."]],
    ['Execute', [
      "Run the chain with Caldera or a sequence of Atomic tests — e.g. phishing payload, PowerShell execution, scheduled-task persistence, LSASS credential access, lateral movement over SMB/WinRM, data staged and exfiltrated over HTTPS.",
      "Keep an attacker log with exact timestamps for later comparison."]],
    ['Respond as the SOC', [
      "Switch hats: start from the first alert only and investigate as if you did not know the attack.",
      "Build the timeline from SIEM, Sysmon, Suricata and Windows logs; scope affected hosts and accounts.",
      "Contain: isolate the host (firewall rule / disable NIC), disable compromised accounts, block C2 indicators.",
      "Eradicate and recover: remove persistence, reset credentials, restore from snapshot/backup, verify clean."]],
    ['Measure & improve', [
      "Compare attacker log vs what you detected: which techniques were detected, missed, or detected late?",
      "Build an ATT&CK Navigator layer showing coverage (detected / partial / missed).",
      "Write new detections for at least two missed techniques and re-test.",
      "Calculate simple metrics: time to detect and time to contain for the exercise."]]
  ],
  deliver: ['Full incident report with executive summary and timeline', 'Attacker log vs detection comparison', 'ATT&CK Navigator coverage layer (JSON + screenshot)', 'New detections for missed techniques', '10-minute video presentation of the whole exercise'],
  bullet: "Planned and executed a 10-technique adversary emulation in a lab enterprise network, then detected, investigated, contained and remediated it as the SOC; measured detection coverage in ATT&CK Navigator and closed 2 detection gaps.",
  interview: ['Tell me about a complex investigation you have done.', 'What did your monitoring miss and why?', 'How did you contain the compromised host?', 'What metrics would you report to management?'],
  stretch: ['Automate containment with a SOAR playbook', 'Repeat with a different threat profile and compare coverage', 'Invite a friend to attack while you defend blind']
},
{
  id: 'p14', title: 'Portfolio & Job Launch', icon: '🚀', level: 'All levels', time: '2–3 days', roles: ['All roles'],
  objs: ['5.6'],
  why: "Great labs are wasted if nobody sees them. Recruiters spend seconds per profile: a clean portfolio, results-focused resume and confident project stories turn your labs into interviews and offers.",
  build: "A GitHub portfolio, LinkedIn profile, resume and interview stories built from your completed projects.",
  tools: [['GitHub', 'profile README, pinned repos'], ['LinkedIn', 'Featured section, posts'], ['A blog (optional)', 'GitHub Pages, Medium or Hashnode'], ['Resume template', 'one page, ATS-friendly']],
  steps: [
    ['Portfolio', [
      "Create a GitHub profile README listing every project with a one-line result and a link.",
      "Pin your 6 best repos; make sure every README has a diagram, screenshots and 'what I learned'.",
      "Scrub all repos for secrets, real IPs, personal data and license-restricted material before making them public."]],
    ['Resume & LinkedIn', [
      "Add a 'Projects' section to your resume with 3–5 bullets using the action + tool + measurable result formula.",
      "Put Security+ (and any other certs) at the top; tailor keywords to each job description (SIEM, EDR, incident response, vulnerability management).",
      "Update LinkedIn headline (e.g. 'Security+ | SOC Analyst | SIEM & Incident Response Home Lab'), About section and Featured links.",
      "Post one write-up per project on LinkedIn over the next weeks."]],
    ['Interview prep', [
      "Prepare a STAR story for each project: Situation, Task, Action, Result.",
      "Practice explaining your capstone in 2 minutes and in 10 minutes.",
      "Do 3 mock interviews (friend, mentor or recorded yourself) using the interview questions in each project.",
      "Apply to 5–10 targeted roles per week and track applications in a spreadsheet."]]
  ],
  deliver: ['GitHub profile README with all projects', 'Updated resume (PDF)', 'Updated LinkedIn with Featured projects', 'STAR stories document', 'Application tracker'],
  bullet: "Use the bullets from each completed project in your resume's Projects section.",
  interview: ['Tell me about yourself.', 'Which project are you most proud of and why?', 'What would you do in your first 90 days as a SOC analyst?', 'Why security, and why our company?'],
  stretch: ['Speak at a local BSides / ISSA / OWASP chapter meetup', 'Contribute a detection rule to an open-source project (e.g. Sigma)', 'Mentor someone starting their own lab']
}
];
