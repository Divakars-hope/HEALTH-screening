let currentSection = "";
let index = 0;
let answers = [];

const questions = {
  PCOD: [
    { q: "Irregular periods?", w: 3 },
    { q: "Acne?", w: 2 },
    { q: "Hair growth?", w: 3 }
  ],
  Breast: [
    { q: "Breast lump?", w: 5 },
    { q: "Pain?", w: 3 }
  ],
  UTI: [
    { q: "Burning urine?", w: 3 },
    { q: "Frequent urine?", w: 2 }
  ]
};

function startSection(sec) {
  currentSection = sec;
  index = 0;
  answers = [];
  showQuestion();
}

function showQuestion() {
  let qList = questions[currentSection];

  if (index >= qList.length) {
    analyze();
    return;
  }

  let q = qList[index].q;

  document.getElementById("questionBox").innerHTML = `
    <div class="question-card">
      <p>${q}</p>
      <button class="answer-btn" onclick="answer(1)">Yes</button>
      <button class="answer-btn" onclick="answer(0)">No</button>
    </div>
  `;
}

function answer(val) {
  let q = questions[currentSection][index];
  answers.push(val * q.w);
  index++;
  showQuestion();
}

function getRisk() {
  let total = answers.reduce((a, b) => a + b, 0);
  if (total > 5) return "High";
  if (total > 2) return "Medium";
  return "Low";
}

async function analyze() {
  let risk = getRisk();

  let res = await fetch("/api/ai", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      messages: [{role:"user",content:`Risk: ${risk}. Give advice.`}]
    })
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

// CHAT
async function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value;
  if (!text) return;

  let box = document.getElementById("chatBox");
  box.innerHTML += `<div class="user">You: ${text}</div>`;

  let res = await fetch("/api/ai", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      messages:[{role:"user",content:text}]
    })
  });

  let data = await res.json();
  let reply = data.choices[0].message.content;

  box.innerHTML += `<div class="ai">AI: ${reply}</div>`;
  input.value = "";
}
