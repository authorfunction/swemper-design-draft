// --- SET GLOBAL VARIABLES
let currentImageIndex = -1; // initialise image index
const img = new Image();
//img.crossOrigin = "Anonymous";
const DEFAULT_DITHER_COLOR = { r: 40, g: 0, b: 0 }; //OR null for black; //values are good ar around 40-80.
// ---------------------

let swapTimer = null; // This will hold the ID of your setInterval
let isPaused = false; // This tracks the pause state

// --- IMAGE LIST DEFINITION ---
let imageList = [];

async function loadImages() {
  try {
    const response = await fetch("./images.yaml");
    const text = await response.text();
    imageList = jsyaml.load(text);
    console.log("Images loaded:", imageList);
  } catch (e) {
    console.error("Failed to load images.yaml", e);
  }
}

//########### DOM HOOKS/EVENTLISTENERS
//###########
// Listen for key presses
document.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Spacebar") {
    // --- PAUSE/RESUME ---
    event.preventDefault(); // Stop spacebar from scrolling
    togglePause();
  } else if (event.key === "ArrowRight") {
    // --- NEXT IMAGE ---
    event.preventDefault(); // Stop arrow from scrolling
    console.log("Next image");
    navigateForward();

    // If we are not paused, reset the timer
    if (!isPaused) {
      clearInterval(swapTimer);
      swapTimer = setInterval(swapImage, 5000);
    }
  } else if (event.key === "ArrowLeft") {
    // --- PREVIOUS IMAGE ---
    event.preventDefault(); // Stop arrow from scrolling
    console.log("Previous image");
    navigateBackward();

    // If we are not paused, reset the timer
    if (!isPaused) {
      clearInterval(swapTimer);
      swapTimer = setInterval(swapImage, 5000);
    }
  } else if (event.key === "b" || event.key === "B") {
    // --- TOGGLE BLEND MODE ---
    console.log("Toggle blend mode");
    document.getElementById("menu").classList.toggle("bg-blend");
    document.getElementById("about-text").classList.toggle("bg-blend");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("dither-background");
  const ctx = canvas.getContext("2d");
  const mainElement = document.getElementById("main");

  await loadImages();

  // Shuffle the list one time on load.
  shuffleArray(imageList);

  //render() call
  img.onload = render;

  // --- SET UP TIMERS AND OBSERVERS ---
  swapTimer = setInterval(swapImage, 5000);
  new ResizeObserver(render).observe(mainElement);
  // Start the timer!
  swapImage();

  // Run Binary-Filler Code ---
  // Relies on common.js for fillAllBinarySpans
  document.fonts.ready.then(() => {
    fillAllBinarySpans();
  });
  window.addEventListener("resize", fillAllBinarySpans);

  // Run Code for Indexing numbered-header ---
  // Relies on common.js for initNumberedHeaders
  initNumberedHeaders("numbered-header");

  // DOM FUNCTION DEFINITIONS START //
  // This function now accepts a threshold argument
  function applyDither(imageData, methodName, threshold) {
    //console.log("Applying dither:", methodName);

    // Parse the threshold value (it will be NaN if undefined or invalid)
    const customThreshold = parseInt(threshold, 10);

    switch (methodName) {
      case "atkinson":
        return CanvasDither.atkinson(imageData);

      case "bayer":
        // Use custom threshold if valid, otherwise default to 96
        const bayerValue = !isNaN(customThreshold) ? customThreshold : 96;
        //console.log(`Using bayer threshold: ${bayerValue}`);
        return CanvasDither.bayer(imageData, bayerValue);

      case "floydsteinberg":
        return CanvasDither.floydsteinberg(imageData);

      case "threshold":
        // Use custom threshold if valid, otherwise default to 128
        const thresholdValue = !isNaN(customThreshold) ? customThreshold : 128;
        //console.log(`Using threshold: ${thresholdValue}`);
        return CanvasDither.threshold(imageData, thresholdValue);

      default:
        // Default to atkinson if the name is unknown
        console.warn(
          `Unknown dither method: '${methodName}'. Defaulting to atkinson.`,
        );
        return CanvasDither.atkinson(imageData);
    }
  }

  /**
   * Draws a gradient mask onto the canvas to mimic the original CSS mask-image.
   * This fades the top and bottom of the canvas to the background color.
   * @param {CanvasRenderingContext2D} ctx - The 2D context to draw on.
   * @param {number} width - The width of the canvas.
   * @param {number} height - The height of the canvas.
   */
  function drawGradientMask(ctx, width, height, options = {}) {
    // 1. Define the background color (from your style.css)
    const bgColor = "#f5f4f2";
    const defaults = {
      enabled: true,
      topStop1: 0.02,
      topStop2: 0.15,
      topStop3: 0.65,
      topStop4: 1.0,
    };
    const params = { ...defaults, ...options };

    // If 'enabled' is false, stop right here.
    if (!params.enabled) {
      //console.log("skipping gradient");
      return; // Do nothing
    }
    //console.log("enabled applyting gradient");
    // 2. Create a linear gradient matching your CSS mask's logic
    // We fade from the background color (CSS 'transparent')
    // to fully transparent (CSS 'black') and back.
    let gradient = ctx.createLinearGradient(0, 0, 0, height);

    gradient.addColorStop(params.topStop1, bgColor); // transparent 2% -> solid bg
    gradient.addColorStop(params.topStop2, "rgba(245, 244, 242, 0)"); // black 15% -> transparent
    gradient.addColorStop(params.topStop3, "rgba(245, 244, 242, 0)"); // black 65% -> transparent
    gradient.addColorStop(params.topStop4, bgColor); // transparent 100% -> solid bg

    // 3. Draw the gradient over the entire image
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function render() {
    const containerWidth = canvas.clientWidth;
    const containerHeight = mainElement.clientHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const containerRatio = containerWidth / containerHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (imgRatio > containerRatio) {
      sHeight = img.naturalHeight;
      sWidth = img.naturalHeight * containerRatio;
      sx = (img.naturalWidth - sWidth) / 2;
    } else {
      sWidth = img.naturalWidth;
      sHeight = img.naturalWidth / containerRatio;
      sy = (img.naturalHeight - sHeight) / 2;
    }

    // --- 1. DRAW THE BASE IMAGE
    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      containerWidth,
      containerHeight,
    );

    // --- ADD THIS LINE (Start timer) ---
    const startTime = performance.now();
    // --- 2. APPLY GRADIENT MASK ---
    // This draws the gradient on top of the image before we get the pixels
    ///drawGradientMask(ctx, canvas.width, canvas.height);
    // If 'image.gradientParams' is undefined (like for 'img1'),
    // the function will use its internal defaults.
    drawGradientMask(ctx, canvas.width, canvas.height, img.gradientParams);

    try {
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Capture original data for color reference
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // --- 1. APPLY THE DITHER DYNAMICALLY ---
      const ditherMethod = img.dataset.dither || "atkinson";
      const threshold = img.dataset.threshold; // Will be undefined if not set
      let ditheredImageData = applyDither(imageData, ditherMethod, threshold);

      // --- 2. DETERMINE THE FINAL COLOR ---
      //const specificColor = img.dataset.ditherColor;
      // Get the specific color OBJECT from the img element
      const specificColor = img.ditherColor;
      //const finalDitherColor = specificColor || DEFAULT_DITHER_COLOR;
      // Decide which color to use:
      // We check for 'undefined' because 'null' is a valid value (for black)
      const colorRgb =
        specificColor !== undefined ? specificColor : DEFAULT_DITHER_COLOR;
      //DEBUG HARD CODE RED
      //const colorRgb = {r: 255, g:0, b:0};

      // --- 4. MODIFY PIXEL DATA (Your new method) ---
      let data = ditheredImageData.data;
      let sourcePixels = originalData.data;

      for (let i = 0; i < data.length; i += 4) {
        // In a 1-bit dither, R, G, and B are all the same value.
        const pixelValue = data[i];
        if (pixelValue === 255) {
          // --- Pixel is WHITE: Make transparent
          data[i + 3] = 0;
        } else if (pixelValue === 0) {
          // --- Pixel is BLACK
          if (img.useOriginalColor) {
            // --- Strategy 1: Use Original Image Color
            data[i] = sourcePixels[i];
            data[i + 1] = sourcePixels[i + 1];
            data[i + 2] = sourcePixels[i + 2];
            // Reduce alpha slightly if you want to blend, but full opacity is usually best for dither
            data[i + 3] = 255;
          } else if (colorRgb) {
            // --- Strategy 2: Use Fixed Color
            data[i] = colorRgb.r; // Set Red
            data[i + 1] = colorRgb.g; // Set Green
            data[i + 2] = colorRgb.b; // Set Blue
          }
        }
        // If pixel is black, no original color flag, and colorRgb is null/undefined,
        // it's left unchanged (stays black).
      }

      // --- 5. PUT MODIFIED DATA BACK ONCE ---
      /*THIS LINE WORKS, IMAGES RENDERS AND ARE VISIBLE // --- 4. PUT MODIFIED DATA BACK ---*/
      ctx.putImageData(ditheredImageData, 0, 0);

      // --- ADD THESE 2 LINES (End timer and log) ---
      const endTime = performance.now();
      //console.log(`Image calculation (gradient, dithering, colorization) took: ${endTime - startTime} ms`);
    } catch (e) {
      console.error(
        "Dithering failed! Is the 'CanvasDither' object defined?",
        e,
      );
    }
  }
});
//< END OF DOM HOOKS

