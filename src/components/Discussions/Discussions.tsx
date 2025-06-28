import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Pin, 
  Lock, 
  Eye, 
  ThumbsUp, 
  Reply, 
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Share2,
  Bookmark,
  Clock,
  User,
  Tag,
  TrendingUp,
  MessageCircle,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Send,
  Paperclip,
  Image,
  FileText
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Discussion, DiscussionReply, Course } from '../../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Discussions: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    discussions, 
    courses,
    loadDiscussions, 
    createDiscussion, 
    updateDiscussion, 
    deleteDiscussion 
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  useEffect(() => {
    loadDiscussions();
  }, []);

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || discussion.category === filterCategory;
    const matchesCourse = filterCourse === 'all' || discussion.courseId === filterCourse;
    
    return matchesSearch && matchesCategory && matchesCourse;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes + b.replies.length) - (a.likes + a.replies.length);
      case 'unanswered':
        return a.replies.length - b.replies.length;
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const handleCreateDiscussion = async (discussionData: Partial<Discussion>) => {
    try {
      await createDiscussion({
        ...discussionData,
        authorId: user?.id!,
        authorName: `${user?.firstName} ${user?.lastName}`,
        authorAvatar: user?.avatar,
        views: 0,
        likes: 0,
        replies: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      toast.success('Discussion created successfully');
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      const discussion = discussions.find(d => d.id === discussionId);
      if (discussion) {
        await updateDiscussion(discussionId, {
          likes: discussion.likes + 1,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      toast.error('Failed to like discussion');
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      const discussion = discussions.find(d => d.id === discussionId);
      if (discussion) {
        const newReply: DiscussionReply = {
          id: crypto.randomUUID(),
          authorId: user?.id!,
          authorName: `${user?.firstName} ${user?.lastName}`,
          authorAvatar: user?.avatar,
          content: replyContent,
          likes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await updateDiscussion(discussionId, {
          replies: [...discussion.replies, newReply],
          updatedAt: new Date().toISOString()
        });
        
        setReplyContent('');
        toast.success('Reply posted successfully');
      }
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'lecture': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-red-100 text-red-800';
      case 'announcement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CreateDiscussionModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      category: 'general',
      courseId: '',
      tags: [] as string[],
      tagInput: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateDiscussion({
        title: formData.title,
        content: formData.content,
        category: formData.category as any,
        courseId: formData.courseId || undefined,
        tags: formData.tags
      });
    };

    const addTag = () => {
      if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, formData.tagInput.trim()],
          tagInput: ''
        });
      }
    };

    const removeTag = (tag: string) => {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Start New Discussion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="What would you like to discuss?"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="assignment">Assignment Help</option>
                  <option value="lecture">Lecture Discussion</option>
                  <option value="technical">Technical Support</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course (Optional)
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No specific course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe your question or topic in detail..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({...formData, tagInput: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                Post Discussion
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DiscussionCard: React.FC<{ discussion: Discussion }> = ({ discussion }) => {
    const course = courses.find(c => c.id === discussion.courseId);
    const timeAgo = formatDistanceToNow(new Date(discussion.updatedAt), { addSuffix: true });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {discussion.authorName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {discussion.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  {discussion.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                  <h3 
                    className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedDiscussion(discussion)}
                  >
                    {discussion.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{discussion.authorName}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                  {course && (
                    <>
                      <span>•</span>
                      <span>{course.title}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                  {discussion.category}
                </span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {discussion.content}
            </p>
            
            {discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {discussion.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button 
                  onClick={() => handleLikeDiscussion(discussion.id)}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{discussion.likes}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{discussion.replies.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{discussion.views}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DiscussionDetail: React.FC = () => {
    if (!selectedDiscussion) return null;

    const course = courses.find(c => c.id === selectedDiscussion.courseId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedDiscussion.isPinned && <Pin className="w-5 h-5 text-yellow-500" />}
                {selectedDiscussion.isLocked && <Lock className="w-5 h-5 text-red-500" />}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDiscussion.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDiscussion(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{selectedDiscussion.authorName}</span>
              <span>•</span>
              <span>{format(new Date(selectedDiscussion.createdAt), 'MMM d, yyyy h:mm a')}</span>
              {course && (
                <>
                  <span>•</span>
                  <span>{course.title}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p>{selectedDiscussion.content}</p>
            </div>
            
            {selectedDiscussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedDiscussion.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Replies ({selectedDiscussion.replies.length})
              </h3>
              
              <div className="space-y-4 mb-6">
                {selectedDiscussion.replies.map(reply => (
                  <div key={reply.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {reply.authorName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{reply.authorName}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {!selectedDiscussion.isLocked && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleReply(selectedDiscussion.id)}
                          disabled={!replyContent.trim()}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion Forums</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with your peers and instructors
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Discussions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{discussions.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Replies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {discussions.reduce((sum, d) => sum + d.replies.length, 0)}
              </p>
            </div>
            <Reply className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(discussions.map(d => d.authorId)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unanswered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {discussions.filter(d => d.replies.length === 0).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="assignment">Assignment Help</option>
            <option value="lecture">Lecture Discussion</option>
            <option value="technical">Technical Support</option>
            <option value="announcement">Announcements</option>
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
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map(discussion => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No discussions found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start the conversation by creating the first discussion'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Discussion
          </button>
        </div>
      )}

      {showCreateModal && <CreateDiscussionModal />}
      {selectedDiscussion && <DiscussionDetail />}
    </div>
  );
};

export default Discussions;