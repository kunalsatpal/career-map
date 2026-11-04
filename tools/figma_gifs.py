#!/usr/bin/env python3
"""Download the original GIFs (and other image fills) placed inside a Figma node.

Figma's own exports (PNG/PDF/PPTX) flatten an animated GIF to its first frame. The REST API,
though, keeps every uploaded image by reference: a GIF fill carries a `gifRef`, and
GET /v1/files/:key/images maps each reference to a download link for the original upload.

Usage:
  FIGMA_TOKEN=figd_... python3 tools/figma_gifs.py "<figma url with node-id>" [out_dir]

The token is a personal access token (Figma → Settings → Security → Personal access tokens,
scope "File content: read"). Only standard library is used.
"""
import json, os, re, sys, urllib.parse, urllib.request

API = 'https://api.figma.com/v1'


def get(url, token=None):
    req = urllib.request.Request(url, headers={'X-Figma-Token': token} if token else {})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    token = os.environ.get('FIGMA_TOKEN') or sys.exit('Set FIGMA_TOKEN to a Figma personal access token.')
    url = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else 'figma-gifs'
    m = re.search(r'figma\.com/(?:file|design|slides|deck|proto)/([A-Za-z0-9]+)', url)
    if not m:
        sys.exit('Could not find a file key in that URL.')
    key = m.group(1)
    node = urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('node-id', [None])[0]
    node = node and node.replace('-', ':')

    # The node's subtree, or the whole file when the link names no node.
    q = f'{API}/files/{key}/nodes?ids={urllib.parse.quote(node)}' if node else f'{API}/files/{key}'
    data = json.loads(get(q, token))
    roots = [v['document'] for v in data['nodes'].values() if v] if node else [data['document']]

    # Every image fill in it: GIFs by gifRef, stills by imageRef, named after their layer.
    found = []  # (layer name, ref, is_gif)
    def walk(n):
        for paint in (n.get('fills') or []) + (n.get('background') or []):
            if paint.get('type') == 'IMAGE':
                if paint.get('gifRef'):
                    found.append((n.get('name', 'layer'), paint['gifRef'], True))
                elif paint.get('imageRef'):
                    found.append((n.get('name', 'layer'), paint['imageRef'], False))
        for c in n.get('children') or []:
            walk(c)
    for r in roots:
        walk(r)
    if not found:
        sys.exit('No image fills in that node. If the motion is a prototype animation rather than a placed GIF, '
                 'there is no GIF to download: record the prototype instead (see the note at the end of this file).')

    links = json.loads(get(f'{API}/files/{key}/images', token))['meta']['images']
    os.makedirs(out, exist_ok=True)
    gifs_only = '--all' not in sys.argv
    seen = set()
    for name, ref, is_gif in found:
        if ref in seen or (gifs_only and not is_gif) or not links.get(ref):
            continue
        seen.add(ref)
        body = get(links[ref])
        ext = 'gif' if body[:3] == b'GIF' else 'png' if body[:4] == b'\x89PNG' else 'jpg' if body[:2] == b'\xff\xd8' else 'bin'
        safe = re.sub(r'[^\w.-]+', '-', name).strip('-')[:60] or 'layer'
        path = os.path.join(out, f'{safe}-{ref[:8]}.{ext}')
        open(path, 'wb').write(body)
        print(f'{path}  ({len(body) // 1024} KB)')
    if not seen:
        print(f'{len(found)} image fills found, none of them GIFs. Re-run with --all to download the stills too.')


if __name__ == '__main__':
    main()

# Prototype / Smart Animate motion is not stored as a GIF. To get one: present the slide, record
# the screen (macOS: Cmd+Shift+5), then convert, e.g.
#   ffmpeg -i rec.mov -vf "fps=20,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" out.gif
