# Builds index.html from the source modules in src/: one self-contained file.
import json, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
css = (src / 'style.css').read_text()
# His name's lettering, a fan-made font (Harry P, by GemFonts), inline so it loads from disk.
import base64 as _b64
css = "@font-face { font-family: 'Harry P'; src: url(data:font/ttf;base64," + _b64.b64encode((root / 'assets' / 'fonts' / 'harry-p.ttf').read_bytes()).decode() + ") format('truetype'); font-display: block; }\n" + css
body = (src / 'body.html').read_text()
# The full case studies, from kunalsatpal.com, travel inside the page as data.
cases = {p.stem: json.loads(p.read_text()) for p in sorted((src / 'cases').glob('*.json'))}
data = 'const FULLCASE_DATA = ' + json.dumps(cases, ensure_ascii=False).replace('</', '<\\/') + '\n'
# The engravings that stand up off the paper, inline, so the GPU may read their pixels even
# when the page is opened straight from disk.
import base64
eng = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((root / 'assets' / 'v').glob('*.webp')) if not p.stem.startswith('wet')}
data += 'const ENG_DATA = ' + json.dumps(eng) + '\n'
js = data + '\n'.join(p.read_text() for p in sorted(src.glob('[0-9][0-9]-*.js')))
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kunal Satpal — A map of the work</title>
<!-- What a shared link shows (LinkedIn, X, Slack, iMessage). The picture is site/img/og-career-map.jpg. -->
<meta name="description" content="Kunal Satpal's design portfolio as a hand-drawn map: every company is a city that builds itself as you arrive, and every project is a building you can open.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://kunalsatpal.com/career-map/">
<meta property="og:title" content="Kunal Satpal — A map of the work">
<meta property="og:description" content="A design portfolio you travel through. Every company is a city that builds itself as you arrive; every project is a building you can open.">
<meta property="og:image" content="https://kunalsatpal.com/career-map/site/img/og-career-map.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A hand-drawn parchment map with the Hinge Health city standing in 3D beside a winding road.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 41 39'%3E%3Crect x='-4' y='-4' width='41' height='39' rx='8' fill='%23f4ead7'/%3E%3Cg fill='%23372017'%3E%3Crect y='1.09' width='7.68' height='28.36' rx='1.4'/%3E%3Cpath d='M31.24.92c.77 0 1.4.63 1.4 1.4v25.52c0 .77-.63 1.4-1.4 1.4h-6.1c-.27 0-.52-.11-.7-.31L12.18 15.08 24.44 1.22c.18-.19.43-.3.7-.3z'/%3E%3C/g%3E%3C/svg%3E">
<!-- Phones go straight to kunalsatpal.com: the map is made for bigger screens. Same test as PHONE (01-util.js), so tablets stay. -->
<script>if (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 760) location.replace('https://kunalsatpal.com/')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names=app_registration,area_chart,arrow_right,auto_awesome,cancel,chat,check_circle,done,home,list,mode_heat,queue,rocket,sentiment_dissatisfied,sentiment_satisfied,sentiment_very_dissatisfied,sentiment_very_satisfied,settings_accessibility,tab,task,thumb_down,thumb_up,video_camera_front,videocam,warning&display=block" rel="stylesheet" media="print" onload="this.media='all'" data-font>
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+Great+Primer:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:wght@700&family=Noto+Sans:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Fraunces:opsz,wght@9..144,500..700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'" data-font>
<style>
{css}</style>
</head>
<body>
{body}<script>
(() => {{
{js}
}})()
</script>
</body>
</html>
'''
(root / 'index.html').write_text(html)
print('built', len(html), 'bytes')
