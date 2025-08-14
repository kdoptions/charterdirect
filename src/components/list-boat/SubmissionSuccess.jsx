import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Mail, FileText } from 'lucide-react';

export default function SubmissionSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl w-full text-center bg-white p-10 rounded-2xl shadow-lg">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Boat Listing Submitted!</h1>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-blue-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            What Happens Next?
          </h2>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Review Process:</strong> Our team will review your boat listing within 24-48 hours</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Documentation Check:</strong> We'll verify your business details, insurance, and licenses</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Approval Notification:</strong> You'll receive an email once your boat is approved and live</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Start Earning:</strong> Once approved, customers can book your boat and you'll receive payments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Check your email for confirmation</span>
          </div>
          <p className="text-sm text-gray-500">
            We've sent you a confirmation email with your application details and tracking number.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("MyBoats")}>
            <Button className="w-full luxury-gradient text-white">
              <FileText className="w-4 h-4 mr-2" />
              View My Applications
            </Button>
          </Link>
          
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Questions about your application? Contact us at{' '}
            <a href="mailto:support@harbourlux.com" className="text-blue-600 hover:underline">
              support@harbourlux.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}