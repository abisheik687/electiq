import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { calendarService } from '../services/CalendarService';
import { CivicService } from '../services/CivicService';
import { ElectionEvent } from '../types/models';
import styles from './ElectionCalendar.module.css';

export default function ElectionCalendar() {
  const { translate } = useTranslation();
  const [elections, setElections] = useState<ElectionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const civicService = new CivicService();
        // Use a general address to get upcoming federal elections
        const voterInfo = await civicService.getVoterInfo('Washington, DC');
        if (voterInfo?.election) {
          setElections([voterInfo.election]);
        }
      } catch (err) {
        setError('Unable to load election dates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) return <div role="status" aria-live="polite">Loading election dates...</div>;
  if (error) return <div role="alert">{error}</div>;

  const electionCards = useMemo(() => {
    return elections.map((event) => {
      const title = event.name || event.title;
      const date = event.electionDay || event.date;
      // default dates for calendar if not provided by civic api format directly
      const start = date ? date.replace(/-/g, '') + 'T000000Z' : '20241105T000000Z';
      const end = date ? date.replace(/-/g, '') + 'T235959Z' : '20241106T000000Z';
      
      return (
        <div key={event.id || title} className={styles.eventCard}>
          <div className={styles.eventDate}>{translate(date)}</div>
          <h3 className={styles.eventTitle}>{translate(title)}</h3>
          <p className={styles.eventDetails}>{translate(event.details || 'General Election details.')}</p>
          <a 
            href={calendarService.getAddToCalendarUrl(title, event.details || 'General Election', event.location || 'Local Polling Station', start, end)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.addButton}
          >
            {translate('Add to My Google Calendar')}
            <span className="sr-only"> for {title} on {date}</span>
          </a>
        </div>
      );
    });
  }, [elections, translate]);

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.title}>{translate('Election Calendar')}</h2>
      <div className={styles.grid}>
        {electionCards}
      </div>
    </div>
  );
}
