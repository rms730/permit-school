import 'dotenv-flow/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

type SkillCfg = { skill:string; weight:number; units:number[]; tags:string[] };
type BlueprintCfg = {
  j_code:string;
  course_code:string;
  questions:{ fromConfig:boolean; countEnv?:string };
  passPctFromConfig:boolean;
  skills: SkillCfg[];
  difficulty: { d1:number; d2:number; d3:number; d4:number; d5:number };
  minPerUnit:number;
  maxPerSkillClamp:number;
};

const ROOT = path.resolve(process.cwd());
const cfgPath = path.join(ROOT, 'ops/seed/questions/CA/DE-ONLINE/final.blueprint.json');

function reqEnv(name:string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function admin() {
  const url = reqEnv('SUPABASE_URL');
  const key = reqEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readConfig(): Promise<BlueprintCfg> {
  const raw = await fs.readFile(cfgPath, 'utf8');
  return JSON.parse(raw);
}

async function getCourseId(supabase:any, jCode:string, courseCode:string) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, jurisdictions(code)')
    .eq('code', courseCode)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.jurisdictions?.code !== jCode) {
    throw new Error(`Course not found for ${jCode}/${courseCode}`);
  }
  return data.id;
}

async function getJurisdictionConfig(supabase:any, courseId:string) {
  // First get the course with jurisdiction info
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('jurisdiction_id')
    .eq('id', courseId)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!course) throw new Error('Course not found');

  // Then get the jurisdiction config
  const { data: config, error: configError } = await supabase
    .from('jurisdiction_configs')
    .select('final_exam_questions, final_exam_pass_pct')
    .eq('jurisdiction_id', course.jurisdiction_id)
    .maybeSingle();
  if (configError) throw configError;
  
  return { 
    count: config?.final_exam_questions ?? 30, 
    passPct: config?.final_exam_pass_pct ?? 0.8 
  };
}

