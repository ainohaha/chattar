
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function run() {
    try {
        // We cannot easily list models with the client method in older versions, 
        // but newer versions support it. Let's try iterating if possible or just try gemini-pro.
        // Actually, let's try 'gemini-1.5-flash-001' which is the versioned name.

        console.log("Trying gemini-1.5-flash-001...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log("Success with 001:", response.text());
    } catch (error: any) {
        console.error("Error with 001:", error.message);

        try {
            console.log("Trying gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello?");
            const responsePro = await resultPro.response;
            console.log("Success with pro:", responsePro.text());
        } catch (err2: any) {
            console.error("Error with pro:", err2.message);
        }
    }
}

run();
