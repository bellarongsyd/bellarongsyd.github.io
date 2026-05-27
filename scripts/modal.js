const modal = document.getElementById("myModal");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
const closeButton = document.querySelector(".close");
const prevButton = document.querySelector(".modal-prev");
const nextButton = document.querySelector(".modal-next");
const galleryTabs = document.querySelectorAll(".age-tab");
const albums = document.querySelectorAll(".album-card");
const journeyCard = document.getElementById("journey-card");
const journeyTimelineElement = document.getElementById("journey-timeline");
const unlockForm = document.getElementById("unlock-form");
const letterVault = document.getElementById("letter-vault");
const letterForm = document.getElementById("letter-form");
const lettersList = document.getElementById("letters-list");
const mapTokenCard = document.getElementById("map-token-card");
const fallbackMap = document.getElementById("fallback-map");
const mediaGate = document.getElementById("media-gate");
const mediaGateForm = document.getElementById("media-gate-form");
const mediaGateHint = document.getElementById("media-gate-hint");
const privateMediaSections = document.querySelectorAll("[data-private-media]");

const mapboxToken = window.BELLA_MAPBOX_TOKEN || "";

const journeyStories = {
  sydney: {
    date: "18 Feb 2023",
    title: "Sydney, Australia",
    body: "Where Bella's first chapter began under southern skies and Jacaranda stories.",
    coordinates: [151.2093, -33.8688],
    zoom: 7.8
  },
  china2023: {
    date: "2023",
    title: "China",
    body: "Bella's first trip to family roots, familiar voices, and stories across China.",
    coordinates: [116.4074, 39.9042],
    zoom: 4.2
  },
  newzealand: {
    date: "May 2024",
    title: "South Island, New Zealand",
    body: "Mountain roads, clear lakes, and Bella's southern island adventure.",
    coordinates: [170.5, -44.0],
    zoom: 5.5
  },
  singapore: {
    date: "June 2025",
    title: "Singapore",
    body: "A warm city stop with gardens, food, family time, and tropical nights.",
    coordinates: [103.8198, 1.3521],
    zoom: 9.4
  },
  suzhou: {
    date: "2026",
    title: "Suzhou, China",
    body: "Canals, gardens, and soft Jiangnan days in Bella's 2026 China chapter.",
    coordinates: [120.5853, 31.2989],
    zoom: 8.8
  },
  xian: {
    date: "2026",
    title: "Xi'an, China",
    body: "Ancient city walls, long history, and a big chapter in Bella's China journey.",
    coordinates: [108.9398, 34.3416],
    zoom: 8.5
  },
  sichuan: {
    date: "2026",
    title: "Sichuan, China",
    body: "Mountains, spice, family meals, and western China memories.",
    coordinates: [104.0668, 30.5728],
    zoom: 7.3
  },
  guangzhou: {
    date: "2026",
    title: "Guangzhou, China",
    body: "A southern China stop with food, family, and busy city energy.",
    coordinates: [113.2644, 23.1291],
    zoom: 8.5
  }
};

const journeyTimeline = [
  { date: "2023", place: "china2023", title: "China" },
  { date: "May 2024", place: "newzealand", title: "South Island, New Zealand" },
  { date: "June 2025", place: "singapore", title: "Singapore" },
  { date: "2026", place: "suzhou", title: "Suzhou" },
  { date: "2026", place: "xian", title: "Xi'an" },
  { date: "2026", place: "sichuan", title: "Sichuan" },
  { date: "2026", place: "guangzhou", title: "Guangzhou" }
];

const storageKey = "bella-tree-hole-letters";
const familyKey = "jacaranda";
const privateMediaKey = familyKey;
const privateMediaSessionKey = "bella-private-media-unlocked";
let activeImageIndex = 0;
let touchStartX = 0;
let touchStartY = 0;

function getVisibleGalleryImages() {
  return Array.from(document.querySelectorAll(".album-card:not(.is-hidden) .image"));
}

function showImageAt(index) {
  const images = getVisibleGalleryImages();
  if (images.length === 0) return;

  activeImageIndex = (index + images.length) % images.length;
  const image = images[activeImageIndex];
  modalImg.src = image.src;
  modalImg.alt = image.alt;
  captionText.textContent = `${image.alt} (${activeImageIndex + 1} of ${images.length})`;
}

