import { log } from "./lib/log";
import { seedCurriculum } from "./seed-curriculum";
import { seedQuestions } from "./seed-questions";
import { seedBlueprint } from "./seed-blueprint";

// Parse command line arguments
const args = process.argv.slice(2);
const unitArg = args.find(arg => arg.startsWith('--unit='));
const langArg = args.find(arg => arg.startsWith('--lang='));
const jArg = args.find(arg => arg.startsWith('--j='));
const courseArg = args.find(arg => arg.startsWith('--course='));

const unit = unitArg ? parseInt(unitArg.split('=')[1]) : 1;
const langs = langArg ? langArg.split('=')[1].split(',') : ['en', 'es'];
const jurisdiction = jArg ? jArg.split('=')[1] : 'CA';
const course = courseArg ? courseArg.split('=')[1] : 'DE-ONLINE';

async function main() {
  log.info(`Seed orchestrator: curriculum + questions + blueprint for Unit ${unit} (${langs.join('/')}).`);
  
  try {
    // Seed curriculum for all languages
    for (const lang of langs) {
      await seedCurriculum(unit, lang, jurisdiction, course);
    }
    
    // Seed questions for all languages
    for (const lang of langs) {
      await seedQuestions(unit, lang, jurisdiction, course);
    }
    
    // Seed blueprint
    await seedBlueprint(unit, jurisdiction, course);
    
    log.ok(`Successfully seeded Unit ${unit} for ${jurisdiction}/${course}`);
  } catch (error) {
    log.err(`Failed to seed Unit ${unit}:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
