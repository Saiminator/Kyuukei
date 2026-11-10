#!/usr/bin/env python3
"""Validate editorial volume data before a standard Jekyll/GitHub Pages build."""
import json
import re
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


def front_matter(path):
    text = path.read_text()
    if not text.startswith('---\n'):
        raise ValueError(f'{path.name}: missing YAML front matter')
    yaml = text.split('---', 2)[1]
    return json.loads(subprocess.check_output(['ruby','-ryaml','-rjson','-e','puts JSON.generate(YAML.safe_load(STDIN.read, permitted_classes: [], aliases: false))'],input=yaml,text=True))


def validate(root=ROOT):
    palettes=json.loads((root/'_data/palettes.json').read_text())
    config=json.loads(subprocess.check_output(['ruby','-ryaml','-rjson','-e','puts JSON.generate(YAML.safe_load_file(ARGV[0], permitted_classes: [], aliases: false))',str(root/'_config.yml')],text=True))
    if config.get('palette') not in {p['id'] for p in palettes}:
        raise ValueError('The configured palette must exist in _data/palettes.json')
    for palette in palettes:
        for key in ['base','surface','trim','accent','button','glow','ink','muted']:
            if not re.fullmatch(r'#[0-9a-fA-F]{6}',palette[key]):
                raise ValueError(f'Invalid {key} color in {palette["id"]}')
    people = json.loads((root/'_data/characters.json').read_text())
    identities = {p['id']:p for p in people}
    if len(identities) != len(people):
        raise ValueError('Duplicate shared character ID')
    volumes = [front_matter(p) for p in sorted((root/'_volumes').glob('*.md'))]
    numbers, slugs = set(), set()
    for path, volume in zip(sorted((root/'_volumes').glob('*.md')), volumes):
        n = volume['number']
        if not isinstance(n,int) or n<1 or n in numbers:
            raise ValueError(f'{path.name}: invalid or duplicate volume number')
        numbers.add(n)
        if volume['slug'] != path.stem or volume['slug'] in slugs:
            raise ValueError(f'{path.name}: slug must match its filename and be unique')
        slugs.add(volume['slug'])
        if volume['title'] != f'Volume {n}':
            raise ValueError(f'{path.name}: title must be Volume {n}')
        if not isinstance(volume['published'],bool) or volume['status'] not in ['Planned','Upcoming','Available']:
            raise ValueError(f'{path.name}: invalid publication state')
        if volume['published'] and volume['status']=='Planned' and (volume.get('synopsis') or volume.get('featured_characters') or volume.get('bonus')):
            raise ValueError(f'{path.name}: public Planned volumes cannot include a description or cast')
        if n==1 and volume.get('featured_characters'):
            raise ValueError('Volume 1 must not include a cast list or character summaries')
        if volume['published'] and n>1 and volume['status']!='Planned' and not volume.get('featured_characters'):
            raise ValueError(f'{path.name}: announced volumes after Volume 1 require a returning cast list')
        if volume.get('purchase_url'):
            url=urlsplit(volume['purchase_url'])
            if url.scheme!='https' or not url.hostname or url.username or url.password or url.path in ('','/'):
                raise ValueError(f'{path.name}: purchase URL must point to a specific HTTPS product page')
        seen=set()
        for entry in volume.get('featured_characters',[]):
            cid=entry['character']
            if cid not in identities or cid in seen:
                raise ValueError(f'{path.name}: unknown or repeated character {cid}')
            seen.add(cid)
            identity=identities[cid]
            if not identity['introduced_in']<n:
                raise ValueError(f'{path.name}: {cid} has not been introduced in an earlier volume')
            if not isinstance(entry['known_through'],int) or not 0<=entry['known_through']<n:
                raise ValueError(f'{path.name}: {cid} summary includes knowledge from this volume or later')
            if not entry.get('description','').strip():
                raise ValueError(f'{path.name}: {cid} requires its own written summary')
            for order in [entry.get('order',identity['introduction_order']),identity['introduction_order']]:
                if not isinstance(order,int) or not 0<=order<=999999:
                    raise ValueError(f'{path.name}: character order must be an integer from 0 to 999999')
    return volumes


if __name__=='__main__':
    try:
        volumes=validate()
        print(f'Validated {len(volumes)} volume records and their character registries.')
    except (KeyError,ValueError,subprocess.CalledProcessError) as error:
        print(str(error),file=sys.stderr)
        sys.exit(1)
