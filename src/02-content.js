// =====================================================================================
// Content (from kunalsatpal.com). Realms are companies, rooms are the work.
// Read along the road: now first, then further back.
// =====================================================================================
const REALMS = [
  { key: 'hinge', name: 'Hinge Health', years: '2023 – now', lead: 'Lead CareHub design · care for 25M members', role: 'Staff Product Designer', hue: 168, sig: 'ecg', ox: 1000, oy: 6840, w: 740, h: 540, group: 'major',
    blurb: 'Digital care for joint and muscle pain. I own design for CareHub, the platform therapists and coaches use every day to provide care to 25M members.' },
  { key: 'gojek', name: 'Gojek', years: '2022 – 2023', lead: 'GoFood growth design · 600K daily users', role: 'Senior Product Designer, GoFood', hue: 148, sig: 'route', ox: 200, oy: 5920, w: 540, h: 400, group: 'major',
    blurb: 'Designed GoFood growth and promotions, owning activation and retention for 600K daily users.' },
  { key: 'cult', name: 'Cult.fit', years: '2020 – 2022', lead: '', role: 'Product Designer → Senior', hue: 12, sig: 'track', ox: 1080, oy: 4980, w: 600, h: 440, group: 'major',
    blurb: "Fitness and health platform. Co-built the company's first app and web design system." },
  { key: 'iit', logo: 'img', name: 'IIT Roorkee · IMG', years: '2017 – 2020', lead: 'Head of Design · 12+ designers', role: 'Head of Design', hue: 262, sig: 'circuit', ox: 620, oy: 4060, w: 330, h: 170, minor: true, group: 'early',
    blurb: 'Head of Design at the Information Management Group, building products for 10,000+ students.' },
  { key: 'intern', logo: 'cult', name: 'Cult.fit internships', years: '2018 · 2019', lead: 'Two internships, then a full-time offer', role: 'Product Design Intern', hue: 16, sig: 'track', ox: 1095, oy: 3695, w: 170, h: 120, minor: true, group: 'early',
    blurb: 'Two summers as a product design intern at Cure.fit, then a full-time offer.' },
  { key: 'writing', name: 'Field notes', years: 'what I learned, written down', lead: 'Four posts, from my first job to my portfolio', role: 'Writing', hue: 320, sig: 'quill', ox: 690, oy: 2310, w: 560, h: 640, group: 'about',
    blurb: 'What I learned along the way, written down: one building for each post.' },
  { key: 'home', name: 'About me', years: 'the Isle of Kunal', lead: '', role: '', hue: 236, sig: 'mark', ox: 660, oy: 710, w: 480, h: 1320, group: 'about',
    blurb: 'I build design teams, and I still design: product, systems, and the code behind this map.' },
]
const realmBy = Object.fromEntries(REALMS.map(r => [r.key, r]))
// Groups of buildings with a banner of their own, like a city's.
const GROUPS = [{ key: 'work', name: 'How I work', sub: '', hue: 236, sig: 'mark', x: 940, y: BATCH.pillarNames ? 1985 : 1855, z: 0, go: 'work-grow' }]

