let currentSection = "";
let answers = [];
let currentQuestionIndex = 0;
let lang = "en"; // default English

// QUESTIONS WITH TAMIL
const questions = [
  {
    en: "Are your periods irregular?",
    ta: "உங்கள் மாதவிடாய் முறையற்றதா?"
  },
  {
    en: "Do you have acne frequently?",
    ta: "உங்களுக்கு அடிக்கடி முகப்பரு வருகிறதா?"
  },
  {
    en: "Do you notice unwanted hair growth on face or body?",
    ta: "முகம் அல்லது உடலில் அதிக முடி வளர்ச்சியை கவனித்தீர்களா?"
  },
  {
    en: "Do you feel breast pain or notice any lump?",
    ta: "மார்பில் வலி அல்லது கட்டி உள்ளதா?"
  },
  {
    en: "Do you have burning sensation while urinating?",
    ta: "சிறுநீர் கழிக்கும் போது எரிச்சல் உள்ளதா?"
  }
];

// LANGUAGE SWITCH
function setLanguage(selectedLang) {
  lang = selectedLang;
  showQuestion();
}

// START
function startSection(section) {
  currentSection = section;
  answers = [];
  currentQuestionIndex = 0;
  document.getElementById("result").innerHTML = "";
  showQuestion();
}

// SHOW QUESTION
function showQuestion() {

  if (currentQuestionIndex >= questions.length) {
    analyzeAnswers();
    return;
  }

  const q = questions[currentQuestionIndex][lang];

  document.getElementById("questionBox").innerHTML = `
    <div class="question-card">
      <p>${q}</p>

      <button onclick="speak('${q}')">🔊</button>

      <div class="btn-group">
        <button onclick="selectAnswer('Yes')">Yes</button>
        <button onclick="selectAnswer('No')">No</button>
      </div>
    </div>
  `;
}

// SAVE ANSWER
function selectAnswer(answer) {

  const q = questions[currentQuestionIndex];

  answers.push({
    question_en: q.en,
    question_ta: q.ta,
    answer: answer
  });

  currentQuestionIndex++;
  showQuestion();
}

// AI ANALYSIS
async function analyzeAnswers() {

  const symptomText = answers.map(a =>
    `${a.question_en}: ${a.answer}`
  ).join("\n");

  const prompt = `
You are a women's health assistant.

Analyze symptoms carefully.

Do NOT give final diagnosis.
Give general guidance only.

Section: ${currentSection}

Symptoms:
${symptomText}

Provide:

Possible Condition:
Reason:
Risk Level:
Advice:

Also give the explanation in simple Tamil.
`;

  document.getElementById("questionBox").innerHTML = "Analyzing...";

  try {

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const result = data?.choices?.[0]?.message?.content;

    document.getElementById("result").innerHTML = `
      <div class="result-card">
        <h3>Result / முடிவு</h3>
        <p>${result || "AI analysis failed"}</p>
        <button onclick="restart()">Restart</button>
      </div>
    `;

    document.getElementById("questionBox").innerHTML = "";

  } catch (error) {

    document.getElementById("result").innerHTML = `
      <p>Something went wrong</p>
    `;
  }
}

// VOICE SUPPORT
function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = (lang === "ta") ? "ta-IN" : "en-IN";
  speechSynthesis.speak(msg);
}

// RESTART
function restart() {
  answers = [];
  currentQuestionIndex = 0;
  document.getElementById("questionBox").innerHTML = "";
  document.getElementById("result").innerHTML = "";
}
