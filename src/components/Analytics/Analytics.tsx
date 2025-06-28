import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Target,
  Award,
  Brain,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    courses, 
    assignments, 
    submissions, 
    grades, 
    users, 
    discussions,
    liveSessions,
    quizzes,
    quizAttempts
  } = usePlatformStore();
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'performance' | 'activity'>('engagement');

  // Generate analytics data
  const generateEngagementData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        logins: Math.floor(Math.random() * 100) + 50,
        courseViews: Math.floor(Math.random() * 200) + 100,
        submissions: Math.floor(Math.random() * 50) + 20,
        discussions: Math.floor(Math.random() * 30) + 10
      });
    }
    
    return data;
  };

  const generatePerformanceData = () => {
    return courses.slice(0, 6).map(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id);
      const avgGrade = courseGrades.length > 0 
        ? courseGrades.reduce((sum, g) => sum + g.percentage, 0) / courseGrades.length 
        : 0;
      
      return {
        course: course.code,
        average: avgGrade,
        completion: Math.floor(Math.random() * 30) + 70,
        satisfaction: Math.floor(Math.random() * 20) + 80
      };
    });
  };

  const generateActivityData = () => {
    return [
      { name: 'Course Views', value: 2400, color: '#3B82F6' },
      { name: 'Assignments', value: 1398, color: '#10B981' },
      { name: 'Discussions', value: 800, color: '#8B5CF6' },
      { name: 'Live Sessions', value: 600, color: '#F59E0B' },
      { name: 'Quizzes', value: 400, color: '#EF4444' }
    ];
  };

  const generateLearningPathData = () => {
    return [
      { subject: 'Mathematics', A: 120, B: 110, fullMark: 150 },
      { subject: 'Physics', A: 98, B: 130, fullMark: 150 },
      { subject: 'Chemistry', A: 86, B: 130, fullMark: 150 },
      { subject: 'Biology', A: 99, B: 100, fullMark: 150 },
      { subject: 'Computer Science', A: 85, B: 90, fullMark: 150 },
      { subject: 'Literature', A: 65, B: 85, fullMark: 150 }
    ];
  };

  const engagementData = generateEngagementData();
  const performanceData = generatePerformanceData();
  const activityData = generateActivityData();
  const learningPathData = generateLearningPathData();

  // Calculate key metrics
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalCourses = courses.length;
  const totalAssignments = assignments.length;
  const completionRate = submissions.length > 0 ? 
    (submissions.filter(s => s.status === 'graded').length / submissions.length) * 100 : 0;
  const averageGrade = grades.length > 0 ? 
    grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length : 0;

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: string;
    icon: React.ElementType;
    color: string;
    trend: 'up' | 'down' | 'stable';
  }> = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-center space-x-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4" />
            )}
            <span className={`text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into learning performance and engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={totalStudents}
          change="+12% from last month"
          icon={Users}
          color="bg-blue-500"
          trend="up"
        />
        <MetricCard
          title="Active Courses"
          value={totalCourses}
          change="+3 new courses"
          icon={BookOpen}
          color="bg-green-500"
          trend="up"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          change="+5.2% improvement"
          icon={Target}
          color="bg-purple-500"
          trend="up"
        />
        <MetricCard
          title="Average Grade"
          value={`${averageGrade.toFixed(1)}%`}
          change="+2.1% this month"
          icon={Award}
          color="bg-orange-500"
          trend="up"
        />
      </div>

      {/* Metric Selector */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'engagement', label: 'Engagement', icon: Eye },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'activity', label: 'Activity', icon: BarChart3 }
        ].map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedMetric === metric.id 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <metric.icon className="w-4 h-4" />
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedMetric === 'engagement' ? 'User Engagement Trends' :
             selectedMetric === 'performance' ? 'Course Performance' :
             'Activity Distribution'}
          </h3>
          
          {selectedMetric === 'engagement' && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="logins" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="courseViews" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="submissions" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          
          {selectedMetric === 'performance' && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3B82F6" name="Average Grade" />
                <Bar dataKey="completion" fill="#10B981" name="Completion Rate" />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {selectedMetric === 'activity' && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Learning Path Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Path Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={learningPathData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Target" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { type: 'assignment', title: 'New assignment submitted', time: '2 hours ago', icon: FileText, color: 'text-blue-600' },
              { type: 'discussion', title: 'Discussion reply posted', time: '4 hours ago', icon: MessageSquare, color: 'text-green-600' },
              { type: 'quiz', title: 'Quiz completed', time: '6 hours ago', icon: CheckCircle, color: 'text-purple-600' },
              { type: 'session', title: 'Live session attended', time: '1 day ago', icon: Video, color: 'text-orange-600' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
          <div className="space-y-4">
            {users.filter(u => u.role === 'student').slice(0, 5).map((student, index) => {
              const studentGrades = grades.filter(g => g.studentId === student.id);
              const avgGrade = studentGrades.length > 0 
                ? studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length 
                : 0;
              
              return (
                <div key={student.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{avgGrade.toFixed(1)}% average</p>
                  </div>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Engagement Boost</h4>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Interactive content increases engagement by 34% compared to traditional lectures.
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Performance Trend</h4>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Students who participate in discussions score 15% higher on average.
              </p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">At-Risk Students</h4>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                3 students may need additional support based on recent performance patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;