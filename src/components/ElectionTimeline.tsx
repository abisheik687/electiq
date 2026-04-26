import { useElectionData } from '../hooks/useElectionData';
import { useTranslation } from '../hooks/useTranslation';
import styles from './ElectionTimeline.module.css';

interface ElectionTimelineProps {
  onAskAi: (prompt: string) => void;
}

export default function ElectionTimeline({ onAskAi }: ElectionTimelineProps) {
  const { steps, loading } = useElectionData();
  const { translate } = useTranslation();

  if (loading) {
    return <div className={styles.loading}>{translate('Loading timeline...')}</div>;
  }

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.timelineTitle}>{translate('Election Timeline')}</h2>
      <div className={styles.stepsWrapper}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.stepCard} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepContent}>
              <h3>{translate(step.title)}</h3>
              <p className={styles.deadline}>{translate('Deadline:')} {translate(step.deadline)}</p>
              <p className={styles.description}>{translate(step.description)}</p>
              <button 
                className={styles.askButton} 
                onClick={() => onAskAi(step.prompt)}
                aria-label={`${translate('Ask AI about')} ${translate(step.title)}`}
              >
                {translate('Ask AI about this')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
