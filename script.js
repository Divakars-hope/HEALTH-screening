let step = 0;
let answers = {};

const questions = [
"Are your periods irregular?",
"Do you have facial hair growth?",
"Do you have acne?",
"Do you feel breast lump?",
"Any unusual discharge?",
"Do you feel tired often?",
"Sudden weight gain?",
"Hair fall?"
];

// START
function startQuiz(){
  let age = document.getElementById("age").value;
  if(!age){
    alert("Enter basic details");
    return;
  }

  document.getElementById("formCard").classList.add("hidden");
  document.getElementById("quizCard").classList.remove("hidden");

  step = 0;
  showQuestion();
}

// SHOW QUESTION
function showQuestion(){
  let card = document.getElementById("quizCard");

  if(step < questions.length){
    card.innerHTML = `
      <h3>${questions[step]}</h3>

      <button onclick="answer('Yes')">Yes</button>
      <button onclick="answer('No')">No</button>
    `;
  } else {
    showAnalyze();
  }
}

// STORE ANSWER
function answer(val){
  answers["Q"+step] = val;
  step++;
  showQuestion();
}

// SHOW AI BUTTON
function showAnalyze(){
  document.getElementById("quizCard").innerHTML = `
    <h3>Ready for AI Analysis</h3>
    <button onclick="analyze()">Analyze</button>
  `;
}

// AI ANALYSIS
async function analyze(){

  let resultCard = document.getElementById("resultCard");
  resultCard.classList.remove("hidden");

  resultCard.innerHTML = "Analyzing...";

  let data = {
    model: "mistralai/mistral-7b-instruct",
    messages: [{
      role: "user",
      content: `Analyze this health data: ${JSON.stringify(answers)}`
    }]
  };

  try{
    let res = await fetch("/api/ai", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    let json = await res.json();

    resultCard.innerHTML = `
      <h2>AI Result</h2>
      <p>${json.choices[0].message.content}</p>
      <p style="color:red;">⚠ Not a medical diagnosis</p>
    `;

  } catch(e){
    resultCard.innerHTML = "AI Error";
  }
}

// CHAT
async function chat(){
  let input = document.getElementById("chatInput").value;

  let res = await fetch("/api/ai", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"mistralai/mistral-7b-instruct",
      messages:[{role:"user", content:input}]
    })
  });

  let data = await res.json();
  document.getElementById("chatOutput").innerText =
    data.choices[0].message.content;
}

// VOICE
function startVoice(){
  let rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.onresult = e => {
    document.getElementById("chatInput").value =
      e.results[0][0].transcript;
    chat();
  };
  rec.start();
}
