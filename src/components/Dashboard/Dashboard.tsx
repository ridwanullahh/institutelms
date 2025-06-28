import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  TrendingUp,
  Clock,
  Target,
  Brain,
  Star,
  Calendar,
  MessageSquare,
  Video,
  Award,
  FileText,
  BarChart3,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuthStore } from '../../store/auth';
import { usePlatformStore } from '../../store/platform';
import { format, startOfWeek, endOfWeek, isToday, isTomorrow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    courses, 
    assignments, 
    announcements, 
    events, 
    notifications,
    loadCourses,
    loadAssignments,
    loadAnnouncements,
    loadEvents,
    loadNotifications
  } = usePlatformStore();

  const [dashboardData, setDashboardData] = useState({
    progressData: [],
    performanceData: [],
    activityData: [],
    upcomingEvents: [],
    recentActivities: [],
    stats: {}
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        await Promise.all([
          loadCourses(),
          loadAssignments(),
          loadAnnouncements(),
          loadEvents(),
          loadNotifications(user.id!)
        ]);
      }
    };

    loadDashboardData();
  }, [user]);

  useEffect(() => {
    // Process data for dashboard
    const processedData = processDashboardData();
    setDashboardData(processedData);
  }, [courses, assignments, events, user]);

  const processDashboardData = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Generate sample progress data
    const progressData = [
      { name: 'Week 1', progress: 20, engagement: 15 },
      { name: 'Week 2', progress: 35, engagement: 28 },
      { name: 'Week 3', progress: 55, engagement: 45 },
      { name: 'Week 4', progress: 78, engagement: 72 },
      { name: 'Week 5', progress: 85, engagement: 88 },
    ];

    // Generate performance data based on user role
    const performanceData = user?.role === 'instructor' 
      ? [
          { subject: 'Course Engagement', score: 92 },
          { subject: 'Student Satisfaction', score: 88 },
          { subject: 'Content Quality', score: 95 },
          { subject: 'Response Time', score: 85 },
          { subject: 'Innovation Score', score: 90 },
        ]
      : [
          { subject: 'Mathematics', score: 92 },
          { subject: 'Physics', score: 88 },
          { subject: 'Chemistry', score: 85 },
          { subject: 'Biology', score: 90 },
          { subject: 'Computer Science', score: 95 },
        ];

    // Activity data for the week
    const activityData = [
      { day: 'Mon', lessons: 3, assignments: 1, discussions: 2 },
      { day: 'Tue', lessons: 2, assignments: 2, discussions: 1 },
      { day: 'Wed', lessons: 4, assignments: 0, discussions: 3 },
      { day: 'Thu', lessons: 1, assignments: 1, discussions: 2 },
      { day: 'Fri', lessons: 3, assignments: 2, discussions: 1 },
      { day: 'Sat', lessons: 2, assignments: 0, discussions: 1 },
      { day: 'Sun', lessons: 1, assignments: 1, discussions: 0 },
    ];

    // Upcoming events
    const upcomingEvents = events
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);

    // Recent activities
    const recentActivities = [
      {
        type: 'assignment',
        title: 'Machine Learning Assignment #3',
        course: 'AI Fundamentals',
        time: '2 hours ago',
        status: 'submitted',
        icon: FileText
      },
      {
        type: 'quiz',
        title: 'Quantum Physics Quiz',
        course: 'Advanced Physics',
        time: '5 hours ago',
        status: 'completed',
        icon: CheckCircle
      },
      {
        type: 'discussion',
        title: 'Data Structures Discussion',
        course: 'Computer Science',
        time: '1 day ago',
        status: 'replied',
        icon: MessageSquare
      },
      {
        type: 'live_session',
        title: 'Advanced Calculus Lecture',
        course: 'Mathematics',
        time: '2 days ago',
        status: 'attended',
        icon: Video
      }
    ];

    // Calculate stats based on user role
    const stats = user?.role === 'instructor' 
      ? {
          totalCourses: courses.filter(c => c.instructorId === user.id).length,
          totalStudents: courses.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0),
          avgRating: 4.7,
          totalHours: 127
        }
      : user?.role === 'admin'
      ? {
          totalUsers: 1250,
          totalCourses: courses.length,
          systemUptime: '99.9%',
          activeUsers: 892
        }
      : {
          enrolledCourses: 8,
          completedAssignments: 24,
          averageScore: 87,
          studyHours: 127
        };

    return {
      progressData,
      performanceData,
      activityData,
      upcomingEvents,
      recentActivities,
      stats
    };
  };

  const getStatsConfig = () => {
    switch (user?.role) {
      case 'instructor':
        return [
          {
            title: 'My Courses',
            value: dashboardData.stats.totalCourses || '0',
            icon: BookOpen,
            color: 'bg-blue-500',
            change: '+2 this month'
          },
          {
            title: 'Total Students',
            value: dashboardData.stats.totalStudents || '0',
            icon: Users,
            color: 'bg-green-500',
            change: '+12% from last month'
          },
          {
            title: 'Average Rating',
            value: dashboardData.stats.avgRating || '0',
            icon: Star,
            color: 'bg-yellow-500',
            change: '+0.2 improvement'
          },
          {
            title: 'Teaching Hours',
            value: dashboardData.stats.totalHours || '0',
            icon: Clock,
            color: 'bg-purple-500',
            change: 'This semester'
          }
        ];
      case 'admin':
        return [
          {
            title: 'Total Users',
            value: dashboardData.stats.totalUsers || '0',
            icon: Users,
            color: 'bg-blue-500',
            change: '+15% this month'
          },
          {
            title: 'Active Courses',
            value: dashboardData.stats.totalCourses || '0',
            icon: BookOpen,
            color: 'bg-green-500',
            change: '+8 new courses'
          },
          {
            title: 'System Uptime',
            value: dashboardData.stats.systemUptime || '0%',
            icon: TrendingUp,
            color: 'bg-emerald-500',
            change: 'Last 30 days'
          },
          {
            title: 'Active Users',
            value: dashboardData.stats.activeUsers || '0',
            icon: Globe,
            color: 'bg-orange-500',
            change: 'Currently online'
          }
        ];
      default:
        return [
          {
            title: 'Enrolled Courses',
            value: dashboardData.stats.enrolledCourses || '0',
            icon: BookOpen,
            color: 'bg-blue-500',
            change: '+2 this month'
          },
          {
            title: 'Completed Tasks',
            value: dashboardData.stats.completedAssignments || '0',
            icon: Trophy,
            color: 'bg-green-500',
            change: '+12% from last month'
          },
          {
            title: 'Average Score',
            value: `${dashboardData.stats.averageScore || 0}%`,
            icon: TrendingUp,
            color: 'bg-purple-500',
            change: '+5% improvement'
          },
          {
            title: 'Study Hours',
            value: dashboardData.stats.studyHours || '0',
            icon: Clock,
            color: 'bg-orange-500',
            change: 'This month'
          }
        ];
    }
  };

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'instructor':
        return 'Instructor Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Student Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    switch (user?.role) {
      case 'instructor':
        return 'Manage your courses and track student progress with AI-powered insights';
      case 'admin':
        return 'Monitor system performance and manage the learning platform';
      default:
        return 'Continue your learning journey with personalized AI assistance';
    }
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName || user?.email}!
            </h1>
            <p className="text-blue-100 text-lg">
              {getDashboardSubtitle()}
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">AI Assistant Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Progress</span>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Engagement</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="progress" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="engagement" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {user?.role === 'instructor' ? 'Teaching Performance' : 'Subject Performance'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Overview & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lessons" fill="#3B82F6" name="Lessons" />
              <Bar dataKey="assignments" fill="#10B981" name="Assignments" />
              <Bar dataKey="discussions" fill="#F59E0B" name="Discussions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashboardData.upcomingEvents.length > 0 ? (
              dashboardData.upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    isToday(new Date(event.startDate)) ? 'bg-red-500' :
                    isTomorrow(new Date(event.startDate)) ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(event.startDate), 'MMM d, h:mm a')}
                    </p>
                    {event.isOnline && (
                      <div className="flex items-center mt-1">
                        <Video className="w-3 h-3 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-500">Online</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'quiz' ? 'bg-green-100 text-green-600' :
                  activity.type === 'discussion' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.course}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                    activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                    activity.status === 'replied' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Study Optimization</h4>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Your peak learning time is 10-11 AM. Schedule complex topics during this window.
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Next Milestone</h4>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Complete 2 more assignments to unlock advanced AI algorithms module.
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Progress Boost</h4>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your learning velocity increased 23% this week. Excellent momentum!
              </p>
            </div>

            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-orange-800 dark:text-orange-300">Attention Needed</h4>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Review quantum mechanics concepts before tomorrow's quiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;