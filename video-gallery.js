const REQUIRED_VIDEO_FIELDS = ["title", "provider", "meta", "url"];

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
  const visualTitle = root.querySelector(".video-gallery__visual-title");
  const visualProvider = root.querySelector(".video-gallery__visual-provider");
  const title = root.querySelector(".video-gallery__title");
  const meta = root.querySelector(".video-gallery__meta");
  const link = root.querySelector(".video-gallery__link");
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
    !visualTitle ||
    !visualProvider ||
    !title ||
    !meta ||
    !link ||
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

  let currentIndex = 0;
  const render = (index) => {
    const video = videos[index];
    visualTitle.textContent = video.title;
    visualProvider.textContent = video.provider;
    title.textContent = video.title;
    meta.textContent = video.meta;
    link.href = video.url;
    status.textContent = `${index + 1} of ${videos.length}`;
  };

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
