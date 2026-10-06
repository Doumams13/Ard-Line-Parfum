/* ARD LINE · interactions de la maquette (aucune donnée envoyée, panier stocké dans le navigateur) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PRODUCTS = window.ARD_PRODUCTS || [];
  var bySlug = {};
  PRODUCTS.forEach(function (p) { bySlug[p.slug] = p; });
  var img = function (path) { return window.ARD_STATIC + path; };
  var productUrl = function (slug) { return window.ARD_PRODUCT_URL.replace("__slug__", slug); };
  var PH = function (label) { return '<span class="ph">[' + label + "]</span>"; };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ───── Toast ───── */
  var toastTimer;
  function toast(html) {
    var t = $("#toast");
    t.innerHTML = html;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ───── Panier ───── */
  var cart = store.get("ard-cart", []);
  function saveCart() { store.set("ard-cart", cart); renderCart(); }
  function addToCart(slug, qty) {
    var line = cart.find(function (l) { return l.slug === slug; });
    if (line) line.qty += qty; else cart.push({ slug: slug, qty: qty });
    saveCart();
    $$(".cart-count").forEach(function (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    toast(bySlug[slug].name + " ajouté au panier <a href=\"#\" data-open=\"drawer\">Voir le panier</a>");
  }
  function setQty(slug, qty) {
    cart = cart.map(function (l) { return l.slug === slug ? { slug: slug, qty: qty } : l; }).filter(function (l) { return l.qty > 0; });
    saveCart();
  }
  function renderCart() {
    var count = cart.reduce(function (n, l) { return n + l.qty; }, 0);
    $$(".cart-count").forEach(function (c) { c.textContent = count; });
    $$(".cart-count-txt").forEach(function (c) { c.textContent = "(" + count + ")"; });
    $$("[data-cart-list]").forEach(function (box) {
      var ro = box.hasAttribute("data-readonly");
      if (!cart.length) {
        box.innerHTML = ro
          ? '<p class="muted small">Panier vide : ajoutez un parfum pour voir le récapitulatif.</p>'
          : '<div class="empty"><p class="h-s">Votre panier est vide</p><p class="muted">Les six fragrances de la collection vous attendent.</p><a class="btn" href="' + window.ARD_COLLECTION_URL + '">Découvrir la collection</a></div>';
        return;
      }
      box.innerHTML = cart.map(function (l) {
        var p = bySlug[l.slug];
        if (!p) return "";
        var ctrl = ro
          ? '<p class="muted small">Quantité ' + l.qty + "</p>"
          : '<div class="ctrl"><div class="stepper sm"><button type="button" data-qty="' + p.slug + '" data-d="-1" aria-label="Moins">−</button><output>' + l.qty + '</output><button type="button" data-qty="' + p.slug + '" data-d="1" aria-label="Plus">+</button></div><button type="button" class="remove" data-remove="' + p.slug + '">Retirer</button></div>';
        return '<div class="line-item"><a href="' + productUrl(p.slug) + '"><img src="' + img(p.studio) + '" alt="' + p.name + '"></a><div><a class="pname" href="' + productUrl(p.slug) + '" style="text-decoration:none">' + p.name + '</a><p class="muted small">' + p.type + " · " + p.volume + "</p>" + ctrl + "</div>" + PH("Prix") + "</div>";
      }).join("");
    });
  }

  /* ───── Ouverture / fermeture des panneaux ───── */
  var lastFocus;
  function open(id) {
    lastFocus = document.activeElement;
    if (id === "drawer") { close("menu"); $("#scrim").hidden = false; }
    var el = $("#" + id);
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = "hidden";
    var f = el.querySelector("button, a");
    if (f) f.focus();
  }
  function close(id) {
    var el = $("#" + id);
    if (!el || el.hidden) return;
    el.hidden = true;
    if (id === "drawer") $("#scrim").hidden = true;
    if ($("#menu").hidden && $("#drawer").hidden && (!$("#lightbox") || $("#lightbox").hidden)) document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open],[data-close],[data-add],[data-qty],[data-remove],[data-lightbox],[data-copy]");
    if (!t) { if (e.target.id === "scrim") close("drawer"); return; }
    if (t.dataset.open) { e.preventDefault(); open(t.dataset.open); }
    if (t.dataset.close) { if (t.tagName === "BUTTON") e.preventDefault(); close(t.dataset.close); }
    if (t.dataset.add) {
      e.preventDefault();
      var qty = 1;
      if (t.dataset.qtyFrom) { var o = $(t.dataset.qtyFrom + " output"); if (o) qty = +o.textContent || 1; }
      addToCart(t.dataset.add, qty);
    }
    if (t.dataset.qty) {
      var line = cart.find(function (l) { return l.slug === t.dataset.qty; });
      if (line) setQty(line.slug, Math.max(0, line.qty + +t.dataset.d));
    }
    if (t.dataset.remove) setQty(t.dataset.remove, 0);
    if (t.dataset.lightbox) {
      var lb = $("#lightbox");
      lb.querySelector("img").src = t.dataset.lightbox;
      lastFocus = t; lb.hidden = false; document.body.style.overflow = "hidden";
      lb.querySelector("button").focus();
    }
    if (t.dataset.copy) {
      var txt = t.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast("Copié"); }, function () { toast("Copie impossible, sélectionnez le texte"); });
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { close("drawer"); close("menu"); close("lightbox"); }
  });
  var lbEl = $("#lightbox");
  if (lbEl) lbEl.addEventListener("click", function (e) { if (e.target === lbEl) close("lightbox"); });

  /* ───── Annotations ───── */
  var annoOff = store.get("ard-anno-off", false);
  var annoBtn = $("#toggleAnno");
  function applyAnno() {
    document.body.classList.toggle("no-anno", annoOff);
    annoBtn.textContent = annoOff ? "Annotations : masquées" : "Annotations : affichées";
    annoBtn.setAttribute("aria-pressed", annoOff ? "false" : "true");
  }
  annoBtn.addEventListener("click", function () { annoOff = !annoOff; store.set("ard-anno-off", annoOff); applyAnno(); });
  applyAnno();

  /* ───── En-tête au défilement + parallax ───── */
  var hdr = $("#hdr");
  var parallax = $$(".parallax");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 760px)");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    hdr.classList.toggle("scrolled", y > 80);
    document.body.classList.toggle("past-hero", y > 600);
    if (reduce || mobile.matches) return;
    parallax.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = "translateY(" + (p * -6).toFixed(2) + "%)";
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ───── Accueil : halo de lumière qui révèle la photo ───── */
  var hero = $("[data-hero-light]");
  if (hero) {
    var hint = $("[data-hero-hint]", hero), touch = window.matchMedia("(hover: none)").matches;
    var R = 0, target = 0, drift = true, heroVisible = true, t0 = performance.now(), idle;
    var size = function () { target = Math.max(150, Math.min(hero.clientWidth, hero.clientHeight) * 0.36); };
    var setPos = function (x, y) { hero.style.setProperty("--x", x + "px"); hero.style.setProperty("--y", y + "px"); };
    size(); window.addEventListener("resize", size);
    if (touch && hint) hint.textContent = "Faites glisser votre doigt";
    var follow = function (e) {
      var r = hero.getBoundingClientRect(), pt = e.touches ? e.touches[0] : e;
      drift = false; setPos(pt.clientX - r.left, pt.clientY - r.top);
      if (!e.touches) hero.classList.add("pointer");
      clearTimeout(idle); idle = setTimeout(function () { drift = true; hero.classList.remove("pointer"); }, 2500);
    };
    hero.addEventListener("mousemove", follow);
    hero.addEventListener("touchmove", follow, { passive: true });
    hero.addEventListener("touchstart", follow, { passive: true });
    hero.addEventListener("mouseleave", function () { drift = true; hero.classList.remove("pointer"); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);
    if (reduce) {
      hero.style.setProperty("--r", target + "px");
    } else {
      setTimeout(function () {
        (function tick(now) {
          if (heroVisible) {
            R += (target - R) * 0.04;
            hero.style.setProperty("--r", R.toFixed(1) + "px");
            if (drift) {
              var t = (now - t0) / 1000, w = hero.clientWidth, h = hero.clientHeight;
              if (mobile.matches) setPos(w * (0.5 + 0.22 * Math.sin(t * 0.42)), h * (0.32 + 0.12 * Math.sin(t * 0.67 + 1)));
              else setPos(w * (0.6 + 0.14 * Math.sin(t * 0.42)), h * (0.56 + 0.18 * Math.sin(t * 0.67 + 1)));
            }
          }
          requestAnimationFrame(tick);
        })(performance.now());
      }, 1600);
    }
  }

  /* ───── Apparitions (le contenu reste visible sans JS ou sans observer) ───── */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > innerHeight) { el.classList.add("pre"); io.observe(el); }
    });
  }

  /* ───── Filtres bouchon ───── */
  $$("[data-filter-target]").forEach(function (group) {
    var target = $(group.dataset.filterTarget);
    group.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      $$("[data-filter]", group).forEach(function (x) { x.classList.toggle("on", x === b); });
      $$("[data-cap]", target).forEach(function (c) {
        var cap = c.dataset.cap;
        var show = b.dataset.filter === "all" || cap === b.dataset.filter;
        if (cap === "all") show = b.dataset.filter === "all";
        c.classList.toggle("is-hidden", !show);
      });
    });
  });
  var sort = $("#sort");
  if (sort) sort.addEventListener("change", function () {
    if (sort.selectedIndex !== 1) return toast("Tri simulé dans la maquette");
    var grid = $("#grid");
    $$(".card", grid).sort(function (a, b) { return a.querySelector(".pname").textContent.localeCompare(b.querySelector(".pname").textContent, "fr"); })
      .forEach(function (c) { grid.appendChild(c); });
  });

  /* ───── Quiz ───── */
  var profiles = $$(".pf");
  if (profiles.length) {
    var moment = "Le jour";
    var labels = {};
    profiles.forEach(function (b) { labels[b.dataset.profile] = b.querySelector("b").textContent; });
    var renderQuiz = function () {
      var picked = profiles.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.dataset.profile; });
      var hits = {};
      picked.forEach(function (k) { (window.ARD_QUIZ[k] || []).forEach(function (s) { (hits[s] = hits[s] || []).push(labels[k]); }); });
      var slugs = Object.keys(hits);
      var steps = $$(".steps li");
      steps.forEach(function (li, i) { li.classList.toggle("on", i === (picked.length ? 2 : 0)); });
      $("[data-quiz-summary]").textContent = picked.length ? picked.length + " envie" + (picked.length > 1 ? "s" : "") + " · " + moment.toLowerCase() : "Aucune envie choisie";
      $("[data-quiz-title]").textContent = slugs.length ? slugs.length + " fragrance" + (slugs.length > 1 ? "s" : "") + " pour vous" : "Choisissez vos envies";
      $("[data-quiz-list]").innerHTML = slugs.length ? slugs.map(function (s) {
        var p = bySlug[s];
        return '<div class="res-item"><img src="' + img(p.studio) + '" alt="' + p.name + '"><div><a class="pname" href="' + productUrl(s) + '" style="text-decoration:none">' + p.name + '</a><p class="match">' + hits[s].join(" · ") + '</p><a class="lnk" style="display:inline-block;margin-top:10px" href="' + productUrl(s) + '">Voir le parfum</a></div></div>';
      }).join("") : '<p class="muted">Vos fragrances apparaîtront ici dès le premier choix.</p>';
      var mb = $("[data-quiz-btn]");
      if (mb) mb.textContent = slugs.length ? "Voir mes " + slugs.length + " fragrance" + (slugs.length > 1 ? "s" : "") : "Voir mes fragrances";
    };
    profiles.forEach(function (b) {
      b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); renderQuiz(); });
    });
    $$("[data-moment]").forEach(function (b) {
      b.addEventListener("click", function () { moment = b.dataset.moment; $$("[data-moment]").forEach(function (x) { x.classList.toggle("on", x === b); }); renderQuiz(); });
    });
    var qs = $(".quiz-sticky");
    if (qs && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var on = en[0].isIntersecting;
        qs.classList.toggle("show", on);
        document.body.classList.toggle("quiz-in", on);
      }, { threshold: 0.25 }).observe($("#quiz"));
      qs.querySelector("a").addEventListener("click", function () { qs.classList.remove("show"); });
    }
    // État de démonstration : Frais + Aquatique présélectionnés
    ["frais", "aquatique"].forEach(function (k) { var b = $('[data-profile="' + k + '"]'); if (b) b.setAttribute("aria-pressed", "true"); });
    renderQuiz();
  }

  /* ───── Réseaux ───── */
  $$("[data-net]").forEach(function (b) {
    if (b.tagName !== "BUTTON") return;
    b.addEventListener("click", function () {
      $$(".nets button").forEach(function (x) { x.classList.toggle("on", x === b); });
      $$(".sgrid figure").forEach(function (f) { f.hidden = b.dataset.net !== "all" && f.dataset.net !== b.dataset.net; });
    });
  });

  /* ───── Fiche produit : galerie + quantité ───── */
  $$("[data-gal]").forEach(function (b) {
    b.addEventListener("click", function () {
      var m = $("#galMain");
      m.style.opacity = 0;
      setTimeout(function () { m.src = b.dataset.gal; m.style.opacity = 1; }, 250);
      $$("[data-gal]").forEach(function (x) { x.classList.toggle("on", x === b); });
    });
  });
  $$("[data-stepper]").forEach(function (s) {
    var out = s.querySelector("output");
    var btns = s.querySelectorAll("button");
    btns[0].addEventListener("click", function () { out.textContent = Math.max(1, +out.textContent - 1); });
    btns[1].addEventListener("click", function () { out.textContent = +out.textContent + 1; });
  });
  $$("[data-buy-now]").forEach(function (a) {
    a.addEventListener("click", function () { if (!cart.some(function (l) { return l.slug === a.dataset.buyNow; })) { cart.push({ slug: a.dataset.buyNow, qty: 1 }); store.set("ard-cart", cart); } });
  });

  /* ───── Commande en 3 étapes ───── */
  var co = $("#checkout");
  if (co) {
    var goStep = function (n) {
      $$("[data-step]", co).forEach(function (f) { f.hidden = f.dataset.step !== String(n); });
      $$("[data-step-label]").forEach(function (li) {
        var k = +li.dataset.stepLabel;
        li.classList.toggle("on", k === n);
        li.classList.toggle("done", k < n);
      });
      $$(".msteps i").forEach(function (i, k) { i.classList.toggle("on", k < n); });
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };
    co.addEventListener("click", function (e) { var b = e.target.closest("[data-next]"); if (b) goStep(+b.dataset.next); });
    co.addEventListener("change", function (e) { if (e.target.name === "city") $$("[data-city]").forEach(function (c) { c.textContent = e.target.value; }); });
  }
  var place = $("[data-place-order]");
  if (place) place.addEventListener("click", function () { store.set("ard-last-order", cart); });
  if ($("[data-confirm]")) {
    var last = store.get("ard-last-order", null);
    if (last) { cart = last; renderCart(); cart = []; store.set("ard-cart", []); store.set("ard-last-order", null); $$(".cart-count").forEach(function (c) { c.textContent = 0; }); }
  }

  /* ───── Compte : onglets ───── */
  function showTab(name) {
    $$("[data-tab]").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === name); });
    $$("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  }
  $$("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tab); }); });
  $$("[data-tab-go]").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tabGo); toast("Connexion simulée dans la maquette"); }); });

  /* ───── FAQ : recherche ───── */
  var fs = $("#faq-search");
  if (fs) fs.addEventListener("input", function () {
    var q = fs.value.trim().toLowerCase();
    $$(".faq-item").forEach(function (d) { d.hidden = q && d.textContent.toLowerCase().indexOf(q) === -1; });
  });

  /* ───── Footer : accordéons sur mobile, colonnes fixes sur desktop ───── */
  $$(".ftr-col").forEach(function (d) {
    if (mobile.matches) d.removeAttribute("open");
    d.querySelector("summary").addEventListener("click", function (e) { if (!mobile.matches) e.preventDefault(); });
  });

  window.ARD = { toast: toast };
  if (!$("[data-confirm]")) renderCart();
})();
