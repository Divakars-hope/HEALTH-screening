export default async function handler(req, res) {

  try {

    const prompt = req.body.messages?.[0]?.content;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    // ✅ SAFE PARSING (FIX)
    let aiText = "";

    if (data.candidates && data.candidates.length > 0) {
      aiText = data.candidates[0]?.content?.parts?.map(p => p.text).join(" ");
    }

    // ❌ BLOCKED CASE
    if (!aiText) {
      if (data.promptFeedback) {
        aiText = "Response blocked by safety system. Try simpler input.";
      } else {
        aiText = "AI did not return valid output. Please try again.";
      }
    }

    return res.status(200).json({
      choices: [
        {
          message: {
            content: aiText
          }
        }
      ]
    });

  } catch (error) {

    console.error("ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