function openModal(image) {
  const images = getVisibleGalleryImages();
  const imageIndex = images.indexOf(image);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  showImageAt(imageIndex >= 0 ? imageIndex : 0);
}

function showNextImage() {
  showImageAt(activeImageIndex + 1);
}

function showPreviousImage() {
  showImageAt(activeImageIndex - 1);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalImg.removeAttribute("src");
}

function filterAlbums(filter) {
  albums.forEach((album) => {
    const shouldShow = filter === "all" || album.dataset.age === filter;
    album.classList.toggle("is-hidden", !shouldShow);
  });
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function rememberPrivateMediaUnlock() {
  try {
    sessionStorage.setItem(privateMediaSessionKey, "true");
  } catch (error) {
    // Some browser privacy modes block sessionStorage; unlocking should still work.
  }
}

function hasRememberedPrivateMediaUnlock() {
  try {
    return sessionStorage.getItem(privateMediaSessionKey) === "true";
  } catch (error) {
    return false;
  }
}

function loadPrivateGalleryImages() {
  document.querySelectorAll(".image[data-src]").forEach((image) => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  });
}

function bindGalleryImages() {
  document.querySelectorAll(".image").forEach((image) => {
    if (image.dataset.modalBound === "true") return;

    image.dataset.modalBound = "true";
    image.addEventListener("click", () => openModal(image));
  });
}

function unlockPrivateMedia(remember = true) {
  if (remember) {
    rememberPrivateMediaUnlock();
  }

  privateMediaSections.forEach((section) => {
    section.hidden = false;
  });

  if (mediaGate) {
    mediaGate.hidden = true;
  }

  loadPrivateGalleryImages();
  bindGalleryImages();
  protectPageMedia();
  document.dispatchEvent(new CustomEvent("bella:private-media-unlocked"));
}

function initPrivateMediaGate() {
  if (hasRememberedPrivateMediaUnlock()) {
    unlockPrivateMedia(false);
    return;
  }

  privateMediaSections.forEach((section) => {
    section.hidden = true;
  });
}

function renderJourney(place) {
  const story = journeyStories[place];
  if (!story) return;

  journeyCard.innerHTML = `
    <span class="journey-date">${story.date}</span>
    <h3>${story.title}</h3>
    <p>${story.body}</p>
  `;

  document.querySelectorAll(".cartoon-marker, .map-stop, .timeline-stop").forEach((marker) => {
    marker.classList.toggle("is-active", marker.dataset.place === place);
  });
}

function renderJourneyTimeline() {
  if (!journeyTimelineElement) return;

  journeyTimelineElement.innerHTML = journeyTimeline
    .map((stop) => `
      <button class="timeline-stop" type="button" data-place="${escapeHtml(stop.place)}">
        <span>${escapeHtml(stop.date)}</span>
        <strong>${escapeHtml(stop.title)}</strong>
      </button>
    `)
    .join("");

  journeyTimelineElement.querySelectorAll(".timeline-stop").forEach((stop) => {
    stop.addEventListener("click", () => renderJourney(stop.dataset.place));
  });
}

function readLetters() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch (error) {
    return [];
  }
}

function writeLetters(letters) {
  localStorage.setItem(storageKey, JSON.stringify(letters));
}

function renderLetters() {
  const letters = readLetters();

  if (letters.length === 0) {
    lettersList.innerHTML = `
      <article class="letter-card">
        <h3>No letters tucked away yet</h3>
        <p>Write one above and it will stay in this browser.</p>
      </article>
    `;
    return;
  }

  lettersList.innerHTML = letters
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((letter) => `
      <article class="letter-card">
        <h3>${escapeHtml(letter.title)}</h3>
        <time>Open in ${escapeHtml(letter.year)}</time>
        <p>${escapeHtml(letter.body).replace(/\n/g, "<br>")}</p>
      </article>
    `)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function protectPageMedia() {
  document.querySelectorAll("img, audio, video").forEach((media) => {
    media.setAttribute("draggable", "false");
    media.addEventListener("contextmenu", (event) => event.preventDefault());
    media.addEventListener("dragstart", (event) => event.preventDefault());

    if (media instanceof HTMLAudioElement || media instanceof HTMLVideoElement) {
      media.setAttribute("controlsList", "nodownload noplaybackrate");
      media.disablePictureInPicture = true;
    }
  });
}

bindGalleryImages();
protectPageMedia();
initPrivateMediaGate();

closeButton.addEventListener("click", closeModal);
prevButton.addEventListener("click", showPreviousImage);
nextButton.addEventListener("click", showNextImage);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeModal();
  }

  if (event.key === "ArrowLeft") {
    showPreviousImage();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }
});

