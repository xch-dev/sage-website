// Platform detection and GitHub release fetch for Sage desktop downloads
document.addEventListener("DOMContentLoaded", function () {
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

  // Get platform icon class
  function getPlatformIcon(platform) {
    if (platform === "windows") return "fab fa-windows";
    if (platform === "macos") return "fab fa-apple";
    return "fas fa-download";
  }

  // Get platform label
  function getPlatformLabel(platform) {
    if (platform === "windows") return "Download for Windows";
    if (platform === "macos") return "Download for macOS";
    return "Download Now";
  }

  // Update hero download button
  function updateHeroButton(url, platform) {
    const heroBtn = document.querySelector(".hero-buttons .btn-primary");
    if (!heroBtn) return;

    heroBtn.href = url;

    // Update icon
    const icon = heroBtn.querySelector(".btn-icon");
    if (icon) {
      icon.className = "btn-icon " + getPlatformIcon(platform);
    }

    // Update text
    const textSpan = heroBtn.querySelector(".btn-text");
    if (textSpan) {
      textSpan.textContent = getPlatformLabel(platform);
    }
  }

  // Update header download button
  function updateHeaderButton(url, platform) {
    const headerBtn = document.querySelector(".nav-cta");
    if (!headerBtn) return;
    headerBtn.href = url;
  }

  // Update platform grid links
  function updatePlatformLinks(assets) {
    const platformItems = document.querySelectorAll(".platform-item");

    platformItems.forEach((item) => {
      const nameEl = item.querySelector(".platform-name");
      if (!nameEl) return;

      const platformName = nameEl.textContent.trim().toLowerCase();
      let asset = null;

      if (platformName === "macos") {
        asset = getAssetInfo("macos", assets);
      } else if (platformName === "windows") {
        asset = getAssetInfo("windows", assets);
      }

      if (asset) {
        item.href = asset.browser_download_url;
      }
    });
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
        updateHeroButton(asset.browser_download_url, platform);
        updateHeaderButton(asset.browser_download_url, platform);
      } else {
        console.log(
          "Platform not detected or no matching asset. Using releases page."
        );
        const releasesUrl = "https://github.com/xch-dev/sage/releases/latest";
        updateHeroButton(releasesUrl, null);
        updateHeaderButton(releasesUrl, null);
      }

      // Update platform grid links (macOS and Windows get direct downloads)
      updatePlatformLinks(assets);
    })
    .catch((error) => {
      console.error("Error fetching or processing releases:", error);
      // Keep default links on error
    });
});
