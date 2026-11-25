#!/usr/bin/env python3
"""Read an existing slideshow and turn it into a first-draft Scenecraft talk.

usage: slides_in.py <deck> [--json outline.json] [--draft scenes.js] [--max N]

<deck> can be:
  .pptx            PowerPoint (also what Google Slides and Keynote export)
  .pdf             needs the `pdftotext` command (poppler); text only
  .md / .txt       an outline: '# Title' or '---' starts a slide, '- ' lines are bullets, 'Notes:' starts notes
  a folder         of slide .html files (for example a Slides artifact's project/slides/, with ../deck.json for order)

--json writes the outline it read: [{n, title, subtitle, bullets, notes, table, images}]
--draft writes a scene file you can build straight away. Every slide becomes one scene with a world
        picked by simple rules. It is a starting point: read references/worlds.md and improve the choices.
Only the Python standard library is used. Pictures are counted, not imported.
"""
import sys, os, re, json, zipfile, html, subprocess, shutil
import xml.etree.ElementTree as ET

NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
RID = '{%s}id' % NS['r']


def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def slide(n):
    return {'n': n, 'title': '', 'subtitle': '', 'bullets': [], 'notes': '', 'table': [], 'images': 0}


# ---------- readers ----------
def rels(z, path):
    d, f = os.path.split(path)
    rp = d + '/_rels/' + f + '.rels'
    out = {}
    if rp in z.namelist():
        for r in ET.fromstring(z.read(rp)):
            tgt = r.get('Target', '')
            if r.get('TargetMode') != 'External':
                tgt = os.path.normpath(os.path.join(d, tgt)).replace('\\', '/')
            out[r.get('Id')] = (r.get('Type', '').rsplit('/', 1)[-1], tgt)
    return out


def paras(node):
    out = []
    for p in node.iter('{%s}p' % NS['a']):
        t = clean(''.join(x.text or '' for x in p.iter('{%s}t' % NS['a'])))
        if t:
            pr = p.find('a:pPr', NS)
            out.append((int(pr.get('lvl', 0)) if pr is not None else 0, t))
    return out


def read_pptx(path):
    z = zipfile.ZipFile(path)
    pres = 'ppt/presentation.xml'
    pr = rels(z, pres)
    root = ET.fromstring(z.read(pres))
    order = [pr[s.get(RID)][1] for s in root.iter('{%s}sldId' % NS['p']) if s.get(RID) in pr]
    slides = []
    for i, sp in enumerate(order):
        s = slide(i + 1)
        x = ET.fromstring(z.read(sp))
        loose = []
        for shp in x.iter('{%s}sp' % NS['p']):
            ph = shp.find('p:nvSpPr/p:nvPr/p:ph', NS)
            kind = ph.get('type', 'body') if ph is not None else None
            ps = paras(shp)
            if not ps:
                continue
            if kind in ('title', 'ctrTitle') and not s['title']:
                s['title'] = ' '.join(t for _, t in ps)
            elif kind == 'subTitle':
                s['subtitle'] = ' '.join(t for _, t in ps)
            elif kind in ('sldNum', 'dt', 'ftr'):
                continue
            elif kind is None:
                loose += [t for _, t in ps]
            else:
                s['bullets'] += [t for _, t in ps]
        for tbl in x.iter('{%s}tbl' % NS['a']):
            for tr in tbl.iter('{%s}tr' % NS['a']):
                s['table'].append([clean(''.join(t.text or '' for t in tc.iter('{%s}t' % NS['a']))) for tc in tr.iter('{%s}tc' % NS['a'])])
        s['images'] = sum(1 for _ in x.iter('{%s}pic' % NS['p']))
        if not s['title'] and loose:
            s['title'] = loose.pop(0)
        s['bullets'] += loose
        for typ, tgt in rels(z, sp).values():
            if typ == 'notesSlide' and tgt in z.namelist():
                nx = ET.fromstring(z.read(tgt))
                keep = []
                for shp in nx.iter('{%s}sp' % NS['p']):
                    ph = shp.find('p:nvSpPr/p:nvPr/p:ph', NS)
                    if ph is not None and ph.get('type') == 'body':
                        keep += [t for _, t in paras(shp)]
                s['notes'] = ' '.join(keep)
        slides.append(s)
    return slides