modal.addEventListener("touchstart", (event) => {
  if (!modal.classList.contains("is-open") || event.touches.length !== 1) return;

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

modal.addEventListener("touchend", (event) => {
  if (!modal.classList.contains("is-open") || event.changedTouches.length !== 1) return;

  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const isHorizontalSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;

  if (!isHorizontalSwipe) return;

  if (deltaX < 0) {
    showNextImage();
  } else {
    showPreviousImage();
  }
}, { passive: true });

galleryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    galleryTabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    filterAlbums(tab.dataset.filter);
  });
});

if (mediaGateForm) {
  mediaGateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const key = new FormData(mediaGateForm).get("media-key");

    if (normalizeKey(key) !== normalizeKey(privateMediaKey)) {
      mediaGateHint.textContent = "That password did not open the gallery and voice archive.";
      return;
    }

    unlockPrivateMedia();
  });
}

function initJourneyMap() {
  const token = mapboxToken;
  const hasToken = token && token.startsWith("pk.");

  if (!window.mapboxgl || !hasToken) {
    return;
  }

  mapTokenCard.classList.add("is-hidden");
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: "bella-map",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: [125, -8],
    zoom: 1.45,
    projection: "globe"
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

  map.on("load", () => {
    if (fallbackMap) {
      fallbackMap.classList.add("is-hidden");
    }
  });

  map.on("style.load", () => {
    map.setFog({
      color: "#fff7d7",
      "high-color": "#dff4ff",
      "horizon-blend": 0.08,
      "space-color": "#f3fbff",
      "star-intensity": 0
    });

    map.addSource("bella-route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: journeyTimeline.map((stop) => journeyStories[stop.place].coordinates)
        }
      }
    });

    map.addLayer({
      id: "bella-route-halo",
      type: "line",
      source: "bella-route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-width": 10,
        "line-opacity": 0.92
      }
    });

    map.addLayer({
      id: "bella-route",
      type: "line",
      source: "bella-route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#ff8fa3",
        "line-width": 5,
        "line-dasharray": [1.2, 1.1]
      }
    });
  });

  Object.entries(journeyStories).forEach(([place, story]) => {
    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.className = "cartoon-marker";
    markerElement.dataset.place = place;
    markerElement.textContent = story.title.split(",")[0];
    markerElement.addEventListener("click", () => {
      renderJourney(place);
      map.flyTo({ center: story.coordinates, zoom: story.zoom, speed: 0.8, curve: 1.4 });
    });

    new mapboxgl.Marker({ element: markerElement, anchor: "bottom" })
      .setLngLat(story.coordinates)
      .setPopup(new mapboxgl.Popup({ className: "cartoon-popup", offset: 28 }).setText(story.body))
      .addTo(map);
  });

  renderJourney("sydney");
}

document.querySelectorAll(".map-stop").forEach((marker) => {
  marker.addEventListener("click", () => renderJourney(marker.dataset.place));
});

renderJourneyTimeline();
renderJourney("china2023");
initJourneyMap();

unlockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const key = new FormData(unlockForm).get("tree-key");

  if (normalizeKey(key) !== normalizeKey(familyKey)) {
    unlockForm.querySelector(".hint").textContent = "That key did not open the tree hole.";
    return;
  }

  unlockForm.hidden = true;
  letterVault.hidden = false;
  renderLetters();
});

letterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.getElementById("letter-title").value.trim();
  const year = document.getElementById("open-year").value.trim();
  const body = document.getElementById("letter-body").value.trim();

  if (!title || !year || !body) return;

  const letters = readLetters();
  letters.push({ title, year, body, savedAt: new Date().toISOString() });
  writeLetters(letters);
  letterForm.reset();
  document.getElementById("open-year").value = "2033";
  renderLetters();
});
