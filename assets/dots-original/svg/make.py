# Original fuzzy-blob mascots, drawn as SVG
def defs(base, light, dark, seed):
    return f'''<defs>
<radialGradient id="body" cx="38%" cy="28%" r="80%">
 <stop offset="0" stop-color="{light}"/><stop offset=".55" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></radialGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
 <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
<radialGradient id="arm" cx="40%" cy="30%" r="75%">
 <stop offset="0" stop-color="{light}"/><stop offset="1" stop-color="{dark}"/></radialGradient>
<radialGradient id="wool" cx="40%" cy="30%" r="80%">
 <stop offset="0" stop-color="#4a4a52"/><stop offset=".6" stop-color="#1c1c22"/><stop offset="1" stop-color="#08080a"/></radialGradient>
<filter id="fur" x="-8%" y="-8%" width="116%" height="116%">
 <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="{seed}" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="{seed+5}" result="n2"/>
 <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -1.15" result="hi"/>
 <feComposite in="hi" in2="d" operator="in" result="his"/>
 <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 -2.2 0 0 1.0" result="lo"/>
 <feComposite in="lo" in2="d" operator="in" result="los"/>
 <feMerge><feMergeNode in="d"/><feMergeNode in="los"/><feMergeNode in="his"/></feMerge>
</filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
 <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="{seed+2}" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".28"/></filter>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
<linearGradient id="dev" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b4f59"/><stop offset="1" stop-color="#1d1f25"/></linearGradient>
<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e9f4"/></linearGradient>
<linearGradient id="lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9fbff" stop-opacity=".75"/><stop offset="1" stop-color="#9fe3f0" stop-opacity=".35"/></linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a46"/><stop offset=".5" stop-color="#101016"/><stop offset="1" stop-color="#000"/></linearGradient>
</defs>'''

def body(path):
    return f'<g filter="url(#fur)"><path d="{path}" fill="url(#body)"/><path d="{path}" fill="url(#shade)"/></g>'
def arm(cx,cy,rx,ry,rot=0):
    return f'<g filter="url(#fur)"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="url(#arm)"/></g>'
def beret(cx,cy,rx,ry,rot):
    return f'''<g transform="rotate({rot} {cx} {cy})" filter="url(#drop)"><g filter="url(#soft)">
<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#wool)"/>
<path d="M{cx-rx*.92} {cy+ry*.25} Q{cx} {cy+ry*1.15} {cx+rx*.92} {cy+ry*.25}" stroke="#000" stroke-opacity=".5" stroke-width="10" fill="none"/>
<circle cx="{cx-rx*.15}" cy="{cy-ry*1.0}" r="{ry*.28}" fill="url(#wool)"/></g></g>'''
def svg(inner, d): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">{d}{inner}</svg>'

# ---------- Developer (yellow) ----------
dev = svg(body("M150 900 C110 690 190 430 420 350 C620 285 820 400 870 610 C900 740 885 850 860 900 Z")
 + beret(400,330,215,95,-12)
 # glasses + smiling eyes
 + '''<g stroke="#111" stroke-width="15" fill="#fff" fill-opacity=".12">
<circle cx="390" cy="555" r="88"/><circle cx="620" cy="545" r="88"/></g>
<path d="M478 552 Q505 528 532 548" stroke="#111" stroke-width="13" fill="none"/>
<path d="M302 548 L210 530 M708 540 L790 522" stroke="#111" stroke-width="12" stroke-linecap="round"/>
<g stroke="#1a1208" stroke-width="15" stroke-linecap="round" fill="none">
<path d="M352 575 Q390 520 428 575"/><path d="M582 565 Q620 510 658 565"/></g>
<ellipse cx="300" cy="640" rx="40" ry="20" fill="#ff8a5c" opacity=".45"/><ellipse cx="715" cy="628" rx="40" ry="20" fill="#ff8a5c" opacity=".45"/>'''
 + arm(330,850,105,72,-8)
 # laptop
 + '''<g filter="url(#drop)">
<path d="M470 690 L860 640 Q878 638 880 656 L900 880 Q902 898 884 900 L500 920 Q482 921 480 903 L455 710 Q453 692 470 690 Z" fill="url(#dev)"/>
<path d="M470 690 L860 640" stroke="#8a90a0" stroke-width="5" opacity=".7"/>
<text x="680" y="810" font-family="DejaVu Sans Mono,monospace" font-weight="bold" font-size="92" fill="#ffd54a" text-anchor="middle" transform="rotate(-6 680 790)">&lt;/&gt;</text></g>'''
 + arm(850,880,80,58,10)
 # lightbulb
 + '''<circle cx="830" cy="230" r="70" fill="#ffe27a" opacity=".55" filter="url(#glow)"/>
<path d="M830 175 a52 52 0 0 1 30 95 l-4 26 h-52 l-4 -26 a52 52 0 0 1 30 -95z" fill="#ffd84d" stroke="#e0a800" stroke-width="5"/>
<rect x="806" y="300" width="48" height="26" rx="8" fill="#9aa1ad"/>
<g stroke="#ffcf33" stroke-width="10" stroke-linecap="round"><path d="M830 135v-28M760 165l-20-20M900 165l20-20"/></g>''',
 defs("#FFC21A","#FFE680","#D98A00",3))

