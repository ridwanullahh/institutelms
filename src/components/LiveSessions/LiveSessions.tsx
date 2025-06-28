import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Pause,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MessageSquare,
  Settings,
  UserPlus,
  UserMinus,
  MoreVertical,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { LiveSession } from '../../lib/types';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const LiveSessions: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    liveSessions, 
    courses,
    loadLiveSessions, 
    createLiveSession, 
    updateLiveSession, 
    deleteLiveSession,
    joinLiveSession,
    leaveLiveSession
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'live' | 'recordings'>('upcoming');

  useEffect(() => {
    loadLiveSessions();
  }, []);

  const filteredSessions = liveSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const startTime = new Date(session.scheduledStart);
    const endTime = new Date(session.scheduledEnd);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'upcoming' && isAfter(startTime, now)) ||
      (filterStatus === 'live' && session.status === 'live') ||
      (filterStatus === 'ended' && session.status === 'ended') ||
      (filterStatus === 'cancelled' && session.status === 'cancelled');
    
    const matchesCourse = filterCourse === 'all' || session.courseId === filterCourse;
    
    // Filter by instructor for instructor role
    const matchesInstructor = user?.role !== 'instructor' || session.instructorId === user.id;
    
    return matchesSearch && matchesStatus && matchesCourse && matchesInstructor;
  });

  const handleCreateSession = async (sessionData: Partial<LiveSession>) => {
    try {
      await createLiveSession({
        ...sessionData,
        instructorId: user?.id!,
        status: 'scheduled',
        attendees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      toast.success('Live session created successfully');
    } catch (error) {
      toast.error('Failed to create live session');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      await joinLiveSession(sessionId, user.id);
      toast.success('Joined live session');
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      await leaveLiveSession(sessionId, user.id);
      toast.success('Left live session');
    } catch (error) {
      toast.error('Failed to leave session');
    }
  };

  const getStatusColor = (session: LiveSession) => {
    const now = new Date();
    const startTime = new Date(session.scheduledStart);
    const endTime = new Date(session.scheduledEnd);
    
    switch (session.status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default:
        if (isAfter(startTime, now)) return 'bg-blue-100 text-blue-800';
        if (isBefore(endTime, now)) return 'bg-gray-100 text-gray-800';
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (session: LiveSession) => {
    const now = new Date();
    const startTime = new Date(session.scheduledStart);
    const endTime = new Date(session.scheduledEnd);
    
    switch (session.status) {
      case 'live': return 'Live';
      case 'ended': return 'Ended';
      case 'cancelled': return 'Cancelled';
      default:
        if (isAfter(startTime, now)) return 'Upcoming';
        if (isBefore(endTime, now)) return 'Ended';
        return 'Ready to Start';
    }
  };

  const SessionCard: React.FC<{ session: LiveSession }> = ({ session }) => {
    const course = courses.find(c => c.id === session.courseId);
    const isInstructor = user?.id === session.instructorId;
    const isAttending = session.attendees.some(a => a.userId === user?.id);
    const canJoin = session.status === 'live' || 
      (session.status === 'scheduled' && 
       isAfter(new Date(), new Date(new Date(session.scheduledStart).getTime() - 15 * 60000))); // 15 min before

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {session.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session)}`}>
                {getStatusText(session)}
              </span>
              {session.status === 'live' && (
                <div className="flex items-center space-x-1">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-xs text-red-500 font-medium">LIVE</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {course?.title} • {course?.code}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {session.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{session.attendees.length}</div>
            <div className="text-xs text-gray-500">attendees</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(session.scheduledStart), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(session.scheduledStart), 'h:mm a')} - 
              {format(new Date(session.scheduledEnd), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{session.attendees.length}/{session.maxAttendees}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {session.isRecorded ? (
              <>
                <Video className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Recording</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>No Recording</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isInstructor && (
              <>
                <button
                  onClick={() => {/* Handle edit */}}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Edit Session"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle settings */}}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Session Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle delete */}}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {!isInstructor && (
              <button
                onClick={() => setSelectedSession(session)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {canJoin && (
              <>
                {isAttending ? (
                  <button
                    onClick={() => handleLeaveSession(session.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinSession(session.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    disabled={session.attendees.length >= session.maxAttendees}
                  >
                    {session.status === 'live' ? 'Join Live' : 'Join'}
                  </button>
                )}
              </>
            )}
            
            {session.recordingUrl && (
              <button
                onClick={() => window.open(session.recordingUrl, '_blank')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Watch Recording
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateSessionModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      courseId: '',
      scheduledStart: '',
      scheduledEnd: '',
      maxAttendees: 100,
      isRecorded: true,
      chatEnabled: true,
      screenShareEnabled: true,
      whiteboardEnabled: true,
      pollsEnabled: true,
      breakoutRoomsEnabled: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const sessionData: Partial<LiveSession> = {
        ...formData,
        scheduledStart: new Date(formData.scheduledStart).toISOString(),
        scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
        meetingUrl: `https://meet.eduai.com/session/${Date.now()}` // Generate meeting URL
      };
      handleCreateSession(sessionData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create Live Session</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Title *
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledEnd}
                  onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Attendees
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({...formData, maxAttendees: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRecorded}
                    onChange={(e) => setFormData({...formData, isRecorded: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Record Session</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.chatEnabled}
                    onChange={(e) => setFormData({...formData, chatEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable Chat</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.screenShareEnabled}
                    onChange={(e) => setFormData({...formData, screenShareEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Screen Sharing</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.whiteboardEnabled}
                    onChange={(e) => setFormData({...formData, whiteboardEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Whiteboard</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pollsEnabled}
                    onChange={(e) => setFormData({...formData, pollsEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Polls & Quizzes</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.breakoutRoomsEnabled}
                    onChange={(e) => setFormData({...formData, breakoutRoomsEnabled: e.target.checked})}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Breakout Rooms</span>
                </label>
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
                Create Session
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
            {viewMode === 'upcoming' ? 'Upcoming Sessions' : 
             viewMode === 'live' ? 'Live Sessions' : 'Session Recordings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'upcoming' ? 'Manage and join upcoming live sessions' :
             viewMode === 'live' ? 'Currently active live sessions' :
             'Access recorded session content'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'upcoming' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'live' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setViewMode('recordings')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'recordings' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Recordings
            </button>
          </div>
          
          {user?.role === 'instructor' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveSessions.length}</p>
            </div>
            <Video className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Live Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {liveSessions.filter(s => s.status === 'live').length}
              </p>
            </div>
            <Radio className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {liveSessions.filter(s => isToday(new Date(s.scheduledStart))).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {liveSessions.reduce((sum, s) => sum + s.attendees.length, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
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
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
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

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first live session'}
          </p>
          {user?.role === 'instructor' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Session
            </button>
          )}
        </div>
      )}

      {showCreateModal && <CreateSessionModal />}
    </div>
  );
};

export default LiveSessions;