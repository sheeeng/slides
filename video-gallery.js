const REQUIRED_VIDEO_FIELDS = ["title", "provider", "url"];
const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

function getYouTubeId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

async function resolveThumbnail(url, provider) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  if (provider === "Vimeo") {
    try {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.thumbnail_url ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export function moveVideoIndex(currentIndex, offset, videoCount) {
  if (!Number.isInteger(videoCount) || videoCount < 1) {
    throw new RangeError("Video count must be a positive integer.");
  }

  return ((currentIndex + offset) % videoCount + videoCount) % videoCount;
}

export function validateVideoData(videos) {
  return (
    Array.isArray(videos) &&
    videos.length > 0 &&
    videos.every(
      (video) =>
        video &&
        typeof video === "object" &&
        REQUIRED_VIDEO_FIELDS.every(
          (field) =>
            typeof video[field] === "string" && video[field].trim().length > 0,
        ),
    )
  );
}

export function initializeVideoGallery(root) {
  if (!root) return false;

  const dataElement = root.querySelector("#video-gallery-data");
  const thumbnailLink = root.querySelector(".video-gallery__thumbnail-link");
  const thumbnailImg = root.querySelector(".video-gallery__thumbnail");
  const title = root.querySelector(".video-gallery__title");
  const providerEl = root.querySelector(".video-gallery__provider");
  const status = root.querySelector(".video-gallery__status");
  const previous = root.querySelector('[data-direction="previous"]');
  const next = root.querySelector('[data-direction="next"]');
  const buttons = [previous, next];

  const disable = () => {
    root.classList.remove("video-gallery--enhanced");
    for (const button of buttons) {
      if (button) button.disabled = true;
    }
  };

  disable();

  if (
    !dataElement ||
    !thumbnailLink ||
    !thumbnailImg ||
    !title ||
    !providerEl ||
    !status ||
    !previous ||
    !next
  ) {
    return false;
  }

  let videos;
  try {
    videos = JSON.parse(dataElement.textContent);
  } catch {
    return false;
  }

  if (!validateVideoData(videos)) return false;

  const thumbnailCache = new Map();
  let renderGeneration = 0;

  const render = (index) => {
    const generation = ++renderGeneration;
    const video = videos[index];
    thumbnailLink.href = video.url;
    thumbnailImg.alt = video.title;
    title.textContent = video.title;
    providerEl.textContent = video.provider;
    status.textContent = `${index + 1} of ${videos.length}`;

    if (thumbnailCache.has(index)) {
      thumbnailImg.src = thumbnailCache.get(index);
      return;
    }
    thumbnailImg.src = TRANSPARENT_GIF;
    resolveThumbnail(video.url, video.provider).then((url) => {
      if (url && renderGeneration === generation) {
        thumbnailCache.set(index, url);
        thumbnailImg.src = url;
      }
    });
  };

  let currentIndex = 0;
  const navigate = (offset) => () => {
    try {
      const nextIndex = moveVideoIndex(currentIndex, offset, videos.length);
      render(nextIndex);
      currentIndex = nextIndex;
    } catch {
      disable();
    }
  };
  const listeners = [
    [previous, navigate(-1)],
    [next, navigate(1)],
  ];
  const attachedListeners = [];

  try {
    for (const [button, listener] of listeners) {
      button.addEventListener("click", listener);
      attachedListeners.push([button, listener]);
    }
    render(currentIndex);
    for (const button of buttons) button.disabled = false;
    root.classList.add("video-gallery--enhanced");
    return true;
  } catch {
    for (const [button, listener] of attachedListeners) {
      button.removeEventListener("click", listener);
    }
    disable();
    return false;
  }
}

if (typeof document !== "undefined") {
  initializeVideoGallery(document.querySelector(".video-gallery"));
}
