import React, { useState, useEffect } from "react";
import { Boat } from "@/api/entities";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Eye, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyBoats() {
  const { currentUser } = useAuth();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadMyBoats();
    }
  }, [currentUser]);

  const loadMyBoats = async () => {
    try {
      // Use Firebase user ID (uid) instead of old User.me()
      const myBoats = await Boat.filter({ owner_id: currentUser.uid }, "-created_date");
      setBoats(myBoats);
    } catch (error) {
      console.error("Error loading boats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTestBoat = async () => {
    try {
      const testBoatData = {
        name: `Test Boat ${Date.now()}`,
        description: "This is a test boat for testing the admin approval system. It will have pending status until approved by an admin.",
        price_per_hour: Math.floor(Math.random() * 200) + 100,
        weekend_price: Math.floor(Math.random() * 250) + 150,
        max_guests: Math.floor(Math.random() * 10) + 5,
        location: "Sydney Harbour",
        boat_type: "yacht",
        with_captain: true,
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
        ],
        amenities: ["Test Amenity 1", "Test Amenity 2"],
        availability_blocks: [
          { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 }
        ],
        special_pricing: [],
        down_payment_percentage: 25,
        balance_payment_days_before: 7,
        payment_schedule_enabled: true,
        terms_and_conditions: "Test terms and conditions",
        cancellation_policy: "Test cancellation policy",
        owner_id: currentUser.uid,
        owner_email: currentUser.email,
        owner_name: currentUser.displayName || currentUser.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await Boat.create(testBoatData);
      
      // Reload boats to show the new test boat
      await loadMyBoats();
      
      console.log("✅ Test boat created successfully:", testBoatData);
    } catch (error) {
      console.error("❌ Error creating test boat:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'suspended': return <Pause className="w-5 h-5 text-orange-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading your boats...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Please sign in</h2>
          <p className="text-slate-600">You need to be signed in to view your boats.</p>
          <Link to="/auth">
            <Button className="luxury-gradient text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Boats</h1>
            <p className="text-slate-600 mt-2">Manage your boat listings and bookings</p>
          </div>
          <div className="flex gap-3">
            {/* Test Boat Button - Remove in production */}
            <Button 
              variant="outline" 
              onClick={createTestBoat}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              🧪 Create Test Boat
            </Button>
            
            <Link to={createPageUrl("ListBoat")}>
              <Button className="luxury-gradient text-white">
                <Plus className="w-5 h-5 mr-2" />
                Add New Boat
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Boats</p>
                  <p className="text-2xl font-bold text-slate-900">{boats.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {boats.filter(b => b.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {boats.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {boats.reduce((sum, boat) => sum + (boat.total_bookings || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boats List */}
        {boats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No boats listed yet</h3>
              <p className="text-slate-600 mb-6">Start earning by listing your first boat on our platform.</p>
              <Link to={createPageUrl("ListBoat")}>
                <Button className="luxury-gradient text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  List Your First Boat
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {boats.map((boat) => (
              <Card key={boat.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={boat.images?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop"} 
                    alt={boat.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getStatusColor(boat.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(boat.status)}
                        <span className="capitalize">{boat.status}</span>
                      </div>
                    </Badge>
                  </div>
                  {boat.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{boat.name}</CardTitle>
                  <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{boat.location}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{boat.max_guests} guests</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                      <span>${boat.price_per_hour}/hr</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{boat.rating || "New"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{boat.total_bookings || 0} bookings</span>
                    </div>
                  </div>

                  {boat.status === 'rejected' && boat.rejection_reason && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Rejected:</strong> {boat.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Link to={createPageUrl(`BoatDetails?id=${boat.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}