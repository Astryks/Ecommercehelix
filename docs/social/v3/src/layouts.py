import random, re
from design import *
def rows_html(rows,cls='rw'):
    return ''.join(f'<div class="{cls} a-up" style="--d:{.8+.12*i:.2f}s"><span>{esc(a)}</span><b>{esc(b)}</b></div>' for i,(a,b) in enumerate(rows))
def paras(body): return [x.strip() for x in body.split('<br><br>')]
def items(lst,start=.9,step=.18):
    return [(x,start+step*i) for i,x in enumerate(lst)]

def L_stat(p,c):
    rows,res=p['body']; big=res[1]
    fs=230 if len(big)<=4 else 190 if len(big)<=6 else 150 if len(big)<=9 else 100
    m=f'''<div class="stat">
  <div class="statlab ka a-pop" style="--d:.6s">{esc(res[0])}</div>
  <div class="statnum pm a-pop" style="--d:.7s;font-size:calc({fs}px*var(--k))">{num_span(big,.8,1.4)}
     <svg class="ring" viewBox="0 0 300 120" preserveAspectRatio="none"><path pathLength="1" class="dr" style="--d:1.9s" d="M200 10 C80 -2 6 30 10 64 C14 104 150 120 250 100 C300 88 300 30 210 14 C180 9 150 10 130 14" fill="none" stroke="var(--dd)" stroke-width="5" stroke-linecap="round"/></svg></div>
  <div class="receipt card a-pop" style="--d:.5s;--r:-1.6deg">{rows_html(rows)}<div class="tape" style="left:42%;top:-24px;--r:-4deg"></div></div>
  {f'<div class="note a-up" style="--d:1.6s">{esc(p["note"])}</div>' if p['note'] else ''}
</div>'''
    return m
def L_steps(p,c):
    k=p['kind']
    if k=='calc':
        rows,res=p['body']
        cells=[(f'<span>{esc(a)}</span>'+(f'<b>{esc(b)}</b>' if b else '')) for a,b in rows]
        cells.append(f'<span class="pm">{esc(res[0])}</span><b class="pm big">{num_span(res[1],1.6,1.0)}</b>')
        badges=[None]*len(cells)
    elif k=='big':
        cells=[f'<span>{x}</span>' for x in paras(p['body'])]; badges=[str(i+1) for i in range(len(cells))]
    else:
        cells=[];badges=[]
        for i,x in enumerate(p['body']):
            m=re.match(r'^(✅ )?Step (\d+):',x)
            badges.append(('✓' if m.group(1) else m.group(2)) if m else str(i+1))
            cells.append(f'<span>{esc(x.replace("✅ ",""))}</span>')
    n=len(cells); out=[]
    fade={3:[1,.7,.5]}.get(p['n'])
    stair = k=='big'
    for i,cell in enumerate(cells):
        last = (k=='calc' and i==n-1)
        off = (i*110 if stair else (0 if i%2==0 else 70))
        b=badges[i]
        bd=f'<div class="badge pm {"s" if len(b)>1 else ""}">{b}</div>' if b else ''
        op=f'opacity:{fade[i]};' if fade else ''
        out.append(f'<div class="step a-pop {"final" if last else ""}" style="--d:{.8+.25*i:.2f}s;margin-left:{off}px;--r:{[-1,.8,-.6,1,-.8][i%5]}deg"><div class="card stepc" style="{op}">{bd}<div class="stx">{cell}</div></div></div>')
        if i<n-1:
            out.append(f'<div class="arr" style="margin-left:{off+(60 if i%2==0 else 30)}px">{"<svg viewBox=\"0 0 80 60\"><path pathLength=\"1\" class=\"dr\" style=\"--d:%.2fs\" d=\"M10 4 C 40 10 50 30 40 54 M26 44 L40 56 L52 42\" fill=\"none\" stroke=\"var(--dd)\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>" % (1.0+.25*i)}</div>')
    return f'<div class="steps {"stair" if stair else ""} {"few" if n<=3 else ""}">{"".join(out)}</div>'
