#!/usr/bin/env node
import { execSync } from 'node:child_process';

const REPO = 'rms730/permit-school';
const BRANCH = 'feature/language-switcher';

function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('Error getting current commit:', error.message);
    process.exit(1);
  }
}

function getCheckRuns(commitSha) {
  try {
    const response = execSync(
      `curl -s "https://api.github.com/repos/${REPO}/commits/${commitSha}/check-runs"`,
      { encoding: 'utf8' }
    );
    return JSON.parse(response);
  } catch (error) {
    console.error('Error fetching check runs:', error.message);
    return { check_runs: [] };
  }
}

function formatStatus(checkRun) {
  const status = checkRun.status;
  const conclusion = checkRun.conclusion;
  
  if (status === 'completed') {
    if (conclusion === 'success') {
      return '✅ SUCCESS';
    } else if (conclusion === 'failure') {
      return '❌ FAILED';
    } else if (conclusion === 'cancelled') {
      return '🚫 CANCELLED';
    } else {
      return `❓ ${conclusion?.toUpperCase() || 'UNKNOWN'}`;
    }
  } else if (status === 'in_progress') {
    return '🔄 RUNNING';
  } else if (status === 'queued') {
    return '⏳ QUEUED';
  } else {
    return `❓ ${status?.toUpperCase() || 'UNKNOWN'}`;
  }
}

function displayStatus(checkRuns) {
  const now = new Date().toLocaleTimeString();
  console.log(`\n🕐 ${now} - CI Status for ${REPO}#${BRANCH}:`);
  console.log('='.repeat(60));
  
  if (!checkRuns.check_runs || checkRuns.check_runs.length === 0) {
    console.log('No check runs found');
    return;
  }
  
  const sortedRuns = checkRuns.check_runs.sort((a, b) => {
    // Sort by status: running first, then completed
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
    return a.name.localeCompare(b.name);
  });
  
  let completed = 0;
  let running = 0;
  let failed = 0;
  
  sortedRuns.forEach(run => {
    const status = formatStatus(run);
    console.log(`${status.padEnd(15)} ${run.name}`);
    
    if (run.status === 'completed') {
      completed++;
      if (run.conclusion === 'failure') failed++;
    } else if (run.status === 'in_progress') {
      running++;
    }
  });
  
  console.log('='.repeat(60));
  console.log(`📊 Summary: ${completed} completed, ${running} running, ${failed} failed`);
  
  if (running === 0 && failed === 0) {
    console.log('🎉 All checks completed successfully!');
  } else if (failed > 0) {
    console.log('⚠️  Some checks failed');
  } else if (running > 0) {
    console.log('⏳ Still waiting for checks to complete...');
  }
}

function monitor() {
  const commitSha = getCurrentCommit();
  console.log(`Monitoring CI for commit: ${commitSha.substring(0, 8)}`);
  
  // Initial check
  const checkRuns = getCheckRuns(commitSha);
  displayStatus(checkRuns);
  
  // Check if all are completed
  const allCompleted = checkRuns.check_runs?.every(run => run.status === 'completed');
  const anyFailed = checkRuns.check_runs?.some(run => run.status === 'completed' && run.conclusion === 'failure');
  
  if (allCompleted) {
    if (anyFailed) {
      console.log('\n❌ Some checks failed. Check the GitHub UI for details.');
    } else {
      console.log('\n✅ All checks passed!');
    }
    process.exit(0);
  }
  
  // Continue monitoring
  console.log('\n⏰ Will check again in 30 seconds...');
  setTimeout(() => monitor(), 30000);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Monitoring stopped');
  process.exit(0);
});

monitor();
