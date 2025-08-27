import { Boat, Booking } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { format, isFuture, isPast } from "date-fns";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Loader2,
    MapPin,
    MessageSquare,
    Ship,
    Users,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [boats, setBoats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    try {
      // Use Supabase currentUser instead of User.me()
      if (!currentUser) {
        console.error("No current user found");
        return;
      }

      const userData = {
        id: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.user_metadata?.display_name || currentUser.email
      };
      setUser(userData);

      // Load bookings I made as a customer
      const customerBookings = await Booking.filter({ customer_id: currentUser.id }, "-created_date");
      setBookings(customerBookings);

      // Load boat details for each booking
      const boatIds = [...new Set(customerBookings.map(b => b.boat_id))];
      if (boatIds.length > 0) {
        const boatData = await Promise.all(
          boatIds.map(id => Boat.filter({ id }))
        );
        const flatBoats = boatData.flat();
        
        // Try to get owner information for each boat
        const boatsWithOwners = await Promise.all(
          flatBoats.map(async (boat) => {
            if (boat.owner_id) {
              try {
                const { data: ownerData } = await supabase
                  .from('users')
                  .select('email, display_name, full_name')
                  .eq('id', boat.owner_id)
                  .single();
                
                if (ownerData) {
                  return {
                    ...boat,
                    owner_email: ownerData.email,
                    owner_name: ownerData.display_name || ownerData.full_name
                  };
                }
              } catch (error) {
                console.log('Could not get owner info for boat:', boat.id);
              }
            }
            return boat;
          })
        );
        
        setBoats(boatsWithOwners);
      }
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBoatById = (boatId) => {
    return boats.find(boat => boat.id === boatId);
  };

  const handleContactHost = async (boat) => {
    if (!boat) {
      alert('Boat information not available');
      return;
    }

    try {
      // Try to get the boat owner's information
      if (boat.owner_id) {
        const { data: ownerData, error } = await supabase
          .from('users')
          .select('email, display_name, full_name')
          .eq('id', boat.owner_id)
          .single();
        
        if (ownerData && ownerData.email) {
          // Open email client with pre-filled subject and body
          const subject = encodeURIComponent(`Charter Inquiry - ${boat.name}`);
          const body = encodeURIComponent(
            `Hi there,\n\nI have a confirmed booking for ${boat.name} and would like to get in touch.\n\n` +
            `Booking Details:\n` +
            `- Boat: ${boat.name}\n` +
            `- Date: ${new Date().toLocaleDateString()}\n` +
            `- Status: Confirmed\n\n` +
            `Please let me know if you need any additional information from me.\n\n` +
            `Best regards,\n[Your Name]`
          );
          
          window.open(`mailto:${ownerData.email}?subject=${subject}&body=${body}`, '_blank');
        } else {
          // Fallback: show owner email if available in boat data
          if (boat.owner_email) {
            const subject = encodeURIComponent(`Charter Inquiry - ${boat.name}`);
            const body = encodeURIComponent(
              `Hi there,\n\nI have a confirmed booking for ${boat.name} and would like to get in touch.\n\n` +
              `Please let me know if you need any additional information from me.\n\n` +
              `Best regards,\n[Your Name]`
            );
            
            window.open(`mailto:${boat.owner_email}?subject=${subject}&body=${body}`, '_blank');
          } else {
            // No owner email available
            alert('Host contact information is not available. Please contact support for assistance.');
          }
        }
      } else {
        alert('Host contact information is not available. Please contact support for assistance.');
      }
    } catch (error) {
      console.error('Error getting host information:', error);
      alert('Unable to get host contact information. Please try again or contact support.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'fully_paid': return 'bg-green-100 text-green-800';
      case 'deposit_paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterBookings = (filter) => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_date);
      
      switch (filter) {
        case 'upcoming':
          return isFuture(bookingDate) && booking.status !== 'cancelled';
        case 'past':
          return isPast(bookingDate) || booking.status === 'completed';
        case 'pending':
          return booking.status === 'pending';
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
          <p className="text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Error Loading Bookings</h2>
          <p className="text-slate-600">{error}</p>
          <Button onClick={loadMyBookings}>Try Again</Button>
        </div>
      </div>
    );
  }

  const upcomingBookings = filterBookings('upcoming');
  const pastBookings = filterBookings('past');
  const pendingBookings = filterBookings('pending');
  const cancelledBookings = filterBookings('cancelled');

  const BookingCard = ({ booking }) => {
    const boat = getBoatById(booking.boat_id);
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{boat?.name || 'Unknown Boat'}</CardTitle>
              <div className="flex items-center text-slate-600 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{boat?.location}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(booking.status)}
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{format(new Date(booking.start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{booking.start_time} - {booking.end_time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{booking.guests} guests</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>${booking.total_amount}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Payment Status:</span>
            <Badge className={getPaymentStatusColor(booking.payment_status)} variant="outline">
              {booking.payment_status.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Booking Reference */}
          <div className="bg-slate-50 p-3 rounded text-center">
            <span className="text-sm text-slate-600">Booking Reference</span>
            <p className="font-mono font-bold">#{booking.id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Link to={createPageUrl(`BookingConfirmation?id=${booking.id}`)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
            {booking.status === 'confirmed' && (
              <div className="flex-1">
                {boat?.owner_email ? (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleContactHost(boat)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Host
                    </Button>
                    <div className="text-xs text-slate-500 text-center">
                      Host: {boat.owner_name || 'Boat Owner'} ({boat.owner_email})
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleContactHost(boat)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-600 mt-2">Manage your charter bookings and reservations</p>
          </div>
          <Link to={createPageUrl("Search")}>
            <Button className="luxury-gradient text-white">
              <Ship className="w-5 h-5 mr-2" />
              Book Another Charter
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                </div>
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${bookings.reduce((sum, b) => sum + b.total_amount, 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-5">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {bookings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <EmptyState message="No upcoming bookings" />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingBookings.length === 0 ? (
              <EmptyState message="No pending bookings" />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <EmptyState message="No past bookings" />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <EmptyState message="No cancelled bookings" />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {cancelledBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Empty State Component
const EmptyState = ({ message = "No bookings yet" }) => (
  <Card>
    <CardContent className="p-12 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ship className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{message}</h3>
      <p className="text-slate-600 mb-6">
        Discover amazing boats and create unforgettable memories on Sydney Harbour.
      </p>
      <Link to={createPageUrl("Search")}>
        <Button className="luxury-gradient text-white">
          Browse Available Boats
        </Button>
      </Link>
    </CardContent>
  </Card>
);