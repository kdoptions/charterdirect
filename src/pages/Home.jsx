import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  Ship, 
  Users, 
  Star,
  MapPin,
  Clock,
  Shield,
  Award,
  ArrowRight,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Boat } from "@/api/entities";

export default function Home() {
  const [searchLocation, setSearchLocation] = React.useState("");
  const [searchDate, setSearchDate] = React.useState("");
  const [availableLocations, setAvailableLocations] = React.useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false);
  const [filteredLocations, setFilteredLocations] = React.useState([]);

  // Fetch available locations from boats
  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const boats = await Boat.filter({ status: "approved" });
        const locations = [...new Set(boats.map(boat => boat.location).filter(Boolean))];
        setAvailableLocations(locations);
        setFilteredLocations(locations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    
    fetchLocations();
  }, []);

  // Handle location input changes
  const handleLocationChange = (value) => {
    setSearchLocation(value);
    
    if (value.trim() === "") {
      setFilteredLocations(availableLocations);
      setShowLocationDropdown(false);
    } else {
      const filtered = availableLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationDropdown(filtered.length > 0);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSearchLocation(location);
    setShowLocationDropdown(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-input-container')) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [featuredBoats, setFeaturedBoats] = React.useState([]);
  const [loadingFeatured, setLoadingFeatured] = React.useState(true);

  // Fetch random featured boats
  React.useEffect(() => {
    const fetchFeaturedBoats = async () => {
      try {
        setLoadingFeatured(true);
        const allBoats = await Boat.filter({ status: "approved" });
        
        // Shuffle and take first 3 boats
        const shuffled = allBoats.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        // Transform to match the expected format
        const transformed = selected.map(boat => ({
          id: boat.id,
          name: boat.name,
          image: boat.images?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
          price: boat.price_per_hour,
          rating: 4.8, // Default rating since we don't have ratings yet
          guests: boat.max_guests,
          location: boat.location
        }));
        
        setFeaturedBoats(transformed);
      } catch (error) {
        console.error("Error fetching featured boats:", error);
        // Fallback to some default boats if there's an error
        setFeaturedBoats([
          {
            id: "fallback-1",
            name: "Luxury Yacht Experience",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
            price: 450,
            rating: 4.9,
            guests: 12,
            location: "Sydney Harbour"
          }
        ]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    
    fetchFeaturedBoats();
  }, []);

  const steps = [
    {
      icon: Search,
      title: "Search",
      description: "Effortlessly explore a wide range of boats and yachts available across Sydney Harbour. Use our search tool to filter by location, type, and amenities."
    },
    {
      icon: CheckCircle,
      title: "Choose",
      description: "Select from verified listings to find the boat that best meets your needs. Each listing features detailed photos and information."
    },
    {
      icon: Calendar,
      title: "Book",
      description: "Reserve your chosen boat securely with our easy booking system. Confirm your dates, make your payment, and receive instant confirmation."
    },
    {
      icon: Ship,
      title: "Cruise",
      description: "Pick up your boat or get picked up and hit the water! Whether it's an exciting new location or a familiar favorite, your adventure is ready to begin."
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 20, 38, 0.4), rgba(30, 64, 175, 0.3)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop')`
          }}
        />
        
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Charter Your Dream
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Sydney Harbour
            </span>
            <span className="block">Experience</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover premium boat rentals for unforgettable harbour cruises, 
            celebrations, and adventures on Australia's most iconic waterway.
          </p>

          {/* Search Bar */}
          <div className="glass-effect rounded-2xl p-6 max-w-4xl mx-auto mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative location-input-container">
                <Input
                  placeholder="Where would you like to explore?"
                  value={searchLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setShowLocationDropdown(filteredLocations.length > 0)}
                  className="h-14 text-lg bg-white/90 border-0 focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-600 pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                
                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-black"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="h-14 text-lg bg-white/90 border-0 focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <Link to={`${createPageUrl("Search")}?location=${encodeURIComponent(searchLocation)}&date=${encodeURIComponent(searchDate)}`}>
                  <Button className="w-full h-14 text-lg luxury-gradient hover:opacity-90 transition-opacity duration-300">
                    <Search className="w-5 h-5 mr-2" />
                    Search Boats
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("Search")}>
              <Button size="lg" className="luxury-gradient text-white hover:opacity-90 transition-opacity duration-300 px-8 py-4 text-lg">
                Explore All Boats
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ListBoat")}>
              <Button size="lg" variant="outline" className="glass-effect text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg">
                List Your Boat
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full floating-animation hidden lg:block" />
        <div className="absolute bottom-40 right-20 w-16 h-16 bg-cyan-300/20 rounded-full floating-animation animation-delay-2s hidden lg:block" />
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-indigo-400/20 rounded-full floating-animation animation-delay-4s hidden lg:block" />
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From discovery to departure, we've streamlined the entire boat charter experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 luxury-gradient rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Boats */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Featured Vessels
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Handpicked premium boats ready for your next harbour adventure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingFeatured ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`loading-${index}`} className="border-0 shadow-lg overflow-hidden">
                  <div className="animate-pulse">
                    <div className="w-full h-64 bg-slate-200" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-200 rounded mb-2" />
                      <div className="h-4 bg-slate-200 rounded mb-4 w-3/4" />
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="text-right">
                          <div className="h-6 bg-slate-200 rounded w-20 mb-1" />
                          <div className="h-3 bg-slate-200 rounded w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              featuredBoats.map((boat) => (
                <Link key={boat.id} to={createPageUrl(`BoatDetails?id=${boat.id}`)}>
                  <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img 
                    src={boat.image} 
                    alt={boat.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 glass-effect rounded-lg px-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{boat.rating}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{boat.name}</h3>
                  <div className="flex items-center text-slate-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{boat.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{boat.guests} guests</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">${boat.price}</div>
                      <div className="text-sm text-slate-500">per hour</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-12 space-y-4">
            <Link to={createPageUrl("Search")}>
              <Button size="lg" className="luxury-gradient text-white hover:opacity-90 transition-opacity duration-300">
                View All Boats
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            {/* Demo Testing Section */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Demo Testing</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to={createPageUrl("BoatDetails?id=4")}>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    🚢 Test Boat Details
                  </Button>
                </Link>
                <Link to={createPageUrl("Booking?id=4")}>
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                    📅 Test Booking Flow
                  </Button>
                </Link>
                <Link to={createPageUrl("OwnerDashboard")}>
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    👨‍💼 Owner Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={async () => {
                    const { Booking, Boat, User } = await import('@/api/entities');
                    
                    // Get all data
                    const allBookings = await Booking.filter();
                    const allBoats = await Boat.filter();
                    const testOwner = await User.loginAsOwner();
                    
                    console.log('🔍 COMPREHENSIVE DEBUG:');
                    console.log('Test Owner:', testOwner);
                    console.log('All Boats:', allBoats);
                    console.log('All Bookings:', allBookings);
                    
                    // Check which boats belong to test owner
                    const ownerBoats = allBoats.filter(boat => boat.owner_id === testOwner.id);
                    console.log('Owner Boats:', ownerBoats);
                    
                    // Check which bookings belong to owner's boats
                    const ownerBookings = allBookings.filter(booking => 
                      ownerBoats.some(boat => boat.id === booking.boat_id)
                    );
                    console.log('Owner Bookings:', ownerBookings);
                    
                    alert(`Debug complete! Owner has ${ownerBoats.length} boats and ${ownerBookings.length} bookings. Check console.`);
                  }}
                >
                  🔍 Debug Bookings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    const { Booking, Boat } = await import('@/api/entities');
                    
                    // First check what boats exist
                    const boats = await Boat.filter();
                    console.log('Available boats:', boats);
                    
                    // Find the test boat first
                    const testBoat = boats.find(boat => boat.owner_id === "test-owner-1");
                    console.log("Test boat found:", testBoat);
                    
                    if (!testBoat) {
                      alert("No test boat found for test-owner-1!");
                      return;
                    }
                    
                    const testBooking = await Booking.create({
                      boat_id: testBoat.id, // Use the actual boat ID
                      customer_id: "test-customer",
                      start_date: "2025-09-19",
                      end_date: "2025-09-19",
                      start_time: "16:00",
                      end_time: "20:00",
                      guests: 6,
                      total_hours: 4,
                      base_price: 380,
                      total_amount: 1520,
                      down_payment: 1520 * (testBoat.down_payment_percentage / 100), // Calculate based on boat's down payment %
                      remaining_balance: 1520 - (1520 * (testBoat.down_payment_percentage / 100)),
                      commission_amount: 1520 * 0.10, // 10% platform fee
                      payment_status: 'deposit_paid', // Mark as deposit paid for testing
                      platform_fee_collected: 1520 * 0.10,
                      customer_name: "Test Customer",
                      customer_email: "test@example.com",
                      customer_phone: "+61 400 123 456",
                      special_requests: "Test booking created via debug button"
                    });
                    console.log('✅ Test booking created:', testBooking);
                    
                    // Verify the booking was stored
                    const allBookings = await Booking.filter();
                    console.log('All bookings after creation:', allBookings);
                    
                    alert(`Test booking created! Boat ID: ${testBooking.boat_id}. Total bookings: ${allBookings.length}`);
                  }}
                >
                  🧪 Create Test Booking
                </Button>
              </div>
              <p className="text-sm text-blue-600 mt-3">
                Use these buttons to test the complete booking and approval workflow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why Choose SydneyCharter
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The premier destination for luxury boat rentals on Sydney Harbour
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Verified & Insured</h3>
              <p className="text-slate-600 leading-relaxed">
                Every boat is thoroughly vetted and all operators maintain proper licensing and comprehensive liability insurance for your peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Booking</h3>
              <p className="text-slate-600 leading-relaxed">
                Book your perfect vessel instantly with our streamlined reservation system. No waiting, no hassles - just smooth sailing ahead.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Fleet</h3>
              <p className="text-slate-600 leading-relaxed">
                From luxury yachts to party pontoons, our curated selection ensures you'll find the perfect vessel for any occasion or celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 luxury-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Set Sail?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've discovered the magic of Sydney Harbour with our premium boat charter service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to={createPageUrl("Search")}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 transition-colors duration-300 px-8 py-4 text-lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ListBoat")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8 py-4 text-lg">
                Earn with Your Boat
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}