const ROOMS = {
  'intern-2018': { tip: ['The internship I came back for', 'My first product design internship: research-led design on a startup project, and the lesson that people matter most.'], realm: 'intern', title: '2018', hall: 'the first studio', key: 'The internship I came back for', stat: 'The internship I came back for', body: 'My first product design internship, at Cure.fit in Bangalore.' },
  'intern-2019': { tip: ['Extended to three months, then a full-time offer', 'Back for a second summer: designed across gamification and payments, with work in the September campaign.'], realm: 'intern', title: '2019', hall: 'the second studio', key: 'Extended, then a full-time offer', stat: 'Extended to three months, then a full-time offer', body: 'A second internship at Cure.fit, extended to three months.' },
  'iit-placement': { tip: ['200K daily visits at peak', 'Redesigned the campus placement portal students rely on through placement season.'], realm: 'iit', quiet: true, title: 'Placement portal', hall: 'the clock tower', key: '200K daily visits at peak', stat: '200K daily visits at peak', body: 'Redesigned the campus placement portal that serves students through placement and internship season.',
    list: ['Peak traffic of 200K daily visits', 'Designed for students, recruiters and the placement office'], img: './site/img/team_iit.jpg' },
  'iit-team': { tip: ['A team of 12+ designers', "Built and led IMG's design team, making products for 10,000+ students."], realm: 'iit', quiet: true, title: 'Design team', hall: 'the studio', key: 'A team of 12+ designers', stat: 'A team of 12+ designers', body: 'As Head of Design at IMG, I built a team of 12+ designers making products for 10,000+ students.',
    list: ['Set up design reviews and a shared process', 'Mentored designers who went on to product roles'] },
  'cult-fitclub': { tag: 'Launched across Cult and Mind', tip: ['Fitclub V2 · Loyalty program', "Designed Cult.fit's loyalty program to lift retention first and cross-sell second."], realm: 'cult', title: 'Fitclub V2', hall: 'the arena', key: 'Loyalty, across Cult and Mind', stat: 'Launched across Cult and Mind', body: "Designed Fitclub V2, Cult.fit's loyalty program, to increase retention first and cross-sell products second.",
    list: ['Rewards, streaks and plan selection in one journey', 'Built with product, engineering and marketing'], img: './site/img/fitclub.png', href: './case.html?c=Fitclub' },
  'cult-ds': { tip: ['Contributed to the Aurora design system', 'Shared components for app and web, built with a team of four designers.'], realm: 'cult', title: 'Design system', hall: 'the guild hall', key: 'The first one, with a team of four', stat: 'The first one, built with a team of four', body: "Co-built Cult.fit's first app and web design system with a team of four designers.",
    list: ['Shared components across app and web', 'Category icon system across fitness, food and care'], img: './site/img/proof_icons.png' },
  'cult-cart': { tip: ['0.8% conversion · 40× vs banners', 'Designed price-drop and low-stock nudges that bring people back to an abandoned cart.'], realm: 'cult', title: 'Cart abandonment', hall: 'the shops', key: '40× the banners it replaced', stat: '0.8% conversion · 40× vs banners', body: 'Designed nudges to increase purchases on day two and after, once a user has abandoned their cart.',
    list: ['Price-drop and low-stock reminders', '0.8% conversion, 40× higher than the replaced banners'], img: './site/img/cart.png', href: './case.html?c=cart_abandonment' },
  'cult-onboarding': { tip: ['Onboarding in 3–4 days, down from 10–15', 'Redesigned how fitness and health professionals join the marketplace: about 70% faster, at a lower cost per partner.'], realm: 'cult', title: 'Partner onboarding', hall: 'the gatehouse', key: '10–15 days → 3–4', stat: '10–15 days → 3–4', body: 'Redesigned marketplace onboarding for fitness and health professionals.',
    list: ['Partner turnaround cut from 10–15 days to 3–4 (about 70% faster)', 'Lower cost to onboard each partner'] },
  'gojek-promo': { tip: ['+4% conversions · 5× ad revenue', 'Streamlined how people discover and use GoFood promotions.'], realm: 'gojek', title: 'Promo discovery', hall: 'the market square', key: '+4% conversions · 5× ad revenue', stat: '+4% conversions · 5× ad revenue', body: 'Streamlined how people discover and use GoFood promotions.',
    list: ['4% incremental session conversions', '5× ad revenue'], img: './site/cases/m/fe0ed5eb7d.png', href: './case.html?c=promo' },
  'gojek-visits': { tip: ['2.5× visits · 2× conversion', 'Redesigned the GoFood promotions page, end to end.'], realm: 'gojek', title: 'Promotions page', hall: 'the banner hall', key: '2.5× visits · 2× conversion', stat: '2.5× visits · 2× conversion', body: 'Redesigned the promotions experience end to end.', list: ['2.5× page visits', '2× page conversion'], img: './site/img/proof_promo.jpg' },
  'gojek-experiments': { tip: ['20+ experiments · +2% promo redemption', 'A year of tests on GoFood promotions, which also changed how people perceive them.'], realm: 'gojek', title: 'Promo experiments', hall: 'the kitchens', key: '20+ experiments in a year', stat: '20+ experiments in a year', body: 'Ran more than 20 experiments in a year on promotions.', list: ['Promo redemption up 2%', 'Better perception of promos'] },
  'hinge-carehub': { hoverImg: true, hoverSrc: './site/cases/media/carehub/hover-bento.png', hoverCutout: true, underConstruction: false, tip: [['CareHub 2.0', '6% more efficient PTs'], 'Led the visual refresh of the tool every PT and coach uses. Mover’s Award 2025.'], realm: 'hinge', title: 'CareHub 2.0', hall: 'the great hall', key: 'Before & after · Case study preview', stat: 'The platform every PT and coach works in', body: "Lead IC on the CareHub visual refresh, with one more designer over six months. Mover’s Award 2025.",
    list: ['Used by every physical therapist and coach', 'Visual refresh: reported 6% gain in PT efficiency'], img: './site/cases/media/carehub/after.png', href: '#hinge-carehub/read' },
  'hinge-ai': { underConstruction: false, tip: [['AI next-best-action', '~$400k saved a month'], 'A member-first AI roadmap, saving care teams 220 hours a day.'], realm: 'hinge', title: 'AI next-best-action', hall: 'the observatory', key: '~$400k saved a month', stat: 'A member-first path to next best action', body: 'Set the strategy and roadmap for a member-first CareHub, building toward next-best-action recommendations.',
    list: ['~6% less member-profile time', '~1% less time per member and ~4% less message-crafting time'], img: './site/cases/media/nba/final-carehub.jpg', href: '#hinge-ai/read' },
  'hinge-workflows': { tip: [['Care-team workflows', 'Up to 16% faster'], 'Simplified the everyday work care teams do in CareHub.'], realm: 'hinge', title: 'Care-team workflows', hall: 'the cloister', key: 'Up to 16% faster', stat: 'Up to 16% faster', soon: true, body: 'Simplified care-team workflows across CareHub.', list: ['Time per member down by up to 16%'] },
  'hinge-video': { tip: [['Video visits', '4.5% more efficient'], 'Redesigned the calls between members and their care team.'], realm: 'hinge', title: 'Video visits', hall: 'the mirror tower', key: '4.5% more efficient', stat: '4.5% more efficient', soon: true, body: 'Redesigned video visits between members and their care team.', list: ['Visit time down 4.5%'] },
  'blog-portfolio': { realm: 'writing', blog: true, title: 'Designing and iterating my portfolio', hall: 'the observatory', img: './site/img/blog_portfolio.png' },
  'blog-curefit': { realm: 'writing', blog: true, title: 'My experience at Cure.fit', hall: 'the gym hall', img: './site/img/blog_cult.jpg' },
  'blog-whatsapp': { realm: 'writing', blog: true, title: 'A 4-hour sprint: WhatsApp Polls', hall: 'the clock house', img: './site/img/blog_whatsapp.png' },
  'blog-pibit': { realm: 'writing', blog: true, title: 'Starting my career with Pibit', hall: 'the tent', img: './site/img/blog_pibit.png' },
  // How I work: five pillars in an arc on the lawn, one principle each, its proof on hover.
  'work-grow': { realm: 'home', group: 'work', world: 'work', title: 'Grow the team', hall: 'a pillar with a tree', stat: 'Grow designers, not just designs.',
    list: ['Mentoring designers and growing the design team at Hinge Health.', 'Before that, built a team of 12+ designers at IIT Roorkee · IMG.'] },
  'work-strategy': { realm: 'home', group: 'work', world: 'work', tagUp: true, title: 'Think like a strategist', hall: 'a pillar with a chessboard', stat: 'Set the strategy, then design the answer.',
    list: ["Recast Hinge Health's AI care assistant as a clinical recommendation tool and aligned clinical, data and engineering behind it. A staged member-first roadmap delivered separate gains in visibility and comprehension.", 'Set the strategy for multi-condition care at Hinge and for promotions at GoFood.'] },
  'work-data': { realm: 'home', group: 'work', world: 'work', title: 'Data-driven design', hall: 'a pillar with a rising chart', stat: 'Data-driven design, judged by its impact.',
    list: ['Ran 20+ experiments in a year on GoFood promotions: promo redemption up 2%.', 'Six months of usability tests and A/B experiments on promo discovery: +4% session conversions and 5× ad revenue.'] },
  'work-tools': { realm: 'home', group: 'work', world: 'work', tagUp: true, title: 'Build tools for the team', hall: 'a pillar with an anvil', stat: 'Tools I build so the team moves faster.',
    list: ["Created 10+ AI skills that improve designers' work at Hinge Health.", 'Contributed to the Aurora design system at Cult.fit.'] },
  'work-code': { realm: 'home', group: 'work', world: 'work', title: 'Code and motion', hall: 'a pillar with a code sign', stat: 'I code, and I design motion.',
    body: 'I prototype in code and design the motion, including the code and animation behind this map.' },
  'home-hello': { realm: 'home', title: 'Say hello', hall: 'the lighthouse', key: 'Say hello', stat: 'Available for conversations about design, AI products and remote work.',
    links: [['Write to me', 'mailto:kunalsatpal1@gmail.com'], ['Résumé (PDF)', 'https://kunalsatpal.com/kunalsatpal_resume.pdf'], ['LinkedIn', 'https://www.linkedin.com/in/kunalsatpal1/']] },
  'life-lift': { realm: 'home', title: 'I lift every day', hall: 'off duty', key: 'Physically fit, and sane while shipping', stat: 'Physically fit, and sane while shipping products.', img: './site/img/goku-nimbus-toon.webp', alt: 'Goku riding the Flying Nimbus' },
  'life-books': { realm: 'home', title: 'Weekends are for books', hall: 'off duty', key: 'Mostly non-fiction', stat: 'Mostly non-fiction; fiction when I need to unwind.', pics: Array.from({ length: 12 }, (_, i) => `./site/img/book_${i + 1}.jpg`), grid: 'books' },
  'life-games': { realm: 'home', title: 'Breaks mean a controller', hall: 'off duty', key: 'God of War, forever', stat: 'To slay gods or kick goals. God of War forever; most hours in FIFA.', pics: ['./site/img/gow.png', './site/img/fifa.png'], grid: 'games' },
  'life-anime': { realm: 'home', title: 'A designer who loves anime', hall: 'off duty', key: 'Naruto, one more time', stat: 'Naruto, more times than I can count, and a minimal poster series of it.', pics: Array.from({ length: 12 }, (_, i) => `./site/img/naruto_${String(i + 1).padStart(2, '0')}.png`), grid: 'posters' },
  'life-people': { realm: 'home', title: 'People matter the most', hall: 'off duty', key: 'Family, friends, teammates', stat: 'Family, friends, teammates.', pics: ['./site/img/team_gofood.jpg', './site/img/team_cult.jpg', './site/img/team_iit.jpg'], grid: 'photos' },
}
// How I work as proof (BATCH.pillarProof): each pillar is named as a practice, and its note gives
// one line of proof. Written with Kunal, 29 Oct.
const PILLAR_PROOF = {
  'work-grow': { title: 'Grow designers', stat: 'I grow designers, at every level.',
    body: 'Mentoring 4 senior designers at Hinge. Hired interns at Cult.fit. Led a team of 12 at IIT Roorkee · IMG.' },
  'work-strategy': { title: 'Strategy first', stat: 'I set the strategy, then design the answer.',
    body: "Reframed Hinge's AI assistant as a clinical tool, and aligned clinical, data and engineering behind a staged member-first roadmap." },
  'work-data': { title: 'Decide with data', stat: 'I design with data, and teach the team to.',
    body: '20+ experiments at Gojek lifted promo redemption 2%. At Hinge, I built a Mixpanel tool for designers.' },
  'work-tools': { title: 'Tools for the team', stat: 'I build tools that make the team faster.',
    body: '10+ AI skills for Hinge designers. At Gojek, a Figma plugin that fills mocks with real data.' },
  'work-code': { title: 'Prototype in code', stat: 'I prototype in code.',
    body: 'This map: built by hand in raw WebGL, no libraries, at 60 fps.' },
}
if (BATCH.pillarProof) for (const [id, P] of Object.entries(PILLAR_PROOF)) Object.assign(ROOMS[id], P, { list: null })
// "Promotions page" was the same project as Promo discovery (BATCH.onePromo): one building tells it, with
// the case study's numbers.
// Field notes' tags on the map, short (BATCH.shortNoteTags); the hover note and the page keep the full title.
const NOTE_TAGS = { 'blog-pibit': 'Starting at Pibit', 'blog-whatsapp': 'WhatsApp Polls', 'blog-curefit': 'Cure.fit internships', 'blog-portfolio': 'My portfolio' }
if (BATCH.shortNoteTags) for (const [id, t] of Object.entries(NOTE_TAGS)) ROOMS[id].short = t
if (BATCH.onePromo) delete ROOMS['gojek-visits']
if (BATCH.labTower) ROOMS['gojek-experiments'].hall = 'the science tower'

