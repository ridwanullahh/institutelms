import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BookOpen, 
  Brain, 
  Wand2, 
  FileText, 
  Video, 
  Image, 
  Mic, 
  Download,
  Upload,
  Save,
  Eye,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Settings,
  Target,
  Clock,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Course, Lesson } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CourseOutline {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  modules: CourseModule[];
  assessments: AssessmentPlan[];
  prerequisites: string[];
  targetAudience: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessons: LessonPlan[];
  quiz?: QuizPlan;
  assignment?: AssignmentPlan;
}

interface LessonPlan {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  duration: number;
  content: string;
  resources: string[];
  objectives: string[];
}

interface AssessmentPlan {
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  title: string;
  description: string;
  weight: number;
  duration?: number;
}

interface QuizPlan {
  title: string;
  questions: number;
  timeLimit: number;
  passingScore: number;
}

interface AssignmentPlan {
  title: string;
  description: string;
  type: 'essay' | 'project' | 'presentation' | 'code';
  maxPoints: number;
  dueDate: string;
}

const AICourseBuilder: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    courses, 
    createCourse, 
    ai,
    loadCourses 
  } = usePlatformStore();

  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'customize' | 'publish'>('input');
  const [courseInput, setCourseInput] = useState({
    topic: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 4, // weeks
    format: 'mixed' as 'video' | 'text' | 'interactive' | 'mixed',
    audience: '',
    objectives: '',
    includeAssessments: true,
    includeQuizzes: true,
    includeProjects: true
  });
  
  const [generatedOutline, setGeneratedOutline] = useState<CourseOutline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const handleGenerateCourse = async () => {
    if (!ai) {
      toast.error('AI service not available');
      return;
    }

    if (!courseInput.topic.trim()) {
      toast.error('Please enter a course topic');
      return;
    }

    setIsGenerating(true);
    setStep('generating');

    try {
      const prompt = `
        Create a comprehensive course outline for: "${courseInput.topic}"
        
        Requirements:
        - Level: ${courseInput.level}
        - Duration: ${courseInput.duration} weeks
        - Format: ${courseInput.format}
        - Target Audience: ${courseInput.audience || 'General learners'}
        - Learning Objectives: ${courseInput.objectives || 'To be determined'}
        - Include Assessments: ${courseInput.includeAssessments}
        - Include Quizzes: ${courseInput.includeQuizzes}
        - Include Projects: ${courseInput.includeProjects}
        
        Generate a detailed course structure with:
        1. Course title and description
        2. Learning objectives (5-7 specific objectives)
        3. Module breakdown (4-8 modules)
        4. Lesson plans for each module
        5. Assessment strategy
        6. Prerequisites
        7. Target audience description
        
        Format as JSON with proper structure.
      `;

      const response = await ai.generateContent(prompt, 'Course creation assistant');
      
      // Parse the AI response and create course outline
      const outline = parseAIResponse(response);
      setGeneratedOutline(outline);
      setStep('review');
      toast.success('Course outline generated successfully!');
      
    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Failed to generate course outline');
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAIResponse = (response: string): CourseOutline => {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      // Fallback: create a structured outline from text response
      return {
        title: `${courseInput.topic} - Complete Course`,
        description: `A comprehensive ${courseInput.level} level course on ${courseInput.topic}`,
        duration: courseInput.duration,
        difficulty: courseInput.level,
        learningObjectives: [
          `Understand the fundamentals of ${courseInput.topic}`,
          `Apply key concepts in practical scenarios`,
          `Analyze complex problems and solutions`,
          `Create original work using learned principles`,
          `Evaluate different approaches and methodologies`
        ],
        modules: generateDefaultModules(),
        assessments: generateDefaultAssessments(),
        prerequisites: [],
        targetAudience: courseInput.audience || 'Students interested in learning about this topic'
      };
    }
  };

  const generateDefaultModules = (): CourseModule[] => {
    const moduleCount = Math.max(4, Math.min(8, courseInput.duration));
    return Array.from({ length: moduleCount }, (_, index) => ({
      id: `module-${index + 1}`,
      title: `Module ${index + 1}: Introduction to Core Concepts`,
      description: `This module covers the essential concepts and principles.`,
      duration: Math.ceil(courseInput.duration / moduleCount),
      lessons: [
        {
          id: `lesson-${index + 1}-1`,
          title: `Lesson 1: Overview and Introduction`,
          description: 'Introduction to the key concepts',
          type: 'video' as const,
          duration: 30,
          content: 'Detailed lesson content will be generated here',
          resources: [],
          objectives: ['Understand basic concepts', 'Identify key principles']
        },
        {
          id: `lesson-${index + 1}-2`,
          title: `Lesson 2: Practical Application`,
          description: 'Hands-on practice and examples',
          type: 'interactive' as const,
          duration: 45,
          content: 'Interactive exercises and examples',
          resources: [],
          objectives: ['Apply learned concepts', 'Practice problem-solving']
        }
      ],
      quiz: courseInput.includeQuizzes ? {
        title: `Module ${index + 1} Quiz`,
        questions: 10,
        timeLimit: 20,
        passingScore: 70
      } : undefined,
      assignment: courseInput.includeAssessments ? {
        title: `Module ${index + 1} Assignment`,
        description: 'Apply the concepts learned in this module',
        type: 'essay',
        maxPoints: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } : undefined
    }));
  };

  const generateDefaultAssessments = (): AssessmentPlan[] => {
    const assessments: AssessmentPlan[] = [];
    
    if (courseInput.includeQuizzes) {
      assessments.push({
        type: 'quiz',
        title: 'Module Quizzes',
        description: 'Regular quizzes to test understanding',
        weight: 30
      });
    }
    
    if (courseInput.includeAssessments) {
      assessments.push({
        type: 'assignment',
        title: 'Module Assignments',
        description: 'Practical assignments to apply knowledge',
        weight: 40
      });
    }
    
    if (courseInput.includeProjects) {
      assessments.push({
        type: 'project',
        title: 'Final Project',
        description: 'Comprehensive project demonstrating mastery',
        weight: 30
      });
    }
    
    return assessments;
  };

  const handlePublishCourse = async () => {
    if (!generatedOutline) return;

    try {
      const courseData: Partial<Course> = {
        title: generatedOutline.title,
        description: generatedOutline.description,
        code: generateCourseCode(generatedOutline.title),
        instructorId: user?.id!,
        instructorName: `${user?.firstName} ${user?.lastName}`,
        category: 'AI Generated',
        department: 'General',
        level: generatedOutline.difficulty === 'beginner' ? 'undergraduate' : 
               generatedOutline.difficulty === 'intermediate' ? 'graduate' : 'doctoral',
        credits: Math.ceil(generatedOutline.duration / 2),
        duration: generatedOutline.duration,
        maxStudents: 50,
        prerequisites: generatedOutline.prerequisites,
        learningObjectives: generatedOutline.learningObjectives,
        difficulty: generatedOutline.difficulty,
        language: 'en',
        status: 'draft'
      };

      await createCourse(courseData);
      toast.success('Course created successfully!');
      setStep('input');
      setCourseInput({
        topic: '',
        level: 'beginner',
        duration: 4,
        format: 'mixed',
        audience: '',
        objectives: '',
        includeAssessments: true,
        includeQuizzes: true,
        includeProjects: true
      });
      setGeneratedOutline(null);
      
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const generateCourseCode = (title: string): string => {
    const words = title.split(' ').filter(word => word.length > 2);
    const code = words.slice(0, 2).map(word => word.substring(0, 3).toUpperCase()).join('');
    const number = Math.floor(Math.random() * 900) + 100;
    return `${code}${number}`;
  };

  const renderInputStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Course Builder</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Let AI help you create a comprehensive course outline in minutes
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Topic *
            </label>
            <input
              type="text"
              value={courseInput.topic}
              onChange={(e) => setCourseInput(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., Introduction to Machine Learning, Web Development Fundamentals"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={courseInput.level}
                onChange={(e) => setCourseInput(prev => ({ ...prev, level: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={courseInput.duration}
                onChange={(e) => setCourseInput(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Format
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'video', label: 'Video-based', icon: Video },
                { value: 'text', label: 'Text-based', icon: FileText },
                { value: 'interactive', label: 'Interactive', icon: Brain },
                { value: 'mixed', label: 'Mixed Format', icon: BookOpen }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setCourseInput(prev => ({ ...prev, format: value as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    courseInput.format === value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={courseInput.audience}
              onChange={(e) => setCourseInput(prev => ({ ...prev, audience: e.target.value }))}
              placeholder="e.g., Software developers, Marketing professionals, Students"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Learning Objectives (Optional)
            </label>
            <textarea
              value={courseInput.objectives}
              onChange={(e) => setCourseInput(prev => ({ ...prev, objectives: e.target.value }))}
              placeholder="What should students be able to do after completing this course?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Include Assessments
            </label>
            <div className="space-y-3">
              {[
                { key: 'includeQuizzes', label: 'Module Quizzes', description: 'Regular quizzes to test understanding' },
                { key: 'includeAssessments', label: 'Assignments', description: 'Practical assignments and exercises' },
                { key: 'includeProjects', label: 'Final Project', description: 'Comprehensive capstone project' }
              ].map(({ key, label, description }) => (
                <label key={key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseInput[key as keyof typeof courseInput] as boolean}
                    onChange={(e) => setCourseInput(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleGenerateCourse}
              disabled={!courseInput.topic.trim() || !ai}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Wand2 className="w-5 h-5" />
              <span>Generate Course with AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Course Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create comprehensive courses with AI assistance
          </p>
        </div>
        
        {step !== 'input' && (
          <button
            onClick={() => {
              setStep('input');
              setGeneratedOutline(null);
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { id: 'input', label: 'Input', icon: Settings },
          { id: 'generating', label: 'Generating', icon: Brain },
          { id: 'review', label: 'Review', icon: Eye },
          { id: 'publish', label: 'Publish', icon: CheckCircle }
        ].map(({ id, label, icon: Icon }, index) => (
          <div key={id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === id ? 'bg-purple-600 text-white' :
              ['generating', 'review', 'publish'].includes(step) && index < ['input', 'generating', 'review', 'publish'].indexOf(step)
                ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {index < 3 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-4" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderInputStep()}
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generating Your Course...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              AI is creating a comprehensive course outline based on your requirements
            </p>
            <div className="max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </motion.div>
        )}

        {step === 'review' && generatedOutline && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Course Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {generatedOutline.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {generatedOutline.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{previewMode ? 'Edit' : 'Preview'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">Duration</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{generatedOutline.duration}</span>
                    <span className="text-blue-600 ml-1">weeks</span>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-300">Level</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 capitalize">{generatedOutline.difficulty}</span>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-300">Modules</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{generatedOutline.modules.length}</span>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900 dark:text-orange-300">Assessments</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{generatedOutline.assessments.length}</span>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Learning Objectives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedOutline.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Target Audience</h3>
                  <p className="text-gray-700 dark:text-gray-300">{generatedOutline.targetAudience}</p>
                </div>

                {/* Prerequisites */}
                {generatedOutline.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedOutline.prerequisites.map((prereq, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Modules */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Course Modules</h3>
                <div className="space-y-4">
                  {generatedOutline.modules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{module.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{module.duration} week{module.duration > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{module.description}</p>

                      {/* Lessons */}
                      <div className="space-y-2 mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white">Lessons:</h5>
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center space-x-3 text-sm">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {lessonIndex + 1}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{lesson.title}</span>
                            <span className="text-gray-500">({lesson.duration} min)</span>
                          </div>
                        ))}
                      </div>

                      {/* Assessments */}
                      <div className="flex flex-wrap gap-2">
                        {module.quiz && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs">
                            Quiz: {module.quiz.questions} questions
                          </span>
                        )}
                        {module.assignment && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs">
                            Assignment: {module.assignment.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Strategy */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Assessment Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedOutline.assessments.map((assessment, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{assessment.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{assessment.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{assessment.type}</span>
                        <span className="text-lg font-bold text-blue-600">{assessment.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setStep('input')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handlePublishCourse}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Create Course</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICourseBuilder;
