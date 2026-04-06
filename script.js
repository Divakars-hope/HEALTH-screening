let lang = "en";
let step = 0;
let answers = [];
let currentSection = "";

const app = document.getElementById("app");

// ✅ STRUCTURED QUESTIONS (IMPORTANT FIX)
const data = {

pcos: [
{id:"irregular_periods", en:"Are your periods irregular?", ta:"மாதவிடாய் முறையற்றதா?"},
{id:"skipped_periods", en:"Have you skipped periods?", ta:"மாதவிடாய் தவறியதா?"},
{id:"acne", en:"Do you have acne?", ta:"முகப்பரு உள்ளதா?"},
{id:"facial_hair", en:"Excess facial hair?", ta:"முகத்தில் அதிக முடி உள்ளதா?"},
{id:"weight_gain", en:"Weight gain?", ta:"எடை அதிகரித்ததா?"}
],

breast: [
{id:"lump", en:"Do you feel a lump in breast?", ta:"மார்பில் கட்டி உள்ளதா?"},
{id:"hard_lump", en:"Is the lump hard or fixed?", ta:"கட்டி கடினமா?"},
{id:"shape_change", en:"Change in shape or size?", ta:"வடிவம் மாறியதா?"},
{id:"skin_change", en:"Skin change?", ta:"தோல் மாற்றம் உள்ளதா?"},
{id:"discharge", en:"Nipple discharge?", ta:"நீர்வருகிறதா?"}
],

uti: [
{id:"burning", en:"Burning urination?", ta:"எரிச்சல் உள்ளதா?"},
{id:"frequent", en:"Frequent urination?", ta:"அடிக்கடி சிறுநீர்?"},
{id:"pain", en:"Lower abdominal pain?", ta:"வயிற்று வலி?"},
{id:"fever", en:"Fever?", ta:"காய்ச்சல் உள்ளதா?"},
{id:"blood", en:"Blood in urine?", ta:"ரத்தம் உள்ளதா?"}
]

};

// LANGUAGE
function setLang(l){
  lang = l;
  renderHome();
}

// HOME
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

// START
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

    let q = qList[step];

    let text = q[lang];

    app.innerHTML = `
      <div class="card">
        <h3>${text}</h3>

        <button class="voice" onclick="speak('${text}')">🔊</button>

        <button onclick="answer('Yes')">Yes</button>
        <button onclick="answer('No')">No</button>
      </div>
    `;

  } else {
    analyze();
  }
}

// SAVE ANSWER (IMPORTANT FIX)
function answer(val){

  let q = data[currentSection][step];

  answers.push({
    symptom: q.id,
    value: val
  });

  step++;
  showQuestion();
}

// AI ANALYSIS (STRONG VERSION)
async function analyze(){

  app.innerHTML = `
    <div class="card loading">
      Analyzing...
    </div>
  `;

  let symptomText = answers.map(a => `${a.symptom}: ${a.value}`).join("\n");

  let prompt = `
You are a trained women's health assistant.

Analyze ONLY based on given symptoms.
Do NOT guess or assume missing data.

Section: ${currentSection}

Symptoms:
${symptomText}

Rules:
- If weak evidence → say "uncertain"
- If breast lump present → treat as high priority

Output:

Possible Condition:
Reason (based on symptoms):
Risk Level: Low / Moderate / High
Red Flags:
Advice:

Also give simple Tamil explanation.
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
    app.innerHTML = "AI connection error";
  }
}

// RESULT
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
