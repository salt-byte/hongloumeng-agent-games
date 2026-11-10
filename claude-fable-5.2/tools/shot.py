# 自测脚本：截图 + 自动通关。用法：python3 tools/shot.py [jump ...] / python3 tools/shot.py play
import sys, os, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = 'file://' + str(ROOT / 'index.html')
OUT = ROOT / 'tools' / 'shots'; OUT.mkdir(exist_ok=True)
args = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    if args and args[0] == 'play':
        # 按给定的选项序列自动通关：python3 tools/shot.py play 1111111 1 1111
        picks = [int(c) for c in ''.join(args[1:])] or [1] * 20
        pg.goto(URL); pg.wait_for_timeout(400)
        pg.screenshot(path=str(OUT / 'title.png'))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(200); pg.screenshot(path=str(OUT / 'intro.png'))
        for _ in range(3): pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
        n = 0; seen = set()
        for step in range(4000):
            st = pg.evaluate("({mode:G.mode, c:G.choice&&G.choice.id, fade:!!G.fade, scene:G.scene, stage:G.stage, px:G.px, err:window.__err||null, seated:G.f.seated||0, marks:SCENES[G.scene].things(G).filter(t=>t.mark).map(t=>t.x)})")
            if st['err']: print('ERR', st['err']); break
            key = st['scene'] + st['stage']
            if key not in seen and st['mode'] == 'play':
                seen.add(key); pg.wait_for_timeout(150); pg.screenshot(path=str(OUT / f'play_{len(seen):02d}_{key}.png'))
            if st['mode'] == 'ending':
                pg.wait_for_timeout(1300); pg.screenshot(path=str(OUT / 'play_end.png')); print('ENDING', pg.evaluate('G.endId'), 'laugh', pg.evaluate('G.laugh')); break
            if st['c']:
                if st['c'] not in seen: seen.add(st['c']); pg.wait_for_timeout(120); pg.screenshot(path=str(OUT / f'choice_{st["c"]}.png'))
                k = picks[n] if n < len(picks) else 1; n += 1
                print('choice', st['c'], '->', k); pg.keyboard.press(str(k)); pg.wait_for_timeout(60); continue
            if st['mode'] == 'dialog' or st['fade']:
                pg.keyboard.press('Space'); pg.wait_for_timeout(40); continue
            if st['marks']:
                tx = st['marks'][0]; d = tx - st['px']
                if abs(d) < 80: pg.keyboard.press('e'); pg.wait_for_timeout(60)
                else:
                    k = 'ArrowRight' if d > 0 else 'ArrowLeft'; pg.keyboard.down(k); pg.wait_for_timeout(min(1500, abs(d) / 270 * 1000 * 0.8)); pg.keyboard.up(k)
            else:
                pg.keyboard.press('e'); pg.wait_for_timeout(80)
        else: print('DID NOT FINISH', st)
    else:
        for j in args or ['']:
            pg.goto('about:blank'); pg.goto(URL + ('#jump=' + j if j else '')); pg.wait_for_timeout(700)
            pg.screenshot(path=str(OUT / f'jump_{j or "title"}.png'))
            print(j, pg.evaluate("({mode:G.mode,c:G.choice&&G.choice.id,end:G.endId,err:window.__err||null})"))
    print('errors:', errs)
    b.close()
