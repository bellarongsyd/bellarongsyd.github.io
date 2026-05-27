const voiceClips = [
  {
    title: "Play with Alistair",
    age: "2 years, 11 months",
    date: "2026-02-13",
    category: "siblings",
    src: "audio/2026-02-13-guangrao.m4a",
    note: "Playing together with Alistair."
  }
];

const voiceGrid = document.getElementById("voice-grid");
const voiceTabs = document.querySelectorAll(".voice-tab");
const voiceSection = document.getElementById("voice");
let activeVoiceFilter = "all";

function renderVoiceClips(filter = "all") {
  if (!voiceGrid) return;

  activeVoiceFilter = filter;
  const clips = voiceClips.filter((clip) => filter === "all" || clip.category === filter);

  if (clips.length === 0) {
    voiceGrid.innerHTML = `
      <article class="voice-empty">
        <span class="voice-icon" aria-hidden="true"></span>
        <h3>No voice clips here yet</h3>
        <p>The first recordings will appear here by age.</p>
      </article>
    `;
    return;
  }

  voiceGrid.innerHTML = clips
    .map((clip) => `
      <article class="voice-card">
        <div class="voice-card-header">
          <span>${escapeVoiceHtml(clip.age)}</span>
          <time datetime="${escapeVoiceHtml(clip.date)}">${formatVoiceDate(clip.date)}</time>
        </div>
        <h3>${escapeVoiceHtml(clip.title)}</h3>
        <p>${escapeVoiceHtml(clip.note)}</p>
        <audio controls controlslist="nodownload noplaybackrate" preload="metadata" src="${escapeVoiceHtml(clip.src)}">
          Your browser does not support the audio element.
        </audio>
      </article>
    `)
    .join("");

  protectVoiceAudio();
}

function protectVoiceAudio() {
  voiceGrid.querySelectorAll("audio").forEach((audio) => {
    audio.setAttribute("draggable", "false");
    audio.setAttribute("controlsList", "nodownload noplaybackrate");
    audio.disablePictureInPicture = true;
    audio.addEventListener("contextmenu", (event) => event.preventDefault());
    audio.addEventListener("dragstart", (event) => event.preventDefault());
  });
}

function escapeVoiceHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatVoiceDate(value) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

voiceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    voiceTabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    if (voiceSection && voiceSection.hidden) return;

    renderVoiceClips(tab.dataset.voiceFilter);
  });
});

document.addEventListener("bella:private-media-unlocked", () => {
  renderVoiceClips(activeVoiceFilter);
});

if (!voiceSection || !voiceSection.hidden) {
  renderVoiceClips();
}
