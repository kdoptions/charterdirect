import React, { useState, useEffect } from 'react';
import { Boat } from '@/api/entities';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Phone
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [pendingBoats, setPendingBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadPendingBoats();
    }
  }, [currentUser]);

  const loadPendingBoats = async () => {
    try {
      const pending = await Boat.getPendingBoats();
      setPendingBoats(pending);
    } catch (error) {
      console.error('Error loading pending boats:', error);
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
      
      // Reload pending boats
      await loadPendingBoats();
      
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
      
      // Reload pending boats
      await loadPendingBoats();
      
      console.log('❌ Boat rejected:', boatId);
    } catch (error) {
      console.error('❌ Error rejecting boat:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Redirect if not admin (for now, allow all users - add role check later)
  if (!currentUser) {
    navigate('/auth');
    return null;
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Review and approve pending boat listings</p>
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
                    {pendingBoats.length + 4} {/* 4 existing approved boats */}
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
                  <p className="text-2xl font-bold text-green-600">0</p>
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
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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