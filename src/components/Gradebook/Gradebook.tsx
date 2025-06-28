import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  MessageSquare,
  Brain,
  Target,
  Clock,
  Percent
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Grade, Course, User as UserType } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Gradebook: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    grades, 
    courses, 
    users,
    assignments,
    quizzes,
    loadGrades, 
    loadUsers,
    updateGrade,
    bulkUpdateGrades
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  useEffect(() => {
    loadGrades();
    loadUsers();
  }, []);

  const filteredGrades = grades.filter(grade => {
    const student = users.find(u => u.id === grade.studentId);
    const course = courses.find(c => c.id === grade.courseId);
    
    const matchesSearch = student ? 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.academicInfo?.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const matchesCourse = filterCourse === 'all' || grade.courseId === filterCourse;
    const matchesType = filterType === 'all' || grade.type === filterType;
    
    // Filter by instructor for instructor role
    const matchesInstructor = user?.role !== 'instructor' || 
      course?.instructorId === user.id;
    
    return matchesSearch && matchesCourse && matchesType && matchesInstructor;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  const calculateStudentStats = (studentId: string, courseId?: string) => {
    const studentGrades = grades.filter(g => 
      g.studentId === studentId && 
      (!courseId || g.courseId === courseId)
    );
    
    if (studentGrades.length === 0) return null;
    
    const totalPoints = studentGrades.reduce((sum, g) => sum + g.score, 0);
    const maxPoints = studentGrades.reduce((sum, g) => sum + g.maxScore, 0);
    const average = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    
    return {
      totalGrades: studentGrades.length,
      average,
      letterGrade: getLetterGrade(average),
      trend: 'stable' // Calculate based on recent grades
    };
  };

  const GradeCard: React.FC<{ grade: Grade }> = ({ grade }) => {
    const student = users.find(u => u.id === grade.studentId);
    const course = courses.find(c => c.id === grade.courseId);
    const assignment = assignments.find(a => a.id === grade.assignmentId);
    const quiz = quizzes.find(q => q.id === grade.quizId);
    
    const itemName = assignment?.title || quiz?.title || `${grade.type} Assessment`;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {student?.firstName} {student?.lastName}
              </h3>
              <span className="text-sm text-gray-500">
                ({student?.academicInfo?.studentId})
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {course?.title} • {course?.code}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {itemName}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
              {grade.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">{grade.letterGrade}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>{grade.score}/{grade.maxScore} points</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(grade.gradedAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span className="capitalize">{grade.type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {grade.isLate ? (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500">Late</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500">On Time</span>
              </>
            )}
          </div>
        </div>
        
        {grade.feedback && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Feedback:</strong> {grade.feedback}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Handle edit grade */}}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Grade"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Handle view details */}}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Handle send message */}}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Message Student"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Graded by {grade.gradedBy}
          </div>
        </div>
      </div>
    );
  };

  const StudentOverview: React.FC = () => {
    const studentGrades = grades.reduce((acc, grade) => {
      const student = users.find(u => u.id === grade.studentId);
      if (!student) return acc;
      
      if (!acc[grade.studentId]) {
        acc[grade.studentId] = {
          student,
          grades: [],
          stats: null
        };
      }
      
      acc[grade.studentId].grades.push(grade);
      return acc;
    }, {} as Record<string, { student: UserType; grades: Grade[]; stats: any }>);

    // Calculate stats for each student
    Object.keys(studentGrades).forEach(studentId => {
      studentGrades[studentId].stats = calculateStudentStats(studentId);
    });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Overall Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Letter Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Grades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {Object.values(studentGrades).map(({ student, grades: studentGradeList, stats }) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.academicInfo?.studentId} • {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-lg font-semibold ${getGradeColor(stats?.average || 0)}`}>
                      {stats?.average?.toFixed(1) || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats?.letterGrade === 'A' || stats?.letterGrade === 'A+' || stats?.letterGrade === 'A-' 
                        ? 'bg-green-100 text-green-800'
                        : stats?.letterGrade?.startsWith('B') 
                        ? 'bg-blue-100 text-blue-800'
                        : stats?.letterGrade?.startsWith('C')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stats?.letterGrade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {stats?.totalGrades || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Improving</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        title="Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === 'overview' ? 'Gradebook Overview' : 
             viewMode === 'detailed' ? 'Detailed Grades' : 'Grade Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'overview' ? 'Monitor student performance and grades' :
             viewMode === 'detailed' ? 'View and manage individual grades' :
             'Analyze grade trends and performance metrics'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Analytics
            </button>
          </div>
          
          <button
            onClick={() => {/* Handle export */}}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Grades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{grades.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Class Average</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {grades.length > 0 
                  ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(1)
                  : 0
                }%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passing Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {grades.length > 0 
                  ? ((grades.filter(g => g.percentage >= 60).length / grades.length) * 100).toFixed(1)
                  : 0
                }%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(grades.map(g => g.studentId)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Courses</option>
            {courses.filter(c => user?.role !== 'instructor' || c.instructorId === user.id).map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="exam">Exams</option>
            <option value="participation">Participation</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && <StudentOverview />}
      
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGrades.map((grade) => (
            <GradeCard key={grade.id} grade={grade} />
          ))}
        </div>
      )}

      {filteredGrades.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No grades found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Grades will appear here once assignments are graded'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Gradebook;