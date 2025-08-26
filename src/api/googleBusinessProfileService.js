import { supabase } from '@/lib/supabase';

export const googleBusinessProfileService = {
  // Google Business Profile API (newer replacement for Google My Business)
  // This API DOES support OAuth for business owners
  
  // OAuth flow for Business Profile
  initiateOAuth: () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/business-profile-callback`;
    const scope = 'https://www.googleapis.com/auth/business.manage';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  },

  // Exchange authorization code for tokens
  exchangeCodeForTokens: async (code) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const redirectUri = `${window.location.origin}/business-profile-callback`;
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    return response.json();
  },

  // Get business owner's profiles
  getBusinessProfiles: async (accessToken) => {
    const response = await fetch('https://businessprofileperformance.googleapis.com/v1/locations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.json();
  },

  // Get reviews for a business profile
  getProfileReviews: async (accessToken, locationId) => {
    const response = await fetch(
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    return response.json();
  },

  // Import reviews using OAuth
  importReviewsWithOAuth: async (boatId, accessToken) => {
    try {
      // Get user's business profiles
      const profiles = await googleBusinessProfileService.getBusinessProfiles(accessToken);
      
      if (!profiles.locations || profiles.locations.length === 0) {
        throw new Error('No business profiles found. Make sure you have a Google Business Profile.');
      }
      
      // For now, use the first profile (could add selection UI later)
      const profile = profiles.locations[0];
      
      // Get reviews for this profile
      const reviewsData = await googleBusinessProfileService.getProfileReviews(accessToken, profile.name);
      
      if (!reviewsData.reviews || reviewsData.reviews.length === 0) {
        throw new Error('No reviews found for this business profile.');
      }
      
      // Transform reviews to our format
      const transformedReviews = reviewsData.reviews.map(review => ({
        boat_id: boatId,
        customer_name: review.reviewer?.displayName || 'Anonymous',
        rating: review.starRating || 5,
        title: review.reviewer?.displayName ? `${review.reviewer.displayName}'s Review` : 'Google Review',
        comment: review.comment || 'No comment provided',
        review_date: review.createTime || new Date().toISOString(),
        source: 'google_oauth',
        google_review_id: review.name,
        google_profile_photo: review.reviewer?.profilePhotoUri || null,
        created_at: new Date().toISOString()
      }));
      
      // Save to database
      const { data: savedReviews, error } = await supabase
        .from('reviews')
        .upsert(transformedReviews, { 
          onConflict: 'google_review_id,boat_id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        importedCount: savedReviews.length,
        totalReviews: reviewsData.reviews.length,
        profileName: profile.title,
        reviews: savedReviews
      };
      
    } catch (error) {
      console.error('Error importing reviews with OAuth:', error);
      throw error;
    }
  }
};

