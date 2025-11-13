/*// --- START of canvas-dither.min.js content (pasted here) ---
Github: https://github.com/NielsLeenheer/CanvasDither
Unminiified-code: https://github.com/NielsLeenheer/CanvasDither/blob/master/src/canvas-dither.js
This code has been inlined here, because of issues with sourcing it rmeotely when using CodePen 
to develop the concept/Design. Should be changed in production.
*/
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).CanvasDither=t()}}(function(){return function(){return function t(e,a,n){function r(d,f){if(!a[d]){if(!e[d]){var i="function"==typeof require&&require;if(!f&&i)return i(d,!0);if(o)return o(d,!0);var l=new Error("Cannot find module '"+d+"'");throw l.code="MODULE_NOT_FOUND",l}var u=a[d]={exports:{}};e[d][0].call(u.exports,function(t){return r(e[d][1][t]||t)},u,u.exports,t,e,a,n)}return a[d].exports}for(var o="function"==typeof require&&require,d=0;d<n.length;d++)r(n[d]);return r}}()({1:[function(t,e,a){e.exports=new class{grayscale(t){for(let e=0;e<t.data.length;e+=4){const a=.299*t.data[e]+.587*t.data[e+1]+.114*t.data[e+2];t.data.fill(a,e,e+3)}return t}threshold(t,e){for(let a=0;a<t.data.length;a+=4){const n=.299*t.data[a]+.587*t.data[a+1]+.114*t.data[a+2]<e?0:255;t.data.fill(n,a,a+3)}return t}bayer(t,e){const a=[[15,135,45,165],[195,75,225,105],[60,180,30,150],[240,120,210,90]];for(let n=0;n<t.data.length;n+=4){const r=.299*t.data[n]+.587*t.data[n+1]+.114*t.data[n+2],o=n/4%t.width,d=Math.floor(n/4/t.width),f=Math.floor((r+a[o%4][d%4])/2)<e?0:255;t.data.fill(f,n,n+3)}return t}floydsteinberg(t){const e=t.width,a=new Uint8ClampedArray(t.width*t.height);for(let e=0,n=0;n<t.data.length;e++,n+=4)a[e]=.299*t.data[n]+.587*t.data[n+1]+.114*t.data[n+2];for(let n=0,r=0;r<t.data.length;n++,r+=4){const o=a[n]<129?0:255,d=Math.floor((a[n]-o)/16);t.data.fill(o,r,r+3),a[n+1]+=7*d,a[n+e-1]+=3*d,a[n+e]+=5*d,a[n+e+1]+=1*d}return t}atkinson(t){const e=t.width,a=new Uint8ClampedArray(t.width*t.height);for(let e=0,n=0;n<t.data.length;e++,n+=4)a[e]=.299*t.data[n]+.587*t.data[n+1]+.114*t.data[n+2];for(let n=0,r=0;r<t.data.length;n++,r+=4){const o=a[n]<129?0:255,d=Math.floor((a[n]-o)/8);t.data.fill(o,r,r+3),a[n+1]+=d,a[n+2]+=d,a[n+e-1]+=d,a[n+e]+=d,a[n+e+1]+=d,a[n+2*e]+=d}return t}}},{}]},{},[1])(1)});
// --- END of canvas-dither.min.js content ---*/

// --- SET GLOBAL VARIABLES
let currentImageIndex = -1; // initialise image index
const img = new Image();
img.crossOrigin = "Anonymous";
const DEFAULT_DITHER_COLOR = { r: 40, g: 0, b: 0 };//OR null for black; //values are good ar around 40-80.
// ---------------------

let swapTimer = null; // This will hold the ID of your setInterval
let isPaused = false; // This tracks the pause state

