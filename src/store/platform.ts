import { create } from 'zustand';
import ChutesAI from '../lib/ai';
import { sdk } from './auth';
import { 
  Course, 
  Assignment, 
  Announcement, 
  Event, 
  Notification, 
  LiveSession,
  User,
  Quiz,
  QuizAttempt,
  Submission,
  Grade,
  Discussion,
  Message,
  Certificate,
  StudyGroup,
  AITutorSession
} from '../lib/types';

interface PlatformState {
  // Data
  courses: Course[];
  assignments: Assignment[];
  announcements: Announcement[];
  events: Event[];
  notifications: Notification[];
  liveSessions: LiveSession[];
  users: User[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  grades: Grade[];
  discussions: Discussion[];
  messages: Message[];
  certificates: Certificate[];
  studyGroups: StudyGroup[];
  aiTutorSessions: AITutorSession[];
  
  // Academic Administration
  transcripts: any[];
  degreePlans: any[];
  creditTransfers: any[];
  enrollments: any[];
  
  // Financial Management
  tuitionRecords: any[];
  financialAid: any[];
  payments: any[];
  
  // Institutional Analytics
  accreditationReports: any[];
  retentionAnalytics: any[];
  facultyPerformance: any[];
  resourceUtilization: any[];
  
  // Library System
  libraryResources: any[];
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentView: string;
  loading: boolean;
  
  // AI Instance
  ai: ChutesAI | null;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentView: (view: string) => void;
  setLoading: (loading: boolean) => void;
  initializeAI: (apiKey: string) => void;
  
  // Data actions
  loadCourses: () => Promise<void>;
  loadAssignments: (courseId?: string) => Promise<void>;
  loadAnnouncements: () => Promise<void>;
  loadEvents: () => Promise<void>;
  loadNotifications: (userId: string) => Promise<void>;
  loadLiveSessions: (courseId?: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  loadQuizzes: () => Promise<void>;
  loadQuizAttempts: () => Promise<void>;
  loadSubmissions: () => Promise<void>;
  loadGrades: () => Promise<void>;
  loadDiscussions: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  loadCertificates: () => Promise<void>;
  loadStudyGroups: () => Promise<void>;
  loadAITutorSessions: (userId: string) => Promise<void>;
  
  // Academic Administration
  loadTranscripts: () => Promise<void>;
  loadDegreePlans: () => Promise<void>;
  loadCreditTransfers: () => Promise<void>;
  loadEnrollments: () => Promise<void>;
  
  // Financial Management
  loadTuitionRecords: () => Promise<void>;
  loadFinancialAid: () => Promise<void>;
  loadPayments: () => Promise<void>;
  
  // Institutional Analytics
  loadAccreditationReports: () => Promise<void>;
  loadRetentionAnalytics: () => Promise<void>;
  loadFacultyPerformance: () => Promise<void>;
  loadResourceUtilization: () => Promise<void>;
  
  // Library System
  loadLibraryResources: () => Promise<void>;
  
  // Course management
  createCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string, studentId: string) => Promise<void>;
  
  // User management
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  bulkUpdateUsers: (updates: Array<Partial<User> & { id: string }>) => Promise<void>;
  
  // Assignment management
  createAssignment: (assignmentData: Partial<Assignment>) => Promise<Assignment>;
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => Promise<Assignment>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  
  // Quiz management
  createQuiz: (quizData: Partial<Quiz>) => Promise<Quiz>;
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => Promise<Quiz>;
  deleteQuiz: (quizId: string) => Promise<void>;
  
  // Submission management
  createSubmission: (submissionData: Partial<Submission>) => Promise<Submission>;
  gradeSubmission: (submissionId: string, grading: { grade: number; feedback: string; rubricScores?: any[]; aiAnalysis?: any }) => Promise<void>;
  
  // Grade management
  updateGrade: (gradeId: string, updates: Partial<Grade>) => Promise<Grade>;
  bulkUpdateGrades: (updates: Array<Partial<Grade> & { id: string }>) => Promise<void>;
  
  // Announcement management
  createAnnouncement: (announcementData: Partial<Announcement>) => Promise<Announcement>;
  updateAnnouncement: (announcementId: string, updates: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  
  // Event management
  createEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Notification management
  createNotification: (notificationData: Partial<Notification>) => Promise<Notification>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Live session management
  createLiveSession: (sessionData: Partial<LiveSession>) => Promise<LiveSession>;
  updateLiveSession: (sessionId: string, updates: Partial<LiveSession>) => Promise<LiveSession>;
  deleteLiveSession: (sessionId: string) => Promise<void>;
  joinLiveSession: (sessionId: string, userId: string) => Promise<void>;
  leaveLiveSession: (sessionId: string, userId: string) => Promise<void>;
  
  // Discussion management
  createDiscussion: (discussionData: Partial<Discussion>) => Promise<Discussion>;
  updateDiscussion: (discussionId: string, updates: Partial<Discussion>) => Promise<Discussion>;
  deleteDiscussion: (discussionId: string) => Promise<void>;
  
  // Message management
  sendMessage: (messageData: Partial<Message>) => Promise<Message>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Academic Administration
  createTranscript: (transcriptData: any) => Promise<any>;
  updateTranscript: (transcriptId: string, updates: any) => Promise<any>;
  createDegreePlan: (planData: any) => Promise<any>;
  updateDegreePlan: (planId: string, updates: any) => Promise<any>;
  createCreditTransfer: (transferData: any) => Promise<any>;
  updateCreditTransfer: (transferId: string, updates: any) => Promise<any>;
  
  // Financial Management
  createTuitionRecord: (recordData: any) => Promise<any>;
  updateTuitionRecord: (recordId: string, updates: any) => Promise<any>;
  createFinancialAid: (aidData: any) => Promise<any>;
  updateFinancialAid: (aidId: string, updates: any) => Promise<any>;
  processPayment: (paymentData: any) => Promise<any>;
  
  // Institutional Analytics
  createAccreditationReport: (reportData: any) => Promise<any>;
  updateAccreditationReport: (reportId: string, updates: any) => Promise<any>;
  createRetentionAnalytics: (analyticsData: any) => Promise<any>;
  updateRetentionAnalytics: (analyticsId: string, updates: any) => Promise<any>;
  createFacultyPerformance: (performanceData: any) => Promise<any>;
  updateFacultyPerformance: (performanceId: string, updates: any) => Promise<any>;
  createResourceUtilization: (utilizationData: any) => Promise<any>;
  updateResourceUtilization: (utilizationId: string, updates: any) => Promise<any>;
  
  // Library System
  createLibraryResource: (resourceData: any) => Promise<any>;
  updateLibraryResource: (resourceId: string, updates: any) => Promise<any>;
  deleteLibraryResource: (resourceId: string) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  // Initial state
  courses: [],
  assignments: [],
  announcements: [],
  events: [],
  notifications: [],
  liveSessions: [],
  users: [],
  quizzes: [],
  quizAttempts: [],
  submissions: [],
  grades: [],
  discussions: [],
  messages: [],
  certificates: [],
  studyGroups: [],
  aiTutorSessions: [],
  
  // Academic Administration
  transcripts: [],
  degreePlans: [],
  creditTransfers: [],
  enrollments: [],
  
  // Financial Management
  tuitionRecords: [],
  financialAid: [],
  payments: [],
  
  // Institutional Analytics
  accreditationReports: [],
  retentionAnalytics: [],
  facultyPerformance: [],
  resourceUtilization: [],
  
  // Library System
  libraryResources: [],
  
  sidebarOpen: true,
  theme: 'light',
  currentView: 'dashboard',
  loading: false,
  ai: null,

  // UI Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setCurrentView: (view) => set({ currentView: view }),
  setLoading: (loading) => set({ loading }),
  
  initializeAI: (apiKey: string) => {
    const ai = new ChutesAI({ apiKey });
    set({ ai });
  },

  // Data loading actions
  loadCourses: async () => {
    set({ loading: true });
    try {
      const courses = await sdk.get<Course>('courses');
      set({ courses, loading: false });
    } catch (error) {
      console.error('Failed to load courses:', error);
      set({ loading: false });
    }
  },

  loadUsers: async () => {
    set({ loading: true });
    try {
      const users = await sdk.get<User>('users');
      set({ users, loading: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      set({ loading: false });
    }
  },

  loadAssignments: async (courseId?: string) => {
    set({ loading: true });
    try {
      let assignments = await sdk.get<Assignment>('assignments');
      if (courseId) {
        assignments = assignments.filter(a => a.courseId === courseId);
      }
      set({ assignments, loading: false });
    } catch (error) {
      console.error('Failed to load assignments:', error);
      set({ loading: false });
    }
  },

  loadQuizzes: async () => {
    set({ loading: true });
    try {
      const quizzes = await sdk.get<Quiz>('quizzes');
      set({ quizzes, loading: false });
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      set({ loading: false });
    }
  },

  loadQuizAttempts: async () => {
    set({ loading: true });
    try {
      const quizAttempts = await sdk.get<QuizAttempt>('quizAttempts');
      set({ quizAttempts, loading: false });
    } catch (error) {
      console.error('Failed to load quiz attempts:', error);
      set({ loading: false });
    }
  },

  loadSubmissions: async () => {
    set({ loading: true });
    try {
      const submissions = await sdk.get<Submission>('submissions');
      set({ submissions, loading: false });
    } catch (error) {
      console.error('Failed to load submissions:', error);
      set({ loading: false });
    }
  },

  loadGrades: async () => {
    set({ loading: true });
    try {
      const grades = await sdk.get<Grade>('grades');
      set({ grades, loading: false });
    } catch (error) {
      console.error('Failed to load grades:', error);
      set({ loading: false });
    }
  },

  loadAnnouncements: async () => {
    set({ loading: true });
    try {
      const announcements = await sdk.get<Announcement>('announcements');
      set({ announcements, loading: false });
    } catch (error) {
      console.error('Failed to load announcements:', error);
      set({ loading: false });
    }
  },

  loadEvents: async () => {
    set({ loading: true });
    try {
      const events = await sdk.get<Event>('events');
      set({ events, loading: false });
    } catch (error) {
      console.error('Failed to load events:', error);
      set({ loading: false });
    }
  },

  loadNotifications: async (userId: string) => {
    set({ loading: true });
    try {
      const allNotifications = await sdk.get<Notification>('notifications');
      const notifications = allNotifications.filter(n => n.userId === userId);
      set({ notifications, loading: false });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      set({ loading: false });
    }
  },

  loadLiveSessions: async (courseId?: string) => {
    set({ loading: true });
    try {
      let liveSessions = await sdk.get<LiveSession>('liveSessions');
      if (courseId) {
        liveSessions = liveSessions.filter(s => s.courseId === courseId);
      }
      set({ liveSessions, loading: false });
    } catch (error) {
      console.error('Failed to load live sessions:', error);
      set({ loading: false });
    }
  },

  loadDiscussions: async () => {
    set({ loading: true });
    try {
      const discussions = await sdk.get<Discussion>('discussions');
      set({ discussions, loading: false });
    } catch (error) {
      console.error('Failed to load discussions:', error);
      set({ loading: false });
    }
  },

  loadMessages: async (userId: string) => {
    set({ loading: true });
    try {
      const allMessages = await sdk.get<Message>('messages');
      const messages = allMessages.filter(m => m.senderId === userId || m.recipientId === userId);
      set({ messages, loading: false });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ loading: false });
    }
  },

  loadCertificates: async () => {
    set({ loading: true });
    try {
      const certificates = await sdk.get<Certificate>('certificates');
      set({ certificates, loading: false });
    } catch (error) {
      console.error('Failed to load certificates:', error);
      set({ loading: false });
    }
  },

  loadStudyGroups: async () => {
    set({ loading: true });
    try {
      const studyGroups = await sdk.get<StudyGroup>('studyGroups');
      set({ studyGroups, loading: false });
    } catch (error) {
      console.error('Failed to load study groups:', error);
      set({ loading: false });
    }
  },

  loadAITutorSessions: async (userId: string) => {
    set({ loading: true });
    try {
      const allSessions = await sdk.get<AITutorSession>('aiTutorSessions');
      const aiTutorSessions = allSessions.filter(s => s.userId === userId);
      set({ aiTutorSessions, loading: false });
    } catch (error) {
      console.error('Failed to load AI tutor sessions:', error);
      set({ loading: false });
    }
  },

  // Academic Administration
  loadTranscripts: async () => {
    set({ loading: true });
    try {
      const transcripts = await sdk.get('transcripts');
      set({ transcripts, loading: false });
    } catch (error) {
      console.error('Failed to load transcripts:', error);
      set({ loading: false });
    }
  },

  loadDegreePlans: async () => {
    set({ loading: true });
    try {
      const degreePlans = await sdk.get('degreePlans');
      set({ degreePlans, loading: false });
    } catch (error) {
      console.error('Failed to load degree plans:', error);
      set({ loading: false });
    }
  },

  loadCreditTransfers: async () => {
    set({ loading: true });
    try {
      const creditTransfers = await sdk.get('creditTransfers');
      set({ creditTransfers, loading: false });
    } catch (error) {
      console.error('Failed to load credit transfers:', error);
      set({ loading: false });
    }
  },

  loadEnrollments: async () => {
    set({ loading: true });
    try {
      const enrollments = await sdk.get('enrollments');
      set({ enrollments, loading: false });
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      set({ loading: false });
    }
  },

  // Financial Management
  loadTuitionRecords: async () => {
    set({ loading: true });
    try {
      const tuitionRecords = await sdk.get('tuitionRecords');
      set({ tuitionRecords, loading: false });
    } catch (error) {
      console.error('Failed to load tuition records:', error);
      set({ loading: false });
    }
  },

  loadFinancialAid: async () => {
    set({ loading: true });
    try {
      const financialAid = await sdk.get('financialAid');
      set({ financialAid, loading: false });
    } catch (error) {
      console.error('Failed to load financial aid:', error);
      set({ loading: false });
    }
  },

  loadPayments: async () => {
    set({ loading: true });
    try {
      const payments = await sdk.get('payments');
      set({ payments, loading: false });
    } catch (error) {
      console.error('Failed to load payments:', error);
      set({ loading: false });
    }
  },

  // Institutional Analytics
  loadAccreditationReports: async () => {
    set({ loading: true });
    try {
      const accreditationReports = await sdk.get('accreditationReports');
      set({ accreditationReports, loading: false });
    } catch (error) {
      console.error('Failed to load accreditation reports:', error);
      set({ loading: false });
    }
  },

  loadRetentionAnalytics: async () => {
    set({ loading: true });
    try {
      const retentionAnalytics = await sdk.get('retentionAnalytics');
      set({ retentionAnalytics, loading: false });
    } catch (error) {
      console.error('Failed to load retention analytics:', error);
      set({ loading: false });
    }
  },

  loadFacultyPerformance: async () => {
    set({ loading: true });
    try {
      const facultyPerformance = await sdk.get('facultyPerformance');
      set({ facultyPerformance, loading: false });
    } catch (error) {
      console.error('Failed to load faculty performance:', error);
      set({ loading: false });
    }
  },

  loadResourceUtilization: async () => {
    set({ loading: true });
    try {
      const resourceUtilization = await sdk.get('resourceUtilization');
      set({ resourceUtilization, loading: false });
    } catch (error) {
      console.error('Failed to load resource utilization:', error);
      set({ loading: false });
    }
  },

  // Library System
  loadLibraryResources: async () => {
    set({ loading: true });
    try {
      const libraryResources = await sdk.get('libraryResources');
      set({ libraryResources, loading: false });
    } catch (error) {
      console.error('Failed to load library resources:', error);
      set({ loading: false });
    }
  },

  // Course management
  createCourse: async (courseData: Partial<Course>) => {
    const course = await sdk.insert<Course>('courses', {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { courses } = get();
    set({ courses: [...courses, course] });
    return course;
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    const course = await sdk.update<Course>('courses', courseId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { courses } = get();
    set({ 
      courses: courses.map(c => c.id === courseId ? course : c)
    });
    return course;
  },

  deleteCourse: async (courseId: string) => {
    await sdk.delete('courses', courseId);
    const { courses } = get();
    set({ courses: courses.filter(c => c.id !== courseId) });
  },

  enrollInCourse: async (courseId: string, studentId: string) => {
    await sdk.insert('enrollments', {
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0
    });
    
    // Update course enrollment count
    const course = await sdk.getItem<Course>('courses', courseId);
    if (course) {
      await sdk.update('courses', courseId, {
        currentEnrollment: (course.currentEnrollment || 0) + 1
      });
    }
  },

  // User management
  createUser: async (userData: Partial<User>) => {
    const user = await sdk.insert<User>('users', {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { users } = get();
    set({ users: [...users, user] });
    return user;
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    const user = await sdk.update<User>('users', userId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { users } = get();
    set({ 
      users: users.map(u => u.id === userId ? user : u)
    });
    return user;
  },

  deleteUser: async (userId: string) => {
    await sdk.delete('users', userId);
    const { users } = get();
    set({ users: users.filter(u => u.id !== userId) });
  },

  bulkUpdateUsers: async (updates: Array<Partial<User> & { id: string }>) => {
    const updatedUsers = await sdk.bulkUpdate('users', updates);
    const { users } = get();
    const userMap = new Map(users.map(u => [u.id, u]));
    
    updatedUsers.forEach(user => {
      userMap.set(user.id, user);
    });
    
    set({ users: Array.from(userMap.values()) });
  },

  // Assignment management
  createAssignment: async (assignmentData: Partial<Assignment>) => {
    const assignment = await sdk.insert<Assignment>('assignments', {
      ...assignmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { assignments } = get();
    set({ assignments: [...assignments, assignment] });
    return assignment;
  },

  updateAssignment: async (assignmentId: string, updates: Partial<Assignment>) => {
    const assignment = await sdk.update<Assignment>('assignments', assignmentId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { assignments } = get();
    set({ 
      assignments: assignments.map(a => a.id === assignmentId ? assignment : a)
    });
    return assignment;
  },

  deleteAssignment: async (assignmentId: string) => {
    await sdk.delete('assignments', assignmentId);
    const { assignments } = get();
    set({ assignments: assignments.filter(a => a.id !== assignmentId) });
  },

  // Quiz management
  createQuiz: async (quizData: Partial<Quiz>) => {
    const quiz = await sdk.insert<Quiz>('quizzes', {
      ...quizData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { quizzes } = get();
    set({ quizzes: [...quizzes, quiz] });
    return quiz;
  },

  updateQuiz: async (quizId: string, updates: Partial<Quiz>) => {
    const quiz = await sdk.update<Quiz>('quizzes', quizId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { quizzes } = get();
    set({ 
      quizzes: quizzes.map(q => q.id === quizId ? quiz : q)
    });
    return quiz;
  },

  deleteQuiz: async (quizId: string) => {
    await sdk.delete('quizzes', quizId);
    const { quizzes } = get();
    set({ quizzes: quizzes.filter(q => q.id !== quizId) });
  },

  // Submission management
  createSubmission: async (submissionData: Partial<Submission>) => {
    const submission = await sdk.insert<Submission>('submissions', {
      ...submissionData,
      submittedAt: new Date().toISOString()
    });
    
    const { submissions } = get();
    set({ submissions: [...submissions, submission] });
    return submission;
  },

  gradeSubmission: async (submissionId: string, grading: { grade: number; feedback: string; rubricScores?: any[]; aiAnalysis?: any }) => {
    await sdk.update('submissions', submissionId, {
      ...grading,
      status: 'graded',
      gradedAt: new Date().toISOString()
    });
    
    const { submissions } = get();
    set({ 
      submissions: submissions.map(s => 
        s.id === submissionId 
          ? { ...s, ...grading, status: 'graded', gradedAt: new Date().toISOString() }
          : s
      )
    });
  },

  // Grade management
  updateGrade: async (gradeId: string, updates: Partial<Grade>) => {
    const grade = await sdk.update<Grade>('grades', gradeId, updates);
    
    const { grades } = get();
    set({ 
      grades: grades.map(g => g.id === gradeId ? grade : g)
    });
    return grade;
  },

  bulkUpdateGrades: async (updates: Array<Partial<Grade> & { id: string }>) => {
    const updatedGrades = await sdk.bulkUpdate('grades', updates);
    const { grades } = get();
    const gradeMap = new Map(grades.map(g => [g.id, g]));
    
    updatedGrades.forEach(grade => {
      gradeMap.set(grade.id, grade);
    });
    
    set({ grades: Array.from(gradeMap.values()) });
  },

  // Announcement management
  createAnnouncement: async (announcementData: Partial<Announcement>) => {
    const announcement = await sdk.insert<Announcement>('announcements', {
      ...announcementData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { announcements } = get();
    set({ announcements: [...announcements, announcement] });
    return announcement;
  },

  updateAnnouncement: async (announcementId: string, updates: Partial<Announcement>) => {
    const announcement = await sdk.update<Announcement>('announcements', announcementId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { announcements } = get();
    set({ 
      announcements: announcements.map(a => a.id === announcementId ? announcement : a)
    });
    return announcement;
  },

  deleteAnnouncement: async (announcementId: string) => {
    await sdk.delete('announcements', announcementId);
    const { announcements } = get();
    set({ announcements: announcements.filter(a => a.id !== announcementId) });
  },

  // Event management
  createEvent: async (eventData: Partial<Event>) => {
    const event = await sdk.insert<Event>('events', {
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { events } = get();
    set({ events: [...events, event] });
    return event;
  },

  updateEvent: async (eventId: string, updates: Partial<Event>) => {
    const event = await sdk.update<Event>('events', eventId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { events } = get();
    set({ 
      events: events.map(e => e.id === eventId ? event : e)
    });
    return event;
  },

  deleteEvent: async (eventId: string) => {
    await sdk.delete('events', eventId);
    const { events } = get();
    set({ events: events.filter(e => e.id !== eventId) });
  },

  // Notification management
  createNotification: async (notificationData: Partial<Notification>) => {
    const notification = await sdk.insert<Notification>('notifications', {
      ...notificationData,
      createdAt: new Date().toISOString()
    });
    
    const { notifications } = get();
    set({ notifications: [...notifications, notification] });
    return notification;
  },

  markNotificationAsRead: async (notificationId: string) => {
    await sdk.update('notifications', notificationId, { isRead: true });
    const { notifications } = get();
    set({ 
      notifications: notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    });
  },

  deleteNotification: async (notificationId: string) => {
    await sdk.delete('notifications', notificationId);
    const { notifications } = get();
    set({ notifications: notifications.filter(n => n.id !== notificationId) });
  },

  // Live session management
  createLiveSession: async (sessionData: Partial<LiveSession>) => {
    const liveSession = await sdk.insert<LiveSession>('liveSessions', {
      ...sessionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { liveSessions } = get();
    set({ liveSessions: [...liveSessions, liveSession] });
    return liveSession;
  },

  updateLiveSession: async (sessionId: string, updates: Partial<LiveSession>) => {
    const liveSession = await sdk.update<LiveSession>('liveSessions', sessionId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { liveSessions } = get();
    set({ 
      liveSessions: liveSessions.map(s => s.id === sessionId ? liveSession : s)
    });
    return liveSession;
  },

  deleteLiveSession: async (sessionId: string) => {
    await sdk.delete('liveSessions', sessionId);
    const { liveSessions } = get();
    set({ liveSessions: liveSessions.filter(s => s.id !== sessionId) });
  },

  joinLiveSession: async (sessionId: string, userId: string) => {
    const session = await sdk.getItem<LiveSession>('liveSessions', sessionId);
    if (session) {
      const attendee = {
        userId,
        userName: 'User', // This would be populated from user data
        joinedAt: new Date().toISOString(),
        duration: 0,
        participationScore: 0
      };
      
      const updatedAttendees = [...(session.attendees || []), attendee];
      await sdk.update('liveSessions', sessionId, { attendees: updatedAttendees });
      
      const { liveSessions } = get();
      set({ 
        liveSessions: liveSessions.map(s => 
          s.id === sessionId ? { ...s, attendees: updatedAttendees } : s
        )
      });
    }
  },

  leaveLiveSession: async (sessionId: string, userId: string) => {
    const session = await sdk.getItem<LiveSession>('liveSessions', sessionId);
    if (session) {
      const updatedAttendees = session.attendees.map(attendee => 
        attendee.userId === userId 
          ? { ...attendee, leftAt: new Date().toISOString() }
          : attendee
      );
      await sdk.update('liveSessions', sessionId, { attendees: updatedAttendees });
      
      const { liveSessions } = get();
      set({ 
        liveSessions: liveSessions.map(s => 
          s.id === sessionId ? { ...s, attendees: updatedAttendees } : s
        )
      });
    }
  },

  // Discussion management
  createDiscussion: async (discussionData: Partial<Discussion>) => {
    const discussion = await sdk.insert<Discussion>('discussions', {
      ...discussionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { discussions } = get();
    set({ discussions: [...discussions, discussion] });
    return discussion;
  },

  updateDiscussion: async (discussionId: string, updates: Partial<Discussion>) => {
    const discussion = await sdk.update<Discussion>('discussions', discussionId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { discussions } = get();
    set({ 
      discussions: discussions.map(d => d.id === discussionId ? discussion : d)
    });
    return discussion;
  },

  deleteDiscussion: async (discussionId: string) => {
    await sdk.delete('discussions', discussionId);
    const { discussions } = get();
    set({ discussions: discussions.filter(d => d.id !== discussionId) });
  },

  // Message management
  sendMessage: async (messageData: Partial<Message>) => {
    const message = await sdk.insert<Message>('messages', {
      ...messageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const { messages } = get();
    set({ messages: [...messages, message] });
    return message;
  },

  markMessageAsRead: async (messageId: string) => {
    await sdk.update('messages', messageId, { isRead: true });
    const { messages } = get();
    set({ 
      messages: messages.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      )
    });
  },

  deleteMessage: async (messageId: string) => {
    await sdk.delete('messages', messageId);
    const { messages } = get();
    set({ messages: messages.filter(m => m.id !== messageId) });
  },

  // Academic Administration
  createTranscript: async (transcriptData: any) => {
    const transcript = await sdk.insert('transcripts', {
      ...transcriptData,
      issuedAt: new Date().toISOString()
    });
    
    const { transcripts } = get();
    set({ transcripts: [...transcripts, transcript] });
    return transcript;
  },

  updateTranscript: async (transcriptId: string, updates: any) => {
    const transcript = await sdk.update('transcripts', transcriptId, updates);
    
    const { transcripts } = get();
    set({ 
      transcripts: transcripts.map(t => t.id === transcriptId ? transcript : t)
    });
    return transcript;
  },

  createDegreePlan: async (planData: any) => {
    const plan = await sdk.insert('degreePlans', {
      ...planData,
      lastUpdated: new Date().toISOString()
    });
    
    const { degreePlans } = get();
    set({ degreePlans: [...degreePlans, plan] });
    return plan;
  },

  updateDegreePlan: async (planId: string, updates: any) => {
    const plan = await sdk.update('degreePlans', planId, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    
    const { degreePlans } = get();
    set({ 
      degreePlans: degreePlans.map(p => p.id === planId ? plan : p)
    });
    return plan;
  },

  createCreditTransfer: async (transferData: any) => {
    const transfer = await sdk.insert('creditTransfers', {
      ...transferData,
      evaluatedAt: new Date().toISOString()
    });
    
    const { creditTransfers } = get();
    set({ creditTransfers: [...creditTransfers, transfer] });
    return transfer;
  },

  updateCreditTransfer: async (transferId: string, updates: any) => {
    const transfer = await sdk.update('creditTransfers', transferId, {
      ...updates,
      evaluatedAt: new Date().toISOString()
    });
    
    const { creditTransfers } = get();
    set({ 
      creditTransfers: creditTransfers.map(t => t.id === transferId ? transfer : t)
    });
    return transfer;
  },

  // Financial Management
  createTuitionRecord: async (recordData: any) => {
    const record = await sdk.insert('tuitionRecords', recordData);
    
    const { tuitionRecords } = get();
    set({ tuitionRecords: [...tuitionRecords, record] });
    return record;
  },

  updateTuitionRecord: async (recordId: string, updates: any) => {
    const record = await sdk.update('tuitionRecords', recordId, updates);
    
    const { tuitionRecords } = get();
    set({ 
      tuitionRecords: tuitionRecords.map(r => r.id === recordId ? record : r)
    });
    return record;
  },

  createFinancialAid: async (aidData: any) => {
    const aid = await sdk.insert('financialAid', {
      ...aidData,
      applicationDate: new Date().toISOString()
    });
    
    const { financialAid } = get();
    set({ financialAid: [...financialAid, aid] });
    return aid;
  },

  updateFinancialAid: async (aidId: string, updates: any) => {
    const aid = await sdk.update('financialAid', aidId, updates);
    
    const { financialAid } = get();
    set({ 
      financialAid: financialAid.map(a => a.id === aidId ? aid : a)
    });
    return aid;
  },

  processPayment: async (paymentData: any) => {
    const payment = await sdk.insert('payments', {
      ...paymentData,
      paidDate: new Date().toISOString()
    });
    
    const { payments } = get();
    set({ payments: [...payments, payment] });
    return payment;
  },

  // Institutional Analytics
  createAccreditationReport: async (reportData: any) => {
    const report = await sdk.insert('accreditationReports', {
      ...reportData,
      submittedAt: new Date().toISOString()
    });
    
    const { accreditationReports } = get();
    set({ accreditationReports: [...accreditationReports, report] });
    return report;
  },

  updateAccreditationReport: async (reportId: string, updates: any) => {
    const report = await sdk.update('accreditationReports', reportId, updates);
    
    const { accreditationReports } = get();
    set({ 
      accreditationReports: accreditationReports.map(r => r.id === reportId ? report : r)
    });
    return report;
  },

  createRetentionAnalytics: async (analyticsData: any) => {
    const analytics = await sdk.insert('retentionAnalytics', {
      ...analyticsData,
      calculatedAt: new Date().toISOString()
    });
    
    const { retentionAnalytics } = get();
    set({ retentionAnalytics: [...retentionAnalytics, analytics] });
    return analytics;
  },

  updateRetentionAnalytics: async (analyticsId: string, updates: any) => {
    const analytics = await sdk.update('retentionAnalytics', analyticsId, updates);
    
    const { retentionAnalytics } = get();
    set({ 
      retentionAnalytics: retentionAnalytics.map(a => a.id === analyticsId ? analytics : a)
    });
    return analytics;
  },

  createFacultyPerformance: async (performanceData: any) => {
    const performance = await sdk.insert('facultyPerformance', {
      ...performanceData,
      evaluatedAt: new Date().toISOString()
    });
    
    const { facultyPerformance } = get();
    set({ facultyPerformance: [...facultyPerformance, performance] });
    return performance;
  },

  updateFacultyPerformance: async (performanceId: string, updates: any) => {
    const performance = await sdk.update('facultyPerformance', performanceId, updates);
    
    const { facultyPerformance } = get();
    set({ 
      facultyPerformance: facultyPerformance.map(p => p.id === performanceId ? performance : p)
    });
    return performance;
  },

  createResourceUtilization: async (utilizationData: any) => {
    const utilization = await sdk.insert('resourceUtilization', {
      ...utilizationData,
      calculatedAt: new Date().toISOString()
    });
    
    const { resourceUtilization } = get();
    set({ resourceUtilization: [...resourceUtilization, utilization] });
    return utilization;
  },

  updateResourceUtilization: async (utilizationId: string, updates: any) => {
    const utilization = await sdk.update('resourceUtilization', utilizationId, updates);
    
    const { resourceUtilization } = get();
    set({ 
      resourceUtilization: resourceUtilization.map(u => u.id === utilizationId ? utilization : u)
    });
    return utilization;
  },

  // Library System
  createLibraryResource: async (resourceData: any) => {
    const resource = await sdk.insert('libraryResources', {
      ...resourceData,
      addedAt: new Date().toISOString()
    });
    
    const { libraryResources } = get();
    set({ libraryResources: [...libraryResources, resource] });
    return resource;
  },

  updateLibraryResource: async (resourceId: string, updates: any) => {
    const resource = await sdk.update('libraryResources', resourceId, updates);
    
    const { libraryResources } = get();
    set({ 
      libraryResources: libraryResources.map(r => r.id === resourceId ? resource : r)
    });
    return resource;
  },

  deleteLibraryResource: async (resourceId: string) => {
    await sdk.delete('libraryResources', resourceId);
    const { libraryResources } = get();
    set({ libraryResources: libraryResources.filter(r => r.id !== resourceId) });
  }
}));