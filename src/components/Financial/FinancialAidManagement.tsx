import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
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
  Users, 
  Award, 
  Calendar, 
  FileText, 
  CreditCard, 
  PieChart, 
  BarChart3,
  Target,
  Percent,
  Calculator,
  BookOpen,
  GraduationCap,
  Heart,
  Star
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { FinancialAid, User } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialAidApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  aidType: 'scholarship' | 'grant' | 'loan' | 'work-study';
  programName: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  applicationDate: string;
  reviewDate?: string;
  disbursementDate?: string;
  academicYear: string;
  semester: string;
  gpa: number;
  financialNeed: number;
  documents: string[];
  reviewNotes?: string;
  eligibilityCriteria: {
    minGPA: number;
    maxIncome: number;
    academicLevel: string;
    residencyRequired: boolean;
    majorRestrictions?: string[];
  };
}

const FinancialAidManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    financialAid, 
    users,
    loadFinancialAid,
    createFinancialAid,
    updateFinancialAid,
    deleteFinancialAid
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<FinancialAidApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'applications' | 'programs' | 'analytics'>('applications');

  // Mock data for demonstration
  const [applications, setApplications] = useState<FinancialAidApplication[]>([
    {
      id: '1',
      studentId: 'student1',
      studentName: 'Alice Johnson',
      studentEmail: 'alice@example.com',
      aidType: 'scholarship',
      programName: 'Academic Excellence Scholarship',
      requestedAmount: 5000,
      approvedAmount: 4500,
      status: 'approved',
      applicationDate: '2024-01-15',
      reviewDate: '2024-01-25',
      academicYear: '2024-2025',
      semester: 'Fall',
      gpa: 3.8,
      financialNeed: 15000,
      documents: ['transcript.pdf', 'financial_statement.pdf', 'essay.pdf'],
      reviewNotes: 'Excellent academic performance and demonstrated need.',
      eligibilityCriteria: {
        minGPA: 3.5,
        maxIncome: 50000,
        academicLevel: 'undergraduate',
        residencyRequired: true
      }
    },
    {
      id: '2',
      studentId: 'student2',
      studentName: 'Bob Smith',
      studentEmail: 'bob@example.com',
      aidType: 'grant',
      programName: 'Need-Based Grant',
      requestedAmount: 3000,
      status: 'pending',
      applicationDate: '2024-02-01',
      academicYear: '2024-2025',
      semester: 'Fall',
      gpa: 3.2,
      financialNeed: 20000,
      documents: ['transcript.pdf', 'fafsa.pdf'],
      eligibilityCriteria: {
        minGPA: 2.5,
        maxIncome: 40000,
        academicLevel: 'undergraduate',
        residencyRequired: false
      }
    }
  ]);

  const [aidPrograms] = useState([
    {
      id: '1',
      name: 'Academic Excellence Scholarship',
      type: 'scholarship',
      totalBudget: 100000,
      allocated: 45000,
      recipients: 10,
      maxAmount: 5000,
      criteria: { minGPA: 3.5, maxIncome: 50000 }
    },
    {
      id: '2',
      name: 'Need-Based Grant',
      type: 'grant',
      totalBudget: 200000,
      allocated: 120000,
      recipients: 40,
      maxAmount: 3000,
      criteria: { minGPA: 2.5, maxIncome: 40000 }
    },
    {
      id: '3',
      name: 'Work-Study Program',
      type: 'work-study',
      totalBudget: 150000,
      allocated: 80000,
      recipients: 25,
      maxAmount: 4000,
      criteria: { minGPA: 2.0, maxIncome: 60000 }
    }
  ]);

  useEffect(() => {
    loadFinancialAid();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesType = filterType === 'all' || app.aidType === filterType;
    const matchesYear = filterYear === 'all' || app.academicYear === filterYear;
    
    return matchesSearch && matchesStatus && matchesType && matchesYear;
  });

  const handleReviewApplication = async (applicationId: string, decision: 'approved' | 'rejected', amount?: number, notes?: string) => {
    try {
      const updatedApplications = applications.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: decision,
              approvedAmount: decision === 'approved' ? amount : undefined,
              reviewDate: new Date().toISOString(),
              reviewNotes: notes
            }
          : app
      );
      setApplications(updatedApplications);
      toast.success(`Application ${decision} successfully`);
      setShowReviewModal(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  const handleDisburseAid = async (applicationId: string) => {
    try {
      const updatedApplications = applications.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'disbursed' as const,
              disbursementDate: new Date().toISOString()
            }
          : app
      );
      setApplications(updatedApplications);
      toast.success('Aid disbursed successfully');
    } catch (error) {
      toast.error('Failed to disburse aid');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'disbursed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return Award;
      case 'grant': return Heart;
      case 'loan': return CreditCard;
      case 'work-study': return Users;
      default: return DollarSign;
    }
  };

  const ApplicationCard: React.FC<{ application: FinancialAidApplication }> = ({ application }) => {
    const TypeIcon = getTypeIcon(application.aidType);
    
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
              <TypeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{application.studentName}</h3>
              <p className="text-sm text-gray-500">{application.studentEmail}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{application.programName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{application.aidType}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Requested:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                ${application.requestedAmount.toLocaleString()}
              </span>
            </div>
            {application.approvedAmount && (
              <div>
                <span className="text-gray-500">Approved:</span>
                <span className="ml-2 font-medium text-green-600">
                  ${application.approvedAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">GPA:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{application.gpa}</span>
            </div>
            <div>
              <span className="text-gray-500">Need:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                ${application.financialNeed.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">Applied:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {format(new Date(application.applicationDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedApplication(application)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {user?.role === 'admin' && application.status === 'pending' && (
            <button
              onClick={() => {
                setSelectedApplication(application);
                setShowReviewModal(true);
              }}
              className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Review
            </button>
          )}
          
          {user?.role === 'admin' && application.status === 'approved' && (
            <button
              onClick={() => handleDisburseAid(application.id)}
              className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Disburse
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const ProgramCard: React.FC<{ program: any }> = ({ program }) => {
    const TypeIcon = getTypeIcon(program.type);
    const utilizationRate = (program.allocated / program.totalBudget) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{program.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{program.type}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Budget:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                ${program.totalBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Allocated:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                ${program.allocated.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Recipients:</span>
              <p className="font-medium text-gray-900 dark:text-white">{program.recipients}</p>
            </div>
            <div>
              <span className="text-gray-500">Max Amount:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                ${program.maxAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Budget Utilization</span>
              <span className="font-medium text-gray-900 dark:text-white">{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Eligibility Criteria</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>Min GPA: {program.criteria.minGPA}</div>
              <div>Max Income: ${program.criteria.maxIncome.toLocaleString()}</div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Aid Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage scholarships, grants, loans, and work-study programs
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Program</span>
          </button>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'programs', label: 'Programs', icon: Award },
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
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Applications</p>
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
                {applications.filter(app => app.status === 'approved').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Approved</p>
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
                {applications.filter(app => app.status === 'pending').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${applications.reduce((sum, app) => sum + (app.approvedAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Awarded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications View */}
      {viewMode === 'applications' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, programs..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="scholarship">Scholarships</option>
                <option value="grant">Grants</option>
                <option value="loan">Loans</option>
                <option value="work-study">Work-Study</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredApplications.map(application => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </AnimatePresence>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'No financial aid applications yet'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Programs View */}
      {viewMode === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aidPrograms.map(program => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Status Distribution</h3>
            <div className="space-y-3">
              {['pending', 'approved', 'rejected', 'disbursed'].map(status => {
                const count = applications.filter(app => app.status === status).length;
                const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'approved' ? 'bg-green-500' :
                        status === 'rejected' ? 'bg-red-500' :
                        status === 'disbursed' ? 'bg-blue-500' : 'bg-yellow-500'
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aid Type Distribution</h3>
            <div className="space-y-3">
              {['scholarship', 'grant', 'loan', 'work-study'].map(type => {
                const count = applications.filter(app => app.aidType === type).length;
                const totalAmount = applications
                  .filter(app => app.aidType === type && app.approvedAmount)
                  .reduce((sum, app) => sum + (app.approvedAmount || 0), 0);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{count} applications</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total awarded:</span>
                      <span className="text-green-600 font-medium">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Applications</h3>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Utilization</h3>
            <div className="space-y-4">
              {aidPrograms.map(program => {
                const utilization = (program.allocated / program.totalBudget) * 100;
                return (
                  <div key={program.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{program.name}</span>
                      <span className="text-gray-900 dark:text-white">{utilization.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Application</h2>
              <p className="text-gray-600 dark:text-gray-400">{selectedApplication.studentName} - {selectedApplication.programName}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requested Amount
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${selectedApplication.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student GPA
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedApplication.gpa}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Financial Need
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${selectedApplication.financialNeed.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Approved Amount
                  </label>
                  <input
                    type="number"
                    max={selectedApplication.requestedAmount}
                    placeholder="Enter approved amount"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add review notes..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewApplication(selectedApplication.id, 'rejected', 0, 'Application rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReviewApplication(selectedApplication.id, 'approved', selectedApplication.requestedAmount, 'Application approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAidManagement;
