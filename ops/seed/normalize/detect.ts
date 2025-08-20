import fs from "node:fs";
import path from "node:path";

export type Shape =
  | "curriculum-canonical"
  | "curriculum-meta"
  | "curriculum-nested"
  | "curriculum-flat-legacy"
  | "questions-canonical"
  | "questions-with-translations"
  | "questions-legacy";

export function detectShape(obj: any, kind: "curriculum" | "questions"): Shape {
  // Simple heuristics; expand if needed.
  if (kind === "curriculum") {
    // Check if it has the canonical structure with content array and minutes
    if (obj?.unit && obj?.sections && obj?.lang) {
      const firstSection = obj.sections?.[0];
      const firstLesson = firstSection?.lessons?.[0];
      if (firstLesson?.content && Array.isArray(firstLesson.content) && 
          typeof firstLesson.minutes === "number") {
        return "curriculum-canonical";
      }
    }
    if (obj?.meta && obj?.sections) return "curriculum-meta";
    if (obj?.course && obj?.unit) return "curriculum-nested";
    return "curriculum-flat-legacy";
  } else {
    // For questions, check if it has the basic structure
    if (obj?.unit && obj?.questions && obj?.lang) {
      // Check if it has the canonical structure with root-level j_code and course_code
      if (obj?.j_code && obj?.course_code) {
        // Check if choices are already in object format (canonical)
        const firstQuestion = obj.questions?.[0];
        if (firstQuestion?.choices && Array.isArray(firstQuestion.choices) && 
            firstQuestion.choices[0] && typeof firstQuestion.choices[0] === "object") {
          return "questions-canonical";
        }
      }
      return "questions-legacy";
    }
    if (obj?.translations) return "questions-with-translations";
    return "questions-legacy";
  }
}