// Generate exam questions for gaps
function generateExamQuestions(skill: string, difficulty: number, count: number): any[] {
  const questions = [];
  
  const questionTemplates = {
    'signs-and-signals': [
      {
        stem: "What does a red octagonal sign mean?",
        choices: [
          { key: "A", text: "Yield to other traffic" },
          { key: "B", text: "Stop completely before proceeding" },
          { key: "C", text: "Slow down and be prepared to stop" },
          { key: "D", text: "Merge with traffic" }
        ],
        answer: "B",
        explanation: "A red octagonal sign is a stop sign. You must come to a complete stop before the stop line or crosswalk, and wait until it is safe to proceed."
      },
      {
        stem: "A yellow traffic light means:",
        choices: [
          { key: "A", text: "Go if the intersection is clear" },
          { key: "B", text: "Stop if you can do so safely" },
          { key: "C", text: "Speed up to get through quickly" },
          { key: "D", text: "Turn right only" }
        ],
        answer: "B",
        explanation: "A yellow light means the signal is about to turn red. You should stop if you can do so safely, but you may proceed if you are too close to stop safely."
      }
    ],
    'right-of-way': [
      {
        stem: "At a four-way stop, who has the right-of-way?",
        choices: [
          { key: "A", text: "The vehicle on the left" },
          { key: "B", text: "The vehicle on the right" },
          { key: "C", text: "The first vehicle to arrive" },
          { key: "D", text: "The larger vehicle" }
        ],
        answer: "C",
        explanation: "At a four-way stop, the first vehicle to arrive has the right-of-way. If two vehicles arrive at the same time, the vehicle on the right goes first."
      }
    ],
    'turns-parking': [
      {
        stem: "When making a left turn at an intersection, you should:",
        choices: [
          { key: "A", text: "Turn from the right lane" },
          { key: "B", text: "Turn from the left lane closest to the center line" },
          { key: "C", text: "Turn from any lane" },
          { key: "D", text: "Turn from the far right lane" }
        ],
        answer: "B",
        explanation: "When making a left turn, you should turn from the left lane closest to the center line. This keeps you in the proper lane for the turn."
      }
    ],
    'sharing-the-road': [
      {
        stem: "When approaching a pedestrian in a crosswalk, you should:",
        choices: [
          { key: "A", text: "Honk to warn them" },
          { key: "B", text: "Speed up to get past quickly" },
          { key: "C", text: "Stop and yield the right-of-way" },
          { key: "D", text: "Drive around them" }
        ],
        answer: "C",
        explanation: "Pedestrians in crosswalks have the right-of-way. You must stop and yield to them, even if the light is green."
      }
    ],
    'freeways': [
      {
        stem: "When merging onto a freeway, you should:",
        choices: [
          { key: "A", text: "Stop and wait for a gap" },
          { key: "B", text: "Match the speed of traffic and merge smoothly" },
          { key: "C", text: "Speed up to pass other vehicles" },
          { key: "D", text: "Slow down to let others pass" }
        ],
        answer: "B",
        explanation: "When merging onto a freeway, you should match the speed of traffic and merge smoothly. This helps maintain traffic flow and prevents accidents."
      }
    ],
    'adverse-conditions': [
      {
        stem: "When driving in fog, you should:",
        choices: [
          { key: "A", text: "Use high beam headlights" },
          { key: "B", text: "Use low beam headlights and slow down" },
          { key: "C", text: "Turn off all lights" },
          { key: "D", text: "Speed up to get through quickly" }
        ],
        answer: "B",
        explanation: "In fog, use low beam headlights and slow down. High beams can reflect off the fog and reduce visibility further."
      }
    ],
    'speed-space': [
      {
        stem: "The three-second rule for following distance means:",
        choices: [
          { key: "A", text: "Stay three car lengths behind" },
          { key: "B", text: "Count three seconds from when the car ahead passes a point" },
          { key: "C", text: "Drive three seconds apart" },
          { key: "D", text: "Wait three seconds at stop signs" }
        ],
        answer: "B",
        explanation: "The three-second rule means you should be able to count three seconds from when the car ahead passes a point until you reach that same point."
      }
    ],
    'alcohol-drugs': [
      {
        stem: "What is the legal blood alcohol concentration (BAC) limit for drivers under 21?",
        choices: [
          { key: "A", text: "0.08%" },
          { key: "B", text: "0.05%" },
          { key: "C", text: "0.02%" },
          { key: "D", text: "0.01%" }
        ],
        answer: "D",
        explanation: "For drivers under 21, the legal BAC limit is 0.01%. This is a zero-tolerance policy to prevent underage drinking and driving."
      }
    ],
    'emergencies': [
      {
        stem: "If you are involved in a collision, you should:",
        choices: [
          { key: "A", text: "Leave the scene immediately" },
          { key: "B", text: "Stop and exchange information with other drivers" },
          { key: "C", text: "Move your vehicle to the side of the road" },
          { key: "D", text: "Call your insurance company first" }
        ],
        answer: "B",
        explanation: "If you are involved in a collision, you must stop and exchange information with other drivers, including name, address, license number, and insurance information."
      }
    ],
    'lane-control': [
      {
        stem: "When driving on a multi-lane highway, you should:",
        choices: [
          { key: "A", text: "Stay in the left lane" },
          { key: "B", text: "Stay in the right lane except when passing" },
          { key: "C", text: "Drive in the center lane" },
          { key: "D", text: "Switch lanes frequently" }
        ],
        answer: "B",
        explanation: "On multi-lane highways, you should stay in the right lane except when passing. The left lane is for passing and faster traffic."
      }
    ],
    'licensing-admin': [
      {
        stem: "How often must you renew your driver's license in California?",
        choices: [
          { key: "A", text: "Every year" },
          { key: "B", text: "Every 2 years" },
          { key: "C", text: "Every 5 years" },
          { key: "D", text: "Every 10 years" }
        ],
        answer: "C",
        explanation: "In California, driver's licenses must be renewed every 5 years. You will receive a renewal notice in the mail before your license expires."
      }
    ]
  };

  const templates = questionTemplates[skill as keyof typeof questionTemplates] || questionTemplates['signs-and-signals'];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    questions.push({
      ...template,
      skill,
      difficulty,
      tags: ['final', `unit:${Math.floor(Math.random() * 12) + 1}`, ...(Math.random() > 0.5 ? ['dmv:exam'] : [])],
      status: 'approved'
    });
  }
  
  return questions;
}

