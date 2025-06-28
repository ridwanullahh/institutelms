import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Shuffle,
  Settings,
  Copy,
  Share2,
  Download,
  Upload,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Quiz, QuizQuestion, QuizAttempt } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const QuizBuilder: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    quizzes, 
    quizAttempts, 
    courses,
    loadQuizzes, 
    loadQuizAttempts,
    createQuiz, 
    updateQuiz, 
    deleteQuiz,
    ai
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [viewMode, setViewMode] = useState<'quizzes' | 'attempts' | 'analytics'>('quizzes');

  useEffect(() => {
    loadQuizzes();
    loadQuizAttempts();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && quiz.published) ||
      (filterStatus === 'draft' && !quiz.published);
    
    const matchesCourse = filterCourse === 'all' || quiz.courseId === filterCourse;
    
    // Filter by instructor for instructor role
    const matchesInstructor = user?.role !== 'instructor' || 
      courses.find(c => c.id === quiz.courseId)?.instructorId === user.id;
    
    return matchesSearch && matchesStatus && matchesCourse && matchesInstructor;
  });

  const handleCreateQuiz = async (quizData: Partial<Quiz>) => {
    try {
      await createQuiz({
        ...quizData,
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      toast.success('Quiz created successfully');
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  const handleGenerateQuizWithAI = async (topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number) => {
    if (!ai) {
      toast.error('AI service not available');
      return;
    }

    try {
      const generatedQuiz = await ai.createQuiz(topic, difficulty, questionCount);
      
      const quizData: Partial<Quiz> = {
        title: `AI Generated Quiz: ${topic}`,
        description: `Auto-generated quiz about ${topic} with ${questionCount} questions`,
        instructions: `This quiz contains ${questionCount} questions about ${topic}. Please read each question carefully and select the best answer.`,
        questions: generatedQuiz.questions,
        timeLimit: questionCount * 2, // 2 minutes per question
        attempts: 3,
        passingScore: 70,
        randomizeQuestions: true,
        showCorrectAnswers: true,
        showScoreImmediately: true,
        courseId: filterCourse !== 'all' ? filterCourse : courses[0]?.id || ''
      };

      await handleCreateQuiz(quizData);
      toast.success('AI-generated quiz created successfully');
    } catch (error) {
      toast.error('Failed to generate quiz with AI');
    }
  };

  const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const course = courses.find(c => c.id === quiz.courseId);
    const attempts = quizAttempts.filter(a => a.quizId === quiz.id);
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const averageScore = completedAttempts.length > 0 
      ? completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length 
      : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {quiz.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                quiz.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {quiz.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {course?.title} • {course?.code}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {quiz.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{quiz.questions.length}</div>
            <div className="text-xs text-gray-500">questions</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{quiz.timeLimit} min</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>{quiz.passingScore}% to pass</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{attempts.length} attempts</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span>{averageScore.toFixed(1)}% avg</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedQuiz(quiz)}
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
                  title="Edit Quiz"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle copy */}}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplicate Quiz"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle delete */}}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {user?.role === 'student' ? (
              <button
                onClick={() => {/* Handle take quiz */}}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Take Quiz
              </button>
            ) : (
              <button
                onClick={() => setViewMode('analytics')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateQuizModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      instructions: '',
      courseId: '',
      timeLimit: 60,
      attempts: 3,
      passingScore: 70,
      randomizeQuestions: false,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      availableFrom: '',
      availableUntil: ''
    });

    const [aiGeneration, setAiGeneration] = useState({
      topic: '',
      difficulty: 'medium' as 'easy' | 'medium' | 'hard',
      questionCount: 10
    });

    const [showAITab, setShowAITab] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const quizData: Partial<Quiz> = {
        ...formData,
        questions: [],
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : undefined,
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : undefined
      };
      handleCreateQuiz(quizData);
    };

    const handleAIGeneration = (e: React.FormEvent) => {
      e.preventDefault();
      handleGenerateQuizWithAI(aiGeneration.topic, aiGeneration.difficulty, aiGeneration.questionCount);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Quiz</h2>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setShowAITab(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showAITab 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setShowAITab(true)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showAITab 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Brain className="w-4 h-4 mr-1 inline" />
                AI Generated
              </button>
            </div>
          </div>
          
          {showAITab ? (
            <form onSubmit={handleAIGeneration} className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Quiz Generation</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Let AI create a comprehensive quiz for you. Just specify the topic and preferences.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={aiGeneration.topic}
                      onChange={(e) => setAiGeneration({...aiGeneration, topic: e.target.value})}
                      placeholder="e.g., Machine Learning Basics"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={aiGeneration.difficulty}
                      onChange={(e) => setAiGeneration({...aiGeneration, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Questions
                    </label>
                    <select
                      value={aiGeneration.questionCount}
                      onChange={(e) => setAiGeneration({...aiGeneration, questionCount: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course *
                  </label>
                  <select
                    required
                    value={filterCourse !== 'all' ? filterCourse : ''}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
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
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Title *
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
                  Instructions
                </label>
                <textarea
                  rows={4}
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.attempts}
                    onChange={(e) => setFormData({...formData, attempts: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.randomizeQuestions}
                      onChange={(e) => setFormData({...formData, randomizeQuestions: e.target.checked})}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Randomize Questions</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showCorrectAnswers}
                      onChange={(e) => setFormData({...formData, showCorrectAnswers: e.target.checked})}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Correct Answers</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showScoreImmediately}
                      onChange={(e) => setFormData({...formData, showScoreImmediately: e.target.checked})}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Score Immediately</span>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available From
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.availableFrom}
                      onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Until
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.availableUntil}
                      onChange={(e) => setFormData({...formData, availableUntil: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
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
                  Create Quiz
                </button>
              </div>
            </form>
          )}
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
            {viewMode === 'quizzes' ? 'Quiz Builder' : 
             viewMode === 'attempts' ? 'Quiz Attempts' : 'Quiz Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'quizzes' ? 'Create and manage quizzes with AI assistance' :
             viewMode === 'attempts' ? 'Monitor student quiz attempts and progress' :
             'Analyze quiz performance and student insights'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('quizzes')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'quizzes' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setViewMode('attempts')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'attempts' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Attempts
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
          
          {user?.role === 'instructor' && viewMode === 'quizzes' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quiz</span>
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
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
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
      {viewMode === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      {filteredQuizzes.length === 0 && viewMode === 'quizzes' && (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first quiz'}
          </p>
          {user?.role === 'instructor' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Quiz
            </button>
          )}
        </div>
      )}

      {showCreateModal && <CreateQuizModal />}
    </div>
  );
};

export default QuizBuilder;