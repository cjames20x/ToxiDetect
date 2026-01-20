class HateSpeechFSM {
    constructor() {
        this.state = 'S0_Neutral';
        this.transitions = [];
        
        this.patterns = {
            slurs: ['hate', 'stupid', 'idiot', 'dumb', 'kill', 'die', 'worst', 'terrible', 'awful'],
            threats: ['threat', 'attack', 'hurt', 'destroy', 'eliminate', 'violence'],
            discrimination: ['all', 'always', 'never', 'every', 'should', 'deserve'],
            intensifiers: ['very', 'extremely', 'totally', 'completely', 'absolutely', 'really']
        };
    }

    analyze(text) {
        this.state = 'S0_Neutral';
        this.transitions = ['S0_Neutral'];
        let detectedPatterns = [];
        
        if (!text || text.trim().length === 0) {
            return {
                classification: 'NO_INPUT',
                state: 'S0_Neutral',
                confidence: 0,
                tokens: 0,
                transitionCount: 0,
                transitions: ['S0_Neutral'],
                patterns: [],
                explanation: 'No input provided. Please enter text to analyze.',
                action: 'Please enter text to analyze.',
                severity: 'none'
            };
        }

        const words = text.toLowerCase().split(/\s+/);
        let hateScore = 0;
        let transitionCount = 0;

        words.forEach((word, index) => {
            let previousState = this.state;
            
            if (this.patterns.slurs.some(slur => word.includes(slur))) {
                this.state = 'S1_Suspicious';
                hateScore += 2;
                if (previousState !== this.state) {
                    transitionCount++;
                    this.transitions.push(this.state);
                }
                detectedPatterns.push({ type: 'Offensive Language', word: word });
            }
            
            if (this.patterns.threats.some(threat => word.includes(threat))) {
                this.state = 'S3_Threatening';
                hateScore += 3;
                if (previousState !== this.state) {
                    transitionCount++;
                    this.transitions.push(this.state);
                }
                detectedPatterns.push({ type: 'Threatening Content', word: word });
            }
            
            if (this.patterns.discrimination.some(disc => word.includes(disc))) {
                if (this.state === 'S0_Neutral') {
                    this.state = 'S2_Discriminatory';
                    transitionCount++;
                    this.transitions.push(this.state);
                }
                hateScore += 1;
                detectedPatterns.push({ type: 'Discriminatory Pattern', word: word });
            }
            
            if (this.patterns.intensifiers.some(int => word.includes(int))) {
                if (this.state !== 'S0_Neutral') {
                    hateScore += 1;
                }
            }
        });

        let classification, severity, confidence;
        
        if (hateScore >= 6) {
            classification = 'SEVERE';
            severity = 'severe';
            confidence = 95;
        } else if (hateScore >= 3) {
            classification = 'UNSAFE';
            severity = 'high';
            confidence = 85;
        } else if (hateScore >= 1) {
            classification = 'WARNING';
            severity = 'medium';
            confidence = 70;
        } else {
            classification = 'SAFE';
            severity = 'none';
            confidence = 95;
            this.state = 'S0_Neutral';
        }

        let explanation, action;
        
        if (severity === 'none') {
            explanation = 'No toxic patterns were detected in the input text. The content appears to be safe.';
            action = 'No action required. Content is safe for publication.';
        } else {
            explanation = `The analysis detected ${detectedPatterns.length} potentially toxic pattern(s) in the text. The finite state machine transitioned through multiple states indicating ${severity} level content.`;
            
            if (severity === 'severe') {
                action = 'Immediate moderation required. Block content and flag for review.';
            } else if (severity === 'high') {
                action = 'Content requires manual review before publication. Consider warning the user.';
            } else {
                action = 'Monitor user activity. Content may need editing or context review.';
            }
        }

        return {
            classification,
            state: this.state,
            confidence,
            tokens: words.length,
            transitionCount,
            transitions: this.transitions,
            patterns: detectedPatterns,
            explanation,
            action,
            severity
        };
    }
}

