import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  BookOpen,
  CheckCircle,
  Star,
  Trophy,
  Medal,
  Shield,
  Zap,
  Globe,
  QrCode,
  Link,
  Mail,
  Printer,
  FileText,
  Verified
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Certificate, Course } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Certificates: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    certificates, 
    courses,
    loadCertificates 
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const filteredCertificates = certificates.filter(cert => {
    const course = courses.find(c => c.id === cert.courseId);
    const matchesSearch = cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course?.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = user?.role === 'admin' || cert.studentId === user?.id;
    
    return matchesSearch && matchesUser;
  });

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Generate and download certificate PDF
    toast.success('Certificate downloaded successfully');
  };

  const handleShareCertificate = (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Certificate link copied to clipboard');
  };

  const handleVerifyCertificate = (verificationCode: string) => {
    const certificate = certificates.find(c => c.verificationCode === verificationCode);
    if (certificate) {
      toast.success('Certificate verified successfully');
      return certificate;
    } else {
      toast.error('Invalid verification code');
      return null;
    }
  };

  const CertificatePreview: React.FC<{ certificate: Certificate }> = ({ certificate }) => {
    const course = courses.find(c => c.id === certificate.courseId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Certificate Design */}
          <div className="relative p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
              <p className="text-lg text-gray-600">This is to certify that</p>
            </div>
            
            {/* Student Name */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 inline-block">
                {certificate.studentName}
              </h2>
              <p className="text-xl text-gray-700">has successfully completed the course</p>
            </div>
            
            {/* Course Information */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-purple-800 mb-2">{certificate.courseName}</h3>
              {course && (
                <p className="text-lg text-gray-600">Course Code: {course.code}</p>
              )}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    Completed on {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}
                  </span>
                </div>
                {certificate.grade && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-600">Grade: {certificate.grade}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructor Signature */}
            <div className="flex justify-between items-end mt-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-2 w-48">
                  <p className="font-semibold text-gray-800">{certificate.instructorName}</p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-2 w-48">
                  <p className="font-semibold text-gray-800">EduAI Platform</p>
                  <p className="text-sm text-gray-600">Issued on {format(new Date(certificate.issuedAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
            
            {/* Verification Code */}
            <div className="absolute top-4 right-4 text-right">
              <div className="bg-white bg-opacity-80 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Verification Code</p>
                <p className="font-mono text-sm font-bold text-gray-800">{certificate.verificationCode}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Verified className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Verified</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 left-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Medal className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
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
              <button
                onClick={() => handleShareCertificate(certificate)}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => handleDownloadCertificate(certificate)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CertificateCard: React.FC<{ certificate: Certificate }> = ({ certificate }) => {
    const course = courses.find(c => c.id === certificate.courseId);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {certificate.courseName}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {course?.code} • {certificate.studentName}
              </p>
              <p className="text-sm text-gray-500">
                Completed on {format(new Date(certificate.completionDate), 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="text-right">
              {certificate.grade && (
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{certificate.grade}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Verified className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <p>Verification Code</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                {certificate.verificationCode}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Issued by</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {certificate.instructorName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setShowPreview(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Preview Certificate"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleShareCertificate(certificate)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Share Certificate"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {/* Handle print */}}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Print Certificate"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => handleDownloadCertificate(certificate)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your digital certificates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <QrCode className="w-4 h-4" />
            <span>Verify Certificate</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{certificates.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {certificates.filter(c => 
                  new Date(c.issuedAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{certificates.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shared</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(certificates.length * 0.7)}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Certificates</option>
            <option value="recent">Recent</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCertificates.map(certificate => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No certificates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Complete courses to earn certificates'}
          </p>
        </div>
      )}

      {showPreview && selectedCertificate && (
        <CertificatePreview certificate={selectedCertificate} />
      )}
    </div>
  );
};

export default Certificates;