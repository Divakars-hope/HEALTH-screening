let lang = "en";
let currentSection = "";
let currentQuestionIndex = 0;
let answers = [];
let chatHistory = [];

// QUESTIONS
const questionBank = {

  PCOD: [
    { en: "Are your periods irregular?", ta: "மாதவிடாய் முறையற்றதா?", weight: 3 },
    { en: "Do you have acne frequently?", ta: "முகப்பரு அடிக்கடி வருகிறதா?", weight: 2 },
    { en: "Excess hair growth?", ta: "அதிக முடி வளர்ச்சியா?", weight: 3 },
    { en: "Weight gain easily?", ta: "எளிதில் எடை அதிகரிக்கிறதா?", weight: 2 }
  ],

  Breast: [
    { en: "Any breast lump?", ta: "மார்பில் கட்டி உள்ளதா?", weight: 5 },
    { en: "Nipple discharge?", ta: "நிப்பிளில் வெளியேற்றம் உள்ளதா?", weight: 4 },
    { en: "Persistent pain?", ta: "தொடர்ந்து வலி உள்ளதா?", weight: 3 }
  ],

  UTI: [
    { en: "Burning urination?", ta: "சிறுநீரில் எரிச்சல் உள்ளதா?", weight: 3 },
    { en: "Frequent urination?", ta: "அடிக்கடி சிறுநீர் போகிறதா?", weight: 2 },
    { en: "Lower abdominal pain?", ta: "வயிற்று கீழ் வலி உள்ளதா?", weight: 2 }
  ]
};

// LANGUAGE
function setLanguage(l) {
  lang = l;
  showQuestion();
}

// START
function startSection(section) {
  currentSection = section;
  currentQuestionIndex = 0;
  answers = [];
  document.getElementById("result").innerHTML = "";
  showQuestion();
}

// SHOW QUESTION
function showQuestion() {

  let qList = questionBank[currentSection];

  if (!qList || currentQuestionIndex >= qList.length) {
    analyzeAnswers();
    return;
  }

  let q = qList[currentQuestionIndex][lang];

  document.getElementById("questionBox").innerHTML = `
    <div class="question-card">
      <p>${q}</p>
      <button onclick="speak('${q}')">🔊</button><br>
      <button onclick="answer('Yes')">Yes</button>
      <button onclick="answer('No')">No</button>
    </div>
  `;
}

// SAVE ANSWER
function answer(ans) {
  let q = questionBank[currentSection][currentQuestionIndex];

  answers.push({
    text: q.en,
    answer: ans,
    weight: q.weight
  });

  currentQuestionIndex++;
  showQuestion();
}

// RISK
function calculateRisk() {
  let score = 0;

  answers.forEach(a => {
    if (a.answer === "Yes") score += a.weight;
  });

  if (score >= 8) return "High";
  if (score >= 4) return "Moderate";
  return "Low";
}

// AI ANALYSIS
async function analyzeAnswers() {

  let symptoms = answers.map(a => `${a.text}: ${a.answer}`).join("\n");
  let risk = calculateRisk();

  let prompt = `
You are a women's health assistant.

Section: ${currentSection}
Risk Level: ${risk}

Symptoms:
${symptoms}

Give:
Possible Condition
Reason
Advice

Also explain in Tamil.
`;

  document.getElementById("questionBox").innerHTML = "Analyzing...";

  let res = await fetch("/api/ai", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] })
  });

  let data = await res.json();
  let output = data?.choices?.[0]?.message?.content || "AI failed";

  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <h3>Result</h3>
      <p><b>Risk Level:</b> ${risk}</p>
      <p>${output}</p>
      <button onclick="location.reload()">Restart</button>
    </div>
  `;

  document.getElementById("questionBox").innerHTML = "";
}

// VOICE
function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = (lang === "ta") ? "ta-IN" : "en-IN";
  speechSynthesis.speak(msg);
}

// CHATBOT
async function sendMessage() {

  let input = document.getElementById("userInput");
  let chatBox = document.getElementById("chatBox");

  let text = input.value.trim();
  if (!text) return;

  chatBox.innerHTML += `<div class="chat-user"><b>You:</b> ${text}</div>`;
  input.value = "";

  chatHistory.push({ role: "user", content: text });

  let conversation = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");

  let prompt = `
You are a women's health assistant.

Conversation:
${conversation}

Reply in simple English and Tamil.
`;

  let res = await fetch("/api/ai", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] })
  });

  let data = await res.json();
  let reply = data?.choices?.[0]?.message?.content || "No response";

  chatBox.innerHTML += `<div class="chat-ai"><b>AI:</b> ${reply}</div>`;

  chatHistory.push({ role: "ai", content: reply });

  chatBox.scrollTop = chatBox.scrollHeight;
}
