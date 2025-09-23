import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  FileText, 
  UserCheck, 
  UserX, 
  BarChart3,
  PieChart,
  Target,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Enrollment, Course, User } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  instructorName: string;
  enrollmentDate: string;
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  credits: number;
  semester: string;
  academicYear: string;
  tuitionPaid: boolean;
  prerequisites: string[];
  enrollmentType: 'regular' | 'audit' | 'pass-fail';
  section: string;
  schedule: {
    days: string[];
    time: string;
    location: string;
  };
}

const EnrollmentManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    enrollments, 
    courses,
    users,
    loadEnrollments,
    loadCourses,
    loadUsers,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRecord | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showBulkEnrollModal, setShowBulkEnrollModal] = useState(false);
  const [viewMode, setViewMode] = useState<'enrollments' | 'waitlist' | 'analytics'>('enrollments');

  // Mock enrollment data for demonstration
  const [enrollmentRecords, setEnrollmentRecords] = useState<EnrollmentRecord[]>([
    {
      id: '1',
      studentId: 'student1',
      studentName: 'Alice Johnson',
      studentEmail: 'alice@example.com',
      courseId: 'course1',
      courseName: 'Introduction to Computer Science',
      courseCode: 'CS101',
      instructorName: 'Dr. Smith',
      enrollmentDate: '2024-01-15',
      status: 'enrolled',
      credits: 3,
      semester: 'Fall',
      academicYear: '2024-2025',
      tuitionPaid: true,
      prerequisites: [],
      enrollmentType: 'regular',
      section: 'A',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00 AM - 11:00 AM',
        location: 'Room 101'
      }
    },
    {
      id: '2',
      studentId: 'student2',
      studentName: 'Bob Smith',
      studentEmail: 'bob@example.com',
      courseId: 'course2',
      courseName: 'Calculus I',
      courseCode: 'MATH101',
      instructorName: 'Dr. Johnson',
      enrollmentDate: '2024-01-20',
      status: 'waitlisted',
      credits: 4,
      semester: 'Fall',
      academicYear: '2024-2025',
      tuitionPaid: false,
      prerequisites: ['Pre-Calculus'],
      enrollmentType: 'regular',
      section: 'B',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 PM - 3:30 PM',
        location: 'Room 205'
      }
    },
    {
      id: '3',
      studentId: 'student3',
      studentName: 'Carol Davis',
      studentEmail: 'carol@example.com',
      courseId: 'course1',
      courseName: 'Introduction to Computer Science',
      courseCode: 'CS101',
      instructorName: 'Dr. Smith',
      enrollmentDate: '2024-01-10',
      status: 'completed',
      grade: 'A',
      credits: 3,
      semester: 'Spring',
      academicYear: '2023-2024',
      tuitionPaid: true,
      prerequisites: [],
      enrollmentType: 'regular',
      section: 'A',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00 AM - 11:00 AM',
        location: 'Room 101'
      }
    }
  ]);

  useEffect(() => {
    loadEnrollments();
    loadCourses();
    loadUsers();
  }, []);

  const filteredEnrollments = enrollmentRecords.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesSemester = filterSemester === 'all' || enrollment.semester === filterSemester;
    const matchesCourse = filterCourse === 'all' || enrollment.courseId === filterCourse;
    
    return matchesSearch && matchesStatus && matchesSemester && matchesCourse;
  });

  const handleEnrollStudent = async (studentId: string, courseId: string, enrollmentType: string = 'regular') => {
    try {
      // Check prerequisites and capacity
      const course = courses.find(c => c.id === courseId);
      const student = users.find(u => u.id === studentId);
      
      if (!course || !student) {
        toast.error('Course or student not found');
        return;
      }

      // Check if already enrolled
      const existingEnrollment = enrollmentRecords.find(e => 
        e.studentId === studentId && e.courseId === courseId && e.status === 'enrolled'
      );
      
      if (existingEnrollment) {
        toast.error('Student is already enrolled in this course');
        return;
      }

      // Check capacity
      const currentEnrollments = enrollmentRecords.filter(e => 
        e.courseId === courseId && e.status === 'enrolled'
      ).length;
      
      const status = currentEnrollments >= (course.maxStudents || 30) ? 'waitlisted' : 'enrolled';

      const newEnrollment: EnrollmentRecord = {
        id: Date.now().toString(),
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        courseId,
        courseName: course.title,
        courseCode: course.code,
        instructorName: course.instructorName,
        enrollmentDate: new Date().toISOString(),
        status,
        credits: course.credits || 3,
        semester: 'Fall',
        academicYear: '2024-2025',
        tuitionPaid: false,
        prerequisites: course.prerequisites || [],
        enrollmentType: enrollmentType as any,
        section: 'A',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '10:00 AM - 11:00 AM',
          location: 'TBD'
        }
      };

      setEnrollmentRecords(prev => [...prev, newEnrollment]);
      toast.success(`Student ${status === 'enrolled' ? 'enrolled' : 'added to waitlist'} successfully`);
      setShowEnrollModal(false);
      
    } catch (error) {
      toast.error('Failed to enroll student');
    }
  };

  const handleUpdateEnrollmentStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      const updatedEnrollments = enrollmentRecords.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, status: newStatus as any }
          : enrollment
      );
      setEnrollmentRecords(updatedEnrollments);
      toast.success('Enrollment status updated successfully');
    } catch (error) {
      toast.error('Failed to update enrollment status');
    }
  };

  const handleDropStudent = async (enrollmentId: string) => {
    try {
      const updatedEnrollments = enrollmentRecords.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, status: 'dropped' as const }
          : enrollment
      );
      setEnrollmentRecords(updatedEnrollments);
      toast.success('Student dropped successfully');
    } catch (error) {
      toast.error('Failed to drop student');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'waitlisted': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'dropped': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'failed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const EnrollmentCard: React.FC<{ enrollment: EnrollmentRecord }> = ({ enrollment }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{enrollment.studentName}</h3>
              <p className="text-sm text-gray-500">{enrollment.studentEmail}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{enrollment.courseName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{enrollment.courseCode} - {enrollment.instructorName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Credits:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{enrollment.credits}</span>
            </div>
            <div>
              <span className="text-gray-500">Section:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{enrollment.section}</span>
            </div>
            <div>
              <span className="text-gray-500">Semester:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{enrollment.semester} {enrollment.academicYear}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{enrollment.enrollmentType}</span>
            </div>
          </div>

          {enrollment.grade && (
            <div className="text-sm">
              <span className="text-gray-500">Grade:</span>
              <span className="ml-2 font-bold text-blue-600">{enrollment.grade}</span>
            </div>
          )}

          <div className="text-sm">
            <span className="text-gray-500">Schedule:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {enrollment.schedule.days.join(', ')} - {enrollment.schedule.time}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className={enrollment.tuitionPaid ? 'text-green-600' : 'text-red-600'}>
                {enrollment.tuitionPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div className="text-gray-500">
              Enrolled: {format(new Date(enrollment.enrollmentDate), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedEnrollment(enrollment)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {user?.role === 'admin' && enrollment.status === 'waitlisted' && (
            <button
              onClick={() => handleUpdateEnrollmentStatus(enrollment.id, 'enrolled')}
              className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Enroll
            </button>
          )}
          
          {user?.role === 'admin' && enrollment.status === 'enrolled' && (
            <button
              onClick={() => handleDropStudent(enrollment.id)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Drop
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student course enrollments and waitlists
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBulkEnrollModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Enroll</span>
            </button>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { id: 'enrollments', label: 'Enrollments', icon: Users },
          { id: 'waitlist', label: 'Waitlist', icon: Clock },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewMode(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {enrollmentRecords.filter(e => e.status === 'enrolled').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Enrolled</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {enrollmentRecords.filter(e => e.status === 'waitlisted').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Waitlisted</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {enrollmentRecords.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {enrollmentRecords.filter(e => e.status === 'dropped').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Dropped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="dropped">Dropped</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Semesters</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enrollments View */}
      {viewMode === 'enrollments' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEnrollments.map(enrollment => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </AnimatePresence>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No enrollments found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'No student enrollments yet'
                }
              </p>
              {user?.role === 'admin' && !searchTerm && (
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enroll First Student
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Waitlist View */}
      {viewMode === 'waitlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {enrollmentRecords
              .filter(e => e.status === 'waitlisted')
              .map(enrollment => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrollment Status Distribution</h3>
            <div className="space-y-3">
              {['enrolled', 'waitlisted', 'dropped', 'completed', 'failed'].map(status => {
                const count = enrollmentRecords.filter(e => e.status === status).length;
                const percentage = enrollmentRecords.length > 0 ? (count / enrollmentRecords.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'enrolled' ? 'bg-green-500' :
                        status === 'waitlisted' ? 'bg-yellow-500' :
                        status === 'dropped' ? 'bg-red-500' :
                        status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                      <span className="text-gray-500 text-sm">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Enrollment Numbers</h3>
            <div className="space-y-3">
              {courses.slice(0, 5).map(course => {
                const enrolledCount = enrollmentRecords.filter(e =>
                  e.courseId === course.id && e.status === 'enrolled'
                ).length;
                const waitlistedCount = enrollmentRecords.filter(e =>
                  e.courseId === course.id && e.status === 'waitlisted'
                ).length;
                const capacity = course.maxStudents || 30;
                const utilizationRate = (enrolledCount / capacity) * 100;

                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{course.code}</span>
                      <span className="text-gray-500 text-sm">{enrolledCount}/{capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      />
                    </div>
                    {waitlistedCount > 0 && (
                      <div className="text-sm text-yellow-600">
                        {waitlistedCount} on waitlist
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrollment Trends</h3>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Tuition Paid</span>
                <span className="text-green-600 font-medium">
                  {enrollmentRecords.filter(e => e.tuitionPaid).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Payment Pending</span>
                <span className="text-red-600 font-medium">
                  {enrollmentRecords.filter(e => !e.tuitionPaid).length}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Payment Rate</span>
                  <span className="text-blue-600 font-medium">
                    {enrollmentRecords.length > 0
                      ? ((enrollmentRecords.filter(e => e.tuitionPaid).length / enrollmentRecords.length) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Details Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enrollment Details</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedEnrollment.studentName} - {selectedEnrollment.courseName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.studentEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Student ID:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.studentId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Course Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Course:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.courseName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Code:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.courseCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Instructor:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.instructorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Credits:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Section:</span>
                      <span className="text-gray-900 dark:text-white">{selectedEnrollment.section}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Enrollment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedEnrollment.status)}`}>
                        {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{selectedEnrollment.enrollmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Enrolled:</span>
                      <span className="text-gray-900 dark:text-white">
                        {format(new Date(selectedEnrollment.enrollmentDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Semester:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedEnrollment.semester} {selectedEnrollment.academicYear}
                      </span>
                    </div>
                    {selectedEnrollment.grade && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Grade:</span>
                        <span className="text-blue-600 font-bold">{selectedEnrollment.grade}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Schedule & Payment</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Schedule:</span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {selectedEnrollment.schedule.days.join(', ')}<br />
                        {selectedEnrollment.schedule.time}<br />
                        {selectedEnrollment.schedule.location}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tuition:</span>
                      <span className={selectedEnrollment.tuitionPaid ? 'text-green-600' : 'text-red-600'}>
                        {selectedEnrollment.tuitionPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedEnrollment.prerequisites.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnrollment.prerequisites.map((prereq, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedEnrollment(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedEnrollment.status === 'waitlisted' && (
                    <button
                      onClick={() => {
                        handleUpdateEnrollmentStatus(selectedEnrollment.id, 'enrolled');
                        setSelectedEnrollment(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Enroll Student
                    </button>
                  )}
                  {selectedEnrollment.status === 'enrolled' && (
                    <button
                      onClick={() => {
                        handleDropStudent(selectedEnrollment.id);
                        setSelectedEnrollment(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Drop Student
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
