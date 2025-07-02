import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  Target,
  BarChart3,
  Award,
  MapPin,
  Route,
  Edit,
  Save,
  X
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { format, addMonths } from 'date-fns';
import toast from 'react-hot-toast';

interface DegreePlan {
  id: string;
  studentId: string;
  degreeType: string;
  major: string;
  minor?: string;
  concentration?: string;
  requiredCourses: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    category: string;
    prerequisite?: string[];
    semester?: string;
    year?: number;
    status: 'completed' | 'enrolled' | 'planned' | 'available';
  }>;
  electiveCourses: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    category: string;
    semester?: string;
    year?: number;
    status: 'completed' | 'enrolled' | 'planned' | 'available';
  }>;
  completedCourses: string[];
  plannedCourses: Array<{
    courseId: string;
    semester: string;
    year: number;
  }>;
  totalCreditsRequired: number;
  creditsCompleted: number;
  expectedGraduation: string;
  advisorId: string;
  status: string;
  lastUpdated: string;
}

const DegreePlanning: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    degreePlans, 
    courses, 
    users,
    enrollments,
    loadDegreePlans,
    createDegreePlan,
    updateDegreePlan
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMajor, setFilterMajor] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<DegreePlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);

  useEffect(() => {
    loadDegreePlans();
  }, []);

  const filteredPlans = degreePlans.filter(plan => {
    const student = users.find(u => u.id === plan.studentId);
    const matchesSearch = student ? 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.academicInfo?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const matchesMajor = filterMajor === 'all' || plan.major === filterMajor;
    
    // Filter by user role
    const matchesUser = user?.role === 'admin' || 
      (user?.role === 'student' && plan.studentId === user.id) ||
      (user?.role === 'instructor' && plan.advisorId === user.id);
    
    return matchesSearch && matchesMajor && matchesUser;
  });

  const createNewDegreePlan = async (planData: Partial<DegreePlan>) => {
    try {
      // Get degree requirements based on major
      const degreeRequirements = getDegreeRequirements(planData.major!, planData.degreeType!);
      
      const newPlan: Partial<DegreePlan> = {
        ...planData,
        requiredCourses: degreeRequirements.required,
        electiveCourses: degreeRequirements.electives,
        totalCreditsRequired: degreeRequirements.totalCredits,
        creditsCompleted: 0,
        completedCourses: [],
        plannedCourses: [],
        status: 'active',
        expectedGraduation: addMonths(new Date(), 48).toISOString() // 4 years default
      };
      
      await createDegreePlan(newPlan);
      setShowCreateModal(false);
      toast.success('Degree plan created successfully');
    } catch (error) {
      toast.error('Failed to create degree plan');
    }
  };

  const getDegreeRequirements = (major: string, degreeType: string) => {
    // This would typically come from a database or configuration
    const requirements = {
      'Computer Science': {
        required: [
          { courseId: 'cs101', courseName: 'Introduction to Programming', courseCode: 'CS 101', credits: 3, category: 'Core', status: 'available' },
          { courseId: 'cs102', courseName: 'Data Structures', courseCode: 'CS 102', credits: 3, category: 'Core', prerequisite: ['cs101'], status: 'available' },
          { courseId: 'cs201', courseName: 'Algorithms', courseCode: 'CS 201', credits: 3, category: 'Core', prerequisite: ['cs102'], status: 'available' },
          { courseId: 'cs301', courseName: 'Database Systems', courseCode: 'CS 301', credits: 3, category: 'Core', prerequisite: ['cs102'], status: 'available' },
          { courseId: 'math101', courseName: 'Calculus I', courseCode: 'MATH 101', credits: 4, category: 'Mathematics', status: 'available' },
          { courseId: 'math102', courseName: 'Calculus II', courseCode: 'MATH 102', credits: 4, category: 'Mathematics', prerequisite: ['math101'], status: 'available' },
          { courseId: 'eng101', courseName: 'English Composition', courseCode: 'ENG 101', credits: 3, category: 'General Education', status: 'available' },
          { courseId: 'phys101', courseName: 'Physics I', courseCode: 'PHYS 101', credits: 4, category: 'Science', status: 'available' }
        ],
        electives: [
          { courseId: 'cs401', courseName: 'Machine Learning', courseCode: 'CS 401', credits: 3, category: 'Technical Elective', status: 'available' },
          { courseId: 'cs402', courseName: 'Web Development', courseCode: 'CS 402', credits: 3, category: 'Technical Elective', status: 'available' },
          { courseId: 'cs403', courseName: 'Mobile Development', courseCode: 'CS 403', credits: 3, category: 'Technical Elective', status: 'available' }
        ],
        totalCredits: 120
      }
    };
    
    return requirements[major as keyof typeof requirements] || { required: [], electives: [], totalCredits: 120 };
  };

  const calculateProgress = (plan: DegreePlan) => {
    const completedCredits = plan.creditsCompleted;
    const totalCredits = plan.totalCreditsRequired;
    const progressPercentage = (completedCredits / totalCredits) * 100;
    
    return {
      completedCredits,
      totalCredits,
      remainingCredits: totalCredits - completedCredits,
      progressPercentage: Math.min(100, progressPercentage)
    };
  };

  const PlanCard: React.FC<{ plan: DegreePlan }> = ({ plan }) => {
    const student = users.find(u => u.id === plan.studentId);
    const advisor = users.find(u => u.id === plan.advisorId);
    const progress = calculateProgress(plan);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {student?.firstName} {student?.lastName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'active' ? 'bg-green-100 text-green-800' :
                plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {student?.academicInfo?.studentId} • {plan.degreeType}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {plan.major} {plan.minor && `• Minor: ${plan.minor}`}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{progress.progressPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress.completedCredits}/{progress.totalCredits} credits</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Expected: {format(new Date(plan.expectedGraduation), 'MMM yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Advisor: {advisor?.firstName} {advisor?.lastName}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{plan.requiredCourses.length + plan.electiveCourses.length} courses</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Updated: {format(new Date(plan.lastUpdated), 'MMM d')}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPlan(plan)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Plan"
            >
              <Route className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Handle analytics */}}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedPlan(plan);
                setEditingPlan(true);
              }}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit Plan"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {progress.remainingCredits} credits remaining
          </div>
        </div>
      </div>
    );
  };

  const CreatePlanModal: React.FC = () => {
    const [formData, setFormData] = useState({
      studentId: '',
      degreeType: 'Bachelor',
      major: '',
      minor: '',
      concentration: '',
      advisorId: user?.id || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createNewDegreePlan(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Degree Plan</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Student</option>
                  {users.filter(u => u.role === 'student').map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.academicInfo?.studentId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Degree Type *
                </label>
                <select
                  value={formData.degreeType}
                  onChange={(e) => setFormData({...formData, degreeType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="Doctoral">Doctoral Degree</option>
                  <option value="Certificate">Certificate Program</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major *
              </label>
              <select
                required
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Engineering">Engineering</option>
                <option value="Psychology">Psychology</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minor (Optional)
                </label>
                <input
                  type="text"
                  value={formData.minor}
                  onChange={(e) => setFormData({...formData, minor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Concentration (Optional)
                </label>
                <input
                  type="text"
                  value={formData.concentration}
                  onChange={(e) => setFormData({...formData, concentration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Academic Advisor *
              </label>
              <select
                required
                value={formData.advisorId}
                onChange={(e) => setFormData({...formData, advisorId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Advisor</option>
                {users.filter(u => u.role === 'instructor' || u.role === 'admin').map(advisor => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.firstName} {advisor.lastName}
                  </option>
                ))}
              </select>
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
                Create Plan
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Degree Planning</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and track academic pathways to graduation
          </p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{degreePlans.length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {degreePlans.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {degreePlans.length > 0 
                  ? (degreePlans.reduce((sum, p) => sum + calculateProgress(p).progressPercentage, 0) / degreePlans.length).toFixed(1)
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Near Graduation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {degreePlans.filter(p => calculateProgress(p).progressPercentage >= 90).length}
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
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Majors</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Engineering">Engineering</option>
            <option value="Psychology">Psychology</option>
            <option value="Biology">Biology</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      {/* Degree Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No degree plans found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create degree plans to help students plan their academic journey'}
          </p>
          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Degree Plan
            </button>
          )}
        </div>
      )}

      {showCreateModal && <CreatePlanModal />}
    </div>
  );
};

export default DegreePlanning;