// --- IMAGE LIST DEFINITION ---
const imageList = [
  // unset variables fill use default values
  //{ id: 'img7', src: 'https://i.ibb.co/nNVq23mx/La-kartidningen-1967-0211.jpg', dither: 'bayer', threshold: 64, gradientParams: { topStop3: 0.35, topStop4: 0.85 } },
  
  { id: 'lung', src: 'https://i.ibb.co/4w8cj83L/helsovannen-1890-nr003-0001-stor.jpg', dither: 'atkinson',
   ditherColor: { r: 0, g: 40, b: 40 },
  },
  { id: 'baby', src: 'https://i.ibb.co/mFgmtyf2/jordemodern-1958-vol001-0465-stor.jpg',
    //gradientParams: { topStop1: 0.1, topStop2: 0.25 }
   ditherColor: { r: 0, g: 40, b: 0 },
  },
  { id: 'hand_1', src: 'https://i.ibb.co/1tzMYg1Y/svenska-lakartidningen-1956-vol003-0030-1-hires.jpg' }, // Will default to atkinson
  { id: 'hand_2', src: 'https://i.ibb.co/W4Yx9nK8/svenska-lakartidningen-1956-vol003-0030-2-hires.jpg', 
     dither: 'atkinson',
     ditherColor: { r: 0, g: 0, b: 40 },
  },
  { id: 'old_new_media', src: 'https://i.ibb.co/6JfRFHLW/svenska-lakartidningen-1975-3920-stor.jpg', dither: 'bayer',
    gradientParams: { topStop1: 0, topStop2: 0, enabled: true },
  }, //https://i.ibb.co/nNVq23mx/La-kartidningen-1967-0211.jpg //https://i.ibb.co/7JBQQgwx/La-kartidningen-1967-0211-cropped-2.webp
  { id: 'strepsils_cropped', src: 'https://i.ibb.co/84KZL1sS/La-kartidningen-1967-0211-cropped.jpg', 
    gradientParams: { topStop3: 0.35, topStop4: 0.85 }
  },
  //https://i.ibb.co/XxBdQ4Xx/La-kartidningen-1967-0333.jpg
  { id: 'touch_cropped', src: 'https://i.ibb.co/XxBdQ4Xx/La-kartidningen-1967-0333.jpg', 
     gradientParams: { topStop1: 0, topStop2: 0, enabled: true },
     ditherColor: null,
  },
  //{id: 'epidemiologi', src: 'https://i.ibb.co/dsXgmkCX/mtf-motpol-1980-vol001-0121.jpg'}, //https://i.ibb.co/dsXgmkCX/mtf-motpol-1980-vol001-0121.jpg
];

