/* CVEEEZ AI — Personal Career Coach (zero-cost prototype)
 * One assistant, one conversation, two input methods (text + voice).
 * Engines:
 *   guided  — always available; rule-based, built on the CVEEEZ job-finder engine (core.js) and its real job index.
 *   webllm  — open-source LLM (Qwen2.5 Instruct) running inside the browser via WebGPU; nothing leaves the device.
 *   chrome  — Chrome's built-in on-device model (Prompt API), when the browser provides it (English only).
 * Data: CV and conversation stay in this browser (localStorage). Jobs come from the CVEEEZ index (jobs.json).
 */
(function () {
  'use strict';
  const C = window.CVZ, G = window.CVZ_GEO;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cvz-coach:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cvz-coach:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    clear() { try { Object.keys(localStorage).filter(k => k.startsWith('cvz-coach:')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ } }
  };

  // ------------------------------------------------------------------ texts
  const I = {
    ar: {
      badge: 'AI مدرّبك المهني', proto: 'نموذج تجريبي', menu: 'الملف والإعدادات', close: 'إغلاق', voiceOn: 'الرد الصوتي: يعمل', voiceOff: 'الرد الصوتي: متوقف',
      hMode: 'ماذا تريد اليوم؟', hProfile: 'ملفك المهني', hEngine: 'محرّك الذكاء الاصطناعي', hPrivacy: 'الخصوصية',
      privacy: 'كل شيء يبقى في متصفحك: السيرة الذاتية والمحادثة لا تُرسلان إلى أي خادم. التعرّف على الصوت يتم عبر خدمة المتصفح.',
      clear: 'احذف بياناتي ومحادثتي', cleared: 'تم حذف بياناتك ومحادثتك من هذا المتصفح.',
      placeholder: 'اكتب رسالتك… أو اضغط الميكروفون وتحدّث', listening: 'أستمع إليك… تحدّث الآن', speaking: 'أتحدث… اضغط الميكروفون لمقاطعتي', noMic: 'هذا المتصفح لا يدعم التعرّف على الصوت. جرّب Chrome أو Edge.', micDenied: 'لم يُسمح باستخدام الميكروفون. اسمح للموقع بالميكروفون من شريط العنوان ثم أعد المحاولة.', noVoice: 'لا يوجد صوت عربي مثبت على هذا الجهاز/المتصفح، لذلك لا يمكن قراءة الرد بصوت. جرّب Chrome أو Edge، أو ثبّت صوتًا عربيًا من إعدادات الجهاز.', voiceTest: 'تم تشغيل الرد الصوتي.',
      upload: 'ارفع سيرتك (PDF/DOCX)', paste: 'الصق النص', sample: 'سيرة نموذجية', usePaste: 'استخدم هذا النص', reading: 'أقرأ السيرة…', noProfile: 'لم تُضف سيرة ذاتية بعد. أضفها ليصبح التوجيه مخصّصًا لك.',
      years: 'سنوات الخبرة', skills: 'المهارات', title: 'المسمى', readFail: 'تعذّرت قراءة الملف. جرّب لصق النص.', sampleTag: 'شخص خيالي',
      eGuided: 'الوضع الموجّه (يعمل دائمًا)', eGuidedD: 'قواعد ذكية مبنية على محرك CVEEEZ وبيانات الوظائف الحقيقية. بدون تحميل.',
      eWeb: 'نموذج ذكاء اصطناعي مفتوح المصدر داخل المتصفح', eWebD: 'مجاني ويعمل على جهازك. يحتاج تحميلًا لأول مرة (~1–2 GB) وجهازًا يدعم WebGPU.',
      eChrome: 'ذكاء Chrome المدمج (إنجليزي فقط)', eChromeD: 'متاح فقط في Chrome الحديث على أجهزة قوية.', eLoad: 'تحميل النموذج', eSmall: 'صغير وسريع (~1 GB)', eBig: 'أدق (~2 GB)',
      eNoGpu: 'جهازك أو متصفحك لا يدعم WebGPU، لذلك لا يمكن تشغيل النموذج هنا. الوضع الموجّه يعمل.', eNoChrome: 'غير متاح في هذا المتصفح.', eReady: 'النموذج جاهز ويعمل على جهازك.', eFail: 'تعذّر تحميل النموذج: ',
      tagAI: 'نصيحة من الذكاء الاصطناعي', tagGuided: 'توجيه آلي', tagProfile: 'من ملفك', tagJobs: 'وظائف حقيقية من CVEEEZ', tagVoice: 'بالصوت',
      modes: {
        coach: ['مدرّبي المهني', 'ناقش وضعك المهني وخطتك'], interview: ['تدرّب على المقابلة', 'مقابلة واقعية مع تقييم'], cv: ['راجع سيرتي الذاتية', 'ملاحظات وتحسينات'],
        jobs: ['ابحث عن وظيفتي', 'وظائف حقيقية تناسبك'], skills: ['طوّر مهاراتي', 'الفجوات وأولويات التعلّم'], talk: ['محادثات صعبة', 'تفاوض راتب، مدير، استقالة…']
      }
    },
    en: {
      badge: 'AI Career Coach', proto: 'Prototype', menu: 'Profile & settings', close: 'Close', voiceOn: 'Spoken replies: on', voiceOff: 'Spoken replies: off',
      hMode: 'What do you need today?', hProfile: 'Your profile', hEngine: 'AI engine', hPrivacy: 'Privacy',
      privacy: 'Everything stays in your browser: your CV and this conversation are not sent to any server. Speech recognition uses the browser\'s own service.',
      clear: 'Delete my data and conversation', cleared: 'Your data and conversation were deleted from this browser.',
      placeholder: 'Type a message… or tap the mic and speak', listening: 'Listening… speak now', speaking: 'Speaking… tap the mic to interrupt', noMic: 'This browser does not support speech recognition. Try Chrome or Edge.', micDenied: 'Microphone access was not allowed. Allow the microphone for this site in the address bar and try again.', noVoice: 'No voice for this language is installed in this device/browser, so replies cannot be read aloud. Try Chrome or Edge, or install a voice in the device settings.', voiceTest: 'Spoken replies are on.',
      upload: 'Upload CV (PDF/DOCX)', paste: 'Paste text', sample: 'Sample CV', usePaste: 'Use this text', reading: 'Reading your CV…', noProfile: 'No CV added yet. Add one so the coaching is personal to you.',
      years: 'Years of experience', skills: 'Skills', title: 'Title', readFail: 'Could not read that file. Try pasting the text.', sampleTag: 'fictional person',
      eGuided: 'Guided mode (always works)', eGuidedD: 'Smart rules built on the CVEEEZ engine and its real job data. No download.',
      eWeb: 'Open-source AI model in your browser', eWebD: 'Free and runs on your device. First load downloads ~1–2 GB and needs WebGPU.',
      eChrome: 'Chrome built-in AI (English only)', eChromeD: 'Only in recent Chrome on capable computers.', eLoad: 'Load model', eSmall: 'Small & fast (~1 GB)', eBig: 'More accurate (~2 GB)',
      eNoGpu: 'This device or browser does not support WebGPU, so the model cannot run here. Guided mode works.', eNoChrome: 'Not available in this browser.', eReady: 'Model ready and running on your device.', eFail: 'Could not load the model: ',
      tagAI: 'AI-generated advice', tagGuided: 'Guided (rule-based)', tagProfile: 'From your profile', tagJobs: 'Real CVEEEZ jobs', tagVoice: 'by voice',
      modes: {
        coach: ['My career coach', 'Discuss your situation and plan'], interview: ['Practice my interview', 'Realistic interview with feedback'], cv: ['Review my CV', 'Feedback and improvements'],
        jobs: ['Find my job', 'Real jobs that fit you'], skills: ['Develop my skills', 'Gaps and learning priorities'], talk: ['Difficult conversations', 'Salary, manager, resignation…']
      }
    }
  };
  const MODES = ['coach', 'interview', 'cv', 'jobs', 'skills', 'talk'];

  // ------------------------------------------------------------------ state
  const S = {
    lang: store.get('lang', (navigator.language || '').startsWith('ar') ? 'ar' : 'en'),
    mode: store.get('mode', 'coach'),
    profile: store.get('profile', null), cvText: store.get('cvText', ''), sample: store.get('sample', false),
    msgs: store.get('msgs', []),
    ctx: store.get('ctx', { target: '' }),           // shared context across text & voice (e.g. target role)
    flow: store.get('flow', null),                   // active interview / conversation simulation
    engine: 'guided', speak: store.get('speak', false),
    jobs: [], jobsAt: '', web: null, chrome: null, busy: false
  };
  const t = k => (I[S.lang][k] != null ? I[S.lang][k] : I.en[k] != null ? I.en[k] : k);
  const AR = () => S.lang === 'ar';
  const persist = () => { store.set('msgs', S.msgs.slice(-120)); store.set('ctx', S.ctx); store.set('flow', S.flow); store.set('mode', S.mode); store.set('lang', S.lang); store.set('speak', S.speak); };

  // ------------------------------------------------------------------ jobs (real CVEEEZ index)
  async function loadJobs() {
    try {
      // Prefer the live CVEEEZ index when hosted on the same site (e.g. cveeez.netlify.app/coach/); otherwise the bundled snapshot.
      let d = null;
      if (location.pathname.length > 1) { try { const r0 = await fetch('/jobs.json', { cache: 'no-cache' }); if (r0.ok) { const x = await r0.json(); if (x && Array.isArray(x.lines)) d = x; } } catch (e) { /* not hosted with CVEEEZ */ } }
      if (!d) { const r = await fetch('jobs.json', { cache: 'no-cache' }); d = await r.json(); }
      S.jobs = d.lines.map(l => C.decodeLine(l, d.collectedAt)).filter(Boolean); S.jobsAt = d.collectedAt;
    } catch (e) { S.jobs = []; }
  }
  const profileForScore = () => {
    const p = Object.assign({ skills: [] }, S.profile || {});
    if (S.ctx.target) p.desiredTitle = S.ctx.target;
    return p;
  };
  function findJobs(opts) {
    opts = opts || {};
    const p = profileForScore(); const target = opts.title || S.ctx.target || p.currentTitle || '';
    let list = S.jobs;
    if (opts.countries && opts.countries.length) list = list.filter(j => C.locationEligible(j, { countries: opts.countries, includeWorldwideRemote: true }));
    const scored = list.map(j => {
      const m = C.scoreJob(j, p, { countries: opts.countries || [] });
      const ts = target ? C.titleSimilarity(target, j.title) : 0;
      return { j, m, rank: (m.score || 0) / 100 + ts * 0.8 };
    }).filter(x => !target || x.rank > 0.45 || C.titleSimilarity(target, x.j.title) > 0.3);
    scored.sort((a, b) => b.rank - a.rank);
    return scored.slice(0, opts.limit || 5);
  }
  function relevantJobs(title, n) {
    if (!title) return [];
    return S.jobs.map(j => ({ j, s: C.titleSimilarity(title, j.title) })).filter(x => x.s >= 0.34).sort((a, b) => b.s - a.s).slice(0, n || 40).map(x => x.j);
  }
  function skillGap(title) {
    const jobs = relevantJobs(title, 40); const have = new Set(((S.profile || {}).skills || []).map(s => s.toLowerCase()));
    const cnt = new Map();
    // "competitive compensation & benefits" and soft/language terms appear in advert boilerplate, not as requirements
    const noise = n => (/compensation/i.test(n) && !/hr|human|reward|payroll/i.test(title)) || ['soft', 'lang'].includes((C.SKILLS[C.skillIdByName(n)] || [])[1]);
    for (const j of jobs) for (const i of new Set([...(j.req || []), ...(j.pref || [])])) { const n = C.skillName(i); if (!have.has(n.toLowerCase()) && !noise(n)) cnt.set(n, (cnt.get(n) || 0) + 1); }
    const haveHits = new Map();
    for (const j of jobs) for (const i of new Set(j.req || [])) { const n = C.skillName(i); if (have.has(n.toLowerCase())) haveHits.set(n, (haveHits.get(n) || 0) + 1); }
    return { n: jobs.length, missing: [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 8), matched: [...haveHits].sort((a, b) => b[1] - a[1]).slice(0, 6) };
  }
  function jobCard(x) {
    const j = x.j, m = x.m || C.scoreJob(j, profileForScore(), {});
    const ok = (m.matchedReq || []).slice(0, 5).map(C.skillName), miss = (m.missing || []).filter(z => z.k === 'skill').slice(0, 4).map(z => z.v);
    return `<div class="job"><div class="t">${esc(j.title)}</div><div class="c">${esc(j.company)} · ${esc(j.location)}</div>
      <div class="chips">${m.score != null ? `<span class="chip score">${AR() ? 'التطابق التقديري' : 'Estimated match'} ${m.score}%</span>` : ''}${ok.map(s => `<span class="chip pill-ok">✓ ${esc(s)}</span>`).join('')}${miss.map(s => `<span class="chip pill-miss">${esc(s)}</span>`).join('')}</div>
      <div style="margin-top:6px"><a href="${esc(j.url)}" target="_blank" rel="noopener">${AR() ? 'افتح الإعلان الأصلي ↗' : 'Open original advert ↗'}</a></div></div>`;
  }

  // ------------------------------------------------------------------ language helpers
  const isAr = s => /[؀-ۿ]/.test(s || '');
  function extractTarget(text) {
    const pats = [/(?:move|switch|transition|get)\s+(?:into|to)\s+(?:a\s+|an\s+)?(.{3,60}?)(?:\s+role|\s+position|\s+job|[.,!?]|$)/i, /(?:become|be)\s+(?:a\s+|an\s+)(.{3,60}?)(?:[.,!?]|$)/i,
      /(?:target(?:ing)?|apply(?:ing)? for|looking for)\s+(?:a\s+|an\s+)?(.{3,60}?)(?:\s+role|\s+position|\s+job|[.,!?]|$)/i,
      /(?:أنتقل|انتقل|الانتقال|انتقال|التحول|أتحول|التحوّل|اتحول)\s+(?:إلى|الى|ل)\s*(?:وظيفة|مجال|دور)?\s*(.{3,60}?)(?:[.،!؟]|$)/, /(?:أصبح|اصير|أصير|أكون)\s+(.{3,60}?)(?:[.،!؟]|$)/, /(?:أستهدف|أبحث عن وظيفة|أتقدم ل(?:وظيفة)?)\s+(.{3,60}?)(?:[.،!؟]|$)/, /(?:وظيفة|منصب)\s+(.{3,40}?)(?:[.،!؟]|$)/];
    for (const re of pats) {
      const m = String(text).match(re); if (!m || !m[1]) continue;
      let v = m[1].trim().replace(/^(the|a|an|my)\s+/i, '').replace(/^(وظيفة|مجال|دور)\s+/, '');
      if (/^(first|new|any|a|job|work|role|position|opportunit)/i.test(v) || /أول|جديدة|أي وظيفة|عمل$/.test(v) || v.length < 3) continue;
      return toEnglishRole(v);
    }
    return '';
  }
  // Job titles in the CVEEEZ index are mostly English: map common Arabic role names so analysis uses real adverts
  const AR_ROLES = [[/تطوير الأعمال|تطوير اعمال/, 'Business Development'], [/مدير(?:\s+ال)?مشاريع|إدارة المشاريع/, 'Project Manager'], [/مدير(?:\s+ال)?منتج/, 'Product Manager'], [/محاسب/, 'Accountant'],
    [/مندوب مبيعات طبية|مبيعات طبية|مندوب طبي/, 'Medical Sales Representative'], [/مبيعات/, 'Sales'], [/تسويق/, 'Marketing'], [/موارد بشرية|الموارد البشرية/, 'HR'], [/مهندس برمجيات|مطور|مبرمج/, 'Software Engineer'],
    [/محلل بيانات|تحليل البيانات/, 'Data Analyst'], [/خدمة العملاء|خدمة عملاء/, 'Customer Service'], [/ممرض/, 'Nurse'], [/صيدلي/, 'Pharmacist'], [/مالية|مالي/, 'Finance'], [/مدقق|تدقيق/, 'Auditor'],
    [/مهندس/, 'Engineer'], [/مصمم/, 'Designer'], [/عمليات/, 'Operations'], [/مشتريات/, 'Procurement'], [/لوجست|سلاسل الإمداد/, 'Supply Chain']];
  function toEnglishRole(v) { if (!/[؀-ۿ]/.test(v)) return v; for (const [re, en] of AR_ROLES) if (re.test(v)) return en; return v; }
  function countriesIn(text) { return G.detectLocation(text).countries; }
  const has = (text, ...res) => res.some(re => re.test(text));

  // ------------------------------------------------------------------ guided engine
  const fmtList = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  function profileSummaryHtml() {
    const p = S.profile; if (!p) return '';
    const L = AR() ? ['المسمى', 'الخبرة', 'المهارات', 'المؤهل'] : ['Title', 'Experience', 'Skills', 'Education'];
    return fmtList([
      `${L[0]}: ${esc(p.currentTitle || '—')}`, `${L[1]}: ${p.years != null ? esc(p.years) + (AR() ? ' سنة' : ' years') : '—'}`,
      `${L[2]}: ${esc((p.skills || []).slice(0, 10).join(', ') || '—')}`, `${L[3]}: ${esc((p.education || [])[0] || '—')}`]);
  }
  function needProfile() { return AR() ? '<p>لأقدّم لك توجيهًا مبنيًا على خبرتك الفعلية، أضف سيرتك الذاتية من «الملف والإعدادات» (أو جرّب السيرة النموذجية).</p>' : '<p>To give advice based on your actual background, add your CV under “Profile & settings” (or try the sample CV).</p>'; }

  function guidedCoach(text) {
    const tags = ['guided']; const parts = [];
    const tgt = extractTarget(text); if (tgt) { S.ctx.target = tgt; }
    const wantsGap = has(text, /skill|missing|gap|lack|need to learn/i, /مهار|ينقصني|تنقصني|ناقص|فجو/);
    const wantsJobs = has(text, /\b(find|show|search)\b.*\bjobs?\b|\bjobs (in|for|that)\b|vacanc|openings/i, /وظائف|شواغر|ابحث لي/);
    const wantsStrength = has(text, /strength|good at|strong/i, /نقاط القوة|قوتي|أقوى/);
    const firstJob = has(text, /fresh grad|graduate|first job|no experience|entry/i, /خريج|أول وظيفة|بدون خبرة|حديث التخرج/);
    if (S.profile) tags.push('profile');
    if (firstJob) {
      parts.push(AR() ? '<h4>خطة لأول وظيفة</h4>' : '<h4>Plan for your first job</h4>');
      parts.push(fmtList(AR() ? ['اختر 1–2 مسميات مبتدئة واضحة (مثل: محاسب مبتدئ، مطوّر مبتدئ، ممثل خدمة عملاء).', 'اكتب في السيرة مشاريع التخرج والتدريب والعمل التطوعي كخبرة، مع النتائج.', 'ركّز على المهارات المطلوبة في الإعلانات الحقيقية — أعرضها لك من قاعدة CVEEEZ.', 'تدرّب على مقابلة «مستوى مبتدئ» هنا قبل التقديم.'] :
        ['Pick 1–2 clear entry-level titles (e.g. Junior Accountant, Junior Developer, Customer Service Representative).', 'List graduation projects, internships and volunteering as experience, with outcomes.', 'Focus on the skills real adverts ask for — I can show them from the CVEEEZ database.', 'Practise an “Entry-level” interview here before applying.']));
      if (!S.ctx.target) parts.push(AR() ? '<p>ما المجال أو المسمى الذي تفكر فيه؟ (مثال: «أريد أن أصبح محاسبًا»)</p>' : '<p>Which field or title are you considering? (e.g. “I want to become an accountant”)</p>');
    }
    if (wantsStrength && S.profile) {
      const p = S.profile;
      parts.push(AR() ? '<h4>نقاط قوتك كما تظهر في سيرتك</h4>' : '<h4>Your strengths as shown in your CV</h4>');
      const pts = [];
      if (p.years != null) pts.push(AR() ? `${p.years} سنة خبرة` : `${p.years} years of experience`);
      if ((p.skills || []).length) pts.push((AR() ? 'مهارات: ' : 'Skills: ') + esc(p.skills.slice(0, 8).join(', ')));
      if (p.management) pts.push(AR() ? 'خبرة في قيادة فريق' : esc(p.management));
      (p.achievements || []).slice(0, 3).forEach(a => pts.push((AR() ? 'إنجاز: ' : 'Achievement: ') + esc(a)));
      (p.certifications || []).slice(0, 3).forEach(c => pts.push((AR() ? 'شهادة: ' : 'Certification: ') + esc(c)));
      parts.push(fmtList(pts.length ? pts : [AR() ? 'لم أجد تفاصيل كافية في السيرة.' : 'I could not find enough detail in the CV.']));
    }
    const target = S.ctx.target;
    if ((tgt || wantsGap) && target) {
      const g = skillGap(target);
      parts.push(AR() ? `<h4>الانتقال إلى «${esc(target)}»</h4>` : `<h4>Moving into “${esc(target)}”</h4>`);
      if (!g.n) parts.push(AR() ? '<p>لم أجد إعلانات حالية بهذا المسمى في قاعدة CVEEEZ، لذلك لا أستطيع استنتاج المتطلبات من بيانات حقيقية. جرّب مسمى أقرب أو أعمّ.</p>' : '<p>I found no current adverts with this title in the CVEEEZ database, so I can’t infer requirements from real data. Try a closer or broader title.</p>');
      else {
        tags.push('jobs');
        parts.push(AR() ? `<p>حلّلت ${g.n} إعلانًا حقيقيًا مشابهًا في قاعدة CVEEEZ.</p>` : `<p>I analysed ${g.n} similar real adverts in the CVEEEZ database.</p>`);
        if (g.matched.length) parts.push((AR() ? '<p><b>مهارات لديك ومطلوبة:</b> ' : '<p><b>Skills you have that they ask for:</b> ') + g.matched.map(([n, c]) => `${esc(n)} (${c})`).join(AR() ? '، ' : ', ') + '</p>');
        if (g.missing.length) parts.push((AR() ? '<p><b>مهارات تنقصك (عدد الإعلانات التي تطلبها):</b></p>' : '<p><b>Skills you’re missing (number of adverts asking for them):</b></p>') + fmtList(g.missing.slice(0, 6).map(([n, c]) => `${esc(n)} — ${c}/${g.n}`)));
        parts.push(AR() ? '<h4>خطة عملية</h4>' + fmtList(['ابدأ بأكثر مهارتين تكرارًا أعلاه.', 'أعد صياغة خبرتك الحالية لتُبرز ما يشبه مهام الوظيفة الجديدة.', 'قدّم على 3–5 إعلانات قريبة، وتدرّب على مقابلة لهذا المسمى هنا.']) :
          '<h4>Action plan</h4>' + fmtList(['Start with the two most frequent missing skills above.', 'Reframe your current experience to highlight tasks similar to the new role.', 'Apply to 3–5 close adverts and practise an interview for this title here.']));
      }
    } else if (wantsGap && !target) {
      parts.push(AR() ? '<p>لأي وظيفة تريد معرفة المهارات الناقصة؟ اكتب المسمى (مثال: «تطوير الأعمال»).</p>' : '<p>For which role should I check the missing skills? Tell me the title (e.g. “business development”).</p>');
    }
    if (wantsJobs && !firstJob) { const r = guidedJobs(text); return { html: parts.join('') + r.html, tags: [...new Set(tags.concat(r.tags))], speak: r.speak }; }
    if (!parts.length) {
      parts.push(AR() ? '<p>أنا مدرّبك المهني. أستطيع أن أساعدك في: تحديد الوظائف المناسبة، معرفة المهارات الناقصة لوظيفة معيّنة، التحضير للمقابلة، تحسين سيرتك، والتدرّب على محادثات صعبة.</p>' : '<p>I’m your career coach. I can help you pick suitable roles, find the skills you’re missing for a specific job, prepare for interviews, improve your CV and practise difficult conversations.</p>');
      if (S.profile) parts.push((AR() ? '<h4>ما أعرفه عنك من سيرتك</h4>' : '<h4>What I know from your CV</h4>') + profileSummaryHtml()); else parts.push(needProfile());
      parts.push(AR() ? '<p>جرّب مثلًا: «لدي 5 سنوات في المبيعات وأريد الانتقال إلى تطوير الأعمال».</p>' : '<p>Try for example: “I have five years of sales experience and want to move into business development.”</p>');
    }
    return { html: parts.join(''), tags };
  }

  function guidedJobs(text) {
    const cc = countriesIn(text || ''); const tgt = extractTarget(text || ''); if (tgt) S.ctx.target = tgt;
    const res = findJobs({ countries: cc, limit: 5 });
    const tags = ['guided', 'jobs']; if (S.profile) tags.push('profile');
    if (!S.profile && !S.ctx.target) return { html: needProfile() + (AR() ? '<p>أو اكتب المسمى الذي تبحث عنه، مثل: «وظائف محاسب في السعودية».</p>' : '<p>Or tell me the title, e.g. “accountant jobs in Saudi Arabia”.</p>'), tags: ['guided'] };
    if (!res.length) return { html: AR() ? '<p>لم أجد وظائف مطابقة في قاعدة CVEEEZ لهذه المعايير. جرّب دولة أخرى أو مسمى أعمّ.</p>' : '<p>No matching jobs in the CVEEEZ database for these criteria. Try another country or a broader title.</p>', tags };
    const head = AR() ? `<p>أفضل ${res.length} وظائف من قاعدة CVEEEZ${cc.length ? ' في ' + cc.map(c => G.countryName(c, 'ar')).join('، ') : ''} لـ«${esc(S.ctx.target || S.profile.currentTitle || '')}». النسبة تقديرية لمدى التوافق، وليست احتمال القبول.</p>` :
      `<p>Top ${res.length} jobs from the CVEEEZ database${cc.length ? ' in ' + cc.map(c => G.countryName(c, 'en')).join(', ') : ''} for “${esc(S.ctx.target || S.profile.currentTitle || '')}”. The percentage estimates fit — it is not a probability of being hired.</p>`;
    const foot = `<p class="note">${AR() ? 'بيانات الوظائف من فهرس CVEEEZ بتاريخ' : 'Job data from the CVEEEZ index dated'} ${esc((S.jobsAt || '').slice(0, 10))}. ${AR() ? 'تأكّد من توفر الإعلان على موقع صاحب العمل.' : 'Check availability on the employer’s site.'}</p>`;
    return { html: head + res.map(jobCard).join('') + foot, tags, speak: AR() ? `وجدت ${res.length} وظائف مناسبة. التفاصيل والروابط على الشاشة.` : `I found ${res.length} matching jobs. Details and links are on screen.` };
  }

  function guidedSkills(text) {
    const tgt = extractTarget(text || '') || S.ctx.target || (S.profile && S.profile.currentTitle) || ''; if (extractTarget(text || '')) S.ctx.target = tgt;
    if (!tgt) return { html: AR() ? '<p>اكتب الوظيفة التي تستهدفها (مثال: «أريد أن أصبح مدير مشاريع») وسأحلّل المهارات المطلوبة في الإعلانات الحقيقية.</p>' : '<p>Tell me the role you’re aiming for (e.g. “I want to become a project manager”) and I’ll analyse the skills real adverts require.</p>', tags: ['guided'] };
    const g = skillGap(tgt); const tags = ['guided']; if (S.profile) tags.push('profile');
    if (!g.n) return { html: AR() ? `<p>لا توجد إعلانات حالية لـ«${esc(tgt)}» في قاعدة CVEEEZ لاستخراج المهارات منها.</p>` : `<p>No current adverts for “${esc(tgt)}” in the CVEEEZ database to derive skills from.</p>`, tags };
    tags.push('jobs');
    const pri = g.missing.slice(0, 3).map(([n]) => n);
    let html = AR() ? `<h4>أولويات التعلّم لـ«${esc(tgt)}»</h4><p>مبنية على ${g.n} إعلانًا حقيقيًا.</p>` : `<h4>Learning priorities for “${esc(tgt)}”</h4><p>Based on ${g.n} real adverts.</p>`;
    html += fmtList(g.missing.map(([n, c], i) => `${i < 3 ? '<b>' : ''}${esc(n)}${i < 3 ? '</b>' : ''} — ${Math.round(c / g.n * 100)}%`));
    html += AR() ? `<h4>خطة 6 أسابيع</h4>${fmtList([`الأسبوعان 1–2: ${esc(pri[0] || '')} — دورة قصيرة ومشروع صغير تطبيقي.`, `الأسبوعان 3–4: ${esc(pri[1] || pri[0] || '')} — طبّقه على مهمة من عملك الحالي.`, `الأسبوعان 5–6: ${esc(pri[2] || pri[0] || '')}، ثم أضف ما أنجزته إلى سيرتك بنتائج ملموسة.`])}<p class="note">موارد أكاديمية CVEEEZ غير مربوطة بهذا النموذج بعد، لذلك لا أقترح دورات محددة.</p>` :
      `<h4>6-week plan</h4>${fmtList([`Weeks 1–2: ${esc(pri[0] || '')} — a short course and a small hands-on project.`, `Weeks 3–4: ${esc(pri[1] || pri[0] || '')} — apply it to a task in your current job.`, `Weeks 5–6: ${esc(pri[2] || pri[0] || '')}, then add the results to your CV.`])}<p class="note">CVEEEZ Academy resources are not connected to this prototype yet, so I don’t suggest specific courses.</p>`;
    html += AR() ? '<h4>مهارات عامة تعزّز فرصك</h4>' + fmtList(['التواصل وعرض الأفكار باختصار', 'التفاوض على الراتب والعرض', 'المقابلة بأسلوب STAR (موقف – مهمة – إجراء – نتيجة)']) : '<h4>General skills that improve your chances</h4>' + fmtList(['Clear communication and concise presentations', 'Negotiating salary and offers', 'Interview answers using STAR (Situation – Task – Action – Result)']);
    return { html, tags };
  }

  // CV review — rules applied to the CV text; never invents facts, uses placeholders for numbers
  function guidedCV(text) {
    const tags = ['guided'];
    if (!S.cvText) return { html: needProfile(), tags };
    tags.push('profile');
    const cv = S.cvText, lines = cv.split('\n').map(s => s.trim()).filter(Boolean), words = cv.split(/\s+/).filter(Boolean).length;
    const hasSec = (re) => lines.some(l => l.length < 40 && re.test(l));
    const sec = {
      summary: hasSec(/summary|profile|objective|about|نبذة|الملخص|الهدف/i), experience: hasSec(/experience|employment|work history|الخبرة|الخبرات/i),
      education: hasSec(/education|qualification|التعليم|المؤهلات/i), skills: hasSec(/skills|competenc|المهارات/i)
    };
    const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(cv), phone = /\+?\d[\d\s-]{7,}/.test(cv);
    const bullets = lines.filter(l => /^[•\-*▪●]/.test(l) || (/^(managed|led|developed|prepared|handled|responsible|worked|built|created|reduced|increased|delivered|supported|helped|أدرت|قدت|طورت|أعددت|مسؤول)/i.test(l)));
    const quant = bullets.filter(l => /\d/.test(l));
    const weakRe = /^[•\-*▪●\s]*(responsible for|worked on|helped( with)?|duties included|assisted( with)?|involved in|مسؤول عن|ساعدت في|عملت على)/i;
    const weak = bullets.filter(l => weakRe.test(l)).slice(0, 4);
    const issues = [], good = [];
    const L = AR();
    if (words < 250) issues.push(L ? `السيرة قصيرة (${words} كلمة). أضف تفاصيل المهام والنتائج.` : `The CV is short (${words} words). Add more detail on tasks and results.`);
    else if (words > 1100) issues.push(L ? `السيرة طويلة (${words} كلمة). حاول ألا تتجاوز صفحتين.` : `The CV is long (${words} words). Aim for two pages at most.`);
    else good.push(L ? `الطول مناسب (${words} كلمة).` : `Good length (${words} words).`);
    for (const [k, ok] of Object.entries(sec)) {
      const nm = { summary: L ? 'الملخص المهني' : 'professional summary', experience: L ? 'الخبرة' : 'experience', education: L ? 'التعليم' : 'education', skills: L ? 'المهارات' : 'skills' }[k];
      if (ok) good.push((L ? 'قسم واضح: ' : 'Clear section: ') + nm); else issues.push((L ? 'لم أجد عنوانًا واضحًا لقسم: ' : 'No clear heading for: ') + nm);
    }
    if (!email || !phone) issues.push(L ? 'تأكّد من وجود بريد إلكتروني ورقم هاتف واضحين.' : 'Make sure a clear email address and phone number are included.');
    if (bullets.length && quant.length / bullets.length < 0.3) issues.push(L ? `${quant.length} فقط من ${bullets.length} نقطة فيها أرقام. أصحاب العمل يبحثون عن نتائج قابلة للقياس.` : `Only ${quant.length} of ${bullets.length} bullet points contain numbers. Employers look for measurable results.`);
    else if (bullets.length) good.push(L ? `${quant.length} من ${bullets.length} نقطة فيها أرقام ونتائج.` : `${quant.length} of ${bullets.length} bullets include numbers.`);
    const p = S.profile || {};
    if ((p.skills || []).length < 6) issues.push(L ? 'عدد المهارات التي تعرّفت عليها قليل. أضف قسم مهارات بالمصطلحات المستخدمة في الإعلانات.' : 'Few recognisable skills. Add a skills section using the terms adverts use.');
    if (p.years == null) issues.push(L ? 'لم أستطع حساب سنوات الخبرة: اكتب التواريخ بصيغة واضحة (مثل 03/2021 – الآن).' : 'I couldn’t compute your years of experience: write dates clearly (e.g. 03/2021 – Present).');
    let html = L ? '<h4>ما هو جيد</h4>' : '<h4>What works</h4>'; html += fmtList(good.map(esc));
    html += L ? '<h4>ما يحتاج تحسينًا</h4>' : '<h4>What to improve</h4>'; html += fmtList(issues.map(esc));
    if (weak.length) {
      html += L ? '<h4>صياغات ضعيفة واقتراح أقوى</h4>' : '<h4>Weak wording and a stronger version</h4>';
      html += fmtList(weak.map(w => { const core = w.replace(weakRe, '').replace(/^[•\-*▪●\s]+/, '').trim(); const a = isAr(core); return `<i>${esc(w.replace(/^[•\-*▪●\s]+/, ''))}</i><br>→ <span dir="${a ? 'rtl' : 'ltr'}">${a ? 'نفّذتُ' : 'Delivered'} ${esc(core)}${a ? '، مما أدى إلى [أضف النتيجة بالأرقام]' : ', resulting in [add the measurable result]'}</span>`; }));
      html += `<p class="note">${L ? 'لم أضف أرقامًا من عندي: ضع النتيجة الحقيقية مكان الأقواس.' : 'I did not invent numbers: replace the brackets with your real result.'}</p>`;
    }
    html += L ? '<h4>توافق ATS (أنظمة فرز السير)</h4>' + fmtList(['استخدم عناوين أقسام عادية (الخبرة، التعليم، المهارات).', 'تجنّب الجداول والصور والأعمدة المتعددة في النسخة المرسلة.', 'استخدم نفس كلمات الإعلان للمهارات التي تملكها فعلًا.', 'احفظ الملف بصيغة PDF نصّي أو DOCX، وليس صورة ممسوحة.']) :
      '<h4>ATS compatibility</h4>' + fmtList(['Use standard headings (Experience, Education, Skills).', 'Avoid tables, images and multi-column layouts in the version you send.', 'Use the advert’s wording for skills you genuinely have.', 'Send a text-based PDF or DOCX, not a scanned image.']);
    const top = findJobs({ limit: 1 })[0];
    if (top) {
      const miss = (top.m.missing || []).filter(z => z.k === 'skill').map(z => z.v);
      tags.push('jobs');
      html += (L ? `<h4>تخصيص السيرة لوظيفة حقيقية</h4><p>لأقرب وظيفة لك في CVEEEZ: </p>` : `<h4>Tailoring to a real job</h4><p>For your closest match in CVEEEZ:</p>`) + jobCard(top);
      if (miss.length) html += `<p>${L ? 'إن كانت لديك فعلًا خبرة في' : 'If you genuinely have experience with'} <b>${esc(miss.join(', '))}</b>${L ? '، اذكرها صراحة في السيرة. إن لم تكن لديك، لا تضفها.' : ', mention it explicitly. If you don’t, leave it out.'}</p>`;
    }
    return { html, tags, speak: L ? `راجعت سيرتك. وجدت ${good.length} نقاط جيدة و${issues.length} نقاط للتحسين. التفاصيل على الشاشة.` : `I reviewed your CV: ${good.length} strengths and ${issues.length} things to improve. Details are on screen.` };
  }

  // ------------------------------------------------------------------ interview simulator (guided)
  const QB = {
    hr: { en: ['Tell me about yourself and your career so far.', 'Why are you interested in this role?', 'What is your biggest professional strength? Give me an example.', 'Tell me about a time you faced a conflict at work. What did you do?', 'Where do you see yourself in three years?', 'What are your salary expectations?'],
      ar: ['عرّفني بنفسك وبمسيرتك المهنية حتى الآن.', 'لماذا تهتم بهذه الوظيفة؟', 'ما أكبر نقطة قوة مهنية لديك؟ أعطني مثالًا.', 'حدّثني عن موقف واجهت فيه خلافًا في العمل. ماذا فعلت؟', 'أين ترى نفسك بعد ثلاث سنوات؟', 'ما توقعاتك للراتب؟'] },
    entry: { en: ['Tell me about yourself.', 'Tell me about a university or personal project you are proud of.', 'How do you handle learning something completely new?', 'Describe a time you worked in a team. What was your role?', 'Why should we hire you without previous experience?'],
      ar: ['عرّفني بنفسك.', 'حدّثني عن مشروع جامعي أو شخصي تفتخر به.', 'كيف تتعامل مع تعلّم شيء جديد تمامًا؟', 'صف موقفًا عملت فيه ضمن فريق. ما كان دورك؟', 'لماذا نوظّفك رغم عدم وجود خبرة سابقة؟'] },
    senior: { en: ['Walk me through your most significant achievement in the last few years.', 'Tell me about a strategic decision you made that did not go as planned.', 'How do you influence senior stakeholders who disagree with you?', 'How have you developed people in your team?', 'What would you change in your first 90 days here?'],
      ar: ['حدّثني عن أهم إنجاز حققته في السنوات الأخيرة.', 'حدّثني عن قرار استراتيجي اتخذته ولم يسر كما خططت.', 'كيف تؤثّر على الإدارة العليا عندما تختلف معك؟', 'كيف طوّرت أفراد فريقك؟', 'ماذا ستغيّر في أول 90 يومًا هنا؟'] },
    management: { en: ['How would you describe your management style?', 'Tell me about a time you had to deal with an under-performing team member.', 'How do you set priorities when everything is urgent?', 'Describe how you led a team through a major change.', 'How do you measure your team\'s success?'],
      ar: ['كيف تصف أسلوبك في الإدارة؟', 'حدّثني عن موقف تعاملت فيه مع موظف أداؤه ضعيف.', 'كيف تحدد الأولويات عندما يكون كل شيء عاجلًا؟', 'صف كيف قدت فريقك خلال تغيير كبير.', 'كيف تقيس نجاح فريقك؟'] }
  };
  function techQuestions() {
    const sk = ((S.profile || {}).skills || []).slice(0, 4);
    if (!sk.length) return AR() ? ['اشرح لي مشكلة تقنية صعبة حللتها مؤخرًا، خطوة بخطوة.', 'ما الأدوات التي تستخدمها يوميًا، ولماذا؟', 'كيف تتأكد من جودة عملك قبل تسليمه؟'] : ['Walk me through a difficult technical problem you solved recently, step by step.', 'Which tools do you use daily, and why?', 'How do you check the quality of your work before delivering it?'];
    return sk.map(s => AR() ? `ذكرت «${s}» في سيرتك. أعطني مثالًا عمليًا استخدمته فيه، وما النتيجة؟` : `Your CV mentions ${s}. Give me a concrete example of how you used it, and the result.`).concat(AR() ? ['كيف تتعامل مع خطأ اكتشفته بعد التسليم؟'] : ['How do you handle a mistake you discover after delivery?']);
  }
  function jdQuestions(job) {
    const req = (job.req || []).slice(0, 4).map(C.skillName);
    const q = AR() ? [`لماذا تتقدم لوظيفة ${job.title} في ${job.company}؟`] : [`Why are you applying for ${job.title} at ${job.company}?`];
    req.forEach(s => q.push(AR() ? `هذه الوظيفة تطلب «${s}». حدّثني عن خبرتك فيها.` : `This role requires ${s}. Tell me about your experience with it.`));
    if (job.years) q.push(AR() ? `الوظيفة تطلب ${job.years}+ سنوات خبرة. كيف تغطي خبرتك هذا المتطلب؟` : `The role asks for ${job.years}+ years. How does your experience cover that?`);
    return q;
  }
  const ROLES = { hr: ['HR Manager', 'مديرة الموارد البشرية'], tech: ['Technical Interviewer', 'المقيّم التقني'], management: ['Hiring Manager', 'مدير التوظيف'], entry: ['Recruitment Manager', 'مسؤولة التوظيف'], senior: ['Department Head', 'رئيس القسم'], job: ['Hiring Manager', 'مدير التوظيف'] };
  function startInterview(kind) {
    let qs, job = null;
    if (kind === 'tech') qs = techQuestions();
    else if (kind === 'job') { job = (findJobs({ limit: 1 })[0] || {}).j; qs = job ? jdQuestions(job) : QB.hr[S.lang]; }
    else qs = (QB[kind] || QB.hr)[S.lang];
    S.flow = { type: 'interview', kind, qs, i: 0, follow: false, scores: [], notes: [], job: job ? { title: job.title, company: job.company, url: job.url } : null, startedAt: Date.now() };
    const role = ROLES[kind][AR() ? 1 : 0];
    const intro = AR() ? `<p><b>${esc(role)}:</b> أهلًا بك، شكرًا لحضورك${job ? ` مقابلة وظيفة <span dir="ltr">${esc(job.title)}</span> في <span dir="ltr">${esc(job.company)}</span>` : ''}. ستكون المقابلة ${qs.length} أسئلة تقريبًا، وسأعطيك ملاحظات بعد كل إجابة. لنبدأ.</p>` :
      `<p><b>${esc(role)}:</b> Hello, thanks for coming in${job ? ` to interview for ${esc(job.title)} at ${esc(job.company)}` : ''}. We’ll go through about ${qs.length} questions and I’ll give you feedback after each answer. Let’s begin.</p>`;
    const tags = ['guided']; if (job) tags.push('jobs'); if (S.profile) tags.push('profile');
    return { html: intro + (job ? jobCard({ j: S.jobs.find(x => x.url === job.url) }) : '') + `<p><b>${AR() ? 'السؤال 1' : 'Question 1'}:</b> ${esc(qs[0])}</p>`, tags, speak: (AR() ? 'أهلًا بك. ' : 'Hello. ') + qs[0] };
  }
  function assessAnswer(ans, q, secs) {
    const w = ans.split(/\s+/).filter(Boolean); const n = w.length; const L = AR();
    const star = { s: /situation|when i was|at my (last|previous)|في (شركتي|عملي)|كنت أعمل|عندما/i.test(ans), a: /\bi (did|led|built|created|decided|organised|organized|implemented|managed|proposed)\b|قمت|بادرت|قررت|نفذت|أعددت|قدت/i.test(ans), r: /result|as a result|which led|increased|reduced|saved|improved|نتيجة|أدى|زاد|خفض|وفر|حسن/i.test(ans) };
    const nums = /\d/.test(ans); const fillers = (ans.match(/\b(um+|uh+|like|you know|basically|actually)\b|يعني|اممم|يعني يعني/gi) || []).length;
    let score = 3; const good = [], bad = [];
    if (n < (isAr(ans) ? 16 : 25)) { score -= 1.5; bad.push(L ? 'الإجابة قصيرة جدًا؛ أضف مثالًا محددًا.' : 'Too short — add a specific example.'); } else if (n > 260) { score -= .5; bad.push(L ? 'الإجابة طويلة؛ اختصر إلى دقيقة أو دقيقتين.' : 'Too long — keep it to one or two minutes.'); } else good.push(L ? 'طول مناسب.' : 'Good length.');
    if (star.a) { score += .5; good.push(L ? 'وضّحت ما قمت به أنت شخصيًا.' : 'You explained what you personally did.'); } else bad.push(L ? 'وضّح دورك أنت: «قمتُ بـ…».' : 'Make your own role clear: “I did…”.');
    if (star.r || nums) { score += .7; good.push(L ? 'ذكرت نتيجة' + (nums ? ' بأرقام' : '') + '.' : 'You mentioned a result' + (nums ? ' with numbers' : '') + '.'); } else bad.push(L ? 'لم تذكر النتيجة. ما الذي تغيّر بسبب عملك؟ (بالأرقام إن أمكن)' : 'No result mentioned. What changed because of your work? (numbers if possible)');
    if (star.s) { score += .3; } if (fillers >= 3) { score -= .4; bad.push(L ? `كلمات حشو كثيرة (${fillers}).` : `Many filler words (${fillers}).`); }
    let pace = null; if (secs && secs > 3) { pace = Math.round(n / (secs / 60)); if (pace > 190) bad.push(L ? `تتحدث بسرعة (${pace} كلمة/دقيقة). تمهّل قليلًا.` : `You spoke fast (${pace} wpm). Slow down a little.`); else if (pace < 90) bad.push(L ? `الإيقاع بطيء (${pace} كلمة/دقيقة).` : `Slow pace (${pace} wpm).`); else good.push(L ? `إيقاع واضح (${pace} كلمة/دقيقة).` : `Clear pace (${pace} wpm).`); }
    score = Math.max(1, Math.min(5, Math.round(score * 2) / 2));
    return { score, good, bad, needResult: !(star.r || nums) && n >= 15 };
  }
  function interviewTurn(ans, secs) {
    const f = S.flow, L = AR(), q = f.qs[f.i];
    const a = assessAnswer(ans, q, secs);
    const role = ROLES[f.kind][L ? 1 : 0];
    let html = `<h4>${L ? 'ملاحظات على إجابتك' : 'Feedback on your answer'} — ${a.score}/5</h4>`;
    if (a.good.length) html += fmtList(a.good.map(x => '✓ ' + esc(x)));
    if (a.bad.length) html += fmtList(a.bad.map(x => '• ' + esc(x)));
    if (a.bad.length) html += `<p class="note">${L ? 'إجابة أقوى تتبع STAR: الموقف ← المهمة ← ما قمت به أنت ← النتيجة (بالأرقام). استخدم أمثلتك الحقيقية فقط.' : 'A stronger answer follows STAR: Situation → Task → what YOU did → Result (with numbers). Use only your real examples.'}</p>`;
    let speak;
    if (a.needResult && !f.follow) {
      f.follow = true; const fq = L ? 'سؤال متابعة: وما النتيجة التي حققتها تحديدًا؟ هل يمكنك قياسها؟' : 'Follow-up: what was the specific outcome? Can you quantify it?';
      html += `<p><b>${esc(role)}:</b> ${esc(fq)}</p>`; speak = fq; f.scores.push(a.score); f.notes.push(a);
      return { html, tags: ['guided'], speak };
    }
    f.follow = false; f.scores.push(a.score); f.notes.push(a); f.i++;
    if (f.i < f.qs.length) { html += `<p><b>${L ? 'السؤال' : 'Question'} ${f.i + 1}:</b> ${esc(f.qs[f.i])}</p>`; speak = f.qs[f.i]; }
    else { html += finishInterview(); speak = L ? 'انتهت المقابلة. التقييم النهائي على الشاشة.' : 'The interview is over. Your final assessment is on screen.'; }
    return { html, tags: ['guided'], speak };
  }
  function finishInterview() {
    const f = S.flow, L = AR(); if (!f || f.type !== 'interview') return '';
    const avg = f.scores.length ? Math.round(f.scores.reduce((x, y) => x + y, 0) / f.scores.length * 10) / 10 : 0;
    const cnt = {}; f.notes.forEach(n => n.bad.forEach(b => { const k = b.split(/[(.؛:]/)[0]; cnt[k] = (cnt[k] || 0) + 1; }));
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    S.flow = null;
    return `<h4>${L ? 'التقييم النهائي' : 'Final assessment'}: ${avg}/5</h4>` + `<p>${L ? `أجبت عن ${f.scores.length} أسئلة (مع المتابعة).` : `You answered ${f.scores.length} questions (including follow-ups).`}</p>` +
      (top.length ? `<p><b>${L ? 'أهم ما تحسّنه:' : 'Main things to improve:'}</b></p>` + fmtList(top.map(esc)) : `<p>${L ? 'أداء متوازن. تابع التدرّب على أسئلة أصعب.' : 'Balanced performance. Keep practising harder questions.'}</p>`) +
      `<p class="note">${L ? 'التقييم آلي ومبني على بنية الإجابة (الطول، دورك، النتيجة، الإيقاع)، وليس على صحة المحتوى.' : 'This automatic assessment looks at answer structure (length, your role, result, pace), not whether the content is correct.'}</p>`;
  }
  function interviewMenu() {
    const o = AR() ? [['hr', 'مقابلة موارد بشرية عامة'], ['tech', 'مقابلة تقنية (من مهاراتك)'], ['management', 'مقابلة إدارية'], ['entry', 'مستوى مبتدئ'], ['senior', 'مستوى خبير'], ['job', 'حسب وظيفة حقيقية تناسبك']] :
      [['hr', 'General HR interview'], ['tech', 'Technical (from your skills)'], ['management', 'Management interview'], ['entry', 'Entry level'], ['senior', 'Senior level'], ['job', 'Based on a real job that fits you']];
    return { html: `<p>${AR() ? 'اختر نوع المقابلة. أنت المرشّح، وأنا ألعب دور المقابِل. أجب كتابةً أو بالصوت.' : 'Choose the interview type. You are the candidate; I play the interviewer. Answer by text or voice.'}</p>` + `<div class="chips">${o.map(([k, l]) => `<button class="sbtn" data-iv="${k}" type="button">${esc(l)}</button>`).join('')}</div>`, tags: ['guided'] };
  }

  // ------------------------------------------------------------------ difficult conversation simulator (guided)
  const SCEN = {
    salary: { en: ['Salary negotiation', 'Hiring Manager', 'We’re happy to offer you the role. The salary we have budgeted is at the lower end of the band. What do you think?'], ar: ['تفاوض على الراتب', 'مدير التوظيف', 'يسعدنا أن نقدّم لك الوظيفة. الراتب المخصص في الحد الأدنى من النطاق. ما رأيك؟'] },
    manager: { en: ['Discussion with your manager', 'Your Manager', 'You asked to see me. I only have ten minutes — what’s this about?'], ar: ['نقاش مع مديرك', 'مديرك', 'طلبت مقابلتي. عندي عشر دقائق فقط — ما الموضوع؟'] },
    review: { en: ['Performance evaluation', 'Your Manager', 'Let’s review your year. Overall I think you met expectations, but there were some delays on key deliverables.'], ar: ['تقييم الأداء', 'مديرك', 'لنراجع سنتك. بشكل عام أعتقد أنك حققت المتوقع، لكن كانت هناك تأخيرات في بعض المهام المهمة.'] },
    leave: { en: ['Resigning from your job', 'Your Manager', 'You wanted to talk privately?'], ar: ['الاستقالة من وظيفتك', 'مديرك', 'أردت أن نتحدث على انفراد؟'] },
    colleague: { en: ['Disagreement with a colleague', 'Your Colleague', 'Honestly, I think your part of the project is slowing everyone down.'], ar: ['خلاف مع زميل', 'زميلك', 'بصراحة، أشعر أن الجزء الخاص بك من المشروع يؤخّر الجميع.'] },
    client: { en: ['Difficult client', 'Client', 'This is the second delay this month. Why should we keep working with you?'], ar: ['عميل صعب', 'العميل', 'هذا ثاني تأخير هذا الشهر. لماذا نستمر في العمل معكم؟'] }
  };
  function talkMenu() {
    return { html: `<p>${AR() ? 'اختر الموقف. سألعب دور الطرف الآخر، وبعد 4 ردود (أو عندما تكتب «إنهاء») أعطيك تقييمًا.' : 'Pick a situation. I’ll play the other person; after 4 replies (or when you type “end”) you get feedback.'}</p><div class="chips">${Object.entries(SCEN).map(([k, v]) => `<button class="sbtn" data-sc="${k}" type="button">${esc(v[S.lang][0])}</button>`).join('')}</div>`, tags: ['guided'] };
  }
  function startTalk(k) {
    const s = SCEN[k][S.lang]; S.flow = { type: 'talk', k, turn: 0, signals: { ask: 0, calm: 0, evidence: 0, number: 0, concede: 0, aggressive: 0, i: 0 }, offer: null };
    return { html: `<p><b>${esc(s[0])}</b></p><p><b>${esc(s[1])}:</b> ${esc(s[2])}</p>`, tags: ['guided'], speak: s[2] };
  }
  function talkTurn(text) {
    const f = S.flow, L = AR(), sc = f.k, who = SCEN[sc][S.lang][1];
    if (/^(end|stop|finish)\b|إنهاء|انهاء|خلص|انتهى/i.test(text.trim())) return { html: finishTalk(), tags: ['guided'] };
    const sg = f.signals; const num = text.match(/(\d[\d,.]*)\s*(k|ألف|الف)?/i);
    if (/\?|؟/.test(text)) sg.ask++; if (/understand|appreciate|thank|i see|أفهم|أقدّر|شكرا|شكرًا|معك حق/i.test(text)) sg.calm++;
    if (/market|experience|achiev|result|data|deliver|value|السوق|خبرتي|إنجاز|نتائج|حققت|قيمة/i.test(text)) sg.evidence++;
    if (num) sg.number++; if (/fine|ok|accept|agree|okay|موافق|حسنا|حسنًا|ماشي|أقبل/i.test(text)) sg.concede++;
    if (/ridiculous|unfair|always|never|you people|غير عادل|سخيف|دائما|أبدا|مش معقول/i.test(text)) sg.aggressive++;
    f.turn++;
    let reply;
    const R = (en, ar) => L ? ar : en;
    if (sc === 'salary') {
      if (num && !f.offer) { f.offer = num[1]; reply = sg.evidence ? R(`I see you’ve thought about it. ${f.offer} is above our budget, but given your experience I could move part of the way. Would a smaller increase plus a review after six months work?`, `أرى أنك فكرت في الأمر. ${f.offer} أعلى من الميزانية، لكن بالنظر إلى خبرتك يمكنني التحرك جزئيًا. هل تناسبك زيادة أقل مع مراجعة بعد ستة أشهر؟`) : R(`${f.offer} is quite high for us. What makes you worth that figure?`, `${f.offer} رقم مرتفع بالنسبة لنا. ما الذي يجعلك تستحقه؟`); }
      else if (sg.concede && f.turn === 1) reply = R('Great, then we’ll send the contract today.', 'ممتاز، سنرسل العقد اليوم إذن.');
      else if (sg.evidence) reply = R('That’s a fair point. Apart from salary, is there anything else that matters to you — allowances, leave, training?', 'نقطة منطقية. غير الراتب، هل يهمك شيء آخر — بدلات، إجازات، تدريب؟');
      else if (sg.aggressive) reply = R('I understand you’re disappointed, but let’s keep this constructive.', 'أتفهم أنك محبط، لكن لنحافظ على نقاش بنّاء.');
      else reply = R('Can you be more specific about what you’re expecting?', 'هل يمكن أن تكون أكثر تحديدًا بخصوص ما تتوقعه؟');
    } else if (sc === 'leave') {
      reply = f.turn === 1 ? R('I’m surprised. Is this about salary? Maybe we can discuss a counter-offer.', 'أنا متفاجئ. هل الموضوع متعلق بالراتب؟ ربما نناقش عرضًا مقابلًا.') : f.turn === 2 ? R('When would your last day be, and how will you hand over your work?', 'متى سيكون آخر يوم لك، وكيف ستسلّم مهامك؟') : R('Thank you for being open about it. I’ll inform HR.', 'شكرًا لصراحتك. سأبلغ الموارد البشرية.');
    } else if (sc === 'review') {
      reply = sg.evidence ? R('Thanks for the context. What would you need from me to avoid delays next year?', 'شكرًا على التوضيح. ماذا تحتاج مني لتجنّب التأخير العام القادم؟') : sg.aggressive ? R('I’m not attacking you — I want to understand what happened.', 'أنا لا أهاجمك — أريد أن أفهم ما حدث.') : R('Can you walk me through what caused the delays?', 'هل يمكن أن توضّح لي أسباب التأخير؟');
    } else if (sc === 'colleague') {
      reply = sg.calm || sg.ask ? R('Okay… fair. Maybe we should agree on deadlines together.', 'حسنًا… معك حق. ربما نتفق على المواعيد معًا.') : R('I’m just saying what everyone thinks.', 'أنا أقول فقط ما يفكر فيه الجميع.');
    } else if (sc === 'client') {
      reply = sg.evidence || sg.calm ? R('Alright. What exactly will be different next time, and when?', 'حسنًا. ما الذي سيتغيّر بالتحديد المرة القادمة، ومتى؟') : R('That doesn’t answer my question.', 'هذا لا يجيب عن سؤالي.');
    } else {
      reply = sg.ask || sg.evidence ? R('Okay, that makes sense. What do you propose?', 'حسنًا، منطقي. ماذا تقترح؟') : R('I still don’t see what you need from me.', 'ما زلت لا أفهم ماذا تحتاج مني.');
    }
    let html = `<p><b>${esc(who)}:</b> ${esc(reply)}</p>`;
    if (f.turn >= 4) html += finishTalk();
    return { html, tags: ['guided'], speak: reply };
  }
  function finishTalk() {
    const f = S.flow, L = AR(); if (!f || f.type !== 'talk') return ''; const s = f.signals; S.flow = null;
    const good = [], imp = [];
    (s.calm ? good : imp).push(L ? 'نبرة هادئة واعتراف بوجهة نظر الطرف الآخر' : 'Calm tone and acknowledging the other side');
    (s.evidence ? good : imp).push(L ? 'دعم موقفك بحقائق (خبرة، نتائج، السوق)' : 'Backing your position with facts (experience, results, market)');
    (s.ask ? good : imp).push(L ? 'طرح أسئلة لفهم الطرف الآخر' : 'Asking questions to understand the other side');
    if (f.k === 'salary') (s.number ? good : imp).push(L ? 'ذكر رقم محدد ومبرّر' : 'Stating a specific, justified number');
    if (s.aggressive) imp.push(L ? 'تجنّب العبارات الحادة («غير عادل»، «دائمًا»)' : 'Avoid sharp phrases (“unfair”, “always”)');
    if (f.k === 'salary' && s.concede && !s.number) imp.push(L ? 'وافقت بسرعة دون تفاوض' : 'You accepted quickly without negotiating');
    return `<h4>${L ? 'تقييم المحادثة' : 'Conversation feedback'}</h4><p><b>${L ? 'ما أحسنت فيه' : 'What went well'}</b></p>${fmtList(good.map(esc))}<p><b>${L ? 'ما تحسّنه' : 'What to improve'}</b></p>${fmtList(imp.map(esc))}`;
  }

  // ------------------------------------------------------------------ AI engines (on-device)
  const MODELS = { small: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', big: 'Qwen2.5-3B-Instruct-q4f16_1-MLC' };
  async function loadWebLLM(size) {
    if (!navigator.gpu) { S.web = { error: t('eNoGpu') }; renderEngine(); return; }
    S.web = { loading: true, p: 0, text: '' }; renderEngine();
    try {
      const webllm = await import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm');
      const engine = await webllm.CreateMLCEngine(MODELS[size], { initProgressCallback: r => { S.web.p = r.progress || 0; S.web.text = r.text || ''; renderEngine(); } });
      S.web = { engine, model: MODELS[size] }; S.engine = 'webllm'; renderEngine();
    } catch (e) { S.web = { error: t('eFail') + (e && e.message ? e.message.slice(0, 160) : e) }; renderEngine(); }
  }
  async function checkChrome() {
    try {
      if (!('LanguageModel' in window)) { S.chrome = { error: t('eNoChrome') }; return; }
      const a = await window.LanguageModel.availability({ expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] });
      S.chrome = a === 'unavailable' ? { error: t('eNoChrome') } : { avail: a };
    } catch (e) { S.chrome = { error: t('eNoChrome') }; }
  }
  function systemPrompt() {
    const p = S.profile; const L = AR();
    const modeTxt = {
      coach: 'You are CVEEEZ AI, a practical personal career coach for job seekers in the Arab world.',
      interview: 'You are running a realistic mock job interview. Play the interviewer. Ask ONE question at a time, wait for the answer, give brief feedback (strengths, gaps, a stronger STAR structure) and then ask the next or a follow-up question.',
      cv: 'You are a CV expert. Review the CV text provided. Point out weak wording, missing information, structure and ATS issues. Suggest stronger statements but NEVER invent facts, numbers or qualifications; use [placeholders] for numbers the user must fill.',
      jobs: 'You help the user find jobs. You may ONLY mention jobs from the JOB LIST below; never invent jobs, employers or links.',
      skills: 'You are a skills coach. Identify skill gaps for the user\'s target role using the JOB LIST requirements below, and give a concrete learning plan. Do not recommend specific CVEEEZ Academy courses (not connected).',
      talk: 'You role-play the other person in a difficult professional conversation the user chooses (salary negotiation, manager, resignation, colleague, client). Stay in character; when the user writes "end", give feedback on their approach.'
    }[S.mode];
    let s = modeTxt + ' Be concise and specific. Never guarantee employment or that a vacancy is still open. Match scores are estimates, not hiring probabilities.\n';
    s += L ? 'Reply in Arabic (simple Modern Standard Arabic), unless the user asks for English (e.g. to prepare an English CV or interview).\n' : 'Reply in English unless the user writes in Arabic.\n';
    if (p) s += `\nUSER PROFILE (from their CV): title: ${p.currentTitle || 'unknown'}; years: ${p.years != null ? p.years : 'unknown'}; skills: ${(p.skills || []).slice(0, 15).join(', ')}; education: ${(p.education || [])[0] || 'unknown'}; certifications: ${(p.certifications || []).join(', ') || 'none listed'}.\n`;
    if (S.ctx.target) s += `Target role discussed earlier: ${S.ctx.target}.\n`;
    if (S.mode === 'cv' && S.cvText) s += '\nCV TEXT:\n' + S.cvText.slice(0, 3500) + '\n';
    if (['jobs', 'skills', 'coach', 'interview'].includes(S.mode)) {
      const js = findJobs({ limit: 5 });
      if (js.length) s += '\nJOB LIST (real CVEEEZ jobs):\n' + js.map((x, i) => `${i + 1}. ${x.j.title} — ${x.j.company} — ${x.j.location} — requires: ${(x.j.req || []).slice(0, 8).map(C.skillName).join(', ')} — estimated match ${x.m.score}%`).join('\n') + '\n';
    }
    return s;
  }
  function historyForAI() {
    return S.msgs.slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.role === 'user' ? m.text : (m.plain || stripHtml(m.html)).slice(0, 1200) }));
  }
  const stripHtml = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent || ''; };
  async function aiReply(onToken) {
    const msgs = [{ role: 'system', content: systemPrompt() }].concat(historyForAI());
    if (S.engine === 'webllm' && S.web && S.web.engine) {
      const it = await S.web.engine.chat.completions.create({ messages: msgs, stream: true, temperature: 0.6, max_tokens: 600 });
      let out = ''; for await (const ch of it) { const d = ch.choices[0] && ch.choices[0].delta && ch.choices[0].delta.content; if (d) { out += d; onToken(out); } }
      return out;
    }
    if (S.engine === 'chrome') {
      const ses = await window.LanguageModel.create({ initialPrompts: msgs.slice(0, -1).map(m => ({ role: m.role, content: m.content })) });
      let out = ''; const stream = ses.promptStreaming(msgs[msgs.length - 1].content);
      for await (const ch of stream) { out = ch.startsWith(out) ? ch : out + ch; onToken(out); }
      return out;
    }
    throw new Error('no engine');
  }
  const mdToHtml = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#+\s*(.+)$/gm, '<h4>$1</h4>').replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');

  // ------------------------------------------------------------------ dispatcher
  function guidedReply(text, secs) {
    if (S.flow && S.flow.type === 'interview') return interviewTurn(text, secs);
    if (S.flow && S.flow.type === 'talk') return talkTurn(text);
    const m = S.mode;
    if (m === 'interview') { const k = /tech|تقني/i.test(text) ? 'tech' : /manag|إدار/i.test(text) ? 'management' : /entry|مبتدئ|خريج/i.test(text) ? 'entry' : /senior|خبير/i.test(text) ? 'senior' : /job|وظيفة/i.test(text) ? 'job' : /hr|موارد/i.test(text) ? 'hr' : null; return k ? startInterview(k) : interviewMenu(); }
    if (m === 'talk') { const k = /salary|راتب/i.test(text) ? 'salary' : /resign|leav|استقال/i.test(text) ? 'leave' : /review|evaluat|تقييم/i.test(text) ? 'review' : /colleague|زميل/i.test(text) ? 'colleague' : /client|customer|عميل/i.test(text) ? 'client' : /manager|مدير/i.test(text) ? 'manager' : null; return k ? startTalk(k) : talkMenu(); }
    if (m === 'cv') return guidedCV(text);
    if (m === 'jobs') return guidedJobs(text);
    if (m === 'skills') return guidedSkills(text);
    return guidedCoach(text);
  }
  async function handle(text, via, secs) {
    text = String(text || '').trim(); if (!text || S.busy) return;
    if (isAr(text) && S.lang !== 'ar' && !S.flow) { /* keep UI language; AI prompt handles reply language */ }
    S.msgs.push({ role: 'user', text, via }); renderLog(); persist();
    S.busy = true;
    let reply;
    const flowActive = !!S.flow;
    const extracted = extractTarget(text); if (extracted && S.mode !== 'talk' && S.mode !== 'interview') S.ctx.target = extracted;
    if (S.engine !== 'guided' && !flowActive) {
      const m = { role: 'bot', html: '<p>…</p>', tags: ['ai'] }; if (S.profile) m.tags.push('profile'); S.msgs.push(m); renderLog();
      try {
        const out = await aiReply(s => { m.html = mdToHtml(s); renderLog(true); });
        m.plain = out; m.html = mdToHtml(out);
        if (['jobs', 'skills'].includes(S.mode) || /\bjobs?\b|وظائف/i.test(text)) { const js = findJobs({ countries: countriesIn(text), limit: 3 }); if (js.length) { m.html += `<h4>${AR() ? 'وظائف حقيقية من CVEEEZ' : 'Real CVEEEZ jobs'}</h4>` + js.map(jobCard).join(''); m.tags.push('jobs'); } }
        reply = { speak: out };
      } catch (e) { S.msgs.pop(); const r = guidedReply(text, secs); S.msgs.push({ role: 'bot', html: r.html + `<p class="note">${esc(AR() ? 'تعذّر تشغيل نموذج الذكاء الاصطناعي، فاستخدمت الوضع الموجّه.' : 'The AI model failed, so guided mode answered.')}</p>`, tags: r.tags }); reply = r; }
    } else {
      const r = guidedReply(text, secs); S.msgs.push({ role: 'bot', html: r.html, tags: r.tags }); reply = r;
    }
    S.busy = false; renderLog(); persist(); renderQuick();
    if (S.speak || via === 'voice') say(reply.speak || stripHtml(S.msgs[S.msgs.length - 1].html).slice(0, 400), via === 'voice');
  }

  // ------------------------------------------------------------------ voice (browser-native)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, listening = false, recStart = 0, handsFree = false;
  function setV(s) { $('#vstate').textContent = s || ''; }
  function listen() {
    if (!SR) { setV(t('noMic')); return; }
    if (window.speechSynthesis && speechSynthesis.speaking) speechSynthesis.cancel();   // interruption
    if (listening) { rec && rec.stop(); return; }
    rec = new SR(); rec.lang = S.lang === 'ar' ? 'ar-SA' : 'en-US'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    let finalText = ''; recStart = Date.now();
    rec.onstart = () => { listening = true; $('#mic').classList.add('live'); setV(t('listening')); };
    rec.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; } $('#input').value = (finalText + interim).trim(); };
    rec.onerror = e => { setV(e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture' ? t('micDenied') : (e.error === 'no-speech' ? '' : e.error)); };
    rec.onend = () => { listening = false; $('#mic').classList.remove('live'); setV(''); const txt = $('#input').value.trim(); if (txt) { $('#input').value = ''; handsFree = true; handle(txt, 'voice', (Date.now() - recStart) / 1000); } };
    try { rec.start(); } catch (e) { setV(String(e.message || e)); }
  }
  function pickVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || []; const want = S.lang === 'ar' ? /^ar/i : /^en/i;
    return vs.find(v => want.test(v.lang) && /google|natural|online/i.test(v.name)) || vs.find(v => want.test(v.lang)) || null;
  }
  function say(text, thenListen) {
    if (!window.speechSynthesis || !text) return;
    speechSynthesis.cancel();
    const vs = speechSynthesis.getVoices(); if (vs.length && !pickVoice()) { setV(t('noVoice')); return; }
    const u = new SpeechSynthesisUtterance(String(text).replace(/[*#_`]/g, '').slice(0, 900)); const v = pickVoice(); if (v) u.voice = v; u.lang = v ? v.lang : (S.lang === 'ar' ? 'ar-SA' : 'en-US'); u.rate = 1;
    u.onstart = () => setV(t('speaking')); u.onend = () => { setV(''); if (thenListen && handsFree && S.flow) setTimeout(listen, 350); };
    speechSynthesis.speak(u);
  }

  // ------------------------------------------------------------------ CV input (same engine as the job finder)
  const LIBS = { pdf: ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'], docx: ['https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'] };
  const loaded = {}; const loadScript = src => loaded[src] || (loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
  async function pdfText(buf) {
    for (const s of LIBS.pdf) await loadScript(s);
    const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = LIBS.pdf[0];
    const doc = await lib.getDocument({ data: buf, isEvalSupported: false }).promise; const out = [];
    for (let p = 1; p <= Math.min(doc.numPages, 12); p++) { const page = await doc.getPage(p); const tc = await page.getTextContent(); let line = '', lastY = null; for (const it of tc.items) { const y = it.transform ? Math.round(it.transform[5]) : lastY; if (lastY != null && y != null && Math.abs(y - lastY) > 2) { out.push(line); line = ''; } line += (line && !line.endsWith(' ') && it.str && !it.str.startsWith(' ') ? ' ' : '') + it.str; lastY = y; } out.push(line); }
    return out.join('\n');
  }
  async function docxText(buf) { for (const s of LIBS.docx) await loadScript(s); return (await window.mammoth.extractRawText({ arrayBuffer: buf })).value || ''; }
  function useCV(text, sample) {
    const p = C.parseCV(text); p.seniority = p.years != null ? C.seniorityFromYears(p.years) : (p.currentTitle ? C.seniorityFromTitle(p.currentTitle) : '');
    S.profile = p; S.cvText = text; S.sample = !!sample; store.set('profile', p); store.set('cvText', text); store.set('sample', !!sample);
    renderProfile();
    S.msgs.push({ role: 'bot', html: (AR() ? '<p>قرأت سيرتك الذاتية. هذا ما فهمته:</p>' : '<p>I read your CV. Here is what I understood:</p>') + profileSummaryHtml() + (AR() ? '<p>اختر ما تريد من القائمة، أو اسألني مباشرة.</p>' : '<p>Pick an option from the menu, or just ask me.</p>'), tags: ['profile'] });
    renderLog(); persist();
  }
  const SAMPLE = `Lina Haddad
Senior Accountant
Riyadh, Saudi Arabia | lina.haddad@example.com | +966 50 000 0000

Professional Summary
Chartered accountant with 8 years of experience in retail and fintech, specialising in IFRS reporting, month-end close and ERP implementations.

Experience
Senior Accountant - Gulf Retail Group, Riyadh
03/2021 - Present
• Responsible for month-end close for 14 entities
• Reduced close time from 9 to 5 working days by automating reconciliations in Excel and Power BI
• Led a team of 3 accountants
• Helped with the SAP ERP rollout

Accountant - FinPay, Amman
06/2016 - 02/2021
• Worked on VAT and tax filings
• Prepared IFRS financial statements and audit files
• Managed payments and supplier reconciliations

Education
Bachelor of Science in Accounting, University of Jordan, 2016

Certifications
ACCA, SOCPA

Skills
Accounting, IFRS, Audit, Tax, Excel, Power BI, SAP, ERP, Financial Analysis, Payments

Languages
Arabic, English`;

  // ------------------------------------------------------------------ rendering
  function renderStatic() {
    document.documentElement.lang = S.lang; document.documentElement.dir = AR() ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    $('#lang').textContent = AR() ? 'English' : 'العربية';
    $('#input').placeholder = t('placeholder');
    $('#voiceToggle').textContent = S.speak ? t('voiceOn') : t('voiceOff'); $('#voiceToggle').classList.toggle('on', S.speak); $('#voiceToggle').setAttribute('aria-pressed', String(S.speak));
    $('#modes').innerHTML = MODES.map(m => `<button class="mode ${S.mode === m ? 'on' : ''}" data-mode="${m}" type="button"><b>${esc(I[S.lang].modes[m][0])}</b><span>${esc(I[S.lang].modes[m][1])}</span></button>`).join('');
    $('#mtabs').innerHTML = MODES.map(m => `<button class="${S.mode === m ? 'on' : ''}" data-mode="${m}" type="button">${esc(I[S.lang].modes[m][0])}</button>`).join('');
    renderProfile(); renderEngine(); renderLog(); renderQuick();
  }
  function renderProfile() {
    const p = S.profile;
    $('#profileCard').innerHTML = (p ? `<div><b>${esc(p.name || '')}</b> ${S.sample ? `<span class="chip">${esc(t('sampleTag'))}</span>` : ''}</div><div class="note">${esc(t('title'))}: ${esc(p.currentTitle || '—')} · ${esc(t('years'))}: ${esc(p.years != null ? p.years : '—')}</div><div class="chips">${(p.skills || []).slice(0, 10).map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : `<p class="note">${esc(t('noProfile'))}</p>`) +
      `<div class="row"><button class="sbtn primary" id="up" type="button">${esc(t('upload'))}</button><button class="sbtn" id="pasteBtn" type="button">${esc(t('paste'))}</button><button class="sbtn" id="sampleBtn" type="button">${esc(t('sample'))}</button></div>` +
      `<div id="pasteBox" class="hide" style="margin-top:8px"><textarea class="paste" id="pasteText"></textarea><button class="sbtn primary" id="usePaste" type="button" style="margin-top:6px">${esc(t('usePaste'))}</button></div><div class="note" id="readState"></div>`;
  }
  function renderEngine() {
    const w = S.web || {}, c = S.chrome || {};
    $('#engineCard').innerHTML = `
      <label><input type="radio" name="eng" value="guided" ${S.engine === 'guided' ? 'checked' : ''}> <span>${esc(t('eGuided'))}<small>${esc(t('eGuidedD'))}</small></span></label>
      <label><input type="radio" name="eng" value="webllm" ${S.engine === 'webllm' ? 'checked' : ''} ${w.engine ? '' : 'disabled'}> <span>${esc(t('eWeb'))}<small>${esc(t('eWebD'))}</small>
        ${w.engine ? `<small style="color:var(--ok)">${esc(t('eReady'))} (${esc(w.model)})</small>` : w.loading ? `<div class="progress"><i style="width:${Math.round((w.p || 0) * 100)}%"></i></div><small>${esc((w.text || '').slice(0, 90))}</small>` : w.error ? `<small style="color:var(--warn)">${esc(w.error)}</small>` : `<span class="row"><button class="sbtn" data-load="small" type="button">${esc(t('eLoad'))}: ${esc(t('eSmall'))}</button><button class="sbtn" data-load="big" type="button">${esc(t('eBig'))}</button></span>`}</span></label>
      <label><input type="radio" name="eng" value="chrome" ${S.engine === 'chrome' ? 'checked' : ''} ${c.avail ? '' : 'disabled'}> <span>${esc(t('eChrome'))}<small>${esc(c.error || t('eChromeD'))}</small></span></label>`;
  }
  const TAGS = { ai: 'tagAI', guided: 'tagGuided', profile: 'tagProfile', jobs: 'tagJobs' };
  function renderLog(keepScroll) {
    const log = $('#log');
    if (!S.msgs.length) {
      log.innerHTML = `<div class="msg bot"><div class="meta"><span class="src guided">${esc(t('tagGuided'))}</span></div>${AR() ? '<p><b>أهلًا! أنا CVEEEZ AI، مدرّبك المهني.</b></p><p>اكتب أو تحدّث معي في نفس المحادثة — يمكنك التبديل بين الكتابة والصوت في أي وقت وسأتذكر ما قلته.</p>' : '<p><b>Hi! I’m CVEEEZ AI, your career coach.</b></p><p>Type or talk to me in the same conversation — switch between text and voice any time and I’ll remember what you said.</p>'}${S.profile ? '' : needProfile()}</div>`;
      return;
    }
    log.innerHTML = S.msgs.map(m => m.role === 'user' ? `<div class="msg user">${esc(m.text)}${m.via === 'voice' ? ` <span class="src voice">🎙 ${esc(t('tagVoice'))}</span>` : ''}</div>` :
      `<div class="msg bot"><div class="meta">${(m.tags || []).map(k => `<span class="src ${k}">${esc(t(TAGS[k] || k))}</span>`).join('')}</div>${m.html}</div>`).join('');
    log.scrollTop = log.scrollHeight;
  }
  const QUICK = {
    coach: { ar: ['ما نقاط قوتي؟', 'لدي 5 سنوات في المبيعات وأريد الانتقال إلى تطوير الأعمال', 'أنا خريج جديد وأبحث عن أول وظيفة'], en: ['What are my strengths?', 'I have five years of sales experience and want to move into business development', 'I am a fresh graduate looking for my first job'] },
    interview: { ar: ['مقابلة موارد بشرية', 'مقابلة تقنية', 'حسب وظيفة حقيقية'], en: ['HR interview', 'Technical interview', 'Based on a real job'] },
    cv: { ar: ['راجع سيرتي بالتفصيل'], en: ['Review my CV in detail'] },
    jobs: { ar: ['وظائف تناسبني في السعودية', 'وظائف في الإمارات', 'وظائف عن بعد'], en: ['Jobs that fit me in Saudi Arabia', 'Jobs in the UAE', 'Remote jobs'] },
    skills: { ar: ['ما المهارات التي تنقصني؟', 'أريد أن أصبح مدير مشاريع'], en: ['What skills am I missing?', 'I want to become a project manager'] },
    talk: { ar: ['تفاوض على الراتب', 'الاستقالة', 'تقييم الأداء'], en: ['Salary negotiation', 'Resigning', 'Performance review'] }
  };
  function renderQuick() {
    const q = S.flow ? [AR() ? 'إنهاء' : 'end'] : QUICK[S.mode][S.lang];
    $('#quick').innerHTML = q.map(x => `<button type="button" data-q="${esc(x)}">${esc(x)}</button>`).join('');
  }

  // ------------------------------------------------------------------ events
  document.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mode) { S.mode = b.dataset.mode; if (S.flow) S.flow = null; persist(); renderStatic(); $('#side').classList.remove('open'); if (['interview', 'talk', 'cv'].includes(S.mode)) { const r = S.mode === 'interview' ? interviewMenu() : S.mode === 'talk' ? talkMenu() : null; if (r) { S.msgs.push({ role: 'bot', html: r.html, tags: r.tags }); renderLog(); persist(); } } return; }
    if (b.dataset.q) { handle(b.dataset.q, 'text'); return; }
    if (b.dataset.iv) { const r = startInterview(b.dataset.iv); S.msgs.push({ role: 'bot', html: r.html, tags: r.tags }); renderLog(); persist(); renderQuick(); if (S.speak) say(r.speak); return; }
    if (b.dataset.sc) { const r = startTalk(b.dataset.sc); S.msgs.push({ role: 'bot', html: r.html, tags: r.tags }); renderLog(); persist(); renderQuick(); if (S.speak) say(r.speak); return; }
    if (b.dataset.load) { loadWebLLM(b.dataset.load); return; }
    switch (b.id) {
      case 'send': { const v = $('#input').value; $('#input').value = ''; handsFree = false; handle(v, 'text'); break; }
      case 'mic': listen(); break;
      case 'lang': S.lang = AR() ? 'en' : 'ar'; persist(); renderStatic(); break;
      case 'voiceToggle': S.speak = !S.speak; if (!S.speak && window.speechSynthesis) speechSynthesis.cancel(); persist(); renderStatic();
        if (S.speak) { if (!window.speechSynthesis) setV(t('noVoice')); else { const lastBot = [...S.msgs].reverse().find(m => m.role === 'bot'); say(lastBot ? stripHtml(lastBot.html).slice(0, 300) : t('voiceTest')); } }
        break;
      case 'menu': $('#side').classList.add('open'); $('#closeSide').classList.remove('hide'); break;
      case 'up': $('#file').click(); break;
      case 'pasteBtn': $('#pasteBox').classList.toggle('hide'); break;
      case 'usePaste': { const v = $('#pasteText').value.trim(); if (v) useCV(v, false); break; }
      case 'sampleBtn': useCV(SAMPLE, true); break;
      case 'clearAll': store.clear(); S.profile = null; S.cvText = ''; S.msgs = []; S.ctx = { target: '' }; S.flow = null; renderStatic(); S.msgs.push({ role: 'bot', html: `<p>${esc(t('cleared'))}</p>`, tags: ['guided'] }); renderLog(); break;
    }
    if (b.closest('#closeSide')) { $('#side').classList.remove('open'); $('#closeSide').classList.add('hide'); }
  });
  document.addEventListener('change', async e => {
    if (e.target.name === 'eng') { S.engine = e.target.value; return; }
    if (e.target.id === 'file' && e.target.files[0]) {
      const f = e.target.files[0]; $('#readState').textContent = t('reading');
      try { const buf = await f.arrayBuffer(); const text = /\.pdf$/i.test(f.name) ? await pdfText(buf) : await docxText(buf); if (text.trim().length < 80) throw new Error('empty'); useCV(text, false); }
      catch (err) { $('#readState').textContent = t('readFail'); }
      e.target.value = '';
    }
  });
  $('#input').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#send').click(); } });
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};

  // test hook (used by the automated scenario tests)
  window.CVZ_COACH = { S, handle, useCV, startInterview, startTalk, guidedReply, findJobs, skillGap, SAMPLE, ready: null };

  // boot
  $('#mk').style.setProperty('--src', 'url(assets/mark.png)'); $('#wd').style.setProperty('--src', 'url(assets/word.png)');
  renderStatic();
  window.CVZ_COACH.ready = Promise.all([loadJobs(), checkChrome()]).then(() => renderEngine());
})();
