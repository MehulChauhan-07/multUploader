// Common functionality shared across pages

// Notification system
function showNotification(message, type = "info") {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification alert alert-${type} alert-dismissible fade show`;
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  container.appendChild(notification);

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 150);
  }, 5000);
}

// Function to show/hide loading overlay with custom message
function toggleLoading(show, message = "Processing...") {
  const loadingOverlay = document.querySelector(".loading-overlay");
  const loadingMessage = document.querySelector(".loading-message");

  if (loadingMessage) {
    loadingMessage.textContent = message;
  }

  loadingOverlay.classList.toggle("active", show);
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Function to get file icon based on mime type
function getFileIcon(mimeType) {
  if (!mimeType) return "fa-file text-secondary";

  if (mimeType.startsWith("image/")) return "fa-file-image text-primary";
  if (mimeType.includes("pdf")) return "fa-file-pdf text-danger";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "fa-file-word text-primary";
  if (mimeType.includes("excel") || mimeType.includes("sheet"))
    return "fa-file-excel text-success";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "fa-file-powerpoint text-warning";
  if (mimeType.startsWith("video/")) return "fa-file-video text-info";
  if (mimeType.startsWith("audio/")) return "fa-file-audio text-secondary";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z")
  )
    return "fa-file-archive text-dark";
  if (mimeType.includes("text/")) return "fa-file-alt text-info";

  return "fa-file text-secondary";
}

// Function to get file type badge class
function getFileTypeBadgeClass(mimeType) {
  if (!mimeType) return "badge-other";

  if (mimeType.startsWith("image/")) return "badge-image";
  if (mimeType.includes("pdf")) return "badge-pdf";
  if (mimeType.includes("document") || mimeType.includes("word"))
    return "badge-doc";
  if (mimeType.startsWith("video/")) return "badge-video";
  if (mimeType.startsWith("audio/")) return "badge-audio";
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return "badge-archive";

  return "badge-other";
}

// Escape HTML function for displaying code/text securely
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    // Set initial theme
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeToggleIcon(savedTheme);

    // Toggle theme on click
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeToggleIcon(newTheme);
    });
  }

  function updateThemeToggleIcon(theme) {
    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
      icon.className = "fas fa-sun";
      themeToggle.setAttribute("title", "Switch to Light Mode");
    } else {
      icon.className = "fas fa-moon";
      themeToggle.setAttribute("title", "Switch to Dark Mode");
    }
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // ESC key closes modals
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal.show");
    modals.forEach((modal) => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    });
  }
});

// Initialize tooltips
document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});

// Main JavaScript functionality

// Show loading overlay
function showLoading(message = "Processing...") {
  const overlay = document.querySelector(".loading-overlay");
  const messageEl = overlay.querySelector(".loading-message");
  messageEl.textContent = message;
  overlay.classList.add("active");
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.querySelector(".loading-overlay");
  overlay.classList.remove("active");
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Copy text to clipboard
function copyToClipboard(text) {
  return navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("Copied to clipboard!", "success");
    })
    .catch(() => {
      showNotification("Failed to copy to clipboard", "error");
    });
}

// Handle keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + U to focus upload area
  if ((e.ctrlKey || e.metaKey) && e.key === "u") {
    e.preventDefault();
    const uploadArea = document.getElementById("uploadArea");
    if (uploadArea) {
      uploadArea.focus();
      showNotification(
        "Upload area focused. Press Enter to open file dialog.",
        "info"
      );
    }
  }

  // Ctrl/Cmd + O to open file dialog
  if ((e.ctrlKey || e.metaKey) && e.key === "o") {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  }

  // Escape to clear selection
  if (e.key === "Escape") {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = "";
      const fileList = document.getElementById("fileList");
      if (fileList) {
        fileList.innerHTML = "";
      }
      const uploadButton = document.getElementById("uploadButton");
      if (uploadButton) {
        uploadButton.disabled = true;
      }
    }
  }
});
