import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import { usePlatformStore } from './store/platform';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import AITutor from './components/AITutor/AITutor';
import CourseManagement from './components/Courses/CourseManagement';
import UserManagement from './components/UserManagement/UserManagement';
import AssignmentSystem from './components/Assignments/AssignmentSystem';
import QuizBuilder from './components/Quiz/QuizBuilder';
import Gradebook from './components/Gradebook/Gradebook';
import LiveSessions from './components/LiveSessions/LiveSessions';
import Calendar from './components/Calendar/Calendar';
import Discussions from './components/Discussions/Discussions';
import Messages from './components/Messages/Messages';
import Analytics from './components/Analytics/Analytics';
import Certificates from './components/Certificates/Certificates';
import StudyGroups from './components/StudyGroups/StudyGroups';
import TranscriptManagement from './components/Academic/TranscriptManagement';
import DegreePlanning from './components/Academic/DegreePlanning';
import TuitionManagement from './components/Financial/TuitionManagement';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user, initializeCollections, initializeApp } = useAuthStore();
  const { currentView, theme, initializeAI } = usePlatformStore();

  // Initialize AI service with environment variable
  useEffect(() => {
    const apiKey = import.meta.env.VITE_CHUTES_AI_API_KEY;
    if (apiKey && apiKey !== 'your-chutes-ai-api-key') {
      initializeAI(apiKey);
    }
  }, [initializeAI]);

  // Initialize app and collections on startup
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Initialize collections when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeCollections();
    }
  }, [isAuthenticated, initializeCollections]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Toaster position="top-right" />
        {authMode === 'login' ? (
          <Login onToggleMode={toggleAuthMode} />
        ) : (
          <Register onToggleMode={toggleAuthMode} />
        )}
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
      case 'course-management':
        return <CourseManagement />;
      case 'ai-tutor':
        return <AITutor />;
      case 'user-management':
        return <UserManagement />;
      case 'assignments':
        return <AssignmentSystem />;
      case 'quizzes':
        return <QuizBuilder />;
      case 'grades':
      case 'grading':
        return <Gradebook />;
      case 'live-sessions':
        return <LiveSessions />;
      case 'discussions':
        return <Discussions />;
      case 'calendar':
        return <Calendar />;
      case 'analytics':
      case 'system-analytics':
      case 'institutional-analytics':
        return <Analytics />;
      case 'messages':
        return <Messages />;
      case 'certificates':
        return <Certificates />;
      case 'study-groups':
        return <StudyGroups />;
      case 'transcripts':
        return <TranscriptManagement />;
      case 'degree-planning':
        return <DegreePlanning />;
      case 'tuition':
      case 'tuition-management':
        return <TuitionManagement />;
      case 'course-builder':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Course Builder</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">AI-powered course creation tools coming soon...</p>
            </div>
          </div>
        );
      case 'library':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Digital Library</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Digital library system coming soon...</p>
            </div>
          </div>
        );
      case 'financial-aid':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Financial Aid</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Financial aid management coming soon...</p>
            </div>
          </div>
        );
      case 'enrollment-management':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enrollment Management</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Enrollment management system coming soon...</p>
            </div>
          </div>
        );
      case 'academic-administration':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Academic Administration</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Academic administration tools coming soon...</p>
            </div>
          </div>
        );
      case 'financial-management':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Financial Management</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Financial management system coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className={`App min-h-screen bg-gray-50 dark:bg-gray-900 ${theme}`}>
        <Toaster position="top-right" />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {renderCurrentView()}
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;