# ---------- Marketing (pink) ----------
mkt = svg(body("M140 900 C100 760 120 560 230 470 C220 330 360 230 480 290 C560 200 760 220 800 380 C900 430 920 620 880 760 C870 830 870 870 860 900 Z")
 + '''<g filter="url(#drop)">
<circle cx="415" cy="530" r="82" fill="url(#sun)"/><circle cx="640" cy="520" r="82" fill="url(#sun)"/>
<path d="M497 525 Q527 505 558 522" stroke="#111" stroke-width="14" fill="none"/>
<path d="M333 520 L250 500 M722 515 L800 496" stroke="#111" stroke-width="12" stroke-linecap="round"/>
<path d="M375 490 q25 -25 55 -18" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" fill="none"/>
<path d="M600 480 q25 -25 55 -18" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" fill="none"/></g>
<path d="M480 640 Q515 665 552 640" stroke="#5a0b3a" stroke-width="12" stroke-linecap="round" fill="none"/>'''
 # tablet / notebook
 + '''<g filter="url(#drop)" transform="rotate(-10 700 800)">
<rect x="520" y="720" width="380" height="200" rx="26" fill="#2b2633"/>
<rect x="540" y="738" width="340" height="164" rx="16" fill="#fff4fa"/>
<rect x="565" y="760" width="140" height="18" rx="9" fill="#ff4fb3"/>
<rect x="565" y="795" width="270" height="12" rx="6" fill="#d8c6d2"/><rect x="565" y="820" width="230" height="12" rx="6" fill="#d8c6d2"/>
<rect x="565" y="845" width="250" height="12" rx="6" fill="#d8c6d2"/></g>'''
 + arm(560,800,95,62,-25)
 + '''<g filter="url(#drop)"><path d="M520 720 L640 600" stroke="#2a2a33" stroke-width="22" stroke-linecap="round"/>
<path d="M512 728 L526 712" stroke="#d6d6de" stroke-width="22" stroke-linecap="round"/><path d="M634 606 L646 594" stroke="#ff4fb3" stroke-width="22" stroke-linecap="round"/></g>'''
 + arm(250,860,100,66,5)
 # heart bubble
 + '''<g filter="url(#drop)" transform="rotate(-8 190 230)">
<path d="M110 160 h170 a40 40 0 0 1 40 40 v90 a40 40 0 0 1 -40 40 h-110 l-40 40 v-40 h-20 a40 40 0 0 1 -40 -40 v-90 a40 40 0 0 1 40 -40z" fill="#fff"/>
<path d="M195 300 C150 265 140 240 160 222 C177 208 195 218 195 232 C195 218 213 208 230 222 C250 240 240 265 195 300Z" fill="#ff3d8b"/></g>
<g fill="#ffd1ec"><path d="M880 230 l10 30 30 10 -30 10 -10 30 -10 -30 -30 -10 30 -10z"/></g>''',
 defs("#FF3FA8","#FF9AD6","#C0157A",11))

