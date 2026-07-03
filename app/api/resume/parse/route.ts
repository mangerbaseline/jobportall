import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // pdf-parse v1 — simple CommonJS module, no worker needed
    const pdfParse = require("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an expert resume parser. You will extract relevant profile information from the raw resume text provided.
Return the output STRICTLY as a raw JSON object matching the JSON schema below. Do not wrap in markdown \`\`\`json blocks or add any comments or extra text.

JSON Schema:
{
  "name": "full name or contact person name",
  "companyName": "current or last company name (for employers)",
  "skills": ["array of skills found"],
  "experience": 3,
  "education": "summary of education",
  "certifications": "summary of certifications",
  "bio": "brief professional bio summary",
  "phone": "phone number",
  "linkedin": "linkedin URL",
  "github": "github URL",
  "portfolio": "portfolio URL"
}

Raw Resume Text:
${text}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    // Parse the JSON
    let parsedData = {};
    try {
      const cleaned = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from response:", responseContent);
      return NextResponse.json({ error: "Failed to parse structured data from model output" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse resume" }, { status: 500 });
  }
}

