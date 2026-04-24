import os
import glob

files = glob.glob('src/app/games/**/page.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('className="p-3 rounded-2xl bg-card border border-foreground/10 hover:bg-foreground/5 text-accent', 'className="p-3 rounded-2xl bg-transparent hover:bg-foreground/5 text-accent')
    content = content.replace('className="p-3 rounded-2xl bg-card text-accent transition-all active:scale-95 border border-foreground/10 hover:bg-foreground/5"', 'className="p-3 rounded-2xl bg-transparent text-accent transition-all active:scale-95 hover:bg-foreground/5"')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print('Done!')