const STOPS = [
  { id: 'stop-mobily', build: 'marquee', logo: 'mobily', name: 'Mobily Invited', note: 'Freelance product design.', x: 700, y: 3540, r: 54 },
  { id: 'stop-pipeline', build: 'watchtower', logo: 'pipeline', name: 'Pipeline Security', note: 'Freelance product design.', x: 1200, y: 3430, r: 58 },
  { id: 'stop-west', build: 'lab', logo: 'west', name: 'West Agile Labs', note: 'Contract design work.', x: 700, y: 3320, r: 54 },
  { id: 'stop-pibit', logo: 'pibit', name: 'Pibit', years: '2017', note: 'Founding designer of an offers platform for local merchants.', tip: ['22 clients · 10,000+ users', 'Founding designer of an offers platform for local merchants.'], build: 'stall', x: 1200, y: 3210, r: 62 },
  { id: 'stop-stockroom', build: 'warehouse', logo: 'stockroom', name: 'stockroom.io', note: 'A B2B platform for curating candidates for recruiters.', x: 760, y: 3100, r: 54 },
]
// More about the earlier stops, from the résumé and the field notes (BATCH.stopDetails). Pibit's story
// stays with the Field notes, so its stop does not link to it.
const STOP_MORE = {
  'stop-west': { years: '2018', tip: ['2018 · seven months, on contract', 'Product design for West Agile Labs, a product studio in San Francisco: my first real taste of corporate work.'] },
  'stop-pibit': { tip: ['22 clients · 10,000+ users', 'Founding product designer of an offers platform for local merchants.'] },
}
if (BATCH.stopDetails) for (const S of STOPS) Object.assign(S, STOP_MORE[S.id])
STOPS.forEach(S => { ROOMS[S.id] = { stop: true, title: S.name, stat: S.years || '', body: S.note, logo: S.logo, tip: S.tip, see: S.see } })
const roomsOf = key => Object.entries(ROOMS).filter(([, r]) => r.realm === key)

