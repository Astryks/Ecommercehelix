import re, html, random, os
from data import TILE, SWIPE
LOGO=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'logo.svg')).read()
LOGO=re.sub(r'<rect[^>]*/>','',LOGO)
# ---------------- colourways ----------------
# bg, fg(body), hd(headline), ac(accent: kicker/numbers), sw(headline swipe), cd(card), ct(card text), ln(lines), dd(doodle), dd2(2nd doodle), hl(highlight on cards), note(sticky colour), lg(logo ink), lp(logo accent)
CW={
'paper': dict(bg='#F2F1EC',fg='#1A1718',hd='#5A50D6',ac='#5A50D6',sw='#CFCAF7',cd='#FFFFFF',ct='#1A1718',ln='#1A1718',dd='#5A50D6',dd2='#F2A93B',hl='#D9D5FA',note='#FFF0A6',lg='#1A1718',lp='#5A50D6'),
'grape': dict(bg='#5A50D6',fg='#FFF6E4',hd='#FFF6E4',ac='#FFD84D',sw='#3B32A8',cd='#FFF6E4',ct='#1A1718',ln='#1A1718',dd='#FFD84D',dd2='#FFF6E4',hl='#FFE27A',note='#FFF0A6',lg='#FFF6E4',lp='#FFD84D'),
'sunny': dict(bg='#FFD84D',fg='#1A1718',hd='#1A1718',ac='#3F35B8',sw='#FFFFFF',cd='#FFFBEA',ct='#1A1718',ln='#1A1718',dd='#3F35B8',dd2='#FF7A59',hl='#FFE27A',note='#FFFFFF',lg='#1A1718',lp='#3F35B8'),
'mint':  dict(bg='#C2EAD6',fg='#1A1718',hd='#1A1718',ac='#3F35B8',sw='#FFFFFF',cd='#FFFFFF',ct='#1A1718',ln='#1A1718',dd='#1E6B52',dd2='#3F35B8',hl='#BDEBD3',note='#FFF0A6',lg='#1A1718',lp='#3F35B8'),
'peach': dict(bg='#FFD2BF',fg='#1A1718',hd='#1A1718',ac='#3F35B8',sw='#FF9C7A',cd='#FFF7F2',ct='#1A1718',ln='#1A1718',dd='#D9472B',dd2='#3F35B8',hl='#FFC9B3',note='#FFF0A6',lg='#1A1718',lp='#3F35B8'),
'sky':   dict(bg='#C9E4FF',fg='#1A1718',hd='#2A2290',ac='#2A2290',sw='#FFFFFF',cd='#FFFFFF',ct='#1A1718',ln='#1A1718',dd='#2A2290',dd2='#F2A93B',hl='#CFE6FF',note='#FFF0A6',lg='#1A1718',lp='#2A2290'),
'night': dict(bg='#1A1718',fg='#F2F1EC',hd='#F2F1EC',ac='#B3A8FF',sw='#5A50D6',cd='#2A2629',ct='#F2F1EC',ln='#B3A8FF',dd='#B3A8FF',dd2='#FFD84D',hl='#4A40B8',note='#FFF0A6',lg='#F2F1EC',lp='#B3A8FF'),
'kraft': dict(bg='#D9BB8E',fg='#1A1718',hd='#1A1718',ac='#3A2E9C',sw='#F3E6CC',cd='#F7EEDD',ct='#1A1718',ln='#1A1718',dd='#3A2E9C',dd2='#A3402A',hl='#E9D6B4',note='#FFF0A6',lg='#1A1718',lp='#3A2E9C'),
'lilac': dict(bg='#DED7FF',fg='#1A1718',hd='#3A30B8',ac='#3A30B8',sw='#FFFFFF',cd='#FFFFFF',ct='#1A1718',ln='#1A1718',dd='#3A30B8',dd2='#FF8F6B',hl='#E4DFFF',note='#FFF0A6',lg='#1A1718',lp='#3A30B8'),
}
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in c]; return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    a,b=lum(a),lum(b); return (max(a,b)+.05)/(min(a,b)+.05)
# ---------------- doodles ----------------
def dpath(kind,c,c2):
    S=f'fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'
    D={
    'star':f'<path pathLength="1" class="dr" {S} d="M50 8 L61 38 L93 40 L68 60 L77 92 L50 74 L23 92 L32 60 L7 40 L39 38 Z"/>',
    'sparkle':f'<path pathLength="1" class="dr" {S} d="M50 6 V40 M50 60 V94 M6 50 H40 M60 50 H94 M22 22 L36 36 M78 78 L64 64 M78 22 L64 36 M22 78 L36 64"/>',
    'squiggle':f'<path pathLength="1" class="dr" {S} d="M5 55 q11 -30 22 0 t22 0 t22 0 t22 0"/>',
    'circle':f'<path pathLength="1" class="dr" {S} d="M70 14 C30 4 6 30 10 56 C14 84 60 96 84 76 C100 60 92 22 56 12 C44 9 34 12 28 16"/>',
    'spiral':f'<path pathLength="1" class="dr" {S} d="M50 50 m0 0 c6 -2 8 6 2 9 c-9 4 -16 -6 -11 -14 c7 -11 24 -7 26 6 c3 16 -14 27 -28 21 c-18 -8 -18 -34 0 -42 c20 -9 42 4 42 26"/>',
    'arrow':f'<path pathLength="1" class="dr" {S} d="M8 80 C30 30 60 20 88 26 M70 10 L90 26 L72 42"/>',
    'heart':f'<path pathLength="1" class="dr" {S} d="M50 86 C10 60 6 36 18 24 C30 12 46 20 50 34 C54 20 70 12 82 24 C94 36 90 60 50 86 Z"/>',
    'zigzag':f'<path pathLength="1" class="dr" {S} d="M6 60 L22 36 L38 60 L54 36 L70 60 L86 36"/>',
    'dots':f'<g fill="{c}"><circle cx="20" cy="30" r="7"/><circle cx="52" cy="22" r="7"/><circle cx="82" cy="36" r="7"/><circle cx="34" cy="66" r="7"/><circle cx="70" cy="74" r="7"/></g>',
    'burst':f'<path pathLength="1" class="dr" {S} d="M50 4 V24 M50 76 V96 M4 50 H24 M76 50 H96 M18 18 L32 32 M82 82 L68 68 M82 18 L68 32 M18 82 L32 68"/><circle cx="50" cy="50" r="10" fill="{c2}"/>',
    'tape':f'<rect x="4" y="34" width="92" height="32" rx="3" fill="{c2}" opacity=".75" transform="rotate(-8 50 50)"/>',
    }
    return D[kind]
