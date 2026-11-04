# CareHub 2.0 preview sources

Source: the closing visual-refresh segment of the user-provided `Case Study _ NBA.pdf` (56 pages), with matching original assets from `Case Study _ NBA.pptx` (72 slides). The user identified this segment as CareHub 2.0. Source decks remain outside the site.

| Asset / claim | Source | Treatment |
| --- | --- | --- |
| Lead visual refresh; one additional designer; six months | PDF 51 / PPTX 67 | Scope describes this refresh, not the entire CareHub programme |
| `before.png` | PDF 52 / PPTX 68 | Original embedded `ppt/media/image-68-1.png`, 1118 × 719, extracted without alteration |
| `visual-system.png` | PDF 53 / PPTX 69 | Rendered directly from the original PDF, cropping only the surrounding slide canvas; includes the complete system-board composition |
| `after.png` | PDF 54 / PPTX 70 | Rendered directly from the original PDF; includes both the navigation and main member-record panel, preserving the slide composition |
| +6% PT efficiency | PDF 55 / PPTX 71 | Deck-reported outcome; no measurement window, sample size or method supplied |

PDF crop rectangles use bottom-left coordinates on a 1920 × 1080 page, rendered at 1.5 pixels per PDF point: after `(320, 80, 1280, 832)`; visual system `(424, 96, 1072, 804)`. Crops are source exports, not reconstructed product UI. Member details are example data, as documented for the supplied deck.

Keep this outcome separate from NBA's approximately 6% reduction in member-profile time. The body-map and typography descriptions identify visible design features; they do not claim independently measured usability gains. The CareHub and NBA buildings stand complete because their previews are now available; each preview ends with a contact lock for the complete case study.

## System board (`system/`)
- The nine tiles (`typography.png` … `clinical-cards.png`) are rendered from the vector "SYSTEM" slide, page 53 of
  `Case Study _ NBA.pdf`, at 4× and saved at 2×. Their positions on the page come from the same slide.
- `line-01.png` … `line-20.png` and `body-figure.png` are cut from those renders.
- The hover pop-outs rebuild each tile's elements as live UI: Noto Sans, Material Symbols Rounded (the icon
  names are the slide's own text layers) and colours sampled from the render.
