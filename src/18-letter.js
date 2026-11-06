// =====================================================================================
// Case studies and field notes, as full pages, laid out like the ones on kunalsatpal.com:
// an opening with the title, its numbers and the final design, then numbered sections with
// the pictures on trays. A page settles in quietly over the map, and fades away again.
// =====================================================================================
const FULL_OF = { 'cult-fitclub': 'Fitclub', 'cult-cart': 'cart_abandonment', 'gojek-promo': 'promo', 'hinge-ai': 'next_best_action', 'hinge-carehub': 'carehub_2',
  'blog-portfolio': 'portfolio', 'blog-curefit': 'Internship_curefit', 'blog-whatsapp': 'whatsapp', 'blog-pibit': 'Pibit' }
// Hinge Health's page (BATCH.hingePage). The work is under NDA, so it keeps to the outcomes already
// on the map. NBA and CareHub have their own previews; the other Hinge buildings retain this overview.
const HINGE_PAGE = 'hinge-share'
const EXTRA_PAGES = !BATCH.hingePage ? {} : { [HINGE_PAGE]: { title: 'What I can share', realm: 'hinge', from: 'hinge-carehub', cases: [
  { k: 'CareHub 2.0', body: 'Owned the design of its core, the member record, the queue and AI actions, replacing the legacy tool. It is used by every PT and coach, with a 6% efficiency gain.' },
  { k: 'AI next-best-action', body: 'Set a member-first direction and staged roadmap: surface the full situation, make context understandable, then recommend actions. The first milestone reduced member-profile time by about 6%.' },
  { k: 'Care-team workflows', body: 'Simplified the everyday workflows care teams run in CareHub: time per member down 8% for PTs and 16% for coaches.' },
  { k: 'Video visits', body: 'Redesigned video visits between members and their care team: recording rates up from 53% to 95%, and visit time down 4.5%.' },
] } }
if (BATCH.hingePage) {
  PAGES[HINGE_PAGE] = { title: 'Designing the tools care teams use every day', hero: './site/img/proof_carehub.png',
    summary: "I design CareHub, the tool Hinge Health's physical therapists and health coaches use to care for members. Most of this work is under NDA, so this page sticks to outcomes. I'm glad to walk through the work itself in a conversation." }
  for (const id of ['hinge-workflows', 'hinge-video']) Object.assign(ROOMS[id], { see: HINGE_PAGE, seeLabel: 'Read what I can share', soon: false })
}
const CASE_ORDER = ['hinge-carehub', 'hinge-ai', ...(BATCH.hingePage ? [HINGE_PAGE] : []), 'gojek-promo', 'cult-cart', 'cult-fitclub']
// The field notes, one building each on their island.
const BLOGS = Object.keys(ROOMS).filter(id => ROOMS[id].realm === 'writing' && FULLCASE_DATA[FULL_OF[id]]).map(id => ({ id, title: ROOMS[id].title }))
const BLOG_ORDER = BLOGS.map(b => b.id)
// The page a building holds, if any. Work under NDA keeps its note and its numbers, but no page.
const letterFor = id => EXTRA_PAGES[id] ? id : !ROOMS[id] || ROOMS[id].nda ? null : (FULLCASE_DATA[FULL_OF[id]] || CASES[id]) ? id : null
const hasCase = id => !!letterFor(id)
function letterOf(id) {
  const X = EXTRA_PAGES[id]
  if (X) return { title: X.title, realm: X.realm, doc: id, cases: X.cases, blog: false, from: X.from }
  const B = ROOMS[id]
  return B ? { title: B.title, stat: B.stat, body: B.body, realm: B.realm, doc: FULL_OF[id], cases: CASES[id], blog: !!B.blog, from: id, href: B.href } : null
}
// The case studies are my own pages, but they are still HTML: keep only plain emphasis.
// Every section can be jumped to: its id comes from its heading.
const headId = t => 's-' + String(t ?? '').replace(/&#x27;|&[a-z]+;|<[^>]+>/gi, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const keep = h => String(h ?? '').replace(/<(?!\/?(?:b|i|em|strong|br)\b)[^>]*>/gi, '').replace(/<(\/?)(b|i|em|strong|br)\b[^>]*>/gi, '<$1$2>')
const caseAttr = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const photo = (src, size = 'large', cap, alt = '') => `<figure class="ph ${size} rise"><button class="phb" data-zoom="${abs(src)}" aria-label="${caseAttr(alt ? 'Enlarge: ' + alt : 'Enlarge picture')}"><img src="${abs(src)}" alt="${caseAttr(alt)}" loading="lazy" decoding="async" onerror="this.closest('figure').remove()"></button>${cap ? `<figcaption>${keep(cap)}</figcaption>` : ''}</figure>`
const screenPhoto = (src, size = 'large', cap, alt = '', fullSrc = src) => `<figure class="ph ${size} rise screen-photo"><button class="phb" data-zoom="${abs(fullSrc)}" aria-label="${caseAttr(fullSrc === src ? 'Enlarge: ' : 'Open full screen: ')}${caseAttr(alt || 'product screenshot')}"><div class="screen-frame"><img src="${abs(src)}" alt="${caseAttr(alt)}" loading="lazy" decoding="async" onerror="this.closest('figure').remove()"></div></button>${cap ? `<figcaption>${keep(cap)}</figcaption>` : ''}</figure>`
const clip = src => `<figure class="ph large rise clip"><video src="${abs(src)}" muted loop playsinline autoplay controls preload="metadata"></video></figure>`
const two = n => String(n).padStart(2, '0')
// Corrections laid over the pages as they come from kunalsatpal.com (BATCH.pageFixes), so the
// originals stay as they are: typos mended, and a picture of numbers set again as text.
const PAGE_FIXES = {
  Fitclub: [
    ['Beacuse of which a lot of cancellations happen with nearly zero penalty', 'Because of this, a lot of classes are cancelled with nearly zero penalty'],
    ['User motivations very much different from Eat.fit users.', 'Their motivations are very different from those of Eat.fit users.'],
    ['This internship has completely changed my mindset about gamification and incentivization.', 'What I still use: pick the motivation first, then the mechanic. A reward should feed the habit, never become it.'],
  ],
}
const PROMO_PILLARS = ['Value recall', 'Targeted promos', 'Innovation hub', 'Infinite list']
const PAGE_SWAPS = {
  './site/cases/m/d012e14b6c.png': { t: 'metrics', items: [['66', 'Fitcash flow on the app per user', 'up from 40, against a target of 50'], ['2.4', 'classes attended per user each month', 'up from 2.1, against a target of 3']] },
  // Promo discovery: three pictures of text, set again as text the page can carry.
  './site/cases/m/8a84baf2be.png': { t: 'problem', lead: 'The promo funnel lost people at every step.',
    items: ['Half-empty page due to legacy issues', 'Uncontrolled marketing campaigns on the promo page', 'Overall poor conversions from promo pages'] },
  './site/cases/m/a439890881.png': { t: 'methods', label: 'Research methods', items: ['Qualitative research with GoFood Research', 'Funnel analysis', 'A workshop with 30+ stakeholders'] },
  // Promo discovery, further on: the results, the hypothesis and the go-ahead.
  './site/cases/m/85fcee7281.png': { t: 'results', src: './site/cases/media/promo/results-phone.png', alt: 'The redesigned GoFood promo page.',
    items: [['2.5×', 'visits to the promo page'], ['1.5×', 'page conversions'], ['5×', 'ad revenue from the promo page'], ['4%', 'incremental session conversions']] },
  './site/cases/m/031ccfb28d.png': { t: 'callout', tone: 'ink', kicker: 'Hypothesis', text: 'Unoptimised top-of-funnel promos have led to very low conversions in the short term, and low value perception over a long period.' },
  './site/cases/m/2556330ad5.png': { t: 'callout', tone: 'ember', src: './site/cases/media/promo/flame.png', text: 'With that, it was added to the planning sheet for H1 2023.' },
  // Cart abandonment: the hypothesis behind the audience, and the overall impact.
  './site/cases/m/7258367385.png': { t: 'venn', quote: 'The tough decision of selecting a product is already made. Users who have abandoned carts for some reason could get back to the funnel if given a good recall. The chance of an app impression is far higher than on other e-commerce websites, because cult.fit has a strong daily active user base that overlaps with Fitstore users.',
    left: 'Fitness users', middle: 'Target audience', right: 'Fitstore users' },
  './site/cases/m/2e57196a97.png': { t: 'funnel', title: 'Overall impact', head: [['~32%', 'click rate'], ['~4%', 'incremental orders']],
    steps: { start: ['100', 'users added items to cart'], bought: ['20', 'users purchased items', 'purchased in a 24-hour window'], left: ['80', 'abandoned their cart'],
      back: ['3', 'additional purchases', 'retargeted with the cart abandonment widget'], total: ['23', 'total purchases', '20 + 3'] } },
  // Cart abandonment: the slides of words beside a phone or a widget, set again as text.
  './site/cases/m/25ebbb8c35.png': [
    { t: 'annotated', full: './site/cases/m/25ebbb8c35.png', title: 'Browsing is rewarding', items: ['High effort while finding the perfect product.', 'However, it gives instant gratification: scrolling, and imagining owning those products.'],
      pics: [{ src: './site/cases/media/cart/browsing.png', alt: 'A Cultsport product page for lounge joggers, with Add to Cart.' }] },
    { t: 'annotated', full: './site/cases/m/25ebbb8c35.png', title: 'But making payment is difficult', items: ['Hesitation in payments.', 'Rethinking or delaying the decision because of additional charges.', 'Distraction and a short attention span.', 'Many users who add items to the cart but don’t complete the purchase are just browsing, with low buying intent.'],
      pics: [{ src: './site/cases/media/cart/payment.png', alt: 'The Review Your Order page, with totals and Select Address.' }] }],
  './site/cases/m/b19cc430a3.png': { t: 'annotated', full: './site/cases/m/b19cc430a3.png', lead: 'With all the offerings there, the Fitstore cart gets no visibility on the primary pages. That makes it impossible for users to recall their cart, unlike on other e-commerce platforms.',
    pics: [{ src: './site/cases/media/cart/home.png', alt: 'The cult.fit home page: classes, gyms, meals and deals, with no sign of the cart.' }] },
  './site/cases/m/5e880f4e1e.png': { t: 'annotated', full: './site/cases/m/5e880f4e1e.png', quotes: ['“Images are too small to completely recall what item I had added in the cart.”', '“Can we change the copy to create more urgency with the widget?”', '“This could become a blind spot if it stays there for long.”', '“Why do we have such prominent quantity actions here?”'],
    pics: [{ src: './site/cases/media/cart/widget-v1.png', card: true, alt: 'The first widget: Complete your purchase, with two items, quantity controls and Go to cart.' }] },
  './site/cases/m/918b39f698.png': { t: 'annotated', full: './site/cases/m/918b39f698.png', layout: 'stack', title: 'Iterating on the experiment', ordered: true, items: [
    'The main aim is to create good recall. However, users had to open the product page again to confirm the product.',
    'A lot of information stacked in a grid made it difficult for users to check the final total amount.',
    'Actions like adjusting the count created an unnecessary distraction. We knew from data that almost no one buys 2 pieces of the same article.'],
    then: { label: 'What changed', items: ['Bigger imagery for easy recall', 'A vertical information structure, to help with scanability', 'Removed unnecessary actions'] },
    pics: [{ src: './site/cases/media/cart/item-before.png', card: true, cap: 'Before', alt: 'A cart item row with a small thumbnail and quantity controls.' }, { src: './site/cases/media/cart/item-after.png', card: true, cap: 'After', alt: 'A cart item with a large image, size and quantity, and a ₹152 price drop.' }] },
  './site/cases/m/2c08b095bf.png': { t: 'annotated', full: './site/cases/m/2c08b095bf.png', layout: 'below', title: 'Creating urgency',
    lead: 'Delaying the decision at the time of payment is a common tendency with products where the need isn’t always clear, especially apparel. Scarcity bias and offers add a sense of urgency, so users don’t delay the decision again.',
    pics: [{ src: './site/cases/media/cart/urgency-price.png', card: true, cap: 'A price drop', alt: 'Widget: Hurry! ₹52 price drop in your cart.' }, { src: './site/cases/media/cart/urgency-stock.png', card: true, cap: 'Low stock', alt: 'Widget: Items running out of stock! Only 1 left.' }] },
  './site/cases/m/2fece80134.png': { t: 'annotated', full: './site/cases/m/2fece80134.png', kicker: 'Edge case', title: 'Handling numerous cart items',
    paras: ['Placed on pages with high user traffic, the widget shouldn’t occupy too much space.', 'With an average order value of 1.4, most users buy up to 2 items. Capping the visible cart items at 2 covers most cases, with “+x items” for the exceptions.'],
    pics: [{ src: './site/cases/media/cart/edge-case.png', card: true, alt: 'The widget with two items shown and “+2 more items”, ₹1858 for 4 items.' }] },
  './site/cases/m/ddfd39285b.png': { t: 'outcomes', full: './site/cases/m/ddfd39285b.png', title: 'Results', imgMax: 400, items: [
    { tag: 'Initial experiment', tone: 'same', src: './site/cases/media/cart/result-before.png', alt: 'The first widget: Complete your purchase.', note: '<b>X</b> conversions' },
    { tag: 'Replaced by V2', tone: 'up', src: './site/cases/media/cart/result-after.png', alt: 'The V2 widget, led by a price drop.', note: '<b>3×</b> conversions' }] },
  // Pibit: the market, and how the team worked.
  './site/cases/m/5ad0270a44.jpg': { t: 'compare', label: 'How Pibit compared', cols: ['Offers', 'Real-time connectivity', 'Pre-ordering', 'Personalised offers'],
    rows: [['Pibit', 1, 1, 1, 1], ['Ressy', 1, 1, 0, 0], ['Little App', 1, 0, 0, 0], ['Nearbuy', 1, 0, 0, 0]], own: 'Pibit' },
  './site/cases/m/65b830bf53.png': { t: 'process', loop: ['Define', 'Ideate and design', 'Prototype and test'], then: ['Build', 'Analyse and test'], back: 'Iterate' },
  // WhatsApp Polls: the four hours, the user stories and the test.
  './site/cases/m/c14069a3df.png': { t: 'hour', n: '1st hour', title: 'Research', fill: 0 },
  './site/cases/m/13ee88c1c4.png': { t: 'hour', n: '2nd hour', title: 'Synthesis', fill: 1 },
  './site/cases/m/6a59c8b0e7.png': [{ t: 'hour', n: '3rd hour', title: 'Brainstorming', fill: 2 }, { t: 'img', src: './site/cases/media/whatsapp/brainstorm-sketches.png', size: 'large', alt: 'Paper sketches of two poll flows, with pros and cons for each.' }],
  './site/cases/m/09f7654be4.png': { t: 'hour', n: 'Final hour', title: 'Working on the details', fill: 3 },
  './site/cases/m/b17acd74db.png': [{ t: 'hour', title: 'Time to test', fill: 4 }, { t: 'tests', items: [[1, '4/4', 'users were able to find the polls option'], [1, '4/4', 'users understood duration, adding an option and results'], [0, '3/4', 'users got confused by the send button for confirmation'], [0, '2/4', 'said sending a message every time made them self-conscious']] }],
  './site/cases/m/97ed7b801d.png': { t: 'list', items: ['As a user, I want to create a poll so that I can get the opinion of others on matters where a discussion isn’t needed.', 'As a user, I want to get to a decision from the poll as soon as possible.', 'As a user, I want to set an expiry time on the poll so that it closes automatically.', 'As a user, I want to close the poll manually.', 'As a user, I want to vote on the poll so that I can help make a decision and pick what suits me best.', 'As a user, my opinion or situation may change over time, and I might want to change my vote.', 'As a user, I want to select multiple options, depending on the question.', 'As a user, I want to add an option to an existing poll.', 'As a user, I want to jump to the current status of the poll to see its stats.', 'As a user, I want to know who opted for which option, for more insight into the decision.', 'As a user, I might want to declare the poll early, so the result can be shared before time runs out.', 'As a user, I want WhatsApp to declare the result automatically once every group member has voted.', 'As a user, I might want to edit the question or change the time, in case of a mistake.', 'As a user, I want to know when the poll has closed and a decision is made.', 'As a user, I want to know if there is a poll I haven’t responded to.', 'As a user, I want to easily get to the current live poll.'] },
  // WhatsApp Polls: who it is for, the principles, the decisions and the details, as text beside the screens.
  './site/cases/m/368c3e3cc7.png': { t: 'annotated', full: './site/cases/m/368c3e3cc7.png', kicker: 'Behaviour', title: 'Age 18–25', items: ['Uses WhatsApp for personal work.', 'Uses WhatsApp for general messaging with friends and family, and for communication in several groups.', 'Wants to spread a small poll in groups, plan an event, or get a quick opinion from friends or family on any topic.'],
    paras: ['<b>Top group:</b> friends and family'], pics: [{ src: './site/cases/media/whatsapp/persona.png', alt: 'Illustration of a young person with a phone and a social calendar.' }, { src: './site/cases/media/whatsapp/friends.png', alt: 'Illustration of a group of friends.' }] },
  './site/cases/m/fbe4b651bf.png': { t: 'annotated', full: './site/cases/m/fbe4b651bf.png', kicker: 'Key principles', ordered: true, items: [
    '<b>Avoid reducing the chat area further:</b> a majority of users used smaller phones.',
    '<b>Keep it scalable:</b> users might use polls for a varied set of data, in groups ranging from 3 to 50+ members.',
    '<b>Follow existing mental models:</b> a huge chunk of the audience might not use it regularly, so it needs an easy learning curve.'],
    pics: [{ src: './site/cases/media/whatsapp/wireframes.png', multiply: true, alt: 'Six wireframes: add poll, create poll, poll added, vote, response added, and any unread poll post.' }] },
  './site/cases/m/51d41f3244.png': { t: 'annotated', full: './site/cases/m/51d41f3244.png', kicker: 'Key decisions', ordered: true, items: [
    '<b>A new page, not a modal:</b> ample space for a cognition-heavy task, without distractions.',
    '<b>Accessibility:</b> using the existing mental model of attachments.',
    '<b>Poll duration selection:</b> most polls are casual rather than professional or survey-based, so a duration instead of an end time keeps it simple.'],
    pics: [{ src: './site/cases/media/whatsapp/decisions.png', alt: 'Poll in the attachment menu leads to a full Create Poll page; a Create poll shortcut in the chat header was rejected.' }] },
  './site/cases/m/37459532c3.png': { t: 'annotated', full: './site/cases/m/37459532c3.png', ordered: true, items: [
    '<b>Vote sent as a message:</b> better visibility of the votes, driving quick decisions.',
    '<b>Visibility of the top options:</b> for casual polls, seeing preferences helps users make a better decision.',
    '<b>Manual declare:</b> better control for the user, and faster decisions.'],
    pics: [{ src: './site/cases/media/whatsapp/poll-results.png', alt: 'A poll in the chat with votes, Vote and Declare Results; then the declared result, Monday with 9 votes.' }] },
  // My portfolio's story: the numbers and the new look. Its chapters have their own rail now (18-specimens).
  './site/cases/m/29ab381f3c.png': [],
  './site/cases/m/3f5c792968.png': { t: 'metrics', items: [['+35.36%', 'pages per session', '2.49 vs 1.84'], ['+17.22%', 'average session duration', '2 min 26 s vs 2 min 5 s'], ['−26.38%', 'bounce rate', '50.74% vs 68.93%']], note: 'Across 1,000 sessions, before and after the changes.' },
  './site/cases/m/d212501616.png': { t: 'palette', title: 'A new visual language', font: 'Playfair Display', words: ['Elegant', 'Bold'], colors: ['#38100F', '#6C2929', '#D12E11', '#FFEEEE'] },
  './site/cases/m/09460bd589.png': [],
  './site/cases/m/e4be2e07d9.png': { t: 'personas', items: [
    { src: './site/cases/media/promo/value-eater.png', name: 'Value Eater', tag: 'Primary user', body: 'High intent towards promos while searching for a restaurant.' },
    { src: './site/cases/media/promo/casual-value-seeker.png', name: 'Casual value seeker', body: 'Explores restaurants first; promos are a nice-to-have.' },
  ] },
  // Promo discovery: the funnels, the four pillars and how each milestone did, the words set as text
  // and the phones kept as pictures (cropped from these same slides into media/promo).
  './site/cases/m/32a692e04f.png': { t: 'annotated', full: './site/cases/m/32a692e04f.png', lead: '<b>Main funnels</b> targeting users with a Value Eating motive',
    items: [['Funnel 1', 'Universal offer listing'], ['Funnel 2', 'Promo tab']], pics: [{ src: './site/cases/media/promo/funnels-home.png', alt: 'The GoFood home page, with the promo entry point and the promo tab.' }] },
  './site/cases/m/ab07f3c163.png': { t: 'annotated', full: './site/cases/m/ab07f3c163.png', kicker: 'Funnel 1', ordered: true, items: [
    '<b>High visibility</b> on the home page and a ~9% click rate.',
    '<b>~88% of users</b> see only <b>1 promo</b>, leading to lower promo perception. (Called out in multiple user studies.)',
    'New users visit the page <b>3× more than the overall base</b>, but they don’t transact further and drop.',
    '<b>Poor funnel conversions (x/2)</b> in comparison to GoFood discovery (x).'],
    pics: [{ src: './site/cases/media/promo/funnel-1.png', alt: 'The home page offer listing leading to a “Promos for you” page with a single promo.' }] },
  './site/cases/m/637bd31945.png': { t: 'annotated', full: './site/cases/m/637bd31945.png', kicker: 'Funnel 2', ordered: true, items: [
    '<b>Low click rate (~1%):</b> many users missed the promo tab despite a strong intent to find deals.',
    '<b>Average conversion:</b> session conversions comparable to the main GoFood funnel, though promos were expected to convert higher.',
    '<b>Cluttered with duplicates:</b> redundant shuffles bloated the page, with no clear value proposition.'],
    pics: [{ src: './site/cases/media/promo/funnel-2.png', alt: 'The old promo tab, a long list of repeated restaurant shuffles.' }] },
  './site/cases/m/6b4c9bc807.png': { t: 'annotated', full: './site/cases/m/6b4c9bc807.png', steps: PROMO_PILLARS, at: 0, stepsLabel: 'Four pillars of the promo page', title: 'Value recall',
    lead: 'Show the best promos first, so people can decide quickly.',
    pics: [{ src: './site/cases/media/promo/value-recall-sketch.png', blend: true, alt: 'Sketch: someone sees “Save up to 50% off on these restos”, and comes back the next day to look again.' },
      { src: './site/cases/media/promo/value-recall.png', alt: 'The new promo page header: get 50% off up to 30k on these restos.' }] },
  './site/cases/m/3e631ada55.png': { t: 'annotated', full: './site/cases/m/3e631ada55.png', steps: PROMO_PILLARS, at: 1, stepsLabel: 'Four pillars of the promo page', title: 'Targeted promos', items: [
    ['Insight', 'Our funnel analysis revealed that reorder promotions were the highest-performing shuffles, with conversion rates surpassing all others on the previous page.'],
    ['Action', 'I proposed a dedicated space featuring personalised promotions and vouchers from users’ favourite restaurants, to drive even higher engagement.']],
    pics: [{ src: './site/cases/media/promo/targeted-promos.png', alt: 'Promos on your favourite restos, and your vouchers.' }] },
  './site/cases/m/fe097928ad.png': { t: 'annotated', full: './site/cases/m/fe097928ad.png', steps: PROMO_PILLARS, at: 2, stepsLabel: 'Four pillars of the promo page', title: 'Innovation hub', items: [
    ['Insight', 'Click rate and conversion data for all the shuffles.'],
    ['Action 1', 'Remove repetitive shuffles and double down on the shuffles performing well.'],
    ['Action 2', 'Keep the space for all marketing, and for different types of promos targeting different user needs.']],
    pics: [{ src: './site/cases/media/promo/innovation-hub-chart.png', blend: true, cap: 'Data insights: funnel analysis 2', alt: 'Bar chart of events per shuffle, falling steeply after the first two.' },
      { src: './site/cases/media/promo/innovation-hub.png', alt: 'Best promos near you, deals ending soon, and promos by dish.' }] },
  './site/cases/m/015bab93a4.png': { t: 'annotated', full: './site/cases/m/015bab93a4.png', steps: PROMO_PILLARS, at: 3, stepsLabel: 'Four pillars of the promo page', title: 'Infinite list', items: [
    ['Hypothesis', 'Extended visibility of options can increase session duration, and ultimately drive higher conversion rates for promotions.'],
    ['Action', 'An endless list of promos, so browsing never hits a dead end.']],
    pics: [{ src: './site/cases/media/promo/infinite-list.png', alt: 'Payment methods to save extra, then an endless list of restos with promos, with filters.' }] },
  './site/cases/m/5be17a8765.png': { t: 'outcomes', full: './site/cases/m/5be17a8765.png', title: 'Performance of different milestones', items: [
    { tag: 'Uplift', tone: 'up', src: './site/cases/media/promo/outcome-uplift.png', alt: 'The promo header and “save most with these promos”.' },
    { tag: 'Same', tone: 'same', src: './site/cases/media/promo/outcome-same.png', alt: 'Promos on your favourite restos, and vouchers just for you.' },
    { tag: 'Decline', tone: 'down', src: './site/cases/media/promo/outcome-decline.png', alt: 'Deals ending soon, with a fixed timer.', note: '<b>Hypothesis:</b> we had omitted the creation of a dynamic timer.' }] },
}
// The four pillars of the promo page, laid out as their slides were: the words on the left, and the big phone on
// the right, cut by the slide's edge just where the original was. The phone is the slide's own strip, full height.
{
  const ids = ['6b4c9bc807', '3e631ada55', 'fe097928ad', '015bab93a4'].map(h => `./site/cases/m/${h}.png`)
  const panels = ids.map(id => PAGE_SWAPS[id]).filter(Boolean)
  if (panels.length === 4) {
    panels.forEach(P => { const phone = P.pics.find(pic => !pic.blend); P.phone = phone && { src: phone.src.replace(/\.png$/, '-phone.png'), alt: phone.alt, h: { 'value-recall': 872, 'targeted-promos': 658, 'innovation-hub': 854, 'infinite-list': 764 }[phone.src.match(/promo\/([a-z-]+)\.png$/)?.[1]] || 800 }; P.pics = P.pics.filter(pic => pic.blend) })
    PAGE_SWAPS[ids[0]] = { t: 'pillars', label: panels[0].stepsLabel || 'Four pillars', panels }
    ids.slice(1).forEach(id => { PAGE_SWAPS[id] = [] })
  }
}
function fixedBlocks(doc, blocks) {
  if (!BATCH.pageFixes) return blocks.slice()
  const F = PAGE_FIXES[doc] || [], fix = h => F.reduce((s, [a, b]) => s.split(a).join(b), h)
  return blocks.flatMap(b => PAGE_SWAPS[b.src] || (b.html ? { ...b, html: fix(b.html) } : b.items ? { ...b, items: b.items.map(fix) } : b.rows ? { ...b, rows: b.rows.map(r => r.map(fix)) } : b))
}
const caseSwitches = (uid, labels, name, selected = 1) => `<div class="case-switches" role="group" aria-label="${name}">${labels.map((label, i) => `<button data-case-select="${uid}-${i}" aria-controls="${uid}-${i}" aria-pressed="${i === selected}">${label}</button>`).join('')}</div>`
function caseInteraction(b, uid) {
  // A slide of words beside a phone, taken apart: the words set as text, the screens kept as pictures;
  // sketches and charts (blend) sit under the words, on the paper itself.
  // Every picture opens the original slide, so nothing from it is lost.
  if (b.t === 'pillars') {
    const ids = b.panels.map((P, i) => `${uid}-pillar-${i}`)
    return `<div class="case-pillars" aria-label="${caseAttr(b.label)}">` + b.panels.map((P, i) => {
      const steps = `<nav class="pl-steps" aria-label="${caseAttr(b.label)}">${b.panels.map((Q, k) => k === i
        ? `<span class="pl-on" aria-current="step">${k + 1}. ${keep(Q.title)}</span>` : `<button data-case-jump="${ids[k]}" aria-label="${caseAttr(`${k + 1}. ${Q.title}`)}">${k + 1}</button>`).join('')}</nav>`
      const copy = caseInteraction({ ...P, t: 'annotated', steps: null, title: null, layout: 'below' }, `${uid}-${i}`)
      return `<article class="pl-slide rise" id="${ids[i]}" aria-label="${caseAttr(P.title)}" style="--pr:574 / ${P.phone?.h || 800}; --pk:${(P.phone?.h || 800) / 574}" data-cut="${/value-recall/.test(P.phone?.src) ? 'bottom' : /infinite-list/.test(P.phone?.src) ? 'top' : 'both'}"><div class="pl-copy">${steps}${copy}</div>`
        + (P.phone ? `<button class="pl-phone" data-zoom="${abs(P.full)}" aria-label="${caseAttr('Open the original slide: ' + P.title)}"><img src="${abs(P.phone.src)}" alt="${caseAttr(P.phone.alt)}" loading="lazy" decoding="async"></button>` : '') + '</article>'
    }).join('') + '</div>'
  }
  if (b.t === 'annotated') {
    const item = x => Array.isArray(x) ? `<li><b>${keep(x[0])}:</b> ${keep(x[1])}</li>` : `<li>${keep(x)}</li>`
    const list = (items, ordered) => `<${ordered ? 'ol' : 'ul'}${items.every(Array.isArray) ? ' class="an-pairs"' : ''}>${items.map(item).join('')}</${ordered ? 'ol' : 'ul'}>`
    const pic = p => `<figure class="an-pic${p.blend ? ' blend' : ''}${p.card ? ' card' : ''}${p.multiply ? ' mult' : ''}${p.screen ? ' screen' : ''}${(p.cut || '').split(' ').filter(Boolean).map(c => ' cut-' + c).join('')}"><button data-zoom="${abs(b.full || p.src)}" aria-label="${caseAttr('Enlarge: ' + (p.alt || 'the original slide'))}"><img src="${abs(p.src)}" alt="${caseAttr(p.alt)}" loading="lazy" decoding="async"></button>${p.cap ? `<figcaption>${keep(p.cap)}</figcaption>` : ''}</figure>`
    return `<div class="case-annot rise${b.layout ? ' ' + b.layout : ''}">${b.steps ? `<ol class="an-steps" aria-label="${caseAttr(b.stepsLabel || 'Steps')}">${b.steps.map((s, i) => `<li${i === b.at ? ' aria-current="step"' : ''}><span>${i + 1}</span>${keep(s)}</li>`).join('')}</ol>` : ''}`
      + `<div class="an-text">${b.kicker ? `<p class="an-k">${keep(b.kicker)}</p>` : ''}${b.title ? `<h3>${keep(b.title)}</h3>` : ''}${b.lead ? `<p class="an-lead">${keep(b.lead)}</p>` : ''}`
      + `${b.items ? list(b.items, b.ordered) : ''}${(b.paras || []).map(x => `<p>${keep(x)}</p>`).join('')}`
      + `${b.quotes ? `<div class="an-quotes">${b.quotes.map(q => `<blockquote>${keep(q)}</blockquote>`).join('')}</div>` : ''}`
      + `${b.then ? `<p class="an-then">${keep(b.then.label)}</p>${list(b.then.items, true)}` : ''}${b.pics.filter(p => p.blend).map(pic).join('')}</div>`
      + `<div class="an-pics">${b.pics.filter(p => !p.blend).map(pic).join('')}</div></div>`
  }
  // A short film of the system: muted and looping, still for anyone who prefers less motion.
  if (b.t === 'reel') return `<figure class="ph large rise case-reel"><video src="${abs(b.src)}" poster="${abs(b.poster)}" muted loop playsinline preload="metadata" controls${matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : ' autoplay'} aria-label="${caseAttr(b.alt)}" width="${Number(b.width)}" height="${Number(b.height)}"></video>${b.cap ? `<figcaption>${keep(b.cap)}</figcaption>` : ''}</figure>`
  // A few points that matter most, each with a large figure: a 2×2 grid on the paper, hairlines between.
  if (b.t === 'highlights') return `<dl class="case-highlights rise" aria-label="${caseAttr(b.label)}">${b.items.map(([n, what, line], i) => `<div style="--i:${i}"><dt>${keep(n)}</dt><dd><b>${keep(what)}</b><span>${keep(line)}</span></dd></div>`).join('')}</dl>`
  // A short loop, smaller than a full screen, with what it taught set above it as flags. Still for anyone who prefers less motion.
  if (b.t === 'motion') return `<figure class="case-motion rise">`
    + `<video src="${abs(b.src)}" poster="${abs(b.poster)}" muted loop playsinline preload="metadata"${matchMedia('(prefers-reduced-motion: reduce)').matches ? ' controls' : ' autoplay'} aria-label="${caseAttr(b.alt)}" width="${Number(b.width)}" height="${Number(b.height)}"></video>`
    + `${b.cap ? `<figcaption>${keep(b.cap)}</figcaption>` : ''}`
    + `${b.pills ? `<div class="mo-flags" aria-label="${caseAttr(b.label || 'Notes')}">${b.label ? `<span class="mo-k">${keep(b.label)}</span>` : ''}${b.pills.map(x => `<span class="mo-flag"><i aria-hidden="true">⚑</i>${keep(x)}</span>`).join('')}</div>` : ''}</figure>`
  // A UI card with its problems called out: highlighted lines, labels with leader lines on the left, and a bracket on
  // the right. placeNotes() draws the lines to wherever the text wraps; on a phone the labels become a key.
  // A story told as a storyboard sheet: numbered frames in fine ink on hatched paper, the real artifacts as the drawings,
  // and hand-lettered notes with arrows pointing at what matters. Frames read left to right; on a phone they stack.
  if (b.t === 'strip') {
    // One two-column grid for the whole board: who is speaking (portrait, kicker, title), then what they see.
    const [ctx, ...pair] = b.panels, img = F => `<img src="${abs(F.src)}" alt="${caseAttr(F.alt)}" loading="lazy" decoding="async">`
    const arrow = `<svg class="sb-arrow" viewBox="0 0 60 24" aria-hidden="true"><path d="M3 14 C 18 4, 36 4, 52 12" /><path d="M44 5 L53 12 L43 17" /></svg>`
    const who = (portrait, kicker, title) => `<div class="sb-who">${portrait ? `<img class="sb-portrait" src="${abs(portrait)}" alt="" width="56" height="56">` : ''}<p class="sb-label"><span>${keep(kicker)}</span>${keep(title)}</p></div>`
    const side = (F, i) => `<div class="sb-side sb-${F.art}"><p class="sb-state"><span>${keep(F.kicker)}</span>${keep(F.title)}</p>`
      + `<div class="sb-frame">${i ? arrow : ''}<div class="sb-shot">${img(F)}<span class="sb-mark ${F.art === 'before' ? 'sb-hl' : 'sb-ring'}">${F.tag ? `<span class="sb-tag">${keep(F.tag)}</span>` : ''}</span></div></div>`
      + `<p class="sb-cap">${keep(F.text)}</p></div>`
    return `<figure class="case-board rise" aria-label="${caseAttr(b.label)}">`
      + `<div class="sb-row sb-ctx"><div class="sb-chat"><p class="sb-bubble">${keep(ctx.quote)}</p><p class="sb-meta">${keep(ctx.from)}</p></div>`
      + `<div class="sb-ctxtext">${who(ctx.portrait, ctx.kicker, ctx.title)}<p class="sb-cap">${keep(ctx.text)}</p></div></div>`
      + `<div class="sb-pairhead">${who(b.pairPortrait, b.pairKicker || 'Meanwhile', b.pairTitle)}</div>`
      + `<div class="sb-row sb-pair">${side(pair[0], 0)}${side(pair[1], 1)}</div>`
      + `${b.view ? photo(b.view.src, 'large', b.view.cap, b.view.alt) : ''}`
      + `${b.punch ? `<figcaption class="sb-punch">${keep(b.punch)}</figcaption>` : ''}</figure>`
  }
  if (b.t === 'notes') { const C = b.card
    return `<figure class="case-notes rise" data-notes>${b.tag ? `<p class="cn-tag${b.tagTone ? ' ' + b.tagTone : ''}">${keep(b.tag)}</p>` : ''}${b.kicker ? `<p class="cn-kick">${b.kicker.map(keep).join('<span aria-hidden="true">|</span>')}</p>` : ''}<div class="cn-stage">`
      // Three kinds of card: the old paragraph summary (parts of its text highlighted), the new insight card, and the
      // feedback form that sits on it.
      + (C.kind === 'feedback'
        ? `<div class="cn-card cn-fb"><p class="fb-q">${keep(C.question)}</p><div class="fb-faces" data-note="0">${C.faces.map((f, i) => `<span class="ms${i === C.chosen ? ' on' : ''}" aria-hidden="true">${f}</span>`).join('')}</div>`
          + `<div class="fb-tags" data-note="1">${C.tags.map(t => `<span class="fb-tag"><i aria-hidden="true"></i>${keep(t)}</span>`).join('')}</div>`
          + `<p class="fb-box" data-note="2">${keep(C.placeholder)}</p><p class="fb-btn">${keep(C.button)}</p></div>`
        : C.kind === 'insight'
        ? `<div class="cn-card cn-insight"><p class="ci-head" data-note="0"><span class="ms" aria-hidden="true">auto_awesome</span><b>${keep(C.title)}</b><span class="ci-when">${keep(C.when)}</span></p>`
          + `<div class="ci-row">${C.insights.map(([t, src]) => `<p class="ci-ins">${keep(t)} ${src.map((n, k) => `<span class="ci-src"${k === 0 && C.insights[0][1] === src ? ' data-note="1"' : ''}>${n}</span>`).join(' ')}</p>`).join('')}</div>`
          + `<p class="ci-owner"><span class="ci-av">${keep(C.initials)}</span>${keep(C.owner)}<span class="ci-all">View all ▾</span></p>`
          + `<div class="ci-tasks" data-note="2">${C.tasks.map(([t, w]) => `<span class="ci-task"><b>${keep(t)}</b><em>${keep(w)}</em><span class="ms" aria-hidden="true">check_circle</span></span>`).join('')}</div></div>`
        : `<div class="cn-card"><p class="cn-meta"><span>${keep(C.meta)}</span><span class="cn-thumbs" aria-hidden="true"><span class="ms">thumb_down</span><span class="ms">thumb_up</span></span></p><p class="cn-name">${keep(C.name)}</p>`
          + `<p class="cn-text">${C.parts.map(([text, tone], i) => tone ? `<mark class="cn-${tone}" data-note="${i}">${keep(text)}</mark>` : keep(text)).join(' ')}</p><p class="cn-more">⌄ ${keep(C.more)}</p></div>`)
      + (C.notes ? C.notes.map(([tone, note], i) => `<span class="cn-note cn-${tone}" data-for="${i}"><span>${keep(note)}</span><i aria-hidden="true"></i></span>`).join('')
        : C.parts.map(([, tone, note], i) => tone ? `<span class="cn-note cn-${tone}" data-for="${i}"><span>${keep(note)}</span><i aria-hidden="true"></i></span>` : '').join(''))
      + `${b.side ? `<span class="cn-side"><i aria-hidden="true"></i><span>${keep(b.side)}</span></span>` : ''}</div>`
      + `${b.cap ? `<figcaption>${keep(b.cap)}</figcaption>` : ''}</figure>` }
  // The staged path: one card per milestone, with where each one stands.
  if (b.t === 'milestones') return `<ol class="case-milestones rise" aria-label="${caseAttr(b.label)}">${b.items.map(([k, title, status], i) => `<li class="${i === b.items.length - 1 ? 'next' : 'done'}" style="--i:${i}">`
    + `<p class="ms-k">${keep(k)}</p><p class="ms-t">${keep(title)}</p><p class="ms-s">${keep(status)}</p></li>`).join('')}</ol>`
  // How each milestone did, side by side: what rose, what held, what fell, and why.
  if (b.t === 'outcomes') return `<figure class="case-outcomes rise" style="--n:${b.items.length};--oimg:${Number(b.imgMax) || 217}px"><figcaption class="oc-title">${keep(b.title)}</figcaption><ul>${b.items.map((o, i) => `<li class="oc-${o.tone}" style="--i:${i}">`
    + `<p class="oc-tag">${keep(o.tag)}</p><button data-zoom="${abs(b.full || o.src)}" aria-label="${caseAttr('Enlarge: ' + o.alt)}"><img src="${abs(o.src)}" alt="${caseAttr(o.alt)}" loading="lazy" decoding="async"></button>${o.note ? `<p class="oc-note">${keep(o.note)}</p>` : ''}</li>`).join('')}</ul></figure>`
  if (b.t === 'results') return `<div class="case-results rise"><dl>${b.items.map(([n, l]) => `<div><dt>${keep(n)}</dt><dd>${keep(l)}</dd></div>`).join('')}</dl>`
    + `<img src="${abs(b.src)}" alt="${caseAttr(b.alt)}" loading="lazy" decoding="async"></div>`
  if (b.t === 'callout') return `<aside class="case-callout ${b.tone || ''} rise">${b.src ? `<img src="${abs(b.src)}" alt="" loading="lazy" decoding="async">` : ''}<div>${b.kicker ? `<p class="callout-k">${keep(b.kicker)}</p>` : ''}<p class="callout-t">${keep(b.text)}</p></div></aside>`
  if (b.t === 'venn') return `<figure class="case-venn rise"><blockquote>${keep(b.quote)}</blockquote><div class="venn" role="img" aria-label="${caseAttr(`${b.middle}: where ${b.left.toLowerCase()} and ${b.right.toLowerCase()} overlap`)}">`
    + `<span class="venn-a"><i>${keep(b.left)}</i></span><span class="venn-b"><i>${keep(b.right)}</i></span><b>${keep(b.middle)}</b></div></figure>`
  if (b.t === 'funnel') { const S = b.steps, node = (k, cls = '') => `<div class="fn-${k} ${cls}"><strong>${keep(S[k][0])}</strong><span>${keep(S[k][1])}</span>${S[k][2] ? `<small>${keep(S[k][2])}</small>` : ''}</div>`
    return `<figure class="case-funnel rise"><div class="fn-head"><p>${keep(b.title)}</p>${b.head.map(([n, l], i) => `<div${i ? ' class="up"' : ''}><strong>${keep(n)}</strong><span>${keep(l)}</span></div>`).join('')}</div>`
      + `<div class="fn-flow">${node('start')}<i class="fn-arrow a1" aria-hidden="true"></i>${node('bought')}<i class="fn-arrow a2" aria-hidden="true"></i>${node('left')}<i class="fn-arrow a3" aria-hidden="true"></i>${node('back', 'up')}<i class="fn-arrow a4" aria-hidden="true"></i>${node('total', 'sum')}</div></figure>` }
  if (b.t === 'compare') return `<div class="case-compare rise" role="region" aria-label="${caseAttr(b.label)}" tabindex="0"><table><thead><tr><th><span class="visually-hidden">App</span></th>${b.cols.map(c => `<th scope="col">${keep(c)}</th>`).join('')}</tr></thead>`
    + `<tbody>${b.rows.map(([name, ...v]) => `<tr${name === b.own ? ' class="own"' : ''}><th scope="row">${keep(name)}</th>${v.map(x => `<td>${x ? '<span class="tick" aria-label="Yes">✓</span>' : '<span class="no" aria-label="No">–</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
  if (b.t === 'process') return `<figure class="case-process rise" aria-label="${caseAttr([...b.loop, ...b.then].join(', then ') + ', and ' + b.back.toLowerCase())}"><div class="pr-loop">${b.loop.map((x, i) => `<span style="--i:${i}">${keep(x)}</span>`).join('')}<i aria-hidden="true">↻</i></div>`
    + b.then.map(x => `<i class="pr-arrow" aria-hidden="true">→</i><span class="pr-step">${keep(x)}</span>`).join('') + `<p class="pr-back"><span aria-hidden="true">↺</span> ${keep(b.back)}</p></figure>`
  if (b.t === 'hour') return `<div class="case-hour rise"><span class="hour-clock" style="--f:${b.fill / 4}" aria-hidden="true"><i></i></span>${b.n ? `<p class="hour-n">${keep(b.n)}</p>` : ''}<h3>${keep(b.title)}</h3></div>`
  if (b.t === 'tests') return `<ul class="case-tests">${b.items.map(([good, n, t], i) => `<li class="${good ? 'good' : 'bad'} rise" style="--i:${i}"><strong>${keep(n)}</strong> ${keep(t)}</li>`).join('')}</ul>`
  if (b.t === 'jump') return `<nav class="case-jump rise" aria-label="${caseAttr(b.title)}"><p class="jump-t">${keep(b.title)}</p><p class="jump-b">${keep(b.body)}</p><ul>${b.items.map(x => `<li><button data-case-jump="${headId(x)}">${keep(x)} <span aria-hidden="true">↓</span></button></li>`).join('')}</ul></nav>`
  if (b.t === 'palette') return `<figure class="case-palette rise"><p class="pal-plus" aria-hidden="true">+</p><p class="pal-title">${keep(b.title)}</p><div class="pal-type" style="--pf:'${b.font}'"><span class="pal-bg" aria-hidden="true">${b.words.map(w => `<i>${keep(w)}</i>`).join('')}</span><b>Aa</b><span class="pal-name">${keep(b.font)}</span></div>`
    + `<ul class="pal-sw">${b.colors.map(c => `<li style="--sw:${c}"><span>${c}</span></li>`).join('')}</ul></figure>`
  if (b.t === 'problem') return `<div class="case-problem rise"><p class="problem-lead">${keep(b.lead)}</p><ul>${b.items.map(x => `<li>${keep(x)}</li>`).join('')}</ul></div>`
  if (b.t === 'methods') return `<div class="case-methods rise"><p class="data-label">${keep(b.label)}</p><ol>${b.items.map((x, i) => `<li><span class="route-seal" aria-hidden="true">${i + 1}</span>${keep(x)}</li>`).join('')}</ol></div>`
  if (b.t === 'personas') return `<div class="case-personas">${b.items.map((p, i) => `<article class="persona rise" style="--i:${i}"><img src="${abs(p.src)}" alt="" loading="lazy" decoding="async">`
    + `<div>${p.tag ? `<p class="persona-tag">${keep(p.tag)}</p>` : ''}<h3>${keep(p.name)}</h3><p>${keep(p.body)}</p></div></article>`).join('')}</div>`
  // Before and after as a wipe: the earlier screen laid over the new one, with a divider to drag between them.
  // The screens are shown no wider than their pixels allow, so they stay sharp.
  if (b.t === 'slides') { const [before, after] = b.states
    return `<figure class="case-wipe rise" data-wipe style="--pos:50%"><div class="wipe-stage" style="aspect-ratio:${b.ratio || '1.56'}">`
      // Each tag sits with its own screen, so the divider covers and uncovers it along with the picture. The slider
      // compares stills, which line up; a state's caption opens its deck GIF (gif), where the deck has one.
      + `<img class="wipe-img" src="${abs(after.src)}" alt="${caseAttr(after.alt)}" loading="lazy" decoding="async"><span class="wipe-tag after" aria-hidden="true">${keep(after.tag || 'After')}</span>`
      + `<div class="wipe-before"><img class="wipe-img" src="${abs(before.src)}" alt="${caseAttr(before.alt)}" loading="lazy" decoding="async"><span class="wipe-tag before" aria-hidden="true">${keep(before.tag || 'Before')}</span></div>`
      + `<span class="wipe-handle" aria-hidden="true"><i>‹ ›</i></span>`
      + `<input class="wipe-range" type="range" min="0" max="100" value="50" aria-label="${caseAttr(b.label || 'Before and after')}: drag left to reveal ${caseAttr(after.tag || 'after')}, right to reveal ${caseAttr(before.tag || 'before')}"></div>`
      + `<div class="wipe-caps">${[before, after].map(s => `<button data-zoom="${abs(s.gif || s.src)}"><b>${keep(s.tag)}</b> ${keep(s.label)} <span aria-hidden="true">· ${s.gif ? 'watch it move' : 'full size'} ↗</span></button>`).join('')}</div>`
      + `${b.note ? `<figcaption>${keep(b.note)}</figcaption>` : ''}</figure>` }
  // A design system taken apart: each piece of the board flies in to its place. Pointing at one (or tapping it)
  // takes it apart beside the board: its elements, rebuilt as live UI from the layers of the deck's vector slide.
  if (b.t === 'system') {
    const [ox, oy, W, H] = b.frame
    return `<figure class="case-system" data-system><div class="sys-stage"><div class="sys-board" style="aspect-ratio:${W} / ${H}">`
      + b.pieces.map((p, i) => { const [x, y, w, h] = p.box, cx = (x - ox + w / 2) / W - .5, cy = (y - oy + h / 2) / H - .5
        return `<button class="sys-piece" data-zoom="${abs(p.src)}" data-piece="${i}" data-key="${caseAttr(p.key)}" data-note="${caseAttr(p.note)}" aria-label="${caseAttr(p.label + ': ' + p.note)}"`
          + ` style="left:${((x - ox) / W * 100).toFixed(2)}%;top:${((y - oy) / H * 100).toFixed(2)}%;width:${(w / W * 100).toFixed(2)}%;height:${(h / H * 100).toFixed(2)}%;--i:${i};--fx:${Math.round(cx * 140)}%;--fy:${Math.round(cy * 160)}%;--fr:${i % 2 ? 7 : -6}deg">`
          + `<img src="${abs(p.src)}" alt="${caseAttr(p.label)}" loading="lazy" decoding="async"></button>` }).join('')
      + `</div><div class="sys-pop" aria-live="polite"></div></div>${b.cap ? `<figcaption>${keep(b.cap)}</figcaption>` : ''}</figure>`
  }
  if (b.t === 'fold') return `<details class="case-detail case-fold"><summary>${keep(b.label)}</summary><div class="case-fold-body">${b.blocks.map((child, i) => child.t === 'p' ? `<p>${keep(child.html)}</p>` : child.t === 'h3' ? `<h3>${keep(child.text)}</h3>` : child.t === 'img' ? photo(child.src, child.size === 'portrait' ? 'portrait' : 'text', child.cap, child.alt) : caseInteraction(child, `${uid}-${i}`)).join('')}</div></details>`
  if (b.t === 'animation') return `<figure class="ph case-animation"><div class="animation-frame"><img src="${abs(b.src)}" alt="${caseAttr(b.alt)}" width="${Number(b.width)}" height="${Number(b.height)}" loading="lazy" decoding="async"></div><div class="animation-controls"><button data-case-animation data-gif="${abs(b.src)}" data-poster="${abs(b.poster)}" aria-pressed="true">Stop animation</button><a href="${abs(b.original || b.src)}" target="_blank" rel="noopener">Open original GIF ↗</a></div><figcaption>${keep(b.cap)}</figcaption></figure>`
  if (b.t === 'evidence-stats' || b.t === 'estimate') return `<aside class="case-data${b.t === 'estimate' ? ' estimate' : ''}" aria-label="${caseAttr(b.label)}"><p class="data-label">${keep(b.label)}</p><dl>${b.stats.map(([n, label, note]) => `<div><dt>${keep(n)}</dt><dd><b>${keep(label)}</b><span>${keep(note)}</span></dd></div>`).join('')}</dl>${b.note ? `<p class="data-note">${keep(b.note)}</p>` : ''}</aside>`
  if (b.t === 'voices') {
    const quote = q => `<figure class="case-quote"><blockquote>${keep(q.text)}</blockquote><figcaption>${keep(q.who)}</figcaption></figure>`
    const visual = item => `<figure class="testimonial-image"><div class="screen-frame"><img src="${abs(item.src)}" alt="${caseAttr(item.alt)}" loading="lazy" decoding="async"></div><figcaption>${keep(item.caption)}</figcaption></figure>`
    const visuals = [b.image && { src: b.image, alt: b.imageAlt, caption: b.imageCaption }, b.supportImage].filter(Boolean)
    return `<section class="case-testimonials${visuals.length ? ' with-visual' : ' text-only'}" aria-label="${caseAttr(b.label)}"><p class="testimonial-label">${keep(b.label)}</p>${visuals.length ? `<div class="testimonial-visuals">${visuals.map(visual).join('')}</div>` : ''}<div class="testimonial-quotes">${b.quotes.map(quote).join('')}</div></section>`
  }
  if (b.t === 'accuracy') return `<aside class="case-accuracy" aria-label="AI correctness in evaluation"><div><strong>${keep(b.display)}</strong><span>${keep(b.label)}</span></div><div><div class="accuracy-bar" role="img" aria-label="${caseAttr(b.value)} percent correct; ${caseAttr((100 - b.value).toFixed(2))} percent incorrect"><span style="width:${Number(b.value)}%"></span></div><div class="accuracy-key"><span>Correct · ${keep(b.value)}%</span><span>Incorrect · ${(100 - b.value).toFixed(2)}%</span></div><p>${keep(b.body)}</p></div></aside>`
  if (b.t === 'findings') return `<div class="case-findings"><h3>${keep(b.label)}</h3><p><b>Useful:</b> ${keep(b.positive)}</p><p><b>Still unreliable:</b> ${keep(b.negative)}</p>${b.examples?.length ? `<details class="case-detail"><summary>Three misses from the evaluation</summary><ol>${b.examples.map(([title, text]) => `<li><b>${keep(title)}</b><p>${keep(text)}</p></li>`).join('')}</ol></details>` : ''}</div>`
  if (b.t === 'journey') return `<nav class="case-route" aria-label="The path to next best action"><ol>${b.items.map((item, i) => `<li><button data-case-jump="${caseAttr(item.target)}"><span class="route-seal" aria-hidden="true">${two(i + 1)}</span><b>${keep(item.label)}</b><small>${keep(item.status)}</small></button></li>`).join('')}</ol></nav>`
  if (b.t === 'comparison') return `<figure class="case-visual-compare">${b.states.map((state, i) => `<div class="comparison-state"><p><span>${two(i + 1)}</span>${keep(state.label)}</p>${state.screen ? screenPhoto(state.detailSrc || state.src, 'large', state.cap, state.alt, state.src) : photo(state.src, 'large', state.cap, state.alt)}</div>`).join('')}<figcaption>${keep(b.note)}</figcaption></figure>`
  if (b.t === 'evidence-pair') return `<div class="case-evidence-pair${b.even ? ' even' : ''}">${b.items.map(item => `<div class="evidence-pair-item"><p>${keep(item.label)}</p>${photo(item.src, 'large', item.cap, item.alt)}</div>`).join('')}</div>`
  if (b.t === 'disclosure') return `<details class="case-detail"><summary>${keep(b.label)}</summary><p>${keep(b.body)}</p>${b.images.map(im => photo(im.src, 'text', im.cap, im.alt)).join('')}</details>`
  if (b.t === 'specimen') return specimenHTML(b)
  return ''
}
// The body: one numbered section per heading. With `page`, a cover that only repeats the
// title is left out when the page opens on the final design instead, as the website does.
function caseBody(id, page) {
  const L = letterOf(id), data = L && FULLCASE_DATA[L.doc]
  if (!data) return (L?.cases || []).map((c, i) => `<section><p class="pnum">${two(i + 1)}</p><h2>${c.k}</h2>${c.body ? `<p>${c.body}</p>` : ''}${c.list ? `<ul>${c.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}`
    + (c.video ? clip(c.video) : c.img ? photo(c.img) : '') + '</section>').join('')
  const blocks = fixedBlocks(L.doc, data.blocks)
  if (page && PAGES[L.doc]?.hero) { const i = blocks.findIndex(b => b.t === 'img'); if (i >= 0 && i < 2) blocks.splice(i, 1) }
  let out = '', n = 0, interaction = 0
  for (const b of blocks) {
    if (b.t === 'h') out += `${n ? '</section>' : ''}<section id="${caseAttr(b.id || headId(b.text))}"><p class="pnum">${two(++n)}${b.eyebrow ? ` · ${keep(b.eyebrow)}` : ''}</p><h2>${keep(b.text)}</h2>`
    else if (b.t === 'h3') out += `<h3>${keep(b.text)}</h3>`
    else if (b.t === 'p') out += `<p>${keep(b.html)}</p>`
    else if (b.t === 'list') { const tag = b.ordered ? 'ol' : 'ul'; out += `<${tag}>${b.items.map(x => `<li>${keep(x)}</li>`).join('')}</${tag}>` }
    else if (b.t === 'table') out += `<table>${b.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${keep(c)}</td>` : `<th>${keep(c)}</th>`).join('')}</tr>`).join('')}</table>`
    else if (b.t === 'img') out += photo(b.src, b.size === 'portrait' ? 'portrait' : b.size === 'text' ? 'text' : b.size === 'wide' ? 'wide' : 'large', b.cap, b.alt)
    else if (b.t === 'gallery') out += `<div class="gal rise${b.size === 'wide' ? ' wide' : ''}">${b.srcs.map((s, i) => photo(s, 'small', b.caps?.[i])).join('')}</div>`
    else if (b.t === 'video') out += clip(b.src)
    else if (b.t === 'metrics') out += `<dl class="pmetrics rise">${b.items.map(([n, what, from]) => `<div><dt>${n}</dt><dd><b>${what}</b>${from}</dd></div>`).join('')}</dl>${b.note ? `<p class="metrics-note">${keep(b.note)}</p>` : ''}`
    else out += caseInteraction(b, `${L.doc}-evidence-${++interaction}`)
  }
  return out + (n ? '</section>' : '')
}
const readMins = html => {
  const content = document.createElement('template'); content.innerHTML = html
  content.content.querySelectorAll('details, [hidden]').forEach(el => el.remove())
  return Math.max(2, Math.round(content.content.textContent.trim().split(/\s+/).length / 200))
}
// Who a page is from: the company it was written at, or my own field notes.
const fromOf = L => L.realm && !L.blog ? realmBy[L.realm] : { name: 'Field notes', years: '', role: '', hue: 320, sig: 'quill' }
const plain = h => String(h).replace(/<[^>]+>/g, '')
function pageHTML(id) {
  const L = letterOf(id), from = fromOf(L), P = PAGES[L.doc] || {}, body = caseBody(id, true), mins = readMins(body)
  const order = L.blog ? BLOG_ORDER : CASE_ORDER, at = order.indexOf(id), kind = L.blog ? 'field note' : 'case study'
  const head = L.blog
    ? `<header class="phero blog">${P.icon ? `<div class="picon"${P.iconBg ? ` style="background:${P.iconBg}"` : ''}><img src="${abs(P.icon)}" alt=""${P.iconBg ? ` style="padding:${Math.round((P.iconPad ?? 11) * 1.3)}px"` : ' class="logo-fill"'}></div>` : ''}<p class="pkick">Field note ${two(P.n || 1)} · ${P.tag || 'Writing'} · ${mins} min read</p>`
      + `<h1>${P.title || L.title}</h1>${P.stand ? `<p class="pstand">${P.stand}</p>` : ''}</header>`
    : `<header class="phero case${P.desktopHero ? ' desktop-product' : ''}"><div class="ptext"><p class="pkick">${crest(from.hue, from.sig)}<span>${from.name}</span></p><h1>${P.title || L.title}</h1>`
      + `${P.summary ? `<p class="psum">${P.summary}</p>` : ''}${P.chips ? `<dl class="pchips">${P.chips.map(([b, t]) => `<div><dt>${b}</dt><dd>${t}</dd></div>`).join('')}</dl>` : ''}<p class="pmeta">${from.role} · ${mins} min read</p></div>`
      + `${P.hero ? `<div class="pland">${P.heroGifs ? `<div class="hero-gifs">${P.heroGifs.map((g, i) => `<button class="hero-gif g${i}" data-zoom="${abs(g.src)}" aria-label="${caseAttr('Enlarge: ' + g.label)}"><span class="hg-tag"><b>${keep(g.tag)}</b>${keep(g.label)}</span><img src="${abs(g.src)}" alt="${caseAttr(g.alt)}" decoding="async"></button>`).join('')}</div>` : P.desktopHero ? `<button class="product-hero${P.heroCutout ? ' cutout' : ''}" data-zoom="${abs(P.hero)}" aria-label="Enlarge the final design"><img src="${abs(P.hero)}" alt="${caseAttr(P.heroAlt || 'The final design')}"></button>` : `<img src="${abs(P.hero)}" alt="${caseAttr(P.heroAlt || 'The final design')}">`}${P.heroCaption ? `<p class="hero-caption">${keep(P.heroCaption)}</p>` : ''}</div>` : ''}</header>`
  // The end offers two ways on: the one before and the one after, each with its picture.
  const card = (step, label) => {
    const to = order[(at + step + order.length) % order.length], N = to !== id && letterOf(to)
    if (!N) return ''
    // The card shows a small copy of the hero made at twice its size (media/thumbs), so it stays sharp when tilted.
    const NP = PAGES[N.doc] || {}, pic = NP.hero ? './site/cases/media/thumbs/' + NP.hero.split('/').pop().replace(/\.\w+$/, '.png') : NP.icon, arrow = `<i aria-hidden="true">${step < 0 ? '←' : '→'}</i>`
    return `<button class="pnext${step < 0 ? ' prev' : ''}" data-case="${to}">${step < 0 ? arrow : ''}<span><small>${label} ${kind}</small><b>${plain(NP.title || N.title)}</b></span>`
      + `${pic ? `<img${NP.hero ? '' : NP.iconBg ? ` class="icon" style="background:${NP.iconBg}"` : ' class="icon logo-fill"'} src="${abs(pic)}" alt="">` : ''}${step > 0 ? arrow : ''}</button>`
  }
  const prev = order.length > 2 ? card(-1, 'Previous') : '', next = card(1, 'Next')
  // Every page ends with a way to get in touch (BATCH.pageFixes): write, or take the résumé.
  const cv = ROOMS['home-hello'].links.find(([t]) => /sum/.test(t)), title = plain(P.title || L.title)
  const say = P.contactLock
    ? `<section class="contact-callout ink-lock" aria-labelledby="case-contact-title"><div class="ink-lock-mark" aria-hidden="true"><img src="${abs('./assets/case-lock.svg')}" alt="" width="420" height="300" loading="lazy" decoding="async"></div><p class="lock-kicker">Under NDA</p><h2 id="case-contact-title">The rest is under lock and key</h2><p>${keep(P.lockLine || 'This is a preview. Write to me for the complete case study: the research, explorations and decisions behind it, walked through together on a call.')}</p><a class="contact-action" href="mailto:kunalsatpal1@gmail.com?subject=${encodeURIComponent(title + ' — complete case study')}"><span>Write to me <span aria-hidden="true">↗</span></span><span class="contact-mail">kunalsatpal1@gmail.com</span></a></section>`
    : BATCH.pageFixes || EXTRA_PAGES[id] ? `<p class="psay">Want to talk about ${L.blog ? 'this' : 'this work'}? <a href="mailto:kunalsatpal1@gmail.com?subject=${encodeURIComponent(title)}">Write to me at kunalsatpal1@gmail.com</a><span aria-hidden="true"> · </span><a href="${abs(cv[1])}" target="_blank" rel="noopener">Résumé</a></p>` : ''
  // Every page offers the way on to the other case studies; on a locked preview it comes after the invitation.
  const nav = prev || next ? `<nav class="pnav${prev && next ? ' two' : ''}${P.contactLock ? ' after-lock' : ''}" aria-label="More to read">${prev}${next}</nav>` : ''
  const foot = `<footer class="pfoot">${P.contactLock ? say + nav : nav + say}<button class="pback" data-close>Back to the map</button></footer>`
  return chapRailHTML(L) + head + `<div class="pbody${L.blog ? ' blog' : ''}">${body}</div>` + foot
}

// ---------- Opening and closing ----------
// Quiet on purpose: the page fades up a few pixels over the map, and fades away again.
const letterEl = $('letter'), pageEl = letterEl.querySelector('.page'), lscroll = letterEl.querySelector('.lscroll'), lightbox = $('lightbox')
let caseId = null, letterFrom = null, seq = 0, reveal = null, riseIO = null, sysIO = null
const SETTLE = 'cubic-bezier(.22, 1, .36, 1)'
// Pictures rise into place as they scroll into view.
function watchRise() {
  placeNotes(); chapSpy()
  riseIO?.disconnect()
  const all = pageEl.querySelectorAll('.rise')
  if (reduce || !('IntersectionObserver' in window)) { pageEl.querySelectorAll('[data-system]').forEach(el => el.classList.add('play')); return all.forEach(el => el.classList.add('in')) }
  riseIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); riseIO.unobserve(e.target) } }), { root: lscroll, rootMargin: '0px 0px -8% 0px' })
  all.forEach(el => riseIO.observe(el))
  // The system board assembles only once half of it is in view, so the whole build is seen.
  sysIO?.disconnect()
  sysIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.closest('[data-system]').classList.add('play'); sysIO.unobserve(e.target) } }), { root: lscroll, threshold: .5 })
  pageEl.querySelectorAll('[data-system] .sys-board').forEach(el => sysIO.observe(el))
}
// Annotated cards: each label sits level with the first line of the text it describes, its leader line reaching the
// text's left edge; the bracket spans the paragraph. Placed again whenever the card changes size (fonts, resizing).
let notesRO = null
function placeNotes() {
  notesRO?.disconnect()
  const figs = pageEl.querySelectorAll('[data-notes]')
  if (!figs.length) return
  const place = fig => {
    const stage = fig.querySelector('.cn-stage'), text = fig.querySelector('.cn-text') || fig.querySelector('.cn-card'), S = stage.getBoundingClientRect(), T = text.getBoundingClientRect()
    if (getComputedStyle(fig).getPropertyValue('--cn-key').trim() === '1') return
    // Each label sits by the middle line of its highlight, and never on top of the one above it.
    let floor = -Infinity
    fig.querySelectorAll('.cn-note').forEach(n => {
      const rs = fig.querySelector(`.cn-card [data-note="${n.dataset.for}"]`).getClientRects(), r = rs[Math.floor((rs.length - 1) / 2)] || rs[0]; if (!r) return
      const y = Math.max(r.top + r.height / 2 - S.top, floor + n.offsetHeight / 2 + 8)
      n.style.top = y + 'px'; floor = y + n.offsetHeight / 2
    })
    const side = fig.querySelector('.cn-side'); if (side) { side.style.top = (T.top - S.top) + 'px'; side.style.height = T.height + 'px'; side.style.left = (T.right - S.left + 22) + 'px' }
  }
  notesRO = new ResizeObserver(es => es.forEach(e => place(e.target.closest('[data-notes]'))))
  figs.forEach(f => { place(f); notesRO.observe(f.querySelector('.cn-stage')) })
}
// Open a page: a building's (by its id), or a field note's.
function openCase(id) {
  id = letterFor(id)
  const L = id && letterOf(id)
  if (caseId || !L) return
  caseId = id; letterFrom = document.activeElement; letterEl.dataset.openCase = id
  const my = ++seq
  levelPeek(null); closePanel(); markVisited(L.from)
  pageEl.innerHTML = pageHTML(id); letterEl.style.setProperty('--rc', ok(46, .12, fromOf(L).hue))
  letterEl.hidden = false; letterEl.classList.remove('in'); lscroll.scrollTop = 0; watchRise()
  history.replaceState(null, '', `#${id}/read`)
  if (ROOMS[L.from]) citySelect(L.from)
  const done = () => { if (my !== seq) return; reveal?.cancel(); reveal = null; document.body.classList.add('reading-case'); pageEl.focus({ preventScroll: true }) }
  requestAnimationFrame(() => letterEl.classList.add('in'))
  if (reduce) return done()
  reveal?.cancel()
  reveal = letterEl.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: SETTLE, fill: 'forwards' })
  reveal.finished.then(done, () => {})
}
function closeCase(then) {
  if (!caseId) return
  const id = caseId, my = ++seq
  lightboxClose()
  document.body.classList.remove('reading-case')
  const done = () => {
    if (my !== seq) return
    reveal?.cancel(); reveal = null
    letterEl.hidden = true; letterEl.classList.remove('in'); pageEl.innerHTML = ''; riseIO?.disconnect(); sysIO?.disconnect(); caseId = null; citySelect(null)
    if (then) then(); else { const home = letterOf(id).from; history.replaceState(null, '', ROOMS[home] ? '#' + home : location.pathname + location.search); if (cardFor && cardFor === home) openCard(); letterFrom?.focus?.({ preventScroll: true }) }
  }
  if (reduce) return done()
  reveal?.cancel()
  reveal = letterEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' })
  reveal.finished.then(done, () => {})
}
function goCase(id) { if (caseId) return closeCase(() => goCase(id)); go(id, { enter: true }) }
// From one page to the next (its Previous / Next cards): the page turns in place, a quick fade, with no trip back
// through the map. The map behind moves to the new building at once, unseen, so "Back to the map" lands there.
function swapCase(n) {
  const id = letterFor(n), L = id && letterOf(id)
  if (!caseId || !L) return goCase(n)
  const my = ++seq, R = ROOMS[n] && levelOf[n] ? n : ROOMS[L.from] && levelOf[L.from] ? L.from : null
  lightboxClose()
  if (R) {
    clearTimeout(hideT); current = R; cardFor = R; pinned = true; panelEl.classList.add('pinned')
    showRoom(R); markSelected(R); markVisited(R); panelEl.classList.remove('open'); leader.classList.remove('on')
    flyTo(0, levelOf[R].y + (mobile() ? 220 : 0), 0, 0)
  }
  const put = () => {
    if (my !== seq) return
    caseId = id; letterEl.dataset.openCase = id; markVisited(L.from)
    pageEl.innerHTML = pageHTML(id); letterEl.style.setProperty('--rc', ok(46, .12, fromOf(L).hue))
    lscroll.scrollTop = 0; watchRise(); history.replaceState(null, '', `#${id}/read`)
    if (ROOMS[L.from]) citySelect(L.from)
    pageEl.focus({ preventScroll: true })
    if (!reduce) pageEl.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: SETTLE })
  }
  if (reduce) return put()
  const out = pageEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-in', fill: 'forwards' })
  out.finished.then(() => { put(); out.cancel() }, () => {})
}