// Generate Spanish translations
function generateSpanishTranslations(questions: any[]): any[] {
  const translations = [];
  
  const spanishTemplates = {
    'signs-and-signals': [
      {
        stem: "¿Qué significa una señal octagonal roja?",
        choices: [
          { key: "A", text: "Ceder el paso a otro tráfico" },
          { key: "B", text: "Detenerse completamente antes de continuar" },
          { key: "C", text: "Reducir la velocidad y estar preparado para detenerse" },
          { key: "D", text: "Incorporarse al tráfico" }
        ],
        explanation: "Una señal octagonal roja es una señal de alto. Debes detenerte completamente antes de la línea de alto o cruce peatonal, y esperar hasta que sea seguro continuar."
      },
      {
        stem: "Una luz de tráfico amarilla significa:",
        choices: [
          { key: "A", text: "Avanzar si la intersección está despejada" },
          { key: "B", text: "Detenerse si puede hacerlo de manera segura" },
          { key: "C", text: "Acelerar para pasar rápidamente" },
          { key: "D", text: "Girar solo a la derecha" }
        ],
        explanation: "Una luz amarilla significa que la señal está a punto de cambiar a roja. Debes detenerte si puedes hacerlo de manera segura, pero puedes continuar si estás demasiado cerca para detenerte de manera segura."
      }
    ],
    'right-of-way': [
      {
        stem: "En un alto de cuatro direcciones, ¿quién tiene el derecho de paso?",
        choices: [
          { key: "A", text: "El vehículo de la izquierda" },
          { key: "B", text: "El vehículo de la derecha" },
          { key: "C", text: "El primer vehículo en llegar" },
          { key: "D", text: "El vehículo más grande" }
        ],
        explanation: "En un alto de cuatro direcciones, el primer vehículo en llegar tiene el derecho de paso. Si dos vehículos llegan al mismo tiempo, el vehículo de la derecha va primero."
      }
    ],
    'turns-parking': [
      {
        stem: "Al hacer un giro a la izquierda en una intersección, debes:",
        choices: [
          { key: "A", text: "Girar desde el carril derecho" },
          { key: "B", text: "Girar desde el carril izquierdo más cercano a la línea central" },
          { key: "C", text: "Girar desde cualquier carril" },
          { key: "D", text: "Girar desde el carril más a la derecha" }
        ],
        explanation: "Al hacer un giro a la izquierda, debes girar desde el carril izquierdo más cercano a la línea central. Esto te mantiene en el carril apropiado para el giro."
      }
    ],
    'sharing-the-road': [
      {
        stem: "Al acercarte a un peatón en un cruce peatonal, debes:",
        choices: [
          { key: "A", text: "Tocar la bocina para advertirle" },
          { key: "B", text: "Acelerar para pasar rápidamente" },
          { key: "C", text: "Detenerte y ceder el derecho de paso" },
          { key: "D", text: "Conducir alrededor de él" }
        ],
        explanation: "Los peatones en cruces peatonales tienen el derecho de paso. Debes detenerte y cederles el paso, incluso si la luz está verde."
      }
    ],
    'freeways': [
      {
        stem: "Al incorporarte a una autopista, debes:",
        choices: [
          { key: "A", text: "Detenerte y esperar un espacio" },
          { key: "B", text: "Igualar la velocidad del tráfico e incorporarte suavemente" },
          { key: "C", text: "Acelerar para pasar otros vehículos" },
          { key: "D", text: "Reducir la velocidad para dejar que otros pasen" }
        ],
        explanation: "Al incorporarte a una autopista, debes igualar la velocidad del tráfico e incorporarte suavemente. Esto ayuda a mantener el flujo del tráfico y previene accidentes."
      }
    ],
    'adverse-conditions': [
      {
        stem: "Al conducir en niebla, debes:",
        choices: [
          { key: "A", text: "Usar luces altas" },
          { key: "B", text: "Usar luces bajas y reducir la velocidad" },
          { key: "C", text: "Apagar todas las luces" },
          { key: "D", text: "Acelerar para pasar rápidamente" }
        ],
        explanation: "En niebla, usa luces bajas y reduce la velocidad. Las luces altas pueden reflejarse en la niebla y reducir aún más la visibilidad."
      }
    ],
    'speed-space': [
      {
        stem: "La regla de tres segundos para la distancia de seguimiento significa:",
        choices: [
          { key: "A", text: "Mantener tres longitudes de auto detrás" },
          { key: "B", text: "Contar tres segundos desde que el auto de adelante pasa un punto" },
          { key: "C", text: "Conducir con tres segundos de separación" },
          { key: "D", text: "Esperar tres segundos en las señales de alto" }
        ],
        explanation: "La regla de tres segundos significa que debes poder contar tres segundos desde que el auto de adelante pasa un punto hasta que tú llegues a ese mismo punto."
      }
    ],
    'alcohol-drugs': [
      {
        stem: "¿Cuál es el límite legal de concentración de alcohol en sangre (BAC) para conductores menores de 21 años?",
        choices: [
          { key: "A", text: "0.08%" },
          { key: "B", text: "0.05%" },
          { key: "C", text: "0.02%" },
          { key: "D", text: "0.01%" }
        ],
        explanation: "Para conductores menores de 21 años, el límite legal de BAC es 0.01%. Esta es una política de tolerancia cero para prevenir el consumo de alcohol y conducción por menores de edad."
      }
    ],
    'emergencies': [
      {
        stem: "Si estás involucrado en una colisión, debes:",
        choices: [
          { key: "A", text: "Abandonar la escena inmediatamente" },
          { key: "B", text: "Detenerte e intercambiar información con otros conductores" },
          { key: "C", text: "Mover tu vehículo al lado de la carretera" },
          { key: "D", text: "Llamar a tu compañía de seguros primero" }
        ],
        explanation: "Si estás involucrado en una colisión, debes detenerte e intercambiar información con otros conductores, incluyendo nombre, dirección, número de licencia e información de seguro."
      }
    ],
    'lane-control': [
      {
        stem: "Al conducir en una autopista de múltiples carriles, debes:",
        choices: [
          { key: "A", text: "Mantenerte en el carril izquierdo" },
          { key: "B", text: "Mantenerte en el carril derecho excepto al pasar" },
          { key: "C", text: "Conducir en el carril central" },
          { key: "D", text: "Cambiar de carril frecuentemente" }
        ],
        explanation: "En autopistas de múltiples carriles, debes mantenerte en el carril derecho excepto al pasar. El carril izquierdo es para pasar y tráfico más rápido."
      }
    ],
    'licensing-admin': [
      {
        stem: "¿Con qué frecuencia debes renovar tu licencia de conducir en California?",
        choices: [
          { key: "A", text: "Cada año" },
          { key: "B", text: "Cada 2 años" },
          { key: "C", text: "Cada 5 años" },
          { key: "D", text: "Cada 10 años" }
        ],
        explanation: "En California, las licencias de conducir deben renovarse cada 5 años. Recibirás un aviso de renovación por correo antes de que expire tu licencia."
      }
    ]
  };

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const templates = spanishTemplates[question.skill as keyof typeof spanishTemplates] || spanishTemplates['signs-and-signals'];
    const template = templates[i % templates.length];
    
    translations.push({
      question_id: `temp_${i}`, // Will be updated after insertion
      stem: template.stem,
      choices: template.choices,
      explanation: template.explanation,
      lang: 'es'
    });
  }
  
  return translations;
}

