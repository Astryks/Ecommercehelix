import sys,glob
from PIL import Image
fs=sys.argv[3:];W=int(sys.argv[2]);H=W*5//4;cols=4
im=Image.new('RGB',(W*cols,H*((len(fs)+cols-1)//cols)),'white')
for i,f in enumerate(fs): im.paste(Image.open(f).convert('RGB').resize((W,H)),((i%cols)*W,(i//cols)*H))
im.save(sys.argv[1])
