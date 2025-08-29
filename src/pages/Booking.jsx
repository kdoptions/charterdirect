import { Boat, Booking as BookingEntity, mockBoats } from "@/api/entities";
import StripeService from "@/api/stripeService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Clock,
    DollarSign,
    Info,
    Loader2,
    Shield,
    Ship
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [guests, setGuests] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    special_requests: ""
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("13:00");
  const [selectedServices, setSelectedServices] = useState([]);

  // Debug selectedServices changes (commented out to prevent console spam)
  // useEffect(() => {
  //   console.log('🔍 selectedServices changed:', selectedServices);
  //   
  //   // Test with a hardcoded service to verify pricing calculation
  //   if (selectedServices.length > 0) {
  //     const testService = { name: 'test', price: 100, description: 'per hour', pricing_type: 'per_hour' };
  //     console.log('🔍 Test service calculation:', testService);
  //     console.log('🔍 Test service cost for 4 hours:', testService.price * 4);
  //   }
  // }, [selectedServices]);

  const urlParams = new URLSearchParams(location.search);
  const boatId = urlParams.get('id');

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeService = new StripeService();
const stripeInstance = await stripeService.getStripe();
        if (stripeInstance) {
          setStripe(stripeInstance);
          const elementsInstance = stripeInstance.elements();
          setElements(elementsInstance);
          
          // Create card element
          const card = elementsInstance.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          });
          
          setCardElement(card);
        } else {
          console.log('⚠️ Stripe not configured - using fallback payment form');
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        console.log('⚠️ Using fallback payment form');
      }
    };

    initializeStripe();
  }, []);

  // Mount Stripe card element
  useEffect(() => {
    if (cardElement) {
      const mountCardElement = () => {
        const cardElementDiv = document.getElementById('card-element');
        if (cardElementDiv && !cardElementDiv.hasChildNodes()) {
          try {
            cardElement.mount('#card-element');
            console.log('✅ Stripe card element mounted successfully');
          } catch (error) {
            console.error('❌ Failed to mount Stripe card element:', error);
          }
        } else if (cardElementDiv && cardElementDiv.hasChildNodes()) {
          console.log('✅ Stripe card element already mounted');
        } else {
          console.log('⚠️ Card element div not found yet, will retry');
          // Retry with increasing delays
          setTimeout(mountCardElement, 100);
          setTimeout(mountCardElement, 500);
          setTimeout(mountCardElement, 1000);
        }
      };
      
      mountCardElement();
    }
  }, [cardElement]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Loading booking data for boat ID:", boatId);
        
        if (!boatId) {
          setError("No boat specified.");
          setLoading(false);
          return;
        }

        // Fetch boat details
        // console.log("🔍 Boat object:", Boat);
        // console.log("🔍 Boat.filter method:", Boat.filter);
        // console.log("🔍 Calling Boat.filter with:", { id: boatId });
        
        let boatData;
        try {
          // Check if Boat.filter is available
          if (typeof Boat.filter !== 'function') {
            console.error("❌ Boat.filter is not a function:", typeof Boat.filter);
            throw new Error("Boat.filter method not available");
          }
          
          boatData = await Boat.filter({ id: boatId });
        } catch (error) {
          console.error("❌ Boat.filter failed, trying fallback:", error);
          
          // Try multiple fallback strategies
          try {
            // Fallback 1: Try to get boat directly from mock data
            boatData = mockBoats.filter(boat => boat.id === boatId);
            
            if (boatData.length === 0) {
              // Fallback 2: Try to get boat by ID directly from Supabase
              const { data: supabaseData, error: supabaseError } = await supabase
                .from('boats')
                .select('*')
                .eq('id', boatId)
                .single();
              
              if (!supabaseError && supabaseData) {
                boatData = [supabaseData];
              } else {
                console.error("❌ Supabase fallback also failed:", supabaseError);
              }
            }
          } catch (fallbackError) {
            console.error("❌ All fallback strategies failed:", fallbackError);
            boatData = [];
          }
        }
        
        console.log("Boat data found:", boatData);
        
        if (boatData.length === 0) {
          setError("Boat not found.");
          setLoading(false);
          return;
        }
        
        const selectedBoat = boatData[0];
        
        // Debug additional services
        if (selectedBoat.additional_services) {
          console.log("🔍 Additional services raw data:", selectedBoat.additional_services);
          console.log("🔍 Services type:", typeof selectedBoat.additional_services);
          console.log("🔍 Services length:", selectedBoat.additional_services.length);
          console.log("🔍 First service:", selectedBoat.additional_services[0]);
        }
        
        setBoat(selectedBoat);

        // Fetch user data
        if (currentUser) {
          console.log("User data from auth context:", currentUser);
          setCustomerDetails(prev => ({
            ...prev,
            name: currentUser.user_metadata?.display_name || currentUser.email || "",
            email: currentUser.email || ""
          }));
        } else {
          console.log("No user logged in");
          setError("You must be logged in to create a booking. Please sign in first.");
          setLoading(false);
          return;
        }

      } catch (err) {
        console.error("Error loading booking data:", err);
        setError("Failed to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [boatId]);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedBlock(null); // Reset time block when date changes
    setAvailableSlots([]);
    
    if (date && boat) {
      // Check if this date has special daily pricing
      const pricingInfo = getPriceForDate(date);
      if (pricingInfo.type === 'daily' && pricingInfo.special) {
        // For daily pricing, automatically set the custom time if available
        if (pricingInfo.special.start_time && pricingInfo.special.end_time) {
          setCustomStartTime(pricingInfo.special.start_time);
          setCustomEndTime(pricingInfo.special.end_time);
          setShowCustomTime(true);
        }
      }
      
      setCheckingAvailability(true);
      try {
        const dateStr = date.toISOString().split('T')[0];
        console.log("📅 Checking availability for date:", dateStr);

        // Define time slots from boat availability blocks
        const timeSlots = boat.availability_blocks?.map(block => ({
          name: block.name,
          start: block.start_time,
          end: block.end_time,
          duration: block.duration_hours || 4
        })) || [
          // Default time slots if boat doesn't have availability blocks
          { name: "Morning", start: "09:00", end: "13:00", duration: 4 },
          { name: "Afternoon", start: "14:00", end: "18:00", duration: 4 },
          { name: "Evening", start: "19:00", end: "23:00", duration: 4 }
        ];
        
        console.log("⏰ Time slots with duration:", timeSlots.map(slot => `${slot.name}: ${slot.start}-${slot.end} (${slot.duration}h)`));

        console.log("⏰ Available time slots for this boat:", timeSlots);

        // Use enhanced availability checking that considers calendar conflicts
        const availabilityResult = await BookingEntity.checkAvailabilityWithCalendar(
          boat.id,
          dateStr,
          dateStr,
          null, // startTime will be checked per slot
          null,  // endTime will be checked per slot
          null   // excludeBookingId (for editing existing bookings)
        );

        if (!availabilityResult.available) {
          console.log("❌ Availability check failed:", availabilityResult.reason);
          if (availabilityResult.conflicts.length > 0) {
            console.log("📅 Calendar conflicts found:", availabilityResult.conflicts);
            // Show conflicts to user
            setError(`Calendar conflict detected: ${availabilityResult.reason}`);
          } else {
            setError(availabilityResult.reason);
          }
          setCheckingAvailability(false);
          return;
        }

        // If calendar integration is enabled and no conflicts, check individual time slots
        if (boat.calendar_integration_enabled && boat.google_calendar_id) {
          console.log("📅 Calendar integration enabled, checking individual time slots for this boat");
          
          // Check each time slot for conflicts on THIS boat only
          const slots = [];
          for (const slot of timeSlots) {
            const slotStartTime = slot.start;
            const slotEndTime = slot.end;
            
            const slotAvailability = await BookingEntity.checkAvailabilityWithCalendar(
              boat.id,
              dateStr,
              dateStr,
              slotStartTime,
              slotEndTime
            );
            
            if (slotAvailability.available) {
              slots.push(slot);
            } else {
              console.log(`⏰ Slot ${slotStartTime}-${slotEndTime} unavailable:`, slotAvailability.reason);
            }
          }
          
          setAvailableSlots(slots);
        } else {
          // Fallback to original availability checking for this boat only
          console.log("⚠️ No Google Calendar integration found for boat owner, checking local bookings for this boat only");
          
          // Get confirmed bookings for THIS boat and date
          const confirmedBookings = await BookingEntity.filter({
            boat_id: boat.id,
            start_date: dateStr,
            status: 'confirmed'
          });
          
          console.log("📋 Confirmed bookings for this boat on this date:", confirmedBookings);
          
          // Filter out unavailable time slots for THIS boat only
          const availableSlots = timeSlots.filter(slot => {
            const slotStartTime = slot.start;
            const slotEndTime = slot.end;
            
            // Check if any confirmed booking overlaps with this time slot for THIS boat
            const hasConflict = confirmedBookings.some(booking => {
              if (!booking.start_time || !booking.end_time) return false;
              
              const bookingStart = booking.start_time;
              const bookingEnd = booking.end_time;
              
              // Check for time overlap
              return (
                (slotStartTime < bookingEnd && slotEndTime > bookingStart) ||
                (slotStartTime === bookingStart && slotEndTime === bookingEnd)
              );
            });
            
            if (hasConflict) {
              console.log(`⏰ Slot ${slotStartTime}-${slotEndTime}: Unavailable (conflict with existing booking on this boat)`);
            } else {
              console.log(`⏰ Slot ${slotStartTime}-${slotEndTime}: Available for this boat`);
            }
            
            return !hasConflict;
          });
          
          setAvailableSlots(availableSlots);
        }
        
        console.log(`✅ Available slots for ${dateStr}:`, availableSlots.length);
        
      } catch (error) {
        console.error("❌ Availability check error:", error);
        setError("Failed to check availability. Please try again.");
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const getPriceForDate = (date) => {
    if (!date || !boat) return { price: boat?.price_per_hour || 0, type: 'hourly', special: null };

    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    const specialPrice = boat.special_pricing?.find(p => p.date === dateString);
    if (specialPrice) {
      if (specialPrice.pricing_type === 'daily' || specialPrice.price_per_day) {
        return { 
          price: specialPrice.price_per_day || specialPrice.price_per_hour, 
          type: 'daily', 
          special: specialPrice 
        };
      } else {
        return { 
          price: specialPrice.price_per_hour, 
          type: 'hourly', 
          special: specialPrice 
        };
      }
    }

    if ((dayOfWeek === 0 || dayOfWeek === 6) && boat.weekend_price) {
      return { price: boat.weekend_price, type: 'hourly', special: null };
    }

    return { price: boat.price_per_hour, type: 'hourly', special: null };
  };

  // Check if a date has special pricing for calendar display
  const hasSpecialPricing = (date) => {
    if (!date || !boat) return false;
    // Parse date as local date without timezone conversion
    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return boat.special_pricing?.some(p => p.date === dateString) || false;
  };

  // Get special pricing info for a date
  const getSpecialPricingInfo = (date) => {
    if (!date || !boat) return null;
    // Parse date as local date without timezone conversion
    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return boat.special_pricing?.find(p => p.date === dateString) || null;
  };
  
  const pricingInfo = getPriceForDate(selectedDate);
  const pricePerHour = pricingInfo.price;
  const pricingType = pricingInfo.type;
  const specialPricing = pricingInfo.special;
  
  // Calculate hours for selected block or custom time
  const getTotalHours = () => {
    if (showCustomTime) {
      const start = new Date(`2000-01-01T${customStartTime}:00`);
      const end = new Date(`2000-01-01T${customEndTime}:00`);
      const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
      console.log("⏰ Custom time hours calculation:", { customStartTime, customEndTime, hours });
      return hours;
    }
    
    if (selectedBlock) {
      console.log("⏰ Selected block hours:", { 
        blockName: selectedBlock.name, 
        duration: selectedBlock.duration,
        start: selectedBlock.start,
        end: selectedBlock.end
      });
      return selectedBlock.duration || 0;
    }
    
    console.log("⏰ No time block selected, hours: 0");
    return 0;
  };
  
  const totalHours = getTotalHours();
  
  // Calculate services cost based on pricing type
  const servicesCost = selectedServices.reduce((sum, service) => {
    let serviceCost = 0;
    
    console.log(`🔍 Processing service:`, service);
    console.log(`🔍 Service has pricing_type:`, service.pricing_type);
    console.log(`🔍 Service description:`, service.description);
    console.log(`🔍 Total hours:`, totalHours);
    
    // Determine pricing type - check explicit field first, then fallback to description
    let pricingType = service.pricing_type;
    console.log(`🔍 Initial pricing_type:`, pricingType);
    console.log(`🔍 Service description:`, service.description);
    console.log(`🔍 Description type:`, typeof service.description);
    
    if (!pricingType && service.description) {
      const desc = service.description.toLowerCase();
      console.log(`🔍 Lowercase description:`, desc);
      console.log(`🔍 Contains 'per hour':`, desc.includes('per hour'));
      console.log(`🔍 Contains 'per person':`, desc.includes('per person'));
      
      if (desc.includes('per hour')) {
        pricingType = 'per_hour';
        console.log(`🔍 Detected per_hour from description`);
      } else if (desc.includes('per person')) {
        pricingType = 'per_person';
        console.log(`🔍 Detected per_person from description`);
      } else {
        pricingType = 'fixed';
        console.log(`🔍 Defaulting to fixed pricing`);
      }
    }
    
    console.log(`🔍 Final pricing type:`, pricingType);
    
    switch (pricingType) {
      case 'fixed':
        serviceCost = service.price;
        console.log(`🔍 Fixed pricing: ${service.price}`);
        break;
      case 'per_person':
        serviceCost = service.price * guests;
        console.log(`🔍 Per person pricing: ${service.price} × ${guests} = ${serviceCost}`);
        break;
      case 'per_hour':
        serviceCost = service.price * totalHours;
        console.log(`🔍 Per hour pricing: ${service.price} × ${totalHours} = ${serviceCost}`);
        break;
      default:
        serviceCost = service.price; // fallback to fixed
        console.log(`🔍 Default pricing: ${service.price}`);
    }
    
    console.log(`🔍 Final service cost: ${serviceCost}`);
    
    return sum + serviceCost;
  }, 0);
  
  const baseAmount = pricePerHour * totalHours;
  const totalAmount = baseAmount + servicesCost;
  
  console.log("💰 Price calculation:", { 
    pricePerHour, 
    totalHours, 
    baseAmount,
    servicesCost,
    selectedServices: selectedServices.map(s => s.name),
    totalAmount,
    selectedBlock: selectedBlock?.name,
    showCustomTime 
  });

  const isFormValid = boat && selectedDate && 
    ((selectedBlock && !showCustomTime) || (showCustomTime && customStartTime && customEndTime)) && 
    guests > 0 && guests <= boat.max_guests && 
    customerDetails.name && customerDetails.email &&
    paymentDetails.cardholderName &&
    (cardElement || (!stripe && paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv));

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create proper datetime strings for the booking
      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const startTime = showCustomTime ? customStartTime : selectedBlock.start;
      const endTime = showCustomTime ? customEndTime : selectedBlock.end;
      const startDateTime = `${bookingDate}T${startTime}:00`;
      const endDateTime = `${bookingDate}T${endTime}:00`;
      
      // Ensure we have valid time values
      if (!startTime || !endTime) {
        setError("Please select a valid time slot for your booking.");
        setIsSubmitting(false);
        return;
      }

      // Create payment method from Stripe card element or fallback
      let paymentMethod = null;
      if (stripe && cardElement) {
        try {
          const { paymentMethod: pm, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
              name: paymentDetails.cardholderName,
            },
          });

          if (error) {
            console.error('Payment method creation failed:', error);
            alert('Payment method creation failed. Please check your card details.');
            return;
          }

          paymentMethod = pm;
          console.log('✅ Payment method created:', pm.id);
        } catch (error) {
          console.error('Failed to create payment method:', error);
          alert('Failed to create payment method. Please try again.');
          return;
        }
      } else if (!stripe) {
        // Fallback mode - create mock payment method
        paymentMethod = {
          id: `pm_${Math.random().toString(36).substr(2, 16)}`,
          card: {
            last4: paymentDetails.cardNumber.replace(/\s/g, '').slice(-4),
            brand: 'visa'
          }
        };
        console.log('✅ Mock payment method created for demo mode');
      }

      const bookingData = {
        boat_id: boat.id,
        customer_id: currentUser?.id, // Use currentUser from auth context
        start_date: bookingDate,
        end_date: bookingDate,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        start_time: startTime,
        end_time: endTime,
        is_custom_time: showCustomTime,
        guests: Number(guests),
        total_hours: Number(totalHours),
        base_price: Number(pricePerHour),
        additional_services: selectedServices,
        total_amount: Number(totalAmount),
        commission_amount: Number(totalAmount * 0.10),
        down_payment: Number(totalAmount * (boat.down_payment_percentage / 100)),
        remaining_balance: Number(totalAmount - (totalAmount * (boat.down_payment_percentage / 100))),
        status: 'pending_approval',
        payment_status: 'pending',
        payment_method: paymentMethod,
        payment_details: {
          card_number: paymentMethod?.card?.last4 || '****',
          card_brand: paymentMethod?.card?.brand || 'unknown',
          cardholder_name: paymentDetails.cardholderName
        },
        special_requests: customerDetails.special_requests,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        booking_reference: `BK${Date.now().toString().slice(-8).toUpperCase()}`
      };

      // Check if user is logged in
      if (!currentUser?.id) {
        setError("You must be logged in to create a booking. Please sign in first.");
        setIsSubmitting(false);
        return;
      }

      // Validate data types before sending
      console.log("🔍 Booking data validation:");
      console.log("boat_id:", typeof bookingData.boat_id, bookingData.boat_id);
      console.log("customer_id:", typeof bookingData.customer_id, bookingData.customer_id);
      console.log("start_date:", typeof bookingData.start_date, bookingData.start_date);
      console.log("guests:", typeof bookingData.guests, bookingData.guests);
      console.log("total_hours:", typeof bookingData.total_hours, bookingData.total_hours);
      console.log("base_price:", typeof bookingData.base_price, bookingData.base_price);
      console.log("total_amount:", typeof bookingData.total_amount, bookingData.total_amount);
      console.log("status:", typeof bookingData.status, bookingData.status);
      console.log("payment_status:", typeof bookingData.payment_status, bookingData.payment_status);

      console.log("Creating booking with data:", bookingData);
      const newBooking = await BookingEntity.create(bookingData);
      console.log("Booking created successfully:", newBooking);
      
      // Create PaymentIntent for later confirmation (no charge yet)
      try {
        console.log("💳 Creating PaymentIntent for deposit payment...");
        
        // Calculate deposit amount and platform fee
        const depositAmount = Number(totalAmount * (boat.down_payment_percentage / 100));
        const platformFee = Number(totalAmount * 0.10); // 10% of total booking value
        
        console.log("💰 Payment breakdown:", {
          totalAmount,
          depositAmount,
          platformFee,
          downPaymentPercentage: boat.down_payment_percentage
        });
        
        // Create Stripe PaymentIntent but don't confirm it yet
        const stripeService = new StripeService();
        await stripeService.initialize();
        
        // Create PaymentIntent for the deposit amount (no connected account needed yet)
        const paymentIntent = await stripeService.createPaymentIntent({
          amount: Math.round(depositAmount * 100), // Convert to cents
          connectedAccountId: null, // No connected account needed for initial PaymentIntent
          applicationFeeAmount: 0, // No application fee yet
          metadata: {
            bookingId: newBooking.id,
            boatId: boat.id,
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
            type: 'deposit',
            totalAmount: totalAmount.toString()
          }
        });
        
        console.log("✅ PaymentIntent created successfully:", paymentIntent.id);
        
        // Update booking with PaymentIntent ID and pending status
        await BookingEntity.update(newBooking.id, {
          payment_status: 'pending_approval',
          stripe_payment_intent_id: paymentIntent.id,
          deposit_amount: depositAmount,
          platform_fee: platformFee,
          created_at: new Date().toISOString()
        });
        
        console.log("📋 Booking created with PaymentIntent - awaiting owner approval");
        console.log("💳 Payment will be processed when owner approves");
        console.log("📅 Calendar event will be created when owner approves");
        
      } catch (paymentError) {
        console.error("❌ PaymentIntent creation failed:", paymentError);
        // Still create the booking but mark payment as failed
        await BookingEntity.update(newBooking.id, {
          payment_status: 'failed',
          payment_error: paymentError.message
        });
        console.log("⚠️ Booking created but PaymentIntent failed - owner will need to handle");
      }
        
      // Navigate to confirmation page
      navigate(createPageUrl(`BookingConfirmation?id=${newBooking.id}`));

    } catch (err) {
      console.error("Booking submission error:", err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600">Loading booking details...</p>
          {boatId && <p className="text-sm text-slate-500">Boat ID: {boatId}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Booking Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-slate-700 mb-6">{error}</p>
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : !boat ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Boat Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-slate-700 mb-6">The boat you&apos;re trying to book could not be found.</p>
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">Request to Book</CardTitle>
              <div className="flex items-center space-x-2 text-slate-600 pt-2">
                <Ship className="w-5 h-5" />
                <span className="font-semibold">{boat.name}</span>
              </div>

            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Booking Details */}
              <div className="space-y-6">
                {/* Special Pricing Overview */}
                {boat.special_pricing && boat.special_pricing.length > 0 && (
                  <div className="p-4 bg-orange-100 border-2 border-orange-300 rounded-lg relative z-50" style={{ zIndex: 50, position: 'relative', backgroundColor: '#fed7aa' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="font-bold text-lg text-orange-800">Special Event Pricing</Label>
                    </div>
                    

                    
                    <div className="space-y-3">
                      {boat.special_pricing
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((pricing, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900 mb-1">
                                {/* Parse date as local date without timezone conversion */}
                                {(() => {
                                  const [year, month, day] = pricing.date.split('-').map(Number);
                                  return new Date(year, month - 1, day).toLocaleDateString('en-AU', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  });
                                })()}
                                {pricing.name ? (
                                  <span className="ml-2 text-sm font-normal text-orange-600">
                                    • {pricing.name}
                                  </span>
                                ) : (
                                  <span className="ml-2 text-xs text-slate-400 italic">
                                    (No event name)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 mb-2">
                                {pricing.pricing_type === 'daily' || pricing.price_per_day ? (
                                  <>
                                    <CalendarDays className="w-3 h-3 inline mr-1" />
                                    <span className="font-medium">${pricing.price_per_day || pricing.price_per_hour}/day</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    <span className="font-medium">${pricing.price_per_hour}/hour</span>
                                  </>
                                )}
                              </div>
                              {pricing.start_time && pricing.end_time && (
                                <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                  🕐 Available: {pricing.start_time} - {pricing.end_time}
                                </div>
                              )}
                              {pricing.created_at_local && (
                                <div className="text-xs text-slate-400 mt-1">
                                  📅 Created: {pricing.created_at_local} ({pricing.timezone || 'Local time'})
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-xs ml-2 ${
                              pricing.pricing_type === 'daily' || pricing.price_per_day 
                                ? 'text-purple-600 border-purple-200 bg-purple-50' 
                                : 'text-orange-600 border-orange-200 bg-orange-50'
                            }`}>
                              {pricing.pricing_type === 'daily' || pricing.price_per_day ? 'Daily Rate' : 'Special Rate'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-orange-600 mt-3 text-center">
                      Select a date above to see special pricing applied to your booking
                    </p>
                  </div>
                )}

                <div className="relative" style={{ zIndex: 1 }}>
                  <Label className="font-bold text-lg">1. Select Date</Label>
                  <div className="mt-2 p-4 bg-white border border-slate-200 rounded-lg relative" style={{ zIndex: 1, position: 'relative' }}>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isDisabled = date < today;
                        // Debug: log disabled dates
                        if (isDisabled) {
                          console.log('Date disabled:', date.toDateString(), 'Today:', today.toDateString());
                        }
                        return isDisabled;
                      }}
                      className="w-full"
                      modifiers={{
                        special: (date) => hasSpecialPricing(date)
                      }}
                      modifiersStyles={{
                        special: { 
                          backgroundColor: '#fef3c7', 
                          color: '#92400e',
                          fontWeight: 'bold',
                          borderRadius: '50%'
                        }
                      }}
                    />
                  </div>
                  {/* Special Pricing Legend */}
                  {boat.special_pricing && boat.special_pricing.length > 0 && (
                    <div className="mt-2 text-xs text-slate-600">
                      <span className="inline-flex items-center">
                        <span className="w-3 h-3 rounded-full bg-yellow-200 border border-yellow-400 mr-1"></span>
                        Special pricing available
                      </span>
                    </div>
                  )}
                  
                  {/* Google Calendar Note */}
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="inline-flex items-center">
                      <Info className="w-3 h-3 inline mr-1" />
                      Calendar integration helps ensure accurate availability
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="font-bold text-lg">2. Select Time</Label>
                  
                  {/* Availability Status */}
                  {selectedDate && (
                    <div className="mt-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </span>
                        <span className="text-sm text-blue-600">
                          {availableSlots.length} available slot{availableSlots.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {/* Special Pricing Note */}
                      {specialPricing && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="text-xs text-blue-700">
                            {pricingType === 'daily' ? (
                              <>
                                🎯 <strong>Daily Rate:</strong> ${pricePerHour.toFixed(2)} for the entire day
                                {specialPricing.start_time && specialPricing.end_time && (
                                  <span className="block mt-1">
                                    Available: {specialPricing.start_time} - {specialPricing.end_time}
                                  </span>
                                )}
                                {specialPricing.name && (
                                  <span className="block mt-1 font-medium text-orange-600">
                                    🎉 Event: {specialPricing.name}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                ⭐ <strong>Special Rate:</strong> ${pricePerHour.toFixed(2)}/hour
                                {specialPricing.name && (
                                  <span className="block mt-1 font-medium text-orange-600">
                                    🎉 Event: {specialPricing.name}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {checkingAvailability ? (
                    <div className="mt-2 p-4 border rounded-lg bg-slate-50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Checking availability...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Standard Time Slots */}
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-700">Available Time Slots</Label>
                          {checkingAvailability && (
                            <span className="text-xs text-blue-600">Checking availability...</span>
                          )}
                        </div>
                        <Select 
                          onValueChange={(value) => {
                            setSelectedBlock(JSON.parse(value));
                            setShowCustomTime(false);
                          }}
                          disabled={!selectedDate || checkingAvailability || (specialPricing && pricingType === 'daily')}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={
                              !selectedDate 
                                ? "Select a date first" 
                                : checkingAvailability
                                  ? "Checking availability..."
                                  : specialPricing && pricingType === 'daily'
                                    ? "Daily rate - use custom time below"
                                    : availableSlots.length === 0 
                                      ? "No available slots for this date" 
                                      : "Choose an available time slot"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSlots.map((block, index) => (
                              <SelectItem key={index} value={JSON.stringify(block)}>
                                <div className="flex items-center justify-between">
                                  <span>{block.name}: {block.start} - {block.end}</span>
                                  <span className="text-green-600 font-semibold">({block.duration}h)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Custom Time Option */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-slate-700">
                            {specialPricing && pricingType === 'daily' ? 'Daily Rate Time Selection' : 'Custom Time Request'}
                          </Label>
                          {!(specialPricing && pricingType === 'daily') && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowCustomTime(!showCustomTime);
                                if (!showCustomTime) {
                                  setSelectedBlock(null);
                                }
                              }}
                              className="text-xs"
                            >
                              {showCustomTime ? "Use Standard Slots" : "Request Custom Time"}
                            </Button>
                          )}
                        </div>
                        
                        {/* Daily Rate Note */}
                        {specialPricing && pricingType === 'daily' && (
                          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                            🎯 This date has a special daily rate. The time below is automatically set based on the boat owner&apos;s availability.
                          </div>
                        )}
                        
                        {(showCustomTime || (specialPricing && pricingType === 'daily')) && (
                          <div className="space-y-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-orange-800">Start Time</Label>
                                <Input
                                  type="time"
                                  value={customStartTime}
                                  onChange={(e) => setCustomStartTime(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-orange-800">End Time</Label>
                                <Input
                                  type="time"
                                  value={customEndTime}
                                  onChange={(e) => setCustomEndTime(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                              ⚠️ Custom time requests require owner approval and may have different pricing.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedDate && availableSlots.length === 0 && !checkingAvailability && !showCustomTime && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        No available time slots for this date. Try requesting a custom time instead.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="guests" className="font-bold text-lg">3. Number of Guests</Label>
                  <Input 
                    id="guests"
                    type="number"
                    min="1"
                    max={boat.max_guests}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Maximum {boat.max_guests} guests allowed.</p>
                </div>

                {/* Additional Services Selection */}
                {boat.additional_services && boat.additional_services.length > 0 && (
                  <div>
                    <Label className="font-bold text-lg">4. Additional Services</Label>
                    <p className="text-sm text-slate-600 mb-3">Enhance your experience with these optional services:</p>
                    
                    {/* Debug: Show raw data */}
                    {import.meta.env.DEV && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <strong>Debug - Raw services data:</strong> {JSON.stringify(boat.additional_services)}
                        <br />
                        <strong>Type:</strong> {typeof boat.additional_services}
                        <br />
                        <strong>Length:</strong> {boat.additional_services.length}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {(() => {
                        // Parse services data - handle multiple formats
                        let servicesArray = [];
                        
                        if (typeof boat.additional_services === 'string') {
                          // Single JSON string - try to parse as array or object
                          try {
                            const parsed = JSON.parse(boat.additional_services);
                            servicesArray = Array.isArray(parsed) ? parsed : [parsed];
                          } catch (e) {
                            console.error('Failed to parse services string:', boat.additional_services);
                            servicesArray = [];
                          }
                        } else if (Array.isArray(boat.additional_services)) {
                          // Already an array
                          servicesArray = boat.additional_services;
                        } else {
                          // Single object or other format
                          servicesArray = [boat.additional_services];
                        }
                        
                        console.log('🔍 Parsed services array:', servicesArray);
                        
                        return servicesArray.map((service, index) => {
                          // Handle both string and object formats for individual services
                          let serviceObj = service;
                          if (typeof service === 'string') {
                            try {
                              serviceObj = JSON.parse(service);
                            } catch (e) {
                              console.error('Failed to parse service:', service);
                              serviceObj = { name: service, price: 0, description: '' };
                            }
                          }
                          
                          // Handle double-encoded JSON (JSON string stored as name field)
                          if (serviceObj.name && typeof serviceObj.name === 'string' && serviceObj.name.startsWith('{')) {
                            try {
                              const parsedName = JSON.parse(serviceObj.name);
                              serviceObj = {
                                name: parsedName.name || serviceObj.name,
                                price: parsedName.price || serviceObj.price || 0,
                                description: parsedName.description || serviceObj.description || ''
                              };
                            } catch (e) {
                              console.error('Failed to parse double-encoded service name:', serviceObj.name);
                            }
                          }
                          
                          console.log('🔍 Final service object:', serviceObj);
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`service-${index}`}
                              checked={selectedServices.some(s => s.name === serviceObj.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  console.log('🔍 Adding service to selectedServices:', serviceObj);
                                  setSelectedServices([...selectedServices, serviceObj]);
                                } else {
                                  console.log('🔍 Removing service from selectedServices:', serviceObj.name);
                                  setSelectedServices(selectedServices.filter(s => s.name !== serviceObj.name));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <Label htmlFor={`service-${index}`} className="font-medium text-slate-900 cursor-pointer">
                                {serviceObj.name}
                              </Label>
                              {serviceObj.description && (
                                <p className="text-sm text-slate-600">{serviceObj.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">${serviceObj.price}</div>
                            <div className="text-xs text-slate-500">
                              {(() => {
                                // Determine pricing type - check explicit field first, then fallback to description
                                let pricingType = serviceObj.pricing_type;
                                if (!pricingType && serviceObj.description) {
                                  if (serviceObj.description.toLowerCase().includes('per hour')) {
                                    pricingType = 'per_hour';
                                  } else if (serviceObj.description.toLowerCase().includes('per person')) {
                                    pricingType = 'per_person';
                                  } else {
                                    pricingType = 'fixed';
                                  }
                                }
                                
                                switch (pricingType) {
                                  case 'fixed':
                                    return 'per booking';
                                  case 'per_person':
                                    return 'per person';
                                  case 'per_hour':
                                    return 'per hour';
                                  default:
                                    return 'per booking';
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                          );
                        });
                      })()}
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Selected Services:</strong> {selectedServices.map(s => s.name).join(', ')}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          <strong>Additional Cost:</strong> ${servicesCost.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Customer & Payment */}
              <div className="space-y-6">
                <div>
                  <Label className="font-bold text-lg">{boat.additional_services && boat.additional_services.length > 0 ? '5. Your Details' : '4. Your Details'}</Label>
                  
                  {/* Test Customer Button */}
                  <div className="mb-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCustomerDetails({
                          name: "John Test Customer",
                          email: "john.test@example.com",
                          phone: "+61 400 123 456",
                          special_requests: "Please have life jackets ready for children"
                        });
                      }}
                      className="w-full text-xs"
                    >
                      👤 Use Test Customer Details
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Full Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} />
                    <Input placeholder="Email Address" type="email" value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} />
                    <Input placeholder="Phone Number" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} />
                    <Textarea placeholder="Special requests (optional)" value={customerDetails.special_requests} onChange={e => setCustomerDetails({...customerDetails, special_requests: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label className="font-bold text-lg">{boat.additional_services && boat.additional_services.length > 0 ? '6. Payment Details' : '5. Payment Details'}</Label>
                  <p className="text-sm text-slate-600 mb-3">Your card will only be charged when the booking is approved.</p>
                  
                  {/* Stripe Card Element */}
                  <div className="mb-3">
                    <div className="p-3 border rounded-lg bg-white">
                      {cardElement ? (
                        <div id="card-element" className="min-h-[40px]"></div>
                      ) : stripe ? (
                        <div className="text-sm text-slate-500">Loading secure payment form...</div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-slate-600 mb-2">Payment Details (Demo Mode)</div>
                          <Input 
                            placeholder="Card Number (e.g., 4242 4242 4242 4242)" 
                            value={paymentDetails.cardNumber} 
                            onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                            maxLength="19"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="MM/YY" 
                              value={paymentDetails.expiryDate} 
                              onChange={e => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                              maxLength="5"
                            />
                            <Input 
                              placeholder="CVV" 
                              value={paymentDetails.cvv} 
                              onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                              maxLength="4"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cardholder Name */}
                  <div className="mb-3">
                    <Input 
                      placeholder="Cardholder Name" 
                      value={paymentDetails.cardholderName} 
                      onChange={e => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                    />
                  </div>
                  
                  {/* Test Card Button */}
                  <div className="mt-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setPaymentDetails({
                          ...paymentDetails,
                          cardNumber: '4242 4242 4242 4242',
                          expiryDate: '12/25',
                          cvv: '123',
                          cardholderName: 'John Doe',
                          zipCode: '90210'
                        });
                      }}
                    >
                      💳 Fill Test Card Details
                    </Button>
                  </div>
                  
                  {/* Test Card Info */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800 text-center">
                      💳 <strong>{stripe ? 'Stripe Test Mode' : 'Demo Mode'}:</strong> Use test card numbers like 4242 4242 4242 4242. No real charges will be made.
                      {!stripe && <br />}
                      {!stripe && <span className="text-orange-600">⚠️ Stripe not configured - using demo payment form</span>}
                    </p>
                  </div>
                  
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-800 text-center">
                      <Shield className="w-4 h-4 inline mr-1" />
                      <strong>Secure Payment:</strong> Powered by Stripe. Your payment details are encrypted and secure.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg">Price Details</h3>
                  <div className="mt-2 space-y-2 p-4 border rounded-lg bg-slate-50">
                    {/* Special Pricing Alert */}
                    {specialPricing && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-orange-800">
                              {specialPricing.name ? `Special: ${specialPricing.name}` : 'Special Pricing'}
                            </div>
                            <div className="text-sm text-orange-600">
                              {pricingType === 'daily' ? 'Daily Rate' : 'Special Hourly Rate'}
                            </div>
                            {specialPricing.start_time && specialPricing.end_time && (
                              <div className="text-xs text-orange-500 mt-1">
                                Available: {specialPricing.start_time} - {specialPricing.end_time}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {pricingType === 'daily' ? 'Daily' : 'Special'}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        {pricingType === 'daily' ? 'Daily rate' : 'Price per hour'}
                      </span>
                      <span>${pricePerHour.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booking duration</span>
                      <span>{totalHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base price</span>
                      <span>${baseAmount.toFixed(2)}</span>
                    </div>
                    {selectedServices.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Additional services</span>
                          <span>${servicesCost.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-slate-500 pl-2">
                          {selectedServices.map(service => {
                            // Determine pricing type - check explicit field first, then fallback to description
                            let pricingType = service.pricing_type;
                            if (!pricingType && service.description) {
                              if (service.description.toLowerCase().includes('per hour')) {
                                pricingType = 'per_hour';
                              } else if (service.description.toLowerCase().includes('per person')) {
                                pricingType = 'per_person';
                              } else {
                                pricingType = 'fixed';
                              }
                            }
                            
                            let serviceCost = 0;
                            switch (pricingType) {
                              case 'fixed':
                                serviceCost = service.price;
                                break;
                              case 'per_person':
                                serviceCost = service.price * guests;
                                break;
                              case 'per_hour':
                                serviceCost = service.price * totalHours;
                                break;
                              default:
                                serviceCost = service.price;
                            }
                            
                            return (
                              <div key={service.name} className="flex justify-between">
                                <span>• {service.name}</span>
                                <span>${serviceCost.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Deposit ({boat.down_payment_percentage}%)</span>
                        <span className="text-orange-600">${(totalAmount * (boat.down_payment_percentage / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Remaining balance</span>
                        <span className="text-green-600">${(totalAmount - (totalAmount * (boat.down_payment_percentage / 100))).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800 text-center">
                        <Info className="w-4 h-4 inline mr-1" />
                        <strong>Payment Schedule:</strong> Deposit charged immediately upon approval, remaining balance due before trip.
                      </p>
                    </div>
                    <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800 text-center">
                        <DollarSign className="w-4 w-4 inline mr-1" />
                        <strong>Platform Fee:</strong> 10% of total booking value (${(totalAmount * 0.10).toFixed(2)}) will be deducted from your deposit payment.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Terms & Conditions</AlertTitle>
                    <AlertDescription className="text-xs max-h-20 overflow-y-auto">
                        {boat.terms_and_conditions || "Standard terms and conditions apply. Please arrive 15 minutes prior to departure."}
                    </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
               <Button 
                className="w-full luxury-gradient text-white" 
                size="lg"
                disabled={!isFormValid || isSubmitting}
                onClick={handleSubmit}
               >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Pay Deposit & Request Approval"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}