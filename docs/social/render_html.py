"""Re-render social posts from their saved html/ pages (same steps as v2/src/render.py and v3/src/render.py).

Use this when a post's text has been corrected in its html/ page, for example v2, whose posts 8 to 57 come from
facebook/src/posts_data.py on the build box and cannot be rebuilt from this repo.

    python docs/social/render_html.py docs/social/v2 post47-rest
    python docs/social/render_html.py --video docs/social/v2 post04-bf-countdown

Writes <set>/static/<name>.png and, with --video, <set>/animated/<name>.mp4 (6 s, 30 fps, needs ffmpeg).
Needs Python Playwright (pip install playwright) and Chrome. Env:
  CHROME           Chrome binary (default /usr/bin/google-chrome)
  SOCIAL_WEBFONTS  1 = load Nunito, Kalam and Permanent Marker from Google Fonts if they are not installed
"""
import os, subprocess, sys
from playwright.sync_api import sync_playwright

CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
FONTLINK = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@700'
            '&family=Nunito:wght@200..1000&family=Permanent+Marker&display=block">'
            if os.environ.get('SOCIAL_WEBFONTS') == '1' else '')
DUR, FPS = 6.0, 30


def main(argv):
    video = '--video' in argv
    args = [a for a in argv if a != '--video']
    out, names = args[0], args[1:]
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path=CHROME)
        pg = b.new_page(viewport=dict(width=1080, height=1350))
        for nm in names:
            h = open(f'{out}/html/{nm}.html', encoding='utf-8').read()
            pg.set_content(h.replace('<head>', '<head>' + FONTLINK, 1), wait_until='networkidle')
            pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(150)
            pg.evaluate('swipes()'); pg.evaluate('setT(4.2)'); k = pg.evaluate('fit()'); pg.evaluate('setT(4.2)')
            bad = pg.evaluate('qa()')
            pg.screenshot(path=f'{out}/static/{nm}.png')
            if video:
                ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg',
                                       '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                                       '-movflags', '+faststart', '-r', str(FPS), f'{out}/animated/{nm}.mp4'], stdin=subprocess.PIPE)
                for i in range(int(DUR * FPS)):
                    pg.evaluate(f'setT({i / FPS})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
                ff.stdin.close(); ff.wait()
            print(nm, 'fit', [round(x, 2) for x in k], 'CLIP:' + str(bad) if bad else 'ok')
        b.close()


if __name__ == '__main__':
    main(sys.argv[1:])
