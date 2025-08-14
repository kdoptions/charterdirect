import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerApplicationForm from '../components/owner/OwnerApplicationForm';
import { Button } from '../components/ui/button';
import { ArrowLeft, Ship, CheckCircle } from 'lucide-react';

export default function OwnerApplication() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting owner application:', formData);
      
      // TODO: In production, this would send to your backend API
      // For now, we'll simulate a successful submission
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Owner application submitted successfully');
      
      // In production, you would:
      // 1. Send formData to your backend
      // 2. Store application in database
      // 3. Send confirmation email
      // 4. Notify admins of new application
      
    } catch (error) {
      console.error('❌ Application submission failed:', error);
      throw new Error('Failed to submit application');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // If user is not logged in, redirect to auth
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Become a Boat Owner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our platform and start earning money by renting out your boat. 
              Complete the application below and we'll review it within 2-3 business days.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Why List Your Boat on Harbour Lux?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
                <p className="text-sm text-gray-600">
                  Simple dashboard to manage bookings, payments, and boat availability
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Ship className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Maximum Exposure</h3>
                <p className="text-sm text-gray-600">
                  Reach thousands of potential customers looking for boat rentals
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600">
                  Stripe-powered payments with automatic deposits and balance collection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <OwnerApplicationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Questions about becoming a boat owner? Contact us at{' '}
            <a href="mailto:support@harbourlux.com" className="text-blue-600 hover:underline">
              support@harbourlux.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 