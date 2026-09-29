import sys,json,os,subprocess
# sheets.py prefix suffix cols cw ch per
prefix,suffix,cols,cw,ch,per=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5],int(sys.argv[6])
names=[r['component'] for r in json.load(open('web.json'))['results']]
files=[f'web-screens/{n}{suffix}.png' for n in names if os.path.exists(f'web-screens/{n}{suffix}.png')]
for i in range(0,len(files),per):
  subprocess.run(['python3',os.path.dirname(__file__)+'/sheet.py',f'sheets/{prefix}-{i//per}.png',cols,cw,ch]+files[i:i+per],check=True)
print(len(files))
