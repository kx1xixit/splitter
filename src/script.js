// Initialize Icons
lucide.createIcons();

// --- TAB MANAGEMENT ---
function switchTab(tab) {
  const splitView = document.getElementById("view-split");
  const combineView = document.getElementById("view-combine");
  const splitTab = document.getElementById("tab-split");
  const combineTab = document.getElementById("tab-combine");

  if (tab === "split") {
    splitView.classList.remove("hidden");
    setTimeout(() => splitView.classList.remove("opacity-0"), 10); // Fade in
    combineView.classList.add("opacity-0");
    setTimeout(() => combineView.classList.add("hidden"), 300);

    splitTab.classList.replace("tab-inactive", "tab-active");
    combineTab.classList.replace("tab-active", "tab-inactive");
  } else {
    combineView.classList.remove("hidden");
    setTimeout(() => combineView.classList.remove("opacity-0"), 10);
    splitView.classList.add("opacity-0");
    setTimeout(() => splitView.classList.add("hidden"), 300);

    combineTab.classList.replace("tab-inactive", "tab-active");
    splitTab.classList.replace("tab-active", "tab-inactive");
  }
}

// --- SPLIT LOGIC ---
function processSplit() {
  const inputHtml = document.getElementById("split-input").value;
  if (!inputHtml.trim()) {
    showToast("Please enter HTML code first.", true);
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(inputHtml, "text/html");

  // EXTRACT CSS
  let cssContent = "/* Extracted Styles */\n\n";
  const styles = doc.querySelectorAll("style");
  styles.forEach((style) => {
    cssContent += style.innerHTML.trim() + "\n\n";
    style.remove(); // Remove tag from DOM
  });

  // EXTRACT JS
  let jsContent = "// Extracted Scripts\n\n";
  const scripts = doc.querySelectorAll("script");
  // Filter out scripts that are external (have src) as we don't want to break CDNs
  scripts.forEach((script) => {
    if (!script.hasAttribute("src")) {
      jsContent += script.innerHTML.trim() + "\n\n";
      script.remove(); // Remove tag from DOM
    }
  });

  // INJECT LINKS INTO HTML
  // Add CSS link to head
  const linkTag = doc.createElement("link");
  linkTag.rel = "stylesheet";
  linkTag.href = "style.css";
  doc.head.appendChild(linkTag);

  // Add JS script to body end
  const scriptTag = doc.createElement("script");
  scriptTag.src = "script.js";
  doc.body.appendChild(scriptTag);

  // SERIALIZE HTML
  // We use documentElement.outerHTML to get the full <html>...</html>
  let finalHtml = doc.documentElement.outerHTML;

  // Add DOCTYPE if it was likely there (DOMParser strips it usually)
  finalHtml = "<!DOCTYPE html>\n" + finalHtml;

  // OUTPUT
  document.getElementById("split-out-html").value = finalHtml;
  document.getElementById("split-out-css").value = cssContent.trim();
  document.getElementById("split-out-js").value = jsContent.trim();

  showToast("Split complete! Check the output panels.");
}

function clearSplitInput() {
  document.getElementById("split-input").value = "";
}

// --- COMBINE LOGIC ---
function processCombine() {
  let html = document.getElementById("combine-in-html").value || "";
  const css = document.getElementById("combine-in-css").value || "";
  const js = document.getElementById("combine-in-js").value || "";

  if (!html.trim()) {
    // If HTML is empty but others exist, provide basic boilerplate
    html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Combined App</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>`;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove any existing <script> elements from the input HTML to avoid
  // carrying through arbitrary executable content from the DOM text.
  const existingScripts = doc.querySelectorAll("script");
  existingScripts.forEach((node) => { node.remove(); });

  // INJECT CSS
  if (css.trim()) {
    const styleTag = doc.createElement("style");
    styleTag.textContent = "\n" + css.trim() + "\n";
    doc.head.appendChild(styleTag);
  }

  // INJECT JS
  if (js.trim()) {
    const scriptTag = doc.createElement("script");
    // Mark this script so that only explicitly provided JS is preserved.
    scriptTag.setAttribute("data-combined-js", "true");
    scriptTag.textContent = "\n" + js.trim() + "\n";
    doc.body.appendChild(scriptTag);
  }

  // CLEANUP LINKS (Optional: Remove existing refs to style.css or script.js to avoid 404s)
  // This is a heuristic: if we are combining, we assume we are replacing external files.
  const links = doc.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((l) => {
    if (l.getAttribute("href") === "style.css") l.remove();
  });
  const scripts = doc.querySelectorAll("script[src]");
  scripts.forEach((s) => {
    if (s.getAttribute("src") === "script.js") s.remove();
  });

  // SERIALIZE
  let finalHtml = doc.documentElement.outerHTML;
  finalHtml = "<!DOCTYPE html>\n" + finalHtml;

  document.getElementById("combine-out").value = finalHtml;
  showToast("Combine complete!");
}

function clearField(id) {
  document.getElementById(id).value = "";
}

// --- UTILS ---

function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  el.select();
  document.execCommand("copy"); // Legacy but works widely in iframes vs navigator.clipboard

  // Deselect
  window.getSelection().removeAllRanges();
  showToast("Copied to clipboard!");
}

function downloadFile(elementId, filename, mimeType) {
  const content = document.getElementById(elementId).value;
  if (!content) {
    showToast("Nothing to download!", true);
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-message");
  const iconSuccess = document.getElementById("icon-success");
  const iconError = document.getElementById("icon-error");

  msgEl.textContent = message;

  if (isError) {
    iconSuccess.classList.add("hidden");
    iconError.classList.remove("hidden");
  } else {
    iconSuccess.classList.remove("hidden");
    iconError.classList.add("hidden");
  }

  toast.classList.remove("translate-y-24"); // Match new class

  setTimeout(() => {
    toast.classList.add("translate-y-24");
  }, 3000);
}
