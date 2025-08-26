// Test Calendar Integration Setup
// Run this in your browser console to verify the setup
// Note: This test assumes the following variables are available in global scope:
// - realGoogleCalendarService (from @/api/realGoogleCalendarService)
// - googleCalendarService (from @/api/googleCalendarService) 
// - supabase (from @/lib/supabase)

console.log('🧪 Testing Harbour Lux Calendar Integration...');

// Test 1: Check Environment Variables
console.log('\n📋 Environment Variables Check:');
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('VITE_GOOGLE_CLIENT_SECRET:', import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('VITE_GOOGLE_REDIRECT_URI:', import.meta.env.VITE_GOOGLE_REDIRECT_URI ? '✅ Set' : '❌ Missing');

// Test 2: Check if Google Calendar Service is available
console.log('\n🔧 Service Availability Check:');
try {
  // Check if the real Google Calendar service is imported
  if (typeof realGoogleCalendarService !== 'undefined') {
    console.log('✅ Real Google Calendar Service: Available');
    console.log('   - Client ID:', realGoogleCalendarService.clientId ? '✅ Set' : '❌ Missing');
    console.log('   - Redirect URI:', realGoogleCalendarService.redirectUri ? '✅ Set' : '❌ Missing');
  } else {
    console.log('❌ Real Google Calendar Service: Not imported');
  }
  
  // Check if the mock service is available
  if (typeof googleCalendarService !== 'undefined') {
    console.log('✅ Mock Google Calendar Service: Available');
  } else {
    console.log('❌ Mock Google Calendar Service: Not imported');
  }
} catch (error) {
  console.log('❌ Service check failed:', error.message);
}

// Test 3: Check Supabase Connection
console.log('\n🗄️ Supabase Connection Check:');
try {
  if (typeof supabase !== 'undefined') {
    console.log('✅ Supabase client: Available');
    console.log('   - URL:', supabase.supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   - Anon Key:', supabase.supabaseKey ? '✅ Set' : '❌ Missing');
  } else {
    console.log('❌ Supabase client: Not available');
  }
} catch (error) {
  console.log('❌ Supabase check failed:', error.message);
}

// Test 4: Check Current User Calendar Integration
console.log('\n👤 Current User Calendar Integration Check:');
async function checkUserIntegration() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
      
      // Get user profile with calendar integration details
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('google_integration_active, google_calendar_id, google_refresh_token')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.log('❌ Failed to get user profile:', error.message);
      } else {
        console.log('📅 Calendar Integration Status:');
        console.log('   - Integration Active:', userProfile.google_integration_active ? '✅ Yes' : '❌ No');
        console.log('   - Calendar ID:', userProfile.google_calendar_id || '❌ Not set');
        console.log('   - Refresh Token:', userProfile.google_refresh_token ? '✅ Present' : '❌ Missing');
      }
    } else {
      console.log('❌ No user authenticated');
    }
  } catch (error) {
    console.log('❌ User integration check failed:', error.message);
  }
}

// Test 5: Check Boat Calendar Integration
console.log('\n🚢 Boat Calendar Integration Check:');
async function checkBoatIntegration() {
  try {
    // Get boats owned by current user
    const { data: boats, error } = await supabase
      .from('boats')
      .select('id, name, calendar_integration_enabled, google_calendar_id')
      .eq('owner_id', (await supabase.auth.getUser()).data.user?.id);
    
    if (error) {
      console.log('❌ Failed to get boats:', error.message);
    } else if (boats && boats.length > 0) {
      console.log('📅 Boat Calendar Integration Status:');
      boats.forEach(boat => {
        console.log(`   🚢 ${boat.name}:`);
        console.log(`      - Integration Enabled: ${boat.calendar_integration_enabled ? '✅ Yes' : '❌ No'}`);
        console.log(`      - Calendar ID: ${boat.google_calendar_id || '❌ Not set'}`);
      });
    } else {
      console.log('❌ No boats found for current user');
    }
  } catch (error) {
    console.log('❌ Boat integration check failed:', error.message);
  }
}

// Test 6: Check Recent Bookings
console.log('\n📋 Recent Bookings Check:');
async function checkRecentBookings() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, customer_name, status, google_calendar_event_id, calendar_event_created')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Failed to get bookings:', error.message);
    } else if (bookings && bookings.length > 0) {
      console.log('📅 Recent Bookings Calendar Status:');
      bookings.forEach(booking => {
        console.log(`   📋 ${booking.customer_name} (${booking.status}):`);
        console.log(`      - Calendar Event ID: ${booking.google_calendar_event_id || '❌ Not created'}`);
        console.log(`      - Event Created Flag: ${booking.calendar_event_created ? '✅ Yes' : '❌ No'}`);
      });
    } else {
      console.log('❌ No bookings found');
    }
  } catch (error) {
    console.log('❌ Bookings check failed:', error.message);
  }
}

// Run all checks
console.log('\n🚀 Running Integration Checks...');
checkUserIntegration();
checkBoatIntegration();
checkRecentBookings();

// Test 7: Manual Calendar Event Creation Test
console.log('\n🧪 Manual Calendar Event Creation Test:');
async function testCalendarEventCreation() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No user authenticated - cannot test calendar creation');
      return;
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('google_integration_active, google_calendar_id, google_refresh_token')
      .eq('id', user.id)
      .single();
    
    if (!userProfile?.google_integration_active || !userProfile?.google_calendar_id) {
      console.log('❌ User does not have calendar integration enabled');
      return;
    }
    
    console.log('✅ User has calendar integration - testing event creation...');
    
    // Test with mock booking data
    const testBookingData = {
      customer_name: 'Test Customer',
      guests: 4,
      customer_email: 'test@example.com',
      customer_phone: '123-456-7890',
      start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // Tomorrow + 4 hours
      special_requests: 'Test booking for calendar integration'
    };
    
    console.log('📅 Test booking data:', testBookingData);
    
    // Try to create a calendar event
    if (typeof realGoogleCalendarService !== 'undefined') {
      try {
        // Get fresh access token
        const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(userProfile.google_refresh_token);
        
        // Create event
        const result = await realGoogleCalendarService.createBookingEvent(
          userProfile.google_calendar_id,
          testBookingData,
          freshTokenData.access_token
        );
        
        if (result.success) {
          console.log('✅ Test calendar event created successfully!');
          console.log('   - Event ID:', result.eventId);
          console.log('   - Event Link:', result.eventLink);
        } else {
          console.log('❌ Test calendar event creation failed:', result.error);
        }
      } catch (error) {
        console.log('❌ Calendar event creation test failed:', error.message);
      }
    } else {
      console.log('❌ Real Google Calendar Service not available for testing');
    }
    
  } catch (error) {
    console.log('❌ Calendar event creation test failed:', error.message);
  }
}

// Run the manual test after a delay to allow other checks to complete
setTimeout(testCalendarEventCreation, 2000);

console.log('\n🎯 Test Complete! Check the results above and fix any issues found.');
console.log('📖 Refer to CALENDAR_INTEGRATION_FIX.md for detailed troubleshooting steps.');
