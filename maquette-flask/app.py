"""Maquette interactive ARD LINE.

Prototype de présentation uniquement : ce n'est pas l'architecture du site final.
Lancement :  python app.py   puis ouvrir http://127.0.0.1:5000
"""
from flask import Flask, abort, render_template

app = Flask(__name__)

# Données de maquette.
# Seules les informations lisibles sur les étiquettes ou visibles sur les photos
# sont renseignées. Tout ce qui vaut None s'affiche comme placeholder bleu.
PRODUCTS = [
    {"slug": "noya", "name": "Noya", "cap": "noir", "juice": "Or olive"},
    {"slug": "oua", "name": "Oua", "cap": "noir", "juice": "Vert d'eau"},
    {"slug": "aworiwonga", "name": "Aworiwonga", "cap": "noir", "juice": "Or pâle"},
    {"slug": "la-sebe", "name": "La Sébé", "cap": "blanc", "juice": "Or pâle"},
    {"slug": "le-ntem", "name": "Le Ntem", "cap": "blanc", "juice": "Or pâle"},
    {"slug": "mingoue", "name": "Mingoué", "cap": "noir", "juice": "Or pâle"},
]
for p in PRODUCTS:
    p.update(
        type="Extrait de parfum",        # inscrit sur l'étiquette
        volume="35 ml",                  # inscrit sur l'étiquette
        studio=f"images/studio-{p['slug']}.jpg",
        nature=f"images/nature-{p['slug']}.jpg",
        price=None,                      # à fournir par la marque
        availability=None,               # à fournir
        description=None,                # à fournir
        family=None,                     # à fournir
        notes={"Tête": None, "Cœur": None, "Fond": None},  # à fournir
    )

# Correspondances du quiz : EXEMPLE pour la démonstration, à définir par la marque.
QUIZ_DEMO = {
    "floral": ["la-sebe"],
    "frais": ["oua"],
    "intense": ["noya", "aworiwonga"],
    "aquatique": ["oua", "le-ntem"],
    "sensuel": ["mingoue"],
    "boise": ["aworiwonga"],
}

LEGAL_PAGES = {
    "mentions-legales": "Mentions légales",
    "confidentialite": "Politique de confidentialité",
    "conditions-generales": "Conditions générales de vente",
    "livraison-retours": "Livraison & retours",
}


def get_product(slug):
    return next((p for p in PRODUCTS if p["slug"] == slug), None)


@app.context_processor
def inject_globals():
    return {"products": PRODUCTS, "legal_pages": LEGAL_PAGES, "quiz_demo": QUIZ_DEMO}


@app.route("/")
def home():
    return render_template("home.html", featured=get_product("noya"), page="home")


@app.route("/collection")
def collection():
    return render_template("collection.html", page="collection")


@app.route("/parfum/<slug>")
def product(slug):
    p = get_product(slug)
    if not p:
        abort(404)
    similar = [x for x in PRODUCTS if x["slug"] != slug][:4]
    return render_template("product.html", p=p, similar=similar, page="collection")


@app.route("/panier")
def cart():
    return render_template("cart.html", page="cart")


@app.route("/commande")
def checkout():
    return render_template("checkout.html", page="checkout")


@app.route("/confirmation")
def confirmation():
    return render_template("confirmation.html", page="checkout")


@app.route("/compte")
def account():
    return render_template("account.html", page="account")


@app.route("/a-propos")
def about():
    return render_template("about.html", page="about")


@app.route("/contact")
def contact():
    return render_template("contact.html", page="contact")


@app.route("/faq")
def faq():
    return render_template("faq.html", page="faq")


@app.route("/legal/<slug>")
def legal(slug):
    if slug not in LEGAL_PAGES:
        abort(404)
    return render_template("legal.html", slug=slug, title=LEGAL_PAGES[slug], page="legal")


@app.errorhandler(404)
def not_found(_):
    return render_template("404.html", page="404"), 404


if __name__ == "__main__":
    app.run(debug=True)
