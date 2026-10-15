import csv,json,random
from PIL import Image, ImageDraw, ImageFont
from data import POSTS,LAY,ANIM
O='/workspace/reports/helix/social-v3'
COL={int(k):v for k,v in json.load(open(O+'/src/assign.json'))['COL'].items()}
BROAD=['#ecommerce','#shopify','#shopifystore','#ecommercetips','#smallbusiness','#onlinebusiness','#dropshipping','#ecommercegrowth','#onlinestore','#shopifytips','#ecommercebusiness','#entrepreneur','#smallbusinessowner','#shopsmall','#digitalmarketing','#ecommercemarketing','#shopifyseller','#businesstips']
FB=['#ecommerce','#shopify','#smallbusiness','#ecommercetips','#onlinebusiness','#shopifytips']
with open(O+'/manifest.csv','w',newline='') as f:
    w=csv.writer(f); w.writerow(['post_id','file','type','tone','topic','ig_caption','fb_caption'])
    for p in POSTS:
        n=p['n'];r=random.Random(n);typ='animated' if n in ANIM else 'static'
        file=f'animated/{p["f"]}.mp4' if n in ANIM else f'static/{p["f"]}.png'
        tags=p['tags']+r.sample(BROAD,r.randint(6,9)); tags=list(dict.fromkeys(tags))
        body='\n\n'.join(p['cap'])
        ig=f'{body}\n\nMore simple, step-by-step help for your store at ecommercehelix.com (link in bio).\n\n'+' '.join(tags)
        fbt=[p['tags'][0]]+r.sample(FB,r.randint(1,3)); fbt=list(dict.fromkeys(fbt))[:4]
        fb=f'{body}\n\nMore simple, step-by-step help for your store: ecommercehelix.com\n\n'+' '.join(fbt)
        w.writerow([f'v3-{n:02d}',file,typ,p['tone'],p['t'].replace('\n',' '),ig,fb])
TW,TH,cols,pad,lab=270,338,8,16,40
rows=(len(POSTS)+cols-1)//cols
sheet=Image.new('RGB',(pad+cols*(TW+pad),110+rows*(TH+lab+pad)),'#F2F1EC'); d=ImageDraw.Draw(sheet)
fpm=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Permanent Marker/PermanentMarker-Regular.ttf',44)
fn=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf',17); fn.set_variation_by_name('Bold')
d.text((pad,28),f'E-commerce Helix · social v3 · 50 posts ({len(ANIM)} animated, frame shown)',font=fpm,fill='#5A50D6')
for i,p in enumerate(POSTS):
    x=pad+(i%cols)*(TW+pad); y=110+(i//cols)*(TH+lab+pad)
    sheet.paste(Image.open(f'{O}/static/{p["f"]}.png').convert('RGB').resize((TW,TH),Image.LANCZOS),(x,y))
    d.text((x,y+TH+6),f'{p["n"]:02d} · {COL[p["n"]]} · {LAY[p["n"]]}{"  MP4" if p["n"] in ANIM else ""}',font=fn,fill='#1A1718')
sheet.save(O+'/contact-sheet.png',optimize=True); print('ok')
