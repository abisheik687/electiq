import React, { Suspense, useState, useRef } from 'react';
import { useTranslation } from './hooks/useTranslation';
import styles from './App.module.css';

// Lazy loaded components for code splitting
const LanguageSelector = React.lazy(() => import('./components/LanguageSelector'));
const ElectionTimeline = React.lazy(() => import('./components/ElectionTimeline'));
const ChatContainer = React.lazy(() => import('./components/ChatContainer'));
const PollingPlaceFinder = React.lazy(() => import('./components/PollingPlaceFinder'));
const ElectionCalendar = React.lazy(() => import('./components/ElectionCalendar'));
const QuizModule = React.lazy(() => import('./components/QuizModule'));

const SkeletonLoader = () => <div className={styles.skeleton} aria-busy="true"></div>;

function App() {
  const { translate } = useTranslation();
  const [activeTab, setActiveTab] = useState('learn');
  const chatRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleAskAi = (prompt: string) => {
    // We would typically set this prompt in some global state or context to pass to the chat
    console.log("Asking AI:", prompt);
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>ElectIQ</h1>
            <p>{translate('Your Civic Education Assistant')}</p>
          </div>
          <Suspense fallback={<SkeletonLoader />}>
            <LanguageSelector />
          </Suspense>
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
            id="quiz-tab"
          >
            {translate('Knowledge Quiz')}
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <a href="#main-content" className={styles.skipLink}>{translate('Skip to main content')}</a>
        <a href="#chat-section" className={styles.skipLink}>{translate('Skip to chat')}</a>
        <a href="#timeline-section" className={styles.skipLink}>{translate('Skip to timeline')}</a>
        {activeTab !== 'quiz' && (
           <button onClick={() => setActiveTab('quiz')} className={styles.skipLink}>{translate('Skip to quiz')}</button>
        )}
        
        <div id="main-content">
          {activeTab === 'learn' ? (
            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div id="timeline-section" ref={timelineRef} tabIndex={-1}>
                  <Suspense fallback={<SkeletonLoader />}>
                    <ElectionTimeline onAskAi={handleAskAi} />
                  </Suspense>
                </div>
                <Suspense fallback={<SkeletonLoader />}>
                  <ElectionCalendar />
                </Suspense>
                <Suspense fallback={<SkeletonLoader />}>
                  <PollingPlaceFinder />
                </Suspense>
              </div>
              <div className={styles.rightColumn} id="chat-section" ref={chatRef} tabIndex={-1}>
                <h2 className={styles.chatTitle}>{translate('Ask AI Assistant')}</h2>
                <Suspense fallback={<SkeletonLoader />}>
                  <ChatContainer />
                </Suspense>
              </div>
            </div>
          ) : (
            <div id="quiz-section" tabIndex={-1}>
              <Suspense fallback={<SkeletonLoader />}>
                <QuizModule />
              </Suspense>
            </div>
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
