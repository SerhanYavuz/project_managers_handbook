document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.option');
    const selectionsText = document.getElementById('selections');
    const resetBtn = document.getElementById('resetBtn');
    const selectionToggle = document.getElementById('selectionToggle');
    const commentsList = document.getElementById('commentsList');
    const submitComment = document.getElementById('submitComment');
    const authorInput = document.getElementById('authorInput');
    const commentInput = document.getElementById('commentInput');
    let selectedOptions = [];
    let selectionMode = false;

    // Toggle button functionality
    selectionToggle.addEventListener('change', () => {
        selectionMode = selectionToggle.checked;
        if (!selectionMode) {
            options.forEach(option => option.classList.remove('selected'));
            selectedOptions = [];
            updateSelectionText();
        }
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            if (!selectionMode) return;

            if (option.classList.contains('selected')) {
                option.classList.remove('selected');
                selectedOptions = selectedOptions.filter(item => item !== option.id);
            } else {
                if (selectedOptions.length < 2) {
                    option.classList.add('selected');
                    selectedOptions.push(option.id);
                }
            }
            updateSelectionText();
        });
    });

    resetBtn.addEventListener('click', () => {
        options.forEach(option => option.classList.remove('selected'));
        selectedOptions = [];
        updateSelectionText();
    });

    function updateSelectionText() {
        if (selectedOptions.length === 0) {
            selectionsText.textContent = 'Henüz seçim yapılmadı';
        } else {
            const formattedSelections = selectedOptions
                .map(option => option.charAt(0).toUpperCase() + option.slice(1))
                .join(' ve ');
            selectionsText.textContent = formattedSelections;
        }
    }

    // Comments functionality
    async function loadComments() {
        try {
            const response = await fetch('comments.json');
            const data = await response.json();
            displayComments(data.comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    function displayComments(comments) {
        commentsList.innerHTML = '';
        comments.sort((a, b) => new Date(b.date) - new Date(a.date))
               .forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    }

    function createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'comment-card';
        div.innerHTML = `
            <div class="comment-header">
                <span>${comment.author}</span>
                <span>${new Date(comment.date).toLocaleDateString('tr-TR')}</span>
            </div>
            <div class="comment-selections">
                Seçimler: ${comment.selections.join(' ve ')}
            </div>
            <div class="comment-text">
                ${comment.comment}
            </div>
        `;
        return div;
    }

    submitComment.addEventListener('click', async () => {
        if (!authorInput.value || !commentInput.value || selectedOptions.length !== 2) {
            alert('Lütfen tüm alanları doldurun ve iki seçenek seçin!');
            return;
        }

        const newComment = {
            id: Date.now(),
            selections: selectedOptions.map(option => 
                option.charAt(0).toUpperCase() + option.slice(1)
            ),
            comment: commentInput.value,
            date: new Date().toISOString(),
            author: authorInput.value
        };

        try {
            // In a real application, you would send this to a server
            // For now, we'll just update the UI
            const response = await fetch('comments.json');
            const data = await response.json();
            data.comments.unshift(newComment);
            displayComments(data.comments);

            // Clear inputs
            authorInput.value = '';
            commentInput.value = '';
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    });

    // Initial load
    loadComments();
}); 