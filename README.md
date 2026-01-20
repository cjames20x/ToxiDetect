# ToxiDetect

A real-time, FSM-based hate speech detection system with transparent pattern recognition and interpretable results.

## Overview

ToxiDetect is a rule-based hate speech detection system that uses Finite State Machines (FSM) to analyze text content for toxic patterns. Unlike black-box machine learning models, ToxiDetect provides full transparency into its detection logic through state transitions and pattern explanations.

## Features

- **🎯 Real-time Analysis**: Instant detection with sub-second response times
- **🔍 Pattern Recognition**: Detects multiple categories of toxic content:
  - Offensive Language & Slurs
  - Threatening Content
  - Discriminatory Patterns
  - Intensifiers
- **📊 State Machine Transparency**: Full visibility into state transitions and decision-making
- **💯 Confidence Scoring**: Percentage-based confidence levels for classifications
- **🎨 Interactive UI**: Clean, modern interface with responsive design
- **📱 Mobile Friendly**: Works seamlessly on all device sizes
- **⚡ Lightweight**: Pure JavaScript with no external dependencies

## Classification Levels

ToxiDetect categorizes content into four severity levels:

1. **SAFE** - No toxic patterns detected (confidence: 95%)
2. **WARNING** - Minor concerns detected (confidence: 70%)
3. **UNSAFE** - Significant toxic content (confidence: 85%)
4. **SEVERE** - Critical violations requiring immediate action (confidence: 95%)

## State Machine Architecture

The system uses a deterministic finite state machine with the following states:

- **S0_Neutral**: Initial safe state
- **S1_Suspicious**: Offensive language detected
- **S2_Discriminatory**: Discriminatory patterns identified
- **S3_Threatening**: Threatening content found

### State Transitions

```
S0_Neutral → S1_Suspicious (offensive language)
S0_Neutral → S2_Discriminatory (discrimination patterns)
S0_Neutral/S1/S2 → S3_Threatening (threats detected)
```

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Quick Start

1. Clone or download the repository:
```bash
git clone https://github.com/yourusername/toxidetect.git
cd toxidetect
```

2. Open `index.html` in your web browser:
```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node.js http-server
npx http-server

# Or simply open the file
open index.html  # macOS
start index.html # Windows
```

3. Navigate to `http://localhost:8000` in your browser

## Usage

### Basic Usage

1. Enter text (up to 280 characters) in the input field
2. Click "Analyze" or press Enter
3. Review the analysis results:
   - Classification level and confidence
   - State transitions
   - Detected patterns
   - Recommended actions

### Example Inputs

**Safe Content:**
```
"I really enjoyed the movie last night!"
Classification: SAFE
```

**Warning Level:**
```
"This is stupid and a waste of time"
Classification: WARNING
Patterns: Offensive Language
```

**Unsafe Content:**
```
"I hate all those stupid people, they're the worst"
Classification: UNSAFE
Patterns: Offensive Language, Discriminatory Pattern
```

**Severe Content:**
```
"I will destroy and eliminate all of those terrible idiots"
Classification: SEVERE
Patterns: Threatening Content, Offensive Language, Discriminatory Pattern
```

## File Structure

```
toxidetect/
│
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── script.js           # FSM logic and UI interactions
├── logo.png           # Application logo
└── README.md          # This file
```

## Technical Details

### Detection Patterns

The system recognizes four categories of patterns:

**Slurs & Offensive Language:**
- hate, stupid, idiot, dumb, kill, die, worst, terrible, awful

**Threats:**
- threat, attack, hurt, destroy, eliminate, violence

**Discrimination:**
- all, always, never, every, should, deserve (in context)

**Intensifiers:**
- very, extremely, totally, completely, absolutely, really

### Scoring Algorithm

```javascript
Base Score Calculation:
- Slurs/Offensive: +2 points
- Threats: +3 points
- Discrimination: +1 point
- Intensifiers: +1 point (when combined with other patterns)

Classification Thresholds:
- Score ≥ 6: SEVERE (95% confidence)
- Score ≥ 3: UNSAFE (85% confidence)
- Score ≥ 1: WARNING (70% confidence)
- Score < 1: SAFE (95% confidence)
```

## Features Breakdown

### Input Section
- Character counter (0/280)
- Real-time validation
- Clear button for quick reset
- Enter key support for quick analysis

### Analysis Output
- **Classification Card**: Overall verdict with confidence bar
- **State Transitions**: FSM path visualization
- **Pattern Detection**: Detailed breakdown of detected issues
- **Explanation**: Human-readable analysis with recommended actions

### User Experience
- Smooth animations and transitions
- Scroll indicator for results
- Color-coded severity levels:
  - 🟢 Green: Safe
  - 🟡 Yellow: Warning
  - 🔴 Red: Unsafe/Severe

## Customization

### Modifying Detection Patterns

Edit the `patterns` object in `script.js`:

```javascript
this.patterns = {
    slurs: ['your', 'custom', 'words'],
    threats: ['threat', 'words'],
    discrimination: ['discriminatory', 'terms'],
    intensifiers: ['intensifying', 'words']
};
```

### Adjusting Severity Thresholds

Modify the scoring thresholds in the `analyze()` method:

```javascript
if (hateScore >= 6) {
    classification = 'SEVERE';
    confidence = 95;
} // Adjust these values as needed
```

### Styling

Customize colors and appearance in `styles.css`:

```css
:root {
    --primary-color: #1e40af;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --success-color: #10b981;
}
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Limitations

- **Rule-based Detection**: May miss context-dependent toxicity
- **Pattern Matching**: Limited to predefined keyword lists
- **No Context Analysis**: Cannot understand sarcasm or nuanced language
- **English Only**: Currently supports English language only
- **280 Character Limit**: Designed for short-form content (social media posts)

## Future Enhancements

- [ ] Multi-language support
- [ ] Machine learning integration for context awareness
- [ ] Customizable pattern dictionaries
- [ ] Export analysis reports
- [ ] Batch processing for multiple texts
- [ ] API endpoint for programmatic access
- [ ] Historical analysis tracking
- [ ] Advanced NLP features

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Use Cases

- **Social Media Moderation**: Pre-screen user posts before publication
- **Comment Systems**: Filter toxic comments in real-time
- **Content Review**: Assist human moderators with initial classification
- **Educational Tools**: Teach about hate speech patterns and detection
- **Research**: Study hate speech patterns and FSM-based detection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- FSM architecture inspired by classical automata theory
- UI design focused on transparency and interpretability

**⚠️ Disclaimer**: ToxiDetect is a rule-based tool intended to assist with content moderation. It should not be used as the sole method for detecting hate speech. Human review and context analysis are essential for accurate moderation decisions.

© 2025 | ToxiDetect
