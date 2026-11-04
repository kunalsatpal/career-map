# Next best action — case-study plan for review

Status: implemented locally as a visual-first case study in the existing reader. The page leads with “Holistic Care,” shows the milestone 1 exploration-to-final change with focused detail crops, clarifies the design rationale and contribution, and reports three separate outcome signals with source limitations. Recommendations remain clearly marked as design work in progress.

## 1. Editorial direction

Working title: **Holistic Care**

Kicker: Hinge Health · CareHub · Next best action

Central argument: CareHub hid concurrent workflows behind tabs. I led a member-first redesign that surfaced the full picture before adding AI-generated context.

Aim for a concise 2–3 minute read, led by actual deck screens and a small set of annotations. The headline, decisions, milestone outcomes, and remaining AI limitations stay understandable without clicking anything.

Use first person for substantiated personal decisions and “we” for team delivery. Avoid implying sole ownership of clinical, engineering, or model-development work. Confirm exact ownership before final copy.

## 2. What the deck currently does

The 56-page deck follows a presentation sequence:

| Pages | Purpose | Treatment in the short case study |
|---|---|---|
| 1–7 | Hinge context, member/provider activity, ticket-based work, member-first vision | Compress to two sentences and one visual |
| 8–15 | Fragmented workflows, supporting numbers, interviews, business problem | Keep the problem stats, two exact clinician quotes, and a contextual photo |
| 16–20 | Reframe, workshops, vision, staged roadmap | Make this a central leadership section |
| 21–25 | Surface the full member situation, compare layouts, measure profile time | Keep one meaningful tradeoff and the result |
| 26–38 | Diagnose weak AI summaries, change structure/prompts, iterate information design | Condense into a decision about useful, verifiable context |
| 39–44 | Trust workshop, prompt iterations, expert/user evaluation, feedback, transparency | Explain how quality and trust were evaluated |
| 45–47 | Results, limitations, improvements | Preserve both gains and unresolved problems |
| 48 | Action recommendations, explicitly marked design WIP | Label as the next milestone, not shipped impact |
| 49–50 | Leadership learnings | Replace generic lessons with one specific reflection |
| 51–55 | Separate visual refresh, another designer, six months, efficiency claim | Omit from the main NBA narrative unless scope is clarified |
| 56 | Thank you | Use the existing portfolio footer |

The deck works for a spoken presentation. The page should lead with the thesis and contribution, then organize evidence around decisions rather than reproduce slide order.

## 3. Proposed reading flow

| Section | Reader takeaway | Content and evidence | Approx. words |
|---|---|---|---|
| Opening: Holistic Care | What changed and what I led | Member-first thesis, two distinct outcome signals, and the final CareHub screen | — |
| 1. The queue hid the whole member | Why this mattered | Queue screenshot, 2.8 open workflows, and two clinician quotes | — |
| 2. See the whole situation | Milestone 1 decision | Side-by-side exploration/final screens, layout tradeoff, and ~6% less profile time | — |
| 3. Make AI context useful and verifiable | Milestone 2 decision | Summary and source-transparency screens, clinician trust quote, and separate outcomes | — |
| 4. Trust before recommendations | What remained | ~74% correctness, evaluation failure modes, and recommendations marked design WIP | — |

Provisional opening direction, to refine after flow approval:

> Care teams could see the task in front of them, but not always the full member situation. I helped shape a member-first direction for CareHub and a staged path toward next-best-action recommendations: first make the work visible, then make the context understandable, then recommend what to do next.

This is a direction sample, not final approved copy. The final ownership sentence depends on role clarification.

## 4. Interactions and Harry Potter theme

Preserve the existing Marauder’s Map world: parchment, ink, restrained green accents, serif typography, wax-seal cues, and the Hinge observatory entry. Keep product screenshots in their original visual language. Use plain professional section titles; the theme belongs primarily in the framing and behavior.

### A. Reveal the full picture — paired design comparison

- Place focused crops of the original exploration and final member view side by side; selecting either crop opens the full deck screen.
- The concise caption explains the bottom-bar tradeoff: it surfaced work but competed with conversation space.
- Purpose: let the reader compare the information architecture directly.

### B. A route through the observatory — compact milestone map