def read_outline(path):
    slides, cur, in_notes = [], None, False
    for raw in open(path, encoding='utf-8', errors='replace').read().splitlines():
        line = raw.rstrip()
        m = re.match(r'^#{1,3}\s+(.*)', line)
        if m or re.match(r'^-{3,}\s*$', line):
            cur = slide(len(slides) + 1); slides.append(cur); in_notes = False
            if m: cur['title'] = clean(m.group(1))
            continue
        if not line.strip():
            continue
        if cur is None:
            cur = slide(1); slides.append(cur)
        if re.match(r'^\s*(notes?|speaker notes?)\s*:', line, re.I):
            in_notes = True
            line = re.sub(r'^\s*[^:]*:\s*', '', line)
            if not line: continue
        t = clean(re.sub(r'^\s*([-*+•]|\d+[.)])\s+', '', line))
        t = re.sub(r'[*_`]{1,2}', '', t)
        if in_notes: cur['notes'] = clean(cur['notes'] + ' ' + t)
        elif not cur['title']: cur['title'] = t
        else: cur['bullets'].append(t)
    return slides


def strip_tags(s):
    return clean(html.unescape(re.sub(r'<[^>]+>', ' ', s)))


def read_html_folder(path):
    files = sorted(f for f in os.listdir(path) if f.endswith('.html'))
    for cand in (os.path.join(path, 'deck.json'), os.path.join(path, '..', 'deck.json')):
        if os.path.exists(cand):
            try:
                order = json.load(open(cand)).get('order', [])
                files = [o + '.html' for o in order if o + '.html' in files] + [f for f in files if f[:-5] not in order]
            except Exception:
                pass
            break
    slides = []
    for f in files:
        t = open(os.path.join(path, f), encoding='utf-8', errors='replace').read()
        s = slide(len(slides) + 1)
        m = re.search(r'<aside[^>]*>(.*?)</aside>', t, re.S)
        if m: s['notes'] = strip_tags(m.group(1)); t = t.replace(m.group(0), '')
        t = re.sub(r'<(svg|style|script|x-embed)\b.*?</\1>', ' ', t, flags=re.S)
        heads = [strip_tags(x) for x in re.findall(r'<h[12][^>]*>(.*?)</h[12]>', t, re.S)]
        body = [strip_tags(x) for x in re.findall(r'<(?:p|li|h3|td|th)\b[^>]*>(.*?)</(?:p|li|h3|td|th)>', t, re.S)]
        s['title'] = heads[0] if heads else (body.pop(0) if body else f[:-5])
        s['bullets'] = [b for b in body if b and b != s['title']]
        s['images'] = len(re.findall(r'<img\b', t))
        slides.append(s)
    return slides


def read_pdf(path):
    if not shutil.which('pdftotext'):
        sys.exit('PDF input needs the pdftotext command (install poppler), or export the deck as .pptx instead.')
    txt = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
    slides = []
    for page in txt.split('\f'):
        lines = [clean(l) for l in page.splitlines() if clean(l)]
        if not lines: continue
        s = slide(len(slides) + 1); s['title'] = lines[0]
        s['bullets'] = [re.sub(r'^([-*•▪◦]|\d+[.)])\s+', '', l) for l in lines[1:] if not re.fullmatch(r'\d{1,3}', l)]
        slides.append(s)
    return slides


