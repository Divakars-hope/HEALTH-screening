let lang = "en";
let step = 0;
let answers = [];
let currentSection = "";

const app = document.getElementById("app");

// QUESTIONS
const data = {

pcos: [
{en:"Are your periods irregular?", ta:"மாதவிடாய் முறையற்றதா?"},
{en:"Do you have acne?", ta:"முகப்பரு உள்ளதா?"},
{en:"Excess facial hair?", ta:"முகத்தில் அதிக முடி உள்ளதா?"},
{en:"Weight gain?", ta:"எடை அதிகரித்ததா?"}
],

breast: [
{en:"Breast lump?", ta:"மார்பில் கட்டி உள்ளதா?"},
{en:"Skin change?", ta:"தோல் மாற்றம் உள்ளதா?"},
{en:"Discharge?", ta:"நீர்வருகிறதா?"}
],

uti: [
{en:"Burning urination?", ta:"எரிச்சல் உள்ளதா?"},
{en:"Frequent urination?", ta:"அடிக்கடி சிறுநீர்?"},
{en:"Lower pain?", ta:"வயிற்று வலி?"}
]

};

// LANGUAGE
function setLang(l){
  lang = l;
  renderHome();
}

// HOME SCREEN
function renderHome(){
  app.innerHTML = `
    <div class="card">
      <h3>Select Health Area</h3>

      <button onclick="start('pcos')">PCOS / Hormonal</button>
      <button onclick="start('breast')">Breast Health</button>
      <button onclick="start('uti')">Urinary Issues</button>
    </div>
  `;
}

// START SECTION
function start(section){
  currentSection = section;
  step = 0;
  answers = [];
  showQuestion();
}

// SHOW QUESTION
function showQuestion(){

  let qList = data[currentSection];

  if(step < qList.length){

    let q = qList[step][lang];

    app.innerHTML = `
      <div class="card">
        <h3>${q}</h3>

        <button class="voice" onclick="speak('${q}')">🔊</button>

        <button onclick="answer('Yes')">Yes</button>
        <button onclick="answer('No')">No</button>
      </div>
    `;

  } else {
    analyze();
  }
}

// SAVE ANSWER
function answer(val){
  answers.push(val);
  step++;
  showQuestion();
}

// AI ANALYSIS
async function analyze(){

  app.innerHTML = `
    <div class="card loading">
      Analyzing...
    </div>
  `;

  let prompt = `
You are a women's health assistant.

Section: ${currentSection}
Answers: ${answers.join(", ")}

Give:
- Possible condition
- Reason
- Risk level
- Advice

Also give Tamil explanation.
`;

  try {

    let res = await fetch("/api/ai", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        messages:[{role:"user", content:prompt}]
      })
    });

    let data = await res.json();

    showResult(data.choices[0].message.content);

  } catch {
    app.innerHTML = "Error connecting AI";
  }
}

// RESULT SCREEN
function showResult(text){

  app.innerHTML = `
    <div class="card">
      <h3>Result</h3>

      <div class="result-box">
        ${text}
      </div>

      <button onclick="renderHome()">Restart</button>

      <p style="color:red;">
      This is not a medical diagnosis
      </p>

      <p style="font-size:12px;">
      Your data is not stored
      </p>
    </div>
  `;
}

// VOICE
function speak(text){
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = (lang === "ta") ? "ta-IN" : "en-IN";
  speechSynthesis.speak(msg);
}

// INIT
renderHome();
