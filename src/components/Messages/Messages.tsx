import React, { useState, useEffect } from 'react';
import { Mail, Send, Search, Filter, Star, Archive, Trash2, Reply, Forward, MoreVertical, Paperclip, Image, FileText, User, Clock, Check, CheckCheck, Plus, Inbox, Send as Sent, Drama as Drafts, Users, Tag, AlertCircle, X } from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Message, User as UserType } from '../../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Messages: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    messages, 
    users,
    loadMessages, 
    sendMessage, 
    markMessageAsRead, 
    deleteMessage 
  } = usePlatformStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'starred' | 'archived'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMessages(user.id);
    }
  }, [user?.id]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFolder) {
      case 'inbox':
        return message.recipientId === user?.id && !message.isArchived && matchesSearch;
      case 'sent':
        return message.senderId === user?.id && matchesSearch;
      case 'drafts':
        return false; // Implement drafts functionality
      case 'starred':
        return message.isStarred && matchesSearch;
      case 'archived':
        return message.isArchived && matchesSearch;
      default:
        return matchesSearch;
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = messages.filter(m => m.recipientId === user?.id && !m.isRead).length;

  const handleSendMessage = async (messageData: {
    recipientId: string;
    subject: string;
    content: string;
    parentId?: string;
  }) => {
    try {
      const recipient = users.find(u => u.id === messageData.recipientId);
      await sendMessage({
        ...messageData,
        senderId: user?.id!,
        senderName: `${user?.firstName} ${user?.lastName}`,
        recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Unknown',
        attachments: [],
        isRead: false,
        isStarred: false,
        isArchived: false,
        threadId: messageData.parentId ? 
          messages.find(m => m.id === messageData.parentId)?.threadId || crypto.randomUUID() :
          crypto.randomUUID()
      });
      
      setShowCompose(false);
      setReplyTo(null);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        setSelectedMessage(null);
        toast.success('Message deleted');
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const ComposeModal: React.FC = () => {
    const [formData, setFormData] = useState({
      recipientId: replyTo?.senderId || '',
      subject: replyTo ? `Re: ${replyTo.subject}` : '',
      content: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage({
        ...formData,
        parentId: replyTo?.id
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {replyTo ? 'Reply to Message' : 'Compose Message'}
            </h2>
            <button
              onClick={() => {
                setShowCompose(false);
                setReplyTo(null);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To *
              </label>
              <select
                required
                value={formData.recipientId}
                onChange={(e) => setFormData({...formData, recipientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={!!replyTo}
              >
                <option value="">Select recipient</option>
                {users.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Type your message here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCompose(false);
                  setReplyTo(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MessageDetail: React.FC = () => {
    if (!selectedMessage) return null;

    const isFromMe = selectedMessage.senderId === user?.id;

    return (
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedMessage.subject}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setReplyTo(selectedMessage);
                  setShowCompose(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {isFromMe ? 
                  `${user?.firstName?.[0]}${user?.lastName?.[0]}` :
                  selectedMessage.senderName.split(' ').map(n => n[0]).join('')
                }
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isFromMe ? 'You' : selectedMessage.senderName}
              </p>
              <p className="text-sm text-gray-500">
                to {isFromMe ? selectedMessage.recipientName : 'you'} • {format(new Date(selectedMessage.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
          </div>
          
          {selectedMessage.attachments.length > 0 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Attachments</h4>
              <div className="space-y-2">
                {selectedMessage.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
              { id: 'sent', label: 'Sent', icon: Sent },
              { id: 'drafts', label: 'Drafts', icon: Drafts },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'archived', label: 'Archived', icon: Archive }
            ].map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <folder.icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count && folder.count > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Message List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.map(message => {
                const isFromMe = message.senderId === user?.id;
                const isSelected = selectedMessage?.id === message.id;
                
                return (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead && !isFromMe) {
                        handleMarkAsRead(message.id);
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${!message.isRead && !isFromMe ? 'bg-blue-25 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {isFromMe ? 
                            `${user?.firstName?.[0]}${user?.lastName?.[0]}` :
                            message.senderName.split(' ').map(n => n[0]).join('')
                          }
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${
                            !message.isRead && !isFromMe ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {isFromMe ? `To: ${message.recipientName}` : message.senderName}
                          </p>
                          <div className="flex items-center space-x-1">
                            {message.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            {isFromMe && (
                              message.isRead ? 
                                <CheckCheck className="w-3 h-3 text-blue-500" /> :
                                <Check className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-1 truncate ${
                          !message.isRead && !isFromMe ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {message.subject}
                        </p>
                        
                        <p className="text-xs text-gray-500 truncate">
                          {message.content}
                        </p>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      {selectedMessage ? (
        <MessageDetail />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No message selected</h3>
            <p className="text-gray-500">Choose a message from the list to read it</p>
          </div>
        </div>
      )}

      {showCompose && <ComposeModal />}
    </div>
  );
};

export default Messages;