// =====================================================================================
// The geography: one long sheet, travelled from its bottom edge to its top like the levels
// of a game, so the eye always looks ahead. A road runs north from my name through every
// place I have worked, newest first, out to sea past the isles of earlier work, and ends at
// the Isle of Kunal. Past the mainland, the earliest work stands on islands of its own.
// =====================================================================================
// The worlds, in order along the road; y0 is each one's far (northern) edge.
const WORLDS = [
  { key: 'hinge', name: 'Hinge Health', years: '2023 – now', y0: 6590, y1: 7600 },
  { key: 'gojek', name: 'Gojek', years: '2022 – 2023', y0: 5635, y1: 6590 },
  { key: 'cult', name: 'Cult.fit', years: '2020 – 2022', y0: 4480, y1: 5635 },
  { key: 'earlier', name: 'Earlier work', years: '2017 – 2020', y0: 3020, y1: 4480 },
  { key: 'writing', name: 'Field notes', years: 'four posts', y0: 2220, y1: 3020 },
  { key: 'work', name: 'How I work', years: '', y0: 1500, y1: 2220 },
  { key: 'home', name: 'About me', years: 'and how to say hello', y0: 380, y1: 1500 },
]
// The road on land; the way across the water, over the islands, between the isles and across
// the Field notes; and the path across the Isle of Kunal.
const ROAD = [[950, 7780], [880, 7640], [700, 7520], [610, 7350], [600, 7150], [615, 6950], [660, 6770], [820, 6640], [980, 6560], [1150, 6480], [1250, 6340], [1260, 6150],
  [1250, 5950], [1180, 5750], [1020, 5640], [840, 5540], [690, 5400], [660, 5200], [670, 5000], [760, 4850], [860, 4700], [920, 4580], [940, 4500]]
