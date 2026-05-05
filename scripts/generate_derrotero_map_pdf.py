#!/usr/bin/env python3
"""Generate a multi-page, map-style derrotero PDF for Tigre -> Isla Martin Garcia.

The output is intentionally labelled as non-official planning material. It avoids
claiming official buoy numbers/positions and asks the navigator to validate the
current SHN/PNA charting, notices, buoys, tides, and onboard instruments.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path

PAGE_W = 842
PAGE_H = 595
OUT = Path(__file__).resolve().parents[1] / "derrotero_tigre_martin_garcia.pdf"


@dataclass(frozen=True)
class WP:
    name: str
    lat: float
    lon: float
    note: str


WAYPOINTS = [
    WP("WP1 Guarderia Laura / salida", -34.4300, -58.5783, "Zarpe lento, trafico local"),
    WP("WP2 Rio Lujan", -34.4150, -58.6100, "Control de trafico y estelas"),
    WP("WP3 Ingreso Canal Arias", -34.3950, -58.6800, "Preparar tramo angosto"),
    WP("WP4 Arias medio", -34.3550, -58.6780, "Curvas, vigia activa"),
    WP("WP5 Arias / Parana Palmas", -34.3067, -58.6767, "Egreso a canal principal"),
    WP("WP6 Palmas control", -34.2067, -58.5083, "Sonda + balizamiento"),
    WP("WP7 Zona Oyarbide", -34.0917, -58.3667, "No cortar bancos"),
    WP("WP8 Canal Lynch / Petrel", -34.1800, -58.3000, "Ajustar a canal habilitado"),
    WP("WP9 Aproximacion MG", -34.1800, -58.2750, "Velocidad de maniobra"),
    WP("WP10 Puerto Martin Garcia", -34.1967, -58.2517, "Arribo / amarre"),
]

PAGES = [
    {
        "title": "Derrota auxiliar Tigre - Isla Martin Garcia | Hoja 1/5 | Vista general",
        "bbox": (-58.72, -58.22, -34.45, -34.05),
        "wps": WAYPOINTS,
        "info": [
            "Uso: briefing y planificacion previa.",
            "Calado de referencia: 0,60 m.",
            "Distancia total estimada: 60-80 mn.",
            "Validar SHN + PNA antes de zarpar.",
            "No es carta oficial ni reemplaza plotter.",
        ],
        "legs": ["WP1-WP3: Delta / Rio Lujan", "WP3-WP5: Canal Arias", "WP5-WP7: Parana de las Palmas", "WP7-WP10: acceso Martin Garcia"],
    },
    {
        "title": "Hoja 2/5 | Tigre - Rio Lujan - Ingreso Canal Arias",
        "bbox": (-58.70, -58.55, -34.44, -34.38),
        "wps": WAYPOINTS[0:4],
        "info": [
            "Navegar con baja velocidad al salir.",
            "Atento a muelles, cruces y estelas.",
            "Identificar marcas laterales vigentes.",
            "Punto clave: WP3 ingreso Arias.",
        ],
        "legs": ["L1 WP1->WP2: salida urbana", "L2 WP2->WP3: preparar ingreso", "L3 WP3->WP4: canal angosto"],
    },
    {
        "title": "Hoja 3/5 | Canal Arias - Parana de las Palmas",
        "bbox": (-58.70, -58.48, -34.40, -34.28),
        "wps": WAYPOINTS[2:7],
        "info": [
            "Curvas cerradas: vigia y reduccion.",
            "Controlar sonda antes de abrir rumbo.",
            "No salir del veril balizado.",
            "WP5: salida a Palmas.",
        ],
        "legs": ["L3 WP3->WP4: Arias medio", "L4 WP4->WP5: salida Arias", "L5 WP5->WP6: Palmas", "L6 WP6->WP7: control abierto"],
    },
    {
        "title": "Hoja 4/5 | Palmas - Oyarbide - Canales de acceso",
        "bbox": (-58.55, -58.28, -34.24, -34.06),
        "wps": WAYPOINTS[5:9],
        "info": [
            "Tramo mas abierto: viento y deriva.",
            "Registrar SOG/COG cada 45-60 min.",
            "Evitar atajos por bancos.",
            "Si cambia el boyado: seguir SHN/PNA.",
        ],
        "legs": ["L5 WP5->WP6: eje de canal", "L6 WP6->WP7: Oyarbide", "L7 WP7->WP8: canal habilitado", "L8 WP8->WP9: aproximacion"],
    },
    {
        "title": "Hoja 5/5 | Aproximacion final y arribo a Martin Garcia",
        "bbox": (-58.32, -58.23, -34.22, -34.16),
        "wps": WAYPOINTS[7:10],
        "info": [
            "Confirmar marcas de entrada del dia.",
            "Velocidad de maniobra en aproximacion.",
            "Cabos y defensas preparados.",
            "Aviso VHF antes de maniobra final.",
        ],
        "legs": ["L8 WP8->WP9: entrada", "L9 WP9->WP10: puerto", "Banco: no cortar directo", "Canal: seguir boyas reales"],
    },
]


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Canvas:
    def __init__(self) -> None:
        self.ops: list[str] = []

    def color(self, r: float, g: float, b: float) -> None:
        self.ops.append(f"{r:.3f} {g:.3f} {b:.3f} rg {r:.3f} {g:.3f} {b:.3f} RG")

    def line_width(self, width: float) -> None:
        self.ops.append(f"{width:.2f} w")

    def rect(self, x: float, y: float, w: float, h: float, fill: bool = True) -> None:
        self.ops.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {'f' if fill else 'S'}")

    def line(self, x1: float, y1: float, x2: float, y2: float) -> None:
        self.ops.append(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def polyline(self, points: list[tuple[float, float]], width: float, rgb: tuple[float, float, float]) -> None:
        self.color(*rgb)
        self.line_width(width)
        x0, y0 = points[0]
        path = [f"{x0:.2f} {y0:.2f} m"]
        path.extend(f"{x:.2f} {y:.2f} l" for x, y in points[1:])
        path.append("S")
        self.ops.append(" ".join(path))

    def polygon(self, points: list[tuple[float, float]], rgb: tuple[float, float, float]) -> None:
        self.color(*rgb)
        x0, y0 = points[0]
        path = [f"{x0:.2f} {y0:.2f} m"]
        path.extend(f"{x:.2f} {y:.2f} l" for x, y in points[1:])
        path.append("h f")
        self.ops.append(" ".join(path))

    def circle(self, x: float, y: float, radius: float, rgb: tuple[float, float, float], stroke: bool = True) -> None:
        # Bezier circle approximation.
        k = 0.5522847498 * radius
        self.color(*rgb)
        op = (
            f"{x+radius:.2f} {y:.2f} m "
            f"{x+radius:.2f} {y+k:.2f} {x+k:.2f} {y+radius:.2f} {x:.2f} {y+radius:.2f} c "
            f"{x-k:.2f} {y+radius:.2f} {x-radius:.2f} {y+k:.2f} {x-radius:.2f} {y:.2f} c "
            f"{x-radius:.2f} {y-k:.2f} {x-k:.2f} {y-radius:.2f} {x:.2f} {y-radius:.2f} c "
            f"{x+k:.2f} {y-radius:.2f} {x+radius:.2f} {y-k:.2f} {x+radius:.2f} {y:.2f} c "
            f"{'B' if stroke else 'f'}"
        )
        self.ops.append(op)

    def text(self, x: float, y: float, text: str, size: int = 9, rgb: tuple[float, float, float] = (0, 0, 0), bold: bool = False) -> None:
        self.color(*rgb)
        font = "/F2" if bold else "/F1"
        self.ops.append(f"BT {font} {size} Tf {x:.2f} {y:.2f} Td ({pdf_escape(text)}) Tj ET")

    def stream(self) -> bytes:
        return "\n".join(self.ops).encode("latin-1", "replace")


def project(lat: float, lon: float, bbox: tuple[float, float, float, float], box: tuple[float, float, float, float]) -> tuple[float, float]:
    min_lon, max_lon, min_lat, max_lat = bbox
    x, y, w, h = box
    px = x + (lon - min_lon) / (max_lon - min_lon) * w
    py = y + (lat - min_lat) / (max_lat - min_lat) * h
    return px, py


def draw_compass(c: Canvas, x: float, y: float) -> None:
    c.circle(x, y, 20, (0.95, 0.98, 0.98))
    c.color(0.02, 0.22, 0.28)
    c.line_width(2)
    c.ops.append(f"{x:.2f} {y+15:.2f} m {x-6:.2f} {y-8:.2f} l {x:.2f} {y-4:.2f} l {x+6:.2f} {y-8:.2f} l h f")
    c.text(x - 4, y + 4, "N", 10, (0.02, 0.22, 0.28), True)


def draw_page(page: dict) -> bytes:
    c = Canvas()
    c.color(0.96, 0.94, 0.86)
    c.rect(0, 0, PAGE_W, PAGE_H)
    c.color(0.04, 0.20, 0.23)
    c.rect(0, 520, PAGE_W, 75)
    c.text(22, 558, page["title"], 17, (1, 1, 1), True)
    c.text(22, 536, "Desde Guarderia Nautica Laura / Bigua, Tupac Amaru 1130, Rincon de Milberg", 10, (0.82, 0.93, 0.94))
    c.color(0.97, 0.97, 0.95)
    c.rect(610, 535, 205, 47)
    c.text(620, 566, "NO ES CARTA OFICIAL", 10, (0.70, 0.08, 0.08), True)
    c.text(620, 552, "Usar cartas SHN vigentes, avisos,", 8, (0.05, 0.05, 0.05), True)
    c.text(620, 540, "mareas y verificacion a bordo.", 8, (0.05, 0.05, 0.05), True)

    map_box = (22, 48, 570, 445)
    side_x = 615
    c.color(0.82, 0.89, 0.74)
    c.rect(*map_box)
    x, y, w, h = map_box
    # Stylized water band. It is schematic by design, not a nautical chart.
    water = [(x, y + h * 0.30), (x + w * 0.15, y + h * 0.40), (x + w * 0.34, y + h * 0.36), (x + w * 0.52, y + h * 0.42), (x + w * 0.68, y + h * 0.37), (x + w * 0.84, y + h * 0.45), (x + w, y + h * 0.40), (x + w, y + h * 0.70), (x + w * 0.82, y + h * 0.62), (x + w * 0.65, y + h * 0.66), (x + w * 0.48, y + h * 0.60), (x + w * 0.35, y + h * 0.68), (x + w * 0.19, y + h * 0.62), (x, y + h * 0.74)]
    c.polygon(water, (0.82, 0.94, 0.95))
    # Grid.
    c.color(0.65, 0.78, 0.73)
    c.line_width(0.5)
    for i in range(1, 6):
        gx = x + w * i / 6
        c.line(gx, y, gx, y + h)
        gy = y + h * i / 6
        c.line(x, gy, x + w, gy)
    c.color(0.25, 0.45, 0.46)
    c.line_width(0.8)
    c.rect(x, y, w, h, fill=False)

    # Route.
    bbox = page["bbox"]
    visible = page["wps"]
    pts = [project(wp.lat, wp.lon, bbox, map_box) for wp in visible]
    c.polyline(pts, 4.5, (0.00, 0.31, 0.40))
    # Highlight two caution legs in orange if present.
    if len(pts) > 3:
        c.polyline(pts[2:4], 5.5, (0.95, 0.58, 0.05))
        c.polyline(pts[2:4], 2.5, (0.00, 0.31, 0.40))
    for wp, (px, py) in zip(visible, pts):
        c.circle(px, py, 4.2, (1, 0.97, 0.80))
        c.text(px + 6, py + 4, wp.name.split()[0], 8, (0.02, 0.20, 0.24), True)
    # Notes on map.
    labels = {
        "Parana de las Palmas": (0.36, 0.50),
        "Canal Arias": (0.20, 0.36),
        "Canal Lynch / Petrel": (0.78, 0.66),
        "Isla Martin Garcia": (0.88, 0.72),
    }
    for label, (lx, ly) in labels.items():
        c.text(x + w * lx, y + h * ly, label, 8, (0.05, 0.19, 0.23), True)
    draw_compass(c, x + w - 38, y + h - 43)
    # Scale bar schematic.
    c.line_width(1.5)
    c.color(0.03, 0.20, 0.25)
    c.line(x + w - 160, y + 28, x + w - 70, y + 28)
    c.line(x + w - 160, y + 22, x + w - 160, y + 34)
    c.line(x + w - 70, y + 22, x + w - 70, y + 34)
    c.text(x + w - 135, y + 13, "escala esquematica", 7, (0.03, 0.20, 0.25), True)

    # Side panels.
    c.text(side_x, 492, "DATOS DE LA HOJA", 11, (0.04, 0.20, 0.23), True)
    yy = 474
    for item in page["info"]:
        c.text(side_x, yy, f"- {item}", 8, (0.04, 0.04, 0.04))
        yy -= 14
    c.text(side_x, yy - 6, "LEGS / PUNTOS CLAVE", 11, (0.04, 0.20, 0.23), True)
    yy -= 24
    for item in page["legs"]:
        c.text(side_x, yy, f"- {item}", 8, (0.04, 0.04, 0.04))
        yy -= 14
    c.text(side_x, yy - 8, "WAYPOINTS VISIBLES", 11, (0.04, 0.20, 0.23), True)
    yy -= 26
    for wp in visible:
        c.text(side_x, yy, wp.name, 7, (0.02, 0.16, 0.19), True)
        yy -= 10
        c.text(side_x + 8, yy, f"{abs(wp.lat):.4f}S  {abs(wp.lon):.4f}W", 7, (0.04, 0.04, 0.04))
        yy -= 10
        c.text(side_x + 8, yy, wp.note, 7, (0.40, 0.10, 0.05))
        yy -= 13
        if yy < 35:
            break
    c.text(22, 24, "Derrota auxiliar: posiciones aproximadas. Boyas dibujadas como referencia grafica; validar balizamiento real vigente.", 8, (0.40, 0.10, 0.05), True)
    return c.stream()


def build_pdf(streams: list[bytes]) -> bytes:
    n = len(streams)
    catalog = 1
    pages_id = 2
    page_ids = list(range(3, 3 + n))
    font1_id = 3 + n
    font2_id = font1_id + 1
    content_ids = list(range(font2_id + 1, font2_id + 1 + n))
    objs: list[tuple[int, bytes]] = []
    objs.append((catalog, b"<< /Type /Catalog /Pages 2 0 R >>"))
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objs.append((pages_id, f"<< /Type /Pages /Kids [{kids}] /Count {n} >>".encode()))
    for idx, page_id in enumerate(page_ids):
        content_id = content_ids[idx]
        page_obj = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 {font1_id} 0 R /F2 {font2_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
        objs.append((page_id, page_obj.encode()))
    objs.append((font1_id, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"))
    objs.append((font2_id, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"))
    for content_id, stream in zip(content_ids, streams):
        objs.append((content_id, f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream"))
    objs.sort(key=lambda item: item[0])
    pdf = b"%PDF-1.4\n"
    offsets = {0: 0}
    for obj_id, body in objs:
        offsets[obj_id] = len(pdf)
        pdf += f"{obj_id} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(pdf)
    size = max(offsets) + 1
    pdf += f"xref\n0 {size}\n".encode() + b"0000000000 65535 f \n"
    for obj_id in range(1, size):
        pdf += f"{offsets[obj_id]:010d} 00000 n \n".encode()
    pdf += f"trailer << /Size {size} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return pdf


def main() -> None:
    streams = [draw_page(page) for page in PAGES]
    OUT.write_bytes(build_pdf(streams))
    print(f"Generated {OUT} with {len(streams)} map pages")


if __name__ == "__main__":
    main()
