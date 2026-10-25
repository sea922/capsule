import concurrent.futures, json, pathlib, urllib.request

ROOT = pathlib.Path(__file__).parent
REPOS = ['mattpocock/skills','obra/superpowers','addyosmani/agent-skills','cursor/plugins','DietrichGebert/ponytail','mvanhorn/last30days-skill','anthropics/skills','trailofbits/skills','EveryInc/compound-engineering-plugin','garrytan/gstack','affaan-m/ECC']
def get(url):
    req = urllib.request.Request(url, headers={'User-Agent':'coding-standards-research'})
    with urllib.request.urlopen(req, timeout=35) as r: return r.read().decode()
def inspect(repo):
    try:
        tree = json.loads(get(f'https://api.github.com/repos/{repo}/git/trees/HEAD?recursive=1'))
        sha = tree['sha']
        paths = [x['path'] for x in tree['tree'] if x['type']=='blob']
        candidates = [p for p in paths if p.endswith('SKILL.md') and any(k in p.lower() for k in ['coding-standard','frontend','backend','code-quality','code-review','simplicity','typescript','best-practice','skill-creator','compound-refresh','ce-compound/','property-based','differential-review'])]
        if repo=='cursor/plugins': candidates=[p for p in candidates if p.startswith('pstack/')]
        if repo=='affaan-m/ECC': candidates=['skills/coding-standards/SKILL.md','skills/backend-patterns/SKILL.md','skills/frontend-patterns/SKILL.md']
        selected = ['README.md'] + candidates[:5]
        files={}
        for p in selected:
            if p in paths:
                files[p]=get(f'https://raw.githubusercontent.com/{repo}/{sha}/{p}')
        result={'repo':repo,'sha':sha,'candidate_paths':candidates,'files':files}
        (ROOT/(repo.replace('/','__')+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
        return {'repo':repo,'sha':sha,'read':list(files),'candidates':candidates[:16]}
    except Exception as e: return {'repo':repo,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results=list(pool.map(inspect,REPOS))
(ROOT/'source-index.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