const LANE = [[940, 4500], [880, 4380], [810, 4290], [795, 4170], [800, 4040], [900, 3960], [1040, 3890], [1050, 3800], [1040, 3700], [960, 3620], [700, 3540],
  [950, 3485], [1200, 3430], [950, 3375], [700, 3320], [950, 3265], [1200, 3210], [980, 3155], [760, 3100], [850, 3010], [900, 2950], [940, 2830], [955, 2680], [965, 2530],
  [985, 2380], [1010, 2290], [1040, 2190], [1050, 2100]]
const ISLEPATH = [[1050, 2100], [1220, 1940], [1240, 1630], [1220, 1230], [1180, 930], [1060, 780]]
// The shore, west to east: the land runs on past both edges of the sheet, and the sea opens
// across the whole north.
const COAST = [[-1100, 4830], [-600, 4790], [-150, 4740], [180, 4660], [380, 4560], [640, 4520], [940, 4500], [1220, 4530], [1500, 4560], [1720, 4640], [2050, 4730], [2500, 4780], [3000, 4830]]
const LAND = [...COAST, [3000, H + 1100], [-1100, H + 1100]]
// Two isles at the end of the road, a strait between them: How I work to the south, where you land,
// and the Isle of Kunal (About me) to the north.
const WORKISLE = [[700, 2110], [920, 2140], [1150, 2130], [1330, 2030], [1370, 1780], [1350, 1630], [1290, 1572], [1150, 1555], [980, 1565], [800, 1558], [650, 1590], [595, 1680], [580, 1730], [620, 1980]]
// With BATCH.biggerIsle the Isle of Kunal is a fifth wider each way from its middle and reaches a
// little further north; its south shore, by the strait, stays where it is.
const ISLE = [[1200, 1440], [1330, 1450], [1370, 1180], [1320, 880], [1180, 670], [940, 610], [720, 660], [600, 850], [575, 1130], [600, 1400], [700, 1445], [880, 1455], [1060, 1450]]
  .map(([x, y]) => BATCH.biggerIsle ? [Math.round(972 + (x - 972) * 1.2), Math.round(1455 - (1455 - y) * 1.07)] : [x, y])
