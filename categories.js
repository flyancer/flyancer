/* Flyancer — service categories (shared by Explore, profile and dashboard) */
window.FLY_CATS = [
  { k:'resume_review',   label:'Resume review',   icon:'📄', blurb:'Get your resume checked by someone who hires',
    sugTitle:'Resume review with detailed written feedback', sugDesc:'I will go through your resume line by line and share what to fix, what to cut and how to match it to the role you want.', sugPrice:299 },
  { k:'mock_interview',  label:'Mock interview',  icon:'🎤', blurb:'Practice a real interview, get honest feedback',
    sugTitle:'30-min mock interview + feedback', sugDesc:'A realistic interview for your target role, followed by clear feedback on what to improve.', sugPrice:499 },
  { k:'referral',        label:'Referral',        icon:'🎯', blurb:'Ask a company insider to recommend you',
    sugTitle:'Referral request for my company', sugDesc:'I will review your profile and, if it is a good fit for an open role, recommend you internally. A referral is a recommendation, not a guarantee of an interview or offer.', sugPrice:499 },
  { k:'coaching',        label:'Career coaching', icon:'🧭', blurb:'1:1 guidance on your career path',
    sugTitle:'1:1 career coaching session (45 min)', sugDesc:'We will look at where you are, where you want to go and make a clear action plan.', sugPrice:999 },
  { k:'linkedin_review', label:'LinkedIn review', icon:'🔗', blurb:'Make your profile stand out to recruiters',
    sugTitle:'LinkedIn profile review', sugDesc:'I will review your headline, about section and experience and tell you exactly what to change to get noticed by recruiters.', sugPrice:299 },
  { k:'quick_call',      label:'Quick chat',      icon:'💬', blurb:'15-minute call to ask anything',
    sugTitle:'15-min quick chat — ask me anything', sugDesc:'Ask me about my company, role, interview process or anything career related.', sugPrice:199 }
];
window.FLY_CAT = Object.fromEntries(window.FLY_CATS.map(c => [c.k, c]));
