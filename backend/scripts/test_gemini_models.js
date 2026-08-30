require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        console.log("Using API Key:", process.env.GEMINI_API_KEY.substring(0, 10) + '...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can't directly list models using the Node SDK easily without raw fetch.
        // Let's use raw fetch.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("Error or no models:", data);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
listModels();
