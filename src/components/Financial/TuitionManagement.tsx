import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Search,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  Eye,
  Edit
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { format, addMonths, isAfter, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

interface TuitionRecord {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  tuitionAmount: number;
  fees: Array<{
    name: string;
    amount: number;
    type: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentPlan?: {
    installments: number;
    installmentAmount: number;
    nextDueDate: string;
  };
  transactions: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
  }>;
}

const TuitionManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    tuitionRecords, 
    users,
    payments,
    loadTuitionRecords,
    createTuitionRecord,
    updateTuitionRecord,
    processPayment
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<TuitionRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadTuitionRecords();
  }, []);

  const filteredRecords = tuitionRecords.filter(record => {
    const student = users.find(u => u.id === record.studentId);
    const matchesSearch = student ? 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.academicInfo?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSemester = filterSemester === 'all' || record.semester === filterSemester;
    
    // Filter by user role
    const matchesUser = user?.role === 'admin' || 
      (user?.role === 'student' && record.studentId === user.id);
    
    return matchesSearch && matchesStatus && matchesSemester && matchesUser;
  });

  const calculateTotalOutstanding = () => {
    return filteredRecords.reduce((sum, record) => sum + record.balance, 0);
  };

  const calculateOverdueAmount = () => {
    return filteredRecords
      .filter(record => record.status === 'overdue')
      .reduce((sum, record) => sum + record.balance, 0);
  };

  const generateTuitionBill = async (studentId: string, academicYear: string, semester: string) => {
    try {
      const student = users.find(u => u.id === studentId);
      if (!student) throw new Error('Student not found');

      // Calculate tuition based on program and credits
      const baseTuition = 15000; // Base tuition per semester
      const fees = [
        { name: 'Technology Fee', amount: 500, type: 'mandatory' },
        { name: 'Student Activities Fee', amount: 200, type: 'mandatory' },
        { name: 'Library Fee', amount: 150, type: 'mandatory' },
        { name: 'Health Services Fee', amount: 300, type: 'mandatory' }
      ];

      const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalAmount = baseTuition + totalFees;

      const tuitionRecord: Partial<TuitionRecord> = {
        studentId,
        academicYear,
        semester,
        tuitionAmount: baseTuition,
        fees,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        dueDate: addMonths(new Date(), 1).toISOString(), // Due in 1 month
        status: 'pending',
        transactions: []
      };

      await createTuitionRecord(tuitionRecord);
      toast.success('Tuition bill generated successfully');
    } catch (error) {
      toast.error('Failed to generate tuition bill');
    }
  };

  const processPaymentTransaction = async (recordId: string, amount: number, method: string) => {
    try {
      const record = tuitionRecords.find(r => r.id === recordId);
      if (!record) throw new Error('Record not found');

      const newTransaction = {
        id: crypto.randomUUID(),
        amount,
        date: new Date().toISOString(),
        method,
        reference: `PAY-${Date.now()}`
      };

      const newPaidAmount = record.paidAmount + amount;
      const newBalance = record.totalAmount - newPaidAmount;
      const newStatus = newBalance <= 0 ? 'paid' : newBalance < record.totalAmount ? 'partial' : 'pending';

      await updateTuitionRecord(recordId, {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        transactions: [...record.transactions, newTransaction]
      });

      // Create payment record
      await processPayment({
        studentId: record.studentId,
        amount,
        type: 'tuition',
        method,
        status: 'completed',
        reference: newTransaction.reference,
        description: `Tuition payment for ${record.academicYear} ${record.semester}`
      });

      setShowPaymentModal(false);
      toast.success('Payment processed successfully');
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const TuitionCard: React.FC<{ record: TuitionRecord }> = ({ record }) => {
    const student = users.find(u => u.id === record.studentId);
    const isOverdue = record.status === 'overdue' || 
      (record.balance > 0 && isAfter(new Date(), new Date(record.dueDate)));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {student?.firstName} {student?.lastName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {student?.academicInfo?.studentId} • {record.academicYear}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {record.semester} Semester
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">${record.balance.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Balance Due</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Payment Progress</span>
            <span>${record.paidAmount.toLocaleString()}/${record.totalAmount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(record.paidAmount / record.totalAmount) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Total: ${record.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {format(new Date(record.dueDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Receipt className="w-4 h-4" />
            <span>{record.transactions.length} payments</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {record.paymentPlan ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Payment Plan</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Full Payment</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedRecord(record)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Handle download statement */}}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download Statement"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Handle send reminder */}}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Send Reminder"
            >
              <Mail className="w-4 h-4" />
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {/* Handle edit */}}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit Record"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {record.balance > 0 && (
              <button
                onClick={() => {
                  setSelectedRecord(record);
                  setShowPaymentModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Make Payment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PaymentModal: React.FC = () => {
    const [paymentData, setPaymentData] = useState({
      amount: selectedRecord?.balance || 0,
      method: 'credit_card'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedRecord) {
        processPaymentTransaction(selectedRecord.id, paymentData.amount, paymentData.method);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Process Payment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedRecord?.balance}
                required
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: ${selectedRecord?.balance.toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Payment Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>${selectedRecord?.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span>${paymentData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Remaining Balance:</span>
                  <span>${((selectedRecord?.balance || 0) - paymentData.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Process Payment
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tuition Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student tuition billing and payments
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${calculateTotalOutstanding().toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${calculateOverdueAmount().toLocaleString()}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid in Full</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredRecords.filter(r => r.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredRecords.filter(r => r.paymentPlan).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Semesters</option>
            <option value="Fall 2024">Fall 2024</option>
            <option value="Spring 2024">Spring 2024</option>
            <option value="Summer 2024">Summer 2024</option>
          </select>
        </div>
      </div>

      {/* Tuition Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecords.map(record => (
          <TuitionCard key={record.id} record={record} />
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tuition records found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Generate tuition bills to get started'}
          </p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Bill
            </button>
          )}
        </div>
      )}

      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default TuitionManagement;