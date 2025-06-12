function initTagSystem() {
    const tagForm = document.querySelectorAll('.tag-form');

    tagForm.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fileId = this.getAttribute('data-file-id');
            const tagInput = this.querySelector('.tag-input');
            const tagValue = tagInput.value.trim();

            if (!tagValue) return;

            try {
                const response = await fetch(`/api/files/${fileId}/tags`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tag: tagValue })
                });

                if (!response.ok) {
                    throw new Error('Failed to add tag');
                }

                const data = await response.json();

                // Add tag to the UI
                const tagContainer = document.querySelector(`#tag-container-${fileId}`);
                const tagElement = document.createElement('span');
                tagElement.classList.add('badge', 'bg-secondary', 'me-1');
                tagElement.textContent = tagValue;
                tagContainer.appendChild(tagElement);

                // Clear input
                tagInput.value = '';
            } catch (error) {
                console.error(error);
                alert('Failed to add tag');
            }
        });
    });
}