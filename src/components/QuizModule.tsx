import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import styles from './QuizModule.module.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "How does the Electoral College work?",
    options: [
      "Popular vote directly elects the president",
      "Electors representing states vote for the president",
      "Congress appoints the president",
      "The Supreme Court decides"
    ],
    answer: 1,
    explanation: "The president is elected by electors, whose number is based on each state's representation in Congress."
  },
  {
    id: 2,
    question: "What is a primary election?",
    options: [
      "The final election for office",
      "An election to choose party candidates",
      "A vote on local laws",
      "A poll to gauge public opinion"
    ],
    answer: 1,
    explanation: "Primary elections are held by political parties to choose their candidates for the general election."
  }
];

export default function QuizModule() {
  const { translate } = useTranslation();
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);

  const handleOptionSelect = (idx: number) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    
    if (idx === QUESTIONS[currentQ].answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setShowResults(true);
      // In a real app, save to Firebase here
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResults(false);
    setSelectedOpt(null);
    setAnswered(false);
  };

  if (showResults) {
    return (
      <div className={styles.quizContainer}>
        <h2 className={styles.title}>{translate('Quiz Results')}</h2>
        <div className={styles.resultsCard}>
          <p className={styles.scoreText}>
            {translate('You scored')} {score} {translate('out of')} {QUESTIONS.length}
          </p>
          <button className={styles.button} onClick={restartQuiz}>{translate('Retake Quiz')}</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className={styles.quizContainer}>
      <h2 className={styles.title}>{translate('Civic Knowledge Quiz')}</h2>
      <div className={styles.questionCard}>
        <p className={styles.progress}>{translate('Question')} {currentQ + 1} / {QUESTIONS.length}</p>
        <h3 className={styles.questionText}>{translate(q.question)}</h3>
        <div className={styles.options}>
          {q.options.map((opt, idx) => {
            let btnClass = styles.optionBtn;
            if (answered) {
              if (idx === q.answer) btnClass += ` ${styles.correct}`;
              else if (idx === selectedOpt) btnClass += ` ${styles.incorrect}`;
            }
            return (
              <button 
                key={idx} 
                className={btnClass}
                onClick={() => handleOptionSelect(idx)}
                disabled={answered}
              >
                {translate(opt)}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={styles.explanation}>
            <p><strong>{translate('Explanation:')}</strong> {translate(q.explanation)}</p>
            <button className={styles.button} onClick={nextQuestion}>
              {currentQ < QUESTIONS.length - 1 ? translate('Next Question') : translate('See Results')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
