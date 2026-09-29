import sys,json,os
from PIL import Image,ImageDraw
# usage: sheet.py out.png cols cellw cellh files...
out,cols,cw,ch=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]);files=sys.argv[5:]
rows=(len(files)+cols-1)//cols;S=Image.new('RGB',(cols*cw,rows*(ch+18)),'#888')
d=ImageDraw.Draw(S)
for i,f in enumerate(files):
  im=Image.open(f).convert('RGB');im.thumbnail((cw-4,ch-4));x=(i%cols)*cw;y=(i//cols)*(ch+18)
  S.paste(im,(x+2,y+18));d.text((x+3,y+3),os.path.basename(f)[:40],fill='yellow')
S.save(out)