def side_card(inner,i,label=''):
    return f'<div class="sd card a-pop" style="--d:{.8+.4*i:.2f}s;--r:{[-1.5,1.5][i]}deg">{inner}</div>'
def L_split(p,c):
    n=p['n']; k=p['kind']; mid='vs'; bottom=''; top=''
    if k=='sides':
        A,B=[f'{rows_html(s["rows"])}<div class="dash"></div><div class="rw res pm"><span>{esc(s["res"][0])}</span><b>{num_span(s["res"][1],1.4+.4*i,1.0)}</b></div>' for i,s in enumerate(p['body'])]
        mid='vs'
    elif k=='calc':
        rows,res=p['body']
        if n==9:
            top='<div class="chips">'+''.join(f'<span class="chip a-pop" style="--d:{.5+.1*i}s"><span>{esc(a)}</span> <b>{esc(b)}</b></span>' for i,(a,b) in enumerate(rows[:3]))+'</div>'
            A=f'<div class="ka sl">{esc(rows[3][0])}</div><div class="pm sbig">{num_span(rows[3][1],1.0,1.0)}</div>'
            B=f'<div class="ka sl">{esc(res[0])}</div><div class="pm sbig">{num_span(res[1],1.4,1.0)}</div>'
        else:
            A=rows_html(rows[:3]); B=rows_html(rows[3:]); mid='arrow'
            bottom=f'<div class="resbar a-pop" style="--d:1.8s;--r:-1deg"><span class="ka">{esc(res[0])}</span> <b class="pm">{num_span(res[1],1.9,.8)}</b></div>'
    else:
        ps=paras(p['body']); A,B=f'<p>{ps[0]}</p>',f'<p>{ps[1]}</p>'; mid='arrow' if n!=25 else 'vs'
        if len(ps)>2: bottom=f'<div class="splitfoot a-up" style="--d:1.8s">{ps[2]}</div>'
    midh=(f'<div class="vs pm a-pop" style="--d:1.3s">vs</div>' if mid=='vs' else
          '<div class="vs a-pop" style="--d:1.3s"><svg viewBox="0 0 100 60" width="90" style="transform:rotate(80deg)"><path pathLength="1" class="dr" style="--d:1.3s" d="M6 34 C30 18 60 40 88 28 M72 14 L90 28 L74 44" fill="none" stroke="var(--dd)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>')
    note=f'<div class="note a-up" style="--d:2s">{esc(p["note"])}</div>' if p['note'] else ''
    return f'<div class="split">{top}<div class="sides {"h" if k=="sides" else ""}">{side_card(A,0)}{midh}{side_card(B,1)}</div>{bottom}{note}</div>'
def L_checklist(p,c):
    its=p['body']
    if p['n']==53:
        cells=''.join(f'<div class="bc card a-pop" style="--d:{.8+.2*i:.2f}s;--r:{[-1.2,1,.8,-1][i]}deg"><span>{esc(x)}</span><svg class="stamp a-pop" style="--d:{1.75+.35*i:.2f}s" viewBox="0 0 100 100"><path pathLength="1" class="dr" style="--d:{1.8+.35*i:.2f}s" d="M70 10 C30 2 4 30 10 58 C16 88 64 98 86 74 C100 56 90 18 54 10" fill="none" stroke="var(--ac2)" stroke-width="7" stroke-linecap="round"/><path pathLength="1" class="dr" style="--d:{2.1+.35*i:.2f}s" d="M30 52 L45 66 L72 34" fill="none" stroke="var(--ac2)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' for i,x in enumerate(its))
        return f'<div class="bingo">{cells}</div>'
    rows=''.join(f'<div class="ck a-up" style="--d:{d:.2f}s">{tick_box(i,d+.5)}<span>{esc(x)}</span></div>' for i,(x,d) in enumerate(items(its,.8,.22)))
    return f'<div class="clist card a-pop" style="--d:.5s;--r:-.8deg"><div class="tape" style="left:-30px;top:-14px;--r:-38deg"></div><div class="tape" style="right:-30px;top:-14px;--r:38deg"></div>{rows}</div>{f"<div class=note>{esc(p[chr(110)+chr(111)+chr(116)+chr(101)])}</div>" if p["note"] else ""}'