def read_any(path):
    if os.path.isdir(path): return read_html_folder(path)
    ext = os.path.splitext(path)[1].lower()
    if ext == '.pptx': return read_pptx(path)
    if ext == '.pdf': return read_pdf(path)
    if ext in ('.md', '.markdown', '.txt'): return read_outline(path)
    if ext in ('.key', '.ppt', '.odp'): sys.exit('Export this deck as .pptx (or PDF) first; %s files are not read directly.' % ext)
    sys.exit('Unrecognised input: give a .pptx, .pdf, .md/.txt outline, or a folder of slide .html files.')


# ---------- draft ----------
NUM = re.compile(r'(?<![\w.])(\d[\d,]*\.?\d*)\s*(%|x|×|k|m|bn|b)?', re.I)
ROTATE = ['planet', 'stairs', 'scaleTower', 'ribbons', 'blocks', 'pier', 'city', 'gyro']
RULES = [('gyro', r'\b(loop|cycle|flywheel|feedback|iterat\w*|virtuous|recurs\w*)\b'),
         ('hangingSun', r'\b(risk\w*|danger\w*|fragile|threat\w*|depend\w*|single point|caveat\w*|warning\w*|safety)\b'),
         ('city', r'\b(million\w*|billion\w*|thousand\w*|scale|scaling|users|customers|population|everyone|mass)\b'),
         ('ribbons', r'\b(scenario\w*|forecast\w*|projection\w*|trajector\w*|curve\w*|exponential\w*|takeoff|outlook)\b'),
         ('stairs', r'\b(step\w*|stage\w*|phase\w*|roadmap|milestone\w*|progress\w*|growth|trend\w*|doubl\w*)\b'),
         ('pier', r'\b(histor\w*|timeline|decade\w*|century|centuries|years|era|past)\b'),
         ('scaleTower', r'\b(compar\w*|versus|vs|limit\w*|ceiling|rank\w*|hierarch\w*|levels?)\b'),
         ('planet', r'\b(world\w*|global\w*|planet\w*|earth|climate|countr\w*|market\w*|econom\w*)\b'),
         ('blocks', r'\b(driver\w*|factor\w*|input\w*|pillar\w*|component\w*|ingredient\w*|multipl\w*)\b')]
LABELS = {'gyro': 4, 'city': 4, 'ribbons': 3, 'blocks': 3, 'monoliths': 6}


def esc(s): return html.escape(s, quote=False)


def short(s, n=64):
    s = clean(s)
    return s if len(s) <= n else s[:n - 1].rsplit(' ', 1)[0] + '…'


def number_in(text):
    m = NUM.search(text)
    if not m: return None
    try: v = float(m.group(1).replace(',', ''))
    except ValueError: return None
    return v, clean(m.group(0))


def choose(s, i, total, used):
    text = (s['title'] + ' ' + ' '.join(s['bullets'])).lower()
    b = s['bullets']
    if i == 0: return 'sea', 'first slide'
    if i == total - 1: return 'sunrise', 'last slide'
    rows = [r for r in s['table'][1:] if len(r) >= 2 and number_in(r[-1])] if s['table'] else []
    if len(rows) >= 2: return 'towers:table', 'a table with numbers'
    nums = [x for x in b if number_in(x)]
    if 2 <= len(nums) <= 8 and len(nums) >= len(b) - 1: return 'towers', 'most bullets carry a number'
    if re.match(r'^[“"«]', s['title']) or (len(b) <= 2 and any(re.match(r'^[“"«]', x) for x in b)): return 'pages', 'reads as a quotation'
    if not b and not s['subtitle'] and len(s['title'].split()) <= 14: return 'tunnel', 'a single statement'
    years = re.findall(r'\b(1[5-9]\d\d|20\d\d)\b', text)
    if len(set(years)) >= 3 and 3 <= len(b) <= 6: return 'monoliths', 'several years in order'
    for world, pat in RULES:
        if re.search(pat, text) and used.get(world, 0) < 2: return world, 'keyword match'
    for k in range(len(ROTATE)):
        w = ROTATE[(i + k) % len(ROTATE)]
        if used.get(w, 0) == min(used.get(x, 0) for x in ROTATE): return w, 'no strong signal: rotated for variety'
    return ROTATE[i % len(ROTATE)], 'rotated'


