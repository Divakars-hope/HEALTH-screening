let step = 0;
let answers = {};

// QUESTIONS (multi-disease)
const questions = [
{en:"Are your periods irregular?", ta:"மாதவிடாய் முறையற்றதா?", key:"period"},
{en:"Do you have facial hair growth?", ta:"முகத்தில் முடி வளர்ச்சியா?", key:"hair"},
{en:"Do you have acne?", ta:"முகப்பரு இருக்கிறதா?", key:"acne"},
{en:"Do you feel a lump in breast?", ta:"மார்பில் கட்டி உள்ளதா?", key:"lump"},
{en:"Any unusual discharge?", ta:"வித்தியாசமான நீர்வருகிறதா?", key:"discharge"},
{en:"Do you feel extreme tiredness?", ta:"அதிக சோர்வு உள்ளதா?", key:"fatigue"},
{en:"Sudden weight gain?", ta:"திடீர் எடை அதிகரிக்கிறதா?", key:"weight"},
{en:"Hair fall?", ta:"முடி கொட்டுகிறதா?", key:"hairfall"}
];

// START
function startQuiz(){
  step = 0;
  answers = {};
  document.getElementById("home").style.display="none";
  document.getElementById("quiz").style.display="block";
  showQuestion();
}

// SHOW QUESTION
function showQuestion(){
  if(step < questions.length){
    let q = questions[step];

    document.getElementById("quiz").innerHTML = `
      <h3>${q.en}</h3>
      <p style="color:gray;">${q.ta}</p>

      <button onclick="answer('Yes')">👍 Yes</button>
      <button onclick="answer('No')">👎 No</button>
    `;
  } else {
    showResult();
  }
}

// STORE ANSWER
function answer(val){
  let q = questions[step];
  answers[q.key] = val;
  step++;
  showQuestion();
}

// SHOW AI BUTTON
function showResult(){
  document.getElementById("quiz").innerHTML = `
    <h3>Review Complete</h3>
    <button onclick="analyzeWithAI()">🧠 Analyze with AI</button>
  `;
}

// AI ANALYSIS
async function analyzeWithAI(){

  let userData = `
  Age: ${document.getElementById("age").value}
  Height: ${document.getElementById("height").value}
  Weight: ${document.getElementById("weight").value}

  Answers:
  ${JSON.stringify(answers)}
  `;

  let prompt = `
You are an experienced women's health assistant.

Analyze symptoms and:
1. Identify possible conditions (PCOS, breast issues, thyroid, anemia)
2. Explain reasoning
3. Give risk level (Low / Moderate / High)
4. Give simple advice
5. Respond in English and Tamil

IMPORTANT:
- Do NOT give final diagnosis
- Keep it simple

User Data:
${userData}
`;

  try{
    let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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

",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{role:"user", content: prompt}]
      })
    });

    let data = await response.json();
    let output = data.choices[0].message.content.replace(/\n/g,"<br>");

    document.getElementById("quiz").innerHTML = `
      <h2>🧠 AI Health Analysis</h2>
      <div>${output}</div>

      <p style="color:red;">
      ⚠ This is not a medical diagnosis. Consult a doctor.
      </p>

      <button onclick="downloadReport()">Download Report</button>
      <button onclick="location.reload()">Restart</button>
    `;

  } catch(e){
    document.getElementById("quiz").innerHTML = "⚠ AI connection failed";
  }
}

// DOWNLOAD REPORT
function downloadReport(){
  let text = document.getElementById("quiz").innerText;
  let blob = new Blob([text], {type:"text/plain"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Health_Report.txt";
  a.click();
}

// AI CHATBOT
async function chat(){

  let input = document.getElementById("chatInput").value;

  let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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

",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {role:"system", content:"You are a helpful women's health assistant."},
        {role:"user", content: input}
      ]
    })
  });

  let data = await response.json();
  document.getElementById("chatOutput").innerText =
    data.choices[0].message.content;
}