def doodle(kind,x,y,s,rot,c,c2,d=0.5,wig=True):
    return (f'<div class="dd a-pop" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px;--r:{rot}deg;--d:{d}s">'
            f'<svg viewBox="0 0 100 100" class="{"wig" if wig else ""}" style="--wd:{random.choice([1,1.5,2,3])}s;width:100%;height:100%;overflow:visible">{dpath(kind,c,c2)}</svg></div>')
# ---------------- helpers ----------------
def esc(s): return html.escape(s,quote=False)
def tag(s):  # posts_data body strings already contain trusted <b class='u'>/<br>
    return s
def num_span(v,d=0.9,dur=1.3,down=False):
    return f'<span class="cnt" data-v="{html.escape(v)}" data-d="{d}" data-dur="{dur}" data-down="{1 if down else 0}">{esc(v)}</span>'
def title_html(t,n):
    w=SWIPE.get(n); lines=t.split('\n'); out=[]; done=False
    for L in lines:
        e=esc(L)
        if w and not done and esc(w) in e:
            i=e.rfind(esc(w)); e=e[:i]+f'<span class="sw">{esc(w)}</span>'+e[i+len(esc(w)):]; done=True
        out.append(e)
    return '<br>'.join(out)
def tsize(t,base=1.0):
    L=max(len(x) for x in t.split('\n')) if '\n' in t else len(t)
    s=124 if L<=12 else 112 if L<=18 else 100 if L<=26 else 90 if L<=34 else 80 if L<=44 else 72
    return int(s*base)
def tick_box(i,d):
    return (f'<svg class="box" viewBox="0 0 60 60"><path d="M8 10 Q30 6 52 9 Q55 30 51 52 Q30 55 9 51 Q6 30 8 10Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>'
            f'<path pathLength="1" class="dr tk" style="--d:{d}s" d="M14 32 L26 44 L50 12" fill="none" stroke="var(--ac2)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>')
