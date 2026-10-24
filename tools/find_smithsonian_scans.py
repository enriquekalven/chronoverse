#!/usr/bin/env python3
"""Targeted Smithsonian Open Access 3D queries (rate-limited DEMO_KEY: keep it to a handful of calls).
Saves candidate _std.glb URLs to si_candidates.json and downloads the best full-skeleton matches."""
import json, os, sys, time, urllib.request, urllib.parse

ROOT = '/Users/enriq/.gemini/jetski/scratch/timeline-of-everything-3d/assets/models/smithsonian'
OUT = '/Users/enriq/.gemini/jetski/brain/df151ecc-57da-4827-b957-585e1cdb0767/scratch/si_candidates.json'
UA = 'Mozilla/5.0 (ChronoVerse3D educational asset fetch)'
QUERIES = sys.argv[1:] or ['Tyrannosaurus rex', 'Triceratops horridus', 'Mammuthus', 'Homo neanderthalensis', 'Apollo 11 command module', 'Smilodon', 'Camarasaurus', 'Edmontosaurus']

def api(q, rows=12):
    url = 'https://api.si.edu/openaccess/api/v1.0/search?q=%s&fq=online_media_type:%%223D%%20Images%%22&api_key=DEMO_KEY&rows=%d' % (urllib.parse.quote(q), rows)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

found = json.load(open(OUT)) if os.path.exists(OUT) else {}
for q in QUERIES:
    try:
        d = api(q)
    except Exception as e:
        print('ERR', q, e)
        if '429' in str(e):
            print('rate limited — stop'); break
        continue
    rows = d.get('response', {}).get('rows', [])
    print(f'== {q}: rowCount={d.get("response",{}).get("rowCount")}')
    for row in rows:
        title = row.get('title'); unit = row.get('unitCode')
        med = row.get('content', {}).get('descriptiveNonRepeating', {}).get('online_media', {}).get('media', [])
        for m in med:
            if m.get('type') != '3d_voyager':
                continue
            res = [x.get('url') for x in (m.get('resources') or []) if str(x.get('url', '')).endswith('_std.glb')]
            if res:
                key = f'{title}|{unit}|{m.get("content")}'
                found[key] = res
                print('  ', title, '|', unit, '|', res[0])
    time.sleep(0.5)
json.dump(found, open(OUT, 'w'), indent=1)
print('candidates saved:', len(found))
