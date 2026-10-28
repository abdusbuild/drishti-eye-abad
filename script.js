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

  // Header shadow on scroll
  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  // Reveal on scroll
  var revealTargets = document.querySelectorAll(".section__head, .symptom-result, .journey li, .bring, .faq__grid > *, .about__grid > *, .program__grid > *, .ayushman__box, .facilities__grid > *, .doctor, .award, .review, .gallery__item, .contact__grid > *");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  // Count-up for the surgeries stat
  var counter = document.querySelector("[data-count]");
  if (counter && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var target = Number(counter.dataset.count);
    var suffix = counter.dataset.suffix || "";
    var co = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      co.disconnect();
      var start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / 1600, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
    co.observe(counter);
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
