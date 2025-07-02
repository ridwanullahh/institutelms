import React from 'react';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  Brain, 
  GraduationCap, 
  Award, 
  Bell, 
  Video, 
  Mail, 
  UserCheck, 
  Globe, 
  Shield, 
  Database, 
  Zap, 
  BookMarked, 
  Presentation as PresentationChart, 
  Headphones, 
  Camera, 
  FileVideo, 
  Clipboard,
  DollarSign,
  CreditCard,
  TrendingUp,
  Library,
  FileBarChart,
  UserGraduate,
  MapPin,
  Receipt,
  PieChart,
  Building
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';

const Sidebar: React.FC = () => {
  const { sidebarOpen, currentView, setCurrentView } = usePlatformStore();
  const { user } = useAuthStore();

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'quizzes', label: 'Quizzes & Exams', icon: Clipboard },
    { id: 'grades', label: 'Grades', icon: Award },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'live-sessions', label: 'Live Classes', icon: Video },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Brain },
    { id: 'study-groups', label: 'Study Groups', icon: Users },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'transcripts', label: 'Transcripts', icon: FileBarChart },
    { id: 'degree-planning', label: 'Degree Planning', icon: UserGraduate },
    { id: 'financial-aid', label: 'Financial Aid', icon: DollarSign },
    { id: 'tuition', label: 'Tuition & Billing', icon: Receipt },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'analytics', label: 'My Progress', icon: BarChart3 },
  ];

  const instructorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'course-builder', label: 'Course Builder', icon: Zap },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'grading', label: 'Grading Center', icon: UserCheck },
    { id: 'quizzes', label: 'Quiz Builder', icon: Clipboard },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'live-sessions', label: 'Live Sessions', icon: Video },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Course Analytics', icon: PresentationChart },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'content-library', label: 'Content Library', icon: Database },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'transcripts', label: 'Transcripts', icon: FileBarChart },
    { id: 'degree-planning', label: 'Degree Planning', icon: UserGraduate },
    { id: 'faculty-performance', label: 'Performance', icon: TrendingUp },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: Home },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'course-management', label: 'Course Management', icon: BookOpen },
    { id: 'enrollment-management', label: 'Enrollment Management', icon: UserGraduate },
    { id: 'academic-administration', label: 'Academic Admin', icon: Building },
    { id: 'financial-management', label: 'Financial Management', icon: DollarSign },
    { id: 'tuition-management', label: 'Tuition Management', icon: CreditCard },
    { id: 'financial-aid-admin', label: 'Financial Aid Admin', icon: Receipt },
    { id: 'system-analytics', label: 'System Analytics', icon: BarChart3 },
    { id: 'institutional-analytics', label: 'Institutional Analytics', icon: PieChart },
    { id: 'accreditation', label: 'Accreditation', icon: Award },
    { id: 'retention-analytics', label: 'Retention Analytics', icon: TrendingUp },
    { id: 'faculty-performance', label: 'Faculty Performance', icon: UserCheck },
    { id: 'resource-utilization', label: 'Resource Utilization', icon: BarChart3 },
    { id: 'library-management', label: 'Library Management', icon: Library },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'reports', label: 'Reports', icon: PresentationChart },
    { id: 'ai-management', label: 'AI Management', icon: Brain },
    { id: 'content-moderation', label: 'Content Moderation', icon: Shield },
    { id: 'system-settings', label: 'System Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'backup-restore', label: 'Backup & Restore', icon: Database },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'support-center', label: 'Support Center', icon: Headphones },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'instructor':
        return instructorMenuItems;
      case 'admin':
        return adminMenuItems;
      case 'staff':
        return [...instructorMenuItems, ...adminMenuItems.slice(4, 8)];
      default:
        return studentMenuItems;
    }
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduAI Pro</h1>
            <p className="text-sm text-gray-500">AI-Powered Learning</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {getMenuItems().map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              currentView === item.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;