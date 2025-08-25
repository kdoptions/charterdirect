# Google Reviews Integration Setup Guide

This guide will help you set up the Google Reviews integration for your boat charter platform.

## 🔑 **Google Places API Setup**

### **Step 1: Create Google Cloud Project**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

### **Step 2: Enable Required APIs**

Enable these APIs in your Google Cloud Console:

1. **Places API** (for searching businesses and getting reviews)
2. **Places Details API** (for getting detailed place information)

**To enable APIs:**
- Go to "APIs & Services" > "Library"
- Search for each API and click "Enable"

### **Step 3: Create API Key**

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important:** Restrict the API key to only the Places API for security

**To restrict the API key:**
- Click on the API key you just created
- Under "Application restrictions", select "HTTP referrers" or "IP addresses"
- Under "API restrictions", select "Restrict key" and choose "Places API"

### **Step 4: Configure Environment Variables**

Add these to your `.env` file:

```env
# Google Places API Configuration
VITE_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
VITE_GOOGLE_PLACES_API_VERSION=v1
```

**For production (Vercel):**
- Add these environment variables in your Vercel dashboard
- Go to your project settings > Environment Variables
- Add `VITE_GOOGLE_PLACES_API_KEY` with your API key
- Add `VITE_GOOGLE_PLACES_API_VERSION` with `v1` (or `v2` for the new API)

## 🗄️ **Database Setup**

### **Step 1: Run Database Migration**

Execute this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of setup-reviews-table.sql
```

This will create:
- `reviews` table with support for Google and platform reviews
- Review statistics columns in the `boats` table
- Proper indexes and security policies
- Automatic review statistics triggers

## 🔄 **API Version Differences**

### **Places API v1 (Legacy) - Recommended for now**
- **Endpoint**: `https://maps.googleapis.com/maps/api/place/`
- **Pros**: Stable, well-documented, widely used
- **Cons**: Older API design
- **Cost**: ~$0.017 per request

### **Places API v2 (New) - Future option**
- **Endpoint**: `https://places.googleapis.com/v1/`
- **Pros**: Newer design, better performance, more features
- **Cons**: Less documentation, different response format
- **Cost**: Similar pricing

**Current Setup**: Uses v1 by default, but supports v2 if you set `VITE_GOOGLE_PLACES_API_VERSION=v2`

## 🚀 **Usage Instructions**

### **For Boat Owners:**

1. **Access Reviews Tab**
   - Go to Owner Dashboard
   - Click on the "Reviews" tab

2. **Import Google Reviews**
   - Select a boat from your list
   - Click "Import Google Reviews"
   - Enter your Google Places API key (if not configured in environment)
   - Search for your business
   - Select the correct listing
   - Click "Import Reviews"

3. **View Reviews**
   - Click "View Reviews" to see all reviews
   - Filter by Google vs Platform reviews
   - Sort by date or rating

### **For Customers:**

1. **View Reviews**
   - Go to any boat listing page
   - Scroll down to the "Reviews" section
   - See both Google and platform reviews
   - Filter and sort as needed

## 💰 **Cost Considerations**

### **Google Places API Pricing (as of 2024):**
- **Text Search**: $0.017 per request
- **Place Details**: $0.017 per request
- **Free tier**: $200 credit per month (approximately 11,764 requests)

### **Typical Usage:**
- **Searching for business**: 1 request per search
- **Importing reviews**: 1 request per import (includes all reviews)
- **Monthly cost**: Usually under $5 for most businesses

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"API key not configured"**
   - Check that `VITE_GOOGLE_PLACES_API_KEY` is set in your environment
   - Verify the API key is correct and not restricted too heavily

2. **"No places found"**
   - Try different search terms (business name variations)
   - Check that your business is listed on Google Maps
   - Verify the location is correct

3. **"API quota exceeded"**
   - Check your Google Cloud billing
   - Consider upgrading your quota
   - Implement request caching if needed

4. **"Reviews not importing"**
   - Check that the place has reviews on Google
   - Verify the place_id is correct
   - Check browser console for detailed error messages

### **Debug Mode:**

Enable debug mode in your environment:
```env
VITE_DEBUG_MODE=true
```

This will show detailed console logs for troubleshooting.

## 🔒 **Security Best Practices**

1. **Restrict API Key**
   - Limit to specific domains/IPs
   - Only enable Places API
   - Set up usage alerts

2. **Environment Variables**
   - Never commit API keys to version control
   - Use different keys for development/production
   - Rotate keys regularly

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Monitor API usage
   - Set up billing alerts

## 📊 **Monitoring**

### **Track Usage:**
- Google Cloud Console > APIs & Services > Dashboard
- Monitor request counts and costs
- Set up billing alerts

### **Review Analytics:**
- Track review import success rates
- Monitor review engagement
- Analyze review sentiment (future feature)

## 🎯 **Next Steps**

1. **Set up the database** using the provided SQL
2. **Configure environment variables** with your API key
3. **Test the integration** with a sample boat
4. **Monitor usage** and adjust as needed
5. **Consider upgrading** to API v2 when it becomes more stable

## 📞 **Support**

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key and permissions
3. Test with the Google Places API directly
4. Check the Google Cloud Console for quota issues

The integration is designed to be robust and user-friendly, with comprehensive error handling and fallbacks.
