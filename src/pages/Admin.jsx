import React, { useState, useEffect } from "react";
import { Boat, User, Booking } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Pause, 
  Clock, 
  Eye,
  Search,
  Users,
  Ship,
  Calendar,
  DollarSign,
  AlertTriangle,
  Star,
  MapPin,
  Filter,
  MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Admin() {
  const [boats, setBoats] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', boat: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = '/';
        return;
      }
      
      await loadData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [boatsData, usersData, bookingsData] = await Promise.all([
        Boat.list("-created_date"),
        User.list("-created_date"),
        Booking.list("-created_date", 50)
      ]);
      
      setBoats(boatsData);
      setUsers(usersData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const handleBoatAction = async (action, boat, reason = '') => {
    try {
      let updateData = { status: action };
      
      if (action === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      } else if (action === 'approved') {
        updateData.rejection_reason = '';
      }
      
      await Boat.update(boat.id, updateData);
      
      // Refresh data
      await loadData();
      
      setActionDialog({ open: false, type: '', boat: null });
      setRejectionReason('');
    } catch (error) {
      console.error("Error updating boat status:", error);
    }
  };

  const openActionDialog = (type, boat) => {
    setActionDialog({ open: true, type, boat });
    setRejectionReason('');
  };

  const filteredBoats = boats.filter(boat => {
    const matchesSearch = boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         boat.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || boat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      total: boats.length,
      pending: boats.filter(b => b.status === 'pending').length,
      approved: boats.filter(b => b.status === 'approved').length,
      rejected: boats.filter(b => b.status === 'rejected').length,
      suspended: boats.filter(b => b.status === 'suspended').length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-2">Manage boats, users, and platform operations</p>
        </div>

        <Tabs defaultValue="boats" className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-4">
            <TabsTrigger value="boats">Boat Listings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Boats Tab */}
          <TabsContent value="boats" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Boats</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Ship className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Suspended</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.suspended}</p>
                    </div>
                    <Pause className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search boats by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Boats List */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBoats.map((boat) => (
                <Card key={boat.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={boat.images?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop"} 
                      alt={boat.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`
                        ${boat.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${boat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${boat.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${boat.status === 'suspended' ? 'bg-orange-100 text-orange-800' : ''}
                      `}>
                        {boat.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{boat.name}</CardTitle>
                        <div className="flex items-center text-slate-600 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{boat.location}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedBoat(boat)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {boat.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => openActionDialog('approved', boat)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openActionDialog('rejected', boat)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {boat.status === 'approved' && (
                            <DropdownMenuItem onClick={() => openActionDialog('suspended', boat)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {boat.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => openActionDialog('approved', boat)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
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
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <strong>Rejection reason:</strong> {boat.rejection_reason}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    <p className="text-slate-600">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                    <p className="text-slate-600">Admins</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {boats.filter(b => b.status === 'approved').length}
                    </p>
                    <p className="text-slate-600">Active Hosts</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Joined</th>
                        <th className="text-left p-4">Boats Listed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 20).map((user) => (
                        <tr key={user.id} className="border-b hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.full_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{user.email}</td>
                          <td className="p-4">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600">
                            {new Date(user.created_date).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-600">
                            {boats.filter(b => b.owner_id === user.id).length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                    <p className="text-slate-600">Total Bookings</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                    <p className="text-slate-600">Confirmed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookings.filter(b => b.status === 'pending').length}
                    </p>
                    <p className="text-slate-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ${bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toFixed(0)}
                    </p>
                    <p className="text-slate-600">Revenue</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bookings yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Booking ID</th>
                          <th className="text-left p-4">Customer</th>
                          <th className="text-left p-4">Boat</th>
                          <th className="text-left p-4">Date</th>
                          <th className="text-left p-4">Amount</th>
                          <th className="text-left p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 10).map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-slate-50">
                            <td className="p-4 font-mono text-sm">#{booking.id.slice(-8)}</td>
                            <td className="p-4">{booking.customer_name || 'N/A'}</td>
                            <td className="p-4">
                              {boats.find(b => b.id === booking.boat_id)?.name || 'Unknown Boat'}
                            </td>
                            <td className="p-4">
                              {new Date(booking.start_date).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-semibold">${booking.total_amount}</td>
                            <td className="p-4">
                              <Badge className={`
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {booking.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Platform Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${(bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0)).toFixed(0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Avg Booking Value</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${bookings.length > 0 ? (bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length).toFixed(0) : '0'}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Active Hosts</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {new Set(boats.filter(b => b.status === 'approved').map(b => b.owner_id)).size}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Approval Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {boats.length > 0 ? Math.round((stats.approved / boats.length) * 100) : 0}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <span className="text-sm">New boats pending approval</span>
                        <Badge>{stats.pending}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <span className="text-sm">Active listings</span>
                        <Badge variant="secondary">{stats.approved}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <span className="text-sm">Recent bookings (last 30 days)</span>
                        <Badge variant="secondary">{bookings.length}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Actions Needed</h4>
                    <div className="space-y-3">
                      {stats.pending > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm">Boats awaiting approval</span>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">{stats.pending}</Badge>
                        </div>
                      )}
                      {stats.rejected > 0 && (
                        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center">
                            <XCircle className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm">Rejected listings</span>
                          </div>
                          <Badge className="bg-red-100 text-red-800">{stats.rejected}</Badge>
                        </div>
                      )}
                      {stats.pending === 0 && stats.rejected === 0 && (
                        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm">All caught up!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'approved' && 'Approve Boat Listing'}
                {actionDialog.type === 'rejected' && 'Reject Boat Listing'}
                {actionDialog.type === 'suspended' && 'Suspend Boat Listing'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'approved' && 'This boat will be made available for booking.'}
                {actionDialog.type === 'rejected' && 'This boat will be rejected and the owner will be notified.'}
                {actionDialog.type === 'suspended' && 'This boat will be temporarily suspended from bookings.'}
              </DialogDescription>
            </DialogHeader>
            
            {actionDialog.type === 'rejected' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="min-h-[100px]"
                />
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({...actionDialog, open: false})}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleBoatAction(actionDialog.type, actionDialog.boat, rejectionReason)}
                className={`
                  ${actionDialog.type === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  ${actionDialog.type === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                  ${actionDialog.type === 'suspended' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  text-white
                `}
              >
                Confirm {actionDialog.type === 'approved' ? 'Approval' : actionDialog.type === 'rejected' ? 'Rejection' : 'Suspension'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Boat Details Modal */}
        <Dialog open={!!selectedBoat} onOpenChange={() => setSelectedBoat(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedBoat && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedBoat.name}</DialogTitle>
                  <DialogDescription>{selectedBoat.location}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <img 
                    src={selectedBoat.images?.[0] || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=300&fit=crop"} 
                    alt={selectedBoat.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type:</strong> {selectedBoat.boat_type.replace(/_/g, ' ')}
                    </div>
                    <div>
                      <strong>Capacity:</strong> {selectedBoat.max_guests} guests
                    </div>
                    <div>
                      <strong>Price:</strong> ${selectedBoat.price_per_hour}/hour
                    </div>
                    <div>
                      <strong>With Captain:</strong> {selectedBoat.with_captain ? 'Yes' : 'No'}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-slate-600">{selectedBoat.description}</p>
                  </div>
                  
                  {selectedBoat.amenities && selectedBoat.amenities.length > 0 && (
                    <div>
                      <strong>Amenities:</strong>
                      <ul className="mt-1 text-slate-600 list-disc list-inside">
                        {selectedBoat.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}