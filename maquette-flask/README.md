# ARD LINE · maquette interactive

Prototype de présentation de la boutique ARD LINE, pour validation avec la cliente.
Ce n'est **pas** l'architecture du site final : elle sera définie après validation de la maquette.

## Lancer la maquette

1. Installer Python 3.10 ou plus récent.
2. Dans ce dossier, installer Flask (une seule fois) :

   ```
   pip install -r requirements.txt
   ```

3. Lancer :

   ```
   python app.py
   ```

4. Ouvrir http://127.0.0.1:5000 dans le navigateur.
   Pour voir la version mobile : outils de développement du navigateur (F12), mode appareil, largeur 390 px.

## Pages

| Adresse | Page |
|---|---|
| `/` | Accueil (10 sections) |
| `/collection` | Boutique, filtres par bouchon |
| `/parfum/<nom>` | Fiche produit (noya, oua, aworiwonga, la-sebe, le-ntem, mingoue) |
| `/panier` | Panier (aussi en tiroir depuis l'icône) |
| `/commande` | Commande en 3 étapes |
| `/confirmation` | Confirmation de commande |
| `/compte` | Connexion, création, aperçu du compte |
| `/a-propos`, `/contact`, `/faq` | Pages de marque et d'aide |
| `/legal/<page>` | Mentions légales, confidentialité, CGV, livraison & retours |

## Conventions de la maquette

- **Bleu pointillé `[...]`** : information commerciale manquante (prix, notes olfactives, contacts…). Rien n'est inventé.
- **Étiquette « À valider »** : information vue sur les affiches (24 h, villes, moyens de paiement…), à confirmer.
- **Encadrés bleus pleins** : annotations de designer. Le bouton en haut de page les masque pour la présentation.
- Le panier fonctionne (stocké dans le navigateur). Aucun paiement, aucun envoi de formulaire.
- Les correspondances du quiz « Quelle fragrance vous ressemble ? » sont un **exemple** à remplacer (`QUIZ_DEMO` dans `app.py`).

## Modifier le contenu

Les parfums sont décrits dans `PRODUCTS` en haut de `app.py`. Remplacer un `None` par la vraie valeur
(prix, description, famille, notes) fait disparaître le placeholder correspondant sur toutes les pages.

## Structure

```
app.py               routes et données de maquette
templates/           pages Jinja (base.html = en-tête, footer, menu, panier)
static/css/          main.css (charte), fonts.css (polices locales)
static/js/main.js    panier, quiz, filtres, galerie, étapes de commande
static/images/       photos recadrées (les étiquettes affichent encore « VEDA »)
static/fonts/        Bodoni Moda et Jost, hors ligne
```
