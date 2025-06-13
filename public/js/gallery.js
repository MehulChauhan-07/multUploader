// Gallery page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterFiles);
  }

  // Initialize file type filter
  const fileTypeFilter = document.getElementById("fileTypeFilter");
  if (fileTypeFilter) {
    fileTypeFilter.addEventListener("change", filterFiles);
  }

  // Initialize sort order
  const sortOrder = document.getElementById("sortOrder");
  if (sortOrder) {
    sortOrder.addEventListener("change", filterFiles);
  }
});

// Filter and sort files
function filterFiles() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const fileType = document.getElementById("fileTypeFilter").value;
  const sortOrder = document.getElementById("sortOrder").value;
  const fileGrid = document.getElementById("fileGrid");
  const files = Array.from(fileGrid.getElementsByClassName("file-item"));

  // Filter files
  files.forEach((file) => {
    const filename = file.dataset.filename.toLowerCase();
    const filetype = file.dataset.filetype.toLowerCase();
    const matchesSearch = filename.includes(searchTerm);
    const matchesType = fileType === "all" || filetype === fileType;
    file.style.display = matchesSearch && matchesType ? "" : "none";
  });

  // Sort files
  const visibleFiles = files.filter((file) => file.style.display !== "none");
  visibleFiles.sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.dataset.uploaded) - new Date(a.dataset.uploaded);
      case "oldest":
        return new Date(a.dataset.uploaded) - new Date(b.dataset.uploaded);
      case "name-asc":
        return a.dataset.filename.localeCompare(b.dataset.filename);
      case "name-desc":
        return b.dataset.filename.localeCompare(a.dataset.filename);
      case "size-asc":
        return parseInt(a.dataset.size) - parseInt(b.dataset.size);
      case "size-desc":
        return parseInt(b.dataset.size) - parseInt(a.dataset.size);
      default:
        return 0;
    }
  });

  // Reorder files in the grid
  visibleFiles.forEach((file) => fileGrid.appendChild(file));
}

// Preview file
function previewFile(url, mimetype, filename) {
  const modal = new bootstrap.Modal(document.getElementById("previewModal"));
  const modalTitle = document.getElementById("previewModalLabel");
  const previewContent = document.getElementById("previewContent");
  const downloadBtn = document.querySelector(".download-preview-btn");

  modalTitle.textContent = filename;
  downloadBtn.href = url;
  downloadBtn.download = filename;

  // Clear previous content
  previewContent.innerHTML = "";

  // Create preview based on file type
  if (mimetype.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url;
    img.className = "img-fluid";
    img.alt = filename;
    previewContent.appendChild(img);
  } else if (mimetype.includes("pdf")) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.className = "w-100";
    iframe.style.height = "80vh";
    previewContent.appendChild(iframe);
  } else if (mimetype.includes("video")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.className = "w-100";
    previewContent.appendChild(video);
  } else if (mimetype.includes("audio")) {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    audio.className = "w-100";
    previewContent.appendChild(audio);
  } else {
    // For other file types, show a message
    previewContent.innerHTML = `
      <div class="text-center py-5">
        <i class="fas ${getFileIcon(mimetype)} fa-4x text-secondary mb-3"></i>
        <p class="mb-0">Preview not available for this file type.</p>
        <p class="text-muted">Click the download button to view the file.</p>
      </div>
    `;
  }

  modal.show();
}

// Delete file
async function deleteFile(filename) {
  if (!confirm("Are you sure you want to delete this file?")) {
    return;
  }

  showLoading("Deleting file...");

  try {
    const response = await fetch(`/api/files/${filename}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    // Remove file from gallery
    const fileElement = document.querySelector(`[data-filename="${filename}"]`);
    if (fileElement) {
      fileElement.remove();
    }

    showNotification("File deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting file:", error);
    showNotification("Failed to delete file", "error");
  } finally {
    hideLoading();
  }
}

// Move file modal
function moveFileModal(filename) {
  const modal = new bootstrap.Modal(document.getElementById("moveFileModal"));
  document.getElementById("moveFileId").value = filename;
  modal.show();
}

// Move file
async function moveFile() {
  const filename = document.getElementById("moveFileId").value;
  const folderId = document.getElementById("folderSelect").value;

  showLoading("Moving file...");

  try {
    const response = await fetch(`/api/files/${filename}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderId }),
    });

    if (!response.ok) {
      throw new Error("Failed to move file");
    }

    showNotification("File moved successfully", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("moveFileModal")
    ).hide();

    // Refresh the page to show updated file location
    window.location.reload();
  } catch (error) {
    console.error("Error moving file:", error);
    showNotification("Failed to move file", "error");
  } finally {
    hideLoading();
  }
}

// Share file
function shareFile(filename, originalname) {
  const modal = new bootstrap.Modal(document.getElementById("shareModal"));
  const shareLink = document.getElementById("shareLink");
  const baseUrl = window.location.origin;
  shareLink.value = `${baseUrl}/share/${filename}`;
  modal.show();
}

