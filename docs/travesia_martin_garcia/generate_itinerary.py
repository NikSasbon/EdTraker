#!/usr/bin/env python3
"""Generate a printable PDF route packet for Tigre -> Isla Martín García.

This is an orientation/trip-planning artifact, not a substitute for official nautical
charts, Notices to Mariners, local buoyage checks, depth sounder use, or Prefectura/SHN
instructions.
"""
from __future__ import annotations

from dataclasses import dataclass
from math import atan2, cos, radians, sin, sqrt
from pathlib import Path
import csv
import html

OUT_DIR = Path(__file__).resolve().parent
PDF_PATH = OUT_DIR / "itinerario_guarderia_laura_isla_martin_garcia.pdf"
CSV_PATH = OUT_DIR / "waypoints_garmin_400_500.csv"
GPX_PATH = OUT_DIR / "waypoints_garmin_400_500.gpx"

# Coordinates are WGS84 in decimal degrees. Most route waypoints are adapted from
# CVPB route San Isidro -> Isla Martín García (version 2.4, 2026-02-09). The first
# Tigre departure point is approximate from public address references for Guardería
# Laura / Compañía Náutica Biguá at Tupac Amaru 1130, Rincón de Milberg.
@dataclass
class WP:
    name: str
    lat: float
    lon: float
    desc: str
    interest: str = ""
    source: str = "CVPB"


def dmm_to_decimal(text: str) -> float:
    # Examples: "34 26.0023 S", "058 32.3859 W"
    p = text.replace("º", " ").replace("'", " ").split()
    deg = float(p[0]); minutes = float(p[1]); hemi = p[2].upper()
    val = deg + minutes / 60
    return -val if hemi in {"S", "W", "O"} else val


def dmm(lat: float, lon: float) -> tuple[str, str]:
    def one(v: float, is_lat: bool) -> str:
        hemi = ("S" if v < 0 else "N") if is_lat else ("W" if v < 0 else "E")
        a = abs(v); deg = int(a); minutes = (a - deg) * 60
        return f"{deg:02d}° {minutes:06.3f}' {hemi}" if is_lat else f"{deg:03d}° {minutes:06.3f}' {hemi}"
    return one(lat, True), one(lon, False)

# Departure connector from Guardería Laura to the CVPB route at Canal Vinculación.
waypoints = [
    WP("LAURA", -34.4130, -58.5845, "Guardería Náutica Laura / Biguá, Tupac Amaru 1130", "Punto estimado de salida: confirmar en GPS antes de zarpar", "Waze/Moovit + aproximación"),
    WP("LUJMAT", -34.4126, -58.5820, "Río Luján frente al Museo de Arte Tigre", "Salir despacio; alto tránsito turístico/deportivo", "Estimado"),
    WP("LJCVIN", dmm_to_decimal("34 26.0023 S"), dmm_to_decimal("058 32.3859 W"), "Río Luján y Canal Vinculación", "Empalme con derrota CVPB; mínima velocidad compatible", "CVPB Lujan02"),
]

