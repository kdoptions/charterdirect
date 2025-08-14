
import React, { useState } from "react";
import { Boat } from "@/api/entities";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import ProgressBar from "../components/list-boat/ProgressBar";
import Step1_Details from "../components/list-boat/Step1_Details";
import Step2_Pricing from "../components/list-boat/Step2_Pricing";
import Step3_Media from "../components/list-boat/Step3_Media";
import Step4_Services from "../components/list-boat/Step4_Services";
import Step5_Payments from "../components/list-boat/Step5_Payments";
import Step6_Legal from "../components/list-boat/Step6_Legal"; // New import
import SubmissionSuccess from "../components/list-boat/SubmissionSuccess";

const TOTAL_STEPS = 6; // Updated total steps

export default function ListBoat() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    description: "",
    boat_type: "yacht",
    with_captain: true,
    max_guests: 10,
    location: "Sydney Harbour",
    
    // Step 2
    price_per_hour: 200,
    extended_booking_price: 180,
    availability_blocks: [
      { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
      { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 }
    ],
    special_pricing: [],
    weekend_price: 240,
    off_season_discount: 0,
    down_payment_percentage: 30, // Minimum 10%
    early_bird_discount: 0,
    early_bird_days: 14,

    // Step 3
    images: [],
    additional_media: [],

    // Step 4
    amenities: [],
    additional_services: [],

    // Step 5
    stripe_account_id: "", // Optional for now

    // Step 6 - Legal (New fields)
    terms_and_conditions: "",
    cancellation_policy: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    // Validate down payment percentage
    if (formData.down_payment_percentage < 10) {
      setError("Down payment percentage must be at least 10%");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Use Firebase user ID (uid) instead of old User.me()
      const finalData = {
        ...formData,
        owner_id: currentUser.uid,
        owner_email: currentUser.email,
        owner_name: currentUser.displayName || currentUser.email,
        status: 'pending' // Default status
      };
      await Boat.create(finalData);
      setSubmitted(true);
    } catch (err) {
      setError("An error occurred while submitting your boat. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <SubmissionSuccess />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Home"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">List Your Boat</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Form Content */}
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg">
          {currentStep === 1 && <Step1_Details data={formData} updateData={updateFormData} />}
          {currentStep === 2 && <Step2_Pricing data={formData} updateData={updateFormData} />}
          {currentStep === 3 && <Step3_Media data={formData} updateData={updateFormData} />}
          {currentStep === 4 && <Step4_Services data={formData} updateData={updateFormData} />}
          {currentStep === 5 && <Step5_Payments data={formData} updateData={updateFormData} />}
          {currentStep === 6 && <Step6_Legal data={formData} updateData={updateFormData} />} {/* New step rendering */}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button 
              onClick={nextStep} 
              className="luxury-gradient text-white"
            >
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
