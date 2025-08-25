import React, { useState, useEffect } from "react";
import { Boat, User } from "@/api/entities";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

import ProgressBar from "../components/list-boat/ProgressBar";
import Step1_Details from "../components/list-boat/Step1_Details";
import Step2_Pricing from "../components/list-boat/Step2_Pricing";
import Step3_Media from "../components/list-boat/Step3_Media";
import Step4_Services from "../components/list-boat/Step4_Services";
import Step5_Payments from "../components/list-boat/Step5_Payments";
import Step6_Legal from "../components/list-boat/Step6_Legal";
import SubmissionSuccess from "../components/list-boat/SubmissionSuccess";

const TOTAL_STEPS = 6;

export default function EditBoat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [boat, setBoat] = useState(null);
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
    down_payment_percentage: 30,
    early_bird_discount: 0,
    early_bird_days: 14,

    // Step 3
    images: [],
    additional_media: [],

    // Step 4
    amenities: [],
    additional_services: [],

    // Step 5
    stripe_account_id: "",

    // Step 6 - Legal
    terms_and_conditions: "",
    cancellation_policy: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const boatId = urlParams.get('id');

  // Load boat data on component mount
  useEffect(() => {
    if (boatId && currentUser) {
      loadBoatData();
    }
  }, [boatId, currentUser]);

  const loadBoatData = async () => {
    try {
      setLoading(true);
      const boatData = await Boat.getById(boatId);
      
      if (!boatData) {
        setError("Boat not found");
        return;
      }

      // Check if user owns this boat
      if (boatData.owner_id !== currentUser.id) {
        setError("You don't have permission to edit this boat");
        return;
      }

      setBoat(boatData);
      
      // Populate form data with existing boat data
      setFormData({
        name: boatData.name || "",
        description: boatData.description || "",
        boat_type: boatData.boat_type || "yacht",
        with_captain: boatData.with_captain ?? true,
        max_guests: boatData.max_guests || 10,
        location: boatData.location || "Sydney Harbour",
        
        price_per_hour: boatData.price_per_hour || 200,
        extended_booking_price: boatData.extended_booking_price || 180,
        availability_blocks: boatData.availability_blocks || [
          { name: "Morning", start_time: "09:00", end_time: "13:00", duration_hours: 4 },
          { name: "Afternoon", start_time: "14:00", end_time: "18:00", duration_hours: 4 }
        ],
        special_pricing: boatData.special_pricing || [],
        weekend_price: boatData.weekend_price || 240,
        off_season_discount: boatData.off_season_discount || 0,
        down_payment_percentage: boatData.down_payment_percentage || 30,
        early_bird_discount: boatData.early_bird_discount || 0,
        early_bird_days: boatData.early_bird_days || 14,

        images: boatData.images || [],
        additional_media: boatData.additional_media || [],

        amenities: boatData.amenities || [],
        additional_services: boatData.additional_services || [],

        stripe_account_id: boatData.stripe_account_id || "",

        terms_and_conditions: boatData.terms_and_conditions || "",
        cancellation_policy: boatData.cancellation_policy || ""
      });
    } catch (error) {
      console.error("Error loading boat data:", error);
      setError("Failed to load boat data");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-slate-600">Loading boat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Error</h1>
            <p className="text-slate-600">{error}</p>
            <Button onClick={() => navigate(createPageUrl("MyBoats"))}>
              Back to My Boats
            </Button>
          </div>
        </div>
      </div>
    );
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
      console.log('🚤 Updating boat with data:', formData);
      await Boat.update(boatId, formData);
      setSubmitted(true);
    } catch (err) {
      setError("An error occurred while updating your boat. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Boat Updated Successfully!</h1>
            <p className="text-slate-600">Your boat has been updated and is pending review.</p>
            <div className="space-x-4">
              <Button onClick={() => navigate(createPageUrl("MyBoats"))}>
                Back to My Boats
              </Button>
              <Button variant="outline" onClick={() => navigate(createPageUrl(`BoatDetails?id=${boatId}`))}>
                View Boat
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("MyBoats"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Edit Boat</h1>
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
          {currentStep === 6 && <Step6_Legal data={formData} updateData={updateFormData} />}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("MyBoats"))}
            >
              Cancel
            </Button>
            
            {currentStep === TOTAL_STEPS ? (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="luxury-gradient text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Boat"
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="luxury-gradient text-white"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
