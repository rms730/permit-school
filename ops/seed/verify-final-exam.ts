import 'dotenv-flow/config';
import { createClient } from '@supabase/supabase-js';

function reqEnv(name:string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function main() {
  const supabase = createClient(reqEnv('SUPABASE_URL'), reqEnv('SUPABASE_SERVICE_ROLE_KEY'));

  // Find CA/DE-ONLINE
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id, jurisdictions(id, code)')
    .eq('code', 'DE-ONLINE')
    .maybeSingle();
  if (courseErr) throw courseErr;
  if (!course || course.jurisdictions?.code !== 'CA') throw new Error('Course CA/DE-ONLINE not found');

  // Get jurisdiction config
  const { data: config, error: configErr } = await supabase
    .from('jurisdiction_configs')
    .select('final_exam_questions, final_exam_pass_pct')
    .eq('jurisdiction_id', course.jurisdictions.id)
    .maybeSingle();
  if (configErr) throw configErr;

  // Active blueprint
  const { data: bp, error: bpErr } = await supabase
    .from('exam_blueprints')
    .select('id, total_questions')
    .eq('course_id', course.id)
    .eq('is_active', true)
    .maybeSingle();
  if (bpErr) throw bpErr;
  if (!bp) throw new Error('Active final blueprint not found');

  // Rules present
  const { data: rules, error: rulesErr } = await supabase
    .from('exam_blueprint_rules')
    .select('rule_no, skill, count')
    .eq('blueprint_id', bp.id)
    .order('rule_no', { ascending: true });
  if (rulesErr) throw rulesErr;
  if (!rules?.length) throw new Error('No rules found for final blueprint');

  const sum = rules.reduce((s,r)=>s+(r.count||0),0);
  if (sum !== bp.total_questions) {
    throw new Error(`Rule count sum ${sum} != total_questions ${bp.total_questions}`);
  }

  // Check question coverage
  const { data: questions, error: questionsErr } = await supabase
    .from('question_bank')
    .select('id, skill, difficulty, status')
    .eq('course_id', course.id)
    .eq('status', 'approved');
  if (questionsErr) throw questionsErr;

  const skillCounts = new Map<string, number>();
  for (const q of questions || []) {
    skillCounts.set(q.skill, (skillCounts.get(q.skill) || 0) + 1);
  }

  console.log('✅ Final exam blueprint verified:', {
    total: bp.total_questions,
    rules: rules.length,
    passPct: config?.final_exam_pass_pct ?? 0.8,
    availableQuestions: questions?.length || 0,
    skills: skillCounts.size
  });

  console.log('📊 Rule breakdown:');
  for (const rule of rules) {
    const available = skillCounts.get(rule.skill) || 0;
    console.log(`  - ${rule.skill}: ${rule.count} required, ${available} available`);
  }
}

main().catch((e) => { 
  console.error('❌ Verification failed:', e); 
  process.exit(1); 
});
