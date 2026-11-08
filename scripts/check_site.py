#!/usr/bin/env python3
"""Check the generated site's local links, assets, metadata and retired routes."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[]
        self.ids=set()
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if attrs.get('id'): self.ids.add(attrs['id'])
        for key in ['href','src']:
            if attrs.get(key): self.links.append(attrs[key])


def main(root):
    failures=[]
    pages={}
    for file in root.rglob('*.html'):
        parser=Links();parser.feed(file.read_text());pages[file]=parser
    for file,parser in pages.items():
        base='https://kyuukei.com/'+file.relative_to(root).as_posix()
        for href in parser.links:
            if href.startswith(('mailto:','tel:','data:','javascript:')): continue
            url=urlsplit(urljoin(base,href))
            if url.netloc!='kyuukei.com': continue
            target=root/unquote(url.path.lstrip('/'))
            if target.is_dir(): target=target/'index.html'
            if not target.exists(): failures.append(f'{file.relative_to(root)}: missing {href}')
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                failures.append(f'{file.relative_to(root)}: missing anchor {href}')
    for file in root.rglob('*.css'):
        for value in re.findall(r'url\(([^)]+)\)',file.read_text()):
            value=value.strip(' \"\'')
            if value.startswith(('data:','http:','https:')): continue
            target=(root/value.lstrip('/')) if value.startswith('/') else file.parent/value
            if not target.is_file(): failures.append(f'{file.relative_to(root)}: missing CSS asset {value}')
    for path in ['index.html','story/index.html','news/index.html','privacy/index.html','volumes/volume-1/index.html','volumes/volume-2/index.html','volumes/volume-3/index.html','volumes/volume-4/index.html','404.html']:
        text=(root/path).read_text()
        if 'Liquid error' in text or '{{' in text or '{%' in text: failures.append(f'{path}: unresolved template')
        if 'noindex,nofollow' in text or 'robots" content="noindex' in text: failures.append(f'{path}: development noindex remains')
        if '<link rel="canonical"' not in text: failures.append(f'{path}: missing canonical URL')
    for path in ['_concepts','_chapters','_characters','_questions','_stories','scripts','tests','docs','characters.json']:
        if (root/path).exists(): failures.append(f'Retired/development content was published: {path}')
    if failures: raise AssertionError('\n'.join(failures))
    print(f'Checked {len(pages)} rendered pages, local links, CSS assets and publishing boundaries.')


if __name__=='__main__': main(Path(sys.argv[1] if len(sys.argv)>1 else '_site').resolve())
