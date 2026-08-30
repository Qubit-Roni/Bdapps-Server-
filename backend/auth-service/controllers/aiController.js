const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateAIResponse = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            systemInstruction: "You are an AI Health Assistant for HealthCare Plus. You MUST ONLY answer questions related to healthcare, diseases, symptoms, nutrition, home care, and medicine. If the user asks about anything outside of these topics (like programming, politics, general chat, etc.), politely decline and state that you are only allowed to answer health-related questions. Answer in Bengali unless the user asks in English."
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        res.status(200).json({ 
            success: true, 
            reply: responseText 
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate AI response",
            error: error.message
        });
    }
};

const scanMealImage = async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        // image should be a base64 data URL: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
        if (!mimeTypeMatch) {
            return res.status(400).json({ success: false, message: "Invalid image format" });
        }
        
        const mimeType = mimeTypeMatch[1];
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        const prompt = `You are a meal scanner AI. Analyze this image of food.
Provide the estimated nutritional information in strictly valid JSON format only, without any markdown formatting like \`\`\`json.
The JSON must have exactly these keys:
{
  "name": "Food Name in Bengali (English in brackets)",
  "cal": <number of calories>,
  "pro": "<protein in grams>g",
  "carb": "<carbs in grams>g",
  "fat": "<fat in grams>g",
  "match": <confidence percentage, e.g. 95>,
  "advice": "A short health advice about this food in Bengali."
}
If the image is completely NOT food (e.g. laptop, car), return:
{
  "name": "এটি কোনো খাবার নয়!",
  "cal": 0,
  "pro": "0g",
  "carb": "0g",
  "fat": "0g",
  "match": 0,
  "advice": "আমাদের AI বলছে এটি কোনো খাবার নয়! দয়া করে একটি খাবারের ছবি দিন।"
}`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text();
        
        // Clean up markdown json block if Gemini includes it
        responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        
        const nutritionData = JSON.parse(responseText);

        res.status(200).json({
            success: true,
            result: nutritionData
        });

    } catch (error) {
        console.error("AI Scan Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to scan image",
            error: error.message
        });
    }
};

module.exports = {
    generateAIResponse,
    scanMealImage
};