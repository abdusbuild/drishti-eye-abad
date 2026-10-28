(function () {
  var HOSPITAL_WHATSAPP = "918105852877";

  // Mobile navigation
  var header = document.querySelector(".header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");

  function setHeaderHeight() {
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);

  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header: shadow once scrolled, hide on scroll down, show on scroll up; top progress bar
  var progress = document.getElementById("progress");
  var lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    header.classList.toggle("is-hidden", y > 400 && y > lastY && !nav.classList.contains("is-open"));
    lastY = y;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  }, { passive: true });

  // Reveal on scroll. Text slides up (siblings staggered), side-by-side blocks drift in from
  // their side, icons pop, and photos wipe open from the top.
  var REVEALS = [
    [".section__head > *, .symptom-result, .chips, .tabs, .journey li, .bring, .faq__grid > *, .about__copy > *, .impact__copy > *, .program__overlay > *, .steps li, .ayushman__box > div > *, .facilities__grid > div > *, .facility-list li, .doctor, .award, .review, .gallery__item, .contact__info > *, .stat__num, .stat__label, .qa, .cta-band__inner > *, .footer__grid > *", ""],
    [".ayushman__list, .appointment", "reveal--right"],
    [".stat svg", "reveal--bubble"]
  ];
  var revealImages = document.querySelectorAll(".about__media, .program__banner, .facilities__media");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    REVEALS.forEach(function (r) {
      document.querySelectorAll(r[0]).forEach(function (el) {
        el.classList.add("reveal");
        if (r[1]) el.classList.add(r[1]);
        el.style.setProperty("--d", Math.min(Array.prototype.indexOf.call(el.parentNode.children, el), 6));
        io.observe(el);
      });
    });
    revealImages.forEach(function (el) { el.classList.add("reveal-img"); io.observe(el); });

    // Highlighted words in headings change colour as they reach the middle of the screen
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-lit"); lo.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -45% 0px" });
    document.querySelectorAll("h2 em").forEach(function (em) { lo.observe(em); });
  }

  // Smooth, weighted scrolling (like the reference site's Locomotive Scroll)
  if (window.Lenis && !reduceMotion) {
    var lenis = new Lenis({ duration: 1.15 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  }

  // Count-up for numeric stats
  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        co.unobserve(entry.target);
        var el = entry.target;
        var target = Number(el.dataset.count);
        var from = el.hasAttribute("data-plain") ? target - 40 : 0;
        var suffix = el.dataset.suffix || "";
        var start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / 1800, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          var n = Math.round(from + (target - from) * eased);
          el.textContent = (el.hasAttribute("data-plain") ? String(n) : n.toLocaleString("en-IN")) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-count]").forEach(function (el) { co.observe(el); });
  }

  // Highlight the nav link for the section in view
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a:not(.btn)"));
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) so.observe(s);
    });
  }

  // Speciality tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
      if (next === null) return;
      e.preventDefault();
      selectTab(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  // Booking buttons preselect the matching service in the form
  var SERVICE_OPTION = {
    "Cataract": "Cataract", "Glaucoma": "Glaucoma", "Retina": "Retina / Diabetic eye",
    "Squint & Kids": "Squint", "Optical": "Spectacles / Contact lens", "General": "General eye check-up"
  };
  function preselectService(key) {
    var select = document.querySelector('#apptForm select[name="service"]');
    select.value = SERVICE_OPTION[key] || "Other";
  }
  document.querySelectorAll("[data-service-book]").forEach(function (btn) {
    btn.addEventListener("click", function () { preselectService(btn.dataset.serviceBook); });
  });

  // Symptom finder
  var SYMPTOMS = {
    blurry: { tab: "cataract", title: "Cataract or a change in eye power",
      text: "Cloudy, dim or blurred vision, glare at night, or needing brighter light to read are common signs of cataract, especially after 50. Sometimes it is only a change in glasses power." },
    red: { tab: "general", title: "Eye infection, allergy or dry eye",
      text: "Redness, itching, watering or a gritty feeling are often caused by infection (conjunctivitis), allergy or dry eye. Do not use steroid eye drops without a doctor's advice." },
    diabetes: { tab: "retina", title: "Diabetic retinopathy check",
      text: "Diabetes can silently damage the retina, often before you notice any change in vision. Everyone with diabetes should have a dilated retina check at least once a year." },
    child: { tab: "squint", title: "Squint or lazy eye",
      text: "If a child's eyes do not look in the same direction, get them checked early. Squint and lazy eye respond best to treatment while the child is young." },
    pressure: { tab: "glaucoma", title: "Possible glaucoma",
      text: "Slowly shrinking side vision is a typical sign of glaucoma, which has few early symptoms. Vision lost to glaucoma cannot be restored, so testing early matters." },
    glasses: { tab: "optical", title: "Eye test for glasses or contact lenses",
      text: "Headaches while reading, difficulty seeing far or near, or squinting at screens usually mean you need an accurate eye test and new glasses." },
    injury: { tab: "cornea", title: "Eye injury or corneal problem: come quickly",
      text: "Injury from crops, dust, stone or chemicals, or sudden pain with loss of vision, needs urgent care. For chemicals, wash the eye with plenty of clean water, then come to the hospital at once." }
  };
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var result = document.getElementById("symptomResult");
  var symptomTab = "cataract";
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var d = SYMPTOMS[chip.dataset.symptom];
      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      document.getElementById("symptomTitle").textContent = d.title;
      document.getElementById("symptomText").textContent = d.text;
      symptomTab = d.tab;
      result.classList.remove("is-changing");
      void result.offsetWidth;
      result.classList.add("is-changing");
    });
  });
  document.getElementById("symptomLink").addEventListener("click", function () {
    selectTab(document.getElementById("tab-" + symptomTab));
  });
  document.getElementById("symptomBook").addEventListener("click", function () {
    var tab = document.getElementById("tab-" + symptomTab);
    preselectService(tab.textContent.trim());
  });

  // Enquire widget
  var enquire = document.getElementById("enquire");
  var enquireBtn = document.getElementById("enquireBtn");
  var enquirePanel = document.getElementById("enquirePanel");
  function setEnquire(open) {
    enquirePanel.hidden = !open;
    enquireBtn.setAttribute("aria-expanded", String(open));
    if (open) enquirePanel.querySelector(".enquire__item").focus();
  }
  enquireBtn.addEventListener("click", function () { setEnquire(enquirePanel.hidden); });
  document.getElementById("enquireClose").addEventListener("click", function () {
    setEnquire(false);
    enquireBtn.focus();
  });
  enquirePanel.querySelectorAll("[data-enquire-close]").forEach(function (a) {
    a.addEventListener("click", function () { setEnquire(false); });
  });
  document.addEventListener("click", function (e) {
    if (!enquirePanel.hidden && !enquire.contains(e.target)) setEnquire(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !enquirePanel.hidden) { setEnquire(false); enquireBtn.focus(); }
  });

  // Gallery lightbox
  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox.querySelector("img");
  document.querySelectorAll(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function () {
      lbImg.src = item.dataset.full;
      lbImg.alt = item.querySelector("img").alt;
      lightbox.hidden = false;
    });
  });
  function closeLightbox() { lightbox.hidden = true; lbImg.src = ""; }
  lightbox.addEventListener("click", function (e) { if (e.target !== lbImg) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  // Appointment form: no earlier than today
  var form = document.getElementById("apptForm");
  var errorEl = document.getElementById("formError");
  var dateInput = form.elements.date;
  var today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();

    if (!name) { errorEl.textContent = "Please enter the patient's name."; f.name.focus(); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { errorEl.textContent = "Please enter a valid 10-digit mobile number."; f.phone.focus(); return; }
    errorEl.textContent = "";

    var lines = [
      "Appointment request - Drishti Eye Care Hospital",
      "Name: " + name,
      "Mobile: " + phone
    ];
    if (f.age.value) lines.push("Age: " + f.age.value);
    lines.push("Service: " + f.service.value);
    if (f.date.value) lines.push("Preferred date: " + f.date.value.split("-").reverse().join("/"));
    lines.push("Ayushman card: " + (f.ayushman.checked ? "Yes" : "No"));
    if (f.message.value.trim()) lines.push("Problem: " + f.message.value.trim());

    window.open("https://wa.me/" + HOSPITAL_WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
