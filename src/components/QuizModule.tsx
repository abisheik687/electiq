import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import FocusTrap from 'focus-trap-react';
import styles from './QuizModule.module.css';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizModule() {
  const { translate } = useTranslation();
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const questionHeaderRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const tokenRes = await fetch('/api/token');
        const { token } = await tokenRes.json();
        
        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ topic: 'civic knowledge and US elections' })
        });
        if (!response.ok) throw new Error('Failed to fetch quiz questions');
        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    
    if (idx === questions[currentQ].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOpt(null);
      setAnswered(false);
      setTimeout(() => {
        questionHeaderRef.current?.focus();
      }, 50);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResults(false);
    setSelectedOpt(null);
    setAnswered(false);
  };

  if (loading) return <div role="status" aria-live="polite" className={styles.quizContainer}>{translate('Loading quiz questions...')}</div>;
  if (error) return <div role="alert" className={styles.quizContainer}>{translate(error)}</div>;
  if (!questions.length) return <div role="alert" className={styles.quizContainer}>{translate('No questions available.')}</div>;

  if (showResults) {
    return (
      <div className={styles.quizContainer}>
        <h2 className={styles.title}>{translate('Quiz Results')}</h2>
        <div className={styles.resultsCard}>
          <p className={styles.scoreText}>
            {translate('You scored')} {score} {translate('out of')} {questions.length}
          </p>
          <button className={styles.button} onClick={restartQuiz}>{translate('Retake Quiz')}</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className={styles.quizContainer}>
      <h2 className={styles.title}>{translate('Civic Knowledge Quiz')}</h2>
      <FocusTrap active={!showResults} focusTrapOptions={{ initialFocus: false }}>
        <div className={styles.questionCard}>
          <p className={styles.progress}>{translate('Question')} {currentQ + 1} / {questions.length}</p>
          <h3 ref={questionHeaderRef} tabIndex={-1} className={styles.questionText} data-testid={`quiz-question-${currentQ + 1}`}>{translate(q.question)}</h3>
          <div className={styles.options}>
            {q.options.map((opt, idx) => {
              let btnClass = styles.optionBtn;
              if (answered) {
                // Determine styling based on correctness
                // We'll just add logic to highlight the correct one
                const isCorrect = opt === q.correctAnswer;
                if (isCorrect) btnClass += ` ${styles.correct}`;
                else if (idx === selectedOpt) btnClass += ` ${styles.incorrect}`;
              }
              return (
                <button 
                  key={idx} 
                  data-testid={`quiz-option-${idx}`}
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
            <div aria-live="polite" className={styles.explanation}>
              <p><strong>{translate('Explanation:')}</strong> {translate(q.explanation)}</p>
              <button className={styles.button} onClick={nextQuestion}>
                {currentQ < questions.length - 1 ? translate('Next Question') : translate('See Results')}
              </button>
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}
