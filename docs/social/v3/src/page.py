import random
from design import *
from layouts import LAYOUTS
CSS='''*{margin:0;padding:0;box-sizing:border-box}
html{--k:1;--kt:1}
body{width:1080px;height:1350px;overflow:hidden;background:var(--bg);color:var(--fg);font-family:Nunito;font-weight:600;position:relative}
.pm{font-family:'Permanent Marker';font-weight:400}.ka{font-family:Kalam;font-weight:700}
#c{position:absolute;inset:0;padding:112px 86px 64px;display:flex;flex-direction:column;z-index:2}
.kick{font-family:Kalam;font-weight:700;font-size:42px;color:var(--ac);line-height:1.2}
.ttl{font-family:'Permanent Marker';color:var(--hd);line-height:1.08;margin:10px 0 34px;font-size:calc(var(--ts)*var(--kt));overflow-wrap:anywhere}
.sw{position:relative;z-index:0;white-space:nowrap;display:inline-block}
.sw svg{position:absolute;left:-.12em;bottom:.02em;width:calc(100% + .24em);height:.46em;z-index:-1;overflow:visible}
main{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;font-size:calc(40px*var(--k))}
#inner{display:flex;flex-direction:column}
footer{display:flex;align-items:center;gap:16px;margin-top:22px}
footer.r{flex-direction:row-reverse}
footer svg{width:66px;height:66px}footer span{font-family:Kalam;font-weight:700;font-size:32px;color:var(--ac)}
.card{border:4px solid var(--ln);border-radius:18px 26px 20px 24px/24px 18px 26px 20px;background:var(--cd);color:var(--ct);box-shadow:8px 9px 0 var(--sh)}
b.u{font-weight:800;background:linear-gradient(transparent 52%,var(--hl) 52%,var(--hl) 94%,transparent 94%);padding:0 .12em;border-radius:.2em}
.note{font-size:calc(31px*var(--k));margin-top:26px;opacity:.9;font-weight:600}
.tape{position:absolute;width:150px;height:44px;background:var(--tape);opacity:.85;transform:rotate(var(--r));border-radius:3px;box-shadow:0 2px 0 rgba(0,0,0,.08)}
.dd{position:absolute;z-index:1;pointer-events:none}
.rw{display:flex;justify-content:space-between;gap:14px;line-height:1.55}.rw span{min-width:0}.rw b{white-space:nowrap}
.sd .rw.res span{white-space:nowrap}
.rw b{font-weight:800}
/* stat */
.stat{display:flex;flex-direction:column;align-items:center}
.statlab{font-size:calc(46px*var(--k));color:var(--ac)}
.statnum{position:relative;max-width:100%;color:var(--ac);line-height:1.05;margin:4px 0 30px;padding:0 50px;white-space:nowrap}
.ring{position:absolute;left:-10px;top:-6%;width:calc(100% + 20px);height:112%;overflow:visible}
.receipt{position:relative;width:86%;padding:34px 44px 30px;font-size:calc(34px*var(--k));transform:rotate(var(--r))}
.stat .note{text-align:center}
/* steps */
.steps{display:flex;flex-direction:column}
.step{width:82%}.stair .step{width:72%}
.stepc{display:flex;align-items:center;gap:22px;padding:22px 30px;font-size:calc(37px*var(--k));line-height:1.3}
.few .stepc{padding:30px 34px;font-size:calc(42px*var(--k))}
.stair .stepc{font-size:calc(40px*var(--k));padding:32px 36px}
.stx{flex:1;display:flex;justify-content:space-between;gap:16px;align-items:center}
.stx b{font-weight:800}
.badge{flex:none;font-size:40px;width:72px;height:72px;border-radius:50%;background:var(--ac2);color:var(--cd);display:flex;align-items:center;justify-content:center}
.badge.s{font-size:30px}
.final .stepc{background:var(--ac2);color:var(--cd);border-color:var(--ac2)}
.final .stx .pm{font-size:1.15em}.final .big{font-size:1.6em}
.arr{height:56px;width:76px}.arr svg{width:76px;height:56px;overflow:visible}
/* split */
.split{display:flex;flex-direction:column}
.sides{display:flex;flex-direction:column;align-items:flex-start}
.sides>.sd:last-child{align-self:flex-end}
.sides.h{flex-direction:row;align-items:center;justify-content:space-between}.sides.h .sd{width:47%;padding:34px 28px;font-size:calc(34px*min(var(--k),1.05))}.sides.h .vs{height:auto;width:6%;font-size:46px}
.sd{position:relative;width:84%;padding:30px 40px;font-size:calc(36px*var(--k));line-height:1.45;transform:rotate(var(--r))}
.sd p{font-size:calc(42px*var(--k));line-height:1.45}
.vs{align-self:center;height:86px;align-items:center;font-size:60px;color:var(--ac);display:flex;justify-content:center}
.dash{border-top:4px dashed currentColor;margin:10px 0}
.rw.res{font-size:1.25em}
.sl{font-size:calc(38px*var(--k));color:var(--ac2);text-align:center;line-height:1.2}
.sbig{font-size:calc(120px*var(--k));text-align:center;line-height:1.1;color:var(--ct)}
.chips{display:flex;gap:14px;justify-content:center;margin-bottom:34px;flex-wrap:wrap}
.chip{border:3px solid var(--fg);border-radius:40px;padding:8px 24px;font-size:calc(32px*var(--k))}
.chip b{font-weight:800}
.resbar{align-self:center;margin-top:40px;background:var(--ac);color:var(--bg);border-radius:20px 30px 22px 28px;padding:16px 40px;font-size:calc(40px*var(--k));transform:rotate(var(--r));display:flex;gap:20px;align-items:center}
.resbar .pm{font-size:1.7em}
.splitfoot{margin-top:40px;font-size:calc(36px*var(--k));line-height:1.45;text-align:center}
/* checklist */
.clist{position:relative;padding:40px 46px;transform:rotate(var(--r));background-image:repeating-linear-gradient(transparent 0 calc(1.72em - 2px),var(--rule) calc(1.72em - 2px) 1.72em)}
.ck{display:flex;gap:22px;align-items:flex-start;font-size:calc(38px*var(--k));line-height:1.3;padding:12px 0}
.box{flex:none;width:52px;height:52px;color:var(--ct);margin-top:-2px}
.bingo{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.bc{position:relative;aspect-ratio:1/0.85;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;font-size:calc(36px*var(--k));line-height:1.3;font-weight:700;transform:rotate(var(--r))}
.stamp{position:absolute;right:-22px;top:-26px;width:84px;height:84px;overflow:visible;background:var(--bg);border-radius:50%}
/* sticky note */
.sticky{position:relative;background:var(--note);color:#1A1718;padding:64px 54px 54px;transform:rotate(var(--r));box-shadow:10px 14px 0 var(--sh2);border-radius:4px 4px 4px 40px/4px 4px 4px 30px;font-size:calc(40px*var(--k));line-height:1.4}
.sticky ul{list-style:none;display:flex;flex-direction:column;gap:22px}
.sticky li{display:flex;gap:20px;align-items:flex-start}.bul{flex:none;width:40px;height:40px;margin-top:6px}
.sticky p+p{margin-top:28px}.sticky p{font-size:calc(42px*var(--k));line-height:1.45}
.sticky b.u{--hl:var(--nhl)}
/* quote */
.quote{position:relative;padding-left:20px}
.qm{font-size:380px;line-height:.62;color:var(--ac);height:170px;margin-left:-14px}
.qbody{font-size:calc(52px*var(--k));line-height:1.38;font-weight:700}
.qbody b.u{--hl:var(--sw)}
.qline{width:360px;height:30px;margin-top:34px;overflow:visible}
/* meme */
.mtag{align-self:flex-start;background:var(--ac);color:var(--bg);font-family:Kalam;font-weight:700;font-size:38px;padding:6px 26px;border-radius:12px 18px 10px 16px;transform:rotate(-2deg)}
.mttl{font-family:'Permanent Marker';color:var(--hd);text-align:center;line-height:1.05;margin:46px 0 20px;font-size:calc(var(--ts)*1.12*var(--kt));transform:rotate(-2deg)}
.meme{display:flex;flex-direction:column;align-items:center}
.bubble{position:relative;padding:40px 46px;font-size:calc(40px*var(--k));line-height:1.45;width:92%;transform:rotate(var(--r))}
.bubble:after{content:'';position:absolute;left:80px;top:-34px;width:50px;height:50px;background:var(--cd);border-left:4px solid var(--ln);border-top:4px solid var(--ln);transform:skewY(30deg) rotate(20deg)}
.meme .note{text-align:center}
.chat{display:flex;flex-direction:column;gap:30px}
.bub{max-width:80%;padding:26px 36px;font-size:calc(42px*var(--k));line-height:1.35;border-radius:30px 30px 30px 6px;transform:rotate(var(--r))}
.bub.r{align-self:flex-end;border-radius:30px 30px 6px 30px;background:var(--ac2);color:var(--cd);border-color:var(--ac2)}
/* countdown */
.cdrow{display:flex;align-items:center;gap:46px;margin:6px 0 46px}
.tile{position:relative;flex:none;width:330px;padding:0 0 18px;text-align:center;overflow:visible;transform:rotate(var(--r))}
.tt{height:78px;background:var(--ac2);color:var(--cd);border-radius:14px 20px 0 0;font-family:Kalam;font-weight:700;font-size:44px;line-height:78px;position:relative;letter-spacing:.06em}
.tt i{position:absolute;top:-22px;width:18px;height:46px;border-radius:9px;background:var(--ln);left:70px}.tt i+i{left:auto;right:70px}
.tb{font-size:190px;line-height:1.05;color:var(--ct);padding-top:6px}.tf{font-size:52px;color:var(--ct);margin-top:-20px}
.cdt{font-size:calc(var(--ts)*var(--kt));line-height:1.08;color:var(--hd);flex:1}
.notick{display:none}
/* animation */
.a-pop{animation:pop .55s cubic-bezier(.3,1.5,.5,1) var(--d,0s) both;transform:rotate(var(--r,0deg))}
.a-up{animation:up .5s ease-out var(--d,0s) both}
@keyframes pop{from{opacity:0;transform:scale(.55) rotate(var(--r,0deg))}to{opacity:1;transform:scale(1) rotate(var(--r,0deg))}}
@keyframes up{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
.dr{stroke-dasharray:1 1;animation:draw .7s ease-out var(--d,.6s) both}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.wig{animation:wig var(--wd,1s) ease-in-out infinite alternate;transform-origin:50% 50%}
@keyframes wig{from{transform:rotate(-7deg) scale(.96)}to{transform:rotate(7deg) scale(1.04)}}
#all{position:absolute;inset:0;animation:out .45s ease-in var(--end) both}
@keyframes out{from{opacity:1}to{opacity:0}}
'''
JS=r'''
function fmt(v,tpl){const m=tpl.match(/\d[\d,]*(\.\d+)?/);const dec=m[1]?m[1].length-1:0;let s=v.toFixed(dec);if(m[0].includes(','))s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});return tpl.replace(m[0],s)}
window.setT=function(t){document.getAnimations().forEach(a=>{a.pause();a.currentTime=t*1000});
 document.querySelectorAll('.cnt').forEach(e=>{const tpl=e.dataset.v,m=tpl.match(/\d[\d,]*(\.\d+)?/);if(!m)return;const to=parseFloat(m[0].replace(/,/g,''));
  const d=+e.dataset.d,du=+e.dataset.dur;let p=Math.min(1,Math.max(0,(t-d)/du));p=1-Math.pow(1-p,3);
  const from=e.dataset.down=='1'?to*2:0;e.textContent=p>=1?tpl:fmt(from+(to-from)*p,tpl)})}
function swipes(){document.querySelectorAll('.sw').forEach((s,i)=>{const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('viewBox','0 0 200 40');sv.setAttribute('preserveAspectRatio','none');
 sv.innerHTML='<path pathLength="1" class="dr" style="--d:.75s" d="M8 24 C60 16 120 30 192 18" fill="none" stroke="var(--sw)" stroke-width="22" stroke-linecap="round"/>';s.appendChild(sv)})}
function fit(){const main=document.querySelector('main'),inn=document.getElementById('inner');const R=document.documentElement.style;let k=1.4,kt=1,n=0;R.setProperty('--k',k);
 const tt=document.querySelector('.ttl,.mttl,.cdt');
 while(n++<40){const over=inn.scrollHeight>main.clientHeight+2;const tover=tt&&(tt.scrollWidth>tt.clientWidth+2);
   if(!over&&!tover)break; if(tover||(k<=.8)){kt-=.04;R.setProperty('--kt',kt)} else {k-=.03;R.setProperty('--k',k)} }
 return [k,kt]}
function qa(){const bad=[];const W=1080,H=1350;document.querySelectorAll('#c *').forEach(e=>{if(!e.childNodes.length)return;const hasT=[...e.childNodes].some(n=>n.nodeType==3&&n.textContent.trim());if(!hasT)return;
 const rg=document.createRange();rg.selectNodeContents(e);const r=rg.getBoundingClientRect();if(r.width==0)return;if(r.left<24||r.right>W-24||r.top<24||r.bottom>H-24)bad.push(e.textContent.trim().slice(0,40)+' @'+[r.left,r.top,r.right,r.bottom].map(Math.round))});return bad}
'''
def tapecol(c): return {'night':'#B3A8FF','grape':'#FFD84D','sunny':'#FFFFFF'}.get(c,'#F7E08A' if c not in('paper',) else '#E9D9A0')
def build(p,lay,cwn,end=6.0,seed=0):
    random.seed(p['n']*7+seed)
    c=CW[cwn]; ac2=c['ac'] if cr(c['ac'],c['cd'])>=4.5 else '#5A50D6'
    sh = '#1A1718' if cwn!='night' else '#5A50D6'
    vars_=dict(bg=c['bg'],fg=c['fg'],hd=c['hd'],ac=c['ac'],sw=c['sw'],cd=c['cd'],ct=c['ct'],ln=c['ln'],dd=c['dd'],dd2=c['dd2'],hl=c['hl'],note=c['note'],
               ac2=ac2,sh=sh,sh2='rgba(0,0,0,.18)' if cwn!='night' else '#5A50D6',tape=tapecol(cwn),nhl='#C9C2FF',rule='rgba(90,80,214,.14)' if cwn!='night' else 'rgba(179,168,255,.18)',ts=f'{tsize(p["t"])}px',end=f'{end-0.45}s')
    
    root=';'.join(f'--{k}:{v}' for k,v in vars_.items())
    logo=LOGO.replace('#1A1718',c['lg']).replace('#5A50D6',c['lp']).replace('<svg ','<svg class="a-pop" style="--d:1.1s" ',1)
    fr='r' if lay in('meme','split','quote') else ''
    foot=f'<footer class="{fr}">{logo}<span class="a-up" style="--d:1.2s"><b class="pm" style="font-weight:400;color:var(--hd)">E-commerce Helix</b> · ecommercehelix.com</span></footer>'
    main=LAYOUTS[lay](p,c)
    if lay=='meme':
        head=f'<div class="mtag a-pop" style="--d:.15s;--r:-2deg">{esc(p["k"])}</div><div class="mttl a-pop" style="--d:.35s;--r:-2deg">{title_html(p["t"],p["n"])}</div>'
    elif lay=='countdown':
        head=f'<div class="kick a-up" style="--d:.15s">{esc(p["k"])}</div>'
    else:
        head=f'<div class="kick a-up" style="--d:.15s">{esc(p["k"])}</div><div class="ttl a-up" style="--d:.3s">{title_html(p["t"],p["n"])}</div>'
    # doodles: pick 3 different kinds, put in safe margins
    kinds=random.sample(['star','sparkle','squiggle','spiral','heart','zigzag','dots','burst','circle'],3)
    spots=[(random.randint(880,950),random.randint(10,16),random.randint(70,84)),  # top-right corner above kicker
           (random.randint(560,780) if fr=='' else random.randint(300,520),random.randint(1250,1268),random.randint(64,84)),  # footer gap
           (random.randint(12,26),random.randint(10,18),random.randint(56,72))]  # top-left corner
    dd=''.join(doodle(k,x,y,s,random.randint(-20,20),[c['dd'],c['dd2'],c['dd']][i],c['dd2'],.4+.3*i) for i,(k,(x,y,s)) in enumerate(zip(kinds,spots)))
    tex=''
    if cwn=='kraft':
        tex='<svg style="position:absolute;inset:0;z-index:0;opacity:.22" width="1080" height="1350"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
    return f'''<!doctype html><html style="{root}"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="all">{tex}{dd}
<div id="c">{head}<main><div id="inner">{main}</div></main>{foot}</div></div><script>{JS}</script></body></html>'''
