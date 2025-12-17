// DOM Elements
const questionInput = document.getElementById('question');
const generateBtn = document.getElementById('generate-btn');
const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const perspectiveLoadingEl = document.getElementById('perspective-loading');
const perspectiveLoadingText = document.getElementById('perspective-loading-text');
const errorEl = document.getElementById('error');

// Neutral response elements
const neutralSection = document.getElementById('neutral-section');
const neutralContent = document.getElementById('neutral-content');

// Perspective selector elements
const perspectiveSection = document.getElementById('perspective-section');
const lensButtons = document.querySelectorAll('.lens-btn');

// Perspective response elements
const perspectiveResponse = document.getElementById('perspective-response');
const responseLensIcon = document.getElementById('response-lens-icon');
const responseLensName = document.getElementById('response-lens-name');
const responseContent = document.getElementById('response-content');

// State
let currentQuestion = '';

// Lens display info
const lensInfo = {
    libertarian: { name: 'Libertarian', icon: '🗽' },
    maga: { name: 'MAGA', icon: '🦅' },
    progressive: { name: 'Progressive', icon: '✊' },
    centerleft: { name: 'Center-Left', icon: '⚖️' },
    marxist: { name: 'Marxist', icon: '🔨' }
};

// Event Listeners
questionInput.addEventListener('input', updateGenerateButton);
generateBtn.addEventListener('click', generateNeutralAnalysis);

lensButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lens = btn.dataset.lens;
        generatePerspective(lens);
    });
});

function updateGenerateButton() {
    const hasQuestion = questionInput.value.trim().length > 0;
    generateBtn.disabled = !hasQuestion;
}

async function generateNeutralAnalysis() {
    const question = questionInput.value.trim();
    if (!question) return;

    currentQuestion = question;

    // Reset UI
    neutralSection.classList.add('hidden');
    perspectiveSection.classList.add('hidden');
    perspectiveResponse.classList.add('hidden');
    errorEl.classList.add('hidden');

    // Show loading
    loadingText.textContent = 'Generating neutral analysis...';
    loadingEl.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, lens: 'neutral' })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Display neutral response
        neutralContent.textContent = data.response;
        neutralSection.classList.remove('hidden');

        // Show perspective selector
        perspectiveSection.classList.remove('hidden');

        // Clear any previous perspective selection
        lensButtons.forEach(b => b.classList.remove('selected'));

    } catch (err) {
        console.error('Error:', err);
        errorEl.textContent = `Error: ${err.message}. Please try again.`;
        errorEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
        updateGenerateButton();
    }
}

async function generatePerspective(lens) {
    if (!currentQuestion || !lens) return;

    // Update button selection
    lensButtons.forEach(b => b.classList.remove('selected'));
    const selectedBtn = document.querySelector(`.lens-btn[data-lens="${lens}"]`);
    if (selectedBtn) selectedBtn.classList.add('selected');

    // Hide previous perspective response and show loading (inline, below selector)
    perspectiveResponse.classList.add('hidden');
    errorEl.classList.add('hidden');
    perspectiveLoadingText.textContent = `Generating ${lensInfo[lens].name} perspective...`;
    perspectiveLoadingEl.classList.remove('hidden');

    // Disable lens buttons while loading
    lensButtons.forEach(b => b.disabled = true);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: currentQuestion, lens })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Display perspective response
        const info = lensInfo[lens];
        responseLensIcon.textContent = info.icon;
        responseLensName.textContent = `${info.name} Perspective`;
        responseContent.textContent = data.response;
        perspectiveResponse.dataset.lens = lens;
        perspectiveResponse.classList.remove('hidden');

        // Scroll to the perspective response
        perspectiveResponse.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        console.error('Error:', err);
        errorEl.textContent = `Error: ${err.message}. Please try again.`;
        errorEl.classList.remove('hidden');
    } finally {
        perspectiveLoadingEl.classList.add('hidden');
        lensButtons.forEach(b => b.disabled = false);
    }
}