//########### DOM HOOKS/EVENTLISTENERS 
//###########
// Listen for key presses
document.addEventListener('keydown', (event) => {
  
  if (event.key === ' ' || event.key === 'Spacebar') {
    // --- PAUSE/RESUME ---
    event.preventDefault(); // Stop spacebar from scrolling
    togglePause();
  } 
   else if (event.key === 'ArrowRight') {
    // --- NEXT IMAGE ---
    event.preventDefault(); // Stop arrow from scrolling
    console.log("Next image");
    navigateForward();
    
    // If we are not paused, reset the timer
    if (!isPaused) {
      clearInterval(swapTimer);
      swapTimer = setInterval(swapImage, 5000);
    }
  } 
  else if (event.key === 'ArrowLeft') {
    // --- PREVIOUS IMAGE ---
    event.preventDefault(); // Stop arrow from scrolling
    console.log("Previous image");
    navigateBackward();
    
    // If we are not paused, reset the timer
    if (!isPaused) {
      clearInterval(swapTimer);
      swapTimer = setInterval(swapImage, 5000);
    }
  }
  
});

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('dither-background');
  const ctx = canvas.getContext('2d');
  const mainElement = document.getElementById('main');

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
  fillAllBinarySpans();
  window.addEventListener('resize', fillAllBinarySpans);

  // Run Code for Indexing numbered-header ---
  // Define the class name you want to target
  const targetClass = "numbered-header";

  // Select all elements that have this class
  const headers = document.querySelectorAll(`.${targetClass}`);

  // Loop through each element
  headers.forEach((header, index) => {
      // Create the numbered prefix (index starts at 0, so add 1)
      // Check if the header already starts with a number (to prevent re-numbering on edits)
      if (!/^\d/.test(header.textContent.trim())) {
          const prefix = `0${index + 1} `;

          // Prepend the prefix to the element's existing text content
          header.textContent = prefix + header.textContent;
      }
  });

  // DOM FUNCTION DEFINITIONS START //
  // This function now accepts a threshold argument
  function applyDither(imageData, methodName, threshold) {
    console.log("Applying dither:", methodName);
    
    // Parse the threshold value (it will be NaN if undefined or invalid)
    const customThreshold = parseInt(threshold, 10);

    switch (methodName) {
      case 'atkinson':
        return CanvasDither.atkinson(imageData);
      
      case 'bayer':
        // Use custom threshold if valid, otherwise default to 96
        const bayerValue = !isNaN(customThreshold) ? customThreshold : 96;
        console.log(`Using bayer threshold: ${bayerValue}`);
        return CanvasDither.bayer(imageData, bayerValue);
      
      case 'floydsteinberg':
        return CanvasDither.floydsteinberg(imageData);
      
      case 'threshold':
        // Use custom threshold if valid, otherwise default to 128
        const thresholdValue = !isNaN(customThreshold) ? customThreshold : 128;
        console.log(`Using threshold: ${thresholdValue}`);
        return CanvasDither.threshold(imageData, thresholdValue);
      
      default:
        // Default to atkinson if the name is unknown
        console.warn(`Unknown dither method: '${methodName}'. Defaulting to atkinson.`);
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
    const bgColor = '#f5f4f2';
    const defaults = {
      enabled: true,
      topStop1: 0.02,
      topStop2: 0.15,
      topStop3: 0.65,
      topStop4: 1.0
    };
    const params = { ...defaults, ...options };
  
    // If 'enabled' is false, stop right here.
    if (!params.enabled) {
      console.log("skipping gradient");
      return; // Do nothing
    }
    console.log("enabled applyting gradient");
    // 2. Create a linear gradient matching your CSS mask's logic
    // We fade from the background color (CSS 'transparent') 
    // to fully transparent (CSS 'black') and back.
    let gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    gradient.addColorStop(params.topStop1, bgColor); // transparent 2% -> solid bg
    gradient.addColorStop(params.topStop2, 'rgba(245, 244, 242, 0)'); // black 15% -> transparent
    gradient.addColorStop(params.topStop3, 'rgba(245, 244, 242, 0)'); // black 65% -> transparent
    gradient.addColorStop(params.topStop4,  bgColor); // transparent 100% -> solid bg
  
    // 3. Draw the gradient over the entire image
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
  }
  
  function render() {
    const containerWidth = mainElement.clientWidth;
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
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, containerWidth, containerHeight);

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

      // --- 1. APPLY THE DITHER DYNAMICALLY ---
      const ditherMethod = img.dataset.dither || 'atkinson';
      const threshold = img.dataset.threshold; // Will be undefined if not set
      let ditheredImageData = applyDither(imageData, ditherMethod, threshold);

      // --- 2. DETERMINE THE FINAL COLOR ---
      //const specificColor = img.dataset.ditherColor;
      // Get the specific color OBJECT from the img element
      const specificColor = img.ditherColor;
      //const finalDitherColor = specificColor || DEFAULT_DITHER_COLOR;
      // Decide which color to use:
      // We check for 'undefined' because 'null' is a valid value (for black)
      const colorRgb = (specificColor !== undefined) ? specificColor : DEFAULT_DITHER_COLOR;
      //DEBUG HARD CODE RED
      //const colorRgb = {r: 255, g:0, b:0};
    

      // --- 4. MODIFY PIXEL DATA (Your new method) ---
      let data = ditheredImageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // In a 1-bit dither, R, G, and B are all the same value.
        const pixelValue = data[i]; 
        if (pixelValue === 255) { 
            // --- Pixel is WHITE: Make transparent
            data[i + 3] = 0; 
        } else if (pixelValue === 0 && colorRgb) { 
            // --- Pixel is BLACK & we have a color: Apply the color
            data[i]     = colorRgb.r; // Set Red
            data[i + 1] = colorRgb.g; // Set Green
            data[i + 2] = colorRgb.b; // Set Blue
            // Alpha (data[i + 3]) is already 255, so we leave it.
        }
        // If pixel is black and colorRgb is null,
        // it's left unchanged (stays black).
      }

      // --- 5. PUT MODIFIED DATA BACK ONCE ---
      /*THIS LINE WORKS, IMAGES RENDERS AND ARE VISIBLE // --- 4. PUT MODIFIED DATA BACK ---*/
      ctx.putImageData(ditheredImageData, 0, 0);

    // --- ADD THESE 2 LINES (End timer and log) ---
      const endTime = performance.now();
      console.log(`Image calculation (gradient, dithering, colorization) took: ${endTime - startTime} ms`)
      
    } catch (e) {
      console.error("Dithering failed! Is the 'CanvasDither' object defined?", e);
    }
  }

  /*// --- Tab Interface Logic UNUSED ON COVER PAGE ---
  // Get all tab link buttons
  const tabLinks = document.querySelectorAll('.tab-link');
  
  // Get all tab content panels
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Add a click event listener to each tab link
  tabLinks.forEach(function(link) {
      link.addEventListener('click', function() {
          
          // Get the target tab panel ID from the 'data-tab' attribute
          const tabId = link.getAttribute('data-tab');

          // --- Deactivate all tabs and panels ---
          // Remove 'active' class from all tab links
          tabLinks.forEach(function(item) {
              item.classList.remove('active');
          });

          // Remove 'active' class from all tab panels (hiding them)
          tabPanels.forEach(function(panel) {
              panel.classList.remove('active');
          });
          // ----------------------------------------

          // --- Activate the clicked tab and its panel ---
          // Add 'active' class to the clicked tab link
          link.classList.add('active');
          
          // Add 'active' class to the corresponding tab panel (showing it)
          document.getElementById(tabId).classList.add('active');
          // -----------------------------------------------
      });
  });*/
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
  const ditherMethod = imageObject.dither || 'atkinson';
  // Store the method on the img element so render() can access it
  img.dataset.dither = ditherMethod;
  // Store the threshold (will be undefined if it doesn't exist)
  img.dataset.threshold = imageObject.threshold;
  // Store the gradient params (will be undefined if not set)
  img.gradientParams = imageObject.gradientParams;
  // Store the dither color 
  img.ditherColor = imageObject.ditherColor;
  
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
  
