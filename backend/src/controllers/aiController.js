const OpenAI = require('openai');
const {conceptExplainPrompt,questionAnswerPrompt} = require('../utils/propmts');

// OpenRouter Configuration (following OpenAI SDK pattern)
const MODEL = process.env.MODEL || "qwen/qwen3-next-80b-a3b-instruct:free";

// Initialize OpenRouter client using OpenAI SDK
const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://mockcrux.com",
        "X-Title": "Interv.ai Interview Prep"
    }
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: call OpenRouter with retry logic
async function generateWithRetry(prompt, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${MAX_RETRIES} | Model: ${MODEL}`);

            const response = await client.chat.completions.create({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                max_tokens: options.max_tokens || 8000, // Ensure sufficient tokens for complete responses
                temperature: options.temperature || 0.7
            });

            console.log(`✅ Response received`);
            const content = response.choices[0].message.content;
            
            // Check if response was truncated
            if (response.choices[0].finish_reason === 'length') {
                console.warn(`⚠️ Response truncated due to max_tokens limit`);
            }
            
            return content;
        } catch (error) {
            lastError = error;
            const statusCode = error.status || error.response?.status;
            console.log(`❌ Attempt ${attempt} failed (Status: ${statusCode}): ${error.message}`);

            if (statusCode === 429) {
                console.log(`⏱️  Rate limited. Waiting ${RETRY_DELAY / 1000}s...`);
                await delay(RETRY_DELAY);
            } else if (statusCode === 503) {
                console.log(`⏳ Model loading. Waiting...`);
                await delay(RETRY_DELAY * 2);
            } else {
                await delay(1000);
            }
        }
    }

    console.log(`❌ All ${MAX_RETRIES} attempts failed`);
    throw lastError;
}

// generate interview questions and answers
// POST /api/ai/generate-questions

const pdfParse = require('pdf-parse');

const generateInterviewQuestions = async (req,res) => {
    try{
        const {role,experience,topicToFocus,numberOFquestions} = req.body;

        if(!role || !experience || !topicToFocus || !numberOFquestions){
            return res.status(400).json({message : "Missing required fields"})
        }

        let resumeText = null;
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } catch (err) {
                console.error("Failed to parse resume PDF:", err);
                return res.status(400).json({ message: "Failed to parse the uploaded resume. Please ensure it is a valid PDF." });
            }
        }

        const prompt = questionAnswerPrompt(role,experience,topicToFocus,numberOFquestions, resumeText);

        // Call OpenRouter LLM with sufficient tokens for explanations + code blocks
        const rawText = await generateWithRetry(prompt, { max_tokens: 5000 });
        
        // Clean markdown code blocks from response
        let cleanedText = rawText.replace(/^```json\s*/,"")
                                    .replace(/^```\s*/,"")
                                    .replace(/```$/,"")
                                    .trim();
        
        // Additional cleaning: remove any trailing text after the JSON array
        let jsonText = cleanedText;
        
        // Find the first [ and last ] to extract just the JSON array
        const firstBracketIndex = cleanedText.indexOf('[');
        const lastBracketIndex = cleanedText.lastIndexOf(']');
        
        if (firstBracketIndex !== -1 && lastBracketIndex !== -1 && lastBracketIndex > firstBracketIndex) {
            jsonText = cleanedText.substring(firstBracketIndex, lastBracketIndex + 1);
        }
        
        // Validate JSON is complete before parsing
        if (!jsonText.trim().endsWith(']')) {
            console.error("⚠️ Incomplete JSON Response - Response may have been truncated");
            console.error("Last 200 chars:", jsonText.slice(-200));
            
            return res.status(500).json({
                message: "AI response was incomplete or truncated",
                error: "The model did not generate a complete response",
                hint: "Try requesting fewer questions or use a model with higher token limits"
            });
        }
        
        // Try to parse the JSON
        let data;
        try {
            data = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw Text:", rawText);
            console.error("Cleaned Text:", jsonText);
            
            return res.status(500).json({
                message: "Failed to parse AI response",
                error: parseError.message,
                hint: "Please try again - AI generated invalid JSON. Try requesting fewer questions."
            });
        }

        res.status(200).json(data)

    }catch(error){
        console.error("AI Generation Error:", error);
        const statusCode = error.status || 500;
        
        if (statusCode === 429) {
            return res.status(429).json({
                message: "API rate limit exceeded. Please wait a moment and try again.",
                error: "Too many requests"
            });
        }
        
        if (statusCode === 503) {
            return res.status(503).json({
                message: "Model is loading. Please try again in a moment.",
                error: "Service temporarily unavailable"
            });
        }
        
        res.status(500).json({
            message : "Failed to generate questions",
            error : error.message
        });
    }
};

// generate explanation for interview questions
// POST /api/ai/generate-explanation

const generateConceptExplanation = async (req,res) => {
    try{
        const {question } = req.body;
        if(!question){
            return res.status(400).json({message : "Missing Required fields"})
        }

        const propmt = conceptExplainPrompt(question);

        // Call OpenRouter LLM with higher token limit for detailed explanations
        const rawText = await generateWithRetry(propmt, { max_tokens: 6000 });
        
        // Clean markdown code blocks from response
        const cleanedText = rawText.replace(/^```json\s*/,"")
                                    .replace(/^```\s*/,"")
                                    .replace(/```$/,"")
                                    .trim();
        
        // Validate JSON is complete before parsing (should end with })
        if (!cleanedText.trim().endsWith('}')) {
            console.error("⚠️ Incomplete JSON Response - Response may have been truncated");
            console.error("Last 200 chars:", cleanedText.slice(-200));
            
            return res.status(500).json({
                message: "AI response was incomplete or truncated",
                error: "The model did not generate a complete response",
                hint: "Please try again or simplify the question"
            });
        }
        
        // Try to parse the JSON
        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw Text:", rawText);
            console.error("Cleaned Text:", cleanedText);
            
            return res.status(500).json({
                message: "Failed to parse AI response",
                error: parseError.message,
                hint: "Please try again - AI generated invalid JSON"
            });
        }
        
        res.status(200).json(data)

    }catch(error){
        console.error("AI Explanation Error:", error);
        const statusCode = error.status || 500;
        
        if (statusCode === 429) {
            return res.status(429).json({
                message: "API rate limit exceeded. Please wait a moment and try again.",
                error: "Too many requests"
            });
        }
        
        if (statusCode === 503) {
            return res.status(503).json({
                message: "Model is loading. Please try again in a moment.",
                error: "Service temporarily unavailable"
            });
        }
        
        res.status(500).json({
            message : "Failed to generate Explanations",
            error : error.message
        });
    }
}

module.exports = {generateInterviewQuestions,generateConceptExplanation}