// Mock entities for local development without Base44 dependencies

// Mock Boat entity with enhanced features
export const Boat = {
  filter: async (params) => {
    // Return mock boat data
    let boats = [
      {
        id: "1",
        name: "Luxury Yacht Adelaide",
        description: "Experience the ultimate luxury on Sydney Harbour with our premium yacht. Perfect for special occasions, corporate events, or romantic getaways.",
        price_per_hour: 450,
        weekend_price: 550,
        max_guests: 12,
        location: "Circular Quay",
        boat_type: "luxury_yacht",
        with_captain: true,
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
        ],
        amenities: ["Full Kitchen", "Bathroom", "Sound System", "Fishing Gear", "Swimming Platform"],
        special_pricing: [],
        availability_blocks: [
          { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
          { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 }
        ],
        google_calendar_id: "primary",
        owner_id: "owner-1",
        down_payment_percentage: 25
      },
      {
        id: "2",
        name: "Sunset Catamaran",
        description: "Enjoy breathtaking sunset views aboard our spacious catamaran. Ideal for larger groups and celebrations.",
        price_per_hour: 320,
        weekend_price: 380,
        max_guests: 20,
        location: "Darling Harbour",
        boat_type: "catamaran",
        with_captain: true,
        images: [
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
        ],
        amenities: ["Bar", "Dance Floor", "BBQ Grill", "Multiple Decks", "Professional Crew"],
        special_pricing: [],
        availability_blocks: [
          { name: "Full Day", start_time: "10:00", end_time: "18:00", duration_hours: 8 }
        ],
        google_calendar_id: "boat-bookings@group.calendar.google.com",
        owner_id: "owner-2",
        down_payment_percentage: 30
      },
      {
        id: "3",
        name: "Party Pontoon",
        description: "The perfect vessel for fun-filled parties and celebrations on the water. Great for birthdays and group events.",
        price_per_hour: 280,
        weekend_price: 320,
        max_guests: 15,
        location: "Rose Bay",
        boat_type: "pontoon",
        with_captain: false,
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
        ],
        amenities: ["Sound System", "Cooler", "Shade Canopy", "Swimming Ladder", "Party Lights"],
        special_pricing: [],
        availability_blocks: [
          { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
          { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 },
          { name: "Evening", start_time: "19:00", end_time: "23:00", duration_hours: 4 }
        ],
        google_calendar_id: "primary",
        owner_id: "owner-3",
        down_payment_percentage: 20
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
        down_payment_percentage: 25
      }
    ];
    
    // Filter by parameters if provided
    if (params) {
      if (params.id) {
        boats = boats.filter(boat => boat.id === params.id);
      }
      if (params.owner_id) {
        boats = boats.filter(boat => boat.owner_id === params.owner_id);
      }
    }
    
    return boats;
  },
  get: async (id) => {
    const boats = await Boat.filter();
    return boats.find(boat => boat.id === id);
  },
  create: async (boatData) => {
    console.log("Mock boat created:", boatData);
    return {
      id: "mock-boat-" + Date.now(),
      ...boatData,
      status: "pending"
    };
  },
  // Get boats owned by a specific user
  getOwnerBoats: async (ownerId) => {
    const boats = await Boat.filter();
    return boats.filter(boat => boat.owner_id === ownerId);
  }
};

// Mock Booking entity with Google Calendar integration
let mockBookings = []; // Store created bookings

export const Booking = {
  create: async (bookingData) => {
    console.log("Mock booking created:", bookingData);
    
    // Simulate Google Calendar integration
    const booking = {
      id: "mock-booking-" + Date.now(),
      ...bookingData,
      status: "pending_approval", // Start with pending approval
      calendar_event_id: null, // Will be created after approval
      owner_notified: false
    };
    
    // Store the booking for retrieval
    mockBookings.push(booking);
    console.log("Booking request created, awaiting owner approval:", booking.id);
    console.log("Total bookings stored:", mockBookings.length);
    
    return booking;
  },
  
  // Get all bookings (for demo purposes)
  filter: async (params) => {
    console.log("Filtering bookings with params:", params);
    let filteredBookings = [...mockBookings];
    
    if (params) {
      if (params.id) {
        filteredBookings = filteredBookings.filter(booking => booking.id === params.id);
      }
      if (params.boat_id) {
        filteredBookings = filteredBookings.filter(booking => booking.boat_id === params.boat_id);
      }
      if (params.customer_id) {
        filteredBookings = filteredBookings.filter(booking => booking.customer_id === params.customer_id);
      }
    }
    
    console.log("Filtered bookings:", filteredBookings);
    return filteredBookings;
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
    console.log("Updating booking:", bookingId, "with data:", updateData);
    
    // Find and update the booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex] = {
        ...mockBookings[bookingIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      console.log("✅ Booking updated successfully:", mockBookings[bookingIndex]);
      return mockBookings[bookingIndex];
    }
    
    console.warn("⚠️ Booking not found for update:", bookingId);
    return null;
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
    // Return null to simulate not logged in
    return null;
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
  }
};