// The Field notes, and two isles of earlier work: IIT Roorkee's campus, and the Cult.fit internships.
const ISLANDS = [
  [[700, 2930], [880, 2965], [1080, 2950], [1240, 2880], [1300, 2700], [1280, 2500], [1200, 2350], [1010, 2290], [810, 2310], [680, 2400], [640, 2580], [650, 2780]],
  [[600, 4050], [760, 4010], [930, 4030], [1000, 4110], [990, 4230], [900, 4290], [760, 4300], [610, 4280], [545, 4200], [550, 4100]],
  [[1050, 3660], [1180, 3640], [1300, 3670], [1350, 3750], [1320, 3840], [1200, 3875], [1060, 3860], [1015, 3780]],
]
const SHORES = [ISLE, WORKISLE, ...ISLANDS]
const onLand = (x, y) => inside(LAND, x, y) || SHORES.some(p => inside(p, x, y))
// Two rivers cross the land between worlds; the road takes a bridge over each.
const wavy = (y, amp, seed) => { const r = rng(seed); return Array.from({ length: 39 }, (_, i) => [-940 + i * 100, y + Math.sin(i * .9 + seed) * amp + (r() - .5) * amp * .6]) }
const RIVERS = [{ pts: wavy(6590, 26, 3) }, { pts: wavy(5635, 22, 7) }]

