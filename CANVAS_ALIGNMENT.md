# Canvas Alignment Strategy

This document outlines the changes required to align the dithered canvas to the right side of the screen (e.g., 50% width), instead of the default full-width background.

## 1. CSS Changes (`index.html` or `src/input.css`)

Locate the `#dither-background` canvas element.

**Original State:**
```html
<canvas id="dither-background" class="absolute top-0 left-0 w-full h-full opacity-50 z-0"></canvas>
```

**Right-Aligned State:**
Change `left-0` to `right-0` and set a specific width (e.g., `w-1/2` for 50%).

```html
<canvas id="dither-background" class="absolute top-0 right-0 w-1/2 h-full opacity-50 z-0"></canvas>
```

## 2. JavaScript Changes (`script.js`)

You must update the `render()` function to ensure the internal canvas resolution matches its new visual width. If you rely on `mainElement.clientWidth`, the image need to be scaled incorrectly or be distorted.

**Original State:**
```javascript
function render() {
    const containerWidth = mainElement.clientWidth; // Forces full container width
    const containerHeight = mainElement.clientHeight;

    canvas.width = containerWidth;
    // ...
}
```

**Right-Aligned State:**
Use the canvas's own computed width (`clientWidth`).

```javascript
function render() {
    const containerWidth = canvas.clientWidth; // Uses the actual width set by CSS
    const containerHeight = mainElement.clientHeight;

    canvas.width = containerWidth;
    // ...
}
```

## Result
These changes will cause the dithered image to float on the right side of the screen while the text overlays (which are in a separate z-index layer) remain full-width.
