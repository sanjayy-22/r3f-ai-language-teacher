import OpenAI from "openai";

// Initialize OpenAI only if we have the key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Direct API call to OpenRouter
async function callOpenRouter(messages) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: messages,
      temperature: 0.4,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  return await response.json();
}

const formalExample = {
  japanese: [
    { word: "日本", reading: "にほん" },
    { word: "に" },
    { word: "住んで", reading: "すんで" },
    { word: "います" },
    { word: "か" },
    { word: "?" },
  ],
  grammarBreakdown: [
    {
      english: "Do you live in Japan?",
      japanese: [
        { word: "日本", reading: "にほん" },
        { word: "に" },
        { word: "住んで", reading: "すんで" },
        { word: "います" },
        { word: "か" },
        { word: "?" },
      ],
      chunks: [
        {
          japanese: [{ word: "日本", reading: "にほん" }],
          meaning: "Japan",
          grammar: "Noun",
        },
        {
          japanese: [{ word: "に" }],
          meaning: "in",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "住んで", reading: "すんで" }, { word: "います" }],
          meaning: "live",
          grammar: "Verb + て form + います",
        },
        {
          japanese: [{ word: "か" }],
          meaning: "question",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "?" }],
          meaning: "question",
          grammar: "Punctuation",
        },
      ],
    },
  ],
};

const casualExample = {
  japanese: [
    { word: "日本", reading: "にほん" },
    { word: "に" },
    { word: "住んで", reading: "すんで" },
    { word: "いる" },
    { word: "の" },
    { word: "?" },
  ],
  grammarBreakdown: [
    {
      english: "Do you live in Japan?",
      japanese: [
        { word: "日本", reading: "にほん" },
        { word: "に" },
        { word: "住んで", reading: "すんで" },
        { word: "いる" },
        { word: "の" },
        { word: "?" },
      ],
      chunks: [
        {
          japanese: [{ word: "日本", reading: "にほん" }],
          meaning: "Japan",
          grammar: "Noun",
        },
        {
          japanese: [{ word: "に" }],
          meaning: "in",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "住んで", reading: "すんで" }, { word: "いる" }],
          meaning: "live",
          grammar: "Verb + て form + いる",
        },
        {
          japanese: [{ word: "の" }],
          meaning: "question",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "?" }],
          meaning: "question",
          grammar: "Punctuation",
        },
      ],
    },
  ],
};

export async function GET(req) {
  // WARNING: Do not expose your keys
  // WARNING: If you host publicly your project, add an authentication layer to limit the consumption of ChatGPT resources

  const speech = req.nextUrl.searchParams.get("speech") || "formal";
  const provider = req.nextUrl.searchParams.get("provider") || process.env.NEXT_PUBLIC_AI_PROVIDER || 'openrouter';

  const systemMessages = [
    {
      role: "system",
      content: `You are a Japanese language teacher. 
Your student asks you how to say something from english to japanese.
You should respond with: 
- english: the english version ex: "Do you live in Japan?"
- japanese: the japanese translation in split into words ex: ${JSON.stringify(
          speech === "formal" ? formalExample.japanese : casualExample.japanese
        )}
- grammarBreakdown: an explanation of the grammar structure per sentence ex: ${JSON.stringify(
          speech === "formal" ? formalExample.grammarBreakdown : casualExample.grammarBreakdown
        )}
`,
    },
    {
      role: "system",
      content: `You always respond with a JSON object with the following format: 
      {
        "english": "",
        "japanese": [{
          "word": "",
          "reading": ""
        }],
        "grammarBreakdown": [{
          "english": "",
          "japanese": [{
            "word": "",
            "reading": ""
          }],
          "chunks": [{
            "japanese": [{
              "word": "",
              "reading": ""
            }],
            "meaning": "",
            "grammar": ""
          }]
        }]
      }`,
    },
    {
      role: "user",
      content: `How to say ${
        req.nextUrl.searchParams.get("question") ||
        "Have you ever been to Japan?"
      } in Japanese in ${speech} speech?`,
    },
  ];

  try {
    let response;
    
    if (provider === 'openai' && openai) {
      response = await openai.chat.completions.create({
        messages: systemMessages,
        model: "gpt-3.5-turbo",
        temperature: 0.4,
        max_tokens: 1000,
      });
      return Response.json(JSON.parse(response.choices[0].message.content));
    } else {
      // Default to OpenRouter
      const openRouterResponse = await callOpenRouter(systemMessages);
      return Response.json(JSON.parse(openRouterResponse.choices[0].message.content));
    }
  } catch (error) {
    console.error('AI Provider Error:', error);
    return Response.json({ 
      error: `Failed to get AI response: ${error.message}`,
      provider: provider
    }, { status: 500 });
  }
}
