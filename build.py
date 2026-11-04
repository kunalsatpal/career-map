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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names=app_registration,area_chart,arrow_right,cancel,chat,done,home,list,mode_heat,queue,rocket,settings_accessibility,tab,task,video_camera_front,videocam,warning&display=block" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+Great+Primer:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:wght@700&family=Noto+Sans:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Fraunces:opsz,wght@9..144,500..700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
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