def scene_js(s, i, total, used):
    world, why = choose(s, i, total, used)
    base = world.split(':')[0]
    used[base] = used.get(base, 0) + 1
    b = [x for x in s['bullets'] if x]
    opts, flags = {}, {'scrimL': True}
    if base == 'towers':
        items = []
        if world.endswith('table'):
            for r in s['table'][1:9]:
                n = number_in(r[-1])
                if n: items.append({'label': short(r[0], 26), 'value': n[0], 'show': n[1]})
        else:
            for x in b[:8]:
                n = number_in(x)
                if n: items.append({'label': short(NUM.sub('', x, 1).strip(' :–-,'), 30) or n[1], 'value': n[0], 'show': n[1]})
        opts['items'] = items; b = [x for x in b if not number_in(x)] if not world.endswith('table') else b
        flags = {'scrimS': True}
    elif base == 'monoliths':
        lab = []
        for x in b[:6]:
            y = re.search(r'\b(1[5-9]\d\d|20\d\d)\b', x)
            lab.append('<h3>%s</h3><p class="lab" style="letter-spacing:0;margin-top:6px">%s</p>' % (y.group(1) if y else '', esc(short(re.sub(r'\b(1[5-9]\d\d|20\d\d)\b[:\s–-]*', '', x, 1), 44))))
        opts['labels'] = lab + [None] * (6 - len(lab)); b = []; flags = {'scrimS': True}
    elif base in LABELS:
        k = LABELS[base]; lab = [short(x, 28) for x in b[:k]]
        if len(lab) == k: opts['labels'] = lab
        else: opts['tags'] = []
    elif base == 'sunrise':
        opts['sunrise'] = True; flags = {'scrimS': True}
    elif base in ('stairs', 'scaleTower', 'pier'):
        opts['tags'] = []
    if base == 'tunnel': flags = {'light': True, 'scrim': True}
    if base == 'pages': flags = {'scrim': True}
    if base == 'sea': flags = {}
    lib = 'sea' if base == 'sunrise' else base
    rest = b[4:]; groups = [[x] for x in b[:4]]   # at most four short lines on screen; the rest goes to the notes
    nb = max(2 if base in ('sea', 'sunrise', 'towers', 'tunnel') else 1, min(4, len(groups)))
    first = clean(s['notes']) or ('Slide %d: %s' % (s['n'], s['title']))
    if rest: first += ' (Not shown on screen: ' + '; '.join(short(x, 90) for x in rest[:12]) + ')'
    beats = [{'dur': 2.6, 'note': first if k == 0 else (' '.join(groups[k]) if k < len(groups) else first)} for k in range(nb)]
    big = base in ('sea', 'sunrise', 'tunnel')
    layers = []
    if big:
        layers.append({'b': [0, nb - 1], 'z': 'tl', 'h': '<p class="eb">%s</p>' % esc(short(s['subtitle'] or ('%02d / %02d' % (i + 1, total)), 60))})
        layers.append({'b': [0, nb - 1], 'z': 'ml', 'h': '<h1 style="max-width:1500px;font-size:%dpx">%s</h1>' % (168 if len(s['title']) < 34 else 120 if len(s['title']) < 70 else 88, esc(s['title']))})
        if b: layers.append({'b': [min(1, nb - 1), nb - 1], 'z': 'bl', 'h': '<p class="lede">%s</p>' % esc(short(b[0], 150))})
    elif base == 'pages':
        layers.append({'b': [0, nb - 1], 'z': 'tl', 'h': '<p class="eb">%02d / %02d</p>' % (i + 1, total)})
        layers.append({'b': [0, nb - 1], 'z': 'ml', 'h': '<h2>%s</h2>' % esc(s['title']) + ''.join('<p class="lede gap" data-b="%d">%s</p>' % (min(k + 1, nb - 1), esc(x)) for k, x in enumerate(b[:2]))})
    else:
        layers.append({'b': [0, nb - 1], 'z': 'tl', 'h': '<p class="eb">%02d / %02d</p><h2 style="max-width:900px">%s</h2>' % (i + 1, total, esc(s['title'])) + ('<p class="lede gap" style="max-width:640px">%s</p>' % esc(short(s['subtitle'], 120)) if s['subtitle'] else '')})
        if groups:
            layers.append({'b': [0, nb - 1], 'z': 'bl', 'h': ''.join('<div class="%s" data-b="%d"><p class="body">%s</p></div>' % ('pt' if k else '', min(k, nb - 1), '<br>'.join(esc(short(x, 96)) for x in g)) for k, g in enumerate(groups[:4]))})
    j = lambda o: json.dumps(o, ensure_ascii=False)
    sid = 's%02d' % (i + 1)
    extra = ''.join(',%s:%s' % (k, j(v)) for k, v in flags.items())
    note = '/* slide %d -> %s (%s)%s */' % (s['n'], base, why, '; %d picture(s) not carried over' % s['images'] if s['images'] else '')
    return base, '%s\nSC.push({...WORLDS.%s(%s), id:%s, title:%s, kind:%d%s,\n beats:%s,\n layers:%s});\n' % (
        note, lib, j(opts), j(sid), j(short(s['title'], 48) or sid), [0, 2, 1, 3, 4][i % 5], extra, j(beats), j(layers))


