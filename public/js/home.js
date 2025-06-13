// File Upload Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const uploadButton = document.getElementById("uploadButton");
    const specializingUploadAreas = document.querySelectorAll('.upload-area-specialized');

    let filesToUpload = [];

    // Function to add file to list
    function addFileToList(file) {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.innerHTML = `
      <div class="file-icon">
        <i class="fas ${getFileIcon(file.type)}"></i>
      </div>
      <div class="file-info">
        <h6 class="file-name">${file.name}</h6>
        <span class="file-size">${formatFileSize(file.size)}</span>
      </div>
      <div class="file-progress">
        <div class="progress" style="height: 8px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
        </div>
        <span class="upload-progress-text">0%</span>
      </div>
      <div class="file-actions">
        <button class="btn btn-sm btn-outline-danger" onclick="removeFile('${file.name}')">
          <i class="fas fa-times"></i>
          <span class="visually-hidden">Remove ${file.name}</span>
        </button>
      </div>
    `;
        fileList.appendChild(fileItem);
    }

    // Function to remove file from list
    window.removeFile = function(fileName) {
        filesToUpload = filesToUpload.filter((file) => file.name !== fileName);
        updateFileList();
        updateUploadButton();
    };

    // Function to update file list
    function updateFileList() {
        fileList.innerHTML = "";
        filesToUpload.forEach((file) => addFileToList(file));
    }

    // Function to update upload button state
    function updateUploadButton() {
        uploadButton.disabled = filesToUpload.length === 0;

        // Update button text based on number of files
        if (filesToUpload.length === 0) {
            uploadButton.innerHTML = `<i class="fas fa-upload me-2"></i> Upload Files`;
        } else if (filesToUpload.length === 1) {
            uploadButton.innerHTML = `<i class="fas fa-upload me-2"></i> Upload 1 File`;
        } else {
            uploadButton.innerHTML = `<i class="fas fa-upload me-2"></i> Upload ${filesToUpload.length} Files`;
        }
    }

    // Function to handle file validation
    function validateFile(file) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification(
                `File ${file.name} is too large. Maximum size is 10MB.`,
                "danger"
            );
            return false;
        }

        // Check file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/zip",
            "application/x-rar-compressed",
            "application/x-7z-compressed",
        ];

        if (!allowedTypes.includes(file.type)) {
            showNotification(
                `File ${file.name} is not an accepted file type.`,
                "danger"
            );
            return false;
        }

        return true;
    }

    // Function to handle file selection
    function handleFiles(files) {
        const newFiles = Array.from(files).filter(validateFile);

        // Check for duplicate files
        newFiles.forEach(file => {
            if (!filesToUpload.some(existingFile => existingFile.name === file.name)) {
                filesToUpload.push(file);
            } else {
                showNotification(`File "${file.name}" is already added to the upload list.`, "warning");
            }
        });

        updateFileList();
        updateUploadButton();
    }

    // Function to upload files
    window.uploadFiles = async function() {
        if (filesToUpload.length === 0) return;

        toggleLoading(true, "Uploading files...");
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("files", file));

        try {
            const response = await axios.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    const progressBars = document.querySelectorAll(".progress-bar");
                    const progressTexts = document.querySelectorAll(".upload-progress-text");

                    progressBars.forEach((bar) => {
                        bar.style.width = percentCompleted + "%";
                    });

                    progressTexts.forEach((text) => {
                        text.textContent = percentCompleted + "%";
                    });
                },
            });

            if (response.data.success) {
                showNotification(`${filesToUpload.length} file(s) uploaded successfully!`, "success");
                filesToUpload = [];
                updateFileList();
                updateUploadButton();

                // Redirect to gallery after short delay
                setTimeout(() => {
                    window.location.href = '/gallery';
                }, 1500);
            }
        } catch (error) {
            showNotification(
                error.response?.data?.message || "Error uploading files",
                "danger"
            );
        } finally {
            toggleLoading(false);
        }
    };

    // Event Listeners for main upload area
    if (uploadArea) {
        uploadArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadArea.classList.add("dragover");
        });

        uploadArea.addEventListener("dragleave", (e) => {
            e.preventDefault();
            uploadArea.classList.remove("dragover");
        });

        uploadArea.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadArea.classList.remove("dragover");
            handleFiles(e.dataTransfer.files);
        });

        uploadArea.addEventListener("click", () => {
            fileInput.click();
        });
    }

    // Event Listeners for specialized upload areas
    specializingUploadAreas.forEach(area => {
        const acceptAttribute = area.dataset.accept;

        area.addEventListener("dragover", (e) => {
            e.preventDefault();
            area.classList.add("dragover");
        });

        area.addEventListener("dragleave", (e) => {
            e.preventDefault();
            area.classList.remove("dragover");
        });

        area.addEventListener("drop", (e) => {
            e.preventDefault();
            area.classList.remove("dragover");

            // Filter files by accept attribute if provided
            if (acceptAttribute) {
                const acceptedExtensions = acceptAttribute.split(',');
                const files = Array.from(e.dataTransfer.files).filter(file => {
                    if (acceptAttribute === 'image/*') return file.type.startsWith('image/');

                    const extension = '.' + file.name.split('.').pop().toLowerCase();
                    return acceptedExtensions.includes(extension);
                });

                if (files.length > 0) {
                    handleFiles(files);
                } else {
                    showNotification('No compatible files found in your drop. Please check the file types.', 'warning');
                }
            } else {
                handleFiles(e.dataTransfer.files);
            }
        });

        area.addEventListener("click", () => {
            const specializedInput = document.createElement('input');
            specializedInput.type = 'file';
            specializedInput.multiple = true;
            if (acceptAttribute) specializedInput.accept = acceptAttribute;

            specializedInput.onchange = (e) => handleFiles(e.target.files);
            specializedInput.click();
        });
    });

    // File input change event
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // Reset input to allow selecting the same file again
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+U for upload when files are selected
        if (e.ctrlKey && e.key === 'u' && !uploadButton.disabled) {
            e.preventDefault();
            uploadFiles();
        }
    });
});