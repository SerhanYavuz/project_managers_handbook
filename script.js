document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.option');
    const selectionsText = document.getElementById('selections');
    const resetBtn = document.getElementById('resetBtn');
    let selectedOptions = [];

    options.forEach(option => {
        option.addEventListener('click', () => {
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
}); 