function fillAllBinarySpans() {
    const fillers = document.querySelectorAll('.binary-filler');

    fillers.forEach(filler => {
      const precedingElement = filler.previousElementSibling;
      const container = filler.closest('#swemper');
      if (!container) return;

      // Use getBoundingClientRect for all container measurements.
      const containerRect = container.getBoundingClientRect();
      let remainingWidth = 0;
      let styleSource = null;

      // ---
      // CASE 1: The "SWEMPER" line (filler is a sibling)
      // We now use getBoundingClientRect for the most precise measurement.
      // ---
      if (precedingElement) {
        styleSource = precedingElement;
        
        // Get the precise pixel boundary of the preceding element
        const precedingRect = precedingElement.getBoundingClientRect();
        
        // Calculate remaining width by comparing right edges
        remainingWidth = containerRect.right - precedingRect.right;

        // === MODIFICATION ===
        // Use inline-block for predictable box alignment
        precedingElement.style.display = 'inline-block';
        filler.style.display = 'inline-block';
        // === END MODIFICATION ===
        
        // Fix for "raised text" alignment
        precedingElement.style.verticalAlign = 'bottom';
        filler.style.verticalAlign = 'bottom';

      // ---
      // CASE 2: The "Digitalisering" line (filler is a child)
      // This logic remains the same, as it already uses the precise Range method.
      // ---
      } else if (filler.parentElement && filler.parentElement.id === 'text') {
        styleSource = filler.parentElement;
        filler.style.verticalAlign = 'bottom'; // Align this one too
        
        const textNode = filler.previousSibling;

        if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent.length > 0) {
          const range = document.createRange();
          range.setStart(textNode, textNode.length - 1);
          range.setEnd(textNode, textNode.length);
          
          const lastCharRect = range.getBoundingClientRect();
          
          // Calculate remaining width
          remainingWidth = containerRect.right - lastCharRect.right;
        }
      }

      // ---
      // STYLING & FILLING (Same as before)
      // ---
      if (!styleSource) styleSource = filler.parentElement; // Fallback

      // Copy font metrics for width calculation
      const computedStyle = window.getComputedStyle(styleSource);
      filler.style.fontFamily = "ibm-plex-sans";
      filler.style.fontSize = computedStyle.fontSize;
      filler.style.fontWeight = 300
      filler.style.letterSpacing = computedStyle.letterSpacing;
      filler.style.lineHeight = computedStyle.lineHeight;
      
      const charWidth = getCharWidth(styleSource);
      
      // ---
      // LEAD CHAR LOGIC (The buffer is now 0)
      // ---
      const leadChar = '0';
     
      // We remove the buffer because our measurements are precise.
      // Math.floor() will prevent overflow.
      const bufferChars = 0; 

      if (charWidth > 0 && remainingWidth > 0) {
        
        const totalCharCount = Math.floor(remainingWidth / charWidth);//Math.floor(remainingWidth / charWidth);
        const binaryCharCount = totalCharCount - leadChar.length - bufferChars;

        if (binaryCharCount > 0) {
          const binaryString = generateBinary(binaryCharCount);
          filler.textContent = leadChar + binaryString;

          filler.style.whiteSpace = 'nowrap';
          filler.style.overflow = 'hidden';
          filler.style.display = 'inline-block'; 
        } else {
          filler.textContent = ''; // Clear if it won't fit
        }
      } else {
        filler.textContent = ''; // Clear if no width
      }
    });
  }

/**
 * Generates a random binary string of a given length.
 * (This function is unchanged)
 */
function generateBinary(length) {
  let binaryString = '';
  for (let i = 0; i < length; i++) {
    binaryString += Math.round(Math.random());
  }
  return binaryString;
}

/**
 * Calculates the width of a single character ('0') using a style source.
 */
function getCharWidth(styleSourceElement) {
  const temp = document.createElement('span');
  const manual_tweak = 1
  temp.textContent = '0';
  const style = window.getComputedStyle(styleSourceElement);
  temp.style.fontFamily = style.fontFamily;
  temp.style.fontSize = style.fontSize;
  temp.style.fontWeight = style.fontWeight;
  temp.style.letterSpacing = style.letterSpacing;
  temp.style.lineHeight = style.lineHeight;
  temp.style.visibility = 'hidden';
  temp.style.position = 'absolute';
  document.body.appendChild(temp);
  const width = temp.offsetWidth;
  document.body.removeChild(temp);
  return width*manual_tweak;
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
