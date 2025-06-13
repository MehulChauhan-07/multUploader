// Upload page functionality

document.addEventListener("DOMContentLoaded", () => {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const uploadButton = document.getElementById("uploadButton");
  const specializedAreas = document.querySelectorAll(
    ".upload-area-specialized"
  );

  // Create hidden file inputs for specialized upload areas
  specializedAreas.forEach((area) => {
    const input = document.createElement("input");
    input.type = "file";
    input.className = "d-none";
    input.multiple = true;
    input.accept = area.dataset.accept;
    area.appendChild(input);

    // Add click handler
    area.addEventListener("click", () => {
      input.click();
    });

    // Handle file selection
    input.addEventListener("change", () => {
      handleFiles(input.files);
    });
  });

  // Handle drag and drop
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    specializedAreas.forEach((area) => {
      area.addEventListener(eventName, preventDefaults, false);
    });
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, highlight, false);
    specializedAreas.forEach((area) => {
      area.addEventListener(eventName, highlight, false);
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, unhighlight, false);
    specializedAreas.forEach((area) => {
      area.addEventListener(eventName, unhighlight, false);
    });
  });

  function highlight(e) {
    e.currentTarget.classList.add("dragover");
  }

  function unhighlight(e) {
    e.currentTarget.classList.remove("dragover");
  }

  // Handle file drop
  uploadArea.addEventListener("drop", handleDrop, false);
  specializedAreas.forEach((area) => {
    area.addEventListener("drop", handleSpecializedDrop, false);
  });

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleSpecializedDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const accept = e.currentTarget.dataset.accept;
    const filteredFiles = Array.from(files).filter((file) => {
      if (accept === "image/*") {
        return file.type.startsWith("image/");
      }
      return accept
        .split(",")
        .some((type) => file.name.toLowerCase().endsWith(type));
    });
    handleFiles(filteredFiles);
  }

  // Handle file selection
  fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files);
  });

  // Handle files
  function handleFiles(files) {
    if (files.length === 0) return;

    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        showNotification(
          `File ${file.name} is too large. Maximum size is 10MB.`,
          "error"
        );
        return;
      }
      addFileToList(file);
    });

    uploadButton.disabled = false;
  }

  // Add file to list
  function addFileToList(file) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-icon">
        <i class="fas ${getFileIcon(file.type)}"></i>
      </div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <div class="file-actions">
        <button class="btn btn-sm btn-danger" onclick="this.closest('.file-item').remove(); checkUploadButton();">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    fileList.appendChild(fileItem);
  }

  // Check if upload button should be enabled
  function checkUploadButton() {
    uploadButton.disabled = fileList.children.length === 0;
  }

  // Handle upload
  uploadButton.addEventListener("click", async () => {
    const files = fileInput.files;
    if (files.length === 0) return;

    showLoading("Uploading files...");
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      showNotification("Files uploaded successfully!", "success");
      fileList.innerHTML = "";
      fileInput.value = "";
      uploadButton.disabled = true;

      // Clear specialized inputs
      specializedAreas.forEach((area) => {
        const input = area.querySelector('input[type="file"]');
        if (input) input.value = "";
      });

      // Refresh recent uploads if they exist
      const recentUploads = document.getElementById("recentUploads");
      if (recentUploads) {
        loadRecentUploads();
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Failed to upload files. Please try again.", "error");
    } finally {
      hideLoading();
    }
  });

  // Load recent uploads
  async function loadRecentUploads() {
    const recentUploads = document.getElementById("recentUploads");
    if (!recentUploads) return;

    try {
      const response = await fetch("/api/files/recent");
      if (!response.ok) throw new Error("Failed to load recent uploads");

      const files = await response.json();
      recentUploads.innerHTML = files
        .map(
          (file) => `
        <div class="col">
          <div class="card h-100">
            ${
              file.mimetype.startsWith("image/")
                ? `<img src="/uploads/${file.filename}" class="card-img-top" alt="${file.originalname}">`
                : `<div class="card-img-top d-flex align-items-center justify-content-center bg-light">
                  <i class="fas ${getFileIcon(
                    file.mimetype
                  )} fa-3x text-secondary"></i>
                </div>`
            }
            <div class="card-body">
              <h6 class="card-title text-truncate" title="${
                file.originalname
              }">${file.originalname}</h6>
              <p class="card-text">
                <small class="text-muted">
                  ${formatFileSize(file.size)} • ${formatDate(file.uploadDate)}
                </small>
              </p>
            </div>
          </div>
        </div>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading recent uploads:", error);
      recentUploads.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted">Failed to load recent uploads</p>
        </div>
      `;
    }
  }

  // Load recent uploads on page load
  loadRecentUploads();
});
