async function analyze(){

  let resultCard = document.getElementById("resultCard");
  resultCard.classList.remove("hidden");
  resultCard.innerHTML = "Analyzing...";

  let prompt = `
You are a careful women's health assistant.

Section: ${currentSection}

User answers:
${answers.join(", ")}

Analyze properly.

Give output in this format:

Possible Condition:
Reason:
Risk Level: Low / Moderate / High
Important Warning Signs:
Advice:

Also give simple Tamil explanation.
`;

  try {

    let res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }]
      })
    });

    let data = await res.json();

    resultCard.innerHTML = `
      <h3>Result</h3>
      <p>${data.choices[0].message.content}</p>

      <p style="color:red;">
      This is only a screening tool. Please consult a doctor.
      </p>

      <p style="font-size:12px;">
      Your data is not stored
      </p>
    `;

  } catch (err) {
    resultCard.innerHTML = "AI connection error";
  }
}
