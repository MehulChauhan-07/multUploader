function initUploadProgress() {
    const forms = document.querySelectorAll('form[enctype="multipart/form-data"]');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const xhr = new XMLHttpRequest();
            const progressBar = this.querySelector('.progress-bar');
            const progressContainer = this.querySelector('.progress-container');

            progressContainer.classList.remove('d-none');

            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = percentComplete + '%';
                    progressBar.textContent = Math.round(percentComplete) + '%';
                }
            });

            xhr.addEventListener('load', function() {
                if (xhr.status === 200) {
                    document.open();
                    document.write(xhr.responseText);
                    document.close();
                } else {
                    alert('Upload failed. Please try again.');
                    progressContainer.classList.add('d-none');
                }
            });

            xhr.open('POST', form.action, true);
            xhr.send(formData);
        });
    });
}