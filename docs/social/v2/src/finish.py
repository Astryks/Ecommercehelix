import csv,json,os,shutil
from PIL import Image, ImageDraw, ImageFont
from data import POSTS,LAY,ANIM,CAPREF
O='/workspace/reports/helix/social-v2'
COL={int(k):v for k,v in json.load(open(O+'/src/assign.json'))['COL'].items()}
with open(O+'/manifest.csv','w',newline='') as f:
    w=csv.writer(f); w.writerow(['post_no','file','animated_file','colourway','layout','animated','title','caption_reference'])
    for p in POSTS:
        n=p['n']; w.writerow([n,f'static/{p["f"]}.png',f'animated/{p["f"]}.mp4' if n in ANIM else '',COL[n],LAY[n],'y' if n in ANIM else 'n',p['t'].replace('\n',' '),CAPREF[n]])
TW,TH,cols,pad,lab=270,338,8,16,40
rows=(len(POSTS)+cols-1)//cols
sheet=Image.new('RGB',(pad+cols*(TW+pad),110+rows*(TH+lab+pad)),'#F2F1EC'); d=ImageDraw.Draw(sheet)
fpm=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Permanent Marker/PermanentMarker-Regular.ttf',44)
fn=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf',17); fn.set_variation_by_name('Bold')
d.text((pad,28),'E-commerce Helix · social v2 · 57 statics (+MP4 = also animated)',font=fpm,fill='#5A50D6')
for i,p in enumerate(POSTS):
    x=pad+(i%cols)*(TW+pad); y=110+(i//cols)*(TH+lab+pad)
    sheet.paste(Image.open(f'{O}/static/{p["f"]}.png').convert('RGB').resize((TW,TH),Image.LANCZOS),(x,y))
    d.text((x,y+TH+6),f'{p["n"]:02d} · {COL[p["n"]]} · {LAY[p["n"]]}{"  +MP4" if p["n"] in ANIM else ""}',font=fn,fill='#1A1718')
sheet.save(O+'/contact-sheet.png',optimize=True)
os.makedirs(O+'/samples',exist_ok=True)
for s in ['post04-bf-countdown','post53-owner-bingo','post56-3am-ideas']: shutil.copy(f'{O}/animated/{s}.mp4',f'{O}/samples/{s}.mp4')
print('done')
