let lang = "en";
let currentSection = "";
let currentQuestionIndex = 0;
let answers = [];
let chatHistory = [];

// QUESTIONS
const questionBank = {
  PCOD: [
    { en: "Irregular periods?", ta: "மாதவிடாய் சரியாக வரவில்லையா?", weight: 3 },
    { en: "Acne issues?", ta: "முகப்பரு பிரச்சனை உள்ளதா?", weight: 2 },
    { en: "Excess hair growth?", ta: "அதிக முடி வளர்ச்சியா?", weight: 3 }
  ],
  Breast: [
    { en: "Breast lump?", ta: "மார்பில் கட்டி உள்ளதா?", weight: 5 },
    { en: "Pain or change?", ta: "வலி அல்லது மாற்றம் உள்ளதா?", weight: 3 }
  ],
  UTI: [
    { en: "Burning urination?", ta: "சிறுநீரில் எரிச்சல் உள்ளதா?", weight: 3 },
    { en: "Frequent urination?", ta: "அடிக்கடி சிறுநீர் போகிறீர்களா?", weight: 2 }
  ]
};

// LANGUAGE
function setLanguage(l){
  lang = l;
  showQuestion();
}

// START
function startSection(sec){
  currentSection = sec;
  currentQuestionIndex = 0;
  answers = [];
  document.getElementById("result").innerHTML = "";
  showQuestion();
}

// SHOW QUESTION
function showQuestion(){

  let qList = questionBank[currentSection];

  if(currentQuestionIndex >= qList.length){
    analyze();
    return;
  }

  let q = qList[currentQuestionIndex][lang];

  document.getElementById("questionBox").innerHTML = `
    <div class="question-card">
      <p>${q}</p>
      <button onclick="answer('Yes')">Yes</button>
      <button onclick="answer('No')">No</button>
    </div>
  `;

  speak(q); // AUTO VOICE
}

// ANSWER
function answer(a){
  let q = questionBank[currentSection][currentQuestionIndex];

  answers.push({ text: q.en, answer: a, weight: q.weight });

  currentQuestionIndex++;
  showQuestion();
}

// RISK
function riskCalc(){
  let score = 0;
  answers.forEach(a=>{
    if(a.answer==="Yes") score += a.weight;
  });

  if(score>=6) return "High";
  if(score>=3) return "Moderate";
  return "Low";
}

// ANALYZE
async function analyze(){

  let risk = riskCalc();

  let symptoms = answers.map(a => `${a.text}: ${a.answer}`).join("\n");

  let prompt = `
You are a careful women's health assistant.

IMPORTANT:
- Do NOT give diagnosis
- Be responsible

Section: ${currentSection}
Risk: ${risk}

Symptoms:
${symptoms}

Give:
Possible Condition
Reason
Advice

Also explain clearly in Tamil.
`;

  document.getElementById("questionBox").innerHTML = "Analyzing...";

  let res = await fetch("/api/ai",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({messages:[{role:"user",content:prompt}]})
  });

  let data = await res.json();
  let output = data.choices[0].message.content;

  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <b>Risk: ${risk}</b>
      <p>${output}</p>
    </div>
  `;
}

// VOICE
function speak(text){
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = (lang==="ta") ? "ta-IN" : "en-IN";
  speechSynthesis.speak(msg);
}

// CHAT
async function sendMessage(){

  let input = document.getElementById("userInput");
  let text = input.value;
  if(!text) return;

  let chatBox = document.getElementById("chatBox");

  chatBox.innerHTML += `<div class="chat-user">You: ${text}</div>`;

  let res = await fetch("/api/ai",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({messages:[{role:"user",content:text}]})
  });

  let data = await res.json();
  let reply = data.choices[0].message.content;

  chatBox.innerHTML += `<div class="chat-ai">AI: ${reply}</div>`;

  input.value="";
}
