// Platform detection and GitHub release fetch for Sage desktop downloads
document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".downloadButtonsContainer");
  if (!container) return;

  // Remove any existing desktop download link
  const oldDesktop = container.querySelector(".desktopDownloadLink");
  if (oldDesktop) oldDesktop.remove();

  // Platform detection
  function getPlatform() {
    const ua = window.navigator.userAgent;
    if (/Windows NT|Win64|WOW64|Win32/.test(ua)) return "windows";
    if (/Macintosh|Mac OS X|MacPPC|MacIntel/.test(ua)) return "macos";
    return null;
  }

  // Asset mapping for Sage
  function getAssetInfo(platform, assets) {
    if (platform === "windows") {
      let exe = assets.find((a) => a.name.includes("x64-setup.exe"));
      if (!exe) exe = assets.find((a) => a.name.includes("_x64_en-US.msi"));
      if (!exe) exe = assets.find((a) => a.name.includes("arm64-setup.exe"));
      if (!exe) exe = assets.find((a) => a.name.includes("_arm64_en-US.msi"));
      return exe;
    }
    if (platform === "macos") {
      return assets.find((a) => a.name.includes("universal.dmg"));
    }
    return null;
  }

  // Helper function to create the button content
  function createStyledButton(
    linkElement,
    platform,
    textOverride = null,
    assetName = null
  ) {
    linkElement.innerHTML = "";
    linkElement.classList.add("download-button-styled");

    const iconSpan = document.createElement("span");
    iconSpan.className = "platform-icons";

    let labelText = "";

    if (platform === "windows") {
      const icon = document.createElement("i");
      icon.className = "fab fa-windows";
      iconSpan.appendChild(icon);
      labelText = "Download for Windows";
    } else if (platform === "macos") {
      const icon = document.createElement("i");
      icon.className = "fab fa-apple";
      iconSpan.appendChild(icon);
      labelText = "Download for macOS";
    } else {
      ["fa-windows", "fa-apple", "fa-linux"].forEach((iconClass) => {
        const icon = document.createElement("i");
        icon.className = "fab " + iconClass;
        iconSpan.appendChild(icon);
      });
      labelText = "Download for Desktop";
    }
    linkElement.appendChild(iconSpan);

    const textSpan = document.createElement("span");
    textSpan.className = "download-text";
    let visibleButtonText = "";

    if (platform === "windows" && !textOverride) {
      visibleButtonText = " Download for Windows";
    } else if (platform === "macos" && !textOverride) {
      visibleButtonText = " Download for macOS";
    } else if (textOverride) {
      visibleButtonText = textOverride;
      if (textOverride.trim().toLowerCase().startsWith("view")) {
        labelText = textOverride.trim();
      } else {
        labelText = "Download" + textOverride;
      }
    } else if (assetName) {
      visibleButtonText = " " + assetName;
      labelText = "Download " + assetName;
    } else {
      visibleButtonText = " Download for Desktop";
    }

    textSpan.textContent = visibleButtonText;
    linkElement.appendChild(textSpan);
    linkElement.setAttribute("aria-label", labelText);
  }

  // Fetch latest release from GitHub
  fetch("https://api.github.com/repos/xch-dev/sage/releases/latest")
    .then((r) => {
      if (!r.ok) {
        throw new Error(`GitHub API error: ${r.status}`);
      }
      return r.json();
    })
    .then((release) => {
      console.log("GitHub release:", release);
      const assets = release.assets || [];
      const platform = getPlatform();
      console.log("Detected platform:", platform);
      let asset = getAssetInfo(platform, assets);
      console.log("Selected asset:", asset);

      if (!asset && platform) {
        if (platform === "windows")
          asset = assets.find((a) => /\.exe$|\.msi$/.test(a.name));
        else if (platform === "macos")
          asset = assets.find((a) => /\.dmg$/.test(a.name));
        console.log("Fallback asset for detected platform:", asset);
      }

      if (asset) {
        const link = document.createElement("a");
        link.className = "desktopDownloadLink";
        link.href = asset.browser_download_url;
        link.target = "_blank";
        link.rel = "noopener";
        createStyledButton(link, platform, null, asset.name);
        container.appendChild(link);
      } else {
        console.log("Platform not detected. Using generic fallback.");
        const link = document.createElement("a");
        link.className = "desktopDownloadLink";
        link.href = "https://github.com/xch-dev/sage/releases/latest";
        link.target = "_blank";
        link.rel = "noopener";
        createStyledButton(link, "all", "Download for Desktop");
        container.appendChild(link);
      }
    })
    .catch((error) => {
      console.error("Error fetching or processing releases:", error);
      const link = document.createElement("a");
      link.className = "desktopDownloadLink";
      link.href = "https://github.com/xch-dev/sage/releases/latest";
      link.target = "_blank";
      link.rel = "noopener";
      createStyledButton(link, "all", "Download for Desktop");
      container.appendChild(link);
    });
});
