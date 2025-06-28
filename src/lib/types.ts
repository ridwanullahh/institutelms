export interface User {
  id: string;
  uid: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin' | 'staff';
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  academicInfo?: {
    studentId?: string;
    program?: string;
    year?: number;
    gpa?: number;
    credits?: number;
    department?: string;
    advisor?: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  verified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  uid: string;
  title: string;
  description: string;
  code: string;
  instructorId: string;
  instructorName: string;
  category: string;
  department: string;
  level: 'undergraduate' | 'graduate' | 'doctoral' | 'certificate';
  credits: number;
  duration: number; // in weeks
  maxStudents: number;
  currentEnrollment: number;
  prerequisites: string[];
  learningObjectives: string[];
  syllabus: CourseSyllabus[];
  schedule: CourseSchedule[];
  assessmentStructure: AssessmentStructure;
  resources: CourseResource[];
  thumbnail?: string;
  tags: string[];
  price: number;
  currency: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  reviewCount: number;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSyllabus {
  week: number;
  title: string;
  description: string;
  topics: string[];
  readings: string[];
  assignments: string[];
  dueDate?: string;
}

export interface CourseSchedule {
  id: string;
  type: 'lecture' | 'lab' | 'seminar' | 'exam' | 'office_hours';
  title: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  location: string;
  isOnline: boolean;
  meetingUrl?: string;
  recurring: boolean;
  exceptions?: string[]; // dates to skip
}

export interface AssessmentStructure {
  assignments: number; // percentage
  quizzes: number;
  midterm: number;
  final: number;
  participation: number;
  projects: number;
}

export interface CourseResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link' | 'document' | 'presentation';
  url: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  isRequired: boolean;
}

export interface Lesson {
  id: string;
  uid: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  content: string;
  contentType: 'text' | 'video' | 'audio' | 'interactive' | 'quiz' | 'assignment';
  duration: number; // in minutes
  order: number;
  videoUrl?: string;
  videoTranscript?: string;
  resources: LessonResource[];
  quiz?: Quiz;
  assignment?: Assignment;
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isPreview: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResource {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
}

export interface Assignment {
  id: string;
  uid: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  instructions: string;
  type: 'essay' | 'multiple_choice' | 'coding' | 'project' | 'presentation' | 'peer_review';
  maxPoints: number;
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
  dueDate: string;
  lateSubmissionPenalty: number;
  allowLateSubmission: boolean;
  rubric: AssignmentRubric[];
  resources: string[];
  submissionFormat: string[];
  plagiarismCheck: boolean;
  aiGradingEnabled: boolean;
  peerReviewEnabled: boolean;
  groupAssignment: boolean;
  maxGroupSize?: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRubric {
  criteria: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface Submission {
  id: string;
  uid: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments: SubmissionAttachment[];
  submittedAt: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
  grade?: number;
  feedback?: string;
  rubricScores?: RubricScore[];
  plagiarismScore?: number;
  aiAnalysis?: AIAnalysis;
  gradedBy?: string;
  gradedAt?: string;
  attempt: number;
  timeSpent?: number;
}

export interface SubmissionAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface RubricScore {
  criteria: string;
  score: number;
  feedback: string;
}

export interface AIAnalysis {
  qualityScore: number;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  estimatedGrade: number;
}

export interface Quiz {
  id: string;
  uid: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  instructions: string;
  questions: QuizQuestion[];
  timeLimit: number;
  attempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  availableFrom: string;
  availableUntil: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface QuizAttempt {
  id: string;
  uid: string;
  quizId: string;
  studentId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface Discussion {
  id: string;
  uid: string;
  courseId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: 'general' | 'assignment' | 'lecture' | 'technical' | 'announcement';
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  likes: number;
  replies: DiscussionReply[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  parentId?: string; // for nested replies
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  uid: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  grade?: number;
  letterGrade?: string;
  completedLessons: string[];
  completedAssignments: string[];
  completedQuizzes: string[];
  lastAccessedAt: string;
  certificateIssued: boolean;
  certificateUrl?: string;
}

export interface Announcement {
  id: string;
  uid: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'event' | 'deadline';
  targetAudience: 'all' | 'students' | 'instructors' | 'staff' | 'course_specific';
  courseId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor?: string;
  expiresAt?: string;
  attachments: string[];
  readBy: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  uid: string;
  title: string;
  description: string;
  type: 'lecture' | 'exam' | 'assignment_due' | 'event' | 'holiday' | 'meeting';
  startDate: string;
  endDate: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  courseId?: string;
  organizerId: string;
  attendees: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders: EventReminder[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms';
  minutesBefore: number;
}

export interface Grade {
  id: string;
  uid: string;
  studentId: string;
  courseId: string;
  assignmentId?: string;
  quizId?: string;
  type: 'assignment' | 'quiz' | 'exam' | 'participation' | 'final';
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
  isExcused: boolean;
  isLate: boolean;
  latePenalty?: number;
}

export interface Certificate {
  id: string;
  uid: string;
  studentId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  completionDate: string;
  grade: string;
  certificateUrl: string;
  verificationCode: string;
  issuedAt: string;
}

export interface Analytics {
  id: string;
  uid: string;
  userId: string;
  courseId?: string;
  event: string;
  data: Record<string, any>;
  timestamp: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

export interface LiveSession {
  id: string;
  uid: string;
  courseId: string;
  instructorId: string;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  meetingUrl: string;
  recordingUrl?: string;
  attendees: LiveSessionAttendee[];
  maxAttendees: number;
  isRecorded: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  whiteboardEnabled: boolean;
  pollsEnabled: boolean;
  breakoutRoomsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveSessionAttendee {
  userId: string;
  userName: string;
  joinedAt: string;
  leftAt?: string;
  duration: number;
  participationScore: number;
}

export interface Notification {
  id: string;
  uid: string;
  userId: string;
  type: 'assignment_due' | 'grade_posted' | 'announcement' | 'message' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  uid: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  parentId?: string; // for replies
  threadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroup {
  id: string;
  uid: string;
  name: string;
  description: string;
  courseId: string;
  creatorId: string;
  members: StudyGroupMember[];
  maxMembers: number;
  isPrivate: boolean;
  meetingSchedule?: string;
  meetingUrl?: string;
  resources: string[];
  discussions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroupMember {
  userId: string;
  userName: string;
  role: 'creator' | 'moderator' | 'member';
  joinedAt: string;
}

export interface AITutorSession {
  id: string;
  uid: string;
  userId: string;
  courseId?: string;
  messages: AITutorMessage[];
  context: string;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  sessionType: 'general' | 'homework_help' | 'concept_explanation' | 'exam_prep';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  satisfaction?: number;
  feedback?: string;
}

export interface AITutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'code' | 'math' | 'diagram';
  attachments?: string[];
  feedback?: {
    helpful: boolean;
    rating: number;
  };
}