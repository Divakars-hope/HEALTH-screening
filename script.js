let step = 0;
let answers = [];

// Structured simple questions (icon + Tamil + easy)
const questions = [
{q:"🩸 Periods not regular?", ta:"மாதவிடாய் சரியாக வராதா?"},
{q:"🧔 Facial hair growth?", ta:"முகத்தில் முடி அதிகமா?"},
{q:"😣 Acne problem?", ta:"முகப்பரு இருக்கிறதா?"},
{q:"⚖ Sudden weight gain?", ta:"திடீர் எடை அதிகரிக்கிறதா?"},
{q:"🩺 Breast lump?", ta:"மார்பில் கட்டி உள்ளதா?"},
{q:"💧 Discharge?", ta:"நீர்வருகிறதா?"},
{q:"🔥 Burning urine?", ta:"சிறுநீர் எரிச்சலா?"},
{q:"😴 Very tired?", ta:"அதிக சோர்வு உள்ளதா?"}
];

// START
function startQuiz(){
  document.getElementById("startCard").classList.add("hidden");
  document.getElementById("quizCard").classList.remove("hidden");

  step = 0;
  answers = [];

  showQuestion();
}

// SHOW QUESTION
function showQuestion(){
  let card = document.getElementById("quizCard");

  if(step < questions.length){
    let q = questions[step];

    card.innerHTML = `
      <h3>${q.q}</h3>
      <p style="color:gray;">${q.ta}</p>

      <button onclick="answer('Yes')">👍 Yes</button>
      <button onclick="answer('No')">👎 No</button>
    `;

    speak(q.q);

  } else {
    analyze();
  }
}

// SAVE ANSWER (TEMP ONLY)
function answer(val){
  answers.push(val);
  step++;
  showQuestion();
}

// AI ANALYSIS (ANONYMOUS)
async function analyze(){

  let resultCard = document.getElementById("resultCard");
  resultCard.classList.remove("hidden");
  resultCard.innerHTML = "Analyzing...";

  let prompt = `
You are a women's health assistant.

This data is anonymous.

Analyze symptoms carefully.

Check for:
- PCOS
- Breast issues
- Hormonal imbalance
- UTI

Rules:
- Do NOT guess blindly
- If unsure say "uncertain"
- Keep it simple

Give:
Condition
Reason
Risk
Advice

Symptoms:
${answers.join(", ")}
`;

  try{
    let res = await fetch("/api/ai", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"mistralai/mistral-7b-instruct",
        messages:[{role:"user", content:prompt}]
      })
    });

    let data = await res.json();

    resultCard.innerHTML = `
      <h3>🧠 Result</h3>
      <p>${data.choices[0].message.content}</p>

      <p style="color:red;">
      ⚠ This is only a screening. Consult a doctor.
      </p>

      <p style="font-size:12px;">
      🔒 Your data is not stored
      </p>
    `;

    speak(data.choices[0].message.content);

  } catch(e){
    resultCard.innerHTML = "AI connection error";
  }
}

// VOICE OUTPUT
function speak(text){
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  speechSynthesis.speak(msg);
}
