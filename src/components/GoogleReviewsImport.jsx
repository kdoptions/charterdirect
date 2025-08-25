import React, { useState } from 'react';
import { googleReviewsService } from '@/api/googleReviewsService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Star, 
  Search, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

export default function GoogleReviewsImport({ boat, onReviewsImported }) {
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [googleApiKey, setGoogleApiKey] = useState('');

  const searchPlaces = async () => {
    // Use environment API key if available, otherwise use user input
    const apiKeyToUse = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || googleApiKey.trim();
    
    if (!apiKeyToUse) {
      setError('Please enter your Google Places API key or configure VITE_GOOGLE_PLACES_API_KEY in your environment');
      return;
    }

    if (!boat.name || !boat.location) {
      setError('Boat name and location are required to search for Google Places');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      console.log('🔍 Searching for Google Places:', boat.name, boat.location);
      
      const places = await googleReviewsService.searchGooglePlaces(
        boat.name, 
        boat.location, 
        apiKeyToUse
      );

      setSearchResults(places);
      console.log('✅ Search results:', places);

      if (places.length === 0) {
        setError('No Google Places found for your business. Try adjusting the business name or location.');
      }

    } catch (error) {
      console.error('❌ Search error:', error);
      setError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const importReviews = async () => {
    if (!selectedPlace) {
      setError('Please select a Google Place first');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📥 Importing reviews for place:', selectedPlace.place_id);
      
      // Use environment API key if available, otherwise use user input
      const apiKeyToUse = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || googleApiKey.trim();
      
      const result = await googleReviewsService.importGoogleReviews(
        boat.id,
        selectedPlace.place_id,
        apiKeyToUse
      );

      console.log('✅ Import result:', result);
      
      setSuccess({
        message: `Successfully imported ${result.importedCount} reviews!`,
        details: result
      });

      // Update boat with Google Place ID
      if (result.success) {
        // You might want to update the boat record with the Google Place ID
        console.log('✅ Reviews imported successfully');
      }

      // Notify parent component
      if (onReviewsImported) {
        onReviewsImported(result);
      }

    } catch (error) {
      console.error('❌ Import error:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const selectPlace = (place) => {
    setSelectedPlace(place);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Import Google Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Import your existing Google Reviews to showcase your boat's reputation. 
            This will help build trust with potential customers.
          </p>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="google-api-key">
              Google Places API Key
              {import.meta.env.VITE_GOOGLE_PLACES_API_KEY && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Environment Configured
                </Badge>
              )}
            </Label>
            <Input
              id="google-api-key"
              type="password"
              placeholder={
                import.meta.env.VITE_GOOGLE_PLACES_API_KEY 
                  ? "Environment API key will be used (optional to override)"
                  : "Enter your Google Places API key"
              }
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              disabled={!!import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
            />
            <p className="text-xs text-slate-500">
              {import.meta.env.VITE_GOOGLE_PLACES_API_KEY 
                ? "API key is configured in environment variables. You can override it above if needed."
                : "You'll need a Google Places API key. Get one from the Google Cloud Console."
              }
              {' '}
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          {/* Search Button */}
          <Button 
            onClick={searchPlaces}
            disabled={isSearching || !googleApiKey.trim()}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search for Your Business
              </>
            )}
          </Button>

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
                {success.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Found Businesses:</h4>
              <div className="space-y-2">
                {searchResults.map((place, index) => (
                  <Card 
                    key={place.place_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPlace?.place_id === place.place_id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => selectPlace(place)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-900">{place.name}</h5>
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {place.address}
                          </p>
                          
                          {place.rating && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${
                                      i < place.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-600">
                                {place.rating} ({place.user_ratings_total} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {place.types?.includes('establishment') && (
                            <Badge variant="outline" className="text-xs">
                              Business
                            </Badge>
                          )}
                          {selectedPlace?.place_id === place.place_id && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Import Button */}
              {selectedPlace && (
                <Button 
                  onClick={importReviews}
                  disabled={isImporting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing Reviews...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import {selectedPlace.user_ratings_total} Reviews
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter your Google Places API key</li>
              <li>• Search for your business on Google</li>
              <li>• Select the correct business listing</li>
              <li>• Import all your Google Reviews</li>
              <li>• Reviews will appear on your boat listing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