# ---------- Business (blue) ----------
bus = svg(body("M170 900 C140 700 220 470 440 400 C640 340 830 450 870 640 C895 760 885 860 865 900 Z")
 + beret(430,390,230,98,-10)
 + '''<g><ellipse cx="530" cy="600" rx="30" ry="42" fill="#0b0b12"/><ellipse cx="680" cy="595" rx="30" ry="42" fill="#0b0b12"/>
<circle cx="540" cy="585" r="9" fill="#fff"/><circle cx="690" cy="580" r="9" fill="#fff"/></g>
<path d="M580 680 Q605 698 630 680" stroke="#06205a" stroke-width="11" stroke-linecap="round" fill="none"/>'''
 # papers
 + '''<g filter="url(#drop)">
<g transform="rotate(-14 300 760)"><rect x="140" y="610" width="300" height="330" rx="18" fill="#dfe7f5"/></g>
<g transform="rotate(-6 300 760)"><rect x="150" y="600" width="300" height="330" rx="18" fill="url(#paper)"/>
<text x="185" y="668" font-family="DejaVu Sans,sans-serif" font-weight="bold" font-size="40" fill="#3a4660">REPORT</text>
<rect x="185" y="695" width="230" height="12" rx="6" fill="#c3cde0"/><rect x="185" y="720" width="180" height="12" rx="6" fill="#c3cde0"/>
<rect x="200" y="830" width="34" height="60" rx="6" fill="#2f7bff"/><rect x="250" y="800" width="34" height="90" rx="6" fill="#2f7bff"/>
<rect x="300" y="770" width="34" height="120" rx="6" fill="#ffb020"/><rect x="350" y="745" width="34" height="145" rx="6" fill="#2f7bff"/>
<path d="M195 892 h200" stroke="#9aa6bd" stroke-width="5"/></g></g>'''
 + arm(470,850,90,62,-10)
 # calculator
 + '''<g filter="url(#drop)" transform="rotate(12 760 800)">
<rect x="650" y="690" width="230" height="250" rx="28" fill="#23262e"/>
<rect x="675" y="712" width="180" height="58" rx="10" fill="#9fd8b6"/>
<text x="840" y="756" font-family="DejaVu Sans Mono,monospace" font-size="36" fill="#1d4a33" text-anchor="end">128.5</text>
''' + ''.join(f'<rect x="{678+c*46}" y="{790+r*44}" width="36" height="34" rx="8" fill="{"#ff8a1f" if c==3 else "#4b505c"}"/>' for r in range(3) for c in range(4)) + '''</g>'''
 + arm(820,890,72,52,15),
 defs("#2F7BFF","#7FB6FF","#0A3FB8",21))

# ---------- Research (green) ----------
res = svg(body("M150 900 C120 720 170 560 280 500 C250 360 330 280 420 300 C470 310 500 345 512 380 C530 345 560 310 610 300 C700 280 780 360 750 500 C860 560 905 720 875 900 Z")
 + '''<g filter="url(#drop)">
<circle cx="415" cy="410" r="92" fill="#fff"/><circle cx="610" cy="410" r="92" fill="#fff"/>
<circle cx="435" cy="420" r="48" fill="#0b0b12"/><circle cx="590" cy="420" r="48" fill="#0b0b12"/>
<circle cx="452" cy="400" r="15" fill="#fff"/><circle cx="607" cy="400" r="15" fill="#fff"/></g>
<path d="M470 600 Q512 630 555 600" stroke="#2c4a00" stroke-width="12" stroke-linecap="round" fill="none"/>'''
 # books
 + '''<g filter="url(#drop)">
<rect x="680" y="840" width="300" height="62" rx="12" fill="#2f5fd0"/><rect x="690" y="850" width="280" height="10" fill="#fff" opacity=".35"/>
<rect x="700" y="782" width="270" height="62" rx="12" fill="#1f8a6a"/><rect x="710" y="792" width="250" height="10" fill="#fff" opacity=".35"/>
<rect x="690" y="724" width="260" height="62" rx="12" fill="#e2a23a"/><rect x="700" y="734" width="240" height="10" fill="#fff" opacity=".35"/></g>'''
 + arm(330,860,100,66,-5)
 # magnifier
 + '''<g filter="url(#drop)">
<path d="M560 770 L470 900" stroke="#1d1d24" stroke-width="44" stroke-linecap="round"/>
<circle cx="640" cy="650" r="135" fill="url(#lens)"/>
<circle cx="640" cy="650" r="135" fill="none" stroke="#1d1d24" stroke-width="30"/>
<path d="M565 600 q30 -55 95 -60" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none" opacity=".8"/></g>'''
 + arm(510,860,78,56,-30),
 defs("#9BDD1F","#D4F77A","#5E9A00",31))

for n,s in [("developer",dev),("marketing",mkt),("business",bus),("research",res)]:
    open(f"{n}.svg","w").write(s)
