import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  TrendingUp,
  User,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  Printer,
  Share2,
  Verified,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Transcript {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  courses: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    grade: string;
    gpa: number;
  }>;
  gpa: number;
  cumulativeGPA: number;
  totalCredits: number;
  cumulativeCredits: number;
  academicStanding: string;
  honors: string[];
  degreeProgress: {
    totalRequired: number;
    completed: number;
    remaining: number;
    percentComplete: number;
  };
  isOfficial: boolean;
  issuedAt: string;
  issuedBy: string;
  verificationCode: string;
}

const TranscriptManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    transcripts, 
    courses,
    grades,
    users,
    loadTranscripts,
    createTranscript,
    updateTranscript
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTranscripts();
  }, []);

  const filteredTranscripts = transcripts.filter(transcript => {
    const student = users.find(u => u.id === transcript.studentId);
    const matchesSearch = student ? 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.academicInfo?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const matchesYear = filterYear === 'all' || transcript.academicYear === filterYear;
    
    // Filter by user role
    const matchesUser = user?.role === 'admin' || 
      (user?.role === 'student' && transcript.studentId === user.id);
    
    return matchesSearch && matchesYear && matchesUser;
  });

  const generateTranscript = async (studentId: string, academicYear: string, semester: string) => {
    setGenerating(true);
    try {
      // Get student grades for the period
      const studentGrades = grades.filter(g => 
        g.studentId === studentId && 
        g.courseId // Only include course grades
      );
      
      // Calculate GPA and credits
      let totalPoints = 0;
      let totalCredits = 0;
      const transcriptCourses = [];
      
      for (const grade of studentGrades) {
        const course = courses.find(c => c.id === grade.courseId);
        if (course) {
          const gradePoints = getGradePoints(grade.letterGrade);
          totalPoints += gradePoints * course.credits;
          totalCredits += course.credits;
          
          transcriptCourses.push({
            courseId: course.id,
            courseName: course.title,
            courseCode: course.code,
            credits: course.credits,
            grade: grade.letterGrade,
            gpa: gradePoints
          });
        }
      }
      
      const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      
      // Calculate cumulative stats
      const allStudentGrades = grades.filter(g => g.studentId === studentId);
      let cumulativePoints = 0;
      let cumulativeCredits = 0;
      
      for (const grade of allStudentGrades) {
        const course = courses.find(c => c.id === grade.courseId);
        if (course) {
          const gradePoints = getGradePoints(grade.letterGrade);
          cumulativePoints += gradePoints * course.credits;
          cumulativeCredits += course.credits;
        }
      }
      
      const cumulativeGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
      
      // Determine academic standing
      const academicStanding = getAcademicStanding(cumulativeGPA);
      
      // Calculate honors
      const honors = getHonors(gpa, cumulativeGPA);
      
      // Calculate degree progress
      const degreeProgress = {
        totalRequired: 120, // Standard bachelor's degree
        completed: cumulativeCredits,
        remaining: Math.max(0, 120 - cumulativeCredits),
        percentComplete: Math.min(100, (cumulativeCredits / 120) * 100)
      };
      
      const transcriptData: Partial<Transcript> = {
        studentId,
        academicYear,
        semester,
        courses: transcriptCourses,
        gpa,
        cumulativeGPA,
        totalCredits,
        cumulativeCredits,
        academicStanding,
        honors,
        degreeProgress,
        isOfficial: true,
        issuedBy: user?.id!,
        verificationCode: crypto.randomUUID()
      };
      
      await createTranscript(transcriptData);
      toast.success('Transcript generated successfully');
    } catch (error) {
      toast.error('Failed to generate transcript');
    } finally {
      setGenerating(false);
    }
  };

  const getGradePoints = (letterGrade: string): number => {
    const gradeMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gradeMap[letterGrade] || 0.0;
  };

  const getAcademicStanding = (gpa: number): string => {
    if (gpa >= 3.5) return 'Dean\'s List';
    if (gpa >= 3.0) return 'Good Standing';
    if (gpa >= 2.0) return 'Academic Warning';
    return 'Academic Probation';
  };

  const getHonors = (semesterGPA: number, cumulativeGPA: number): string[] => {
    const honors = [];
    if (semesterGPA >= 3.8) honors.push('Semester Honors');
    if (cumulativeGPA >= 3.9) honors.push('Summa Cum Laude');
    else if (cumulativeGPA >= 3.7) honors.push('Magna Cum Laude');
    else if (cumulativeGPA >= 3.5) honors.push('Cum Laude');
    return honors;
  };

  const TranscriptPreview: React.FC<{ transcript: Transcript }> = ({ transcript }) => {
    const student = users.find(u => u.id === transcript.studentId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Official Header */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-900" />
              </div>
              <h1 className="text-3xl font-bold mb-2">EduAI University</h1>
              <p className="text-blue-100">Official Academic Transcript</p>
            </div>
          </div>
          
          {/* Student Information */}
          <div className="p-8 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {student?.firstName} {student?.lastName}</p>
                  <p><strong>Student ID:</strong> {student?.academicInfo?.studentId}</p>
                  <p><strong>Program:</strong> {student?.academicInfo?.program}</p>
                  <p><strong>Department:</strong> {student?.academicInfo?.department}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Summary</h2>
                <div className="space-y-2">
                  <p><strong>Academic Year:</strong> {transcript.academicYear}</p>
                  <p><strong>Semester:</strong> {transcript.semester}</p>
                  <p><strong>Cumulative GPA:</strong> {transcript.cumulativeGPA.toFixed(2)}</p>
                  <p><strong>Total Credits:</strong> {transcript.cumulativeCredits}</p>
                  <p><strong>Academic Standing:</strong> {transcript.academicStanding}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Records */}
          <div className="p-8 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Course Code</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Course Title</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Credits</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Grade Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transcript.courses.map((course, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{course.courseCode}</td>
                      <td className="border border-gray-300 px-4 py-2">{course.courseName}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{course.credits}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{course.grade}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{course.gpa.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>Semester Totals</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{transcript.totalCredits}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">GPA: {transcript.gpa.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Honors and Recognition */}
          {transcript.honors.length > 0 && (
            <div className="p-8 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Honors and Recognition</h2>
              <div className="flex flex-wrap gap-2">
                {transcript.honors.map((honor, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {honor}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Degree Progress */}
          <div className="p-8 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Degree Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{transcript.degreeProgress.completed}</div>
                <div className="text-sm text-gray-600">Credits Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{transcript.degreeProgress.remaining}</div>
                <div className="text-sm text-gray-600">Credits Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{transcript.degreeProgress.percentComplete.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{transcript.cumulativeGPA.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Cumulative GPA</div>
              </div>
            </div>
          </div>
          
          {/* Official Certification */}
          <div className="p-8 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This is an official transcript issued by EduAI University</p>
                <p className="text-sm text-gray-600">Issued on: {format(new Date(transcript.issuedAt), 'MMMM d, yyyy')}</p>
                <p className="text-sm text-gray-600">Verification Code: {transcript.verificationCode}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Verified className="w-6 h-6 text-green-500" />
                <span className="text-sm font-medium text-green-600">Verified Official Document</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transcript Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and manage official academic transcripts
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => {/* Handle generate transcript */}}
            disabled={generating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate Transcript'}</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transcripts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{transcripts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Official Transcripts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transcripts.filter(t => t.isOfficial).length}
              </p>
            </div>
            <Verified className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transcripts.length > 0 
                  ? (transcripts.reduce((sum, t) => sum + t.cumulativeGPA, 0) / transcripts.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Honor Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transcripts.filter(t => t.honors.length > 0).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
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
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>

      {/* Transcripts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Standing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredTranscripts.map((transcript) => {
                const student = users.find(u => u.id === transcript.studentId);
                
                return (
                  <tr key={transcript.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-semibold">
                            {student?.firstName?.[0]}{student?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student?.firstName} {student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student?.academicInfo?.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {transcript.academicYear} - {transcript.semester}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transcript.cumulativeGPA.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Semester: {transcript.gpa.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {transcript.cumulativeCredits}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transcript.academicStanding === 'Dean\'s List' ? 'bg-green-100 text-green-800' :
                        transcript.academicStanding === 'Good Standing' ? 'bg-blue-100 text-blue-800' :
                        transcript.academicStanding === 'Academic Warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transcript.academicStanding}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {transcript.isOfficial ? (
                          <>
                            <Verified className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Official</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Unofficial</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTranscript(transcript);
                            setShowPreview(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Transcript"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTranscripts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transcripts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Transcripts will appear here once generated'}
          </p>
        </div>
      )}

      {showPreview && selectedTranscript && (
        <TranscriptPreview transcript={selectedTranscript} />
      )}
    </div>
  );
};

export default TranscriptManagement;