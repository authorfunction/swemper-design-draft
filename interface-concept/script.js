//########### INTERFACE CONCEPT SCRIPT ############

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Run Binary-Filler Code ---
  // Relies on common.js for fillAllBinarySpans
  fillAllBinarySpans();
  window.addEventListener('resize', fillAllBinarySpans);

  // --- 2. Run Code for Indexing numbered-header ---
  // Relies on common.js for initNumberedHeaders
  initNumberedHeaders("numbered-header");

  // --- 3. Run Tab Interface Logic ---
  // Get all tab link buttons
  const tabLinks = document.querySelectorAll('.tab-link');

  // Get all tab content panels
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Add a click event listener to each tab link
  tabLinks.forEach(function (link) {
    link.addEventListener('click', function () {

      // Get the target tab panel ID from the 'data-tab' attribute
      const tabId = link.getAttribute('data-tab');

      // --- Deactivate all tabs and panels ---
      // Remove 'active' class from all tab links
      tabLinks.forEach(function (item) {
        item.classList.remove('active');
      });

      // Remove 'active' class from all tab panels (hiding them)
      tabPanels.forEach(function (panel) {
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