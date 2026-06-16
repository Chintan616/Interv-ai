import axios from "axios";

const response = await axios.post(
  "https://router.huggingface.co/v1/chat/completions",
  {
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: [
      {
        role: "system",
        content: "You are an AI that generates interview questions and answers in JSON."
      },
      {
        role: "user",
        content: `
Generate 10 frontend interview questions and answers for a 1 year React developer.
Return ONLY valid JSON array.
`
      }
    ],
    temperature: 0.3
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json"
    }
  }
);

console.log(response.data.choices[0].message.content);
