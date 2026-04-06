module.exports = async function (req, res) {

  try {

    const prompt = req.body.messages?.[0]?.content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI response";

    res.status(200).json({
      choices: [{ message: { content: text } }]
    });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
