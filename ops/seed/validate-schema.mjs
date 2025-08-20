#!/usr/bin/env node

import { CurriculumUnitSchema, UnitQuestionsSchema } from './lib/schema.ts';
import { readJson } from './lib/files.ts';

async function validateUnit(unit, lang) {
  const unitStr = unit.toString().padStart(2, '0');
  
  try {
    // Validate curriculum
    const curriculumPath = `ops/seed/curriculum/CA/DE-ONLINE/units/unit${unitStr}.${lang}.json`;
    const curriculum = await readJson(curriculumPath);
    CurriculumUnitSchema.parse(curriculum);
    console.log(`✅ Unit ${unit} curriculum (${lang}) valid`);
    
    // Validate questions
    const questionsPath = `ops/seed/questions/CA/DE-ONLINE/units/unit${unitStr}.${lang}.json`;
    const questions = await readJson(questionsPath);
    UnitQuestionsSchema.parse(questions);
    console.log(`✅ Unit ${unit} questions (${lang}) valid`);
    
  } catch (error) {
    console.error(`❌ Unit ${unit} (${lang}) validation failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Validating schema for Units 3-12...\n');
  
  for (let unit = 3; unit <= 12; unit++) {
    for (const lang of ['en', 'es']) {
      await validateUnit(unit, lang);
    }
  }
  
  console.log('\n🎉 All units validated successfully!');
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
