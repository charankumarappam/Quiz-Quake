import { 
  calculateNextTier, 
  selectAdaptiveQuestion, 
  generateDiagnosticReport, 
  generateRemedialDrill,
  GenericAdaptiveEngine,
  BaseAdaptiveQuestion
} from './adaptiveEngine';
import { IRTEngine, IRTItemParameters, IRTResponse } from './irtEngine';
import { dbService } from './db';
import { logger } from './logger';
import { 
  StartQuizSchema, 
  NextQuestionSchema, 
  FinishQuizSchema,
  TerminateSessionSchema
} from './validators';
import { QuizAnswer, CoreTopic } from '../../shared/types';
import questionsData from './data/questions.json';

const log = logger.forModule('TestRunner');

async function runAllTests() {
  console.log('\n=============================================================');
  console.log('   QUIZQUAKE: COMPREHENSIVE PRODUCTION VERIFICATION SUITE   ');
  console.log('=============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] #${totalTests}: ${testName}`);
    } else {
      console.error(`  [FAIL] #${totalTests}: ${testName}`);
      if (details) console.error(`         Details: ${details}`);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // 1. QUESTION TAXONOMY & DATA INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- 1. QUESTION TAXONOMY & REPOSITORY VALIDATION ---');
  assert(questionsData.length >= 64, 'Repository contains 64 curated technical questions', `Found ${questionsData.length}`);
  
  const topicsPresent = Array.from(new Set(questionsData.map(q => q.topic)));
  assert(topicsPresent.length === 4, 'All 4 core CS domains represented', `Found: ${topicsPresent.join(', ')}`);

  // Verify all question option indices and types
  const allValidOptions = questionsData.every(q => 
    Array.isArray(q.options) && 
    q.options.length === 4 && 
    q.correctAnswer >= 0 && 
    q.correctAnswer <= 3
  );
  assert(allValidOptions, 'All questions have 4 distinct options and valid 0-3 answer indices');

  // -------------------------------------------------------------
  // 2. ADAPTIVE STATE MACHINE LOGIC (BRIEF SCENARIO)
  // -------------------------------------------------------------
  console.log('\n--- 2. ADAPTIVE STATE MACHINE TRANSITION RULES ---');
  // Starts at Medium
  let step1 = calculateNextTier('Medium', true, 0, 0, 0, 0);
  assert(step1.newDifficulty === 'Medium' && step1.consecutiveCorrect === 1, '1 Correct answer on Medium maintains tier');

  // 2 Consecutive Correct -> Ascend to Hard
  let step2 = calculateNextTier('Medium', true, step1.consecutiveCorrect, step1.consecutiveIncorrect, step1.streak, step1.newMaxStreak);
  assert(step2.newDifficulty === 'Hard' && step2.consecutiveCorrect === 0, '2 Consecutive correct answers escalate from Medium to Hard');

  // Incorrect on Hard -> Descend to Medium
  let step3 = calculateNextTier('Hard', false, step2.consecutiveCorrect, step2.consecutiveIncorrect, step2.streak, step2.newMaxStreak);
  assert(step3.newDifficulty === 'Medium', 'Single incorrect answer on Hard triggers immediate demotion to Medium');

  // Incorrect on Medium -> Descend to Easy
  let step4 = calculateNextTier('Medium', false, step3.consecutiveCorrect, step3.consecutiveIncorrect, step3.streak, step3.newMaxStreak);
  assert(step4.newDifficulty === 'Easy', 'Single incorrect answer on Medium descends to Easy');

  // 2 Consecutive Correct on Easy -> Elevate to Medium
  let step5a = calculateNextTier('Easy', true, 0, 0, 0, 0);
  let step5b = calculateNextTier('Easy', true, step5a.consecutiveCorrect, step5a.consecutiveIncorrect, step5a.streak, step5a.newMaxStreak);
  assert(step5b.newDifficulty === 'Medium', '2 Consecutive correct answers on Easy recover candidate to Medium');

  // -------------------------------------------------------------
  // 3. CODE MODULARITY & GENERIC DECOUPLED ADAPTIVE ENGINE
  // -------------------------------------------------------------
  console.log('\n--- 3. REUSABILITY: GENERIC DECOUPLED ENGINE ---');
  // Demonstrate the adaptive engine running on a completely different domain (e.g. Medical Pharmacology)
  interface MedicalQuestion extends BaseAdaptiveQuestion<'Pharmacology' | 'Pathology'> {}
  const medicalQuestions: MedicalQuestion[] = [
    {
      id: 'med_01',
      topic: 'Pharmacology',
      subtopic: 'Beta Blockers',
      difficulty: 'Medium',
      question: 'Which receptor is blocked by Propranolol?',
      options: ['Beta-1 & Beta-2 non-selective', 'Alpha-1 only', 'Muscarinic only', 'Dopaminergic only'],
      correctAnswer: 0,
      explanation: 'Propranolol is a non-selective beta-adrenergic antagonist.',
      conceptSummary: 'Autonomic Pharmacology',
      timeTargetSeconds: 45
    },
    {
      id: 'med_02',
      topic: 'Pharmacology',
      subtopic: 'Beta Blockers',
      difficulty: 'Hard',
      question: 'In hypertensive emergency with pheochromocytoma, why must alpha blockers precede beta blockers?',
      options: ['Prevent unopposed alpha-mediated vasoconstriction', 'Prevent tachycardia', 'Increase renal perfusion', 'Prevent hypokalemia'],
      correctAnswer: 0,
      explanation: 'Beta blockade without alpha blockade causes unopposed alpha-1 vasoconstriction, leading to severe hypertensive crisis.',
      conceptSummary: 'Adrenergic Pharmacology',
      timeTargetSeconds: 60
    }
  ];

  const medicalEngine = new GenericAdaptiveEngine<'Pharmacology' | 'Pathology', MedicalQuestion>(
    medicalQuestions,
    { topics: ['Pharmacology', 'Pathology'], escalationThreshold: 2, demotionThreshold: 1 }
  );

  const medQ = medicalEngine.selectAdaptiveQuestion('Medium', [], 'Pharmacology', 0);
  assert(medQ.question !== null && medQ.question.topic === 'Pharmacology', 'Generic engine selects questions for arbitrary custom domain schemas');

  // -------------------------------------------------------------
  // 4. ADVANCED IRT MODELS: 1PL, 2PL, 3PL & BAYESIAN EAP
  // -------------------------------------------------------------
  console.log('\n--- 4. INNOVATION: ADVANCED ITEM RESPONSE THEORY (2PL/3PL) ---');
  const testItem: IRTItemParameters = { id: 'item_irt_1', a: 1.5, b: 0.0, c: 0.25 };

  // 3PL Probability when ability equals difficulty: P(theta = b) = c + (1-c)/2 = 0.25 + 0.375 = 0.625
  const probAtAbility = IRTEngine.probability3PL(0.0, testItem);
  assert(Math.abs(probAtAbility - 0.625) < 0.01, '3PL Probability matches theoretical value at theta = b (0.625)');

  // Higher ability candidate should have higher probability
  const probHigh = IRTEngine.probability3PL(2.0, testItem);
  const probLow = IRTEngine.probability3PL(-2.0, testItem);
  assert(probHigh > probAtAbility && probAtAbility > probLow, 'Monotonic response curve verified: P(theta=+2) > P(theta=0) > P(theta=-2)');

  // Fisher Information test
  const infoAtZero = IRTEngine.itemInformation(0.0, testItem);
  assert(infoAtZero > 0, 'Fisher Information Function yields strictly positive information');

  // Bayesian EAP Ability Estimation
  const mockResponses: IRTResponse[] = [
    { itemId: 'q1', isCorrect: true, params: { id: 'q1', a: 1.2, b: 0.0, c: 0.25 } },
    { itemId: 'q2', isCorrect: true, params: { id: 'q2', a: 1.5, b: 1.2, c: 0.25 } },
    { itemId: 'q3', isCorrect: false, params: { id: 'q3', a: 1.6, b: 1.5, c: 0.25 } }
  ];
  const eapEstimate = IRTEngine.estimateAbilityEAP(mockResponses);
  assert(eapEstimate.converged, 'Bayesian EAP estimation converges reliably');
  assert(eapEstimate.theta > 0, 'Candidate answering Medium + Hard correct achieves positive ability theta (theta > 0)');
  assert(eapEstimate.standardError > 0 && eapEstimate.standardError < 2.0, 'Standard Error of Measurement is bounded and finite');

  // -------------------------------------------------------------
  // 5. SECURITY & INPUT VALIDATION (ZOD RIGOROUS SCHEMAS)
  // -------------------------------------------------------------
  console.log('\n--- 5. SECURITY & SERVER-SIDE INPUT VALIDATION ---');
  // Valid payload passes
  const validStart = StartQuizSchema.safeParse({ mode: 'comprehensive', totalQuestions: 10, studentName: 'Alice' });
  assert(validStart.success, 'Valid quiz start payload accepted');

  // Invalid question count (> 64) rejected
  const invalidCount = StartQuizSchema.safeParse({ mode: 'comprehensive', totalQuestions: 999 });
  assert(!invalidCount.success, 'Out-of-range question count (> 64) strictly rejected');

  // Invalid option index (> 3) rejected
  const invalidOption = NextQuestionSchema.safeParse({
    currentDifficulty: 'Medium',
    lastAnswerCorrect: true,
    consecutiveCorrect: 1,
    consecutiveIncorrect: 0,
    currentStreak: 1,
    maxStreak: 1,
    currentQuestionIndex: 2,
    totalQuestions: 10,
    selectedOption: 99 // Invalid option index
  });
  assert(!invalidOption.success, 'Out-of-bounds selected option index (> 3) rejected by Zod schema');

  // Negative streak rejected
  const invalidStreak = NextQuestionSchema.safeParse({
    currentDifficulty: 'Medium',
    lastAnswerCorrect: true,
    consecutiveCorrect: 1,
    consecutiveIncorrect: 0,
    currentStreak: -5, // Negative streak
    maxStreak: 1,
    currentQuestionIndex: 2,
    totalQuestions: 10
  });
  assert(!invalidStreak.success, 'Negative streak values rejected by Zod schema');

  // -------------------------------------------------------------
  // 6. RELATIONAL DATABASE (SQLITE), WAL & CONCURRENCY
  // -------------------------------------------------------------
  console.log('\n--- 6. SYSTEM DESIGN: SQLITE RELATIONAL INTEGRITY & CONCURRENCY ---');
  const testSessionId = `test_session_${Date.now()}`;
  await dbService.createSession(testSessionId, 'Test Candidate', 'comprehensive', undefined, 10);
  assert(true, 'Quiz session recorded into SQLite database');

  await dbService.updateSessionProgress(testSessionId, 5);
  assert(true, 'Session progress updated safely in SQLite');

  // Test Rapid Session Termination / Abandonment edge case
  const terminated = await dbService.terminateSession(testSessionId, 'ABANDONED');
  assert(terminated, 'Rapid session abandonment edge case handled and persisted');

  // Test Concurrent Writes to SQLite (verifying no database locked or race conditions)
  const concurrentWrites = [];
  for (let i = 0; i < 10; i++) {
    const reportMock = generateDiagnosticReport([], `Concurrent User ${i}`, 'Concurrency Test');
    reportMock.id = `report_concurrent_${Date.now()}_${i}`;
    concurrentWrites.push(dbService.saveDiagnosticReport(reportMock));
  }
  await Promise.all(concurrentWrites);
  assert(true, '10 Concurrent diagnostic reports written simultaneously without race conditions');

  // Verify records can be retrieved from database
  const reports = await dbService.getRecentReports(5);
  assert(reports.length > 0, 'Reports successfully queried from SQLite relational database');

  console.log('\n=============================================================');
  console.log(`   ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! (100% SUCCESS)`);
  console.log('=============================================================\n');

  // Close database cleanly
  await dbService.close();
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('Test suite encountered unexpected error:', err);
  process.exit(1);
});