// Copy share link
function copyShareLink() {
  const shareLink = document.getElementById("shareLink");
  copyToClipboard(shareLink.value);
}

// Show tag modal
function showTagModal(filename) {
  const modal = new bootstrap.Modal(document.getElementById("tagModal"));
  document.getElementById("tagFileId").value = filename;
  loadCurrentTags(filename);
  modal.show();
}

// Load current tags
async function loadCurrentTags(filename) {
  try {
    const response = await fetch(`/api/files/${filename}/tags`);
    if (!response.ok) throw new Error("Failed to load tags");

    const data = await response.json();
    const currentTags = document.getElementById("currentTags");

    currentTags.innerHTML = data.tags
      .map(
        (tag) => `
      <span class="badge bg-primary me-2 mb-2">
        ${tag}
        <button type="button" class="btn-close btn-close-white ms-2" 
                onclick="removeTag('${filename}', '${tag}')" 
                aria-label="Remove tag"></button>
      </span>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading tags:", error);
    showNotification("Failed to load tags", "error");
  }
}

// Add tag
async function addTag() {
  const filename = document.getElementById("tagFileId").value;
  const tagInput = document.getElementById("tagInput");
  const tag = tagInput.value.trim();

  if (!tag) return;

  showLoading("Adding tag...");

  try {
    const response = await fetch(`/api/files/${filename}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      throw new Error("Failed to add tag");
    }

    tagInput.value = "";
    loadCurrentTags(filename);
    showNotification("Tag added successfully", "success");
  } catch (error) {
    console.error("Error adding tag:", error);
    showNotification("Failed to add tag", "error");
  } finally {
    hideLoading();
  }
}

// Remove tag
async function removeTag(filename, tag) {
  showLoading("Removing tag...");

  try {
    const response = await fetch(
      `/api/files/${filename}/tags/${encodeURIComponent(tag)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove tag");
    }

    loadCurrentTags(filename);
    showNotification("Tag removed successfully", "success");
  } catch (error) {
    console.error("Error removing tag:", error);
    showNotification("Failed to remove tag", "error");
  } finally {
    hideLoading();
  }
}

// Select common tag
function selectCommonTag(tag) {
  const tagInput = document.getElementById("tagInput");
  tagInput.value = tag;
}

// Save tags
function saveTags() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("tagModal")
  );
  modal.hide();
}

// Update view mode
function updateViewMode(mode) {
  const fileGrid = document.getElementById("fileGrid");
  const buttons = document.querySelectorAll(".view-toggle .btn");

  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === mode);
  });

  fileGrid.className = `row row-cols-1 ${
    mode === "grid" ? "row-cols-md-3 row-cols-lg-4" : "row-cols-md-1"
  } g-3`;
}

// Toggle file selection
function toggleFileSelection(checkbox, filename) {
  const batchActions = document.querySelector(".batch-actions");
  const selectedCount = document.querySelector(".selected-count");
  const selectedFiles = document.querySelectorAll(
    ".file-select-checkbox:checked"
  );

  selectedCount.textContent = selectedFiles.length;
  batchActions.style.display = selectedFiles.length > 0 ? "flex" : "none";
}

// Toggle all files
function toggleAllFiles(checkbox) {
  const fileCheckboxes = document.querySelectorAll(".file-select-checkbox");
  fileCheckboxes.forEach((cb) => {
    cb.checked = checkbox.checked;
  });
  toggleFileSelection(checkbox);
}

// Batch download files
async function batchDownloadFiles() {
  const selectedFiles = Array.from(
    document.querySelectorAll(".file-select-checkbox:checked")
  ).map((cb) => cb.dataset.fileId);

  if (selectedFiles.length === 0) return;

  showLoading("Preparing download...");

  try {
    const response = await fetch("/api/files/batch-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: selectedFiles }),
    });

    if (!response.ok) {
      throw new Error("Failed to prepare download");
    }

    // Create a temporary link to download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "files.zip";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showNotification("Download started", "success");
  } catch (error) {
    console.error("Error downloading files:", error);
    showNotification("Failed to download files", "error");
  } finally {
    hideLoading();
  }
}

// Batch delete files
async function batchDeleteFiles() {
  const selectedFiles = Array.from(
    document.querySelectorAll(".file-select-checkbox:checked")
  ).map((cb) => cb.dataset.fileId);

  if (selectedFiles.length === 0) return;

  if (
    !confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)
  ) {
    return;
  }

  showLoading("Deleting files...");

  try {
    const response = await fetch("/api/files/batch-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: selectedFiles }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete files");
    }

    // Remove deleted files from the gallery
    selectedFiles.forEach((filename) => {
      const fileElement = document.querySelector(
        `[data-filename="${filename}"]`
      );
      if (fileElement) {
        fileElement.remove();
      }
    });

    // Hide batch actions
    document.querySelector(".batch-actions").style.display = "none";
    document.getElementById("selectAll").checked = false;

    showNotification("Files deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting files:", error);
    showNotification("Failed to delete files", "error");
  } finally {
    hideLoading();
  }
}
