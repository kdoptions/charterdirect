import React, { useState } from 'react';
import { Review } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Star, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function ManualReviewEntry({ boat, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const addReview = () => {
    setReviews([...reviews, {
      id: Date.now(),
      customer_name: '',
      rating: 5,
      title: '',
      comment: '',
      review_date: new Date().toISOString().split('T')[0],
      source: 'platform'
    }]);
  };

  const updateReview = (index, field, value) => {
    const updatedReviews = [...reviews];
    updatedReviews[index] = { ...updatedReviews[index], [field]: value };
    setReviews(updatedReviews);
  };

  const removeReview = (index) => {
    setReviews(reviews.filter((_, i) => i !== index));
  };

  const saveReviews = async () => {
    if (reviews.length === 0) {
      setError('Please add at least one review');
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const savedReviews = [];
      
      for (const review of reviews) {
        if (!review.customer_name.trim() || !review.comment.trim()) {
          continue; // Skip incomplete reviews
        }

        const reviewData = {
          boat_id: boat.id,
          customer_name: review.customer_name.trim(),
          rating: review.rating,
          title: review.title.trim() || `${review.customer_name}'s Review`,
          comment: review.comment.trim(),
          review_date: review.review_date,
          source: 'platform'
        };

        const savedReview = await Review.create(reviewData);
        savedReviews.push(savedReview);
      }

      setSuccess(`Successfully added ${savedReviews.length} reviews!`);
      setReviews([]);
      
      if (onReviewAdded) {
        onReviewAdded(savedReviews);
      }

    } catch (error) {
      console.error('Error saving reviews:', error);
      setError('Failed to save reviews. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const copyFromGoogle = () => {
    // Open Google search in new tab
    const searchQuery = encodeURIComponent(`${boat.name} ${boat.location} reviews`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            <span>Add Reviews Manually</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Add reviews manually by copying them from Google or other sources. 
            This is a quick way to showcase your boat's reputation.
          </p>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={addReview} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
            <Button onClick={copyFromGoogle} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Google Reviews
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Reviews to Add ({reviews.length})</h4>
              
              {reviews.map((review, index) => (
                <Card key={review.id} className="border-2 border-blue-100">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Review {index + 1}</h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeReview(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Customer Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={review.customer_name}
                          onChange={(e) => updateReview(index, 'customer_name', e.target.value)}
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`date-${index}`}>Review Date</Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={review.review_date}
                          onChange={(e) => updateReview(index, 'review_date', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`rating-${index}`}>Rating</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateReview(index, 'rating', star)}
                            className={`p-1 rounded ${
                              star <= review.rating 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                        <span className="text-sm text-slate-600 ml-2">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`title-${index}`}>Review Title (Optional)</Label>
                      <Input
                        id={`title-${index}`}
                        value={review.title}
                        onChange={(e) => updateReview(index, 'title', e.target.value)}
                        placeholder="Amazing experience!"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`comment-${index}`}>Review Comment</Label>
                      <Textarea
                        id={`comment-${index}`}
                        value={review.comment}
                        onChange={(e) => updateReview(index, 'comment', e.target.value)}
                        placeholder="Describe the experience..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                onClick={saveReviews}
                disabled={isAdding}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Reviews...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How to add reviews:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Open Google Reviews" to find your boat's reviews</li>
              <li>2. Copy review details (name, rating, comment, date)</li>
              <li>3. Click "Add Review" to create a new review entry</li>
              <li>4. Fill in the details and click "Save Reviews"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
