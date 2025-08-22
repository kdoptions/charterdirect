import { supabase } from '@/lib/supabase';

// Mock data for fallback (will be removed once Supabase is fully working)
export const mockBoats = [
  {
    id: "1",
    name: "Luxury Yacht Experience",
    description: "Experience the ultimate luxury on Sydney Harbour with our premium yacht. Perfect for special occasions, corporate events, or romantic getaways.",
    price_per_hour: 450,
    weekend_price: 550,
    max_guests: 12,
    location: "Darling Harbour",
    boat_type: "yacht",
    with_captain: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    amenities: ["Full Kitchen", "Bathroom", "Sound System", "Fishing Gear", "Swimming Platform", "WiFi"],
    special_pricing: [],
    availability_blocks: [
      { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
      { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 },
      { name: "Evening", start_time: "19:00", end_time: "23:00", duration_hours: 4 }
    ],
    google_calendar_id: "primary",
    owner_id: "owner-1",
    down_payment_percentage: 25,
    balance_payment_days_before: 7,
    payment_schedule_enabled: true,
    status: "approved", // Live and bookable
    stripe_account_id: "acct_test_123456789",
    created_at: "2024-01-15T10:00:00Z",
    approved_at: "2024-01-17T14:30:00Z"
  },
  {
    id: "2",
    name: "Adventure Fishing Charter",
    description: "Professional fishing charter for serious anglers. We provide all equipment and know the best spots around Sydney.",
    price_per_hour: 180,
    weekend_price: 220,
    max_guests: 6,
    location: "Circular Quay",
    boat_type: "fishing",
    with_captain: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    amenities: ["Fishing Equipment", "Bait", "Cooler", "Safety Gear", "GPS Navigation"],
    special_pricing: [],
    availability_blocks: [
      { name: "Early Morning", start_time: "06:00", end_time: "12:00", duration_hours: 6 },
      { name: "Afternoon", start_time: "13:00", end_time: "19:00", duration_hours: 6 }
    ],
    google_calendar_id: "boat-bookings@group.calendar.google.com",
    owner_id: "owner-2",
    down_payment_percentage: 30,
    balance_payment_days_before: 14,
    payment_schedule_enabled: true,
    status: "approved", // Live and bookable
    stripe_account_id: "acct_test_987654321",
    created_at: "2024-01-10T09:00:00Z",
    approved_at: "2024-01-12T11:15:00Z"
  },
  {
    id: "3",
    name: "Family Day Cruiser",
    description: "Perfect family boat for day trips around Sydney Harbour. Safe, comfortable, and fun for all ages.",
    price_per_hour: 120,
    weekend_price: 150,
    max_guests: 8,
    location: "Rose Bay",
    boat_type: "cruiser",
    with_captain: false,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    amenities: ["BBQ Grill", "Swimming Ladder", "Bluetooth Speaker", "Life Jackets", "First Aid Kit"],
    special_pricing: [],
    availability_blocks: [
      { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
      { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 }
    ],
    google_calendar_id: "primary",
    owner_id: "owner-3",
    down_payment_percentage: 20,
    balance_payment_days_before: 3,
    payment_schedule_enabled: true,
    status: "approved", // Live and bookable
    stripe_account_id: "acct_test_456789123",
    created_at: "2024-01-08T08:00:00Z",
    approved_at: "2024-01-10T16:45:00Z"
  },
  {
    id: "4",
    name: "Test Charter Yacht",
    description: "A beautiful test yacht for demonstrating the booking and calendar integration system. Perfect for testing the full workflow from booking to approval.",
    price_per_hour: 380,
    weekend_price: 450,
    max_guests: 10,
    location: "Manly Wharf",
    boat_type: "yacht",
    with_captain: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    amenities: ["Full Kitchen", "Bathroom", "Sound System", "Fishing Gear", "Swimming Platform", "WiFi"],
    special_pricing: [],
    availability_blocks: [
      { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
      { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 },
      { name: "Evening", start_time: "19:00", end_time: "23:00", duration_hours: 4 }
    ],
    google_calendar_id: "test-owner@group.calendar.google.com",
    owner_id: "test-owner-1",
    down_payment_percentage: 25,
    balance_payment_days_before: 7,
    payment_schedule_enabled: true,
    status: "approved", // Live and bookable
    stripe_account_id: "acct_test_789123456",
    created_at: "2024-01-05T07:00:00Z",
    approved_at: "2024-01-07T13:20:00Z"
  },
  // NEW: Pending boats for admin review
  {
    id: "5",
    name: "Sunset Sailing Catamaran",
    description: "Experience the magic of Sydney Harbour at sunset aboard our spacious catamaran. Perfect for romantic evenings and special celebrations.",
    price_per_hour: 280,
    weekend_price: 350,
    max_guests: 15,
    location: "Watsons Bay",
    boat_type: "catamaran",
    with_captain: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
    ],
    amenities: ["Deck Seating", "Wine Cooler", "Bluetooth Sound System", "Safety Equipment", "Sunset Viewing Areas"],
    special_pricing: [],
    availability_blocks: [
      { name: "Sunset Cruise", start_time: "17:00", end_time: "21:00", duration_hours: 4 }
    ],
    google_calendar_id: "primary",
    owner_id: "owner-4",
    down_payment_percentage: 25,
    balance_payment_days_before: 7,
    payment_schedule_enabled: true,
    status: "pending", // Waiting for admin review
    stripe_account_id: null, // Not connected yet
    created_at: "2024-01-20T15:30:00Z",
    approved_at: null,
    owner_name: "Sarah Johnson",
    owner_email: "sarah.johnson@email.com",
    owner_phone: "+61 400 123 456",
    business_name: "Sunset Sailing Co",
    business_type: "sole-trader",
    abn: "12 345 678 901"
  },
  {
    id: "6",
    name: "Corporate Event Pontoon",
    description: "Large pontoon boat perfect for corporate events, team building, and large group celebrations on Sydney Harbour.",
    price_per_hour: 400,
    weekend_price: 500,
    max_guests: 25,
    location: "Pyrmont Bay",
    boat_type: "pontoon",
    with_captain: true,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
    ],
    amenities: ["Conference Table", "Projector Screen", "Catering Kitchen", "Multiple Seating Areas", "Professional Sound System"],
    special_pricing: [],
    availability_blocks: [
      { name: "Business Hours", start_time: "08:00", end_time: "18:00", duration_hours: 8 },
      { name: "Evening Events", start_time: "18:00", end_time: "02:00", duration_hours: 8 }
    ],
    google_calendar_id: "primary",
    owner_id: "owner-5",
    down_payment_percentage: 30,
    balance_payment_days_before: 14,
    payment_schedule_enabled: true,
    status: "pending", // Waiting for admin review
    stripe_account_id: null, // Not connected yet
    created_at: "2024-01-21T10:15:00Z",
    approved_at: null,
    owner_name: "Michael Chen",
    owner_email: "michael.chen@corporateboats.com",
    owner_phone: "+61 400 789 012",
    business_name: "Corporate Boats Australia",
    business_type: "company",
    abn: "98 765 432 109"
  }
];

export const Boat = {
  // Get all boats (for admin dashboard)
  getAllBoats: async () => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching boats from Supabase:', error);
      // Fallback to mock data for now
      return mockBoats;
    }
  },

  // Get pending boats (for admin review)
  getPendingBoats: async () => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending boats from Supabase:', error);
      // Fallback to mock data for now
      return mockBoats.filter(boat => boat.status === 'pending');
    }
  },

  // Get approved boats (live and bookable)
  getApprovedBoats: async () => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approved boats from Supabase:', error);
      // Fallback to mock data for now
      return mockBoats.filter(boat => boat.status === 'approved');
    }
  },

  // Get today's approved boats
  getApprovedToday: async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('status', 'approved')
        .gte('approved_at', startOfDay.toISOString())
        .lte('approved_at', endOfDay.toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today\'s approved boats from Supabase:', error);
      return [];
    }
  },

  // Get today's rejected boats
  getRejectedToday: async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('status', 'rejected')
        .gte('rejected_at', startOfDay.toISOString())
        .lte('rejected_at', endOfDay.toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today\'s rejected boats from Supabase:', error);
      return [];
    }
  },

  // Filter boats with parameters
  filter: async (params) => {
    try {
      let query = supabase
        .from('boats')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (params) {
        if (params.id) {
          query = query.eq('id', params.id);
        }
        if (params.owner_id) {
          query = query.eq('owner_id', params.owner_id);
        }
        if (params.status) {
          query = query.eq('status', params.status);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering boats from Supabase:', error);
      // Fallback to mock data for now
      let boats = [...mockBoats];
      if (params) {
        if (params.id) {
          boats = boats.filter(boat => boat.id === params.id);
        }
        if (params.owner_id) {
          boats = boats.filter(boat => boat.owner_id === params.owner_id);
        }
        if (params.status) {
          boats = boats.filter(boat => boat.status === params.status);
        }
      }
      return boats;
    }
  },

  // Create new boat
  create: async (boatData) => {
    try {
      console.log('🚤 Attempting to create boat in Supabase:', boatData);
      
      const { data, error } = await supabase
        .from('boats')
        .insert([boatData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
      }
      
      console.log('✅ Boat created successfully in Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Boat creation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Don't fall back to mock data - let the error bubble up
      throw new Error(`Failed to create boat: ${error.message}`);
    }
  },

  // Update boat
  update: async (boatId, updateData) => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .update(updateData)
        .eq('id', boatId)
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Boat updated in Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error updating boat in Supabase:', error);
      // Fallback to mock data for now
      const boatIndex = mockBoats.findIndex(b => b.id === boatId);
      if (boatIndex !== -1) {
        mockBoats[boatIndex] = { ...mockBoats[boatIndex], ...updateData };
        return mockBoats[boatIndex];
      }
      throw error;
    }
  },

  // Get boat by ID
  getById: async (boatId) => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('id', boatId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching boat from Supabase:', error);
      // Fallback to mock data for now
      return mockBoats.find(boat => boat.id === boatId);
    }
  }
};