const fsm = new HateSpeechFSM();

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
    
    charCounter.classList.remove('warning', 'limit');
    
    if (currentLength >= maxLength) {
        charCounter.classList.add('limit');
    } else if (currentLength >= maxLength * 0.9) {
        charCounter.classList.add('warning');
    }
}

textInput.addEventListener('input', updateCharCounter);

updateCharCounter();

analyzeBtn.addEventListener('click', () => {
    const inputText = textInput.value;
    
    if (!inputText || inputText.trim().length === 0) {
        alert('Please enter text to analyze');
        return;
    }
    
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = 'Analyzing...';
    analyzeBtn.disabled = true;
    
    setTimeout(() => {
        const result = fsm.analyze(inputText);
        displayResults(result);
        
        // Show output section with animation
        outputSection.classList.add('visible');
        scrollIndicator.style.display = 'flex';
        
        // Smooth scroll to output section after a short delay
        setTimeout(() => {
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Hide scroll indicator after scrolling
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 2000);
        }, 100);
        
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }, 500);
});

function displayResults(result) {
    const badge = document.getElementById('classification-badge');
    
    badge.textContent = result.classification;
    badge.className = 'classification-badge';
    
    if (result.severity === 'severe' || result.severity === 'high') {
        badge.classList.add('danger');
    } else if (result.severity === 'medium') {
        badge.classList.add('warning');
    }
    
    const classificationCard = document.querySelector('.result-card');
    const classificationIcon = classificationCard.querySelector('.info-icon');
    
    if (result.severity === 'severe' || result.severity === 'high') {
        classificationIcon.style.color = '#ef4444';
        classificationIcon.style.borderColor = '#ef4444';
    } else if (result.severity === 'medium') {
        classificationIcon.style.color = '#f59e0b';
        classificationIcon.style.borderColor = '#f59e0b';
    } else {
        classificationIcon.style.color = '#10b981';
        classificationIcon.style.borderColor = '#10b981';
    }
    
    const confidenceFill = document.getElementById('confidence-fill');
    confidenceFill.style.width = result.confidence + '%';
    document.getElementById('confidence-value').textContent = result.confidence + '%';
    
    if (result.severity === 'severe' || result.severity === 'high') {
        confidenceFill.style.background = '#ef4444';
    } else if (result.severity === 'medium') {
        confidenceFill.style.background = '#f59e0b';
    } else {
        confidenceFill.style.background = '#10b981';
    }
    
    document.getElementById('initial-state').textContent = result.transitions[0];
    document.getElementById('final-state').textContent = result.state;
    
    const transitionPath = result.transitions.join(' → ');
    document.getElementById('current-state').textContent = transitionPath;
    
    document.getElementById('tokens-count').textContent = result.tokens;
    document.getElementById('transitions-count').textContent = result.transitionCount;

    const patternsContent = document.getElementById('patterns-content');
    if (result.patterns.length === 0) {
        patternsContent.innerHTML = '<div class="pattern-message">No toxic patterns detected</div>';
    } else {
        patternsContent.innerHTML = result.patterns.map(p => {
            let labelClass = 'offensive';
            let labelText = 'OFFENSIVE LANGUAGE';
            
            if (p.type === 'Threatening Content') {
                labelClass = 'threat';
                labelText = 'THREAT';
            } else if (p.type === 'Discriminatory Pattern') {
                labelClass = 'discriminatory';
                labelText = 'DISCRIMINATORY';
            }
            
            return `<div class="pattern-item ${labelClass}">
                <div class="pattern-label">${labelText}</div>
                <div class="pattern-word">"${p.word}"</div>
            </div>`;
        }).join('');
    }
    
    document.getElementById('explanation-content').innerHTML = `
        <p class="explanation-text">${result.explanation}</p>
        <div class="recommended-action">
            <div class="action-title">RECOMMENDED ACTION</div>
            <div class="action-content">${result.action}</div>
        </div>
    `;
}

clearBtn.addEventListener('click', () => {
    textInput.value = '';
    outputSection.classList.remove('visible');
    scrollIndicator.style.display = 'none';
    updateCharCounter();
    textInput.focus();
});

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        analyzeBtn.click();
    }
});
