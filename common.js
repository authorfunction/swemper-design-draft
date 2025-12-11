/**
 * Common JavaScript Utilities for Swemper Project
 */

//########### INITIALIZERS ############

/**
 * Initializes numbered headers by finding elements with the target class
 * and prepending "01 ", "02 ", etc., if not already present.
 * @param {string} targetClass - The class name to target (default: "numbered-header")
 */
function initNumberedHeaders(targetClass = "numbered-header") {
    const headers = document.querySelectorAll(`.${targetClass}`);

    headers.forEach((header, index) => {
        // Check if the header already starts with a number (to prevent re-numbering on edits)
        if (!/^\d/.test(header.textContent.trim())) {
            const prefix = `0${index + 1} `;
            // Use insertAdjacentText to modify text without destroying child elements (if any)
            header.insertAdjacentText("afterbegin", prefix);
        }
    });
}

//########### BINARY-FILLER FUNCTIONS ############

function fillAllBinarySpans() {
    const fillers = document.querySelectorAll(".binary-filler");

    fillers.forEach((filler) => {
        // 1. Identify the STYLE container (parents are usually good for font styles)
        const styleContainer = filler.parentElement;
        if (!styleContainer) return;

        // 2. Identify the LAYOUT container (closest block-like parent)
        // We walk up the DOM until we find an element that is NOT inline.
        // This allows us to fill the "line" even if wrapped in a span.
        let layoutContainer = styleContainer;
        while (layoutContainer && layoutContainer.parentElement) {
            const display = window.getComputedStyle(layoutContainer).display;
            if (display === "inline") {
                layoutContainer = layoutContainer.parentElement;
            } else {
                break;
            }
        }

        // Fallback if we somehow didn't find one (shouldn't happen in <body>)
        if (!layoutContainer) layoutContainer = styleContainer;

        // 3. Get container measurements
        const containerRect = layoutContainer.getBoundingClientRect();
        const containerStyle = window.getComputedStyle(layoutContainer);

        // We want to fill up to the right padding edge of the container
        const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
        const borderRight = parseFloat(containerStyle.borderRightWidth) || 0;
        const containerRightEdge = containerRect.right - paddingRight - borderRight;

        // 4. Determine where the "gap" starts
        let startEdge =
            containerRect.left + (parseFloat(containerStyle.paddingLeft) || 0);

        // Check previous sibling (Element)
        const prevEl = filler.previousElementSibling;

        // Check previous sibling (Text Node)
        const prevNode = filler.previousSibling;

        let styleSource = styleContainer; // Default style source

        if (prevEl) {
            // Case A: Previous Element Sibling
            const prevRect = prevEl.getBoundingClientRect();
            startEdge = prevRect.right;
            styleSource = prevEl;

            // Ensure they align nicely
            prevEl.style.display = "inline-block";
            filler.style.display = "inline-block";
            prevEl.style.verticalAlign = "bottom";
            filler.style.verticalAlign = "bottom";
        } else if (
            prevNode &&
            prevNode.nodeType === Node.TEXT_NODE &&
            prevNode.textContent.trim().length > 0
        ) {
            // Case B: Previous Text Node
            // We use a range to find exactly where the text ends
            const range = document.createRange();
            range.selectNodeContents(prevNode);
            // Collapse to end to get the rect of the last character area
            const rects = range.getClientRects();
            if (rects.length > 0) {
                const lastRect = rects[rects.length - 1]; // The very last line of text
                startEdge = lastRect.right;
            }
            styleSource = styleContainer;
            filler.style.display = "inline-block";
            filler.style.verticalAlign = "bottom";
        } else {
            // Case C: No previous content, start from container left (already set)
            filler.style.display = "inline-block";
            filler.style.verticalAlign = "bottom";
            styleSource = styleContainer;
        }

        // 4. Calculate Available Width
        const remainingWidth = containerRightEdge - startEdge - 5;

        // ---
        // STYLING & FILLING
        // ---

        // Copy font metrics for width calculation
        const computedStyle = window.getComputedStyle(styleSource);
        filler.style.fontFamily = computedStyle.fontFamily;
        filler.style.fontSize = computedStyle.fontSize;
        filler.style.fontWeight = computedStyle.fontWeight;

        // Let's stick to the previous logic of making it slightly lighter if possible, or just same.
        let targetWeight = parseInt(computedStyle.fontWeight) || 400;
        if (targetWeight > 100) targetWeight -= 100;
        filler.style.fontWeight = targetWeight;

        filler.style.letterSpacing = computedStyle.letterSpacing;
        filler.style.lineHeight = computedStyle.lineHeight;

        const charWidth = getCharWidth(styleSource);

        // ---
        // LEAD CHAR LOGIC
        // ---
        const leadChar = "0";
        const bufferChars = 0;

        if (charWidth > 0 && remainingWidth > 0) {
            // Estimate count
            const totalCharCount = Math.floor(remainingWidth / charWidth);
            const binaryCharCount = totalCharCount - leadChar.length - bufferChars;

            if (binaryCharCount > 0) {
                const binaryString = generateBinary(binaryCharCount);
                filler.textContent = leadChar + binaryString;

                filler.style.whiteSpace = "nowrap";
                filler.style.overflow = "hidden";
            } else {
                filler.textContent = "";
            }
        } else {
            filler.textContent = "";
        }
    });
}

/**
 * Generates a random binary string of a given length.
 */
function generateBinary(length) {
    let binaryString = "";
    for (let i = 0; i < length; i++) {
        binaryString += Math.round(Math.random());
    }
    return binaryString;
}

/**
 * Calculates the width of a single character ('0') using a style source.
 */
function getCharWidth(styleSourceElement) {
    const temp = document.createElement("span");
    const manual_tweak = 1;
    temp.textContent = "0";
    const style = window.getComputedStyle(styleSourceElement);
    temp.style.fontFamily = style.fontFamily;
    temp.style.fontSize = style.fontSize;
    temp.style.fontWeight = style.fontWeight;
    temp.style.letterSpacing = style.letterSpacing;
    temp.style.lineHeight = style.lineHeight;
    temp.style.visibility = "hidden";
    temp.style.position = "absolute";
    document.body.appendChild(temp);
    const width = temp.offsetWidth;
    document.body.removeChild(temp);
    return width * manual_tweak;
}