// Mock Booking entity with Google Calendar integration
let mockBookings = [
  // Add some sample bookings for testing
  {
    id: "mock-booking-1",
    boat_id: "1",
    customer_id: "customer-1",
    start_date: "2025-08-25",
    end_date: "2025-08-25",
    start_time: "09:00",
    end_time: "13:00",
    status: "confirmed",
    guests: 4,
    total_amount: 1800,
    created_at: "2025-08-20T10:00:00Z"
  },
  {
    id: "mock-booking-2", 
    boat_id: "2",
    customer_id: "customer-2",
    start_date: "2025-08-26",
    end_date: "2025-08-26",
    start_time: "14:00",
    end_time: "18:00",
    status: "confirmed",
    guests: 6,
    total_amount: 1080,
    created_at: "2025-08-21T11:00:00Z"
  }
]; // Store created bookings

export const Booking = {
  create: async (bookingData) => {
    try {
      console.log("Creating real booking in Supabase:", bookingData);
      
      // Create the booking in Supabase
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create booking in Supabase:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log("✅ Booking created successfully in Supabase:", newBooking);
      
      // Also store in mock array for backward compatibility
      mockBookings.push(newBooking);
      
      return newBooking;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw error;
    }
  },
  
  // Get all bookings (for demo purposes)
  filter: async (params) => {
    try {
      console.log("Filtering bookings from Supabase with params:", params);
      
      // Handle case where params is undefined or null
      if (!params) {
        console.log("⚠️ No params provided, returning all mock bookings");
        return mockBookings;
      }
      
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      
      // Apply filters
      if (params.boat_id) {
        query = query.eq('boat_id', params.boat_id);
      }
      if (params.customer_id) {
        query = query.eq('customer_id', params.customer_id);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.start_date) {
        query = query.gte('start_date', params.start_date);
      }
      if (params.end_date) {
        query = query.lte('end_date', params.end_date);
      }
      
      const { data: bookings, error } = await query;
      
      if (error) {
        console.error("❌ Error fetching bookings from Supabase:", error);
        // Fallback to mock data for now
        console.log("🔄 Falling back to mock data...");
        return mockBookings.filter(booking => {
          if (params.boat_id && booking.boat_id !== params.boat_id) return false;
          if (params.customer_id && booking.customer_id !== params.customer_id) return false;
          if (params.status && booking.status !== params.status) return false;
          return true;
        });
      }
      
      console.log("✅ Bookings fetched from Supabase:", bookings);
      return bookings || [];
    } catch (error) {
      console.error("❌ Error in Booking.filter:", error);
      // Fallback to mock data
      return mockBookings.filter(booking => {
        if (params.boat_id && booking.boat_id !== params.boat_id) return false;
        if (params.customer_id && booking.customer_id !== params.customer_id) return false;
        if (params.status && booking.status !== params.status) return false;
        return true;
      });
    }
  },

  // Enhanced availability check that considers calendar conflicts
  checkAvailabilityWithCalendar: async (boatId, startDate, endDate, startTime, endTime, excludeBookingId = null) => {
    try {
      console.log("🔍 Enhanced availability check for boat:", boatId, "on", startDate, "from", startTime, "to", endTime);
      
      // First, get the boat details to check calendar integration
      const { data: boat, error: boatError } = await supabase
        .from('boats')
        .select('google_calendar_id, calendar_integration_enabled')
        .eq('id', boatId)
        .single();
      
      if (boatError) {
        console.error("❌ Error fetching boat details:", boatError);
        return { available: false, conflicts: [], reason: "Could not fetch boat details" };
      }
      
      // Check availability for THIS SPECIFIC BOAT only
      // Don't check conflicts across other boats using the same calendar
      console.log("📅 Checking availability for specific boat:", boatId);
      
      // Convert date and time to datetime for conflict checking
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
      
      // Check for conflicts on THIS boat only
      let existingBookings = [];
      try {
        const { data, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('boat_id', boatId)
          .eq('status', 'confirmed')
          .gte('start_date', startDate)
          .lte('end_date', endDate);
        
        if (bookingError) {
          console.error("❌ Error checking local availability:", bookingError);
          console.log("⚠️ Falling back to mock data for availability check");
          // Fallback to mock data
          existingBookings = mockBookings.filter(booking => 
            booking.boat_id === boatId && 
            booking.status === 'confirmed' &&
            new Date(booking.start_date) <= new Date(endDate) &&
            new Date(booking.end_date) >= new Date(startDate)
          );
        } else {
          existingBookings = data || [];
        }
      } catch (error) {
        console.error("❌ Supabase query failed, using mock data:", error);
        // Fallback to mock data
        existingBookings = mockBookings.filter(booking => 
          booking.boat_id === boatId && 
          booking.status === 'confirmed' &&
          new Date(booking.start_date) <= new Date(endDate) &&
          new Date(booking.end_date) >= new Date(startDate)
        );
      }
      
      if (existingBookings && existingBookings.length > 0) {
        console.log("❌ Local conflicts found for this boat:", existingBookings);
        return {
          available: false,
          conflicts: existingBookings,
          reason: "This boat is already booked during this time period."
        };
      }
      
      // If calendar integration is enabled, also check Google Calendar for THIS boat
      if (boat.calendar_integration_enabled && boat.google_calendar_id) {
        console.log("📅 Calendar integration enabled, checking Google Calendar for this boat");
        
        // Note: In a real implementation, this would check Google Calendar API
        // for conflicts on this specific boat's calendar events
        // For now, we'll just log that we would check it
        
        console.log("✅ Would check Google Calendar for boat-specific conflicts");
      }
      
      console.log("✅ Availability check passed - no conflicts found for this boat");
      return { available: true, conflicts: [], reason: "Time slot is available for this boat" };
      
    } catch (error) {
      console.error("❌ Error in checkAvailabilityWithCalendar:", error);
      return { available: false, conflicts: [], reason: "Error checking availability" };
    }
  },
  
  // Approve a booking (owner action)
  approve: async (bookingId) => {
    console.log("Booking approved:", bookingId);
    
    // Find and update the booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex] = {
        ...mockBookings[bookingIndex],
        status: "confirmed",
        calendar_event_id: "mock-calendar-event-" + Date.now(),
        approved_at: new Date().toISOString()
      };
    }
    
    return mockBookings[bookingIndex] || {
      id: bookingId,
      status: "confirmed",
      calendar_event_id: "mock-calendar-event-" + Date.now(),
      approved_at: new Date().toISOString()
    };
  },
  
  // Reject a booking (owner action)
  reject: async (bookingId, reason) => {
    console.log("Booking rejected:", bookingId, reason);
    
    // Find and update the booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex] = {
        ...mockBookings[bookingIndex],
        status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      };
    }
    
    return mockBookings[bookingIndex] || {
      id: bookingId,
      status: "rejected",
      rejection_reason: reason,
      rejected_at: new Date().toISOString()
    };
  },
  
  // Update a booking
  update: async (bookingId, updateData) => {
    try {
      console.log("Updating booking in Supabase:", bookingId, "with data:", updateData);
      
      // Update the booking in Supabase
      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to update booking in Supabase:', error);
        throw error;
      }
      
      console.log("✅ Booking updated successfully in Supabase:", updatedBooking);
      
      // Also update in mock array for backward compatibility
      const mockIndex = mockBookings.findIndex(b => b.id === bookingId);
      if (mockIndex !== -1) {
        mockBookings[mockIndex] = { ...mockBookings[mockIndex], ...updateData };
      }
      
      return updatedBooking;
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      throw error;
    }
  },

  // Get bookings for a boat owner
  getOwnerBookings: async (ownerId) => {
    return [
      {
        id: "booking-1",
        boat_name: "Luxury Yacht Adelaide",
        customer_name: "John Smith",
        customer_email: "john@example.com",
        start_date: "2025-09-18T16:00:00Z",
        end_date: "2025-09-18T20:00:00Z",
        total_price: 1800,
        status: "confirmed",
        calendar_event_id: "event-1"
      },
      {
        id: "booking-2", 
        boat_name: "Sunset Catamaran",
        customer_name: "Sarah Johnson",
        customer_email: "sarah@example.com",
        start_date: "2025-09-19T16:00:00Z",
        end_date: "2025-09-19T20:00:00Z",
        total_price: 1920,
        status: "confirmed",
        calendar_event_id: "event-2"
      }
    ];
  }
};

