import sys, json, os, subprocess
from multiprocessing import Pool
from playwright.sync_api import sync_playwright
from data import POSTS, LAY, ANIM
from page import build
OUT='/workspace/reports/helix/social-v3'
COL={int(k):v for k,v in json.load(open(OUT+'/src/assign.json'))['COL'].items()}
BY={p['n']:p for p in POSTS}
DUR=6.0; FPS=30
def name(n): return BY[n]['f'].replace('post','post',1)
def job(args):
    ns,video=args; res=[]
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=b.new_page(viewport=dict(width=1080,height=1350))
        for n in ns:
            p=BY[n]; h=build(p,LAY[n],COL[n],DUR)
            open(f'{OUT}/html/{p["f"]}.html','w').write(h)
            pg.set_content(h); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(150)
            pg.evaluate('swipes()'); pg.evaluate('setT(4.2)'); k=pg.evaluate('fit()'); pg.evaluate('setT(4.2)')
            bad=pg.evaluate('qa()')
            if not video:
                pg.screenshot(path=f'{OUT}/static/{p["f"]}.png')
            else:
                fn=f'{OUT}/animated/{p["f"]}.mp4'
                ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-r',str(FPS),fn],stdin=subprocess.PIPE)
                for i in range(int(DUR*FPS)):
                    pg.evaluate(f'setT({i/FPS})'); ff.stdin.write(pg.screenshot(type='jpeg',quality=92))
                ff.stdin.close(); ff.wait()
            res.append((n,k,bad))
        b.close()
    return res
if __name__=='__main__':
    mode=sys.argv[1]; ns=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else (sorted(ANIM) if mode=='video' else sorted(BY))
    chunks=[ns[i::6] for i in range(6)]
    with Pool(6) as pool:
        for r in pool.map(job,[(c,mode=='video') for c in chunks if c]):
            for n,k,bad in r: print(n,LAY[n],COL[n],'fit',[round(x,2) for x in k],'CLIP:'+str(bad) if bad else 'ok')
