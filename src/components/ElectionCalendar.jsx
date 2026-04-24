import { useTranslation } from '../hooks/useTranslation';
import { getAddToCalendarUrl } from '../services/calendarService';
import styles from './ElectionCalendar.module.css';

export default function ElectionCalendar() {
  const { translate } = useTranslation();

  const events = [
    {
      id: 1,
      title: 'Voter Registration Deadline',
      date: 'Oct 7, 2024',
      details: 'Last day to register to vote for the upcoming election.',
      location: 'Local Election Office',
      start: '20241007T000000Z',
      end: '20241008T000000Z',
    },
    {
      id: 2,
      title: 'General Election Day',
      date: 'Nov 5, 2024',
      details: 'Cast your vote at your local polling station.',
      location: 'Your Local Polling Station',
      start: '20241105T000000Z',
      end: '20241106T000000Z',
    }
  ];

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.title}>{translate('Election Calendar')}</h2>
      <div className={styles.grid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventDate}>{translate(event.date)}</div>
            <h3 className={styles.eventTitle}>{translate(event.title)}</h3>
            <p className={styles.eventDetails}>{translate(event.details)}</p>
            <a 
              href={getAddToCalendarUrl(event.title, event.details, event.location, event.start, event.end)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.addButton}
              aria-label={`${translate('Add')} ${translate(event.title)} ${translate('to Google Calendar')}`}
            >
              {translate('Add to My Google Calendar')}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
