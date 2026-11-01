/* CVEEEZ core: skills taxonomy, CV parsing, job enrichment, scoring, verification. Pure functions, no network. */
(function (root) {
  const GEO = (typeof module !== 'undefined' && module.exports) ? require('./geo.js') : root.CVZ_GEO;

  // ---------- Skills taxonomy. ORDER IS STABLE: index = skill id used in the job index. Append only. ----------
  // [canonical, family, aliases...]
  const SKILLS = [
    ['JavaScript', 'eng', 'javascript', 'js', 'es6', 'ecmascript'], ['TypeScript', 'eng', 'typescript'], ['Python', 'eng', 'python'], ['Java', 'eng', 'java'],
    ['C#', 'eng', 'c#', 'csharp', '.net', 'dotnet', 'asp.net'], ['C++', 'eng', 'c++', 'cpp'], ['Go', 'eng', 'golang', 'go lang'], ['Rust', 'eng', 'rust'],
    ['Ruby', 'eng', 'ruby', 'rails', 'ruby on rails'], ['PHP', 'eng', 'php', 'laravel', 'symfony'], ['Kotlin', 'eng', 'kotlin'], ['Swift', 'eng', 'swift', 'swiftui'],
    ['Scala', 'eng', 'scala'], ['React', 'eng', 'react', 'react.js', 'reactjs'], ['Angular', 'eng', 'angular'], ['Vue', 'eng', 'vue', 'vue.js', 'nuxt'],
    ['Node.js', 'eng', 'node.js', 'nodejs', 'node', 'express.js'], ['Next.js', 'eng', 'next.js', 'nextjs'], ['HTML/CSS', 'eng', 'html', 'css', 'sass', 'tailwind'],
    ['iOS', 'eng', 'ios'], ['Android', 'eng', 'android'], ['React Native', 'eng', 'react native'], ['Flutter', 'eng', 'flutter', 'dart'],
    ['SQL', 'data', 'sql', 'mysql', 'postgresql', 'postgres', 't-sql', 'sql server', 'oracle database', 'pl/sql'], ['NoSQL', 'data', 'nosql', 'mongodb', 'dynamodb', 'cassandra', 'redis'],
    ['AWS', 'eng', 'aws', 'amazon web services', 'ec2', 's3', 'lambda'], ['Azure', 'eng', 'azure', 'microsoft azure'], ['GCP', 'eng', 'gcp', 'google cloud', 'bigquery'],
    ['Docker', 'eng', 'docker', 'containers'], ['Kubernetes', 'eng', 'kubernetes', 'k8s', 'helm'], ['Terraform', 'eng', 'terraform', 'infrastructure as code', 'iac'],
    ['CI/CD', 'eng', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'continuous integration'], ['Linux', 'eng', 'linux', 'unix', 'bash', 'shell scripting'],
    ['Git', 'eng', 'git', 'github', 'gitlab', 'bitbucket'], ['REST APIs', 'eng', 'rest', 'restful', 'rest api', 'apis', 'api design', 'graphql'],
    ['Microservices', 'eng', 'microservices', 'distributed systems'], ['System Design', 'eng', 'system design', 'scalable systems', 'architecture design'],
    ['DevOps', 'eng', 'devops', 'site reliability', 'sre'], ['Observability', 'eng', 'observability', 'monitoring', 'prometheus', 'grafana', 'datadog'],
    ['Security', 'sec', 'cybersecurity', 'cyber security', 'information security', 'infosec', 'application security', 'appsec'], ['Penetration Testing', 'sec', 'penetration testing', 'pentest', 'pen testing', 'ethical hacking'],
    ['SIEM/SOC', 'sec', 'siem', 'soc', 'splunk', 'incident response', 'threat detection'], ['IAM', 'sec', 'iam', 'identity and access', 'okta', 'active directory'],
    ['Networking', 'it', 'networking', 'tcp/ip', 'cisco', 'firewalls', 'vpn', 'routing', 'switching'], ['IT Support', 'it', 'it support', 'helpdesk', 'help desk', 'service desk', 'technical support', 'desktop support'],
    ['Machine Learning', 'data', 'machine learning', 'ml', 'deep learning', 'neural networks'], ['AI/LLMs', 'data', 'llm', 'llms', 'large language models', 'generative ai', 'genai', 'nlp', 'natural language processing', 'artificial intelligence', 'الذكاء الاصطناعي'],
    ['PyTorch', 'data', 'pytorch'], ['TensorFlow', 'data', 'tensorflow', 'keras'], ['Data Analysis', 'data', 'data analysis', 'data analytics', 'analytics', 'analytical skills', 'تحليل البيانات'],
    ['Data Engineering', 'data', 'data engineering', 'etl', 'elt', 'data pipelines', 'airflow', 'dbt'], ['Spark', 'data', 'spark', 'pyspark', 'databricks', 'hadoop'],
    ['Statistics', 'data', 'statistics', 'statistical', 'a/b testing', 'experimentation', 'regression'], ['Power BI', 'data', 'power bi', 'powerbi'], ['Tableau', 'data', 'tableau', 'looker'],
    ['Excel', 'biz', 'excel', 'microsoft excel', 'advanced excel', 'spreadsheets', 'vlookup', 'pivot tables'], ['R', 'data', 'r programming', 'rstudio'],
    ['Product Management', 'prod', 'product management', 'product manager', 'product roadmap', 'roadmap', 'product strategy', 'إدارة المنتجات'], ['Agile/Scrum', 'prod', 'agile', 'scrum', 'kanban', 'sprint planning', 'jira'],
    ['Project Management', 'ops', 'project management', 'project manager', 'pmo', 'program management', 'إدارة المشاريع'], ['Stakeholder Management', 'biz', 'stakeholder management', 'stakeholders', 'cross-functional'],
    ['UX Design', 'design', 'ux', 'user experience', 'ux design', 'interaction design', 'usability'], ['UI Design', 'design', 'ui design', 'user interface', 'visual design', 'design systems'],
    ['Figma', 'design', 'figma', 'sketch', 'adobe xd'], ['User Research', 'design', 'user research', 'usability testing', 'user interviews'], ['Graphic Design', 'design', 'graphic design', 'photoshop', 'illustrator', 'indesign', 'adobe creative suite', 'التصميم الجرافيكي'],
    ['Video Editing', 'design', 'video editing', 'premiere pro', 'after effects', 'final cut', 'motion graphics'], ['Copywriting', 'mkt', 'copywriting', 'content writing', 'copy editing', 'كتابة المحتوى'],
    ['Content Marketing', 'mkt', 'content marketing', 'content strategy', 'editorial'], ['SEO', 'mkt', 'seo', 'search engine optimization', 'sem', 'google ads', 'ppc'],
    ['Digital Marketing', 'mkt', 'digital marketing', 'performance marketing', 'paid media', 'paid social', 'التسويق الرقمي'], ['Social Media', 'mkt', 'social media', 'instagram', 'tiktok', 'community management', 'وسائل التواصل'],
    ['Brand Management', 'mkt', 'brand management', 'branding', 'brand strategy'], ['Marketing Analytics', 'mkt', 'google analytics', 'marketing analytics', 'attribution', 'ga4'],
    ['CRM', 'sales', 'crm', 'salesforce', 'hubspot', 'zoho', 'dynamics 365'], ['B2B Sales', 'sales', 'b2b sales', 'enterprise sales', 'account executive', 'business development', 'تطوير الأعمال'],
    ['Account Management', 'sales', 'account management', 'key accounts', 'client relationship', 'customer success'], ['Negotiation', 'biz', 'negotiation', 'negotiating', 'التفاوض'],
    ['Lead Generation', 'sales', 'lead generation', 'prospecting', 'outbound', 'cold calling', 'pipeline generation'], ['Retail Sales', 'sales', 'retail', 'merchandising', 'store operations', 'visual merchandising'],
    ['Customer Service', 'cs', 'customer service', 'customer support', 'call center', 'contact center', 'خدمة العملاء'], ['Accounting', 'fin', 'accounting', 'bookkeeping', 'general ledger', 'accounts payable', 'accounts receivable', 'المحاسبة', 'محاسبة'],
    ['Financial Analysis', 'fin', 'financial analysis', 'financial modeling', 'financial modelling', 'fp&a', 'budgeting', 'forecasting', 'التحليل المالي'], ['IFRS/GAAP', 'fin', 'ifrs', 'gaap', 'us gaap', 'financial reporting'],
    ['Audit', 'fin', 'audit', 'internal audit', 'external audit', 'auditing', 'التدقيق'], ['Tax', 'fin', 'tax', 'vat', 'zakat', 'taxation', 'transfer pricing'],
    ['Treasury', 'fin', 'treasury', 'cash management', 'liquidity'], ['Risk Management', 'fin', 'risk management', 'credit risk', 'market risk', 'operational risk', 'إدارة المخاطر'],
    ['Compliance', 'legal', 'compliance', 'aml', 'kyc', 'anti-money laundering', 'regulatory compliance', 'الامتثال'], ['Investment', 'fin', 'investment banking', 'private equity', 'venture capital', 'portfolio management', 'asset management', 'valuation'],
    ['ERP', 'fin', 'erp', 'sap', 'oracle erp', 'netsuite', 'odoo'], ['Payments', 'fin', 'payments', 'fintech', 'card payments', 'acquiring'],
    ['Legal', 'legal', 'legal counsel', 'contracts', 'contract drafting', 'litigation', 'corporate law', 'commercial law', 'القانون'], ['Data Privacy', 'legal', 'gdpr', 'data privacy', 'data protection', 'pdpl'],
    ['Recruitment', 'hr', 'recruitment', 'recruiting', 'talent acquisition', 'sourcing', 'headhunting', 'التوظيف'], ['HR Operations', 'hr', 'hr operations', 'human resources', 'hris', 'payroll', 'employee relations', 'onboarding', 'الموارد البشرية'],
    ['Learning & Development', 'hr', 'learning and development', 'l&d', 'training', 'instructional design', 'التدريب'], ['Compensation & Benefits', 'hr', 'compensation', 'benefits', 'total rewards'],
    ['Operations Management', 'ops', 'operations management', 'operational excellence', 'business operations', 'العمليات'], ['Supply Chain', 'ops', 'supply chain', 'procurement', 'sourcing strategy', 'purchasing', 'المشتريات', 'سلاسل الإمداد'],
    ['Logistics', 'ops', 'logistics', 'warehouse', 'warehousing', 'fleet', 'last mile', 'distribution', 'الخدمات اللوجستية'], ['Inventory Management', 'ops', 'inventory', 'inventory management', 'stock control'],
    ['Lean/Six Sigma', 'ops', 'lean', 'six sigma', 'continuous improvement', 'kaizen'], ['Quality Assurance', 'ops', 'quality assurance', 'qa', 'quality control', 'qc', 'iso 9001', 'الجودة'],
    ['Software Testing', 'eng', 'test automation', 'selenium', 'cypress', 'playwright', 'manual testing', 'software testing', 'qa engineer'], ['Strategy', 'biz', 'strategy', 'strategic planning', 'corporate strategy', 'management consulting', 'consulting'],
    ['Business Analysis', 'biz', 'business analysis', 'business analyst', 'requirements gathering', 'process mapping', 'bpmn'], ['Presentation', 'biz', 'presentation skills', 'powerpoint', 'public speaking', 'storytelling'],
    ['Communication', 'soft', 'communication skills', 'written communication', 'verbal communication', 'interpersonal', 'التواصل'], ['Leadership', 'soft', 'leadership', 'people management', 'team leadership', 'team management', 'coaching', 'mentoring', 'القيادة'],
    ['Problem Solving', 'soft', 'problem solving', 'problem-solving', 'critical thinking'], ['Teamwork', 'soft', 'teamwork', 'collaboration', 'team player'],
    ['Time Management', 'soft', 'time management', 'prioritization', 'organizational skills', 'attention to detail'], ['Clinical Care', 'health', 'patient care', 'clinical', 'nursing', 'bedside', 'registered nurse', 'التمريض'],
    ['Medical Devices', 'health', 'medical devices', 'medical device', 'biomedical'], ['Pharmaceutical', 'health', 'pharmaceutical', 'pharma', 'pharmacovigilance', 'gmp', 'regulatory affairs', 'الأدوية'],
    ['Healthcare Admin', 'health', 'healthcare administration', 'medical billing', 'medical coding', 'revenue cycle', 'hospital administration'], ['Dentistry', 'health', 'dental', 'dentistry', 'dentist', 'طب الأسنان'],
    ['Teaching', 'edu', 'teaching', 'teacher', 'curriculum', 'lesson planning', 'classroom', 'تدريس', 'التعليم'], ['E-learning', 'edu', 'e-learning', 'elearning', 'lms', 'online learning'],
    ['Civil Engineering', 'engg', 'civil engineering', 'structural engineering', 'autocad', 'revit', 'construction management', 'الهندسة المدنية'], ['Mechanical Engineering', 'engg', 'mechanical engineering', 'solidworks', 'hvac', 'cad'],
    ['Electrical Engineering', 'engg', 'electrical engineering', 'power systems', 'plc', 'scada', 'embedded systems'], ['Oil & Gas', 'engg', 'oil and gas', 'oil & gas', 'petroleum', 'drilling', 'upstream', 'downstream', 'النفط والغاز'],
    ['Real Estate', 'biz', 'real estate', 'property management', 'leasing', 'facilities management', 'العقارات'], ['Hospitality', 'cs', 'hospitality', 'hotel', 'front office', 'food and beverage', 'f&b', 'الضيافة'],
    ['Event Management', 'ops', 'event management', 'events', 'event planning'], ['Public Relations', 'mkt', 'public relations', 'pr', 'communications', 'media relations', 'العلاقات العامة'],
    ['Translation', 'lang', 'translation', 'interpreting', 'localization', 'localisation', 'الترجمة'], ['Administration', 'ops', 'administrative', 'office management', 'executive assistant', 'data entry', 'scheduling', 'السكرتارية'],
    ['Customer Experience', 'cs', 'customer experience', 'cx', 'nps', 'voice of customer'], ['E-commerce', 'biz', 'e-commerce', 'ecommerce', 'marketplace', 'shopify', 'التجارة الإلكترونية'],
    ['Growth', 'mkt', 'growth marketing', 'growth hacking', 'user acquisition', 'retention', 'lifecycle marketing', 'crm marketing'], ['Pricing', 'biz', 'pricing', 'revenue management', 'monetization'],
    ['Blockchain', 'eng', 'blockchain', 'web3', 'crypto', 'smart contracts', 'solidity'], ['Embedded', 'eng', 'firmware', 'embedded software', 'rtos', 'microcontrollers'],
    ['Game Development', 'eng', 'unity', 'unreal engine', 'game development', 'game design'], ['Computer Vision', 'data', 'computer vision', 'opencv', 'image recognition'],
    ['MLOps', 'data', 'mlops', 'model deployment', 'feature store', 'sagemaker'], ['Data Governance', 'data', 'data governance', 'data quality', 'master data', 'data management'],
    ['Salesforce Admin', 'sales', 'salesforce administrator', 'salesforce admin', 'apex', 'salesforce cpq'], ['Technical Writing', 'mkt', 'technical writing', 'documentation', 'api documentation'],
    ['Cloud Architecture', 'eng', 'cloud architecture', 'solutions architect', 'cloud infrastructure', 'cloud computing'], ['Mobile Development', 'eng', 'mobile development', 'mobile apps', 'mobile engineer'],
    ['Frontend', 'eng', 'frontend', 'front-end', 'front end'], ['Backend', 'eng', 'backend', 'back-end', 'back end', 'server-side'], ['Full Stack', 'eng', 'full stack', 'full-stack', 'fullstack'],
    ['Partnerships', 'sales', 'partnerships', 'partner management', 'alliances', 'channel sales'], ['Marketing Strategy', 'mkt', 'marketing strategy', 'go-to-market', 'gtm', 'product marketing'],
    ['Fraud Prevention', 'fin', 'fraud', 'fraud prevention', 'fraud detection', 'chargebacks'], ['Credit', 'fin', 'credit analysis', 'underwriting', 'lending', 'collections'],
    ['Insurance', 'fin', 'insurance', 'actuarial', 'claims', 'التأمين'], ['Banking', 'fin', 'banking', 'retail banking', 'corporate banking', 'islamic banking', 'المصرفية'],
    ['Trust & Safety', 'ops', 'trust and safety', 'trust & safety', 'content moderation'], ['Workplace/Facilities', 'ops', 'workplace', 'facilities', 'office operations'],
    ['Research', 'data', 'research', 'phd research', 'scientific research', 'publications'], ['Arabic', 'lang', 'arabic language', 'arabic speaker', 'fluent in arabic', 'arabic speaking', 'العربية'],
    ['Chinese', 'lang', 'mandarin', 'chinese'], ['French', 'lang', 'french'], ['German', 'lang', 'german', 'deutsch'], ['Spanish', 'lang', 'spanish'],
    ['Driving', 'ops', 'driving license', "driver's license", 'valid driving', 'رخصة قيادة'], ['Food Production', 'ops', 'kitchen', 'chef', 'culinary', 'food safety', 'haccp'],
    ['Interior Design', 'design', 'interior design', '3ds max', 'sketchup'], ['Architecture', 'engg', 'architectural design', 'architect licensure', 'urban planning'],
    ['HSE', 'engg', 'hse', 'health and safety', 'ehs', 'nebosh', 'osha', 'السلامة'], ['Sustainability', 'biz', 'sustainability', 'esg', 'climate', 'carbon'],
    ['Government Relations', 'legal', 'government relations', 'public policy', 'policy', 'regulatory affairs', 'public affairs'], ['Localization', 'lang', 'arabization', 'rtl'],
    ['Ads Platforms', 'mkt', 'meta ads', 'facebook ads', 'google ads', 'tiktok ads', 'snapchat ads', 'programmatic'], ['Influencer Marketing', 'mkt', 'influencer', 'influencer marketing', 'creator partnerships'],
    ['Operations Analytics', 'ops', 'operations analytics', 'capacity planning', 'workforce management', 'wfm'], ['Field Sales', 'sales', 'field sales', 'route sales', 'territory management', 'medical representative', 'medical rep', 'المندوب'],
  ];

  const LANGS = [
    ['Arabic', /\barabic\b|العربية|عربي/i], ['English', /\benglish\b|الإنجليزية|الانجليزية|انجليزي/i], ['French', /\bfrench\b|الفرنسية/i], ['German', /\bgerman\b|الألمانية/i],
    ['Spanish', /\bspanish\b|الإسبانية/i], ['Turkish', /\bturkish\b|التركية/i], ['Urdu', /\burdu\b/i], ['Hindi', /\bhindi\b/i], ['Mandarin', /\bmandarin\b|\bchinese\b/i],
    ['Russian', /\brussian\b/i], ['Italian', /\bitalian\b/i], ['Portuguese', /\bportuguese\b/i], ['Japanese', /\bjapanese\b/i], ['Korean', /\bkorean\b/i], ['Dutch', /\bdutch\b/i], ['Persian', /\bpersian\b|\bfarsi\b/i]
  ];

  const INDUSTRIES = [
    ['Fintech & Banking', /fintech|bank|payments?|lending|wallet|insurtech|insurance|financial services|مصرف|بنك/i],
    ['Software & SaaS', /\bsaas\b|software|cloud|developer tools|platform engineering|برمجيات/i],
    ['E-commerce & Retail', /e-?commerce|retail|marketplace|consumer goods|fmcg|grocery|تجزئة/i],
    ['Healthcare & Pharma', /health|hospital|clinic|pharma|medical|dental|biotech|صح|طب|مستشفى/i],
    ['Logistics & Mobility', /logistics|delivery|ride-?hailing|mobility|transport|shipping|fleet|supply chain|لوجست/i],
    ['Telecom', /telecom|telco|mobile operator|اتصالات/i], ['Energy & Oil/Gas', /oil|gas|energy|petrochemical|renewable|نفط|طاقة/i],
    ['Education', /education|edtech|school|university|academy|learning|تعليم|جامعة|مدرسة/i], ['Government & Public', /government|public sector|ministry|municipality|حكوم|وزارة/i],
    ['Real Estate & Construction', /real estate|construction|property|contracting|عقار|مقاولات|إنشاء/i], ['Hospitality & Travel', /hospitality|hotel|travel|tourism|airline|aviation|فندق|سياحة|طيران/i],
    ['Consulting', /consulting|advisory|big four|استشار/i], ['Media & Entertainment', /media|entertainment|gaming|music|streaming|publishing|إعلام/i],
    ['Manufacturing', /manufactur|factory|industrial|production line|تصنيع|مصنع/i], ['AI & Data', /\bai\b|machine learning|artificial intelligence|data platform/i], ['Cybersecurity', /cybersecurity|security company|identity platform/i]
  ];

  const CERTS = ['PMP', 'PMI-ACP', 'PRINCE2', 'CAPM', 'CPA', 'CMA', 'CFA', 'ACCA', 'CIA', 'CISA', 'CISM', 'CISSP', 'CEH', 'OSCP', 'CompTIA Security+', 'CompTIA A+', 'CompTIA Network+', 'CCNA', 'CCNP',
    'AWS Certified', 'Azure Fundamentals', 'Azure Administrator', 'Google Cloud Certified', 'CKA', 'ITIL', 'Six Sigma', 'Lean Six Sigma', 'Scrum Master', 'CSM', 'PSM', 'SAFe', 'SHRM-CP', 'SHRM-SCP', 'CIPD', 'PHR',
    'NEBOSH', 'IOSH', 'OSHA', 'CFE', 'FRM', 'CIPS', 'APICS', 'CSCP', 'TOEFL', 'IELTS', 'TESOL', 'CELTA', 'TEFL', 'NCLEX', 'BLS', 'ACLS', 'SCFHS', 'DHA', 'DOH', 'MOH', 'Prometric', 'Salesforce Certified', 'Google Analytics', 'HubSpot Certified', 'ISTQB', 'CBAP', 'SOCPA', 'IFRS Certificate'];
  const LICENSED_ROLES = /registered nurse|\bnurse\b|physician|pharmacist|dentist|doctor|lawyer|attorney|advocate|chartered accountant|\bcpa\b required|licensed|licence required|license required|professional engineer|\bp\.?e\.?\b license|board certified/i;

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  const SKILL_RE = SKILLS.map(([name, fam, ...aliases]) => {
    const parts = aliases.map(a => escRe(a.toLowerCase()));
    // single-letter / ambiguous tokens get stricter boundaries
    return new RegExp('(?:^|[^a-z0-9+#\\u0600-\\u06ff])(?:' + parts.join('|') + ')(?=$|[^a-z0-9+#\\u0600-\\u06ff])', 'i');
  });
  const AMBIG = { 'Go': /\bgolang\b|\bgo lang\b|\bin go\b|\bgo,|\bgo\)|, go\b|\(go\b/i, 'R': /\br programming\b|\brstudio\b|\bR,|, R\b|\(R\)/, 'Java': /\bjava\b(?!script)/i, 'Lean/Six Sigma': /\blean six sigma\b|\bsix sigma\b|\bkaizen\b|\bcontinuous improvement\b|\blean manufacturing\b/i, 'Node.js': /node\.?js|\bexpress\.js\b/i, 'PR': null };

  function detectSkills(text) {
    if (!text) return [];
    const t = ' ' + String(text).toLowerCase() + ' ';
    const raw = String(text);
    const found = [];
    SKILLS.forEach(([name], i) => {
      if (AMBIG[name]) { if (AMBIG[name].test(raw)) found.push(i); return; }
      if (SKILL_RE[i].test(t)) found.push(i);
    });
    return found;
  }
  function skillName(i) { return SKILLS[i] ? SKILLS[i][0] : String(i); }
  function skillFamily(i) { return SKILLS[i] ? SKILLS[i][1] : ''; }
  function skillIdByName(n) { const x = String(n).trim().toLowerCase(); const i = SKILLS.findIndex(s => s[0].toLowerCase() === x || s.slice(2).includes(x)); return i; }

  // ---------- Seniority ----------
  const SEN = ['Intern', 'Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];
  function seniorityFromTitle(title) {
    const t = String(title || '').toLowerCase();
    if (/\bintern(ship)?\b|trainee|graduate program|متدرب/.test(t)) return 0;
    if (/\b(chief|cxo|ceo|cfo|cto|coo|cmo|vp|vice president|svp|evp|general manager|managing director|partner)\b|رئيس تنفيذي/.test(t)) return 7;
    if (/\b(director|head of|head,)\b|مدير عام|رئيس قسم/.test(t)) return 6;
    if (/\bmanager\b|مدير/.test(t) && !/account manager|product manager|project manager|program manager|community manager|office manager|success manager/.test(t)) return 5;
    if (/\b(lead|principal|staff|architect)\b|قائد/.test(t)) return 4;
    if (/\b(senior|sr\.?|iii|expert)\b|أول|خبير/.test(t)) return 3;
    if (/\b(junior|jr\.?|entry|associate|assistant|graduate|i)\b|مبتدئ|مساعد/.test(t)) return 1;
    if (/product manager|project manager|program manager|account manager/.test(t)) return 3;
    return 2;
  }
  function seniorityFromYears(y) { if (y == null) return null; if (y < 1) return 1; if (y < 3) return 1; if (y < 6) return 2; if (y < 9) return 3; if (y < 13) return 4; return 5; }

  // ---------- Requirements from job text ----------
  function yearsRequired(text) {
    const t = String(text || '').replace(/\s+/g, ' ');
    const re = /(\d{1,2})\s*(?:\+|plus)?\s*(?:-|–|to)?\s*(\d{1,2})?\s*\+?\s*(?:years?|yrs?)(?:'|’)?\s*(?:of\s+)?(?:[a-z/&,-]+\s+){0,5}?(?:experience|exp\b|in\b|working|of)/ig;
    let m, best = null;
    while ((m = re.exec(t))) { const n = parseInt(m[1], 10); if (n > 0 && n <= 25) best = best == null ? n : Math.min(Math.max(best, n), 25); }
    const ar = t.match(/(?:خبرة|خبره)\s*(?:لا تقل عن\s*)?(\d{1,2})\s*(?:سنوات|سنة|عام)/);
    if (ar) best = parseInt(ar[1], 10);
    return best;
  }
  const EDU = ['None', 'High school', 'Diploma', "Bachelor's", "Master's", 'Doctorate'];
  function educationLevel(text) {
    const t = String(text || '');
    if (/\bph\.?d\b|doctorate|dphil|دكتوراه/i.test(t)) return 5;
    if (/\bmaster'?s?\b|\bm\.?sc\b|\bmba\b|\bm\.?a\.?\b(?= in)|\bmeng\b|ماجستير/i.test(t)) return 4;
    if (/\bbachelor'?s?\b|\bb\.?sc\b|\bb\.?s\.?\b(?= in)|\bb\.?a\.?\b(?= in)|\bbeng\b|undergraduate degree|university degree|\bdegree in\b|بكالوريوس|ليسانس/i.test(t)) return 3;
    if (/\bdiploma\b|associate degree|دبلوم/i.test(t)) return 2;
    if (/high school|secondary school|ثانوية/i.test(t)) return 1;
    return null;
  }
  function splitRequiredPreferred(text) {
    const t = String(text || '');
    const m = t.search(/nice[- ]to[- ]have|preferred qualifications|bonus points|\bbonus\b|is a plus|are a plus|would be a plus|preferred skills|desirable|يفضل|ميزة إضافية/i);
    if (m < 0) return [t, ''];
    return [t.slice(0, m), t.slice(m)];
  }
  function jobFlags(text) {
    const t = String(text || '');
    const f = [];
    if (/visa sponsorship (is )?(available|provided|offered)|we (will )?sponsor (work )?visas?|sponsorship available|visa support|we offer visa|visa provided/i.test(t)) f.push('v');
    if (/relocation (support|assistance|package|bonus|allowance)|we (will )?help you relocate|relocation provided/i.test(t)) f.push('r');
    if (/(fluent|fluency|native|proficien\w*|excellent|strong)\s+(\w+\s+){0,3}arabic|arabic (is )?(required|mandatory|a must)|arabic speaker|bilingual (english and arabic|arabic and english)|إجادة اللغة العربية/i.test(t)) f.push('a');
    if (/must (be|have) (legally )?(authori[sz]ed|eligible|the right) to work|no (visa )?sponsorship|unable to sponsor|not able to sponsor|cannot sponsor|security clearance|u\.?s\.? citizens? only|citizenship (is )?required|saudi nationals? only|saudization|only for (saudi|emirati|uae) nationals|للمواطنين/i.test(t)) f.push('w');
    if (LICENSED_ROLES.test(t)) f.push('l');
    return f;
  }
  function workplaceOf(locText, flags, extra) {
    const t = (String(locText || '') + ' ' + String(extra || '')).toLowerCase();
    if (/hybrid|هجين/.test(t)) return 'H';
    if (/remote|anywhere|work from home|wfh|distributed|عن بعد/.test(t)) return 'R';
    if (/on-?site|in[- ]office|onsite|حضوري/.test(t)) return 'O';
    return '';
  }
  function empTypeOf(s) {
    const t = String(s || '').toLowerCase();
    if (/intern/.test(t)) return 'IN'; if (/part[- ]?time/.test(t)) return 'PT'; if (/freelance/.test(t)) return 'FL';
    if (/contract|contractor|fixed[- ]term/.test(t)) return 'CT'; if (/temp/.test(t)) return 'TM'; if (/full[- ]?time|permanent|regular/.test(t)) return 'FT';
    return '';
  }

  /** Normalize a raw source record into an enriched job (the shape used everywhere). */
  function enrichJob(raw) {
    const desc = String(raw.description || '');
    const [reqText, prefText] = splitRequiredPreferred(desc);
    const reqSkills = new Set(detectSkills(raw.title + ' ' + reqText + ' ' + (raw.dept || '')));
    const prefSkills = detectSkills(prefText).filter(i => !reqSkills.has(i));
    const loc = GEO.detectLocation(raw.location || '');
    let countries = loc.countries.slice();
    const wp = raw.workplace || workplaceOf(raw.location, null, raw.workplaceHint);
    const flags = jobFlags(desc);
    return {
      src: raw.src, company: raw.company, title: String(raw.title || '').trim(), location: String(raw.location || '').trim(), countries,
      regions: loc.regions, city: loc.city, workplace: wp, empType: raw.empType || empTypeOf(raw.empHint || desc.slice(0, 400)),
      posted: raw.posted || '', url: raw.url, dept: raw.dept || '', seniority: seniorityFromTitle(raw.title), years: yearsRequired(reqText),
      edu: educationLevel(reqText), req: Array.from(reqSkills), pref: prefSkills, flags, salary: raw.salary || null,
      excerpt: raw.excerpt || makeExcerpt(desc), industry: raw.industry || '', verified: raw.verified || null
    };
  }
  function stripHtml(h) {
    return String(h || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/<(br|\/p|\/li|\/h\d|\/div)[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  }
  function makeExcerpt(desc) {
    const t = stripHtml(desc).replace(/\s+/g, ' ').trim();
    // skip boilerplate company intros where possible: prefer sentence containing "you will"/"role"
    const sentences = t.split(/(?<=[.!?])\s+/);
    let pick = sentences.find(s => /you('ll| will)|this role|the role|we are looking|we're looking|responsib|as a |as an /i.test(s) && s.length > 40) || sentences[0] || '';
    pick = pick.replace(/[|]/g, '/');
    return pick.length > 170 ? pick.slice(0, 167).replace(/\s+\S*$/, '') + '…' : pick;
  }

  // ---------- CV parsing ----------
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11, january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    'يناير': 0, 'فبراير': 1, 'مارس': 2, 'أبريل': 3, 'ابريل': 3, 'مايو': 4, 'يونيو': 5, 'يوليو': 6, 'أغسطس': 7, 'اغسطس': 7, 'سبتمبر': 8, 'أكتوبر': 9, 'اكتوبر': 9, 'نوفمبر': 10, 'ديسمبر': 11 };
  const PRESENT = /present|current|now|today|ongoing|till date|to date|حتى الآن|حتى الان|الحالي|حاليا|حالياً/i;
  function parseDateToken(tok, now) {
    tok = tok.trim().toLowerCase();
    if (PRESENT.test(tok)) return now.getFullYear() * 12 + now.getMonth();
    let m = tok.match(/^(\d{1,2})[\/.-](\d{4})$/); if (m) return parseInt(m[2]) * 12 + Math.max(0, Math.min(11, parseInt(m[1]) - 1));
    m = tok.match(/^([a-z؀-ۿ]+)\.?,?\s*(\d{4})$/); if (m && MONTHS[m[1]] != null) return parseInt(m[2]) * 12 + MONTHS[m[1]];
    m = tok.match(/^(\d{4})$/); if (m) return parseInt(m[1]) * 12;
    return null;
  }
  function experienceRanges(text, now) {
    now = now || new Date();
    const mon = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');
    const tok = '(?:(?:(?:' + mon + ')\\.?,?[ \\t]*\\d{4})|(?:\\d{1,2}[\\/.-]\\d{4})|(?:\\d{4})|present|current|now|till date|to date|حتى الآن|حاليا|حالياً|الحالي)';
    const re = new RegExp('(' + tok + ')\\s*(?:-|–|—|to|until|till|إلى|الى|حتى)\\s*(' + tok + ')', 'gi');
    const ranges = []; let m;
    while ((m = re.exec(text))) {
      const a = parseDateToken(m[1], now), b = parseDateToken(m[2], now);
      if (a != null && b != null && b >= a && (b - a) < 12 * 45 && a > 1960 * 12 && b <= now.getFullYear() * 12 + 12) ranges.push([a, b, m.index]);
    }
    return ranges;
  }
  function mergeMonths(ranges) {
    const r = ranges.map(x => [x[0], x[1]]).sort((a, b) => a[0] - b[0]); let total = 0, cur = null;
    for (const [a, b] of r) { if (!cur) cur = [a, b]; else if (a <= cur[1]) cur[1] = Math.max(cur[1], b); else { total += cur[1] - cur[0]; cur = [a, b]; } }
    if (cur) total += cur[1] - cur[0];
    return total;
  }
  const HEAD = {
    summary: /^(professional\s+)?(summary|profile|about me|objective|career objective|personal statement|نبذة|الملخص|ملخص|الهدف الوظيفي)\b/i,
    experience: /^(work\s+|professional\s+|employment\s+|career\s+)?(experience|history|employment)|^experiences?$|^الخبرات|^الخبرة|^الخبرات العملية|^الخبرة العملية/i,
    education: /^(education|academic|qualifications|education and training|المؤهلات|التعليم|المؤهل العلمي)/i,
    skills: /^(skills|technical skills|core competencies|competencies|key skills|expertise|tools|المهارات|مهارات)/i,
    certs: /^(certifications?|certificates?|licenses?|licences?|courses|training|الشهادات|الدورات|الدورات التدريبية)/i,
    languages: /^(languages?|اللغات)\b/i,
    projects: /^(projects|المشاريع)/i, achievements: /^(achievements|awards|accomplishments|الإنجازات)/i
  };
  const TITLE_WORDS = /\b(engineer|developer|manager|specialist|analyst|consultant|designer|director|officer|coordinator|executive|assistant|associate|lead|head|accountant|auditor|architect|administrator|scientist|representative|supervisor|intern|nurse|doctor|pharmacist|teacher|lecturer|technician|advisor|planner|buyer|recruiter|marketer|writer|editor|agent|cashier|chef|controller|strategist|owner|founder|co-founder|ceo|cto|cfo|coo|vp|president|partner|trainer|programmer|tester)\b|مهندس|مطور|مدير|أخصائي|اخصائي|محلل|مستشار|مصمم|مسؤول|منسق|مساعد|محاسب|مدقق|فني|معلم|مشرف|ممرض|طبيب|صيدلي|مندوب|مؤسس/i;

  function splitSections(lines) {
    const sec = { _top: [] }; let cur = '_top';
    for (const raw of lines) {
      const l = raw.trim(); if (!l) continue;
      const clean = l.replace(/[:：•\-–|]+$/, '').trim();
      let hit = null;
      if (clean.length <= 40) for (const [k, re] of Object.entries(HEAD)) if (re.test(clean)) { hit = k; break; }
      if (hit) { cur = hit; sec[cur] = sec[cur] || []; const rest = l.replace(HEAD[hit], '').replace(/^[:\s]+/, ''); if (rest.length > 3 && clean.length > 25) sec[cur].push(rest); continue; }
      (sec[cur] = sec[cur] || []).push(l);
    }
    return sec;
  }

  /** Parse plain CV text into an editable profile. Never invents: unknown fields stay empty. */
  function parseCV(text, now) {
    now = now || new Date();
    const clean = String(text || '').replace(/\r/g, '').replace(/ /g, ' ');
    const lines = clean.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const sec = splitSections(lines);
    const p = { name: '', currentTitle: '', previousTitles: [], summary: '', years: null, yearsSource: '', industries: [], education: [], eduLevel: null, certifications: [], skills: [], languages: [], management: '', achievements: [], geo: [], missing: [] };

    // Name: first short line with only letters, not a heading and no contact data
    const first = (sec._top || []).slice(0, 4).find(l => l.length <= 40 && !/[@\d]|http|www\.|curriculum|resume|cv\b|السيرة/i.test(l) && l.split(' ').length >= 2 && l.split(' ').length <= 5 && !TITLE_WORDS.test(l));
    if (first) p.name = first.replace(/[|,].*$/, '').trim();

    // Titles: lines near date ranges in the experience section (or anywhere) that contain role words
    const expLines = sec.experience || lines;
    const titles = [];
    for (let i = 0; i < expLines.length; i++) {
      const l = expLines[i];
      if (l.length > 90 || !TITLE_WORDS.test(l)) continue;
      if (/^(responsible|managed|led|developed|worked|built|created|helped|supported|•|-|\*)/i.test(l)) continue;
      let t = l.split(/\s+(?:at|@|-|–|—|\||,)\s+/)[0].replace(/\(?\b(19|20)\d{2}\b.*$/, '').replace(/[•*]/g, '').trim();
      if (t.length >= 3 && t.length <= 70 && !titles.some(x => x.toLowerCase() === t.toLowerCase())) titles.push(t);
      if (titles.length >= 6) break;
    }
    if (!titles.length) { const top = (sec._top || []).find(l => TITLE_WORDS.test(l) && l.length < 70); if (top) titles.push(top.replace(/[|].*$/, '').trim()); }
    p.currentTitle = titles[0] || '';
    p.previousTitles = titles.slice(1, 5);

    p.summary = (sec.summary || []).join(' ').slice(0, 600);

    const ranges = experienceRanges((sec.experience || lines).join('\n'), now);
    if (ranges.length) { p.years = Math.round(mergeMonths(ranges) / 12 * 10) / 10; p.yearsSource = 'dates'; }
    else { const m = clean.match(/(\d{1,2})\+?\s*(?:years?|yrs)\s+(?:of\s+)?(?:professional\s+|work\s+|industry\s+)?experience/i) || clean.match(/(\d{1,2})\s*(?:سنوات|سنة)\s*(?:من\s*)?(?:الخبرة|خبرة)/); if (m) { p.years = parseInt(m[1], 10); p.yearsSource = 'stated'; } }

    const eduLines = sec.education || lines.filter(l => educationLevel(l) != null);
    p.education = eduLines.filter(l => educationLevel(l) != null || /university|college|institute|school|جامعة|كلية|معهد/i.test(l)).slice(0, 4).map(l => l.slice(0, 120));
    p.eduLevel = educationLevel(eduLines.join(' '));

    const certFound = new Set();
    for (const c of CERTS) if (new RegExp('(^|[^A-Za-z])' + escRe(c) + '(?=$|[^A-Za-z])', 'i').test(clean)) certFound.add(c);
    for (const l of (sec.certs || [])) if (l.length < 90 && !/^(responsible|managed)/i.test(l)) certFound.add(l.replace(/^[•*\-\s]+/, ''));
    p.certifications = Array.from(certFound).slice(0, 12);

    p.skills = detectSkills(clean).filter(i => SKILLS[i][1] !== 'lang' || i === skillIdByName('Translation')).map(skillName);
    p.languages = LANGS.filter(([, re]) => re.test((sec.languages || []).join(' ') || clean)).map(([n]) => n);
    if ((sec.languages || []).length === 0 && /[؀-ۿ]{4,}/.test(clean) && !p.languages.includes('Arabic')) p.languages.unshift('Arabic');

    const ind = new Set(); const indText = (sec.experience || lines).join(' ') + ' ' + p.summary;
    for (const [name, re] of INDUSTRIES) if (re.test(indText)) ind.add(name);
    p.industries = Array.from(ind).slice(0, 5);

    const mg = clean.match(/(?:managed|led|supervised|leading|managing)\s+(?:a\s+)?(?:team|staff|group)\s+of\s+(\d{1,4})/i) || clean.match(/(?:قيادة|إدارة)\s+فريق\s+(?:من\s+)?(\d{1,4})/);
    if (mg) p.management = 'Led a team of ' + mg[1];
    else if (/\b(people manager|line manager|team lead|head of|managed a team|led a team|direct reports)\b|إدارة فريق|قيادة فريق/i.test(clean)) p.management = 'Team leadership experience';

    p.achievements = lines.filter(l => l.length > 25 && l.length < 220 && /\d+\s*%|\$\s?\d|\b\d+(k|m)\b|increased|reduced|grew|improved|saved|achieved|launched|won|ranked|زيادة|خفض|تحقيق/i.test(l) && /increased|reduced|grew|improved|saved|achieved|launched|delivered|won|generated|cut|boosted|زيادة|خفض|تحقيق|حقق/i.test(l)).slice(0, 5).map(l => l.replace(/^[•*\-\s]+/, ''));

    const geo = GEO.detectLocation((sec.experience || []).join(' ') + ' ' + (sec._top || []).join(' '));
    p.geo = geo.countries.slice(0, 8);

    for (const k of ['currentTitle', 'years', 'skills', 'eduLevel']) { const v = p[k]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) p.missing.push(k); }
    return p;
  }

  // ---------- Title similarity ----------
  const TITLE_SYN = [
    ['developer', 'engineer', 'programmer', 'swe', 'sde', 'مطور', 'مبرمج'], ['frontend', 'front-end', 'front end', 'ui engineer', 'web developer'], ['backend', 'back-end', 'back end', 'server'],
    ['fullstack', 'full-stack', 'full stack'], ['data scientist', 'machine learning engineer', 'ml engineer', 'ai engineer', 'research scientist'], ['data analyst', 'business intelligence', 'bi analyst', 'analytics', 'insights analyst', 'محلل بيانات'],
    ['product manager', 'product owner', 'pm', 'مدير منتج'], ['project manager', 'program manager', 'delivery manager', 'pmo', 'مدير مشروع', 'مدير مشاريع'], ['designer', 'ux', 'ui', 'product designer', 'مصمم'],
    ['accountant', 'accounting', 'bookkeeper', 'محاسب'], ['financial analyst', 'fp&a', 'finance analyst', 'finance manager', 'محلل مالي'], ['sales', 'account executive', 'business development', 'bdr', 'sdr', 'مبيعات'],
    ['marketing', 'growth', 'brand', 'digital marketing', 'تسويق'], ['recruiter', 'talent acquisition', 'sourcer', 'hr', 'people partner', 'توظيف', 'موارد بشرية'],
    ['customer support', 'customer service', 'customer success', 'support specialist', 'خدمة العملاء'], ['devops', 'sre', 'site reliability', 'platform engineer', 'infrastructure engineer', 'cloud engineer'],
    ['security engineer', 'security analyst', 'cybersecurity', 'soc analyst', 'أمن'], ['operations', 'ops', 'operations manager', 'عمليات'], ['nurse', 'nursing', 'ممرض'], ['teacher', 'tutor', 'instructor', 'lecturer', 'معلم', 'مدرس'],
    ['qa', 'quality assurance', 'test engineer', 'sdet', 'tester'], ['legal counsel', 'lawyer', 'attorney', 'legal', 'محامي', 'مستشار قانوني'], ['supply chain', 'procurement', 'buyer', 'logistics', 'مشتريات']
  ];
  const STOP = new Set(['senior', 'sr', 'junior', 'jr', 'lead', 'principal', 'staff', 'the', 'and', 'of', 'for', 'a', 'an', 'i', 'ii', 'iii', 'iv', 'to', 'at', 'in', 'remote', 'hybrid', '-', '&', 'level', 'mid']);
  function titleTokens(t) {
    let s = ' ' + String(t || '').toLowerCase().replace(/[()\[\],/|:]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    const groups = [];
    TITLE_SYN.forEach((g, gi) => { if (g.some(w => s.includes(' ' + w + ' ') || (w.length > 4 && s.includes(w)))) groups.push('#' + gi); });
    const words = s.trim().split(' ').filter(w => w && !STOP.has(w) && w.length > 1);
    return new Set(words.concat(groups));
  }
  function titleSimilarity(a, b) {
    const A = titleTokens(a), B = titleTokens(b); if (!A.size || !B.size) return 0;
    let inter = 0; A.forEach(x => { if (B.has(x)) inter++; });
    const groupHit = [...A].some(x => x[0] === '#' && B.has(x));
    const j = inter / Math.min(A.size, B.size);
    return Math.min(1, Math.max(j, groupHit ? 0.6 : 0));
  }

  // ---------- Scoring ----------
  const DEFAULT_WEIGHTS = { skills: 30, experience: 25, title: 20, industry: 10, education: 10, other: 5 };
  const FAMILY_INDUSTRY = { eng: 'Software & SaaS', data: 'AI & Data', fin: 'Fintech & Banking', health: 'Healthcare & Pharma', edu: 'Education', sec: 'Cybersecurity' };

  /** Score one job against a reviewed profile + preferences. Deterministic, explainable. */
  function scoreJob(job, profile, prefs, weights) {
    weights = weights || DEFAULT_WEIGHTS; prefs = prefs || {};
    const cvSkillIds = new Set((profile.skills || []).map(skillIdByName).filter(i => i >= 0));
    const reasons = []; const missing = []; const hard = []; const parts = {};
    // Skills
    const req = job.req || [], pref = job.pref || [];
    const matchedReq = req.filter(i => cvSkillIds.has(i)), matchedPref = pref.filter(i => cvSkillIds.has(i));
    const missReq = req.filter(i => !cvSkillIds.has(i) && SKILLS[i] && SKILLS[i][1] !== 'soft');
    if (req.length + pref.length > 0) {
      const denom = Math.min(Math.max(req.length, 1), 10) + Math.min(pref.length, 4) * 0.5;
      const num = Math.min(matchedReq.length, 10) + Math.min(matchedPref.length, 4) * 0.5;
      parts.skills = Math.min(1, num / denom * 1.15);
      if (matchedReq.length) reasons.push({ k: 'skills', v: matchedReq.slice(0, 6).map(skillName) });
      missReq.slice(0, 5).forEach(i => missing.push({ k: 'skill', v: skillName(i) }));
    }
    // Experience
    const cvYears = profile.years != null && profile.years !== '' ? Number(profile.years) : null;
    const cvSen = profile.seniority != null && profile.seniority !== '' ? Number(profile.seniority) : (cvYears != null ? seniorityFromYears(cvYears) : (profile.currentTitle ? seniorityFromTitle(profile.currentTitle) : null));
    if (job.years != null && cvYears != null) {
      const gap = job.years - cvYears;
      parts.experience = gap <= 0 ? (cvYears - job.years > 10 ? 0.75 : 1) : Math.max(0, 1 - gap / Math.max(job.years, 2) * 1.3);
      if (gap > 0) missing.push({ k: 'years', v: job.years, have: cvYears }); else reasons.push({ k: 'years', v: job.years, have: cvYears });
      if (gap >= 5) hard.push({ k: 'years', v: job.years });
    } else if (cvSen != null && job.seniority != null) {
      const d = job.seniority - cvSen;
      parts.experience = d <= 0 ? (d < -2 ? 0.7 : 1) : d === 1 ? 0.65 : d === 2 ? 0.3 : 0.1;
      if (d <= 0 && d >= -2) reasons.push({ k: 'seniority', v: SEN[job.seniority] }); else if (d > 0) missing.push({ k: 'seniority', v: SEN[job.seniority] });
    }
    // Title
    const titles = [profile.desiredTitle, profile.currentTitle].concat(profile.altTitles || [], profile.previousTitles || []).filter(Boolean);
    if (titles.length) {
      let best = 0, bestT = ''; for (const t of titles) { const s = titleSimilarity(t, job.title); if (s > best) { best = s; bestT = t; } }
      parts.title = best; if (best >= 0.5) reasons.push({ k: 'title', v: bestT });
    }
    // Industry
    const cvInd = new Set(profile.industries || []);
    const jobInd = job.industry ? [job.industry] : Array.from(new Set((job.req || []).map(i => FAMILY_INDUSTRY[skillFamily(i)]).filter(Boolean))).slice(0, 2);
    if (cvInd.size && jobInd.length) { const hit = jobInd.find(x => cvInd.has(x)); parts.industry = hit ? 1 : 0.35; if (hit) reasons.push({ k: 'industry', v: hit }); }
    // Education & certifications
    if (job.edu != null) {
      const lvl = profile.eduLevel != null && profile.eduLevel !== '' ? Number(profile.eduLevel) : null;
      if (lvl != null) { parts.education = lvl >= job.edu ? 1 : lvl === job.edu - 1 ? 0.55 : 0.2; if (lvl >= job.edu) reasons.push({ k: 'edu', v: EDU[job.edu] }); else missing.push({ k: 'edu', v: EDU[job.edu] }); }
      else missing.push({ k: 'eduUnknown', v: EDU[job.edu] });
    }
    // Other preferences (location, workplace, employment type, salary)
    let o = [], ob = 0;
    const wanted = prefs.countries || [];
    if (wanted.length) { o.push(locationEligible(job, prefs) ? 1 : 0); }
    if (prefs.workplace && prefs.workplace.length) o.push(!job.workplace || prefs.workplace.includes(job.workplace) ? 1 : 0.3);
    if (prefs.empTypes && prefs.empTypes.length) o.push(!job.empType || prefs.empTypes.includes(job.empType) ? 1 : 0.3);
    if (prefs.wantSkills && prefs.wantSkills.length) {
      const ids = prefs.wantSkills.map(skillIdByName).filter(i => i >= 0); const all = new Set([...(job.req || []), ...(job.pref || [])]);
      if (ids.length) { const hit = ids.filter(i => all.has(i)); o.push(hit.length / ids.length); if (hit.length) reasons.push({ k: 'want', v: hit.map(skillName) }); }
    }
    if (o.length) parts.other = o.reduce((a, b) => a + b, 0) / o.length;
    // Hard requirements (shown separately; never folded silently into score)
    if ((job.flags || []).includes('a') && !(profile.languages || []).includes('Arabic')) hard.push({ k: 'arabic' });
    if ((job.flags || []).includes('w')) hard.push({ k: 'workAuth' });
    if ((job.flags || []).includes('l')) hard.push({ k: 'license' });
    if (job.workplace === 'R' && job.countries.length && wanted.length && !job.countries.some(c => wanted.includes(c)) && !(prefs.relocate)) hard.push({ k: 'remoteRestricted', v: job.countries });

    let wsum = 0, ssum = 0; const used = {};
    for (const k of Object.keys(weights)) if (parts[k] != null) { wsum += weights[k]; ssum += weights[k] * parts[k]; used[k] = Math.round(parts[k] * 100); }
    const score = wsum ? Math.round(ssum / wsum * 100) : null;
    const coverage = wsum / Object.values(weights).reduce((a, b) => a + b, 0);
    return { score, parts: used, coverage: Math.round(coverage * 100), reasons, missing, hard, matchedReq, matchedPref };
  }

  function locationEligible(job, prefs) {
    const wanted = prefs.countries || []; if (!wanted.length) return true;
    if (job.countries.some(c => wanted.includes(c))) return true;
    if (job.workplace === 'R') {
      if (!job.countries.length && !job.regions.length) return prefs.includeWorldwideRemote !== false; // "Remote" with no restriction stated
      if (job.regions.some(r => (GEO.REGIONS[r] || []).some(c => wanted.includes(c)))) return true;
    }
    if (prefs.relocate && prefs.relocateAnywhere) return true;
    return false;
  }

  // ---------- Verification ----------
  // open: listed in the employer's live ATS feed at verification time. accessible: aggregator listing, status not confirmed by the employer.
  const STATUS = ['open', 'accessible', 'closed', 'failed'];
  function verificationStatus(job, now, maxAgeDays) {
    now = now || new Date(); maxAgeDays = maxAgeDays == null ? 3 : maxAgeDays;
    const v = job.verified || {}; if (!v.status) return { status: 'failed', ageDays: null };
    if (v.status === 'closed' || v.status === 'failed') return { status: v.status, ageDays: null };
    const age = v.at ? (now - new Date(v.at)) / 864e5 : null;
    if (v.status === 'open' && age != null && age > maxAgeDays) return { status: 'accessible', ageDays: Math.floor(age), stale: true };
    return { status: v.status, ageDays: age == null ? null : Math.floor(age) };
  }
  function closedByText(text) { return /no longer (accepting|available|open)|position (has been )?(filled|closed)|job (is )?(closed|expired)|this job has expired|posting (has )?(closed|expired)|applications? (are |is )?closed|الوظيفة مغلقة|انتهى التقديم/i.test(String(text || '')); }

  // ---------- Dedupe ----------
  function normKey(s) { return String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9؀-ۿ]+/g, ' ').replace(/\b(senior|sr|junior|jr|remote|hybrid)\b/g, '').trim(); }
  function dedupe(jobs) {
    const seen = new Map(); const out = []; let dups = 0;
    const rank = { gh: 0, lv: 0, ash: 0, wk: 0, srv: 1, rm: 2, jc: 2, an: 2 };
    for (const j of jobs) {
      const k = normKey(j.company) + '|' + normKey(j.title) + '|' + (j.countries[0] || j.location.toLowerCase().slice(0, 20));
      const urlK = String(j.url || '').replace(/[?#].*$/, '').replace(/\/$/, '');
      const prev = seen.get(k) || seen.get(urlK);
      if (prev) { dups++; if ((rank[j.src] ?? 3) < (rank[prev.src] ?? 3)) { out[out.indexOf(prev)] = j; seen.set(k, j); seen.set(urlK, j); } continue; }
      seen.set(k, j); seen.set(urlK, j); out.push(j);
    }
    return { jobs: out, duplicates: dups };
  }

  // ---------- Filters ----------
  function daysAgo(iso, now) { if (!iso) return null; const d = new Date(iso); if (isNaN(d)) return null; return ((now || new Date()) - d) / 864e5; }
  function salaryAnnual(s) { if (!s || s.min == null) return null; const k = s.period === 'M' ? 12 : s.period === 'H' ? 2080 : 1; return { min: s.min * k, max: (s.max || s.min) * k, cur: s.cur }; }
  /** Apply hard filters. Returns {kept, excluded: {reason: count}} */
  function applyFilters(jobs, f, now) {
    f = f || {}; const ex = {}; const kept = [];
    const bump = r => { ex[r] = (ex[r] || 0) + 1; };
    const inc = s => String(s || '').toLowerCase();
    const exclCo = (f.excludeCompanies || []).map(inc).filter(Boolean), exclTitle = (f.excludeTitles || []).map(inc).filter(Boolean);
    for (const j of jobs) {
      if (f.countries && f.countries.length && !locationEligible(j, f)) { bump('location'); continue; }
      if (f.city && !inc(j.location).includes(inc(f.city))) { bump('city'); continue; }
      if (f.region && !inc(j.location).includes(inc(f.region))) { bump('region'); continue; }
      if (f.workplace && f.workplace.length && j.workplace && !f.workplace.includes(j.workplace)) { bump('workplace'); continue; }
      if (f.workplace && f.workplace.length && !j.workplace && f.strictWorkplace) { bump('workplace'); continue; }
      if (f.empTypes && f.empTypes.length && j.empType && !f.empTypes.includes(j.empType)) { bump('empType'); continue; }
      if (f.seniority && f.seniority.length && !f.seniority.includes(j.seniority)) { bump('seniority'); continue; }
      if (f.postedWithin) { const d = daysAgo(j.posted, now); if (d != null && d > f.postedWithin) { bump('date'); continue; } if (d == null && f.excludeUndated) { bump('date'); continue; } }
      if (f.company && !inc(j.company).includes(inc(f.company))) { bump('company'); continue; }
      if (exclCo.some(c => inc(j.company).includes(c))) { bump('excludedCompany'); continue; }
      if (exclTitle.some(t => inc(j.title).includes(t))) { bump('excludedTitle'); continue; }
      if (f.keywords) { const words = inc(f.keywords).split(/[,;]+/).map(s => s.trim()).filter(Boolean); if (words.length && !words.some(w => inc(j.title + ' ' + j.dept + ' ' + (j.req || []).map(skillName).join(' ')).includes(w))) { bump('keywords'); continue; } }
      if (f.requiredSkills && f.requiredSkills.length) { const ids = f.requiredSkills.map(skillIdByName).filter(i => i >= 0); const all = new Set([...(j.req || []), ...(j.pref || [])]); if (ids.length && !ids.every(i => all.has(i))) { bump('skills'); continue; } }
      if (f.visa && !(j.flags || []).includes('v')) { bump('visa'); continue; }
      if (f.relocation && !(j.flags || []).includes('r')) { bump('relocation'); continue; }
      if (f.minExp != null && f.minExp !== '' && j.years != null && j.years < Number(f.minExp)) { bump('experience'); continue; }
      if (f.maxExp != null && f.maxExp !== '' && j.years != null && j.years > Number(f.maxExp)) { bump('experience'); continue; }
      if (f.eduMax != null && f.eduMax !== '' && j.edu != null && j.edu > Number(f.eduMax)) { bump('education'); continue; }
      if (f.languages && f.languages.length && (j.flags || []).includes('a') && !f.languages.includes('Arabic')) { bump('language'); continue; }
      if (f.sources && f.sources.length && !f.sources.includes(j.src)) { bump('source'); continue; }
      if (f.salaryMin || f.salaryMax || f.excludeNoSalary) {
        const s = salaryAnnual(j.salary);
        if (!s) { if (f.excludeNoSalary) { bump('salary'); continue; } }
        else if (!f.currency || s.cur === f.currency) {
          const k = f.salaryPeriod === 'M' ? 12 : 1;
          if (f.salaryMin && s.max < Number(f.salaryMin) * k) { bump('salary'); continue; }
          if (f.salaryMax && s.min > Number(f.salaryMax) * k) { bump('salary'); continue; }
        }
      }
      kept.push(j);
    }
    return { kept, excluded: ex };
  }

  // ---------- Compact index codec (used by the hosted index) ----------
  const SRC_NAME = { gh: 'Greenhouse', lv: 'Lever', ash: 'Ashby', wk: 'Workable', rm: 'Remotive', jc: 'Jobicy', an: 'Arbeitnow', srv: 'Live API' };
  const SRC_KIND = { gh: 'ats', lv: 'ats', ash: 'ats', wk: 'ats', rm: 'agg', jc: 'agg', an: 'agg' };
  function urlFor(src, slug, code) {
    if (/^https?:\/\//.test(code)) return code;
    if (src === 'gh') return `https://job-boards.greenhouse.io/${slug}/jobs/${code}`;
    if (src === 'lv') return `https://jobs.lever.co/${slug}/${code}`;
    if (src === 'ash') return `https://jobs.ashbyhq.com/${slug}/${code}`;
    if (src === 'wk') return `https://apply.workable.com/${slug}/j/${code}/`;
    if (src === 'rm') return `https://remotive.com/remote-jobs/${code}`;
    if (src === 'jc') return `https://jobicy.com/jobs/${code}`;
    if (src === 'an') return `https://www.arbeitnow.com/jobs/companies/${code}`;
    return code;
  }
  function hash4(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return (h % 1679616).toString(36).padStart(4, '0'); }
  const b36 = n => n.toString(36);
  /** Encode an enriched job as one pipe-separated line (+hash). */
  function encodeLine(j, slug, code) {
    const ymd = j.posted ? j.posted.slice(2, 10).replace(/-/g, '') : '';
    const sal = j.salary && j.salary.min != null ? [j.salary.min, j.salary.max || '', j.salary.cur || '', j.salary.period || 'Y'].join('~') : '';
    const f = [j.src, slug, j.company, j.title, j.location, j.countries.join(','), j.workplace, j.empType, ymd, code, j.dept, j.years == null ? '' : j.years, j.edu == null ? '' : j.edu,
      j.req.map(b36).join(','), j.pref.map(b36).join(','), j.flags.join(''), sal, j.excerpt].map(x => String(x == null ? '' : x).replace(/[|\n\r]+/g, ' ').trim());
    const line = f.join('|');
    return line + '|' + hash4(line);
  }
  // Nationality-restricted programmes are often stated only in the title (e.g. "(Emirati National)", "Tamheer").
  function titleFlags(title, f) {
    const out = f.slice();
    if (/\b(emirati|saudi|kuwaiti|qatari|omani|bahraini|jordanian|egyptian|uae) nationals?\b|nationals? only|\btamheer\b|emiratisation|saudization|saudi only/i.test(title) && !out.includes('w')) out.push('w');
    return out;
  }
  function decodeLine(line, verifiedAt) {
    const parts = line.split('|'); const h = parts.pop(); const body = parts.join('|');
    if (hash4(body) !== h) return null;
    const [src, slug, company, title, location, cc, wp, et, ymd, code, dept, yrs, edu, req, pref, flags, sal, excerpt] = parts;
    const loc = GEO.detectLocation(location);
    const salary = sal ? (() => { const [mn, mx, cur, per] = sal.split('~'); return { min: Number(mn), max: mx ? Number(mx) : null, cur, period: per }; })() : null;
    return {
      src, company, title, location, countries: loc.countries.length ? loc.countries : (cc ? cc.split(',') : []), regions: loc.regions, city: loc.city, workplace: wp, empType: et,
      posted: ymd ? `20${ymd.slice(0, 2)}-${ymd.slice(2, 4)}-${ymd.slice(4, 6)}` : '', url: urlFor(src, slug, code), dept, seniority: seniorityFromTitle(title),
      years: yrs === '' ? null : Number(yrs), edu: edu === '' ? null : Number(edu), req: req ? req.split(',').map(x => parseInt(x, 36)) : [], pref: pref ? pref.split(',').map(x => parseInt(x, 36)) : [],
      flags: titleFlags(title, flags ? flags.split('') : []), salary, excerpt, verified: { status: SRC_KIND[src] === 'ats' ? 'open' : 'accessible', at: verifiedAt, via: SRC_NAME[src] }
    };
  }

  // ---------- Upload validation (extension + MIME + magic bytes + size) ----------
  function validateFile(name, type, size, head, maxBytes) {
    name = String(name || '').toLowerCase(); maxBytes = maxBytes || 5 * 1024 * 1024; head = head || [];
    const pdf = type === 'application/pdf' || name.endsWith('.pdf');
    const docx = /officedocument\.wordprocessingml/.test(type || '') || name.endsWith('.docx');
    if (!pdf && !docx) return { ok: false, error: 'type' };
    if (size > maxBytes) return { ok: false, error: 'size' };
    if (pdf && !(head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46)) return { ok: false, error: 'type' };
    if (docx && !(head[0] === 0x50 && head[1] === 0x4b)) return { ok: false, error: 'type' };
    return { ok: true, kind: pdf ? 'pdf' : 'docx' };
  }

  const CORE = { SKILLS, SEN, EDU, LANGS, INDUSTRIES, CERTS, DEFAULT_WEIGHTS, STATUS, SRC_NAME, SRC_KIND, GEO,
    detectSkills, skillName, skillIdByName, seniorityFromTitle, seniorityFromYears, yearsRequired, educationLevel, jobFlags, workplaceOf, empTypeOf, enrichJob, stripHtml, makeExcerpt,
    parseCV, experienceRanges, mergeMonths, titleSimilarity, scoreJob, locationEligible, verificationStatus, closedByText, dedupe, applyFilters, daysAgo, salaryAnnual,
    encodeLine, decodeLine, urlFor, hash4, validateFile };
  if (typeof module !== 'undefined' && module.exports) module.exports = CORE; else root.CVZ = CORE;
})(typeof globalThis !== 'undefined' ? globalThis : this);