def draft(slides, src):
    used, out, picks = {}, [], []
    for i, s in enumerate(slides):
        w, js = scene_js(s, i, len(slides), used); picks.append(w); out.append(js)
    head = ('/* First draft made by slides_in.py from %s: %d slides -> %d scenes.\n'
            '   Worlds used: %s\n'
            '   This is a starting point, not a finished talk. Next:\n'
            '     - cut text: one idea per beat; move detail into the speaker notes\n'
            '     - replace worlds picked by rotation or a keyword with ones that show the idea (references/worlds.md)\n'
            '     - design a few worlds for this subject, and merge or drop slides that add nothing\n'
            '     - check every number and quotation against the original deck */\n\n') % (
        os.path.basename(src.rstrip('/')), len(slides), len(slides), ', '.join('%s×%d' % (k, v) for k, v in sorted(used.items())))
    return head + '\n'.join(out)


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'): sys.exit(__doc__)
    src, jout, dout, mx = a[0], None, None, 40
    i = 1
    while i < len(a):
        if a[i] == '--json': jout = a[i + 1]; i += 2
        elif a[i] == '--draft': dout = a[i + 1]; i += 2
        elif a[i] == '--max': mx = int(a[i + 1]); i += 2
        else: sys.exit('unknown option ' + a[i])
    slides = [s for s in read_any(src) if s['title'] or s['bullets']][:mx]
    if not slides: sys.exit('No slide text found in ' + src)
    for k, s in enumerate(slides): s['n'] = k + 1
    if jout:
        os.makedirs(os.path.dirname(os.path.abspath(jout)), exist_ok=True)
        json.dump(slides, open(jout, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if dout:
        os.makedirs(os.path.dirname(os.path.abspath(dout)), exist_ok=True)
        open(dout, 'w', encoding='utf-8').write(draft(slides, src))
    print('%d slides read from %s' % (len(slides), src))
    for s in slides:
        print('  %2d  %-52s %d bullets%s%s' % (s['n'], short(s['title'], 50), len(s['bullets']), ', notes' if s['notes'] else '', ', %d pictures' % s['images'] if s['images'] else ''))
    if jout: print('outline:', jout)
    if dout: print('draft scenes:', dout)


if __name__ == '__main__':
    main()
