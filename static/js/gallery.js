(function () {
  "use strict";

  const lightbox = document.getElementById("gallery-lightbox");
  if (!lightbox) {
    return;
  }

  const items = Array.from(document.querySelectorAll("[data-gallery-index]"));
  if (items.length === 0) {
    return;
  }

  const imageEl = lightbox.querySelector(".gallery-lightbox__image");
  const counterEl = lightbox.querySelector("[data-gallery-counter]");
  const closeBtn = lightbox.querySelector("[data-gallery-close]");
  const prevBtn = lightbox.querySelector("[data-gallery-prev]");
  const nextBtn = lightbox.querySelector("[data-gallery-next]");

  const photos = items.map(function (item) {
    const img = item.querySelector("img");
    const full = item.getAttribute("data-gallery-full");
    return {
      src: full || (img && img.getAttribute("src")) || "",
      alt: (img && img.getAttribute("alt")) || "",
    };
  });

  let currentIndex = 0;
  let lastFocused = null;

  function render(index) {
    const photo = photos[index];
    if (!photo) {
      return;
    }
    imageEl.src = photo.src;
    imageEl.alt = photo.alt;
    if (counterEl) {
      counterEl.textContent = (index + 1) + " / " + photos.length;
    }
  }

  function open(index) {
    currentIndex = ((index % photos.length) + photos.length) % photos.length;
    lastFocused = document.activeElement;
    render(currentIndex);
    lightbox.classList.remove("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function close() {
    lightbox.classList.add("hidden");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    imageEl.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function step(delta) {
    currentIndex = ((currentIndex + delta) % photos.length + photos.length) % photos.length;
    render(currentIndex);
  }

  items.forEach(function (item, index) {
    item.addEventListener("click", function () {
      open(index);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      step(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      step(1);
    });
  }

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      close();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (lightbox.classList.contains("hidden")) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });
})();
