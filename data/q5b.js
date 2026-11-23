(function(){const {mc,ms,tf,fill,match,order,cat}=SP;
/* ===== 5.1 additional ===== */
mc('5.1','The CISO wants a document that states the organization will protect information assets according to risk and assigns overall security responsibilities. Which document is this?',['Information security policy','Runbook','Implementation guide','RFC'],'');
mc('5.1','A Microsoft “Security Baseline” for Windows 11 recommends specific settings. In GRC terms, how is this BEST categorized?',['A benchmark/guideline used to build a standard baseline','A policy','A contract','An incident report'],'');
mc('5.1','A government agency publishes a warning about actively exploited vulnerabilities and recommended mitigations. What GRC artifact is this?',['Advisory','Policy','Procedure','SOW'],'');
mc('5.1','Which document sets rules for how long different types of data are kept and when they are destroyed?',['Data classification and retention policy','Clean desk policy','BYOD policy','Change request'],'');
mc('5.1','Which plan describes how IT systems will be restored at an alternate site after a disaster?',['Disaster recovery plan','Acceptable use policy','Incident response playbook for phishing','Vendor SLA'],'');
mc('5.1','A company states that all badges must be worn visibly and visitors must be escorted. Which standard category is this?',['Physical security standard','Encryption standard','Password standard','RFC'],'');
mc('5.1','Which policy defines how the company responds when a security incident is detected, including roles and reporting?',['Incident response policy','Data disposal policy','BYOD policy','Privacy policy'],'');
mc('5.1','Who typically approves organizational security policies?',['Senior management/executive leadership','Individual help desk technicians','External attackers','Vendors'],'');
cat('5.1','Classify each artifact.',['Plan','Procedure/runbook','Guideline'],[['Business continuity plan',0],['Disaster recovery plan',0],['SOP for creating user accounts',1],['Runbook for restoring a database',1],['Vendor hardening guide',2],['Reference architecture',2]],'');
tf('5.1','Procedures describe how to perform tasks step by step, while policies describe what must be achieved and why.',true,'');

/* ===== 5.2 additional ===== */
mc('5.2','A data center is worth $2,000,000. A fire would cause 25% damage and is expected once every 20 years. What is the ALE?',['$25,000','$500,000','$100,000','$50,000'],'SLE = 2,000,000 × 0.25 = 500,000. ARO = 0.05. ALE = 25,000.');
mc('5.2','A control costs $15,000 per year and reduces ALE from $40,000 to $10,000. What is the annual value of the control?',['$15,000 (savings of $30,000 minus $15,000 cost)','$30,000','$40,000','–$15,000'],'Value = (ALE before − ALE after) − annual cost.');
mc('5.2','A web server worth $50,000 has an SLE of $10,000. What is the exposure factor?',['20%','5%','50%','10%'],'EF = SLE / AV.');
mc('5.2','A risk register lists “ransomware on file servers” with risk owner “IT Director.” What is the owner’s responsibility?',['Ensuring the risk is managed and treatment decisions are made and tracked','Personally performing all backups','Writing all policies','Paying the ransom'],'');
mc('5.2','Before any controls, a risk is rated High. After EDR and backups are added it is rated Low. What is “High” called?',['Inherent risk','Residual risk','Risk appetite','Control risk'],'');
mc('5.2','A startup’s leadership is willing to tolerate significant risk to launch quickly. How would its risk appetite be described?',['Expansionary/aggressive','Conservative','Neutral','Zero'],'');
mc('5.2','A risk assessment uses a 5×5 matrix combining likelihood and impact scores. What is this?',['Qualitative (semi-quantitative) scoring','Quantitative ALE calculation','A BIA','A gap analysis'],'');
mc('5.2','A company outsources payment processing to a PCI-compliant provider so card data never touches its servers. Which treatment is this primarily?',['Transfer (and avoidance of storing card data)','Accept','Ignore','Mitigate only with antivirus'],'');
mc('5.2','Which regulatory consideration MOST influences risk decisions for a healthcare provider?',['HIPAA requirements for protecting PHI','The CVSS of printers','Company logo colors','Vendor marketing'],'');
mc('5.2','What is the maximum amount of time a business function can be down before causing unacceptable harm?',['Maximum tolerable downtime (MTD)','MTBF','RPO','ALE'],'RTO must be shorter than MTD.');
order('5.2','Order the risk management process.',['Identify assets and risks','Analyze likelihood and impact','Evaluate against risk appetite','Select a treatment','Monitor and review via the risk register'],'');
fill('5.2','SLE equals asset value multiplied by the ________ factor.',['exposure'],'');

/* ===== 5.3 additional ===== */
mc('5.3','A vendor will host customer PII. Which document gives the BEST assurance about its security controls over time?',['SOC 2 Type II report','A marketing brochure','The vendor’s logo','An RFQ'],'Type II reports test operating effectiveness over a period.');
mc('5.3','A company discovers its procurement manager is related to the owner of a bidding vendor. What issue must be addressed?',['Conflict of interest','Vendor lock-in','Data sovereignty','Right to audit'],'');
mc('5.3','A vendor’s SLA states 99.9% uptime per month. Approximately how much downtime is allowed in a 30-day month?',['About 43 minutes','About 4 hours','About 7 hours','Zero'],'30 days × 24 × 60 × 0.001 ≈ 43.2 minutes.');
mc('5.3','Interested vendors notify a company that they would like to be considered for a future project. What is this?',['Expression of interest (EOI)','RFQ','SOW','NDA'],'');
mc('5.3','A company maintains a central list of all vendors with their risk tier, data access and contract dates. What is this?',['Vendor registry','Risk appetite','CRL','Audit charter'],'');
mc('5.3','A cloud vendor stores data only in one foreign country with strict government access laws. Which constraint is MOST relevant?',['Geography/jurisdiction','Staffing limitations','ROI','Assurance mechanisms only'],'');
mc('5.3','A vendor answers a 200-question security questionnaire. What is the main limitation of relying solely on this?',['Answers are self-reported and may not be verified','It is always legally binding','It replaces all contracts','It guarantees zero risk'],'');
mc('5.3','A company requires vendors to be tested by an independent penetration tester annually. Which monitoring activity is this?',['Penetration testing of the vendor','Vendor lock-in','EOI','MOU'],'');
match('5.3','Match each vendor selection document to its purpose.',[['RFI','Gather general information'],['RFP','Request solution proposals'],['RFQ','Request pricing'],['EOI','Vendor signals interest']],'');
tf('5.3','A right-to-audit clause should be negotiated before the contract is signed.',true,'');

/* ===== 5.4 additional ===== */
mc('5.4','A user objects to their data being used for marketing analytics but still wants the service. Which privacy right are they exercising?',['Processing restriction / objection','Right to be forgotten','Data correction','Legal hold'],'');
mc('5.4','A regulator orders a company to stop processing certain personal data entirely until an investigation is complete. Which concept is this?',['Processing prevention','Opt-in','Data correction','Attestation'],'');
mc('5.4','A company’s newsletter automatically enrolls customers, who must click unsubscribe to stop emails. Which consent model is this?',['Opt-out','Opt-in','Legal hold','Right to be forgotten'],'');
mc('5.4','A cloud provider processes HR data on behalf of a retailer. If the provider uses a third party for backups, what is that third party called?',['Subprocessor','Controller','Data subject','Data owner'],'');
mc('5.4','Which consequence of non-compliance is MOST directly related to customers losing trust after public disclosure of a violation?',['Reputational damage','Loss of license','Sanctions','Contractual penalty'],'');
mc('5.4','A business partner terminates a contract because the company failed a required security audit. Which consequence is this?',['Contractual impact','Legal hold','Data correction','Opt-in'],'');
mc('5.4','Employees in finance must complete anti-bribery training annually. What compliance element is this?',['Compliance training','Attestation by an auditor','Processing restriction','Data transpose'],'');
mc('5.4','A company’s compliance team runs quarterly checks that controls are operating and reports results to the board. What is this?',['Compliance monitoring and internal reporting','E-discovery','Penetration testing','Tokenization'],'');
mc('5.4','A government issues economic sanctions against a company for exporting restricted encryption technology. Which consequence category is this?',['Sanctions','Reputational damage only','Opt-out','Data correction'],'');
mc('5.4','A court issues a subpoena requiring a company to produce specific records. What type of legal compliance item is this?',['Legal order','Opt-in consent','Attestation','Acknowledgement'],'');
mc('5.4','Under GDPR, who ultimately owns the rights over personal data?',['The data subject','The processor','The cloud provider','The IT custodian'],'');
ms('5.4','Which are privacy rights commonly granted to individuals? (Choose three.)',['Right to be forgotten','Right to data correction','Right to restrict processing','Right to access other people’s data','Right to disable company firewalls'],3,'');
cat('5.4','Classify each item.',['Compliance monitoring','Consequence of non-compliance'],[['Annual policy acknowledgement',0],['Management attestation',0],['Internal compliance report',0],['Regulatory fine',1],['Loss of operating license',1],['Contract termination by partner',1]],'');
fill('5.4','The obligation to preserve data relevant to anticipated litigation is called a legal ________.',['hold'],'');

/* ===== 5.5 additional ===== */
mc('5.5','A company asks employees to complete a survey about how they handle sensitive data as part of an audit. Which data-gathering method is this?',['Questionnaires/surveys','Sampling','Penetration testing','Benchmarking'],'');
mc('5.5','Management formally states that all servers are patched within 30 days, and auditors test this claim. What is management’s statement called?',['Assertion','Attestation of the auditor','Charter','Rules of engagement'],'');
mc('5.5','An organization compares its security metrics with similar companies in its industry. Which engagement type is this?',['Benchmarking','Gap analysis','Penetration test','Self-assessment only'],'');
mc('5.5','During analysis, the team maps an intruder’s actions to “Delivery” and “Exploitation” stages. Which model are they using?',['Cyber Kill Chain','Diamond Model','Shared responsibility model','OSI model'],'');
mc('5.5','Which test verifies that a newly installed firewall feature actually blocks the traffic it is supposed to block?',['Functional testing','Behavioral testing','Benchmarking','Sampling'],'');
mc('5.5','A test measures how employees respond to a social engineering phone call. Which testing type BEST describes this?',['Behavioral testing','Functional testing','Static code analysis','Benchmarking'],'');
mc('5.5','A board-level group oversees internal audit results and independence. What is this group?',['Audit committee','CAB','SOC','Red team'],'');
mc('5.5','Which is an INTERNATIONAL standard for information security management systems?',['ISO/IEC 27001','HIPAA','PCI DSS','CCPA'],'');
order('5.5','Order the typical penetration test phases.',['Planning and rules of engagement','Reconnaissance','Scanning and enumeration','Exploitation','Reporting'],'');
cat('5.5','Classify each engagement.',['Internal','External'],[['Self-assessment by the security team',0],['Audit committee review',0],['Internal compliance check',0],['Regulatory examination',1],['Independent third-party audit',1],['Customer-requested assessment by outside firm',1]],'');

/* ===== 5.6 additional ===== */
mc('5.6','A company launches a self-service portal where employees can watch short security videos and take quizzes anytime. Which delivery mechanism is this?',['Self-service portal','One-to-one coaching','Classroom only','Tabletop'],'');
mc('5.6','The security team notices remote workers often use public Wi-Fi without VPN. Which training topic should be emphasized?',['Remote work/hybrid security','Clean desk','Degaussing','Code signing'],'');
mc('5.6','Employees receive a phishing simulation; 18% click but only 5% report. What should the program focus on improving?',['Reporting behavior and recognition of phishing cues','Firewall rules','Disk encryption','Backup frequency'],'');
mc('5.6','Which training topic covers recognizing deepfake voice calls requesting urgent transfers?',['Emerging threats / social engineering','Data transpose','Capacity planning','Asset disposal'],'');
mc('5.6','An employee notices someone unfamiliar photographing badge readers in the lobby and reports it. Which awareness concept is demonstrated?',['Situational awareness','Key escrow','Fail forward','Data masking'],'');
mc('5.6','After a phishing test, one department has a 40% click rate while others are under 5%. What is the BEST next step?',['Deliver targeted training to that department and retest','Fire the department manager','Stop running phishing tests','Give the whole company the same onboarding course again'],'Targeted training addresses the high-risk group; retesting measures improvement.');
mc('5.6','Which report would MOST help managers see which teams have not completed required training?',['Managerial completion reports from the LMS','NetFlow report','CVE list','CRL'],'');
mc('5.6','A company wants to show training is reducing risk. Which metric is BEST?',['Reduction in security incidents caused by user error over time','Number of posters printed','Training video length','Number of quiz questions'],'');
mc('5.6','Which BYOD training message is MOST appropriate?',['Keep personal devices updated, use screen locks and keep corporate data in the managed container','Disable the device passcode','Jailbreak phones for more features','Store company files in personal cloud storage'],'');
tf('5.6','Security awareness training is only needed once, during onboarding.',false,'Ongoing, targeted and corrective training are all needed.');
})();
