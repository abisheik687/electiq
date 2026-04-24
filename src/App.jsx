import React, { Suspense, useState, useRef } from 'react';
import LanguageSelector from './components/LanguageSelector';
import ElectionTimeline from './components/ElectionTimeline';
import ChatInterface from './components/ChatInterface';
import { useTranslation } from './hooks/useTranslation';
import styles from './App.module.css';

// Lazy loaded components for code splitting
const PollingPlaceFinder = React.lazy(() => import('./components/PollingPlaceFinder'));
const ElectionCalendar = React.lazy(() => import('./components/ElectionCalendar'));
const QuizModule = React.lazy(() => import('./components/QuizModule'));

function App() {
  const { translate } = useTranslation();
  const [activeTab, setActiveTab] = useState('learn');
  const chatRef = useRef(null);

  const handleAskAi = (prompt) => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
    // The prompt is passed down conceptually; for this demo, we just scroll to the chat.
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>ElectIQ</h1>
            <p>{translate('Your Civic Education Assistant')}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <button 
            className={`${styles.navItem} ${activeTab === 'learn' ? styles.active : ''}`}
            onClick={() => setActiveTab('learn')}
          >
            {translate('Learn & Plan')}
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'quiz' ? styles.active : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            {translate('Knowledge Quiz')}
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <a href="#main-content" className={styles.skipLink}>{translate('Skip to main content')}</a>
        <div id="main-content">
          {activeTab === 'learn' ? (
            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <ElectionTimeline onAskAi={handleAskAi} />
                <Suspense fallback={<div>{translate('Loading Calendar...')}</div>}>
                  <ElectionCalendar />
                </Suspense>
                <Suspense fallback={<div>{translate('Loading Map...')}</div>}>
                  <PollingPlaceFinder />
                </Suspense>
              </div>
              <div className={styles.rightColumn} ref={chatRef}>
                <h2 className={styles.chatTitle}>{translate('Ask AI Assistant')}</h2>
                <ChatInterface />
              </div>
            </div>
          ) : (
            <Suspense fallback={<div>{translate('Loading Quiz...')}</div>}>
              <QuizModule />
            </Suspense>
          )}
        </div>
      </main>
      
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ElectIQ. {translate('A nonpartisan civic education tool.')}</p>
      </footer>
    </div>
  );
}

export default App;
