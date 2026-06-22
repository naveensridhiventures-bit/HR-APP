from PIL import Image, ImageDraw
import math

INK = (22, 33, 62, 255)        # #16213E
SAFFRON = (230, 154, 40, 255)  # #E69A28
WHITE = (250, 246, 239, 255)   # #FAF6EF
INK_700 = (27, 39, 66, 255)

def rounded_square(size, radius_ratio=0.22, bg=INK):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=bg)
    return img, d

def draw_stamp_ring(d, cx, cy, r, color, width, dash_count=28, gap_ratio=0.55):
    # serrated / perforated ring like a rubber stamp edge
    for i in range(dash_count):
        a0 = (360 / dash_count) * i
        a1 = a0 + (360 / dash_count) * gap_ratio
        d.arc([cx - r, cy - r, cx + r, cy + r], a0, a1, fill=color, width=width)

def draw_check(d, cx, cy, scale, color, width):
    # simple checkmark made of two line segments
    p1 = (cx - 0.32 * scale, cy + 0.02 * scale)
    p2 = (cx - 0.08 * scale, cy + 0.26 * scale)
    p3 = (cx + 0.36 * scale, cy - 0.28 * scale)
    d.line([p1, p2], fill=color, width=width, joint='curve')
    d.line([p2, p3], fill=color, width=width, joint='curve')
    # round caps
    for p in (p1, p2, p3):
        d.ellipse([p[0]-width/2, p[1]-width/2, p[0]+width/2, p[1]+width/2], fill=color)

def make_icon(size, maskable=False, out_path='icon.png'):
    pad_ratio = 0.16 if maskable else 0.0
    img, d = rounded_square(size, radius_ratio=0.0 if maskable else 0.22, bg=INK)
    cx, cy = size / 2, size / 2
    # available radius leaving safe padding for maskable icons
    usable = size * (0.5 - pad_ratio)
    stamp_r = usable * 0.86
    draw_stamp_ring(d, cx, cy, stamp_r, SAFFRON, max(2, int(size * 0.018)), dash_count=26, gap_ratio=0.5)
    inner_r = stamp_r * 0.74
    d.ellipse([cx-inner_r, cy-inner_r, cx+inner_r, cy+inner_r], outline=SAFFRON, width=max(2, int(size*0.012)))
    draw_check(d, cx, cy, inner_r * 1.55, WHITE, max(4, int(size * 0.052)))
    img.save(out_path)

make_icon(192, maskable=False, out_path='/home/claude/sridhi-hr-app/public/icons/icon-192.png')
make_icon(512, maskable=False, out_path='/home/claude/sridhi-hr-app/public/icons/icon-512.png')
make_icon(512, maskable=True, out_path='/home/claude/sridhi-hr-app/public/icons/icon-maskable-512.png')
make_icon(180, maskable=False, out_path='/home/claude/sridhi-hr-app/public/icons/apple-touch-icon.png')
make_icon(32, maskable=False, out_path='/home/claude/sridhi-hr-app/public/icons/favicon-32.png')
print("icons generated")
