#!/usr/bin/env python3
"""Verify native Jekyll collection generation, privacy, and registry ordering."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('content',ROOT/'scripts/validate_content.py')
content=importlib.util.module_from_spec(spec);spec.loader.exec_module(content)


def save(path,record):
    text=subprocess.check_output(['ruby','-ryaml','-rjson','-e','puts YAML.dump(JSON.parse(STDIN.read))'],input=json.dumps(record),text=True)
    path.write_text(text+'---\n')


def main():
    passed=[]
    with tempfile.TemporaryDirectory(prefix='kyuukei-release-test-') as tmp:
        stage=Path(tmp)/'source';output=Path(tmp)/'public'
        shutil.copytree(ROOT,stage,ignore=shutil.ignore_patterns('.git','_concepts','node_modules','_site','__pycache__','artifacts'))
        env={**os.environ,'BUNDLE_GEMFILE':str(ROOT/'Gemfile'),'JEKYLL_ENV':'production'}
        def build(validate=True):
            if validate:content.validate(stage)
            subprocess.run(['bundle','_2.6.9_','exec','jekyll','build','--destination',str(output),'--strict_front_matter','--trace'],cwd=stage,env=env,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
            return (output/'index.html').read_text()
        original=content.front_matter(stage/'_volumes/volume-2.md')
        first=content.front_matter(stage/'_volumes/volume-1.md')
        save(stage/'_volumes/volume-1.md',{**first,'featured_characters':[{'character':'kyuu','known_through':0,'description':'PRIVATE_KYUU_SENTINEL'}]})
        try:content.validate(stage)
        except ValueError as error:
            assert 'must not include a cast list' in str(error)
        else:raise AssertionError('Volume 1 cast was accepted')
        build(validate=False)
        first_page=(output/'volumes/volume-1/index.html').read_text()
        assert 'PRIVATE_KYUU_SENTINEL' not in first_page and 'registry-section' not in first_page
        save(stage/'_volumes/volume-1.md',first)
        for status in ['Upcoming','Available']:
            save(stage/'_volumes/volume-2.md',{**original,'status':status})
            try:content.validate(stage)
            except ValueError as error:
                assert 'require a returning cast list' in str(error)
            else:raise AssertionError(status+' Volume 2 without a cast was accepted')
        save(stage/'_volumes/volume-2.md',original)
        passed.append('Volume 1 rejects profiles; later published Upcoming and Available volumes require a returning cast')
        for key,value in [('synopsis','Unannounced information'),('featured_characters',[{'character':'kyuu'}])]:
            save(stage/'_volumes/volume-2.md',{**original,key:value})
            try:content.validate(stage)
            except ValueError:passed.append('Public Planned '+key+' is rejected')
            else:raise AssertionError('Planned '+key+' was accepted')
        save(stage/'_volumes/volume-2.md',original)
        save(stage/'_volumes/volume-6.md',{**original,'number':6,'slug':'volume-6','title':'Volume 6'})
        save(stage/'_volumes/volume-99.md',{**original,'number':99,'slug':'volume-99','title':'Volume 99','published':False,'synopsis':'PRIVATE_DRAFT_SENTINEL'})
        html=build()
        first_page=(output/'volumes/volume-1/index.html').read_text()
        for marker in ['registry-section','character-tile','profile-template-','<dialog','PRIVATE_KYUU_SENTINEL']:
            assert marker not in first_page
        passed.append('Volume 1 publishes no cast section, profile template, dialog or character summary')
        assert 'data-featured-volume="1"' in html
        assert (output/'volumes/volume-6/index.html').exists()
        assert not (output/'volumes/volume-99/index.html').exists()
        assert 'PRIVATE_DRAFT_SENTINEL' not in ''.join(p.read_text() for p in output.rglob('*.html'))
        passed.append('Jekyll automatically generates a new public volume, excludes drafts, and never features Planned volumes')
        entries=[{'character':cid,'known_through':1,'description':'Previously established profile for '+cid+'.'} for cid in ['yura','duran','kyuu']]
        second={**original,'status':'Upcoming','release_label':'2028','featured_characters':entries}
        save(stage/'_volumes/volume-2.md',second)
        html=build();landing=(output/'volumes/volume-2/index.html').read_text()
        assert 'data-featured-volume="2"' in html
        assert landing.index('data-character="kyuu"')<landing.index('data-character="duran"')<landing.index('data-character="yura"')
        assert 'class="registry-gate"' in landing
        passed.append('An Upcoming volume replaces the homepage feature and its spoiler-gated cast defaults to introduction order')
        entries[0]['order']=0
        save(stage/'_volumes/volume-2.md',second)
        first=content.front_matter(stage/'_volumes/volume-1.md')
        save(stage/'_volumes/volume-1.md',{**first,'status':'Available'})
        save(stage/'_volumes/volume-2.md',{**second,'status':'Available'})
        html=build();landing=(output/'volumes/volume-2/index.html').read_text()
        assert 'data-featured-volume=' not in html
        assert landing.index('data-character="yura"')<landing.index('data-character="kyuu"')<landing.index('data-character="duran"')
        passed.append('Manual order zero takes precedence and no Upcoming volume means no homepage fallback')
    print(json.dumps({'passed':len(passed),'checks':passed},indent=2))


if __name__=='__main__':main()
