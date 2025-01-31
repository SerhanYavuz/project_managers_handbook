document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.toggle-button input');
    const selectionsText = document.getElementById('selections');
    const resetBtn = document.getElementById('resetBtn');
    const commentsList = document.getElementById('commentsList');
    const submitComment = document.getElementById('submitComment');
    const authorInput = document.getElementById('authorInput');
    const commentInput = document.getElementById('commentInput');
    let selectedOptions = [];

    options.forEach(option => {
        option.addEventListener('change', () => {
            if (option.checked) {
                if (selectedOptions.length < 2) {
                    selectedOptions.push(option.id);
                } else {
                    option.checked = false;
                    alert('En fazla 2 seçenek seçebilirsiniz!');
                    return;
                }
            } else {
                selectedOptions = selectedOptions.filter(item => item !== option.id);
            }
            updateSelectionText();
        });
    });

    resetBtn.addEventListener('click', () => {
        options.forEach(option => option.checked = false);
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
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            const data = await response.json();
            displayComments(data.comments || []);
        } catch (error) {
            console.error('Error loading comments:', error);
            // Initialize with empty array if there's an error
            displayComments([]);
        }
    }

    function displayComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="comment-card">Henüz yorum yapılmamış.</div>';
            return;
        }
        
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
            // Get current comments
            const response = await fetch('comments.json');
            const data = await response.json();
            
            // Add new comment to the beginning
            const updatedComments = [newComment, ...(data.comments || [])];
            
            // In a real application, you would send this to a server
            // For now, we'll just update the UI
            displayComments(updatedComments);

            // Clear inputs
            authorInput.value = '';
            commentInput.value = '';
            
            // Save to localStorage as a temporary solution
            localStorage.setItem('comments', JSON.stringify(updatedComments));
            
        } catch (error) {
            console.error('Error saving comment:', error);
            alert('Yorum kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });

    // Add this function to load comments from localStorage on page load
    function initializeComments() {
        const savedComments = localStorage.getItem('comments');
        if (savedComments) {
            displayComments(JSON.parse(savedComments));
        } else {
            displayComments([]);
        }
    }

    // Modify the initial load to use localStorage
    // loadComments(); // Remove or comment out this line
    initializeComments(); // Add this line instead

    // Add new code after the existing event listeners
    const jobForm = document.querySelector('.job-form');
    const jobsList = document.querySelector('.jobs-list');
    const correctGuessesList = document.getElementById('correctGuessesList');
    let jobs = [];

    document.getElementById('addJob').addEventListener('click', () => {
        const titleInput = document.getElementById('jobTitle');
        const hoursInput = document.getElementById('estimatedHours');
        
        if (!titleInput.value || !hoursInput.value) {
            alert('Lütfen iş tanımı ve tahmini süreyi doldurun!');
            return;
        }

        const newJob = {
            id: Date.now(),
            title: titleInput.value,
            actualHours: parseInt(hoursInput.value),
            currentEstimate: parseInt(hoursInput.value),
            guesses: [],
            revealed: false
        };

        jobs.push(newJob);
        renderJobs();

        // Clear inputs
        titleInput.value = '';
        hoursInput.value = '';
    });

    function renderJobs() {
        jobsList.innerHTML = '';
        jobs.forEach(job => {
            const jobElement = createJobElement(job);
            jobsList.appendChild(jobElement);
        });
    }

    function createJobElement(job) {
        const div = document.createElement('div');
        div.className = 'job-card';
        div.innerHTML = `
            <div class="job-header">
                <span class="job-title">${job.title}</span>
                <span class="job-estimate">${job.revealed ? `Gerçek süre: ${job.actualHours} saat` : 'Tahmin edilmemiş'}</span>
            </div>
            <div class="job-voting">
                <button class="vote-button vote-down" onclick="vote('${job.id}', 'down')">▼</button>
                <span class="current-estimate">${job.currentEstimate} saat</span>
                <button class="vote-button vote-up" onclick="vote('${job.id}', 'up')">▲</button>
                ${!job.revealed ? `<button onclick="revealActual('${job.id}')">Sonucu Göster</button>` : ''}
            </div>
        `;
        return div;
    }

    // Add these functions to the global scope
    window.vote = function(jobId, direction) {
        const job = jobs.find(j => j.id.toString() === jobId);
        if (!job || job.revealed) return;

        const change = direction === 'up' ? 1 : -1;
        job.currentEstimate += change;
        job.guesses.push({
            estimate: job.currentEstimate,
            timestamp: Date.now()
        });

        renderJobs();
    };

    window.revealActual = function(jobId) {
        const job = jobs.find(j => j.id.toString() === jobId);
        if (!job) return;

        job.revealed = true;
        
        // Find correct guesses
        const correctGuesses = job.guesses.filter(guess => guess.estimate === job.actualHours);
        if (correctGuesses.length > 0) {
            const li = document.createElement('li');
            li.textContent = `"${job.title}" için doğru tahmin: ${job.actualHours} saat`;
            correctGuessesList.appendChild(li);
        }

        renderJobs();
    };
}); 