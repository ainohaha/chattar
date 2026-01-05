
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY || "";

async function run() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
        console.log("Available models with generateContent:");
        data.models.forEach((m: any) => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    } else {
        console.log("No models found or error:", data);
    }
}

run();