for row in [
    ("CVINC1","34 25.7562 S","058 32.4267 W","Canal Vinculación","Centro de canal; prohibida vela según CVPB/PNA"),
    ("CVINC2","34 25.3949 S","058 32.4229 W","Canal Vinculación y Arroyo Gutiérrez","Seguir cauce central"),
    ("CVINC3","34 24.4680 S","058 31.5676 W","Canal Vinculación","Atención al tránsito"),
    ("CVINC4","34 24.3309 S","058 31.2000 W","Canal Vinculación y Río San Antonio","Banco al N; cardinal Este CEVinc cercano"),
    ("URION1","34 23.7010 S","058 31.3116 W","Río Urión","Motor; canal angosto"),
    ("URION2","34 23.1603 S","058 31.5422 W","Río Urión","Motor; canal angosto"),
    ("URION3","34 22.8301 S","058 31.5126 W","Río Urión","Motor; canal angosto"),
    ("URION4","34 22.5476 S","058 31.4043 W","Río Urión","Motor; canal angosto"),
    ("URION5","34 22.0918 S","058 31.4161 W","Río Urión","Motor; canal angosto"),
    ("URION6","34 21.7870 S","058 31.4571 W","Río Urión","Motor; canal angosto"),
    ("URION7","34 21.4540 S","058 31.5735 W","Río Urión","Motor; canal angosto"),
    ("URION8","34 21.0097 S","058 31.3514 W","Río Urión","Motor; canal angosto"),
    ("HONDA1","34 20.5653 S","058 31.4878 W","Canal Honda","Sondajes CVPB: aprox. 2,5-3,0 m"),
    ("HONDA2","34 18.7517 S","058 32.1620 W","Canal Honda y Canal Hambrientos","Mantener cauce central"),
    ("HONDA3","34 18.2552 S","058 32.4865 W","Canal Honda y Paraná de las Palmas","Ingreso a río principal"),
    ("PPALIN","34 18.1354 S","058 32.3788 W","Paraná de las Palmas, Isla Nueva","Cuidado tráfico mercante"),
    ("PALM51","34 18.0034 S","058 31.3881 W","Paraná de las Palmas km 51,4","Zona con profundidad amplia"),
    ("PPAL50","34 18.1376 S","058 30.8621 W","Paraná de las Palmas km 50,6","Tráfico y fondeos"),
    ("PPAL49","34 18.4653 S","058 30.4058 W","Paraná de las Palmas km 49,7","Preparar salida a Barca Grande"),
    ("PPAL48","34 18.9462 S","058 29.7400 W","Paraná de las Palmas km 48 aprox.","Boya roja km 48; apartarse del veril hacia el E"),
    ("PPAL47","34 19.1957 S","058 29.2850 W","Paraná de las Palmas km 47,4","Cruce hacia Isla Lucha"),
    ("ILUCHA","34 19.3688 S","058 28.7515 W","Canal al Sur de Isla Lucha","Entrada a palos 00-16"),
    ("PALO00","34 19.4276 S","058 27.5605 W","Palo Nro 00","Los palos no siempre marcan el mayor fondo"),
    ("PALO01","34 19.4721 S","058 26.6492 W","Palo Nro 01","Sondear; reducir si hay dudas"),
    ("PALO02","34 19.4980 S","058 26.2006 W","Palo Nro 02","Sector crítico: mínimo informado aprox. 1,50 m"),
    ("PALO03","34 19.3339 S","058 25.3694 W","Palo Nro 03","Sector crítico: verificar altura de agua"),
    ("PALO04","34 19.0721 S","058 24.7039 W","Palo Nro 04","Luego aumenta profundidad"),
    ("PALO05","34 18.8648 S","058 24.1913 W","Palo Nro 05","Rumbo NE"),
    ("PALO06","34 18.6179 S","058 23.5564 W","Palo Nro 06, Pozos del Barca Grande","Canal con >5 m según CVPB"),
    ("PALO07","34 18.1161 S","058 23.0221 W","Palo Nro 07, Pozos del Barca Grande","Mantener derrota"),
    ("PALO08","34 17.5427 S","058 22.3685 W","Palo Nro 08, Pozos del Barca Grande","Mantener derrota"),
    ("PALO09","34 17.2511 S","058 22.1642 W","Palo Nro 09, Pozos del Barca Grande","Mantener derrota"),
    ("PALO10","34 16.8293 S","058 21.8494 W","Palo Nro 10, Pozos del Barca Grande","Mantener derrota"),
    ("PALO11","34 16.6090 S","058 21.6625 W","Palo Nro 11, Pozos del Barca Grande","Mantener derrota"),
    ("PALO12","34 15.8832 S","058 21.3407 W","Palo Nro 12, Pozos del Barca Grande","Mantener derrota"),
    ("PALO13","34 15.1430 S","058 21.3994 W","Palo Nro 13, Pozos del Barca Grande","Mantener derrota"),
    ("PALO14","34 14.2160 S","058 21.4339 W","Palo Nro 14, Pozos del Barca Grande","Mantener derrota"),
    ("PALO15","34 13.5409 S","058 21.2630 W","Palo Nro 15, Pozos del Barca Grande","Aproxima Lancha Petrel"),
    ("PALO16","34 13.0766 S","058 20.9526 W","Palo Nro 16, Pozos del Barca Grande","Abrir a Canal Lancha Petrel"),
    ("PETREL1","34 12.3352 S","058 20.1953 W","Canal Lancha Petrel - boca Barca Grande","Reparo alternativo ante mal pronóstico"),
    ("PETREL2","34 11.3239 S","058 19.2452 W","Canal Lancha Petrel","Entre Isla Lucía e Isla Oyarvide"),
    ("PETREL3","34 11.1461 S","058 18.8943 W","Canal Lancha Petrel / Canal Buenos Aires","No cruzar directo al muelle"),
    ("CBSA01","34 11.0659 S","058 18.5353 W","Canal Buenos Aires","Seguir paralelo a Oyarvide"),
    ("CBSA02","34 11.1322 S","058 18.2621 W","Canal Buenos Aires","Evitar banco entre Oyarvide y Martín García"),
    ("CBSA03","34 11.7328 S","058 17.3000 W","Canal Buenos Aires - cruce final","Cruzar 090° verdadero 1,3 mn"),
    # CVPB page duplicates CBsAs04 longitude; here we compute the published 1.3 mn due east from CBsAs03.
    ("CBSA04","34 11.7328 S","058 15.7300 W","SW del muelle de Isla Martín García","Posición derivada: verificar en carta SHN antes de usar"),
    ("FONIMG","34 11.5400 S","058 15.3300 W","Zona de fondeo NO del muelle","No dejar embarcación en muelle; fondear y bajar con auxiliar"),
    ("MUELLE","34 11.6200 S","058 15.2000 W","Muelle Isla Martín García","Canal de acceso no balizado; faro-baliza SW como referencia"),
]:
    waypoints.append(WP(row[0], dmm_to_decimal(row[1]), dmm_to_decimal(row[2]), row[3], row[4]))