// ---------- Looking closer ----------
function lightboxOpen(src, alt = '') {
  lightbox.querySelector('.lbin').innerHTML = `<img src="${src}" alt="${caseAttr(alt)}">`
  lightbox.hidden = false; lightbox.querySelector('.lbclose').focus({ preventScroll: true })
}
function lightboxClose() { if (lightbox.hidden) return; lightbox.hidden = true; lightbox.querySelector('.lbin').innerHTML = '' }
lightbox.addEventListener('click', lightboxClose)
// A phone recording is taller than it is wide: it is shown at the size of a phone, not across the page.
letterEl.addEventListener('loadedmetadata', e => { const v = e.target; if (v.tagName === 'VIDEO') v.closest('.clip')?.classList.toggle('tall', v.videoHeight > v.videoWidth) }, true)
// ---------- Before and after, and the system board ----------
// The wipe: a range input laid over both screens carries pointer, touch and keyboard alike.
letterEl.addEventListener('input', e => {
  const range = e.target.closest?.('.wipe-range'); if (!range) return
  const fig = range.closest('[data-wipe]'); fig.classList.add('touched'); fig.style.setProperty('--pos', range.value + '%')
})
letterEl.addEventListener('pointerdown', e => { e.target.closest?.('[data-wipe]')?.classList.add('touched') })
// The elements inside each piece of the CareHub system board, set as live UI: Noto Sans, Material Symbols and
// the colours sampled from the deck's vector slide. Each arrives a beat after the last.
const ms = (name, fill) => `<span class="ms${fill ? ' fill' : ''}" aria-hidden="true">${name}</span>`
const sp = (i, cls, html) => `<div class="sp ${cls}" style="--i:${i}">${html}</div>`
const SYS_MEDIA = './site/cases/media/carehub/system/'
const SYS_PARTS = {
  typography: () => sp(0, 'tp-name', 'Noto Sans') + sp(1, 'tp-abc', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') + sp(2, 'tp-abc', 'abcdefghijklmnopqrstuvwxyz') + sp(3, 'tp-num', '1 2 3 4 5 6 7 8 9 0')
    + sp(4, 'tp-say', 'Pain has reduced by 30 over 4 weeks.'),
  colour: () => [['neutral-tertiary', ['#eeece9', '#d0cfcc', '#a3a5a1']], ['neutralDark-primary', ['#1c2927', '#3b4744', '#101f1d']], ['neutralDark-secondary', ['#3b4643', '#535e5b', '#1c2927']],
    ['neutralDark-tertiary', ['#6d7470', '#a4a6a2', '#535e5b']], ['brand-primary', ['#067d38', '#00983f', '#034a21']], ['brand-secondary', ['#e5f5ec', '#d6eee0', '#eff9f3']]]
    .map(([name, cs], i) => sp(i, 'tok', cs.map(c => `<span class="sw" style="--c:${c}" title="${c}"></span>`).join('') + `<code>--fill-${name}</code>`)).join('')
    + sp(6, 'tok-k', 'Opacity families') + [['neutralOpacity-primary', '28 26 22'], ['neutralDarkOpacity-primary', '16 31 29']]
    .map(([name, rgb], i) => sp(7 + i, 'tok see', [.08, .16, .28].map(a => `<span class="sw" style="--c:rgb(${rgb} / ${a})"></span>`).join('') + `<code>--fill-${name}</code>`)).join(''),
  'icon-set': () => ['area_chart', 'task', 'queue', 'arrow_right', 'home', 'list', 'tab', 'cancel', 'settings_accessibility', 'chat', 'done', 'app_registration']
    .map((n, i) => sp(i, 'mi', ms(n, 1))).join(''),
  'line-icons': () => Array.from({ length: 20 }, (_, i) => sp(i, 'li', `<img src="${abs(SYS_MEDIA + 'line-' + two(i + 1) + '.png')}" alt="">`)).join(''),
  buttons: () => [['primary', 'Primary'], ['secondary', 'Secondary'], ['neutral', 'Neutral'], ['outline', 'Outline'], ['danger', 'Destructive'], ['danger-soft', 'Soft destructive']]
    .map(([k, t], i) => sp(i, 'cb ' + k, t)).join(''),
  statuses: () => sp(0, 'srow', `${ms('videocam', 1)}<b>15 min follow up</b><span class="when">Today, 3:30 pm</span>`)
    + sp(1, 'srow', `${ms('videocam', 1)}<b>15 min follow up</b><span class="when soon">Starts in 8 mins</span>`)
    + [['prog', 'In progress'], ['wait', 'Member waiting'], ['end', 'Call ended']].map(([k, t], i) => sp(i + 2, 'srow', `<span class="st-chip ${k}">${ms('video_camera_front', 1)}${t}</span><span class="task">Visit tasks · ${ms('warning', 1)} Due in 1h</span>`)).join(''),
  'body-map': () => sp(0, 'bm', `<img src="${abs(SYS_MEDIA + 'body-figure.png')}" alt=""><i class="pulse" style="left:33.6%;top:36%"></i><i class="pulse" style="left:66.6%;top:36%"></i>`) + sp(1, 'bm-label', 'Shoulder'),
  engagement: () => [['3', 'Weekly goal streak', 'Weeks with completed goals', 'rocket'], ['12', 'Weekly activity streak', 'Weeks with at least one ET session', 'mode_heat']]
    .map(([n, t, s, ic], i) => sp(i, 'stk', `<div><strong>${n}</strong><b>${t}</b><span>${s}</span></div><span class="badge">${ms(ic, 1)}</span>`)).join(''),
  'clinical-cards': () => sp(0, 'acts', `<span><i>*</i>Extend care plan</span><span>${ms('chat')}Investigate further</span><span>${ms('chat')}Share resources</span>`)
    + sp(1, 'pain', `<p>Pain · 8 Jun</p><div><span>Neck</span><strong>76</strong><em class="up"><span aria-hidden="true">↗</span> 40</em></div><div><span>Back</span><strong>40</strong><em class="down"><span aria-hidden="true">↘</span> 30</em></div><div><span>Knee</span><strong>58</strong></div>`)
    + sp(2, 'wk', `<p>Engagement · 8 Jun – 12 Jul</p><div class="wk-days" aria-hidden="true"><i></i>${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}</div>`
      + [[8, '3/3', [2, 4], [1, 6]], [15, '3/3', [6], [2, 4]], [22, '2/3', [], [1, 5]]].map(([d0, tally, on, part]) => `<ol><li class="tally${tally[0] === tally[2] ? ' done' : ''}">${tally}${tally[0] === tally[2] ? ' ✓' : ''}</li>${Array.from({ length: 7 }, (_, i) => `<li class="${on.includes(i) ? 'on' : part.includes(i) ? 'part' : ''}">${d0 + i}</li>`).join('')}</ol>`).join(''))
    + sp(3, 'psfs', `<p>PSFS · 21 Jun</p><span>Lifting</span><span>Sports</span>`),
}
let sysPointer = 'mouse', sysWasOpen = null
function sysShow(piece) {
  const sys = piece.closest('[data-system]'), stage = sys.querySelector('.sys-stage'), pop = sys.querySelector('.sys-pop')
  clearTimeout(pop.t); sys.classList.add('picking')
  sys.querySelectorAll('[data-piece]').forEach(p => p.classList.toggle('lit', p === piece))
  if (pop.dataset.at !== piece.dataset.piece) {
    pop.dataset.at = piece.dataset.piece
    pop.innerHTML = `<h3 class="sp-t"></h3><div class="sys-parts parts-${piece.dataset.key}">${SYS_PARTS[piece.dataset.key]?.() || ''}</div><p class="sp-note"></p>`
    pop.querySelector('.sp-t').textContent = piece.querySelector('img').alt
    pop.querySelector('.sp-note').textContent = piece.dataset.note
    pop.classList.remove('on'); void pop.offsetWidth
  }
  pop.classList.add('on')
  // Beside the piece, on the side with room; on a narrow screen it sits under the board instead.
  if (matchMedia('(max-width: 900px)').matches) { pop.style.left = pop.style.top = ''; return }
  const s = stage.getBoundingClientRect(), t = piece.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight
  const right = t.right - s.left + 18, left = right + w <= s.width ? right : Math.max(0, t.left - s.left - w - 18)
  pop.style.left = left + 'px'; pop.style.top = Math.max(0, Math.min(t.top - s.top - 8, s.height - h)) + 'px'
}
function sysHide(sys) {
  const pop = sys.querySelector('.sys-pop'); clearTimeout(pop.t)
  pop.t = setTimeout(() => { sys.classList.remove('picking'); sys.querySelectorAll('.lit').forEach(p => p.classList.remove('lit')); pop.classList.remove('on'); delete pop.dataset.at }, 220)
}
// What was open when the finger came down: a tap also focuses the piece, which opens it before the click arrives.
letterEl.addEventListener('pointerdown', e => { sysPointer = e.pointerType || 'mouse'; sysWasOpen = e.target.closest?.('[data-system]')?.querySelector('.sys-pop').dataset.at ?? null }, true)
letterEl.addEventListener('pointerout', e => { const st = e.target.closest?.('.sys-stage'); if (st && e.pointerType !== 'touch' && !st.contains(e.relatedTarget)) sysHide(st.closest('[data-system]')) })
letterEl.addEventListener('focusout', e => { const st = e.target.closest?.('.sys-stage'); if (st && !st.contains(e.relatedTarget)) sysHide(st.closest('[data-system]')) })
letterEl.addEventListener('click', e => {
  // A piece of the system board opens straight to its full-size picture: no pop-up on hover or tap.
  const piece = e.target.closest('[data-piece]')
  const animation = e.target.closest('[data-case-animation]')
  if (animation) {
    const playing = animation.getAttribute('aria-pressed') !== 'true'
    animation.closest('.case-animation').querySelector('img').src = playing ? animation.dataset.gif : animation.dataset.poster
    animation.setAttribute('aria-pressed', playing)
    animation.textContent = playing ? 'Stop animation' : 'Play exploration'
    return
  }
  const jump = e.target.closest('[data-case-jump]')
  if (jump) {
    const section = document.getElementById(jump.dataset.caseJump)
    // Pictures above load as the page passes them and push the section down, so it is lined up again once they settle.
    if (section && pageEl.contains(section)) { section.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' }); section.tabIndex = -1; section.focus({ preventScroll: true })
      for (const ms of [700, 1400]) setTimeout(() => { if (Math.abs(section.getBoundingClientRect().top - 24) > 40) section.scrollIntoView({ behavior: 'instant', block: 'start' }) }, ms) }
    return
  }
  const select = e.target.closest('[data-case-select]')
  if (select) {
    const group = select.closest('[data-case-switch]')
    group.querySelectorAll('[data-case-select]').forEach(button => button.setAttribute('aria-pressed', button === select))
    group.querySelectorAll('[data-case-state]').forEach(state => { state.hidden = state.id !== select.dataset.caseSelect })
    group.querySelectorAll('.rise').forEach(el => el.classList.add('in'))
    return
  }
  const source = e.target.closest('[data-evidence-source]')
  if (source) {
    const figure = source.closest('.case-evidence')
    figure.querySelectorAll('[data-evidence-source]').forEach(button => button.setAttribute('aria-expanded', button === source))
    figure.querySelectorAll('[data-evidence-state]').forEach(state => { state.hidden = state.id !== source.dataset.evidenceSource })
    return
  }
  const t = e.target.closest('[data-zoom], [data-close], [data-case]')
  if (t?.dataset.zoom) lightboxOpen(t.dataset.zoom, t.querySelector('img')?.alt)
  else if (t?.hasAttribute('data-close')) closeCase()
  else if (t?.dataset.case) swapCase(t.dataset.case)
})
addEventListener('keydown', e => {
  if (!caseId || e.key !== 'Escape') return
  e.preventDefault(); lightbox.hidden ? closeCase() : lightboxClose()
}, true)
