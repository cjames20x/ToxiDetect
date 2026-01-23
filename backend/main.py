from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import nltk
from nltk.stem import PorterStemmer

nltk.download('punkt', quiet=True)
stemmer = PorterStemmer()

app = FastAPI()

# FRONTEND AND BACKEND CONNECTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PostRequest(BaseModel):
    text: str

# INPUT WORDS (Σ)
PATTERNS = {
    "group": ['them', 'those', 'people', 'group', 'us', 'we', 'they'],
    "slur": ['hate', 'stupid', 'idiot', 'dumb', 'ugly', 'worst', 'terrible', 'awful'],
    "threat": ['kill', 'die', 'attack', 'destroy', 'burn', 'hurt', 'eliminated']
}

# TRANSITION TABLE (δ)
TRANSITIONS = {
    ("S0", "group"): "S1",
    ("S0", "slur"): "S2",
    ("S0", "threat"): "F",
    
    ("S1", "slur"): "S2",
    ("S1", "threat"): "F",
    
    ("S2", "threat"): "F",
    
    ("F", "group"): "F",
    ("F", "slur"): "F",
    ("F", "threat"): "F"
}

STATE_NAMES = {
    "S0": "S0_Neutral",
    "S1": "S1_TargetIdentified",
    "S2": "S2_Derogatory",
    "F":  "F_Toxic"
}

# PREPROCESSING MODULE
def preprocess(text: str):
    text = text.lower()
    text = text.replace("0", "o").replace("1", "i").replace("3", "e").replace("4", "a").replace("@", "a")
    raw_words = re.findall(r'\w+', text)
    stemmed_words = [stemmer.stem(word) for word in raw_words]
    
    return stemmed_words

def get_token_type(word):
    if word in PATTERNS["threat"]: return "threat"
    if word in PATTERNS["slur"]: return "slur"
    if word in PATTERNS["group"]: return "group"
    return "neutral"

@app.post("/analyze")
async def analyze_post(request: PostRequest):
    raw_text = request.text
    if not raw_text:
        return {"classification": "NO_INPUT", "confidence": 0, "path": "S0", "tokens": 0}

    tokens = preprocess(raw_text)

    # CORE FSM ENGINE (O(n) Linear Scan)
    current_state = "S0"
    path_trace = ["S0"]
    detected_patterns = []
    
    for token in tokens:
        token_type = get_token_type(token)
        
        if token_type != "neutral":
            detected_patterns.append({"type": token_type, "word": token})
            
            # DETERMINISTIC TRANSITION LOGIC
            if (current_state, token_type) in TRANSITIONS:
                current_state = TRANSITIONS[(current_state, token_type)]
                if path_trace[-1] != current_state:
                    path_trace.append(current_state)

    # POST-PROCESSING MODULE
    # Determine outputs based on Final State
    if current_state == "F":
        classification = "SEVERE"
        severity = "severe"
        confidence = 95
        action = "BLOCK-REPORT"
    elif current_state == "S2":
        classification = "UNSAFE"
        severity = "unsafe"
        confidence = 85
        action = "Flag for Review"
    elif current_state == "S1":
        classification = "WARNING"
        severity = "warning"
        confidence = 70
        action = "Monitor"
    else:
        classification = "SAFE"
        severity = "safe"
        confidence = 90
        action = "None"

    readable_path = [STATE_NAMES.get(s, s) for s in path_trace]
    final_readable = STATE_NAMES.get(current_state, current_state)

    return {
        "classification": classification,
        "state": final_readable,
        "confidence": confidence,
        "tokens": len(tokens),
        "transitionCount": len(path_trace) - 1,
        "transitions": readable_path,
        "patterns": detected_patterns,
        "explanation": f"FSM started at S0 and ended in {current_state}.",
        "action": action,
        "severity": severity
    }