def L_note(p,c):
    k=p['kind']
    if k=='list':
        inner='<ul>'+''.join(f'<li class="a-up" style="--d:{d:.2f}s"><svg viewBox="0 0 100 100" class="bul"><path d="M50 8 L61 38 L93 40 L68 60 L77 92 L50 74 L23 92 L32 60 L7 40 L39 38 Z" fill="var(--ac2)"/></svg><span>{esc(x)}</span></li>' for x,d in items(p['body']))+'</ul>'
    elif k=='pair':
        inner=''.join(f'<p class="a-up" style="--d:{.9+.4*i}s">{x}</p>' for i,x in enumerate(p['body']))
    else:
        inner=f'<p class="a-up" style="--d:.9s">{p["body"]}</p>'
    fold=random.choice(['-2.2deg','1.8deg','-1.4deg'])
    return f'<div class="sticky a-pop" style="--d:.5s;--r:{fold}"><div class="tape" style="left:38%;top:-26px;--r:3deg"></div>{inner}</div>{f"<div class=note>{esc(p[chr(110)+chr(111)+chr(116)+chr(101)])}</div>" if p["note"] else ""}'
def L_quote(p,c):
    return f'''<div class="quote"><div class="qm pm a-pop" style="--d:.5s">“</div><div class="qbody a-up" style="--d:.8s">{p["body"]}</div>
<svg class="qline" viewBox="0 0 400 30"><path pathLength="1" class="dr" style="--d:1.4s" d="M6 18 q40 -14 80 0 t80 0 t80 0 t80 0" fill="none" stroke="var(--dd)" stroke-width="7" stroke-linecap="round"/></svg></div>'''
def L_meme(p,c):
    k=p['kind']
    if k=='list':
        b=''.join(f'<div class="bub card a-pop {"r" if i%2 else ""}" style="--d:{.9+.5*i:.2f}s;--r:{[-1.5,1.5][i%2]}deg">{esc(x)}</div>' for i,x in enumerate(p['body']))
        return f'<div class="chat">{b}</div>'
    note=f'<div class="note a-up" style="--d:1.8s">{esc(p["note"])}</div>' if p['note'] else ''
    return f'<div class="meme"><div class="bubble card a-pop" style="--d:1.0s;--r:-1deg">{p["body"]}</div>{note}</div>'
def L_countdown(p,c):
    top,big,bot=TILE[p['n']]
    down = big=='45'
    tile=f'''<div class="tile card a-pop" style="--d:.4s;--r:-3deg"><div class="tt">{esc(top)}<i></i><i></i></div>
<div class="tb pm">{num_span(big,.7,1.6,down)}</div><div class="tf ka">{esc(bot)}</div></div>'''
    rows=''.join(f'<div class="ck a-up" style="--d:{d:.2f}s">{tick_box(i,d+.5).replace("dr tk","dr tk notick") if p["n"]==4 else tick_box(i,d+.5)}<span>{esc(x)}</span></div>' for i,(x,d) in enumerate(items(p['body'],1.2,.2)))
    return f'<div class="cd"><div class="cdrow">{tile}<div class="cdt pm a-pop" style="--d:.9s">{title_html(p["t"],p["n"])}</div></div><div class="clist card a-pop" style="--d:1.0s;--r:.6deg">{rows}</div></div>'
LAYOUTS=dict(stat=L_stat,steps=L_steps,split=L_split,checklist=L_checklist,note=L_note,quote=L_quote,meme=L_meme,countdown=L_countdown)
