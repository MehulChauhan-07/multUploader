document.addEventListener('DOMContentLoaded', function() {
    const fileItems = document.querySelectorAll('.file-item');
    const previewModal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    const previewTitle = document.getElementById('preview-title');

    fileItems.forEach(item => {
        const previewBtn = item.querySelector('.btn-preview');

        if (previewBtn) {
            previewBtn.addEventListener('click', function(e) {
                e.preventDefault();

                const fileUrl = this.getAttribute('data-url');
                const fileName = this.getAttribute('data-filename');
                const fileType = this.getAttribute('data-type');

                previewTitle.textContent = fileName;

                if (fileType.startsWith('image/')) {
                    previewContent.innerHTML = `<img src="${fileUrl}" class="img-fluid" alt="${fileName}">`;
                } else if (fileType === 'application/pdf') {
                    previewContent.innerHTML = `<iframe src="${fileUrl}" width="100%" height="500" frameborder="0"></iframe>`;
                } else {
                    previewContent.innerHTML = `<div class="alert alert-info">Preview not available for this file type</div>`;
                }

                // Show modal using Bootstrap
                const modal = new bootstrap.Modal(previewModal);
                modal.show();
            });
        }
    });
});