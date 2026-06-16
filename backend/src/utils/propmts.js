const questionAnswerPrompt = (role, experience, topicToFocus, numberOfQuestions, resumeText = null) => {
    let resumeInstruction = "";
    if (resumeText) {
        resumeInstruction = `
    - CANDIDATE RESUME PROVIDED: Analyze the candidate's resume text below. Generate questions that specifically target the projects, skills, frameworks, and experience mentioned in their resume, in addition to general role-based questions.
    --- RESUME TEXT START ---
    ${resumeText}
    --- RESUME TEXT END ---
`;
    }

    return `You are an AI expert in technical interviewing, specialized in generating high-quality, relevant interview questions with clear, practical answers.

    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicToFocus}${resumeInstruction}
    - Generate exactly ${numberOfQuestions} interview questions that are appropriate for the experience level.
    
    ANSWER FORMAT (MANDATORY - STRICTLY FOLLOW):
    Each answer MUST contain TWO parts:
    1. Clear explanation in 4-6 lines that covers the core concept
    2. A practical code example in a code block
    
    - Explain the concept clearly in 4-6 lines (not too short, not too long)
    - ALWAYS include a code block after the explanation showing a practical example
    - Code examples should be realistic and demonstrate the concept clearly
    - Do NOT write one-line answers - give proper explanations
    - Use proper markdown formatting for code blocks
    
    Return a pure JSON array in this exact format:
    [
        {
            "question": "Question here?",
            "answer": "Write 4-6 lines of clear explanation describing what this concept is, how it works, why it matters, and when to use it. Make sure the explanation is complete and informative, not just one sentence.\\n\\n\`\`\`javascript\\n// Practical code example\\nconst example = 'demonstration';\\nconsole.log(example);\\n\`\`\`"
        }
    ]
    
    CRITICAL RULES:
    1. Return ONLY valid JSON - no extra text before or after.
    2. Use double quotes for all keys and strings.
    3. You MUST escape any double quotes inside your answers with a backslash.
    4. NEVER use actual newlines inside the string values. ALWAYS use the literal characters \\n for line breaks.
    5. EVERY answer MUST have BOTH: explanation (4-6 lines minimum) AND code block.
    6. DO NOT write short one-line answers - give proper explanations.
    7. Ensure all JSON objects are properly closed, with commas between them.
    8. The response must start with [ and end with ].
    9. Make sure questions are original, relevant to the topics, and test practical knowledge.
    
    Important: Each answer MUST contain 4-6 lines of explanation PLUS a code example. This is mandatory.`;
};

const conceptExplainPrompt = (question) => `
    You are an AI tutor specialized in explaining technical concepts from interview questions in an in-depth, accessible manner.

    Task:
    - Take the following interview question: ${question}
    - Provide a thorough explanation of the question and its underlying concepts, teaching as if to a beginner developer. Break it down step-by-step, starting from fundamentals and building to more complex ideas.
    - Use analogies, real-world examples, and simple language to make it engaging and easy to understand.
    - If relevant, include 1 to 2 code examples in small, well-commented code blocks to demonstrate the concept.
    - After the full explanation, suggest a short, clear, and descriptive title that summarizes the core concept, suitable for an article or page header.
    - Keep the formatting clean: Use markdown for structure, such as headings, bullet points, and code blocks within the explanation string.
    - Return the result as a valid JSON object in this exact format:
    {
        "title": "Short and clear title here",
        "explanation": "Full explanation here."
    }
    
    CRITICAL RULES:
    1. Return ONLY valid JSON - no extra text before or after.
    2. Use double quotes for all strings.
    3. Escape any double quotes inside strings with a backslash (e.g., \").
    4. Do NOT use single quotes or unescaped quotes in the JSON.
    5. Ensure the JSON object is properly formatted and closed.
    
    Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };