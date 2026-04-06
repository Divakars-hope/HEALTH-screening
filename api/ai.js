export default async function handler(req, res) {

  try {

    const prompt = req.body.messages?.[0]?.content;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini RAW:", JSON.stringify(data, null, 2));

    let aiText = "";

    if (data.candidates && data.candidates.length > 0) {
      aiText = data.candidates[0].content.parts
        .map(p => p.text)
        .join(" ");
    }

    if (!aiText) {
      aiText = "AI response empty. Check API key or quota.";
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
