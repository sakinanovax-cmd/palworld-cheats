(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isBlogIndex =
    document.body.classList.contains("page-blog") ||
    /blog\.html$/i.test(location.pathname) ||
    /blog\.html/i.test(location.href);

  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".blog-card");
  const PAGE_SIZE = 12;
  let visibleCount = PAGE_SIZE;
  let activeFilter = "all";

  function matchedCards() {
    return Array.prototype.filter.call(cards, function (card) {
      const category = card.getAttribute("data-category");
      return activeFilter === "all" || category === activeFilter;
    });
  }

  function renderBlogCards() {
    if (!cards.length) return;

    const matched = matchedCards();
    const limit = isBlogIndex ? visibleCount : matched.length;

    cards.forEach(function (card) {
      card.classList.add("hidden");
    });

    matched.forEach(function (card, index) {
      if (index < limit) {
        card.classList.remove("hidden");
      }
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = matched.length > limit ? "inline-flex" : "none";
      loadMoreBtn.textContent =
        "Load more articles (" + Math.min(PAGE_SIZE, matched.length - limit) + ")";
    }
  }

  let loadMoreBtn = null;

  if (isBlogIndex && cards.length > PAGE_SIZE) {
    const grid = document.querySelector(".blog-grid");
    if (grid && grid.parentElement) {
      const wrap = document.createElement("div");
      wrap.className = "blog-load-more-wrap";
      loadMoreBtn = document.createElement("button");
      loadMoreBtn.type = "button";
      loadMoreBtn.className = "btn btn-secondary blog-load-more";
      loadMoreBtn.textContent = "Load more articles";
      wrap.appendChild(loadMoreBtn);
      grid.parentElement.appendChild(wrap);

      loadMoreBtn.addEventListener("click", function () {
        visibleCount += PAGE_SIZE;
        renderBlogCards();
      });
    }
  }

  if (filterButtons.length && cards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter") || "all";
        visibleCount = PAGE_SIZE;

        filterButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        renderBlogCards();
      });
    });
  }

  if (cards.length) {
    renderBlogCards();
  }

  const video = document.getElementById("previewVideo");
  const poster = document.getElementById("previewPoster");

  if (video && poster) {
    function hidePoster() {
      poster.classList.add("hidden");
    }

    function showPoster() {
      if (video.paused && video.currentTime < 0.2) {
        poster.classList.remove("hidden");
      }
    }

    poster.addEventListener("click", function () {
      hidePoster();
      video.play().catch(function () {});
    });

    video.addEventListener("play", hidePoster);
    video.addEventListener("playing", hidePoster);
    video.addEventListener("pause", showPoster);
    video.addEventListener("ended", function () {
      video.currentTime = 0;
      poster.classList.remove("hidden");
    });
  }

  const nav = document.querySelector(".nav");
  if (nav) {
    const onScrollNav = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScrollNav();
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }

  if (!reduceMotion && !isBlogIndex) {
    const revealTargets = document.querySelectorAll(
      "section, .why-card, .price-card, .step-item, .cta-band, .video-frame, .article-hero, .req-box, .feature-group, .shot"
    );

    revealTargets.forEach(function (el, i) {
      if (el.closest(".announce") || el.closest(".reviews-marquee") || el.classList.contains("reveal")) return;
      if (el.classList.contains("reviews-section")) return;
      if (el.closest(".hero") || el.classList.contains("hero")) return;
      el.classList.add("reveal");
      el.classList.add("reveal-delay-" + ((i % 4) + 1));
    });

    document.querySelectorAll(".card").forEach(function (el, i) {
      if (el.closest(".reviews-marquee") || el.classList.contains("blog-card") || el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.classList.add("reveal-delay-" + ((i % 4) + 1));
    });

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  document.querySelectorAll("img:not([loading='lazy'])").forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.setAttribute("data-loading", "true");
    img.addEventListener("load", function () {
      img.removeAttribute("data-loading");
    }, { once: true });
    img.addEventListener("error", function () {
      img.removeAttribute("data-loading");
    }, { once: true });
  });

  const topBtn = document.createElement("button");
  topBtn.className = "back-to-top";
  topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.innerHTML = "↑";
  document.body.appendChild(topBtn);

  const onScrollTop = function () {
    topBtn.classList.toggle("is-visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScrollTop, { passive: true });
  onScrollTop();

  topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
})();
