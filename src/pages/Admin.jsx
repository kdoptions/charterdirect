import React, { useState, useEffect } from 'react';
import { Boat } from '@/api/entities';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isAdmin, hasPermission, getAdminList, addAdmin, removeAdmin } from '@/utils/adminRoles';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Users, 
  DollarSign,
  MapPin,
  Calendar,
  AlertTriangle,
  Ship,
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [pendingBoats, setPendingBoats] = useState([]);
  const [allBoats, setAllBoats] = useState([]);
  const [approvedToday, setApprovedToday] = useState([]);
  const [rejectedToday, setRejectedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAdminManagement, setShowAdminManagement] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  const loadAdminData = async () => {
    try {
      const [pending, all, approved, rejected] = await Promise.all([
        Boat.getPendingBoats(),
        Boat.getAllBoats(),
        Boat.getApprovedToday(),
        Boat.getRejectedToday()
      ]);
      
      setPendingBoats(pending);
      setAllBoats(all);
      setApprovedToday(approved);
      setRejectedToday(rejected);
      
      // Load admin list
      setAdminList(getAdminList());
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (boatId) => {
    setProcessing(true);
    try {
      await Boat.update(boatId, { 
        status: 'approved',
        approved_at: new Date().toISOString()
      });
      
      // Reload all admin data
      await loadAdminData();
      
      console.log('✅ Boat approved:', boatId);
    } catch (error) {
      console.error('❌ Error approving boat:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (boatId, reason = '') => {
    setProcessing(true);
    try {
      await Boat.update(boatId, { 
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      });
      
      // Reload all admin data
      await loadAdminData();
      
      console.log('❌ Boat rejected:', boatId);
    } catch (error) {
      console.error('❌ Error rejecting boat:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    const success = addAdmin(newAdminEmail);
    if (success) {
      setAdminList(getAdminList());
      setNewAdminEmail('');
      alert('Admin added successfully!');
    } else {
      alert('This email is already an admin or invalid.');
    }
  };

  const handleRemoveAdmin = (email) => {
    if (email === currentUser.email) {
      alert('You cannot remove yourself as an admin!');
      return;
    }
    
    if (confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      const success = removeAdmin(email);
      if (success) {
        setAdminList(getAdminList());
        alert('Admin removed successfully!');
      } else {
        alert('Failed to remove admin.');
      }
    }
  };

  // Redirect if not admin (for now, allow all users - add role check later)
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  // Check admin permissions
  if (!hasPermission(currentUser, 'access_admin_panel')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-slate-600 max-w-md mx-auto">
              You don't have permission to access the admin panel. Only authorized administrators can view this page.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/')} variant="outline">
                Go Home
              </Button>
              <Button onClick={() => navigate('/my-boats')}>
                My Boats
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading pending boats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
              <p className="text-slate-600">Review and approve pending boat listings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAdminManagement(!showAdminManagement)}
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>{showAdminManagement ? 'Hide' : 'Show'} Admin Management</span>
              </Button>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
              <div className="text-sm text-slate-500">
                Logged in as: {currentUser.email}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingBoats.length}</p>
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
                  <p className="text-sm text-slate-600">Total Boats</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {allBoats.filter(boat => boat.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ship className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedToday.length}
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
                  <p className="text-sm text-slate-600">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedToday.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Management Section */}
        {showAdminManagement && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Admin Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Admin */}
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Add New Admin
                    </label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button onClick={handleAddAdmin} className="bg-blue-600 hover:bg-blue-700">
                    Add Admin
                  </Button>
                </div>

                {/* Current Admins List */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Current Admins ({adminList.length})</h4>
                  <div className="space-y-2">
                    {adminList.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{email}</p>
                            <p className="text-sm text-slate-500">
                              {email === currentUser.email ? 'Current User' : 'Admin'}
                            </p>
                          </div>
                        </div>
                        {email !== currentUser.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(email)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Alert */}
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Admin changes are currently stored in memory. In production, these should be persisted to a database.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Boats List */}
        {pendingBoats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No pending boats</h3>
              <p className="text-slate-600">All boat listings have been reviewed and processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Pending Review ({pendingBoats.length})</h2>
            
            {pendingBoats.map((boat) => (
              <Card key={boat.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{boat.name}</CardTitle>
                      <p className="text-slate-600 mt-1">{boat.description}</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Boat Details */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{boat.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Max {boat.max_guests} guests</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">${boat.price_per_hour}/hour</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Created {new Date(boat.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Owner Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Owner Information</h4>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{boat.owner_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{boat.owner_email}</span>
                      </div>
                      {boat.business_name && (
                        <div className="flex items-center space-x-2">
                          <Ship className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{boat.business_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      onClick={() => handleApprove(boat.id)}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processing ? 'Approving...' : 'Approve'}
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(boat.id)}
                      disabled={processing}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processing ? 'Rejecting...' : 'Reject'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
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