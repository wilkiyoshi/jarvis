#!/usr/bin/env python3
"""Gera os ícones PWA do J.A.R.V.I.S. (reator arc) em PNG puro (stdlib)."""
import os, struct, zlib, math

CYAN = (41, 227, 255)
CORE = (150, 240, 255)
BG_C = (12, 40, 66)    # centro
BG_E = (2, 6, 13)      # borda

def lerp(a, b, t): return a + (b - a) * t
def clamp(x, lo=0.0, hi=1.0): return max(lo, min(hi, x))

def blend(dst, src, a):
    return tuple(int(round(lerp(dst[i], src[i], a))) for i in range(3))

def in_triangle(px, py, v):
    def sign(a, b, c): return (px-b[0])*(c[1]-b[1]) - (c[0]-b[0])*(py-b[1])
    d1 = sign(None, v[0], v[1]); d2 = sign(None, v[1], v[2]); d3 = sign(None, v[2], v[0])
    neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    return not (neg and pos)

def tri_verts(cx, cy, radius, rot=-math.pi/2):
    return [(cx + radius*math.cos(rot + i*2*math.pi/3),
             cy + radius*math.sin(rot + i*2*math.pi/3)) for i in range(3)]

def render(size, content=0.92):
    cx = cy = size / 2.0
    R = size / 2.0 * content
    edge = 1.6 / R  # ~1px de suavização em unidades normalizadas
    rings = [  # (raio_norm, meia_espessura, brilho)
        (0.95, 0.020, 0.9),
        (0.84, 0.012, 0.7),
        (0.66, 0.040, 1.0),
        (0.50, 0.014, 0.8),
    ]
    core_r = 0.36
    outer_t = tri_verts(cx, cy, R*0.22)
    inner_t = tri_verts(cx, cy, R*0.13)

    px = bytearray()
    for y in range(size):
        px.append(0)  # filtro 0
        for x in range(size):
            dx, dy = (x + 0.5 - cx), (y + 0.5 - cy)
            dist = math.sqrt(dx*dx + dy*dy)
            r = dist / R
            # fundo radial (dentro do disco) -> escuro fora
            if r <= 1.0:
                col = tuple(int(lerp(BG_C[i], BG_E[i], clamp(r))) for i in range(3))
                alpha = 1.0
            else:
                col = BG_E
                alpha = clamp(1.0 - (r - 1.0) / edge)  # borda suave do disco
            if alpha <= 0:
                px += bytes((0, 0, 0, 0)); continue

            # núcleo brilhante
            if r < core_r:
                t = clamp(r / core_r)
                col = blend(blend(CORE, BG_C, clamp(t*1.1)), col, 0.0)
                col = blend(col, CORE, clamp(1.0 - t) * 0.85)

            # anéis + brilho
            for rr, ht, glow in rings:
                d = abs(r - rr)
                solid = clamp((ht + edge - d) / edge) if d <= ht + edge else 0.0
                gl = clamp((ht*5 - d) / (ht*5)) * 0.22 if d < ht*5 else 0.0
                a = clamp(solid + gl) * glow
                if a > 0:
                    col = blend(col, CYAN, a)

            # triângulo (contorno) no núcleo
            if in_triangle(x + 0.5, y + 0.5, outer_t) and not in_triangle(x + 0.5, y + 0.5, inner_t):
                col = blend(col, CYAN, 0.95)

            px += bytes((col[0], col[1], col[2], int(round(alpha * 255))))
    return png_bytes(size, size, bytes(px))

def chunk(typ, data):
    return struct.pack(">I", len(data)) + typ + data + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)

def png_bytes(w, h, raw):
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)  # RGBA
    idat = zlib.compress(raw, 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

def main():
    out = os.path.join(os.path.dirname(__file__), "..", "icons")
    os.makedirs(out, exist_ok=True)
    targets = [
        ("icon-192.png", 192, 0.92),
        ("icon-512.png", 512, 0.92),
        ("icon-maskable-512.png", 512, 0.72),  # área segura p/ máscara
        ("apple-touch-icon.png", 180, 0.92),
    ]
    for name, size, content in targets:
        with open(os.path.join(out, name), "wb") as f:
            f.write(render(size, content))
        print("gerado", name, size)

if __name__ == "__main__":
    main()
