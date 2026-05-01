import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useTranslation } from './hooks/useTranslation';
import styles from './App.module.css';
import LanguageSelector from './components/LanguageSelector';
import ElectionTimeline from './components/ElectionTimeline';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }
  render() {
    if (this.state.hasError) return <div role="alert">Failed to load component. Please refresh.</div>;
    return this.props.children;
  }
}

// Lazy loaded components for code splitting
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
  const quizRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      chat: chatRef, quiz: quizRef, map: mapRef
    };
    setTimeout(() => refMap[activeTab]?.current?.focus(), 50);
  }, [activeTab]);

  const handleAskAi = (prompt: string) => {
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
          <LanguageSelector />
        </div>
      </header>

      <nav className={styles.nav} id="main-nav">
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
        <a href="#main-nav" className={styles.skipLink}>{translate('Skip to main navigation')}</a>

        
        <div id="main-content">
          {activeTab === 'learn' ? (
            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div id="timeline-section" ref={timelineRef} tabIndex={-1}>
                  <ElectionTimeline onAskAi={handleAskAi} />
                </div>
                <ErrorBoundary>
                  <Suspense fallback={<SkeletonLoader />}>
                    <ElectionCalendar />
                  </Suspense>
                </ErrorBoundary>
                <ErrorBoundary>
                  <Suspense fallback={<SkeletonLoader />}>
                    <div ref={mapRef} tabIndex={-1}>
                      <PollingPlaceFinder />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
              <div className={styles.rightColumn} id="chat-section" ref={chatRef} tabIndex={-1}>
                <h2 className={styles.chatTitle}>{translate('Ask AI Assistant')}</h2>
                <ErrorBoundary>
                  <Suspense fallback={<SkeletonLoader />}>
                    <ChatContainer />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          ) : (
            <div id="quiz-section" ref={quizRef} tabIndex={-1}>
              <ErrorBoundary>
                <Suspense fallback={<SkeletonLoader />}>
                  <QuizModule />
                </Suspense>
              </ErrorBoundary>
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
