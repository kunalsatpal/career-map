// =====================================================================================
// The changes from the 29 Oct critique, in batches, each behind its own switch: set one to false
// and rebuild (python3 -I map2/build.py) to undo just that batch. A copy of map2 from before each
// batch is kept beside it too (map2-before-b1 … b15).
// =====================================================================================
const BATCH = {
  // 1. Senior evidence
  pillarNames: true,     // How I work's five pillar names shown at all times, small, at each plinth
  finale: true,          // the lighthouse signs off: one "Write to me", then the résumé and LinkedIn in a line
  pillarProof: true,     // How I work: each pillar named as a practice, with one line of proof
  tagline: true,         // the line under the name: "Crafting with strategy & technical fluency"
  hingePage: false,      // every Hinge card opens one page of what I can share: the outcomes already on the map
  // 2. Interaction conflicts
  propsShareHover: true, // a prop on a building no longer takes the building's hover; no "Psst" bubble
  // 3. Mobile
  mobile: true,          // phones: one world per swipe, a place chip, labels kept on screen, 44 px taps
  mobile2: true,         // phones, second pass: each stop framed ahead, "Swipe down to begin", full-width notes, banners let taps through, roomier case pages and menu
  // 4. Case pages
  pageFixes: true,       // every page ends with Say hello and the résumé; typos and old metric images fixed
  // After the critique
  cardCartouche: true,   // every building's hover card is an engraved cartouche: aged paper, a framed edge, centred, a fleuron
  railNames: true,       // the rail names each place and nothing more: no years or subtitles
  railUp: true,          // the rail reads up the screen, like the journey: Start at the foot, About me at the top
  railPolish: true,      // the same rail, finer: hairline rings, red dots for places passed, the names on the buildings' paper slips
  biggerIsle: true,      // the Isle of Kunal a fifth wider and a little further north, with a taller lighthouse
  biggerYard: true,      // About me's yard pushed out to the shore, the path and the lighthouse; the lamps cross the path
  onePromo: true,        // Gojek's promo work is one building: the scooter market, widened into the banner hall's place
  labTower: true,        // Promo experiments stands as a science tower: a lab wing, a lit lantern and lightning rod, three flasks
  shortNoteTags: true,   // Field notes' tags on the map in two or three words; the note and its page keep the full title
  calmOpen: true,        // a blank sheet while the page warms up and the 3D city gets ready, one drop of ink gathering; then the ink spreads from the middle to the edges until the map has appeared (as on the first cover), and the camera leans in
  prewarm: true,         // first visits: every kind of label, card and effect drawn once, nearly invisible, while the title is up
  softCards: true,       // woods and trees fade from ink to card as they stand up, instead of all switching in one frame
  workBuild: true,       // How I work's pillars build when you reach them, on their own, before About me's isle
  lateBuild: true,       // each city starts building once its middle is a quarter of the way down the screen, not while still small by the horizon
  stopDetails: true,    // earlier-work stops say more, from the résumé and the field notes
  // After the 4 Nov visual critique
  inkLogos: true,        // company logos on the map are stamped in the map's ink, not their brand colours
  noBadges: true,        // Field notes' buildings lose their round white brand badges
  crispFog: true,        // names in the distance stay readable, then are gone: no ghost labels half-lost in the mist
  bareTitle: true,      // the halo behind the name and tagline is matched to the rendered paper, so it no longer reads as a white outline
  // Worlds, more to find
  pillarStars: true,
  pillarCrowns: true,    // How I work's crowns, hovered: the tree rustles and drops a leaf, a pawn is moved, the brass bar ticks up, the hammer strikes, the slash turns
  cherryTree: true,      // About me: a cherry tree in blossom by the noodle stand; hovered, a few petals fall
  hammock: true,         // About me: the reading bench becomes a hammock with an open book; hovered, a page turns
  wavers: true,
  // Side missions, for whoever lingers or pokes about
  pawTrail: true,       // the wizard has lost his cat: her ink paw prints wander near the road in each world; click one and she appears, says meow, and runs off
  fireflies: true,       // linger in About me's yard and fireflies come out over the garden
}
