import sys
sys.path.insert(0,'/workspace/reports/helix/facebook/src')
from posts_data import P as P2
# Posts 1-7: on-image text transcribed verbatim from facebook/src/post0N-ig.html
P1=[
dict(n=1,f='post01-welcome',cat='Witty',k='Hello, store owners 👋',t='Too many tabs.\nNot enough profit.',kind='big',
     body="Helix gives you <b class='u'>one clear step a day</b>, bite-size card lessons, a profit-first dashboard, a store audit and help with Meta ads.",note='Free plan available · open worldwide'),
dict(n=2,f='post02-profit-tip',cat='Tip',k='Quick maths, big difference',t='Profit per order',kind='calc',
     body=([('Sale price','$50.00'),('− Product cost','$18.00'),('− Shipping','$8.00'),('− Payment fees (~3%)','$1.50'),('− Ad cost per order','$12.00')],('Profit','$10.50')),note='Example numbers only. Plug in your own.'),
dict(n=3,f='post03-step1',cat='Funny',k='Feeling stuck?',t='Start with\nstep 1.',kind='list',
     body=['✅ Step 1: do just this one','Step 2: tomorrow','Step 37: not your problem today'],note=''),
dict(n=4,f='post04-bf-countdown',cat='Urgency',k='Black Friday: Fri 27 Nov 2026',t='(about 6 weeks) to go.',kind='list',
     body=['Check stock & reorder now','Test ads before costs climb','Grow your email list','Plan offers by margin'],note='',tile=('','41','days')),
dict(n=5,f='post05-margin-offers',cat='Tip',k='BFCM offer maths',t='Plan by margin,\nnot just % off.',kind='sides',
     body=[dict(rows=[('Price','$45.00'),('− Costs*','$38.00'),('− Fees 3%','$1.35')],res=('10% off','$5.65')),
           dict(rows=[('Price','$40.00'),('− Costs*','$38.00'),('− Fees 3%','$1.20')],res=('20% off','$0.80'))],
     note='*$50 item: product $18 + shipping $8 + ads $12 per order. Example numbers.'),
dict(n=6,f='post06-test-ads-email',cat='Tip',k='Do it now, thank yourself later',t='Test in October.\nSell in November.',kind='pair',
     body=[("<b class='u'>Ads:</b> find what works while there's less competition for attention."),
           ("<b class='u'>Email:</b> people on your list now can hear about your offer later, without paying for every click.")],note=''),
dict(n=7,f='post07-scan-tip',cat='Witty',k='Hard truth, gently delivered',t='Nobody reads.\nEverybody scans.',kind='big',
     body="Your lovely 400-word product story? Skimmed in 2 seconds.<br>Put <b class='u'>price, shipping &amp; returns</b> where the eyes land, right near the buy button.",note=''),
]
POSTS=P1+[dict(n=p['n'],f=p['f'],cat=p['cat'],k=p['k'],t=p['t'],kind=p['kind'],body=p['body'],note=p.get('note','')) for p in P2]
CAPREF={**{n:f'facebook/posts.md — "Post {n}"' for n in range(1,8)},**{p['n']:f'facebook/posts-batch2.md — "## {p["n"]:02d}. {p["t"]}"' for p in P2}}
# layout per post (hand-assigned to content; no two consecutive post numbers share a layout)
LAY={1:'meme',2:'stat',3:'steps',4:'countdown',5:'split',6:'note',7:'meme',8:'stat',9:'split',10:'stat',11:'split',12:'steps',13:'stat',
14:'checklist',15:'note',16:'steps',17:'checklist',18:'note',19:'steps',20:'note',21:'steps',22:'checklist',23:'steps',24:'checklist',
25:'split',26:'note',27:'checklist',28:'steps',29:'stat',30:'note',31:'checklist',32:'steps',33:'countdown',34:'checklist',35:'countdown',
36:'note',37:'checklist',38:'steps',39:'note',40:'steps',41:'stat',42:'quote',43:'split',44:'quote',45:'checklist',46:'quote',47:'split',
48:'checklist',49:'quote',50:'steps',51:'split',52:'meme',53:'checklist',54:'meme',55:'note',56:'meme',57:'quote'}
ANIM={1,4,5,33,34,35,52,53,54,55,56,57}
TILE={4:('','41','days'),33:('NOV','30','Mon'),35:('DEC','25','Fri')}
# word in the headline that gets the marker swipe
SWIPE={1:'profit.',2:'Profit',3:'1.',4:'weeks)',5:'margin,',6:'November.',7:'scans.',8:'ROAS',9:'margin',10:'2×',11:'big',12:'rate',13:'purchase',
14:'AOV',15:'maths',16:'welcome',17:'cart',18:'Clear',19:'one',20:'3',21:'warm',22:'feed',23:'search',24:'6-point',25:'benefits',26:'phone',
27:'(real)',28:'surprises',29:'reorder',30:'slow',31:'weekly',32:'worth',33:'Cyber',34:'rush',35:'dates',36:'gift',37:'clear',38:'phone',
39:'FAQ',40:'post-purchase',41:'hiding',42:'steady',43:'chapter 1',44:'data,',45:'One',46:'Profit',47:'expensive',48:'exactly',49:'Guessing',
50:'next step.',51:'improving',52:'create',53:'this week?',54:'Lovely.',55:'ACTUAL_final',56:'genius.',57:'not'}
