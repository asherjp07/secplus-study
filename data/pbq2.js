(function(){const {pbq,T}=SP;

pbq('4.1','Fix the firewall rule order',
'A junior admin wrote the rules below, but (1) the blocked threat IP can still reach the web server and (2) the admin subnet cannot SSH to servers. Rules are evaluated top-down; first match wins.',
`CURRENT ORDER
 A  ALLOW  any              → 10.1.1.10  TCP 443
 B  DENY   any              → any        any
 C  DENY   198.51.100.66    → any        any      (known threat IP)
 D  ALLOW  10.9.9.0/24      → 10.1.1.0/24 TCP 22  (admin subnet SSH)`,
[T.order('Arrange the rules in the correct order.',['C  DENY 198.51.100.66 → any','D  ALLOW 10.9.9.0/24 → 10.1.1.0/24 TCP 22','A  ALLOW any → 10.1.1.10 TCP 443','B  DENY any → any (final deny)']),
 T.mc('Why could the threat IP reach the web server with the original order?',['Rule A matched its HTTPS traffic before the deny rule C was evaluated','Deny rules only apply to UDP','The firewall ignores IP addresses','Rule B allowed it']),
 T.mc('Why must rule B be last?',['A deny-any rule shadows every rule below it','It improves logging speed','Firewalls require deny rules to be last by syntax only','It enables NAT'])],
'Specific denies first, then specific allows, then the catch-all deny.');

pbq('2.5','Packet capture analysis',
'An IDS alerted on traffic from 10.0.5.77. Review the tcpdump excerpt.',
'',
[T.lines('Select ALL lines that are part of the suspicious activity.',[
 '10:02:01.001 IP 10.0.2.15.51522 > 142.250.80.46.443: Flags [S]',
 '10:02:01.020 IP 142.250.80.46.443 > 10.0.2.15.51522: Flags [S.]',
 '*10:02:05.100 IP 10.0.5.77.40001 > 10.0.1.20.21: Flags [S]',
 '*10:02:05.101 IP 10.0.5.77.40001 > 10.0.1.20.22: Flags [S]',
 '*10:02:05.102 IP 10.0.5.77.40001 > 10.0.1.20.23: Flags [S]',
 '*10:02:05.103 IP 10.0.5.77.40001 > 10.0.1.20.25: Flags [S]',
 '*10:02:05.104 IP 10.0.5.77.40001 > 10.0.1.20.80: Flags [S]',
 '*10:02:05.105 IP 10.0.1.20.22 > 10.0.5.77.40001: Flags [S.]',
 '*10:02:05.106 IP 10.0.5.77.40001 > 10.0.1.20.22: Flags [R]',
 '10:02:09.400 IP 10.0.2.15.51530 > 10.0.0.53.53: UDP, A? intranet.corp.local']),
 T.mc('What activity is 10.0.5.77 performing?',['TCP SYN (half-open) port scan','DNS cache poisoning','Normal web browsing','ARP spoofing']),
 T.mc('Which port on 10.0.1.20 responded as OPEN?',['22','21','23','80']),
 T.mc('What is the BEST next step?',['Identify the owner/process on 10.0.5.77 and check whether the scan was authorized','Shut down 10.0.1.20','Block all SSH company-wide','Ignore it because no data was stolen'])],
'Sequential SYNs to many ports with a SYN/ACK followed by RST is a half-open scan; the SYN/ACK shows port 22 is open.');

pbq('4.8','NetFlow exfiltration hunt',
'Leadership suspects data exfiltration last weekend. Review the NetFlow summary (bytes are outbound from the source).',
'',
[T.lines('Select ALL flows that are MOST likely exfiltration.',[
 'Sat 01:12  10.2.0.31 → 13.107.42.14  TCP 443  0.8 MB   (Microsoft 365)',
 '*Sat 02:40  10.2.0.50 → 185.199.110.9 TCP 443  4.2 GB   (unknown VPS)',
 'Sat 03:00  10.2.0.12 → 10.2.0.250    TCP 445  6.0 GB   (internal backup server)',
 '*Sat 03:05  10.2.0.50 → 185.199.110.9 TCP 443  3.8 GB   (unknown VPS)',
 'Sat 09:15  10.2.0.31 → 151.101.1.69  TCP 443  0.2 MB   (news site)',
 '*Sun 02:10  10.2.0.50 → 45.77.12.8    TCP 53   1.1 GB   (non-DNS server, TCP 53)',
 'Sun 11:00  10.2.0.40 → 10.2.0.53     UDP 53   0.01 MB  (internal DNS)']),
 T.num('How many GB in total did 10.2.0.50 send to external addresses?',9.1,0.05),
 T.mc('The flow to 45.77.12.8 over TCP 53 MOST likely indicates:',['DNS tunneling / exfiltration over a commonly allowed port','Normal DNS resolution','A backup job','Patch download']),
 T.mc('Which data source would show the actual content transferred?',['Packet capture (if available)','NetFlow','SNMP','Badge logs'])],
'10.2.0.50 is the HR database server; 4.2 + 3.8 + 1.1 = 9.1 GB. Internal backup traffic is expected.');

pbq('4.5','Cloud IAM policy review',
'Review the IAM policy attached to a web application role. The app only needs to read objects from the bucket “app-assets”.',
`{
  "Statement": [
    { "Effect": "Allow", "Action": "s3:GetObject",  "Resource": "arn:aws:s3:::app-assets/*" },
    { "Effect": "Allow", "Action": "s3:*",          "Resource": "*" },
    { "Effect": "Allow", "Action": "iam:PassRole",  "Resource": "*" },
    { "Effect": "Allow", "Action": "logs:PutLogEvents", "Resource": "arn:aws:logs:*:*:log-group:/app/*" }
  ]
}`,
[T.grid('Decide whether each statement should be kept or removed.',
 [['Statement',null],['Decision',['Keep','Remove']]],
 [['s3:GetObject on app-assets/*','Keep'],['s3:* on *','Remove'],['iam:PassRole on *','Remove'],['logs:PutLogEvents on /app/* log group','Keep']]),
 T.mc('Which principle does the corrected policy enforce?',['Least privilege','Separation of duties','Defense in depth only','Fail-open']),
 T.mc('Why is iam:PassRole on all resources dangerous?',['It can allow privilege escalation by attaching more powerful roles to resources','It slows logging','It disables MFA','It encrypts buckets']),
 T.mc('Which tool continuously flags overly permissive policies like this across accounts?',['CSPM','NetFlow','WAF','HIDS'])],
'Writing application logs is a reasonable need; wildcard S3 and PassRole are excessive.');

pbq('3.2','Network segmentation policy',
'A company is segmenting its flat network into zones. Policy:\n• Guests: internet only.\n• IoT (cameras, sensors): may send only to the IoT management server in the Server zone.\n• Corporate users: may reach servers and the internet; never IoT devices directly.\n• Servers: may not initiate connections to the Corporate or Guest zones.\nSelect the action for each flow.',
'',
[T.grid('Allow or deny each flow.',
 [['Source zone',null],['Destination',null],['Action',['ALLOW','DENY']]],
 [['Guest','Internet','ALLOW'],['Guest','Corporate','DENY'],['IoT','IoT mgmt server (Server zone)','ALLOW'],['IoT','Internet','DENY'],['Corporate','Server zone','ALLOW'],['Corporate','IoT cameras','DENY'],['Server zone','Corporate workstations','DENY'],['Corporate','Internet','ALLOW']]),
 T.mc('Which technology is MOST commonly used to create these zones on existing switches?',['VLANs with inter-VLAN ACLs/firewall','Air gapping every device','Wildcard certificates','Port mirroring']),
 T.mc('What is the main security benefit of this design?',['Limits lateral movement and reduces the blast radius of a compromise','Eliminates the need for patching','Speeds up Wi-Fi','Removes the need for logging'])],
'');

pbq('2.5','Phishing email analysis',
'A user forwarded a suspicious email. Review the headers and body.',
`From: "Microsoft 365 Security" <no-reply@micros0ft-support.com>
Reply-To: helpdesk.verify@gmail.com
Return-Path: <bounce@mailer-xz.ru>
Authentication-Results: spf=fail; dkim=none; dmarc=fail
Subject: URGENT: Your mailbox will be deleted in 2 hours

Your password has expired. Verify now to avoid permanent data loss:
https://micros0ft-support.com/login?user=jdoe@company.com`,
[T.ms('Which indicators show this is phishing? (Choose four.)',['Lookalike sender domain (micros0ft)','Reply-To and Return-Path differ from the sender domain','SPF and DMARC failed','Urgent threat with a short deadline','The email has a subject line','The message mentions Microsoft 365'],4),
 T.mc('What type of attack is this?',['Credential-harvesting phishing using typosquatting','Whaling of the CEO','Vishing','Watering hole']),
 T.order('Order the response steps.',['Block the sender domain and URL at the email gateway and proxy','Search for and purge the same email from all mailboxes','Check proxy logs for users who clicked the link','Reset credentials and sessions for any user who entered a password']),
 T.mc('Which control on the RECEIVING mail gateway would MOST likely have stopped delivery?',['Quarantining or rejecting inbound mail that fails SPF and DMARC checks','Publishing a BIMI record','Increasing mailbox quotas','Disabling TLS on the mail server'])],
'Inbound filtering that honors SPF/DMARC failures quarantines such mail. The lookalike domain itself may pass its own checks in other campaigns, so user awareness and URL filtering remain important.');

pbq('5.4','Privacy requests',
'The privacy office received several requests. Identify the privacy concept for each.',
'',
[T.grid('Select the concept that applies.',
 [['Request',null],['Concept',['Right to be forgotten','Data correction','Processing restriction','Opt-in','Opt-out','Legal hold']]],
 [['“Delete my account and all my data.”','Right to be forgotten'],['“My birth date is wrong; please fix it.”','Data correction'],['“Stop using my data for profiling but keep my account.”','Processing restriction'],['User unsubscribes from marketing emails they were auto-enrolled in','Opt-out'],['User must tick a box before receiving SMS marketing','Opt-in'],['Litigation pending: preserve all records of customer #4471','Legal hold']]),
 T.mc('Customer #4471 also requests deletion while the legal hold is active. What should the company do?',['Preserve the data under legal hold and inform the customer of the lawful basis for retention','Delete it immediately','Sell the data','Ignore both requests'])],
'');

pbq('5.2','Business impact analysis',
'A BIA identified the maximum tolerable downtime (MTD) for each system. Choose the recovery approach that meets each requirement at the lowest reasonable cost.',
`System            MTD        Data loss tolerated
Online payments   15 min     None
Email             8 hours    1 hour
HR portal         3 days     24 hours
Archive search    2 weeks    1 week`,
[T.grid('Select the recovery site and backup approach.',
 [['System',null],['Recovery site',['Hot site','Warm site','Cold site']],['Backup approach',['Real-time replication','Hourly snapshots','Nightly backups','Weekly backups']]],
 [['Online payments','Hot site','Real-time replication'],['Email','Warm site','Hourly snapshots'],['HR portal',['Cold site','Warm site'],'Nightly backups'],['Archive search','Cold site','Weekly backups']]),
 T.mc('The “data loss tolerated” column defines which metric?',['RPO','RTO','MTBF','ALE']),
 T.mc('The RTO for each system must be:',['Less than or equal to its MTD','Greater than its MTD','Equal to its MTBF','Unrelated to MTD'])],
'');

pbq('1.3','Certificate troubleshooting',
'Users report browser certificate errors on several sites. Identify the MOST likely cause of each error.',
'',
[T.grid('Select the cause for each symptom.',
 [['Symptom',null],['Cause',['Expired certificate','Revoked certificate','Name mismatch','Untrusted/self-signed issuer','Missing intermediate certificate']]],
 [['Certificate valid 2024-01-01 to 2025-01-01; today is 2026','Expired certificate'],['OCSP responder returns “revoked”','Revoked certificate'],['Site is shop.example.com; certificate is for www.example.com only','Name mismatch'],['Issuer is the server itself (CN=server01)','Untrusted/self-signed issuer'],['Works in some browsers; others say “unable to build chain to trusted root”','Missing intermediate certificate']]),
 T.mc('The private key for a web server was posted on GitHub. What must happen FIRST?',['Revoke the certificate and reissue with a new key pair','Renew with the same key','Change the server hostname','Disable OCSP']),
 T.mc('Which approach prevents surprise expirations across hundreds of certificates?',['Automated certificate life cycle management with monitoring and auto-renewal','Using self-signed certificates','Longer passwords','Disabling HTTPS'])],
'');

pbq('4.1','Replace insecure protocols',
'An audit found several insecure protocols in use. Choose the secure replacement and its default port.',
'',
[T.grid('Select the secure replacement and default port.',
 [['Insecure protocol',null],['Secure replacement',['SSH','HTTPS','LDAPS','SFTP','SNMPv3','IMAPS','SMTPS/submission']],['Port',['22','443','636','161','993','587']]],
 [['Telnet (23)','SSH','22'],['HTTP (80)','HTTPS','443'],['LDAP (389)','LDAPS','636'],['FTP (21)','SFTP','22'],['SNMPv1/v2c (161)','SNMPv3','161'],['IMAP (143)','IMAPS','993'],['SMTP relay without TLS (25)','SMTPS/submission','587']]),
 T.mc('Which secure protocol is used to protect DNS records from spoofing by adding digital signatures?',['DNSSEC','DoH only','SNMPv3','LDAPS'])],
'SNMPv3 still uses UDP 161 but adds authentication and encryption.');

pbq('4.5','Choose the right MFA',
'Select the BEST authentication method for each situation.',
'',
[T.grid('Choose the method.',
 [['Situation',null],['Method',['FIDO2 hardware key','Authenticator app (TOTP/push with number matching)','Smart card (PIV/CAC)','Backup codes','Biometrics on a managed device']]],
 [['Domain administrators who are frequent phishing targets','FIDO2 hardware key'],['Government employees who badge into buildings and log in to PCs','Smart card (PIV/CAC)'],['General staff accessing SaaS apps from phones','Authenticator app (TOTP/push with number matching)'],['User lost their phone and needs one-time recovery','Backup codes'],['Clinicians needing fast passwordless login on shared managed tablets',['Biometrics on a managed device','FIDO2 hardware key']]]),
 T.mc('Which control defeats MFA fatigue/push-bombing attacks?',['Number matching and rate limiting on push prompts','Shorter passwords','SMS codes','Disabling logging'])],
'');

pbq('4.8','Insider data theft investigation',
'HR reports that an engineer who resigned yesterday may have taken design files. Review the endpoint and DLP events.',
'',
[T.lines('Select ALL events relevant to possible data theft.',[
 'Mon 09:01 login OK user=tchen host=ENG-LT22',
 '*Mon 17:45 DLP: 312 files from \\\\fs01\\designs copied to E:\\ (USB, SanDisk 256GB) user=tchen',
 'Mon 17:50 Windows Update installed KB503xxxx host=ENG-LT22',
 '*Mon 17:58 browser upload 1.9 GB to drive.personal-cloud.com user=tchen',
 '*Mon 18:03 Event 1102: Security audit log cleared user=tchen',
 'Tue 08:30 login OK user=akumar host=ENG-LT19',
 '*Tue 08:40 resignation submitted user=tchen']),
 T.ms('Which stakeholders should be involved? (Choose two.)',['Legal','Human Resources','Marketing','The employee’s personal friends'],2),
 T.order('Order the investigative actions.',['Preserve evidence: image the laptop and secure DLP/proxy logs','Document chain of custody','Disable the user’s access and revoke sessions','Analyze artifacts and build a timeline','Report findings to HR and Legal']),
 T.mc('What does Event 1102 indicate?',['The security log was cleared, possibly to hide activity','A normal patch install','A successful login','A USB was safely ejected'])],
'Clearing logs right after copying files is a strong indicator of intent.');

pbq('4.3','Validate scan findings',
'Compare the scanner findings with the CMDB to decide which are true or false positives.',
`CMDB
 web02  Ubuntu 22.04, nginx 1.24, no Apache installed, OpenSSH 9.6
 db01   Windows Server 2022, SQL Server 2019 CU12 (latest CU = CU28)
 fw01   Firewall OS 10.2.9 (vendor advisory affects < 10.2.7)

SCANNER FINDINGS
 F1 web02  Apache httpd 2.4.49 path traversal (banner-based)
 F2 db01   SQL Server 2019 missing cumulative updates
 F3 fw01   Firewall OS < 10.2.7 RCE
 F4 web02  OpenSSH weak MAC algorithms enabled (config check)`,
[T.grid('Classify each finding.',
 [['Finding',null],['Classification',['True positive','False positive']]],
 [['F1 Apache path traversal on web02','False positive'],['F2 SQL Server missing CUs on db01','True positive'],['F3 Firewall RCE on fw01','False positive'],['F4 Weak SSH MACs on web02','True positive']]),
 T.mc('Why might F1 have been reported?',['A banner or misidentified service response, not an installed package','A credentialed scan confirmed Apache','The CMDB is always wrong','Apache is built into Ubuntu']),
 T.mc('What should be done with confirmed false positives?',['Document them and tune the scanner (exceptions) so they do not recur','Delete the scanner','Mark every finding as false positive','Ignore future scans'])],
'');

pbq('1.1','Zero Trust access decisions',
'Policy: access requires (a) a valid user with MFA, (b) a managed, compliant device, (c) role authorization for the app. If only the location is unusual, require step-up MFA. Decide each request.',
'',
[T.grid('Choose the decision.',
 [['Request',null],['Decision',['Allow','Deny','Step-up MFA']]],
 [['Finance user, MFA OK, managed compliant laptop, Finance app, usual city','Allow'],['Finance user, MFA OK, personal unmanaged laptop, Finance app','Deny'],['HR user, MFA OK, managed compliant laptop, Finance app (not in role)','Deny'],['Engineer, MFA OK, managed compliant laptop, Git app, logging in from a new country','Step-up MFA'],['Sales user, MFA OK, managed laptop missing critical patches, CRM app','Deny']]),
 T.mc('Which Zero Trust component evaluates these conditions and makes the decision?',['Policy engine','Policy enforcement point','Subject','Data plane switch'])],
'');

pbq('1.2','Review a change request',
'Review the change request submitted to the CAB.',
`CHANGE REQUEST #4821
 Title:        Upgrade VPN concentrator firmware 9.1 → 10.0
 Requested by: N. Silva   Owner: (blank)
 Scheduled:    Wednesday 11:00 (business hours)
 Impact:       "Minimal"
 Systems:      VPN concentrator
 Testing:      "Vendor says it works"
 Backout plan: (blank)
 Dependencies: (blank)  [note: RADIUS server, MFA integration, 1,200 remote users]`,
[T.ms('Which items must be corrected before approval? (Choose four.)',['Assign a change owner','Add a tested backout plan','Schedule in an approved maintenance window','Document dependencies (RADIUS, MFA) and test results in staging','Change the firmware version number to 9.2','Remove the title'],4),
 T.mc('Which impact rating is MOST accurate given 1,200 remote users depend on the VPN?',['High – loss of remote access for all users if it fails','Minimal','None','Only affects the CAB']),
 T.mc('Who should be notified as stakeholders?',['Remote users’ managers, help desk and the identity/RADIUS team','Only the vendor','No one','The marketing department only'])],
'');

pbq('5.3','Vendor risk tiering',
'Assign each vendor a risk tier and the assessment you would require.',
'',
[T.grid('Select tier and required assurance.',
 [['Vendor',null],['Risk tier',['High','Medium','Low']],['Required assurance',['SOC 2 Type II + right to audit + annual pen test','Security questionnaire + certifications review','Basic due diligence only']]],
 [['Cloud payroll provider storing SSNs and bank data','High','SOC 2 Type II + right to audit + annual pen test'],['MSP with domain admin access to all servers','High','SOC 2 Type II + right to audit + annual pen test'],['Marketing agency with access to anonymized campaign metrics','Medium','Security questionnaire + certifications review'],['Office supply vendor with no system or data access','Low','Basic due diligence only']]),
 T.mc('The MSP uses a subcontractor for after-hours support. What should the contract address?',['Fourth-party/subprocessor risk and flow-down security requirements','Nothing; subcontractors are not relevant','The color of the support portal','Expression of interest'])],
'');

pbq('2.3','Physical security assessment',
'During a walkthrough you observed the issues below. Choose the BEST control for each.',
'',
[T.grid('Select the control.',
 [['Observation',null],['Best control',['Access control vestibule','Visitor log and escorts','Badge reader with anti-passback','Bollards','Cable locks','Privacy screens','Motion-activated lighting and CCTV']]],
 [['Employees hold the main door open for people behind them','Access control vestibule'],['Contractors wander unaccompanied in the server area','Visitor log and escorts'],['One badge is passed back through a fence to let a second person in','Badge reader with anti-passback'],['A vehicle could be driven into the glass lobby','Bollards'],['Laptops in the open-plan office are frequently stolen','Cable locks'],['Customer data visible on reception screens from the waiting area','Privacy screens'],['The rear loading dock is dark and unmonitored at night','Motion-activated lighting and CCTV']])],
'');

pbq('2.5','Identify the social engineering attack',
'Classify each reported incident.',
'',
[T.grid('Select the attack.',
 [['Incident',null],['Attack',['Phishing','Spear phishing','Whaling','Vishing','Smishing','Quishing','Business email compromise','Pretexting','Watering hole','Tailgating']]],
 [['Generic “reset your password” email to all staff','Phishing'],['Email to the payroll team referencing their new payroll system by name','Spear phishing'],['Email crafted for the CEO about a board lawsuit','Whaling'],['Caller claiming to be from the bank’s fraud department asks for an OTP','Vishing'],['Text message with a fake toll-road payment link','Smishing'],['Parking meter sticker with a QR code to a fake payment site','Quishing'],['Compromised vendor mailbox sends updated bank details for invoices','Business email compromise'],['Attacker poses as a new auditor needing access for “year-end testing”','Pretexting'],['Industry forum site infected to target its members','Watering hole'],['Person in a delivery uniform follows staff through a secure door','Tailgating']])],
'');

pbq('4.1','Configure the MDM policy',
'Configure the MDM policy for corporate-owned and BYOD phones based on requirements:\n• Corporate-owned: full device management, full remote wipe allowed, no sideloading.\n• BYOD: protect only corporate data; never wipe personal data.\n• Both: 6+ digit PIN and device encryption.',
'',
[T.grid('Select each setting.',
 [['Setting',null],['Corporate-owned',['Full device management','Work profile/container only']],['BYOD',['Full device management','Work profile/container only']]],
 [['Management scope','Full device management','Work profile/container only']]),
 T.grid('Select the remaining settings.',
 [['Setting',null],['Corporate-owned',['Full wipe','Selective (corporate data) wipe','No wipe']],['BYOD',['Full wipe','Selective (corporate data) wipe','No wipe']]],
 [['Lost/stolen device action','Full wipe','Selective (corporate data) wipe']]),
 T.ms('Which settings apply to BOTH device types? (Choose three.)',['Minimum 6-digit PIN','Device encryption required','Block jailbroken/rooted devices from corporate data','Allow sideloading of unknown apps','Disable screen lock'],3),
 T.mc('Which MDM feature can disable corporate app access when a device leaves approved countries?',['Geofencing','Tokenization','Port mirroring','Key escrow'])],
'');

pbq('4.4','SIEM alert tuning',
'The SOC receives 4,000 alerts a day. Review last week’s top rules and choose the tuning action for each.',
`Rule                                   Alerts/wk  True positives  Notes
R1 Failed login (1 failure)             9,800      0              Normal typos
R2 Vuln scanner traffic detected        6,200      0              Authorized scanner 10.0.9.5
R3 Impossible travel                       40      12             Confirmed takeovers
R4 New admin group membership              15       4             Some approved changes
R5 Outbound to known C2 (threat feed)       3       3             All real`,
[T.grid('Select the BEST action.',
 [['Rule',null],['Action',['Raise threshold (e.g., 10 failures in 5 min)','Suppress for the known-good source','Keep as is','Enrich with change-ticket context','Escalate to high severity/auto-contain']]],
 [['R1 Failed login (1 failure)','Raise threshold (e.g., 10 failures in 5 min)'],['R2 Vuln scanner traffic','Suppress for the known-good source'],['R3 Impossible travel','Keep as is'],['R4 New admin group membership','Enrich with change-ticket context'],['R5 Outbound to known C2','Escalate to high severity/auto-contain']]),
 T.mc('What risk must be considered when suppressing alerts for the scanner IP?',['An attacker who compromises or spoofs the scanner host could go undetected','The scanner will run faster','False negatives cannot occur','SIEM licensing will double'])],
'');

pbq('5.5','Plan an audit engagement',
'You are planning the annual security audit program.',
'',
[T.grid('Select the BEST engagement type for each need.',
 [['Need',null],['Engagement',['Gap analysis','Self-assessment','Independent third-party audit','Regulatory examination','Penetration test','Benchmarking']]],
 [['Prepare for first ISO 27001 certification','Gap analysis'],['Customers demand an unbiased SOC 2 report','Independent third-party audit'],['Banking regulator reviews compliance','Regulatory examination'],['Validate whether attackers can reach the cardholder data environment','Penetration test'],['Compare our phishing click rate with industry peers','Benchmarking'],['Team quickly checks its own patch compliance each quarter','Self-assessment']]),
 T.mc('Which document defines internal audit’s authority, scope and independence?',['Audit charter','SOW','SLA','AUP']),
 T.mc('Auditors test 30 of 2,000 change tickets for approval evidence. What technique is this?',['Sampling','Interviews','Benchmarking','Assertion'])],
'');
})();
