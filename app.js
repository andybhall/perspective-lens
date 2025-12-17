// DOM Elements
const questionInput = document.getElementById('question');
const lensButtons = document.querySelectorAll('.lens-btn');
const generateBtn = document.getElementById('generate-btn');
const responseSection = document.getElementById('response-section');
const responseLensIcon = document.getElementById('response-lens-icon');
const responseLensName = document.getElementById('response-lens-name');
const responseContent = document.getElementById('response-content');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// State
let selectedLens = null;

// Lens display info
const lensInfo = {
    libertarian: { name: 'Libertarian', icon: '🗽' },
    maga: { name: 'MAGA', icon: '🦅' },
    progressive: { name: 'Progressive', icon: '✊' },
    centerleft: { name: 'Center-Left', icon: '⚖️' },
    marxist: { name: 'Marxist', icon: '🔨' },
    centrist: { name: 'Centrist', icon: '🎯' }
};

// Event Listeners
lensButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selected class from all buttons
        lensButtons.forEach(b => b.classList.remove('selected'));
        // Add selected class to clicked button
        btn.classList.add('selected');
        // Update state
        selectedLens = btn.dataset.lens;
        // Enable generate button if question has content
        updateGenerateButton();
    });
});

questionInput.addEventListener('input', updateGenerateButton);

generateBtn.addEventListener('click', generatePerspective);

function updateGenerateButton() {
    const hasQuestion = questionInput.value.trim().length > 0;
    const hasLens = selectedLens !== null;
    generateBtn.disabled = !(hasQuestion && hasLens);
}

async function generatePerspective() {
    const question = questionInput.value.trim();
    
    if (!question || !selectedLens) return;
    
    // Show loading, hide others
    loadingEl.classList.remove('hidden');
    responseSection.classList.add('hidden');
    errorEl.classList.add('hidden');
    generateBtn.disabled = true;
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                lens: selectedLens
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display response
        const lens = lensInfo[selectedLens];
        responseLensIcon.textContent = lens.icon;
        responseLensName.textContent = `${lens.name} Perspective`;
        responseContent.textContent = data.response;
        responseSection.dataset.lens = selectedLens;
        
        responseSection.classList.remove('hidden');
        
    } catch (err) {
        console.error('Error:', err);
        errorEl.textContent = `Error: ${err.message}. Please try again.`;
        errorEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
        updateGenerateButton();
    }
}
