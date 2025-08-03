import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText, 
  Calendar, 
  Award, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Eye, 
  MapPin, 
  Building, 
  CreditCard, 
  Target,
  Star,
  Zap,
  Brain,
  Globe,
  Shield
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AcademicAdministration: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    users,
    courses,
    enrollments,
    transcripts,
    degreePlans,
    loadUsers,
    loadCourses,
    loadEnrollments,
    loadTranscripts,
    loadDegreePlans
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'faculty' | 'courses' | 'programs' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    loadUsers();
    loadCourses();
    loadEnrollments();
    loadTranscripts();
    loadDegreePlans();
  }, []);

  // Mock data for demonstration
  const academicStats = {
    totalStudents: 1250,
    activeStudents: 1180,
    totalFaculty: 85,
    activeCourses: 156,
    completedCourses: 89,
    averageGPA: 3.42,
    graduationRate: 87.5,
    retentionRate: 92.3,
    enrollmentGrowth: 8.5,
    facultyToStudentRatio: '1:15'
  };

  const recentActivities = [
    {
      id: '1',
      type: 'enrollment',
      description: 'New student enrollment: Alice Johnson',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'course',
      description: 'Course approved: Advanced Machine Learning',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'completed'
    },
    {
      id: '3',
      type: 'graduation',
      description: 'Graduation application submitted: Bob Smith',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'pending'
    },
    {
      id: '4',
      type: 'faculty',
      description: 'New faculty member added: Dr. Sarah Wilson',
      timestamp: '2024-01-14T14:20:00Z',
      status: 'completed'
    }
  ];

  const upcomingDeadlines = [
    {
      id: '1',
      title: 'Course Registration Deadline',
      date: '2024-02-01',
      type: 'registration',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Midterm Grades Due',
      date: '2024-02-15',
      type: 'grades',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Graduation Application Deadline',
      date: '2024-03-01',
      type: 'graduation',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Faculty Performance Reviews',
      date: '2024-03-15',
      type: 'review',
      priority: 'low'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'programs', label: 'Programs', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return Users;
      case 'course': return BookOpen;
      case 'graduation': return GraduationCap;
      case 'faculty': return Award;
      default: return FileText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; change?: number; icon: React.ComponentType<any>; color: string }> = 
    ({ title, value, change, icon: Icon, color }) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{change >= 0 ? '+' : ''}{change}%</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );

  const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
    const Icon = getActivityIcon(activity.type);
    
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          activity.status === 'completed' 
            ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
            : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
        }`}>
          {activity.status}
        </div>
      </div>
    );
  };

  const DeadlineItem: React.FC<{ deadline: any }> = ({ deadline }) => {
    const daysUntil = Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{deadline.title}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(deadline.date), 'MMM dd, yyyy')} • {daysUntil} days
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
          {deadline.priority}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Administration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive academic management and oversight
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="current">Current Semester</option>
            <option value="previous">Previous Semester</option>
            <option value="year">Academic Year</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={academicStats.totalStudents.toLocaleString()}
              change={academicStats.enrollmentGrowth}
              icon={Users}
              color="bg-blue-600"
            />
            <StatCard
              title="Active Faculty"
              value={academicStats.totalFaculty}
              icon={GraduationCap}
              color="bg-green-600"
            />
            <StatCard
              title="Active Courses"
              value={academicStats.activeCourses}
              icon={BookOpen}
              color="bg-purple-600"
            />
            <StatCard
              title="Average GPA"
              value={academicStats.averageGPA}
              icon={Award}
              color="bg-orange-600"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Graduation Rate</span>
                  <span className="font-semibold text-green-600">{academicStats.graduationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${academicStats.graduationRate}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                  <span className="font-semibold text-blue-600">{academicStats.retentionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${academicStats.retentionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentActivities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upcomingDeadlines.map(deadline => (
                  <DeadlineItem key={deadline.id} deadline={deadline} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Add Student', icon: Users, color: 'bg-blue-600' },
                { label: 'Create Course', icon: BookOpen, color: 'bg-green-600' },
                { label: 'Generate Report', icon: FileText, color: 'bg-purple-600' },
                { label: 'Schedule Event', icon: Calendar, color: 'bg-orange-600' },
                { label: 'Manage Faculty', icon: GraduationCap, color: 'bg-red-600' },
                { label: 'View Analytics', icon: BarChart3, color: 'bg-indigo-600' }
              ].map(({ label, icon: Icon, color }) => (
                <button
                  key={label}
                  className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs would be implemented similarly */}
      {activeTab !== 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            {tabs.find(tab => tab.id === activeTab)?.icon && 
              React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, { 
                className: "w-8 h-8 text-blue-600" 
              })
            }
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {tabs.find(tab => tab.id === activeTab)?.label} Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Detailed {activeTab} management interface would be implemented here with full CRUD operations, 
            advanced filtering, bulk actions, and comprehensive reporting capabilities.
          </p>
          <div className="flex justify-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View All {tabs.find(tab => tab.id === activeTab)?.label}
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicAdministration;