//########### HELPER FUNCTIONS DEFINED OUTSIDE DOM-HOOK
//###########
/**
 * Loads all media properties from imageList
 * based on the current global 'currentImageIndex'.
 */
function loadCurrentMedia() {
  // 1. Get the image object using the global index
  const imageObject = imageList[currentImageIndex];

  // 2. Load all data onto the img element
  const ditherMethod = imageObject.dither || "atkinson";
  // Store the method on the img element so render() can access it
  img.dataset.dither = ditherMethod;
  // Store the threshold (will be undefined if it doesn't exist)
  img.dataset.threshold = imageObject.threshold;
  // Store the gradient params (will be undefined if not set)
  img.gradientParams = imageObject.gradientParams;
  // Store the dither color
  img.ditherColor = imageObject.ditherColor;
  // Store the original color flag
  img.useOriginalColor = imageObject.useOriginalColor;

  // 3. Set the src to trigger the load/render
  img.src = imageObject.src;
}

function swapImage() {
  // 1. Move to the next index
  currentImageIndex++;

  // 2. If we're at the end, reshuffle and reset
  if (currentImageIndex >= imageList.length) {
    console.log("Reshuffling image list.");
    shuffleArray(imageList);
    currentImageIndex = 0;
  }

  // 3. Call the master loader function
  loadCurrentMedia();
}

/**
 * Toggles the automatic image swapping on or off.
 */
function togglePause() {
  isPaused = !isPaused; // Flip the pause state

  if (isPaused) {
    // --- PAUSE THE TIMER ---
    clearInterval(swapTimer); // Stop the interval
    console.log("Image swapping paused.");
    // You could also show a "paused" icon on the screen here
  } else {
    // --- RESUME THE TIMER ---
    console.log("Image swapping resumed.");
    swapImage(); // Swap an image immediately
    swapTimer = setInterval(swapImage, 5000); // Restart the interval
  }
}

/**
 * Manually steps to the next image in the list.
 */
function navigateForward() {
  currentImageIndex++;
  // Loop back to the start if we go past the end
  if (currentImageIndex >= imageList.length) {
    currentImageIndex = 0;
  }
  loadCurrentMedia();
}

/**
 * Manually steps to the previous image in the list.
 */
function navigateBackward() {
  currentImageIndex--;
  // Loop to the end if we go past the beginning
  if (currentImageIndex < 0) {
    currentImageIndex = imageList.length - 1;
  }
  loadCurrentMedia();
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to be shuffled.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
}
