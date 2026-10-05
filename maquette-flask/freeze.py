"""Exporte la maquette Flask en site statique (dossier ../docs) pour GitHub Pages.

Usage :  python freeze.py
Chaque page devient un fichier index.html dans son dossier, avec des liens relatifs :
le site fonctionne sous n'importe quelle adresse (https://<compte>.github.io/<depot>/).
"""
import os
import re
import shutil

from app import PRODUCTS, LEGAL_PAGES, app

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "docs")

ROUTES = ["/", "/collection", "/panier", "/commande", "/confirmation", "/compte",
          "/a-propos", "/contact", "/faq"]
ROUTES += [f"/parfum/{p['slug']}" for p in PRODUCTS]
ROUTES += [f"/legal/{slug}" for slug in LEGAL_PAGES]


def relativize(html, depth):
    prefix = "../" * depth

    def fix(path):
        path, _, anchor = path.partition("#")
        if path.startswith("static/") or "." in path.rsplit("/", 1)[-1]:
            target = prefix + path
        elif path == "":
            target = prefix + "index.html"
        else:
            target = prefix + path.rstrip("/") + "/index.html"
        return target + ("#" + anchor if anchor else "")

    # attributs href / src / srcset / data-* (galerie, lightbox), puis chaînes JS de base.html
    html = re.sub(r'((?:href|src|srcset|data-[a-z-]+)=")/([^"]*)"', lambda m: m.group(1) + fix(m.group(2)) + '"', html)
    html = re.sub(r'(= ")/([^"]*)";', lambda m: m.group(1) + fix(m.group(2)) + '";', html)
    return html


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    client = app.test_client()
    for route in ROUTES:
        resp = client.get(route)
        assert resp.status_code == 200, (route, resp.status_code)
        parts = [p for p in route.split("/") if p]
        folder = os.path.join(OUT, *parts)
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f:
            f.write(relativize(resp.get_data(as_text=True), len(parts)))
    # page 404 de GitHub Pages : servie à n'importe quelle profondeur, on vise la racine du dépôt
    resp = client.get("/page-inexistante")
    html = resp.get_data(as_text=True)
    with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
        f.write(relativize(html, 0).replace('<head>', '<head>\n  <base href="/Ard-Line-Parfum/">', 1))
    shutil.copytree(os.path.join(HERE, "static"), os.path.join(OUT, "static"),
                    ignore=shutil.ignore_patterns("__pycache__"))
    open(os.path.join(OUT, ".nojekyll"), "w").close()
    # maquette non validée : pas d'indexation par les moteurs de recherche
    with open(os.path.join(OUT, "robots.txt"), "w") as f:
        f.write("User-agent: *\nDisallow: /\n")
    print(f"{len(ROUTES)} pages exportées dans {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
