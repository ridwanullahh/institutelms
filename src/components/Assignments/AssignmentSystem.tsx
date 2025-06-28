import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Brain,
  BarChart3,
  Star,
  MessageSquare,
  Paperclip,
  Send,
  Save,
  Settings,
  Copy,
  Share2
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Assignment, Submission } from '../../lib/types';
import { format, isAfter, isBefore } from 'date-fns';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AssignmentSystem: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    assignments, 
    submissions, 
    courses,
    loadAssignments, 
    loadSubmissions,
    createAssignment, 
    updateAssignment, 
    deleteAssignment,
    createSubmission,
    gradeSubmission,
    ai
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'assignments' | 'submissions' | 'grading'>('assignments');

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && isAfter(new Date(assignment.dueDate), new Date())) ||
      (filterStatus === 'overdue' && isBefore(new Date(assignment.dueDate), new Date())) ||
      (filterStatus === 'draft' && !assignment.published);
    
    const matchesCourse = filterCourse === 'all' || assignment.courseId === filterCourse;
    
    // Filter by instructor for instructor role
    const matchesInstructor = user?.role !== 'instructor' || 
      courses.find(c => c.id === assignment.courseId)?.instructorId === user.id;
    
    return matchesSearch && matchesStatus && matchesCourse && matchesInstructor;
  });

  const handleCreateAssignment = async (assignmentData: Partial<Assignment>) => {
    try {
      await createAssignment({
        ...assignmentData,
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      toast.success('Assignment created successfully');
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const handleGradeWithAI = async (submission: Submission) => {
    if (!ai) {
      toast.error('AI service not available');
      return;
    }

    try {
      const assignment = assignments.find(a => a.id === submission.assignmentId);
      if (!assignment) return;

      const grading = await ai.gradeAssignment(
        assignment.instructions,
        submission.content,
        assignment.rubric
      );

      await gradeSubmission(submission.id, {
        grade: grading.score,
        feedback: grading.feedback,
        rubricScores: grading.rubricScores,
        aiAnalysis: {
          qualityScore: grading.percentage,
          suggestions: grading.suggestions,
          strengths: grading.strengths,
          improvements: grading.improvements,
          estimatedGrade: grading.score
        }
      });

      toast.success('Assignment graded with AI assistance');
    } catch (error) {
      toast.error('Failed to grade with AI');
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    if (!assignment.published) return 'bg-gray-100 text-gray-800';
    if (isBefore(new Date(assignment.dueDate), new Date())) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (assignment: Assignment) => {
    if (!assignment.published) return 'Draft';
    if (isBefore(new Date(assignment.dueDate), new Date())) return 'Overdue';
    return 'Active';
  };

  const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const course = courses.find(c => c.id === assignment.courseId);
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
    const submissionCount = assignmentSubmissions.length;
    const gradedCount = assignmentSubmissions.filter(s => s.grade !== undefined).length;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {assignment.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment)}`}>
                {getStatusText(assignment)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {course?.title} • {course?.code}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {assignment.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{assignment.maxPoints}</div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{assignment.timeLimit ? `${assignment.timeLimit} min` : 'No limit'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{submissionCount} submissions</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>{gradedCount} graded</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedAssignment(assignment)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {user?.role === 'instructor' && (
              <>
                <button
                  onClick={() => {/* Handle edit */}}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Edit Assignment"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle analytics */}}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle delete */}}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {user?.role === 'student' ? (
              <button
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowSubmissionModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setViewMode('grading')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Grade ({gradedCount}/{submissionCount})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateAssignmentModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      instructions: '',
      courseId: '',
      type: 'essay',
      maxPoints: 100,
      passingScore: 60,
      dueDate: '',
      timeLimit: 0,
      attempts: 1,
      allowLateSubmission: true,
      lateSubmissionPenalty: 10,
      plagiarismCheck: true,
      aiGradingEnabled: true,
      submissionFormat: ['pdf', 'doc', 'docx']
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateAssignment({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        timeLimit: formData.timeLimit || undefined
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Assignment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course *
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Course</option>
                  {courses.filter(c => user?.role !== 'instructor' || c.instructorId === user.id).map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions *
              </label>
              <ReactQuill
                value={formData.instructions}
                onChange={(value) => setFormData({...formData, instructions: value})}
                className="bg-white dark:bg-gray-700"
                theme="snow"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="essay">Essay</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="coding">Coding</option>
                  <option value="project">Project</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowLateSubmission}
                    onChange={(e) => setFormData({...formData, allowLateSubmission: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow Late Submission</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.plagiarismCheck}
                    onChange={(e) => setFormData({...formData, plagiarismCheck: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable Plagiarism Check</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.aiGradingEnabled}
                    onChange={(e) => setFormData({...formData, aiGradingEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable AI Grading</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Late Penalty (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lateSubmissionPenalty}
                  onChange={(e) => setFormData({...formData, lateSubmissionPenalty: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SubmissionModal: React.FC = () => {
    const [submissionContent, setSubmissionContent] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAssignment || !user) return;

      try {
        await createSubmission({
          assignmentId: selectedAssignment.id,
          studentId: user.id!,
          studentName: `${user.firstName} ${user.lastName}`,
          content: submissionContent,
          attachments: [], // Handle file uploads
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          attempt: 1
        });

        setShowSubmissionModal(false);
        setSubmissionContent('');
        setAttachments([]);
        toast.success('Assignment submitted successfully');
      } catch (error) {
        toast.error('Failed to submit assignment');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Submit Assignment: {selectedAssignment?.title}
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedAssignment?.instructions || '' }}
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Submission *
              </label>
              <ReactQuill
                value={submissionContent}
                onChange={setSubmissionContent}
                className="bg-white dark:bg-gray-700"
                theme="snow"
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachments(Array.from(e.target.files));
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Assignment
              </button>
            </div>
          </form>
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
            {viewMode === 'assignments' ? 'Assignments' : 
             viewMode === 'submissions' ? 'Submissions' : 'Grading Center'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'assignments' ? 'Manage assignments and track submissions' :
             viewMode === 'submissions' ? 'View and manage student submissions' :
             'Grade assignments with AI assistance'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('assignments')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'assignments' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setViewMode('submissions')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'submissions' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Submissions
            </button>
            {user?.role === 'instructor' && (
              <button
                onClick={() => setViewMode('grading')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grading' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Grading
              </button>
            )}
          </div>
          
          {user?.role === 'instructor' && viewMode === 'assignments' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>
          
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
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}

      {filteredAssignments.length === 0 && viewMode === 'assignments' && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first assignment'}
          </p>
          {user?.role === 'instructor' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Assignment
            </button>
          )}
        </div>
      )}

      {showCreateModal && <CreateAssignmentModal />}
      {showSubmissionModal && <SubmissionModal />}
    </div>
  );
};

export default AssignmentSystem;