- Three connected stops: “See the situation,” “Understand it,” “Recommend an action.”
- All labels and status summaries remain visible. Selecting a stop reveals one decision and one evidence note.
- First two stops reflect work evaluated in the deck; third is clearly “Design WIP in this deck.” Confirm current status before changing that label.
- Use a short ink path and a selected seal. Avoid a large explorable world within the case study.
- Purpose: make sequencing and scope visible in seconds.

### C. Make trust visible — summary and evaluation evidence

- Compare the summary screen from PPTX slide 40 with the source-transparency direction from page 44 / PPTX slide 51. These are design snapshots, not a measured experiment.
- Pair the original evaluation form with the evaluation error table; no clinical example is reconstructed.
- Keep clinical decisions with the care team; do not imply that recommendations shipped.

The case uses paired original deck screens and the compact milestone map for navigation. No simulated product UI, live model, or clinical decision engine.

## 5. Asset selection

Use original deck screens and contextual care-team photography:

1. PDF page 24 / PPTX slide 31: delivered member-context layout, primary hero, comparison state, and final-screen detail crop.
2. PDF page 22 / PPTX slide 29: exploration state and care-plan detail crop, shown beside the final design.
3. PPTX slide 8: alert queue, shown with the clinician quotes; the screenshot data is illustrative.
4. PPTX slide 40 and PDF page 44 / PPTX slide 51: summary and source-transparency design snapshots.
5. PDF page 43 / PPTX slide 50 and PPTX slide 53: evaluation form and error analysis table.
6. `physical-therapist.png`: care-team context beside the queue; do not imply that the photo depicts either quoted clinician.

Keep results and captions in real text. Use the original deck screenshots without redaction; their member details are mock examples. Exclude the decorative cover illustration, repeated mockups, full prompt table, large workshop wall, design-system collage, and closing slide. Do not reuse the separate visual-refresh segment as NBA evidence.

## 6. Evidence and claims

| Claim | Deck evidence | Planned handling |
|---|---|---|
| Approximately 6% less member-profile time | Page 25: 5m40s to 5m20s | Primary outcome, tied specifically to the visibility milestone; note that evaluation method/window needs confirmation |
| 220 provider hours daily; $400k monthly | Page 25, with savings called notional | Omit from the short draft unless calculation assumptions are supplied; never present as realized savings |
| Approximately 1% less time per member | Page 45 | Separate summary-related outcome |
| Approximately 4% less message-crafting time | Page 45 | Separate outcome with its own denominator; do not add to other percentages |
| Current portfolio says 6–12% | Existing map copy | Not directly substantiated by this deck; resolve before reusing as the new page headline |
| 88% | Page 11 labels it a click rate | Never describe as the proportion of hidden workflows; omit unless event/denominator is clarified |
| Recommendations | Page 48 says design WIP | Present as next milestone unless newer evidence is provided |
| Additional designer / six months / +6% PT efficiency | Pages 51–55, visual-refresh segment | Do not apply to NBA project scope without confirmation |

Keep the limitations from page 46: pain data received too much prominence, some important data was missed, and output could jump to conclusions. Frame page 47’s chain prompting and partial rules as proposed improvements unless delivery is confirmed.

## 7. Implemented page and validation

- The case is connected to the existing `hinge-ai` entry and shared case-study reader. Its story moves from fragmented work, through the member-first decision, into two separately measured milestones and an explicitly unfinished recommendation step.
- The final page uses selected local slide exports, a compact milestone route, an actual exploration/final screen switch, and an inspectable summary interaction. Essential decisions and outcomes remain visible without opening accordions.
- It follows the shared parchment, typography, spacing, navigation, and responsive case-study layout. The landscape CareHub screen is constrained rather than stretched across the hero; story mockups stay within a 760px maximum and adapt to the viewport.
- `python3 -I build.py`, `git diff --check`, asset-path checks, and browser checks for the layout and both interactive controls passed.
- The current page is approximately a 2-minute read. The page and source assets remain local; nothing has been published.

## 8. Remaining review points

- Does the proposed member-first leadership story represent the contribution you want to emphasize?
- What did you personally lead across roadmap, workshops, prompt design, evaluation, and delivery? What was owned by partners?
- Is the action-recommendation milestone still WIP, or is there newer shipped work to include?
- Can you confirm the metric evaluation context and the source of the existing 6–12% claim?

These are editorial checks for the implemented draft, not blockers to opening it locally.
