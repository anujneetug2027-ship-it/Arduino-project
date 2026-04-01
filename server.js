import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

let lastResult = "none";

async function askGemini(question) {

  const prompt = `
You are a strict TRUE/FALSE AI.

Rules:
1. Only respond with TRUE or FALSE
2. No explanation
3. If question cannot be answered clearly, return FALSE

Question:
${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  let text = response.text.trim().toLowerCase();

  if(text.includes("true")) return "true";
  if(text.includes("false")) return "false";

  return "false";
}

app.post("/ask", async (req,res)=>{

  try{

    const question = req.body.question;

    const result = await askGemini(question);

    lastResult = result;

    res.json({
      result: result
    });

  }catch(err){

    console.log(err);

    res.json({
      result: "false"
    });

  }

});

app.get("/result",(req,res)=>{
  res.json({result:lastResult});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Server running on port "+PORT);
});
