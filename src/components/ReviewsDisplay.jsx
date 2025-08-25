import React, { useState, useEffect } from 'react';
import { Review } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MessageCircle, 
  ExternalLink, 
  Calendar,
  User,
  ThumbsUp,
  Filter
} from 'lucide-react';

export default function ReviewsDisplay({ boatId, showImportButton = false, onImportClick }) {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadReviews();
  }, [boatId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewData = await Review.getBoatReviews(boatId);
      setReviews(reviewData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const sortReviews = (reviewsList) => {
    if (!reviewsList) return [];
    
    return [...reviewsList].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'date':
        default:
          return new Date(b.review_date) - new Date(a.review_date);
      }
    });
  };

  const getFilteredReviews = () => {
    if (!reviews) return [];
    
    let filteredReviews = [];
    switch (activeTab) {
      case 'google':
        filteredReviews = reviews.googleReviews;
        break;
      case 'platform':
        filteredReviews = reviews.platformReviews;
        break;
      case 'all':
      default:
        filteredReviews = reviews.allReviews;
        break;
    }
    
    return sortReviews(filteredReviews);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`} 
      />
    ));
  };

  const renderReviewCard = (review) => (
    <Card key={review.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              {review.google_profile_photo ? (
                <img 
                  src={review.google_profile_photo} 
                  alt={review.customer_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {review.customer_name?.[0]?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{review.customer_name}</h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-slate-500">
                  {review.rating}/5
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {review.source === 'google' && (
              <Badge variant="outline" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Google
              </Badge>
            )}
            {review.source === 'platform' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <MessageCircle className="w-3 h-3 mr-1" />
                Platform
              </Badge>
            )}
          </div>
        </div>

        {review.title && (
          <h5 className="font-semibold text-slate-900 mb-2">{review.title}</h5>
        )}

        <p className="text-slate-700 mb-4 leading-relaxed">{review.comment}</p>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {review.google_relative_time || getRelativeTime(review.review_date)}
            </div>
            {review.language && review.language !== 'en' && (
              <Badge variant="outline" className="text-xs">
                {review.language.toUpperCase()}
              </Badge>
            )}
          </div>
          
          {review.google_author_url && (
            <a 
              href={review.google_author_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
            >
              View Profile
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredReviews = getFilteredReviews();
  const stats = reviews?.allReviews?.length > 0 ? {
    totalReviews: reviews.totalCount,
    googleReviews: reviews.googleCount,
    platformReviews: reviews.platformCount,
    averageRating: reviews.allReviews.reduce((sum, r) => sum + r.rating, 0) / reviews.allReviews.length
  } : null;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Reviews</h3>
          {stats && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-slate-600 ml-1">
                  {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
                </span>
              </div>
              {stats.googleReviews > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stats.googleReviews} Google
                </Badge>
              )}
              {stats.platformReviews > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {stats.platformReviews} Platform
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {showImportButton && onImportClick && (
          <Button onClick={onImportClick} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Import Google Reviews
          </Button>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({reviews?.totalCount || 0})
            </TabsTrigger>
            {reviews?.googleCount > 0 && (
              <TabsTrigger value="google">
                Google ({reviews.googleCount})
              </TabsTrigger>
            )}
            {reviews?.platformCount > 0 && (
              <TabsTrigger value="platform">
                Platform ({reviews.platformCount})
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-slate-300 rounded-md px-2 py-1"
          >
            <option value="date">Newest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(renderReviewCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h4>
            <p className="text-slate-600 mb-4">
              {activeTab === 'all' 
                ? "This boat doesn't have any reviews yet. Be the first to leave a review!"
                : `No ${activeTab} reviews found.`
              }
            </p>
            {showImportButton && onImportClick && activeTab === 'all' && (
              <Button onClick={onImportClick}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Import Google Reviews
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