// Everything else on the sheet, in one place.
const GEO = {
  isleBox: BATCH.biggerIsle ? { x0: 495, y0: 551, x1: 1450, y1: 2140 } : { x0: 575, y0: 610, x1: 1370, y1: 2140 },
  // The Isle of Kunal alone, north of the strait.
  aboutBox: BATCH.biggerIsle ? { x0: 495, y0: 551, x1: 1450, y1: 1455 } : { x0: 575, y0: 610, x1: 1370, y1: 1455 },
  // [cx, cy, rx, ry, _, name]: woods on the open side of each world, away from road and city.
  forests: [[290, 7840, 150, 110, 0, ''], [1600, 7900, 150, 120, 0, ''], [300, 7040, 150, 300, 0, ''], [1620, 6100, 130, 300, 0, ''], [330, 5020, 170, 140, 0, ''],
    [1600, 4270, 150, 230, 0, ''], [400, 3480, 230, 150, 0, ''], [1500, 6685, 120, 50, 0, ''], [330, 3620, 110, 70, 0, ''],
    // Beyond the edges of the sheet, the country goes on.
    [-300, 7300, 170, 260, 0, ''], [2200, 6900, 170, 280, 0, ''], [-320, 5500, 160, 240, 0, ''], [2230, 5000, 170, 260, 0, ''], [-280, 4100, 150, 200, 0, ''], [2180, 3700, 150, 180, 0, '']],
  hills: [[1450, 5820, 1], [1540, 5790, .8], [380, 5740, .9], [470, 5720, .7], [1500, 5540, .9], [1600, 5520, .7], [260, 6720, .8], [-200, 6100, 1], [2100, 6300, .9], [-150, 4800, .9], [2150, 7700, .8], [-250, 8100, .9]],
  hamlets: [[1560, 7480, 5], [330, 6480, 4], [1500, 5340, 5], [1580, 4750, 4]],
  mountains: { y0: 4640, y1: 4900 },
  trail: { cx: 1420, cy: 6690, rx: 230, ry: 62 },
  track: { cx: 320, cy: 5300, rx: 116, ry: 64 },
  // Big names for the parts of the country.
  regions: [['EARLIER WORK', 1260, 4390, 34, '']],
  roses: [{ x: 260, y: 2680, r: 150 }, { x: 1640, y: 930, r: 130 }],
  whales: [[150, 2961, 160, false], [1480, 1585, 170, true]],
  serpent: [1460, 2947, 260],
  // The schooner rounds the Isle of Kunal; off the larger isle it keeps further out to the north. Coming
  // back west it passes south of How I work, between it and the Field notes, never across the land.
  ships: [LANE.slice(10, 19), [...(BATCH.biggerIsle ? [[200, 1230], [390, 640], [1000, 420], [1560, 520]] : [[200, 1230], [450, 780], [1500, 530]]), [1700, 1080], [1580, 1700], [1470, 2200], [1120, 2212], [820, 2208], [540, 2120], [400, 1700]]],
  gulls: [[300, 3380], [1350, 2080], [500, 630]],
}