safety = [
    WP("NAFTA1", dmm_to_decimal("34 25.840 S"), dmm_to_decimal("058 32.569 W"), "Estación de combustible en Río Luján", "Últimas opciones de combustible en el arranque", "CVPB seguridad"),
    WP("NAFTA6", dmm_to_decimal("34 19.497 S"), dmm_to_decimal("058 31.800 W"), "Estación de combustible / referencia", "Verificar disponibilidad antes de depender de ella", "CVPB seguridad"),
    WP("CEVINC", dmm_to_decimal("34 24.314 S"), dmm_to_decimal("058 31.302 W"), "Cardinal Este Canal Vinculación / Río San Antonio", "Banco margen N; BYB Vq(3)W 5s según CVPB", "CVPB seguridad"),
]

# A very small PDF writer sufficient for vector maps and tables.
class PDF:
    def __init__(self):
        self.objects = []
        self.pages = []
        self.font_obj = self.add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        self.font_bold_obj = self.add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    def add_obj(self, body: str | bytes) -> int:
        self.objects.append(body)
        return len(self.objects)
    def add_page(self, content: str, w=842, h=595):
        stream = content.encode('latin-1', 'replace')
        cont_obj = self.add_obj(b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream")
        page = f"<< /Type /Page /Parent {{PAGES}} 0 R /MediaBox [0 0 {w} {h}] /Resources << /Font << /F1 {self.font_obj} 0 R /F2 {self.font_bold_obj} 0 R >> >> /Contents {cont_obj} 0 R >>"
        self.pages.append(page)
    def save(self, path: Path):
        page_objs=[]
        for p in self.pages:
            num=self.add_obj(p)
            page_objs.append(num)
        kids=" ".join(f"{n} 0 R" for n in page_objs)
        pages_obj=self.add_obj(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_objs)} >>")
        for i, body in enumerate(self.objects):
            if isinstance(body, str):
                self.objects[i] = body.replace("{PAGES}", str(pages_obj))
        catalog_obj=self.add_obj(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>")
        out=bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets=[0]
        for i, body in enumerate(self.objects,1):
            offsets.append(len(out))
            out += f"{i} 0 obj\n".encode()
            out += body if isinstance(body, bytes) else body.encode('latin-1','replace')
            out += b"\nendobj\n"
        xref=len(out)
        out += f"xref\n0 {len(self.objects)+1}\n0000000000 65535 f \n".encode()
        for off in offsets[1:]: out += f"{off:010d} 00000 n \n".encode()
        out += f"trailer << /Size {len(self.objects)+1} /Root {catalog_obj} 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
        path.write_bytes(out)


def esc(s: str) -> str:
    return s.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')

def text(x,y,s,size=9,bold=False):
    font='/F2' if bold else '/F1'
    return f"BT {font} {size} Tf {x:.1f} {y:.1f} Td ({esc(s)}) Tj ET\n"

def line(x1,y1,x2,y2,w=1, color=(0,0,0)):
    r,g,b=color; return f"{r} {g} {b} RG {w} w {x1:.1f} {y1:.1f} m {x2:.1f} {y2:.1f} l S\n"

def rect(x,y,w,h,stroke=(0,0,0),fill=None):
    s=''
    if fill: r,g,b=fill; s += f"{r} {g} {b} rg\n"
    r,g,b=stroke; s += f"{r} {g} {b} RG\n{x:.1f} {y:.1f} {w:.1f} {h:.1f} re {'B' if fill else 'S'}\n"
    return s

def circle(x,y,r,stroke=(0,0,0),fill=None):
    # Bezier circle approximation
    k=0.5522847498; s=''
    if fill: a,b,c=fill; s += f"{a} {b} {c} rg\n"
    a,b,c=stroke; s += f"{a} {b} {c} RG\n"
    s += f"{x+r:.1f} {y:.1f} m {x+r:.1f} {y+k*r:.1f} {x+k*r:.1f} {y+r:.1f} {x:.1f} {y+r:.1f} c {x-k*r:.1f} {y+r:.1f} {x-r:.1f} {y+k*r:.1f} {x-r:.1f} {y:.1f} c {x-r:.1f} {y-k*r:.1f} {x-k*r:.1f} {y-r:.1f} {x:.1f} {y-r:.1f} c {x+k*r:.1f} {y-r:.1f} {x+r:.1f} {y-k*r:.1f} {x+r:.1f} {y:.1f} c {'B' if fill else 'S'}\n"
    return s

def project(points, box):
    xs=[p.lon for p in points]; ys=[p.lat for p in points]
    minx,maxx=min(xs),max(xs); miny,maxy=min(ys),max(ys)
    x,y,w,h=box
    pad=0.04
    minx-=pad; maxx+=pad; miny-=pad; maxy+=pad
    def f(p):
        px=x+(p.lon-minx)/(maxx-minx)*w
        py=y+(p.lat-miny)/(maxy-miny)*h
        return px,py
    return f

def nm(a: WP,b: WP):
    # Equirectangular nautical miles
    latm=radians((a.lat+b.lat)/2)
    dx=(b.lon-a.lon)*60*cos(latm); dy=(b.lat-a.lat)*60
    return sqrt(dx*dx+dy*dy)

def bearing(a: WP,b: WP):
    lat1,lat2=radians(a.lat),radians(b.lat); dlon=radians(b.lon-a.lon)
    y=sin(dlon)*cos(lat2); x=cos(lat1)*sin(lat2)-sin(lat1)*cos(lat2)*cos(dlon)
    return (atan2(y,x)*180/3.141592653589793+360)%360

def draw_map(title, pts, notes, labels_every=4):
    c=''
    c+=rect(0,0,842,595, stroke=(1,1,1), fill=(0.93,0.97,1.0))
    c+=text(28,565,title,16,True)
    c+=text(28,548,"Derrota orientativa WGS84 - NO sustituye cartas oficiales SHN ni Avisos a los Navegantes",9)
    c+=rect(30,70,570,455, stroke=(0.2,0.45,0.65), fill=(0.80,0.91,0.98))
    f=project(pts,(55,95,520,395))
    # route line
    for a,b in zip(pts,pts[1:]):
        x1,y1=f(a); x2,y2=f(b); c+=line(x1,y1,x2,y2,2.0,(0.0,0.18,0.65))
    for i,p in enumerate(pts):
        x,y=f(p); c+=circle(x,y,3.5,stroke=(0.75,0.05,0.05),fill=(1,1,1))
        if i==0 or i==len(pts)-1 or i%labels_every==0:
            c+=text(x+5,y+4,p.name,6.5,True)
    # north arrow & scale rough
    c+=line(575,455,575,500,2,(0,0,0))+text(568,505,"N",10,True)
    c+=line(480,90,540,90,2,(0,0,0))+text(482,78,"escala esquemática",7)
    c+=rect(620,355,190,170,stroke=(0.4,0.4,0.4),fill=(1,1,1))
    c+=text(632,505,"Notas del tramo",11,True)
    yy=488
    for n in notes:
        for chunk in [n[i:i+54] for i in range(0,len(n),54)]:
            c+=text(632,yy,chunk,7.8); yy-=11
        yy-=3
    c+=rect(620,70,190,255,stroke=(0.4,0.4,0.4),fill=(1,1,1))
    c+=text(632,305,"Waypoints principales",10,True); yy=289
    for p in pts[:18]:
        la,lo=dmm(p.lat,p.lon)
        c+=text(632,yy,f"{p.name:7s} {la} {lo}",6.1); yy-=10
    return c


def write_csv():
    with CSV_PATH.open('w', newline='', encoding='utf-8') as f:
        w=csv.writer(f)
        w.writerow(['name','latitude_dmm','longitude_dmm','latitude_decimal','longitude_decimal','description','datos_interes','source'])
        for p in waypoints+safety:
            la,lo=dmm(p.lat,p.lon)
            w.writerow([p.name,la,lo,f"{p.lat:.7f}",f"{p.lon:.7f}",p.desc,p.interest,p.source])

def write_gpx():
    now="2026-05-06T00:00:00Z"
    pts=''.join(f'  <wpt lat="{p.lat:.7f}" lon="{p.lon:.7f}"><name>{html.escape(p.name)}</name><desc>{html.escape(p.desc + " - " + p.interest)}</desc></wpt>\n' for p in waypoints+safety)
    rtepts=''.join(f'    <rtept lat="{p.lat:.7f}" lon="{p.lon:.7f}"><name>{html.escape(p.name)}</name></rtept>\n' for p in waypoints)
    GPX_PATH.write_text(f'''<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="EdTraker Codex itinerary" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>Guarderia Laura - Isla Martin Garcia</name><time>{now}</time></metadata>\n{pts}  <rte><name>Laura Tigre a Isla Martin Garcia</name>\n{rtepts}  </rte>\n</gpx>\n''', encoding='utf-8')

def make_pdf():
    pdf=PDF()
    total=sum(nm(a,b) for a,b in zip(waypoints,waypoints[1:]))
    c=draw_map("Hoja 1 - Vista general: Guardería Laura (Tigre) a Isla Martín García", waypoints,
        [f"Distancia estimada por esta derrota: {total:.1f} mn desde Laura (tramo inicial aproximado).",
         "Calado solicitado: 0,60 m. El sector más sensible informado por CVPB es Palo02-Palo04 (~1,50 m); igualmente depende de bajantes/viento.",
         "Antes de salir: combustible suficiente; SHN H118/H115/H116/H117; Avisos a Navegantes; meteorología y altura de agua.",
         "Comunicaciones: VHF 16. Al arribo llamar Subprefectura Martín García L5P."], labels_every=6)
    pdf.add_page(c)
    segments=[
        ("Hoja 2 - Salida de Tigre, Río Luján, Vinculación, Urión y Honda", waypoints[:18], ["Salida desde Guardería Laura: posición aproximada por dirección pública; confirme waypoint con su equipo al botar.", "Río Luján, Vinculación, Urión y Honda: navegar a motor por cauce central; tránsito alto los fines de semana.", "CVPB informa sondajes generales de 2,5 a 3,0 m en Vinculación/Urión/Honda y más de 3,0 m en Río Luján."],3),
        ("Hoja 3 - Paraná de las Palmas y salida hacia Isla Lucha", waypoints[17:28], ["En Paraná de las Palmas hay tráfico mercante y fondeos fuera de veril; no interferir con buques.", "En PPAL48 comenzar a apartarse hacia el Este entre Islas Lucha y Zárate.", "Usar referencias visuales y sonda; evitar cortar bancos."],2),
        ("Hoja 4 - Palos 00 a 16 / Canal Pozos del Barca Grande", waypoints[27:45], ["La línea de palos 00-16 no necesariamente coincide con el mayor fondo; los waypoints privilegian profundidades sondadas por navegantes.", "Palo02-Palo04: cota mínima reportada aprox. 1,50 m; con 0,60 m de calado dejar margen por bajante y ola.", "Desde Palo06 el Canal Pozos del Barca Grande supera ampliamente 5 m según CVPB."],3),
        ("Hoja 5 - Canal Lancha Petrel, Canal Buenos Aires y aproximación", waypoints[44:], ["Al salir de Lancha Petrel NO cruzar directo al muelle: hay banco entre Oyarvide y Martín García.", "Ir hasta CBSA03 y cruzar 090° verdadero aprox. 1,3 mn hacia CBSA04; CBSA04 fue derivado porque la tabla web duplicaba coordenadas.", "El acceso al muelle por Canal Buenos Aires no está balizado; fondeo recomendado al NO del muelle, expuesto a todos los vientos."],2),
    ]
    for title,pts,notes,le in segments:
        pdf.add_page(draw_map(title,pts,notes,labels_every=le))
    # table page
    c=rect(0,0,842,595,stroke=(1,1,1),fill=(1,1,1))+text(28,565,"Hoja 6 - Carga manual GPSMAP Garmin 400/500",16,True)
    c+=text(28,548,"Formato sugerido: hddd° mm.mmm' / Datum WGS84. Cargue como ROUTE y verifique contra carta oficial.",9)
    x=[28,85,165,260,610]
    c+=text(x[0],528,"#",7,True)
    c+=text(x[1],528,"WP",7,True)+text(x[2],528,"Latitud",7,True)+text(x[3],528,"Longitud",7,True)+text(x[4],528,"Dato",7,True)
    y=514
    for i,p in enumerate(waypoints,1):
        if y<45:
            break
        la,lo=dmm(p.lat,p.lon)
        c+=text(x[0],y,str(i),6.1)+text(x[1],y,p.name,6.1,True)+text(x[2],y,la,6.1)+text(x[3],y,lo,6.1)+text(x[4],y,p.interest[:34],5.6)
        y-=10
    c+=text(28,28,"Listado completo: waypoints_garmin_400_500.csv y GPX adjunto. Fuente principal CVPB 2026; balizamiento Canal Martín García CARP 09/10/2025; puerto NuestroMar; SHN para validación final.",7)
    pdf.add_page(c)
    pdf.save(PDF_PATH)

if __name__ == '__main__':
    write_csv(); write_gpx(); make_pdf()
    print(PDF_PATH)
    print(CSV_PATH)
    print(GPX_PATH)

