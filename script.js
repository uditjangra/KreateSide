const menu = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.desktop-nav a');

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
});
navLinks.forEach((link) => link.addEventListener('click', () => menu?.setAttribute('aria-expanded', 'false')));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const dialog = document.querySelector('.project-dialog');
const dialogTitle = dialog?.querySelector('h2');
const dialogResult = dialog?.querySelector('.dialog-result');
const dialogArt = dialog?.querySelector('.dialog-art');
const projectDetails = {
  money: { title: '@MoneyWithSwabi', result: '7M+ Instagram views in one month', color: '#101a42' },
  tn: { title: '@TNStudioz', result: '60K+ YouTube long-form views', color: '#d6e3f8' },
  astro: { title: '@Astrology', result: '200K+ views in one month', color: '#1557ff' }
};
document.querySelectorAll('.project').forEach((project) => project.addEventListener('click', () => {
  const detail = projectDetails[project.dataset.project];
  dialogTitle.textContent = detail.title;
  dialogResult.textContent = detail.result;
  dialogArt.style.background = detail.color;
  dialog.showModal();
}));
document.querySelector('.close-dialog')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

// Paste each public YouTube or Vimeo share URL in the `url` field below.
// Optional: set `thumbnail` to a public image URL to override the automatic thumbnail.
const videoLibrary = [
  { title: 'Your first reel', client: '@Aditi', url: 'https://youtube.com/shorts/O4X7TOoLfjo?feature=share', accent: 'blue' },
  { title: 'Informational Videos', client: '@Sushant', url: 'https://youtube.com/shorts/Gb-eU4VECMI', accent: 'ink' },
  { title: 'Your hero edit', client: 'ADD A YOUTUBE OR VIMEO LINK', url: '', accent: 'pale' },
  { title: 'Campaign highlight', client: 'ADD A YOUTUBE OR VIMEO LINK', url: '', accent: 'blue' }
];
const getThumbnailUrl = (video) => {
  if (video.thumbnail) return video.thumbnail;
  try {
    const parsed = new URL(video.url);
    const isYouTube = parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
    if (isYouTube) {
      const videoId = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || (parsed.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/) || [])[1];
      return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';
    }
    const vimeoId = parsed.hostname.includes('vimeo.com') ? parsed.pathname.match(/\/(\d+)/)?.[1] : '';
    return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : '';
  } catch (_) { return ''; }
};
const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const youtubeId = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || (parsed.pathname.match(/\/shorts\/([^/?]+)/) || [])[1];
    if (youtubeId && (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be'))) return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`;
    if (parsed.hostname.includes('vimeo.com')) { const vimeoId = parsed.pathname.match(/\/(\d+)/)?.[1]; return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : ''; }
  } catch (_) { return ''; }
  return '';
};
const tray = document.querySelector('.video-tray');
const videoDialog = document.querySelector('.video-dialog');
const videoFrameWrap = videoDialog?.querySelector('.video-frame-wrap');
if (tray) {
  tray.innerHTML = videoLibrary.map((video, index) => `<article class="video-card video-card--${video.accent}"><button class="video-card-play" type="button" data-video-index="${index}" aria-label="Play ${video.title}"><span class="video-card-index">0${index + 1}</span><span class="video-play-icon">▶</span><span class="video-card-shine" aria-hidden="true"></span></button><div class="video-card-info"><p>${video.client}</p><h3>${video.title}</h3></div></article>`).join('');
  tray.querySelectorAll('[data-video-index]').forEach((button) => button.addEventListener('click', () => {
    const video = videoLibrary[button.dataset.videoIndex]; const embedUrl = getEmbedUrl(video.url); if (!embedUrl) return;
    videoFrameWrap.innerHTML = `<iframe src="${embedUrl}" title="${video.title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`; videoDialog.showModal();
  }));
}
if (tray) {
  tray.querySelectorAll('[data-video-index]').forEach((button) => {
    const thumbnailUrl = getThumbnailUrl(videoLibrary[button.dataset.videoIndex]);
    if (thumbnailUrl) button.insertAdjacentHTML('afterbegin', `<img class="video-card-thumbnail" src="${thumbnailUrl}" alt="" onerror="if(this.src.includes('maxresdefault'))this.src=this.src.replace('maxresdefault','hqdefault');else this.hidden=true">`);
  });
 }
const videoCallout = document.querySelector('.video-callout');
const videoShowcase = document.querySelector('.video-showcase');
const firstVideoButton = tray?.querySelector('[data-video-index="0"]');
if (videoCallout && videoShowcase) {
  const videoCalloutObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    videoCallout.classList.add('is-visible');
    videoCalloutObserver.disconnect();
  }, { threshold: 0.35 });
  videoCalloutObserver.observe(videoShowcase);
}
firstVideoButton?.addEventListener('click', () => videoCallout?.classList.add('is-dismissed'), { once: true });
 document.querySelector('.carousel-prev')?.addEventListener('click', () => tray?.scrollBy({ left: -tray.clientWidth * .8, behavior: 'smooth' }));
document.querySelector('.carousel-next')?.addEventListener('click', () => tray?.scrollBy({ left: tray.clientWidth * .8, behavior: 'smooth' }));
document.querySelector('.close-video-dialog')?.addEventListener('click', () => videoDialog?.close());
videoDialog?.addEventListener('close', () => { if (videoFrameWrap) videoFrameWrap.innerHTML = ''; });
videoDialog?.addEventListener('click', (event) => { if (event.target === videoDialog) videoDialog.close(); });

const projectForm = document.querySelector('#project-form');
const formStatus = projectForm?.querySelector('.form-status');
const enquiryDialog = document.querySelector('.enquiry-dialog');
const openEnquiryDialog = () => {
  if (!enquiryDialog?.open) enquiryDialog?.showModal();
  window.setTimeout(() => projectForm?.querySelector('input[name="name"]')?.focus(), 50);
};
document.querySelectorAll('.project-trigger').forEach((trigger) => trigger.addEventListener('click', openEnquiryDialog));
document.querySelector('.close-enquiry-dialog')?.addEventListener('click', () => enquiryDialog?.close());
enquiryDialog?.addEventListener('click', (event) => { if (event.target === enquiryDialog) enquiryDialog.close(); });
projectForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!projectForm.reportValidity()) return;
  const submitButton = projectForm.querySelector('[type="submit"]');
  const details = Object.fromEntries(new FormData(projectForm).entries());
  if (submitButton) submitButton.disabled = true;
  if (formStatus) { formStatus.textContent = 'Sending your project details…'; formStatus.classList.remove('is-sent'); }
  fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) })
    .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to send your enquiry.'); projectForm.reset(); if (formStatus) { formStatus.textContent = result.message; formStatus.classList.add('is-sent'); } })
    .catch((error) => { if (formStatus) formStatus.textContent = error.message; })
    .finally(() => { if (submitButton) submitButton.disabled = false; });
});
