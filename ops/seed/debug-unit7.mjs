import fs from "node:fs";

async function debug() {
  const raw = JSON.parse(fs.readFileSync("ops/seed/questions/CA/DE-ONLINE/units/unit07.en.json", "utf-8"));
  console.log("Raw question 1:", JSON.stringify(raw.questions[0], null, 2));
  
  // Test the normalization logic directly
  const q = raw.questions[0];
  if (q.prompt && q.options && typeof q.answerIndex === 'number') {
    const choices = q.options.map((text, index) => ({
      key: String.fromCharCode(65 + index),
      text
    }));
    const answer = String.fromCharCode(65 + q.answerIndex);
    
    const normalized = {
      stem: q.prompt,
      choices,
      answer,
      explanation: q.explanation || "No explanation provided",
      skill: q.skill || "general",
      difficulty: q.difficulty || 3,
      tags: q.tags || []
    };
    
    console.log("Normalized question 1:", JSON.stringify(normalized, null, 2));
  }
}

debug().catch(console.error);
