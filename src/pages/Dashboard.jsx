import React, { useState, useEffect } from "react";
import { Booking, Boat, User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ship,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  BarChart3,
  Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [myBoats, setMyBoats] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBoats: 0,
    totalCustomerBookings: 0,
    totalOwnerBookings: 0,
    totalEarnings: 0,
    pendingBookings: 0,
    thisMonthEarnings: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

      // Load boats I own
      const boatsOwned = await Boat.filter({ owner_id: currentUser.id }, "-created_date");
      setMyBoats(boatsOwned);

      // Load bookings I made as a customer
      const customerBookings = await Booking.filter({ customer_id: currentUser.id }, "-created_date");
      setMyBookings(customerBookings);

      // Load bookings for boats I own
      const boatIds = boatsOwned.map(boat => boat.id);
      let ownerBookingData = [];
      
      if (boatIds.length > 0) {
        // Get all bookings for my boats
        const allBookings = await Booking.list("-created_date", 100);
        ownerBookingData = allBookings.filter(booking => boatIds.includes(booking.boat_id));
      }
      setOwnerBookings(ownerBookingData);

      // Calculate stats
      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const thisMonthOwnerBookings = ownerBookingData.filter(booking => 
        isWithinInterval(new Date(booking.created_date), { start: monthStart, end: monthEnd })
      );

      const pendingOwnerBookings = ownerBookingData.filter(b => b.status === 'pending');
      const totalOwnerEarnings = ownerBookingData
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount - b.commission_amount), 0);
      
      const thisMonthEarnings = thisMonthOwnerBookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount - b.commission_amount), 0);

      setStats({
        totalBoats: boatsOwned.length,
        totalCustomerBookings: customerBookings.length,
        totalOwnerBookings: ownerBookingData.length,
        totalEarnings: totalOwnerEarnings,
        pendingBookings: pendingOwnerBookings.length,
        thisMonthEarnings
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = () => {
    const allActivity = [
      ...myBookings.map(b => ({ ...b, type: 'customer_booking' })),
      ...ownerBookings.map(b => ({ ...b, type: 'owner_booking' }))
    ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    return allActivity.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Please Sign In</h2>
          <p className="text-slate-600">You need to be signed in to view your dashboard.</p>
          <Button onClick={() => User.login()} className="luxury-gradient text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.displayName || user.email}!
          </h1>
          <p className="text-slate-600 mt-2">
            Here's an overview of your bookings and boat listings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Boats</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalBoats}</p>
                </div>
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCustomerBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings ({stats.totalCustomerBookings})</TabsTrigger>
            <TabsTrigger value="my-boats">My Boats ({stats.totalBoats})</TabsTrigger>
            <TabsTrigger value="boat-bookings">Boat Bookings ({stats.totalOwnerBookings})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Earnings</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${stats.thisMonthEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">New Bookings</span>
                    <span className="text-xl font-semibold">
                      {ownerBookings.filter(b => 
                        isWithinInterval(new Date(b.created_date), { 
                          start: startOfMonth(new Date()), 
                          end: endOfMonth(new Date()) 
                        })
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending Approvals</span>
                    <span className="text-xl font-semibold text-yellow-600">
                      {stats.pendingBookings}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRecentActivity().length > 0 ? (
                      getRecentActivity().map((activity, index) => {
                        const boat = myBoats.find(b => b.id === activity.boat_id);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.type === 'customer_booking' ? 'bg-blue-500' : 'bg-green-500'
                              }`} />
                              <div>
                                <p className="font-medium">
                                  {activity.type === 'customer_booking' 
                                    ? 'You booked a charter' 
                                    : 'New booking received'
                                  }
                                </p>
                                <p className="text-sm text-slate-500">
                                  {boat?.name || 'Unknown Boat'} • {format(new Date(activity.created_date), 'MMM d')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={activity.status === 'confirmed' ? 'default' : 'secondary'}>
                              {activity.status}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Link to={createPageUrl("Search")}>
                    <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                      <Calendar className="w-6 h-6" />
                      <span>Book a Charter</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl("ListBoat")}>
                    <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                      <Plus className="w-6 h-6" />
                      <span>List Your Boat</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl("MyBookings")}>
                    <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                      <Eye className="w-6 h-6" />
                      <span>View Bookings</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl("MyBoats")}>
                    <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                      <Ship className="w-6 h-6" />
                      <span>Manage Boats</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="my-bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Charter Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings.length > 0 ? (
                  <div className="space-y-4">
                    {myBookings.slice(0, 5).map(booking => {
                      const boat = myBoats.find(b => b.id === booking.boat_id);
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{boat?.name || 'Unknown Boat'}</h4>
                            <p className="text-sm text-slate-600">
                              {format(new Date(booking.start_date), 'MMM d, yyyy')} • 
                              {booking.start_time} - {booking.end_time}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge>{booking.status}</Badge>
                            <p className="text-sm text-slate-600 mt-1">${booking.total_amount}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No bookings yet</p>
                )}
                <div className="mt-4 text-center">
                  <Link to={createPageUrl("MyBookings")}>
                    <Button variant="outline">View All Bookings</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Boats Tab */}
          <TabsContent value="my-boats">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Boat Listings</CardTitle>
                  <Link to={createPageUrl("ListBoat")}>
                    <Button className="luxury-gradient text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Boat
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {myBoats.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {myBoats.map(boat => (
                      <div key={boat.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{boat.name}</h4>
                          <Badge variant={boat.status === 'approved' ? 'default' : 'secondary'}>
                            {boat.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{boat.location}</p>
                        <div className="flex justify-between text-sm">
                          <span>${boat.price_per_hour}/hr</span>
                          <span>{boat.total_bookings || 0} bookings</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No boats listed yet</p>
                )}
                <div className="mt-4 text-center">
                  <Link to={createPageUrl("MyBoats")}>
                    <Button variant="outline">Manage All Boats</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boat Bookings Tab */}
          <TabsContent value="boat-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Bookings for My Boats</CardTitle>
              </CardHeader>
              <CardContent>
                {ownerBookings.length > 0 ? (
                  <div className="space-y-4">
                    {ownerBookings.slice(0, 5).map(booking => {
                      const boat = myBoats.find(b => b.id === booking.boat_id);
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{boat?.name}</h4>
                            <p className="text-sm text-slate-600">
                              {booking.customer_name} • {booking.guests} guests
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(booking.start_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge>{booking.status}</Badge>
                            <p className="text-sm text-slate-600 mt-1">
                              ${(booking.total_amount - booking.commission_amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No bookings for your boats yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}