async function ensureQuestionCoverage(supabase: any, courseId: string, cfg: BlueprintCfg, jc: any, desiredCount: number) {
  const perSkill = new Map<string, number>();
  const perDifficulty = new Map<number, number>();
  let total = 0;

  // Calculate target counts per skill
  for (const skill of cfg.skills) {
    const targetCount = Math.round(desiredCount * skill.weight);
    perSkill.set(skill.skill, targetCount);
    total += targetCount;
  }

  // Adjust for rounding errors
  if (total !== desiredCount) {
    const diff = desiredCount - total;
    const largestSkill = cfg.skills.reduce((a, b) => perSkill.get(a.skill)! > perSkill.get(b.skill)! ? a : b);
    perSkill.set(largestSkill.skill, perSkill.get(largestSkill.skill)! + diff);
  }

  // Calculate difficulty distribution
  for (let d = 1; d <= 5; d++) {
    const targetCount = Math.round(total * cfg.difficulty[`d${d}` as keyof typeof cfg.difficulty]);
    perDifficulty.set(d, targetCount);
  }

  // Check existing questions and generate missing ones
  for (const skill of cfg.skills) {
    const targetCount = perSkill.get(skill.skill)!;
    
    // Check existing approved questions for this skill
    const { data: existingQuestions } = await supabase
      .from('question_bank')
      .select('id, difficulty')
      .eq('course_id', courseId)
      .eq('skill', skill.skill)
      .eq('status', 'approved')
      .in('difficulty', [1, 2, 3, 4]);

    const existingCount = existingQuestions?.length || 0;
    const neededCount = Math.max(0, targetCount - existingCount);

    if (neededCount > 0) {
      console.log(`Generating ${neededCount} questions for skill: ${skill.skill}`);
      
      // Generate questions with difficulty distribution
      const questions = [];
      for (let d = 1; d <= 4; d++) {
        const difficultyCount = Math.round(neededCount * cfg.difficulty[`d${d}` as keyof typeof cfg.difficulty]);
        if (difficultyCount > 0) {
          const newQuestions = generateExamQuestions(skill.skill, d, difficultyCount);
          questions.push(...newQuestions);
        }
      }

      // Insert English questions
      if (questions.length > 0) {
        const { data: insertedQuestions, error: insertError } = await supabase
          .from('question_bank')
          .insert(questions.map(q => ({
            course_id: courseId,
            stem: q.stem,
            choices: q.choices,
            answer: q.answer,
            explanation: q.explanation,
            skill: q.skill,
            difficulty: q.difficulty,
            tags: q.tags,
            status: q.status,
            source_sections: [`final:${q.skill}`]
          })))
          .select('id');

        if (insertError) throw insertError;

        // Generate and insert Spanish translations
        const translations = generateSpanishTranslations(questions);
        for (let i = 0; i < insertedQuestions!.length; i++) {
          const translation = translations[i];
          translation.question_id = insertedQuestions![i].id;
          
          await supabase
            .from('question_translations')
            .insert({
              question_id: translation.question_id,
              stem: translation.stem,
              choices: translation.choices,
              explanation: translation.explanation,
              lang: 'es'
            });
        }
      }
    }
  }

  return { perSkill, perDifficulty, total };
}

