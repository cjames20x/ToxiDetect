const API_URL = 'http://127.0.0.1:8000/analyze';

const textInput = document.getElementById('text-input');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const outputSection = document.getElementById('output-section');
const charCounter = document.getElementById('char-counter');
const scrollIndicator = document.getElementById('scroll-indicator');

function updateCharCounter() {
    const currentLength = textInput.value.length;
    const maxLength = 280;
    charCounter.textContent = `${currentLength}/${maxLength}`;
    
    charCounter.className = 'char-counter'; 
    if (currentLength >= maxLength) charCounter.classList.add('limit');
    else if (currentLength >= maxLength * 0.9) charCounter.classList.add('warning');
}

textInput.addEventListener('input', updateCharCounter);
updateCharCounter();

analyzeBtn.addEventListener('click', async () => {
    const text = textInput.value;
    
    if (!text || text.trim().length === 0) {
        alert("Please enter text to analyze");
        return;
    }
    const originalLabel = analyzeBtn.innerHTML;
    analyzeBtn.textContent = "Processing...";
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) throw new Error("Backend connection failed");
        
        const data = await response.json();
        displayResults(data);
        outputSection.classList.add('visible');
        scrollIndicator.style.display = 'flex';
        
        setTimeout(() => {
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { scrollIndicator.style.display = 'none'; }, 2000);
        }, 100);

    } catch (err) {
        console.error(err);
        alert("Could not connect to the Backend. Please ensure main.py is running!");
    } finally {
        analyzeBtn.innerHTML = originalLabel;
        analyzeBtn.disabled = false;
    }
});

function displayResults(data) {
    const badge = document.getElementById('classification-badge');
    badge.textContent = data.classification;
    badge.className = 'classification-badge';
    
    if (data.severity === 'severe') badge.classList.add('danger');
    else if (data.severity === 'unsafe') badge.classList.add('warning');
    else if (data.severity === 'warning') badge.classList.add('warning');

    const fill = document.getElementById('confidence-fill');
    fill.style.width = `${data.confidence}%`;
    document.getElementById('confidence-value').textContent = `${data.confidence}%`;

    let color = '#10b981';
    if (data.severity === 'severe') color = '#ef4444';
    else if (data.severity === 'unsafe' || data.severity === 'warning') color = '#f59e0b';
    
    fill.style.backgroundColor = color;
    document.querySelector('.result-card .info-icon').style.color = color;
    document.querySelector('.result-card .info-icon').style.borderColor = color;

    document.getElementById('initial-state').textContent = "S0_Neutral";
    document.getElementById('final-state').textContent = data.state;
    document.getElementById('current-state').textContent = data.transitions.join(' → ');
    document.getElementById('tokens-count').textContent = data.tokens;
    document.getElementById('transitions-count').textContent = data.transitionCount;

    const patternsDiv = document.getElementById('patterns-content');
    if (data.patterns.length === 0) {
        patternsDiv.innerHTML = '<div class="pattern-message">No toxic patterns detected</div>';
    } else {
        patternsDiv.innerHTML = data.patterns.map(p => {
            let styleClass = 'offensive';
            let label = 'OFFENSIVE';
            
            if (p.type === 'threat') { styleClass = 'threat'; label = 'THREAT'; }
            else if (p.type === 'group') { styleClass = 'discriminatory'; label = 'GROUP'; }
            
            return `
            <div class="pattern-item ${styleClass}">
                <div class="pattern-label">${label}</div>
                <div class="pattern-word">"${p.word}"</div>
            </div>`;
        }).join('');
    }

    document.getElementById('explanation-content').innerHTML = `
        <p class="explanation-text">${data.explanation}</p>
        <div class="recommended-action">
            <div class="action-title">RECOMMENDED ACTION</div>
            <div class="action-content">${data.action}</div>
        </div>
    `;
}

clearBtn.addEventListener('click', () => {
    textInput.value = '';
    outputSection.classList.remove('visible');
    scrollIndicator.style.display = 'none';
    updateCharCounter();
});