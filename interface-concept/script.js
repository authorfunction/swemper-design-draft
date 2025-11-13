//########### COMBINED DOMCONTENTLOADED LISTENER ############

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Run Binary-Filler Code ---
    fillAllBinarySpans();
    window.addEventListener('resize', fillAllBinarySpans);

    // --- 2. Run Code for Indexing numbered-header ---
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

    // --- 3. Run Tab Interface Logic ---
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
    });
});

//########### BINARY-FILLER FUNCTIONS ############
// (These are now outside the DOMContentLoaded listener, as they are just function definitions)

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
        
        const totalCharCount = Math.floor(remainingWidth / charWidth);
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
   * (This function is unchanged)
   */
  function getCharWidth(styleSourceElement) {
    const temp = document.createElement('span');
    temp.textContent = '0';
    const style = window.getComputedStyle(styleSourceElement);
    temp.style.fontFamily = style.fontFamily;
    temp.style.fontSize = style.fontSize;
    temp.style.fontWeight = style.fontWeight;
    temp.style.letterSpacing = style.letterSpacing;
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    document.body.appendChild(temp);
    const width = temp.offsetWidth;
    document.body.removeChild(temp);
    return width;
  }