async function upsertBlueprint(supabase: any, courseId: string, cfg: BlueprintCfg, totalCount: number) {
  // Deactivate existing actives
  await supabase.from('exam_blueprints')
    .update({ is_active: false })
    .eq('course_id', courseId)
    .eq('is_active', true);

  // Create active blueprint
  const { data: bp, error: bpErr } = await supabase
    .from('exam_blueprints')
    .insert({
      course_id: courseId,
      name: 'CA Final Exam (Active)',
      total_questions: totalCount,
      is_active: true
    })
    .select('id')
    .maybeSingle();
  if (bpErr) throw bpErr;

  return bp.id as string;
}

async function upsertRules(supabase: any, blueprintId: string, cfg: BlueprintCfg, resolvedCounts: Map<string, number>) {
  // Wipe rules
  await supabase.from('exam_blueprint_rules').delete().eq('blueprint_id', blueprintId);

  // Reinsert rules per skill based on resolvedCounts
  let ruleNo = 1;
  for (const skill of cfg.skills) {
    const cnt = resolvedCounts.get(skill.skill) ?? 0;
    if (cnt <= 0) continue;
    const { error } = await supabase.from('exam_blueprint_rules').insert({
      blueprint_id: blueprintId,
      rule_no: ruleNo++,
      skill: skill.skill,
      count: cnt,
      min_difficulty: 1,
      max_difficulty: 4, // clamp to 4 in blueprint; 5 reserved for corner-cases
      include_tags: skill.tags,
      exclude_tags: []
    });
    if (error) throw error;
  }
}

async function main() {
  const supabase = admin();
  const cfg = await readConfig();

  const courseId = await getCourseId(supabase, cfg.j_code, cfg.course_code);
  const jc = await getJurisdictionConfig(supabase, courseId);

  const desiredCount = Number(process.env[cfg.questions.countEnv ?? '']) || jc.count;
  if (!Number.isFinite(desiredCount) || desiredCount <= 0) {
    throw new Error(`Invalid final exam count`);
  }

  console.log(`🎯 Final Exam Configuration:`);
  console.log(`  - Course: ${cfg.j_code}/${cfg.course_code}`);
  console.log(`  - Questions: ${desiredCount}`);
  console.log(`  - Pass %: ${(jc.passPct * 100).toFixed(0)}%`);
  console.log(`  - Skills: ${cfg.skills.length}`);

  // Ensure questions exist for the desired coverage; returns actual resolved allocation
  const { perSkill, total } = await ensureQuestionCoverage(supabase, courseId, cfg, jc, desiredCount);

  // Create blueprint and rules
  const bpId = await upsertBlueprint(supabase, courseId, cfg, desiredCount);
  await upsertRules(supabase, bpId, cfg, perSkill);

  console.log(`✅ Final exam blueprint ready. Questions: ${desiredCount}. Blueprint ID: ${bpId}`);
  console.log(`📊 Skill distribution:`);
  for (const [skill, count] of perSkill.entries()) {
    console.log(`  - ${skill}: ${count} questions`);
  }
}

main().catch((e) => {
  console.error('❌ seed-final-exam failed:', e);
  process.exit(1);
});
