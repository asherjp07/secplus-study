(function(){const {mc,ms,tf,fill,match,order,cat}=SP;
/* ===== 5.1 GRC artifacts ===== */
mc('5.1','Which document is a high-level statement of management’s intent that is mandatory for all employees?',['Policy','Guideline','Procedure','Benchmark'],'Policies are high-level and mandatory; standards and procedures support them.');
mc('5.1','A document states that all laptops MUST use AES-256 full-disk encryption. What type of document is this?',['Standard','Guideline','Policy','Advisory'],'Standards define specific mandatory requirements.');
mc('5.1','A document provides step-by-step instructions for onboarding a new firewall. What is it?',['Procedure (SOP)','Policy','Guideline','Standard'],'');
mc('5.1','A document RECOMMENDS—but does not require—using a password manager. What type of document is this?',['Guideline','Standard','Policy','Procedure'],'Guidelines are optional recommendations.');
mc('5.1','Which policy defines what employees may and may not do with company computers and internet access?',['Acceptable use policy (AUP)','BYOD policy','Data retention policy','Incident response policy'],'');
mc('5.1','Which policy requires employees to secure papers and lock screens when leaving their desks?',['Clean desk policy','AUP','Privacy policy','Change management policy'],'');
mc('5.1','Which policy governs employees using personal smartphones to access corporate email?',['BYOD policy','Clean desk policy','Data disposal policy','Vulnerability disclosure policy'],'');
mc('5.1','A SOC analyst follows a document with exact steps to contain a phishing incident. What is this?',['Runbook','Policy','Guideline','Reference architecture'],'Runbooks are detailed operational step-by-step guides.');
mc('5.1','A vendor-published design showing a recommended secure deployment of its product is a(n):',['Reference architecture','Policy','SLA','Standard'],'');
mc('5.1','Which policy tells external researchers how to report security flaws they find in the company’s products?',['Vulnerability disclosure policy','AUP','Data retention policy','BYOD policy'],'');
mc('5.1','Which document type are Internet RFCs considered in this objective?',['Standards','Policies','Procedures','Guidelines only'],'RFCs define technical standards (e.g., protocols).');
ms('5.1','Which are MANDATORY governance documents? (Choose three.)',['Policy','Standard','Procedure','Guideline','Vendor marketing white paper'],3,'Guidelines are recommended, not mandatory.');
match('5.1','Match each governance document to its description.',[['Policy','High-level mandatory intent'],['Standard','Specific mandatory requirement'],['Procedure','Step-by-step instructions'],['Guideline','Optional recommendation'],['Baseline','Minimum security configuration']],'');
cat('5.1','Classify each item.',['Policy','Standard','Procedure','Guideline'],[['AUP',0],['Clean desk policy',0],['Passwords must be 14+ characters',1],['TLS 1.2 or higher required',1],['Steps to reset a user’s MFA',2],['Runbook for ransomware isolation',2],['Recommendation to use passphrases',3],['Vendor implementation guide',3]],'');
tf('5.1','Guidelines are mandatory and employees can be disciplined for not following them.',false,'Guidelines are recommendations.');
fill('5.1','The policy that defines acceptable use of company IT resources is the ________ (acronym).',['AUP','acceptable use policy'],'');

/* ===== 5.2 Risk management ===== */
mc('5.2','A server worth $100,000 would lose 40% of its value in a flood. What is the single loss expectancy (SLE)?',['$40,000','$100,000','$4,000','$140,000'],'SLE = AV × EF = $100,000 × 0.40 = $40,000.');
mc('5.2','The SLE of an event is $40,000 and it is expected once every 4 years. What is the ALE?',['$10,000','$160,000','$40,000','$4,000'],'ARO = 1/4 = 0.25. ALE = $40,000 × 0.25 = $10,000.');
mc('5.2','A laptop worth $2,000 is stolen about 5 times per year. Exposure factor is 100%. What is the ALE?',['$10,000','$2,000','$400','$5,000'],'SLE = $2,000; ALE = $2,000 × 5 = $10,000.');
mc('5.2','A company purchases cyber insurance to cover breach costs. Which risk treatment is this?',['Transfer','Accept','Avoid','Mitigate'],'');
mc('5.2','A company decides to stop offering a risky online service entirely. Which risk treatment is this?',['Avoid','Transfer','Accept','Mitigate'],'');
mc('5.2','The cost to fix a low-impact risk exceeds the potential loss, so management signs off and does nothing further. Which treatment is this?',['Accept','Avoid','Transfer','Mitigate'],'');
mc('5.2','A company installs a WAF to reduce the likelihood of web attacks. Which treatment is this?',['Mitigate','Accept','Transfer','Avoid'],'');
mc('5.2','The risk remaining after security controls are implemented is called:',['Residual risk','Inherent risk','Risk appetite','Control risk'],'');
mc('5.2','Which document tracks identified risks, their owners, ratings and treatment plans?',['Risk register','SLA','Runbook','Audit charter'],'');
mc('5.2','A risk assessment rates risks as High, Medium and Low using a heat map. What approach is this?',['Qualitative','Quantitative','Semi-automated','Annualized'],'');
mc('5.2','Which analysis identifies critical business functions and the impact of losing them, including RTO and RPO targets?',['Business impact analysis (BIA)','Gap analysis','Penetration test','Vulnerability scan'],'');
mc('5.2','The board states it is willing to accept moderate risk to pursue rapid growth. What does this define?',['Risk appetite','Residual risk','ARO','Exposure factor'],'');
mc('5.2','What does ARO represent?',['The number of times a risk is expected to occur per year','The cost of a single incident','The percentage of asset loss','The asset value'],'');
mc('5.2','Which formula is correct?',['ALE = SLE × ARO','SLE = ALE × ARO','ARO = SLE × AV','EF = ALE × AV'],'Also SLE = AV × EF.');
ms('5.2','Which are valid risk treatment strategies? (Choose four.)',['Accept','Avoid','Transfer','Mitigate','Ignore','Deny'],4,'Ignoring risk is not a treatment; acceptance must be a documented decision.');
match('5.2','Match each risk treatment to its example.',[['Transfer','Buy cyber insurance'],['Avoid','Discontinue the risky activity'],['Accept','Formally document and take no action'],['Mitigate','Implement controls to reduce risk']],'');
match('5.2','Match each risk term to its definition.',[['SLE','Loss from one occurrence'],['ARO','Expected occurrences per year'],['ALE','Expected yearly loss'],['EF','Percentage of asset value lost'],['Residual risk','Risk left after controls']],'');
tf('5.2','Quantitative risk analysis uses monetary values such as SLE and ALE.',true,'');
fill('5.2','ALE is calculated by multiplying SLE by ________ (acronym).',['ARO','annualized rate of occurrence'],'');

/* ===== 5.3 Third-party risk ===== */
mc('5.3','A company sends vendors a document requesting detailed proposals that explain how they would deliver a SIEM solution. What is this?',['RFP','RFI','RFQ','SOW'],'Request for proposal.');
mc('5.3','A company is just exploring the market and asks vendors for general information about their capabilities. What is this?',['RFI','RFP','RFQ','MSA'],'Request for information comes earliest.');
mc('5.3','A company already knows exactly what it wants and asks vendors only for pricing. What is this?',['RFQ','RFI','RFP','EOI'],'Request for quote.');
mc('5.3','Which agreement specifies measurable service commitments such as 99.9% uptime and penalties if they are not met?',['SLA','MOU','NDA','EOI'],'');
mc('5.3','Two agencies sign an informal document stating their intent to cooperate on a project, without binding obligations. What is it?',['MOU','SLA','SOW','MSA'],'');
mc('5.3','Which agreement defines the specific deliverables, timeline and cost for a particular project under a broader contract?',['SOW','MSA','NDA','MOU'],'');
mc('5.3','Which agreement establishes the overarching terms for all future work between a company and a vendor?',['MSA','SOW','SLO','EOI'],'');
mc('5.3','Which contract clause allows a customer to inspect a vendor’s security controls?',['Right to audit','Non-compete','Force majeure','Indemnification'],'');
mc('5.3','Before signing, the security team reviews a vendor’s SOC 2 Type II report, financial stability and breach history. What is this?',['Due diligence','Rules of engagement','Change management','Fail forward'],'');
mc('5.3','A vendor’s proprietary data formats make it extremely costly to switch providers. What risk is this?',['Vendor lock-in','Data sovereignty','Privilege creep','Shadow IT'],'');
mc('5.3','A penetration testing firm and its client agree on scope, testing hours, permitted techniques and emergency contacts. What is this document?',['Rules of engagement','SLA','NDA','MOU'],'');
mc('5.3','A specific target value within an SLA, such as “API response under 200 ms 99% of the time,” is a(n):',['SLO','MOA','EOI','RFQ'],'');
mc('5.3','Which document is used to protect confidential information shared with a prospective vendor?',['NDA','SLA','SOW','RFQ'],'');
ms('5.3','Which are methods of ongoing VENDOR MONITORING? (Choose three.)',['Right-to-audit reviews','Service-level monitoring','Compliance attestations (SOC 2, ISO 27001)','Ignoring vendor incidents','Sharing admin passwords'],3,'');
match('5.3','Match each agreement to its description.',[['SLA','Service commitments with penalties'],['MOU','Informal statement of intent'],['MOA','Formal cooperative terms'],['NDA','Confidentiality'],['MSA','Overarching terms for future work'],['SOW','Specific deliverables and timeline']],'');
order('5.3','Order the vendor procurement requests from earliest/most general to most specific.',['RFI','RFP','RFQ'],'Information → proposal → quote.');
tf('5.3','An MOU is typically a legally binding contract with financial penalties.',false,'MOUs are generally non-binding statements of intent.');
fill('5.3','A document more formal than an MOU that defines the specific cooperative terms between parties is a memorandum of ________.',['agreement'],'MOA = memorandum of agreement.');

/* ===== 5.4 Compliance ===== */
mc('5.4','A customer asks a company to delete all of their personal data. Which privacy right is this?',['Right to be forgotten (erasure)','Data portability','Legal hold','Opt-in consent'],'');
mc('5.4','A lawsuit is filed and the company is instructed to preserve all related email, overriding normal deletion schedules. What is this?',['Legal hold','E-discovery','Data minimization','Right to be forgotten'],'');
mc('5.4','Employees annually sign a form confirming they have read and will follow the security policies. What is this?',['Acknowledgement','Attestation by external auditor','Legal hold','Due diligence'],'');
mc('5.4','A company formally declares to regulators that its controls meet requirements. What is this?',['Attestation','Acknowledgement','MOU','RFQ'],'');
mc('5.4','A website asks users to tick a box before marketing emails are sent. Which privacy concept is this?',['Opt-in','Opt-out','Right to be forgotten','Processing prevention'],'');
mc('5.4','A bank trains staff to recognize suspicious transactions that may fund criminal or terrorist activity. What training is this?',['AML/CTF compliance training','Phishing simulation','Clean desk training','Change management training'],'');
mc('5.4','A company loses its license to process credit cards after repeated PCI DSS violations. Which consequence of non-compliance is this?',['Loss of license','Reputational damage only','Contractual bonus','Legal hold'],'');
mc('5.4','A user requests that their incorrect address be fixed in a company’s records. Which privacy right is this?',['Data correction (rectification)','Right to be forgotten','Processing prevention','Opt-out'],'');
mc('5.4','Which entity is responsible for determining why and how personal data is processed?',['Controller','Processor','Subprocessor','Custodian'],'');
ms('5.4','Which are consequences of non-compliance? (Choose three.)',['Fines','Reputational damage','Sanctions','Guaranteed profit','Automatic certification'],3,'');
match('5.4','Match each privacy concept to its description.',[['Right to be forgotten','Erase personal data on request'],['Opt-in','User must actively consent'],['Opt-out','User must act to stop processing'],['Data correction','Fix inaccurate data'],['Legal hold','Preserve data for litigation']],'');
tf('5.4','A legal hold can override a normal data retention and disposal schedule.',true,'');

/* ===== 5.5 Audit & assessment ===== */
mc('5.5','A penetration tester is given full network diagrams, source code and credentials. What type of test is this?',['Known environment (white box)','Unknown environment (black box)','Partially known (gray box)','Passive reconnaissance'],'');
mc('5.5','A penetration tester receives only the company name and must discover everything else. What type of test is this?',['Unknown environment (black box)','Known environment','Partially known environment','Integrated'],'');
mc('5.5','A tester is given a list of IP ranges and a standard user account but no other details. What type of test is this?',['Partially known environment (gray box)','Known environment','Unknown environment','Physical only'],'');
mc('5.5','A tester researches the target using LinkedIn, the company website and DNS records without sending any packets to the target. What is this?',['Passive reconnaissance','Active reconnaissance','Exploitation','Lateral movement'],'');
mc('5.5','A tester runs Nmap port scans against the target’s public IP range. What is this?',['Active reconnaissance','Passive reconnaissance','OSINT only','Social engineering'],'');
mc('5.5','Red and blue teams work together, sharing findings in real time to improve defenses. What type of exercise is this?',['Integrated (purple team)','Offensive only','Defensive only','Known environment'],'');
mc('5.5','Which framework maps adversary tactics and techniques such as “Initial Access” and “Lateral Movement”?',['MITRE ATT&CK','Cyber Kill Chain','Diamond Model','ISO 27001'],'');
mc('5.5','Which model analyzes intrusions using four features: adversary, capability, infrastructure and victim?',['Diamond Model of Intrusion Analysis','Cyber Kill Chain','MITRE ATT&CK','NIST CSF'],'');
mc('5.5','A company compares its current controls with ISO 27001 requirements to find missing controls before certification. What is this?',['Gap analysis','Penetration test','Benchmarking','Tabletop'],'');
mc('5.5','Which document grants an internal audit function its authority, scope and responsibilities?',['Audit charter','SOW','SLA','Rules of engagement'],'');
mc('5.5','An external, independent firm reviews a company’s controls and issues an opinion for customers. What type of engagement is this?',['Independent third-party audit','Self-assessment','Gap analysis by staff','Internal compliance review'],'');
mc('5.5','Auditors review 25 randomly selected user accounts out of 5,000 to test access controls. What data-gathering technique is this?',['Sampling','Interviews','Assertion','Benchmarking'],'');
mc('5.5','A tester attempts to bypass badge readers and pick locks to enter the facility. What type of test is this?',['Physical penetration test','Unknown environment network test','Defensive exercise','Code review'],'');
mc('5.5','Which is an example of a REGION-specific framework or regulation?',['GDPR','ISO 27001','PCI DSS','CIS Controls'],'GDPR applies to the EU. ISO is international; PCI DSS is industry-based.');
ms('5.5','Which are valid data-gathering methods in an audit? (Choose three.)',['Sampling','Interviews','Questionnaires/surveys','Guessing','Deleting logs'],3,'');
order('5.5','Order the Cyber Kill Chain phases.',['Reconnaissance','Weaponization','Delivery','Exploitation','Installation','Command and control','Actions on objectives'],'');
match('5.5','Match each penetration test type to its description.',[['Known environment','Full information provided'],['Unknown environment','No information provided'],['Partially known environment','Limited information provided'],['Offensive (red team)','Simulates attackers'],['Defensive (blue team)','Defends and detects'],['Integrated (purple team)','Red and blue collaborate']],'');
cat('5.5','Classify each reconnaissance activity.',['Passive','Active'],[['Reviewing public DNS records via search',0],['Searching LinkedIn for employee names',0],['Reading the company’s job postings',0],['Port scanning with Nmap',1],['Banner grabbing on a web server',1],['Running a vulnerability scan',1]],'');
tf('5.5','Passive reconnaissance involves directly scanning the target’s systems.',false,'Passive recon avoids direct interaction.');
fill('5.5','The framework that catalogs adversary tactics and techniques is MITRE ________.',['ATT&CK','ATTACK','ATT and CK'],'');

/* ===== 5.6 Security awareness ===== */
mc('5.6','An employee clicks a link in a simulated phishing email and is automatically enrolled in a short training module. What training type is this?',['Corrective','Initial/onboarding','Ongoing','Targeted executive'],'');
mc('5.6','New employees complete security training during their first week. What type of training is this?',['Initial/onboarding','Corrective','Targeted','Remedial'],'');
mc('5.6','Finance staff receive extra training on wire-fraud and business email compromise. What type of training is this?',['Targeted (role-based)','Initial','Corrective','One-to-many general'],'');
mc('5.6','An accounts payable clerk receives an email from a known vendor asking to change bank account details for future payments. What is the BEST action?',['Verify the request out-of-band using a known phone number','Reply to the email to confirm','Update the details immediately','Forward it to all staff'],'BEC attacks are stopped by out-of-band verification.');
mc('5.6','Which metric BEST shows the improvement of a phishing awareness program over time?',['Increasing report rate and decreasing click rate','Number of emails sent','Number of slides in training','Number of policies written'],'');
mc('5.6','Training is delivered, tracked and scored through an online platform. What delivery mechanism is this?',['Learning management system (LMS)','One-to-one','Tabletop','Captive portal'],'');
mc('5.6','A system assigns each employee a score based on risky behaviors such as failed phishing tests and policy violations. What is this?',['Personnel behavior risk scoring','CVSS','Risk appetite','ALE'],'');
mc('5.6','An employee working at a coffee shop positions their laptop so others cannot see the screen. Which awareness topic does this demonstrate?',['Situational awareness / shoulder surfing prevention','Tokenization','BYOD containerization','Code signing'],'');
mc('5.6','Which topic warns users not to plug in charging cables or USB drives from unknown sources?',['Removable media and cables','Password reuse','Clean desk','Data retention'],'Malicious cables (e.g., O.MG) can inject keystrokes.');
mc('5.6','Employees are trained not to post details about upcoming product launches or travel plans on social media. Which topic is this?',['Operational security (OPSEC)','Change management','Asset disposal','Data transpose'],'');
ms('5.6','Which are common security awareness training topics? (Choose three.)',['Social engineering','Password and credential management','Remote/hybrid work security','Configuring BGP','Writing kernel drivers'],3,'');
match('5.6','Match each training type to its description.',[['Initial/onboarding','Given to new hires'],['Ongoing','Periodic refresher'],['Targeted','For specific roles or risks'],['Corrective','After a failure or violation']],'');
cat('5.6','Classify each delivery mechanism.',['One-to-one','One-to-many','Self-paced'],[['Coaching session with a manager',0],['Individual mentoring after a policy violation',0],['All-hands security webinar',1],['Classroom lecture',1],['LMS e-learning module',2],['Self-service knowledge portal',2]],'');
tf('5.6','In phishing simulations, increasing the number of users who REPORT suspicious emails is a positive outcome.',true,'');
fill('5.6','Fraud where attackers use a compromised or spoofed business email to request payments is called ________ (acronym).',['BEC','business email compromise'],'');
})();
