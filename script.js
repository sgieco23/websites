const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const year = document.querySelector("#year");
const contactForm = document.querySelector(".contact-form");
const brand = document.querySelector(".brand");
const brandMarkShell = document.querySelector(".brand-mark-shell");
const brandMarkVideo = document.querySelector(".brand-mark-video-source");
const brandMarkCanvas = document.querySelector(".brand-mark-canvas");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("This demo form is ready to be connected to your email or quote system.");
  });
}

if (brandMarkVideo && brandMarkCanvas) {
  const previewFrameTime = 0.01;
  const canvasContext = brandMarkCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  let renderFrameId = 0;

  const averageBackgroundColor = (pixels, width, height) => {
    const samplePoints = [
      [10, 10],
      [width - 10, 10],
      [10, height - 10],
      [width - 10, height - 10],
    ];
    let red = 0;
    let green = 0;
    let blue = 0;

    samplePoints.forEach(([x, y]) => {
      const safeX = Math.max(0, Math.min(width - 1, x));
      const safeY = Math.max(0, Math.min(height - 1, y));
      const index = (safeY * width + safeX) * 4;

      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
    });

    return {
      red: red / samplePoints.length,
      green: green / samplePoints.length,
      blue: blue / samplePoints.length,
    };
  };

  const drawProcessedFrame = () => {
    if (!canvasContext || brandMarkVideo.readyState < 2) {
      return;
    }

    const width = brandMarkCanvas.width;
    const height = brandMarkCanvas.height;

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.drawImage(brandMarkVideo, 0, 0, width, height);

    const frame = canvasContext.getImageData(0, 0, width, height);
    const pixels = frame.data;
    const background = averageBackgroundColor(pixels, width, height);
    const tolerance = 52;

    for (let index = 0; index < pixels.length; index += 4) {
      const redDiff = pixels[index] - background.red;
      const greenDiff = pixels[index + 1] - background.green;
      const blueDiff = pixels[index + 2] - background.blue;
      const distance = Math.sqrt(
        redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff
      );

      if (distance < tolerance) {
        pixels[index + 3] = 0;
      }
    }

    canvasContext.putImageData(frame, 0, 0);
  };

  const stopRendering = () => {
    if (renderFrameId) {
      window.cancelAnimationFrame(renderFrameId);
      renderFrameId = 0;
    }
  };

  const renderBrandLogoVideo = () => {
    if (!canvasContext || brandMarkVideo.paused || brandMarkVideo.ended) {
      renderFrameId = 0;
      return;
    }

    drawProcessedFrame();
    renderFrameId = window.requestAnimationFrame(renderBrandLogoVideo);
  };

  const resetBrandLogoVideo = () => {
    stopRendering();
    brandMarkVideo.pause();

    try {
      brandMarkVideo.currentTime = previewFrameTime;
    } catch {
      // Ignore seek timing errors until metadata is ready.
    }
  };

  const playBrandLogoVideo = () => {
    stopRendering();

    try {
      brandMarkVideo.currentTime = 0;
    } catch {
      // Ignore seek timing errors until metadata is ready.
    }

    const playPromise = brandMarkVideo.play();

    if (playPromise) {
      playPromise
        .then(() => {
          renderBrandLogoVideo();
        })
        .catch(() => {});
    }
  };

  brandMarkVideo.addEventListener("loadeddata", resetBrandLogoVideo);
  brandMarkVideo.addEventListener("ended", resetBrandLogoVideo);
  brandMarkVideo.addEventListener("pause", stopRendering);
  brandMarkVideo.addEventListener("seeked", () => {
    if (brandMarkVideo.paused) {
      drawProcessedFrame();
    }
  });

  if (brandMarkShell) {
    brandMarkShell.addEventListener("pointerenter", playBrandLogoVideo);
    brandMarkShell.addEventListener("pointerleave", resetBrandLogoVideo);
  }

  if (brand) {
    brand.addEventListener("focusin", playBrandLogoVideo);
    brand.addEventListener("focusout", resetBrandLogoVideo);
  }
}
