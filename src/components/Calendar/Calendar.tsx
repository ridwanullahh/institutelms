import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Bell,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  Repeat,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { Event, Course } from '../../lib/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  addDays,
  startOfDay,
  endOfDay
} from 'date-fns';
import toast from 'react-hot-toast';

const Calendar: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    events, 
    courses,
    loadEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = usePlatformStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesUser = user?.role === 'admin' || 
      event.organizerId === user?.id || 
      event.attendees.includes(user?.id || '');
    return matchesType && matchesUser;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-500 text-white';
      case 'exam': return 'bg-red-500 text-white';
      case 'assignment_due': return 'bg-orange-500 text-white';
      case 'meeting': return 'bg-purple-500 text-white';
      case 'holiday': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleCreateEvent = async (eventData: Partial<Event>) => {
    try {
      await createEvent({
        ...eventData,
        organizerId: user?.id!,
        attendees: [],
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      toast.success('Event created successfully');
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      await updateEvent(eventId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setShowEventModal(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        setShowEventModal(false);
        setSelectedEvent(null);
        toast.success('Event deleted successfully');
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const CreateEventModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      type: 'event',
      startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
      endDate: selectedDate ? format(addDays(selectedDate, 0), "yyyy-MM-dd'T'HH:mm") : '',
      location: '',
      isOnline: false,
      meetingUrl: '',
      courseId: '',
      isRecurring: false,
      recurrenceRule: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateEvent({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Event</h2>
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
                Event Title *
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
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="event">General Event</option>
                  <option value="lecture">Lecture</option>
                  <option value="exam">Exam</option>
                  <option value="assignment_due">Assignment Due</option>
                  <option value="meeting">Meeting</option>
                  <option value="holiday">Holiday</option>
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
                  <option value="">No Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({...formData, isOnline: e.target.checked})}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Online Event</span>
              </label>
            </div>
            
            {formData.isOnline ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({...formData, meetingUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            
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
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EventModal: React.FC = () => {
    if (!selectedEvent) return null;

    const course = courses.find(c => c.id === selectedEvent.courseId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEvent.title}</h2>
            <button
              onClick={() => setShowEventModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                {selectedEvent.type.replace('_', ' ')}
              </span>
              {selectedEvent.status === 'cancelled' && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Cancelled
                </span>
              )}
            </div>
            
            {selectedEvent.description && (
              <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {format(parseISO(selectedEvent.startDate), 'MMM d, yyyy h:mm a')} - 
                  {format(parseISO(selectedEvent.endDate), 'h:mm a')}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.isOnline && selectedEvent.meetingUrl && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Video className="w-4 h-4" />
                  <a 
                    href={selectedEvent.meetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
              
              {course && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course.title} ({course.code})</span>
                </div>
              )}
            </div>
            
            {(user?.id === selectedEvent.organizerId || user?.role === 'admin') && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => {/* Handle edit */}}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Event"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage events, classes, and important dates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Events</option>
            <option value="lecture">Lectures</option>
            <option value="exam">Exams</option>
            <option value="assignment_due">Assignments</option>
            <option value="meeting">Meetings</option>
            <option value="holiday">Holidays</option>
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400' : ''
                } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  setShowCreateModal(true);
                }}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-blue-600 font-bold' : 
                  isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && <CreateEventModal />}
      {showEventModal && <EventModal />}
    </div>
  );
};

export default Calendar;