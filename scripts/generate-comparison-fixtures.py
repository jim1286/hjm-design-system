#!/usr/bin/env python3
"""Build deterministic coordinate-identical PNG fixtures for both image hosts.

The iOS RN Image host cannot decode the previous SVG data URI (2026-10-07
ImageComparison QA). Raster fixtures avoid adding an SVG transport dependency
just for this demo, while keeping clipping distinct from cropping or scaling.
"""
import base64
import re
import struct
import zlib
from pathlib import Path

WIDTH, HEIGHT = 640, 360
MOUNTAINS = [(0, 360), (0, 250), (180, 105), (350, 270), (480, 170), (640, 320), (640, 360)]
FOREGROUND = [(0, 360), (0, 325), (160, 240), (340, 340), (480, 255), (640, 360)]


def contains(x, y, polygon):
    inside = False
    previous = polygon[-1]
    for current in polygon:
        ax, ay = previous
        bx, by = current
        if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
            inside = not inside
        previous = current
    return inside


def png(sky, ground):
    data = bytearray()
    for y in range(HEIGHT):
        data.append(0)  # PNG's unfiltered row; no platform-dependent encoder.
        for x in range(WIDTH):
            color = sky
            if (x - 490) ** 2 + (y - 90) ** 2 <= 44 ** 2:
                color = (245, 216, 132)
            if contains(x + .5, y + .5, MOUNTAINS):
                color = (37, 56, 71)
            if contains(x + .5, y + .5, FOREGROUND):
                color = ground
            data.extend(color)
    def chunk(kind, payload):
        return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', WIDTH, HEIGHT, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(data, 9)) + chunk(b'IEND', b'')


def main():
    target = Path(__file__).resolve().parents[1] / 'showcase/shared/reference-adoption.ts'
    source = target.read_text()
    for name, sky, ground in [('beforeImage', (127, 140, 141), (102, 134, 117)), ('afterImage', (80, 127, 203), (102, 134, 117))]:
        uri = 'data:image/png;base64,' + base64.b64encode(png(sky, ground)).decode()
        source, count = re.subn(r'(export const ' + name + r' = \{ src: ")[^"]+(".*)', lambda match: match[1] + uri + match[2], source)
        if count != 1:
            raise RuntimeError(f'Expected one {name} fixture, got {count}')
    target.write_text(source)


if __name__ == '__main__':
    main()
