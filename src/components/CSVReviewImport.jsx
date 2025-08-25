import React, { useState } from 'react';
import { Review } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText
} from 'lucide-react';

export default function CSVReviewImport({ boat, onReviewsImported }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const downloadTemplate = () => {
    const csvContent = `customer_name,rating,title,comment,review_date
John Smith,5,Amazing experience!,The boat was perfect and the crew was fantastic.,2024-01-15
Sarah Johnson,4,Great day out,Really enjoyed our time on the water.,2024-01-10
Mike Wilson,5,Perfect charter,Everything exceeded our expectations.,2024-01-08`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setPreviewData(null);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = ['customer_name', 'rating', 'comment'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const reviews = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const review = {};
        
        headers.forEach((header, index) => {
          review[header] = values[index] || '';
        });

        // Validate required fields
        if (!review.customer_name || !review.comment) {
          continue; // Skip incomplete rows
        }

        // Set defaults
        review.rating = parseInt(review.rating) || 5;
        review.title = review.title || `${review.customer_name}'s Review`;
        review.review_date = review.review_date || new Date().toISOString().split('T')[0];
        review.source = 'platform';

        reviews.push(review);
      }

      if (reviews.length === 0) {
        throw new Error('No valid reviews found in CSV file');
      }

      setPreviewData(reviews.slice(0, 3)); // Show first 3 reviews as preview
      
      // Ask user to confirm
      const confirmed = window.confirm(
        `Found ${reviews.length} reviews to import. Continue?`
      );

      if (confirmed) {
        await importReviews(reviews);
      }

    } catch (error) {
      console.error('CSV parsing error:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const importReviews = async (reviews) => {
    setIsUploading(true);
    setError(null);

    try {
      const savedReviews = [];
      
      for (const review of reviews) {
        const reviewData = {
          boat_id: boat.id,
          customer_name: review.customer_name.trim(),
          rating: review.rating,
          title: review.title.trim(),
          comment: review.comment.trim(),
          review_date: review.review_date,
          source: 'platform'
        };

        const savedReview = await Review.create(reviewData);
        savedReviews.push(savedReview);
      }

      setSuccess(`Successfully imported ${savedReviews.length} reviews!`);
      setPreviewData(null);
      
      if (onReviewsImported) {
        onReviewsImported(savedReviews);
      }

    } catch (error) {
      console.error('Error importing reviews:', error);
      setError('Failed to import reviews. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <span>Import Reviews from CSV</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a CSV file with your reviews. This is perfect for bulk importing 
            reviews from other platforms or spreadsheets.
          </p>

          {/* Download Template */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h4>
            <p className="text-sm text-blue-800 mb-3">
              Download our CSV template to see the required format.
            </p>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* Upload File */}
          <div className="space-y-2">
            <Label htmlFor="csv-upload">Step 2: Upload CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-slate-500">
              Required columns: customer_name, rating, comment
              Optional columns: title, review_date
            </p>
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

          {/* Preview Data */}
          {previewData && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Preview (First 3 reviews):</h4>
              <div className="space-y-2">
                {previewData.map((review, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    <strong>{review.customer_name}</strong> - {review.rating}⭐ - {review.comment.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isUploading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Processing CSV file...</span>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">CSV Format:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>customer_name</strong> - Required. Customer's name</p>
              <p><strong>rating</strong> - Required. Rating from 1-5</p>
              <p><strong>comment</strong> - Required. Review text</p>
              <p><strong>title</strong> - Optional. Review title</p>
              <p><strong>review_date</strong> - Optional. Date in YYYY-MM-DD format</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
