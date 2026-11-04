// =====================================================================================
// Inside the buildings: each case study is a few rooms you walk through. Chapters come from
// the case studies on kunalsatpal.com; Hinge chapters keep to what is public and mark the
// rest as still to be written.
// =====================================================================================
const M = p => './site/cases/m/' + p
const CASES = {
  'cult-fitclub': [
    { k: 'The problem', body: "Expand Fitclub, Cult.fit's loyalty program, from Eat.fit to Cult and Mind classes, to raise engagement and revenue per user. Success meant more classes attended per user, per month.",
      list: ['<b>Short term:</b> classes attended per month should rise substantially', '<b>Long term:</b> incremental retention revenue should be greater than the burn', '<b>Guard rails:</b> the app rating stays put, and fitness stays the core benefit; rewards never take centre stage'], img: M('c4f18367d3.png') },
    { k: 'Who it was for', body: 'Two very different members. Eat.fit members want a discount up front, at the moment of buying. Cult and Mind members book days ahead, forget, and cancel with almost no penalty: getting out of bed is the hardest part.', img: M('90ca8d563a.png') },
    { k: 'Three decisions', list: ['<b>Who gets a reward?</b> Every FitClub member, including people who are not Cult members yet.', '<b>When?</b> After every completed Cult or Mind class, at most one a day.', '<b>How?</b> A variable reward, revealed in the app, so attending stays the point.'], img: M('e79fa376dc.png') },
    { k: 'Getting the reveal right', body: 'We first made people scratch to claim the reward, like a scratch card. It was too much, so we removed it: the reward now reveals itself with no extra effort and never gets in the way of class feedback. Claimed rewards can be shared, because most players are socialisers.', img: M('9670dbfd0d.png') },
    { k: 'The launch', body: 'Fitclub V2 launched across Cult and Mind on 2 September 2019 with the #itpaystobefit campaign. I designed it during my internship. What I took away: not every game mechanic suits every case; the work is finding which motivations to lean on.', img: M('81ca3bdb52.png') },
  ],
  'cult-cart': [
    { k: 'The problem', body: 'Around 72% of online carts are abandoned. On Cult.fit\'s Fitstore, about 20% of people bought within 24 hours of adding to their cart, almost nobody on day one, and nobody after that.', img: M('25ebbb8c35.png') },
    { k: 'The hypothesis', body: 'Bring back the 80% who do not buy in the first 24 hours: left alone, they will not convert.', img: M('7258367385.png') },
    { k: 'Testing it fast', body: 'Instead of a big build, I made a widget from existing atoms in our library and placed it on high-traffic pages that overlapped with the people we wanted to reach.', img: M('6ec8a29ce0.png') },
    { k: 'The result', body: 'A two-week A/B test against the marketing banners it replaced: 0.8% view-to-purchase conversion, 40× the banners, from people who would not otherwise have bought. Feedback from internal users shaped what came next.', img: M('b8277761b6.png') },
  ],
  'gojek-promo': [
    { k: 'Where it started', body: "I joined GoFood's growth team at the end of 2022 to improve how people felt about promos. What I found early on took us somewhere else entirely.", img: M('8a84baf2be.png') },
    { k: 'The insight', body: "Indonesia is a budget-sensitive market: nearly half of all GoFood orders used a discount, and 'Value Eaters' were our main users. Funnel analysis showed where they dropped off.", img: M('a439890881.png') },
    { k: 'Winning buy-in', body: 'I made one artefact to show the vision. It started with my PM and design managers, then won over the Head of Product, the SLT, and the marketing, ads and platform teams.', video: M('27f489d9ee.mp4'), img: M('2556330ad5.png') },
    { k: 'Six months of testing', body: 'A hypothesis for every element of the page, then usability tests and A/B experiments over six months.', img: M('0184c04852.png') },
    { k: 'The result', body: '+4% incremental session conversions and 5× ad revenue. Some concepts did exceptionally well and some declined; the next step was tuning the mix for each cohort.', img: M('85fcee7281.png') },
  ],
  'hinge-carehub': [
    { k: 'What it is', body: 'CareHub is the platform Hinge Health\'s physical therapists and coaches work in every day, to care for millions of members with joint and muscle pain.' },
    { k: 'The visual refresh', body: 'I led the visual refresh with one additional designer over six months. The member record brings navigation, care context and conversation into a shared visual system.', img: './site/cases/media/carehub/after.png' },
    { k: 'The outcome', body: 'A 6% gain in PT efficiency after the visual refresh.' },
  ],
  'hinge-ai': [
    { k: 'The evidence', body: 'Members had 2.8 open workflows on average, while the interface showed one at a time. The baseline analysis recorded an 88% click rate on Interactions and a daily workload of 90–110 members. PTs and coaches described discovering related work late and repeatedly checking other tabs.' },
    { k: 'The direction', body: 'I set a member-first strategy and staged roadmap toward next-best-action recommendations, working across clinical, data and engineering.' },
    { k: 'Milestone 1: see the whole situation', body: 'Related workflows were hidden behind a single task. Bringing them into the member view, while preserving space for the conversation, reduced member-profile time by about 6%: 5 min 40 sec to 5 min 20 sec.' },
    { k: 'Milestone 2: understand what matters', body: 'We replaced long, difficult-to-verify summaries with concise context and visible sources, informed by prompt iteration, expert review and end-user evaluation. Results: about 1% less time per member and 4% less message-crafting time.' },
    { k: 'What remained', body: 'AI correctness was only about 74% in evaluation. Reviews found missing information, too much emphasis on pain and conclusions beyond the evidence. Action recommendations remained design work in progress at this stage.' },
  ],
}
// How each page opens, from the case-study and blog pages on kunalsatpal.com: a kicker, the
// title, a summary and its numbers, and the final design standing beside them.
const PAGES = {
  carehub_2: { kicker: 'Hinge Health · Case study preview', title: 'CareHub 2.0', summary: 'I was the lead IC on the visual refresh of CareHub, the workspace Hinge Health’s physical therapists and coaches use every day.', contactLock: true,
    hero: './site/cases/media/carehub/hero-system.png', desktopHero: true, heroCutout: true, heroAlt: 'The CareHub 2.0 visual system: icons, a body map, buttons, colour tokens, the member record, Noto Sans type, streak cards and visit status chips.' },
  next_best_action: { kicker: 'Hinge Health · CareHub', title: 'Holistic Care', summary: 'A member-first redesign of CareHub: the member’s whole situation in one view, then AI that helps clinicians understand it.', contactLock: true,
    hero: './site/cases/media/carehub/after-hd.jpg', desktopHero: true, heroCaption: 'The member-first CareHub member record', heroAlt: 'The refreshed CareHub member record: a labelled navigation rail, an AI summary with suggested actions, engagement, trends, the current focus with a body map, and the conversation.' },
  promo: { kicker: 'Gojek · GoFood growth', title: 'Solving for promo discovery', summary: 'Streamlining the promo journey: 4% incremental conversions and 5× ad revenue.',
    chips: [['4%', 'session conversions'], ['5×', 'ad revenue'], ['6', 'months of testing']], hero: './site/cases/media/phone_promo.png' },
  Fitclub: { kicker: 'Cult.fit', title: 'Designing for engagement: Fitclub V2', summary: 'Fitclub V2, a loyalty program built to lift retention and cross-sell products.',
    chips: [['V2', 'loyalty program'], ['Gamified', 'rewards']], hero: './site/cases/media/phone_Fitclub.png' },
  cart_abandonment: { kicker: 'Cult.fit', title: 'Solving for cart abandonment', summary: 'Designing to bring people back on day two and after, once they have left a cart behind.',
    chips: [['0.8%', 'conversion'], ['40×', 'the banners it replaced']], hero: './site/cases/media/phone_cart_abandonment.png' },
  portfolio: { n: 1, tag: 'Process', icon: './assets/mark.svg', iconBg: 'oklch(99% 0.005 84)', title: 'Designing and <em>iterating</em> my portfolio', stand: 'How this website grew up, one version at a time.' },
  Internship_curefit: { n: 2, tag: 'Career', icon: './assets/logos/cult-mark.png', iconBg: 'oklch(99% 0.005 84)', iconPad: 8, title: 'My experience at <em>Cure.fit</em>', stand: 'What two internships taught me before my first full-time job.' },
  Pibit: { n: 3, tag: 'Career', icon: './assets/logos/pibit-mark.png', iconBg: 'oklch(77% 0.14 57)', iconPad: 7, title: 'Starting my career with <em>Pibit</em>', stand: "What being a startup's only designer taught me." },
  whatsapp: { n: 4, tag: 'Sprint', icon: './assets/logos/whatsapp-mark.png', title: 'A 4-hour sprint: <em>WhatsApp Polls</em>', stand: 'Designing a feature against the clock.' },
}
// What each place is about, for finding things on the map.
const TAGS = {
  'intern-2018': 'internship research startup', 'intern-2019': 'internship gamification payments growth', 'iit-placement': 'students portal web scale traffic', 'iit-team': 'leadership team mentoring process design reviews hiring',
  'cult-fitclub': 'gamification loyalty retention rewards growth mobile engagement', 'cult-ds': 'design systems components icons tokens systems', 'cult-cart': 'growth e-commerce experiments a/b test conversion nudges',
  'cult-onboarding': 'marketplace onboarding operations b2b efficiency partners', 'gojek-promo': 'growth strategy research experiments stakeholders promotions food data',
  'gojek-visits': 'growth promotions conversion redesign', 'gojek-experiments': 'experiments a/b test growth data',
  'hinge-carehub': 'healthcare enterprise clinical tools platform b2b workflow ai', 'hinge-ai': 'ai ml machine learning strategy clinical healthcare roadmap trust safety recommendations',
  'hinge-workflows': 'workflow efficiency enterprise clinical tools', 'hinge-video': 'video healthcare telehealth',
  'work-grow': 'leadership mentoring team', 'work-strategy': 'leadership strategy ai', 'work-data': 'data experiments research impact', 'work-tools': 'ai skills design systems tools teams', 'work-code': 'craft code motion prototyping', 'life-lift': 'about me fitness life', 'life-books': 'about me reading books life', 'life-games': 'about me games life', 'life-anime': 'about me anime life', 'life-people': 'about me people family friends life', 'home-hello': 'contact email linkedin hire hello',
}
for (const S of STOPS) TAGS[S.id] = 'freelance contract early internship'
