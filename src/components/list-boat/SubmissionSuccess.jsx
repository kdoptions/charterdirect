import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SubmissionSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-lg">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Submission Successful!</h1>
        <p className="mt-4 text-slate-600">
          Thank you for listing your boat with us. Our team will review your submission and you will be notified via email once it's approved. This usually takes 24-48 hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("MyBoats")}>
                <Button className="w-full luxury-gradient text-white">
                    Go to My Boats
                </Button>
            </Link>
            <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="w-full">
                    Back to Home
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}