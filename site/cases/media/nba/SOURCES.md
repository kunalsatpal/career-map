# NBA case-study source notes

Source: user-provided `Case Study _ NBA.pdf` (56 pages). Page numbers are one-based. The source deck is not bundled with the portfolio.

## Visuals

- The case-study hero opens on the member-context layout from PDF page 24 / PPTX slide 31, presented as a delivered milestone rather than evidence that recommendations shipped.
- The Before and Solution comparison places the original exploration (PDF page 22 / PPTX slide 29) beside the final layout (PDF page 24 / PPTX slide 31).
- Detail crops on those screens make the care-plan and member-summary areas readable at page scale; selecting a crop opens the full original screenshot.
- Product screenshots are displayed as supplied in the deck. Their names and clinical details are example data, not real member records.
- `task-queue.png`, `physical-therapist.png`, the milestone 2 screens and evaluation visuals are retained source assets but are not shown in this concise version.
- No model runs and no clinical decision is generated. The inconsistent clinical details in the slide examples are not recreated.
- The page focuses on the problem data, the milestone 1 before-and-solution comparison, and reported impact.

## Claim mapping

- Problem (each stat now says what it means): average 2.8 open workflows (page 10), 88% Interactions-tab click rate (page 11), and 90–110 members daily (page 12). The click-rate denominator is not stated, so the page labels it as a deck baseline and does not infer a share of members.
- Interview excerpts: Kate and Natallie on page 13 are exact source excerpts retained in the source deck, but omitted from this concise page.
- AI-summary quote: exact excerpt on page 27; speaker is not named in the slide. It follows the original summary and source-transparency screen sequence.
- Vision, workshops and milestone sequence: pages 16–20.
- Layout tradeoff and delivered visibility design: pages 22–24.
- Milestone 1 outcome: page 25, approximately 6% less member-profile time, 5m40s to 5m20s. The deck does not provide study window, sample size, or method; the page calls this an observed change and avoids causal attribution. Business case: 220 provider hours daily across 600 providers and $400k notional monthly savings, explicitly presented as estimates.
- Summary diagnosis and iteration: pages 27–38 (not expanded in this concise page).
- Trust, expert evaluation, user evaluation and transparency: pages 39–44 (not expanded in this concise page).
- Milestone 2 outcomes: page 45, approximately 1% less time per member and 4% less message-crafting time. Different measures; do not add them. Study window, sample size, and measurement method are not stated in the deck.
- AI correctness: the user confirmed that page 45’s unlabeled pie chart represents correctness, approximately 74% accurate. The chart values are 73.46% correct and 26.54% incorrect. The current page briefly notes this as an evaluation result, not a clinical safety validation; sample size and scoring protocol are not stated. Do not confuse it with positive-feedback rate.
- Limitations and proposed improvements: pages 46–47. The three specific failure examples are paraphrased from the evaluation table on page 46.
- Recommendation milestone: page 48, explicitly design WIP in the supplied deck.
- Strategy/roadmap and cross-functional role: existing portfolio copy, conservatively worded. Team delivery uses “we.”

The separate visual-refresh work on pages 51–55 is not used as evidence of NBA staffing, duration or measured impact. Notional financial savings are shown separately from the measured time outcomes. The previous portfolio claim of 6–12% has been replaced in NBA-related copy with the deck's separately attributed results.

Useful inputs for a later editorial revision: evaluation dates/sample sizes, exact division of ownership across partners, and whether the recommendation milestone has shipped since this deck. These are not invented in this draft.

## Animation assets (GIFs)

Pulled 2026-11-04 from the Figma Slides file PXKPGLco8i3bJa6d9sJ5gG with `tools/figma_gifs.py`'s method: the REST
API's `GET /v1/files/:key/images` (Slides files reject the node endpoints, so GIFs are matched to slides by eye).
The deck holds 15 GIFs; the exports (PDF/PPTX) carry only their first frames.

- `gifs/milestone-1-exploration-1280.gif` (Figma ref 0bbb29c5c3, original 2744×1580, 18 MB): PDF page 22, "Exploration".
- `gifs/milestone-1-final-1280.gif` (ref 88f17c7dde, original 2560×1646, 14 MB): PDF page 24, "Final".
- Both are scaled to 1280 px wide with every frame and frame delay kept (ImageIO), about 3.6 MB each. The final GIF is the
  page's opening After and the slider's After; the exploration plays in the redesign section as a step on the way, not as
  the Before (the deck's p23 notes why it was dropped: a smaller chat, and no room for small windows or 3+ workflows).
- `before-legacy.jpg` (Figma ref b94f577bde, 2560×1440, a still: the deck has no GIF of it): PDF page 6, the 2024 CareHub
  member view with one workflow in a side panel. The page's Before, at the top and in the slider. The full-size originals are not bundled.
- Not used: Allison Richards member view (5b0f44bb52, 6bf4fe05d9; pages 7 and 18), alert list (c735f28e49; page 8),
  later summary iterations (c3b086d06e, f08525b8a1; pages 33–44), recommended actions (6dfc6262d8, ef85e1f3cb; page 48),
  a dark home dashboard (455d7210b3), five emoji (pages 45–46) and the highway photo (a99df30817; page 51).
- The earlier user-supplied `exploration-1.gif` is the same exploration, re-encoded larger; it is no longer referenced.

## Story strip (`story/`, added 2026-11-06)

The sneak-peek section tells the AI summary as a four-panel strip. Panels 1–2 are drawn illustrations (inline SVG in
`src/18-letter.js`, the `strip` block); panels 3–4 use deck screenshots:

- `story/old-summary.jpg`: PDF page 6, the 2024 "Amelia's summary" card (age, job and hometown first; pain in sentence 3).
- `story/new-summary.jpg`, `story/new-zoom.jpg`: PDF page 44, the final summary card for the same member (Amelia Holmes),
  and its headline enlarged.
- Amelia's quoted message in panel 1 is from the conversation on PDF page 44. All names and clinical details are deck
  example data, not a real member.
- Known source inconsistency: the page 44 card's headline says "sudden pain increase" while its first insight says pain
  reduced by 30. The strip enlarges only the headline.
- "~½ hour back for every PT, every day" is derived, not stated in the deck: 20 s saved per profile (5:40 → 5:20, page 25)
  × 90–110 members a day (page 12), assuming one profile visit per member per day.
