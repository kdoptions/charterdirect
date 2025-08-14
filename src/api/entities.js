// Mock entities for local development without Base44 dependencies

// Mock Boat entity with Google Calendar integration
let mockBoats = [
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
  filter: async (params) => {
    // Return mock boat data
    let boats = [...mockBoats]; // Use the new mockBoats array
    
    // Filter by parameters if provided
    if (params) {
      if (params.id) {
        boats = boats.filter(boat => boat.id === params.id);
      }
      if (params.owner_id) {
        boats = boats.filter(boat => boat.owner_id === params.owner_id);
      }
      if (params.status) { // Add status filter
        boats = boats.filter(boat => boat.status === params.status);
      }
    }
    
    return boats;
  },
  get: async (id) => {
    const boats = await Boat.filter();
    return boats.find(boat => boat.id === id);
  },
  create: async (boatData) => {
    // Create the boat with a unique ID
    const newBoat = {
      id: "mock-boat-" + Date.now(),
      ...boatData,
      status: "pending"
    };
    
    // Add the boat to our mock data array
    mockBoats.push(newBoat);
    
    return newBoat;
  },
  // Get boats owned by a specific user
  getOwnerBoats: async (ownerId) => {
    const boats = await Boat.filter();
    return boats.filter(boat => boat.owner_id === ownerId);
  },
  
  // Get pending boats for admin review
  getPendingBoats: async () => {
    const boats = await Boat.filter();
    return boats.filter(boat => boat.status === 'pending');
  },
  
  // Get approved boats (live and bookable)
  getApprovedBoats: async () => {
    const boats = await Boat.filter();
    return boats.filter(boat => boat.status === 'approved');
  },
  
  // Update a boat
  update: async (boatId, updateData) => {
    console.log("Updating boat:", boatId, "with data:", updateData);
    
    // Find and update the boat in our mock data
    const boatIndex = mockBoats.findIndex(boat => boat.id === boatId);
    if (boatIndex !== -1) {
      mockBoats[boatIndex] = {
        ...mockBoats[boatIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      // If approving, set approved_at timestamp
      if (updateData.status === 'approved') {
        mockBoats[boatIndex].approved_at = new Date().toISOString();
      }
      
      console.log("✅ Boat updated successfully:", mockBoats[boatIndex]);
      return mockBoats[boatIndex];
    }
    
    console.log("❌ Boat not found:", boatId);
    return null;
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