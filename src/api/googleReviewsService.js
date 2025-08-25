import { supabase } from '@/lib/supabase';

// Get API configuration from environment
const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const apiVersion = import.meta.env.VITE_GOOGLE_PLACES_API_VERSION || 'v1';
  
  if (!apiKey) {
    throw new Error('Google Places API key not configured. Please set VITE_GOOGLE_PLACES_API_KEY in your environment variables.');
  }
  
  return { apiKey, apiVersion };
};

export const googleReviewsService = {
  // Fetch reviews from Google Places API
  fetchGoogleReviews: async (placeId, customApiKey = null) => {
    try {
      console.log('🔍 Fetching Google Reviews for place:', placeId);
      
      const { apiKey, apiVersion } = getApiConfig();
      const keyToUse = customApiKey || apiKey;
      
      let placeDetailsUrl;
      let placeData;
      
      if (apiVersion === 'v2') {
        // New Places API v2
        placeDetailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,userRatingCount,reviews&key=${keyToUse}`;
        
        const placeResponse = await fetch(placeDetailsUrl, {
          headers: {
            'X-Goog-Api-Key': keyToUse,
            'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews'
          }
        });
        
        if (!placeResponse.ok) {
          const errorData = await placeResponse.json();
          throw new Error(`Google Places API v2 error: ${placeResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        placeData = await placeResponse.json();
        
        // Transform v2 response to match v1 format
        return {
          placeId,
          placeName: placeData.displayName?.text || 'Unknown Place',
          overallRating: placeData.rating || 0,
          totalReviews: placeData.userRatingCount || 0,
          reviews: placeData.reviews || []
        };
        
      } else {
        // Legacy Places API v1
        placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${keyToUse}`;
        
        const placeResponse = await fetch(placeDetailsUrl);
        placeData = await placeResponse.json();
        
        if (placeData.status !== 'OK') {
          throw new Error(`Google Places API v1 error: ${placeData.status} - ${placeData.error_message || 'Unknown error'}`);
        }
        
        const place = placeData.result;
        console.log('✅ Place details fetched:', {
          name: place.name,
          rating: place.rating,
          totalReviews: place.user_ratings_total,
          reviewsCount: place.reviews?.length || 0
        });
        
        return {
          placeId,
          placeName: place.name,
          overallRating: place.rating,
          totalReviews: place.user_ratings_total,
          reviews: place.reviews || []
        };
      }
      
    } catch (error) {
      console.error('❌ Error fetching Google Reviews:', error);
      throw error;
    }
  },
  
  // Import Google Reviews to our database
  importGoogleReviews: async (boatId, placeId, apiKey) => {
    try {
      console.log('📥 Importing Google Reviews for boat:', boatId, 'place:', placeId);
      
      // Fetch reviews from Google
      const googleData = await googleReviewsService.fetchGoogleReviews(placeId, apiKey);
      
      // Transform Google reviews to our format
      const transformedReviews = googleData.reviews.map(review => ({
        boat_id: boatId,
        google_review_id: review.time?.toString() || Date.now().toString(),
        customer_name: review.author_name || 'Anonymous',
        rating: review.rating || 5,
        title: review.author_name ? `${review.author_name}'s Review` : 'Google Review',
        comment: review.text || 'No comment provided',
        review_date: new Date(review.time * 1000).toISOString(),
        source: 'google',
        google_place_id: placeId,
        google_author_url: review.author_url || null,
        google_profile_photo: review.profile_photo_url || null,
        google_relative_time: review.relative_time_description || null,
        language: review.language || 'en',
        created_at: new Date().toISOString()
      }));
      
      console.log('🔄 Transformed reviews:', transformedReviews.length);
      
      // Save to database
      const { data: savedReviews, error } = await supabase
        .from('reviews')
        .upsert(transformedReviews, { 
          onConflict: 'google_review_id,boat_id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error('❌ Error saving reviews to database:', error);
        throw error;
      }
      
      console.log('✅ Reviews imported successfully:', savedReviews.length);
      
      return {
        success: true,
        importedCount: savedReviews.length,
        totalReviews: googleData.totalReviews,
        overallRating: googleData.overallRating,
        placeName: googleData.placeName,
        reviews: savedReviews
      };
      
    } catch (error) {
      console.error('❌ Error importing Google Reviews:', error);
      throw error;
    }
  },
  
  // Get reviews for a boat (both Google and platform reviews)
  getBoatReviews: async (boatId) => {
    try {
      console.log('📖 Fetching reviews for boat:', boatId);
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('boat_id', boatId)
        .order('review_date', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching reviews:', error);
        throw error;
      }
      
      console.log('✅ Reviews fetched:', reviews.length);
      
      // Separate Google and platform reviews
      const googleReviews = reviews.filter(r => r.source === 'google');
      const platformReviews = reviews.filter(r => r.source === 'platform');
      
      return {
        allReviews: reviews,
        googleReviews,
        platformReviews,
        totalCount: reviews.length,
        googleCount: googleReviews.length,
        platformCount: platformReviews.length
      };
      
    } catch (error) {
      console.error('❌ Error getting boat reviews:', error);
      throw error;
    }
  },
  
  // Create a platform review (from our booking system)
  createPlatformReview: async (reviewData) => {
    try {
      console.log('📝 Creating platform review:', reviewData);
      
      const review = {
        ...reviewData,
        source: 'platform',
        created_at: new Date().toISOString()
      };
      
      const { data: savedReview, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating platform review:', error);
        throw error;
      }
      
      console.log('✅ Platform review created:', savedReview);
      return savedReview;
      
    } catch (error) {
      console.error('❌ Error creating platform review:', error);
      throw error;
    }
  },
  
  // Update review statistics for a boat
  updateBoatReviewStats: async (boatId) => {
    try {
      console.log('📊 Updating review stats for boat:', boatId);
      
      // Get all reviews for the boat
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, source')
        .eq('boat_id', boatId);
      
      if (error) {
        console.error('❌ Error fetching reviews for stats:', error);
        throw error;
      }
      
      // Calculate statistics
      const totalReviews = reviews.length;
      const googleReviews = reviews.filter(r => r.source === 'google');
      const platformReviews = reviews.filter(r => r.source === 'platform');
      
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      const googleAverageRating = googleReviews.length > 0
        ? googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length
        : 0;
      
      const platformAverageRating = platformReviews.length > 0
        ? platformReviews.reduce((sum, r) => sum + r.rating, 0) / platformReviews.length
        : 0;
      
      const stats = {
        total_reviews: totalReviews,
        google_reviews: googleReviews.length,
        platform_reviews: platformReviews.length,
        average_rating: Math.round(averageRating * 10) / 10,
        google_average_rating: Math.round(googleAverageRating * 10) / 10,
        platform_average_rating: Math.round(platformAverageRating * 10) / 10,
        last_updated: new Date().toISOString()
      };
      
      console.log('📊 Calculated stats:', stats);
      
      // Update boat with review statistics
      const { error: updateError } = await supabase
        .from('boats')
        .update({ review_stats: stats })
        .eq('id', boatId);
      
      if (updateError) {
        console.error('❌ Error updating boat review stats:', updateError);
        throw updateError;
      }
      
      console.log('✅ Boat review stats updated');
      return stats;
      
    } catch (error) {
      console.error('❌ Error updating review stats:', error);
      throw error;
    }
  },
  
  // Search for Google Places by business name and location
  searchGooglePlaces: async (businessName, location, customApiKey = null) => {
    try {
      console.log('🔍 Searching Google Places for:', businessName, 'in', location);
      
      const { apiKey, apiVersion } = getApiConfig();
      const keyToUse = customApiKey || apiKey;
      
      let places;
      
      if (apiVersion === 'v2') {
        // New Places API v2
        const searchQuery = `${businessName} ${location}`;
        const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
        
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': keyToUse,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.photos'
          },
          body: JSON.stringify({
            textQuery: searchQuery,
            maxResultCount: 10
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Google Places API v2 error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        places = data.places?.map(place => ({
          place_id: place.id,
          name: place.displayName?.text || 'Unknown Place',
          address: place.formattedAddress || 'No address',
          rating: place.rating || 0,
          user_ratings_total: place.userRatingCount || 0,
          types: place.types || [],
          photos: place.photos?.slice(0, 3) || []
        })) || [];
        
      } else {
        // Legacy Places API v1
        const searchQuery = `${businessName} ${location}`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=establishment&key=${keyToUse}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.status !== 'OK') {
          throw new Error(`Google Places Search API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
        
        places = data.results.map(place => ({
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          types: place.types,
          photos: place.photos?.slice(0, 3) || []
        }));
      }
      
      console.log('✅ Found places:', places.length);
      return places;
      
    } catch (error) {
      console.error('❌ Error searching Google Places:', error);
      throw error;
    }
  }
};
