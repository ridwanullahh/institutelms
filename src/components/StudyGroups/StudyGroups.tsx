import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Video,
  MessageSquare,
  BookOpen,
  Star,
  UserPlus,
  UserMinus,
  Settings,
  Edit,
  Trash2,
  Eye,
  Share2,
  Lock,
  Unlock,
  Globe,
  User,
  Crown,
  Shield,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { StudyGroup, StudyGroupMember, Course } from '../../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const StudyGroups: React.FC = () => {
  const { user } = useAuthStore();
  const {
    studyGroups,
    courses,
    loadStudyGroups,
    loadCourses,
    createStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    joinStudyGroup,
    leaveStudyGroup
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);

  useEffect(() => {
    loadStudyGroups();
    loadCourses();
  }, []);

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || group.courseId === filterCourse;
    
    const matchesType = filterType === 'all' || 
      (filterType === 'my-groups' && group.members.some(m => m.userId === user?.id)) ||
      (filterType === 'public' && !group.isPrivate) ||
      (filterType === 'private' && group.isPrivate);
    
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleCreateGroup = async (groupData: Partial<StudyGroup>) => {
    try {
      await createStudyGroup({
        ...groupData,
        creatorId: user?.id!,
        members: [{
          userId: user?.id!,
          userName: `${user?.firstName} ${user?.lastName}`,
          role: 'creator',
          joinedAt: new Date().toISOString()
        }]
      });
      setShowCreateModal(false);
      toast.success('Study group created successfully');
    } catch (error) {
      toast.error('Failed to create study group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      await joinStudyGroup(groupId, user.id!);
      toast.success('Joined study group successfully');
    } catch (error) {
      toast.error('Failed to join study group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      await leaveStudyGroup(groupId, user.id!);
      toast.success('Left study group successfully');
    } catch (error) {
      toast.error('Failed to leave study group');
    }
  };

  const CreateGroupModal: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      courseId: '',
      maxMembers: 10,
      isPrivate: false,
      meetingSchedule: '',
      meetingUrl: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateGroup({
        ...formData,
        creatorId: user?.id!,
        members: [{
          userId: user?.id!,
          userName: `${user?.firstName} ${user?.lastName}`,
          role: 'creator',
          joinedAt: new Date().toISOString()
        }],
        resources: [],
        discussions: []
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Study Group</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter group name"
              />
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
                placeholder="Describe the purpose of this study group"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Course (Optional)</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Schedule (Optional)
              </label>
              <input
                type="text"
                value={formData.meetingSchedule}
                onChange={(e) => setFormData({...formData, meetingSchedule: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Tuesdays and Thursdays at 7 PM"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting URL (Optional)
              </label>
              <input
                type="url"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({...formData, meetingUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://meet.example.com/room"
              />
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Private Group (Invite only)</span>
              </label>
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
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GroupCard: React.FC<{ group: StudyGroup }> = ({ group }) => {
    const course = courses.find(c => c.id === group.courseId);
    const isMember = group.members.some(m => m.userId === user?.id);
    const isCreator = group.creatorId === user?.id;
    const memberRole = group.members.find(m => m.userId === user?.id)?.role;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {group.name}
              </h3>
              {group.isPrivate ? (
                <Lock className="w-4 h-4 text-gray-500" />
              ) : (
                <Globe className="w-4 h-4 text-green-500" />
              )}
              {isMember && (
                <div className="flex items-center space-x-1">
                  {memberRole === 'creator' && <Crown className="w-4 h-4 text-yellow-500" />}
                  {memberRole === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            {course && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {course.title} • {course.code}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {group.description}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{group.members.length}</div>
            <div className="text-xs text-gray-500">/{group.maxMembers} members</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {group.meetingSchedule && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="truncate">{group.meetingSchedule}</span>
            </div>
          )}
          {group.meetingUrl && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Video className="w-4 h-4" />
              <span>Online meetings</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>{group.discussions.length} discussions</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{group.resources.length} resources</span>
          </div>
        </div>
        
        {/* Member Avatars */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map(member => (
              <div
                key={member.userId}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                title={member.userName}
              >
                <span className="text-white text-xs font-semibold">
                  {member.userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            ))}
            {group.members.length > 4 && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold">
                  +{group.members.length - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">
            Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedGroup(group);
                setShowGroupDetail(true);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {isMember && (
              <>
                <button
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Group Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                
                {(isCreator || memberRole === 'moderator') && (
                  <button
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Group Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            
            <button
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Share Group"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {isMember ? (
              <button
                onClick={() => handleLeaveGroup(group.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => handleJoinGroup(group.id)}
                disabled={group.members.length >= group.maxMembers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {group.isPrivate ? 'Request to Join' : 'Join Group'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const GroupDetailModal: React.FC = () => {
    if (!selectedGroup) return null;

    const course = courses.find(c => c.id === selectedGroup.courseId);
    const isMember = selectedGroup.members.some(m => m.userId === user?.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedGroup.name}
                </h2>
                {selectedGroup.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : (
                  <Globe className="w-5 h-5 text-green-500" />
                )}
              </div>
              <button
                onClick={() => setShowGroupDetail(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {course && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {course.title} • {course.code}
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Group Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedGroup.description}</p>
                </div>
                
                {selectedGroup.meetingSchedule && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Meeting Schedule</h3>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-5 h-5" />
                      <span>{selectedGroup.meetingSchedule}</span>
                    </div>
                    {selectedGroup.meetingUrl && (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-2">
                        <Video className="w-5 h-5" />
                        <a 
                          href={selectedGroup.meetingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New discussion started</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <UserPlus className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New member joined</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Members ({selectedGroup.members.length}/{selectedGroup.maxMembers})
                </h3>
                <div className="space-y-3">
                  {selectedGroup.members.map(member => (
                    <div key={member.userId} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {member.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.userName}
                          </p>
                          {member.role === 'creator' && <Crown className="w-4 h-4 text-yellow-500" />}
                          {member.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {!isMember && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleJoinGroup(selectedGroup.id)}
                disabled={selectedGroup.members.length >= selectedGroup.maxMembers}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {selectedGroup.isPrivate ? 'Request to Join Group' : 'Join Group'}
              </button>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collaborate with peers and enhance your learning experience
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{studyGroups.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">My Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {studyGroups.filter(g => g.members.some(m => m.userId === user?.id)).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Public Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {studyGroups.filter(g => !g.isPrivate).length}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {studyGroups.reduce((sum, g) => sum + g.members.length, 0)}
              </p>
            </div>
            <Star className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search study groups..."
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
            <option value="all">All Groups</option>
            <option value="my-groups">My Groups</option>
            <option value="public">Public Groups</option>
            <option value="private">Private Groups</option>
          </select>
          
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map(group => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No study groups found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create or join a study group to start collaborating'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Study Group
          </button>
        </div>
      )}

      {showCreateModal && <CreateGroupModal />}
      {showGroupDetail && <GroupDetailModal />}
    </div>
  );
};

export default StudyGroups;