// Mock Review entity
export const Review = {
  create: async (reviewData) => {
    console.log("Mock review created:", reviewData);
    return {
      id: "mock-review-" + Date.now(),
      ...reviewData
    };
  }
};

// Mock CalendarIntegration entity
export const CalendarIntegration = {
  create: async (integrationData) => {
    console.log("Mock calendar integration created:", integrationData);
    return {
      id: "mock-calendar-" + Date.now(),
      ...integrationData
    };
  }
};

// Mock Payment entity
export const Payment = {
  create: async (paymentData) => {
    console.log("Mock payment created:", paymentData);
    return {
      id: "mock-payment-" + Date.now(),
      ...paymentData,
      status: "completed"
    };
  }
};

// Mock User entity for authentication
export const User = {
  me: async () => {
    try {
      // Get current Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return null;
      }
      
      if (!session) {
        console.log('🔍 No active session found');
        return null;
      }
      
      console.log('✅ Active session found for user:', session.user.id);
      
      // Get user data from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        console.error('❌ Error getting user data:', userError);
        // Return basic session user if we can't get full user data
        return {
          id: session.user.id,
          email: session.user.email,
          display_name: session.user.user_metadata?.display_name || session.user.email
        };
      }
      
      return userData;
      
    } catch (error) {
      console.error('❌ Error in User.me():', error);
      return null;
    }
  },
  login: async (credentials) => {
    console.log("Mock login attempt:", credentials);
    return {
      id: "mock-user-1",
      email: credentials.email,
      full_name: "Demo User"
    };
  },
  logout: async () => {
    console.log("Mock logout");
    return true;
  },
  register: async (userData) => {
    console.log("Mock registration:", userData);
    return {
      id: "mock-user-" + Date.now(),
      ...userData
    };
  },
  // Demo login as boat owner
  loginAsOwner: async () => {
    console.log("Logging in as boat owner");
    return {
      id: "test-owner-1",
      email: "owner@harbourlux.com",
      full_name: "Test Boat Owner",
      google_calendar_integration: true,
      calendar_integration_data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        calendar_id: "test-owner@group.calendar.google.com"
      }
    };
  },
  // Demo login as customer
  loginAsCustomer: async () => {
    console.log("Logging in as customer");
    return {
      id: "test-customer-1",
      email: "customer@example.com",
      full_name: "Test Customer"
    };
  },
  
  // Create or get user in Supabase
  createOrGetUser: async (supabaseUser) => {
    try {
      console.log('👤 Creating/getting user in Supabase:', supabaseUser.id);
      
      // First, try to get existing user
      const { data: existingUser, error: getError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (existingUser && !getError) {
        console.log('✅ User already exists in Supabase:', existingUser.id);
        return existingUser;
      }
      
      // User doesn't exist, create them
      const newUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email,
        role: 'user'
      };
      
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create user in Supabase:', createError);
        throw createError;
      }
      
      console.log('✅ User created in Supabase:', createdUser.id);
      return createdUser;
      
    } catch (error) {
      console.error('❌ Error in createOrGetUser:', error);
      throw error;
    }
  }
};