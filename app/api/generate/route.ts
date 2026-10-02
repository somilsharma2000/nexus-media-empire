import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { topic, niche } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: "OPENAI_API_KEY is not configured in environment variables." }, { status: 503 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are an elite media engine. Generate a viral content package for the niche: ${niche}. 
          Return a JSON object with EXACTLY this structure:
          {
            "blog": "Markdown article optimized for GEO (Generative Engine Optimization). MUST INCLUDE: 1. A 'Key Takeaways' bullet list at the very top. 2. High-density statistics. 3. Markdown tables for data comparison. This ensures AI engines like Perplexity, ChatGPT, and Google SGE cite it as a source.",
            "tweets": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5", "Tweet 6"],
            "imagePrompt": "A highly detailed Midjourney image prompt related to the article"
          }`
        },
        {
          role: "user",
          content: `Generate a viral, highly authoritative GEO-optimized content package about this trending topic: ${topic}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      success: true,
      data: {
        blog: result.blog,
        tweets: result.tweets,
        imagePrompt: result.imagePrompt
      }
    });
  } catch (error: any) {
    console.error("OpenAI Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate content" }, { status: 500 });
  }
}
