import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Video, 
  Headphones, 
  Image, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark, 
  Star, 
  Clock, 
  User, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Upload, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { usePlatformStore } from '../../store/platform';
import { useAuthStore } from '../../store/auth';
import { LibraryResource } from '../../lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DigitalLibrary: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    libraryResources, 
    loadLibraryResources,
    createLibraryResource,
    updateLibraryResource,
    deleteLibraryResource
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    loadLibraryResources();
    // Load user favorites and bookmarks from localStorage
    const savedFavorites = localStorage.getItem(`favorites_${user?.id}`);
    const savedBookmarks = localStorage.getItem(`bookmarks_${user?.id}`);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  const resourceTypes = [
    { value: 'all', label: 'All Types', icon: Library },
    { value: 'book', label: 'Books', icon: BookOpen },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Headphones },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'document', label: 'Documents', icon: FileText }
  ];

  const categories = [
    'all', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Literature', 'History', 'Psychology', 'Business', 'Engineering', 'Medicine',
    'Art', 'Music', 'Philosophy', 'Economics', 'Political Science', 'Other'
  ];

  const filteredResources = libraryResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'recent':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const toggleFavorite = (resourceId: string) => {
    const newFavorites = favorites.includes(resourceId)
      ? favorites.filter(id => id !== resourceId)
      : [...favorites, resourceId];
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites));
    toast.success(favorites.includes(resourceId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const toggleBookmark = (resourceId: string) => {
    const newBookmarks = bookmarks.includes(resourceId)
      ? bookmarks.filter(id => id !== resourceId)
      : [...bookmarks, resourceId];
    
    setBookmarks(newBookmarks);
    localStorage.setItem(`bookmarks_${user?.id}`, JSON.stringify(newBookmarks));
    toast.success(bookmarks.includes(resourceId) ? 'Bookmark removed' : 'Bookmarked');
  };

  const handleView = async (resource: LibraryResource) => {
    // Increment view count
    try {
      await updateLibraryResource(resource.id!, { 
        views: (resource.views || 0) + 1 
      });
    } catch (error) {
      console.error('Failed to update view count:', error);
    }
    
    setSelectedResource(resource);
  };

  const handleDownload = async (resource: LibraryResource) => {
    try {
      // Increment download count
      await updateLibraryResource(resource.id!, { 
        downloads: (resource.downloads || 0) + 1 
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download resource');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'book': return BookOpen;
      case 'article': return FileText;
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'image': return Image;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const ResourceCard: React.FC<{ resource: LibraryResource }> = ({ resource }) => {
    const Icon = getResourceIcon(resource.type);
    const isFavorite = favorites.includes(resource.id!);
    const isBookmarked = bookmarks.includes(resource.id!);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        {/* Resource Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-500">by {resource.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(resource.id!)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => toggleBookmark(resource.id!)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Resource Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {resource.description}
        </p>

        {/* Resource Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Resource Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{resource.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{resource.downloads || 0}</span>
            </div>
            {resource.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{resource.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <span>{format(new Date(resource.uploadedAt), 'MMM dd, yyyy')}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(resource)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            onClick={() => handleDownload(resource)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              navigator.share?.({
                title: resource.title,
                text: resource.description,
                url: resource.fileUrl
              }) || navigator.clipboard.writeText(resource.fileUrl);
              toast.success('Link copied to clipboard');
            }}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  const ResourceListItem: React.FC<{ resource: LibraryResource }> = ({ resource }) => {
    const Icon = getResourceIcon(resource.type);
    const isFavorite = favorites.includes(resource.id!);
    const isBookmarked = bookmarks.includes(resource.id!);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">by {resource.author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {resource.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{resource.views || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloads || 0}</span>
                  </div>
                  {resource.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{resource.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleFavorite(resource.id!)}
                    className={`p-1.5 rounded transition-colors ${
                      isFavorite 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleBookmark(resource.id!)}
                    className={`p-1.5 rounded transition-colors ${
                      isBookmarked 
                        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleView(resource)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(resource)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {resource.tags.slice(0, 4).map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Library</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access thousands of educational resources and materials
          </p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Library className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{libraryResources.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Resources</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Favorites</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookmarks.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Bookmarks</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {libraryResources.reduce((sum, r) => sum + (r.views || 0), 0)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources, authors, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Resources Grid/List */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        <AnimatePresence>
          {filteredResources.map(resource => (
            viewMode === 'grid'
              ? <ResourceCard key={resource.id} resource={resource} />
              : <ResourceListItem key={resource.id} resource={resource} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms or filters'
              : 'No resources have been added yet'
            }
          </p>
          {(user?.role === 'admin' || user?.role === 'instructor') && !searchTerm && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Resource
            </button>
          )}
        </div>
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedResource.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">by {selectedResource.author}</p>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedResource.description}</p>

                  {selectedResource.fileUrl && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resource Preview</h4>
                      {selectedResource.type === 'video' ? (
                        <video controls className="w-full rounded-lg">
                          <source src={selectedResource.fileUrl} />
                        </video>
                      ) : selectedResource.type === 'image' ? (
                        <img src={selectedResource.fileUrl} alt={selectedResource.title} className="w-full rounded-lg" />
                      ) : selectedResource.type === 'audio' ? (
                        <audio controls className="w-full">
                          <source src={selectedResource.fileUrl} />
                        </audio>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 dark:text-gray-400">Preview not available</p>
                          <button
                            onClick={() => handleDownload(selectedResource)}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Download to View
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="text-gray-900 dark:text-white capitalize">{selectedResource.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-900 dark:text-white">{selectedResource.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Uploaded:</span>
                          <span className="text-gray-900 dark:text-white">
                            {format(new Date(selectedResource.uploadedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Views:</span>
                          <span className="text-gray-900 dark:text-white">{selectedResource.views || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Downloads:</span>
                          <span className="text-gray-900 dark:text-white">{selectedResource.downloads || 0}</span>
                        </div>
                        {selectedResource.rating && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-gray-900 dark:text-white">{selectedResource.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleDownload(selectedResource)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => toggleFavorite(selectedResource.id!)}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          favorites.includes(selectedResource.id!)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(selectedResource.id!) ? 'fill-current' : ''}`} />
                        <span>{favorites.includes(selectedResource.id!) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.share?.({
                            title: selectedResource.title,
                            text: selectedResource.description,
                            url: selectedResource.fileUrl
                          }) || navigator.clipboard.writeText(selectedResource.fileUrl);
                          toast.success('Link copied to clipboard');
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalLibrary;
