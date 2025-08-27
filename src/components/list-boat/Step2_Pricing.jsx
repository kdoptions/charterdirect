
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { CalendarDays, Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react'; // Added CalendarIcon import
import React, { useState } from 'react';
import CalendarIntegrationSelector from './CalendarIntegrationSelector';

export default function Step2_Pricing({ data, updateData }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [specialPrice, setSpecialPrice] = useState('');
  const [specialDailyRate, setSpecialDailyRate] = useState('');
  const [pricingType, setPricingType] = useState('hourly'); // 'hourly' or 'daily'
  const [specialPricingName, setSpecialPricingName] = useState('');
  const [specialStartTime, setSpecialStartTime] = useState('09:00');
  const [specialEndTime, setSpecialEndTime] = useState('17:00');

  const addAvailabilityBlock = () => {
    const newBlock = {
      name: '',
      start_time: '09:00',
      end_time: '13:00',
      duration_hours: 4,
      error: null
    };
    
    // Validate the new block immediately
    try {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!newBlock.start_time || !newBlock.end_time || !timeRegex.test(newBlock.start_time) || !timeRegex.test(newBlock.end_time)) {
        newBlock.error = "Invalid time format. Use HH:MM (e.g., 09:00)";
        newBlock.duration_hours = 0;
      } else {
        const [startHour, startMinute] = newBlock.start_time.split(':').map(Number);
        const [endHour, endMinute] = newBlock.end_time.split(':').map(Number);
        
        // Validate parsed numbers
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          console.error("❌ Invalid time values in new block:", { startHour, startMinute, endHour, endMinute });
          newBlock.error = "Invalid time values";
          newBlock.duration_hours = 0;
        } else {
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
        
        let durationMinutes;
        if (endMinutes <= startMinutes) {
          durationMinutes = (24 * 60 - startMinutes) + endMinutes;
        } else {
          durationMinutes = endMinutes - startMinutes;
        }
        
        const duration = durationMinutes / 60;
        
        // Validate duration
        if (isNaN(duration) || duration <= 0) {
          newBlock.duration_hours = 0;
          newBlock.error = "Invalid duration calculated";
        } else {
          newBlock.duration_hours = Math.round(duration * 100) / 100;
        
        // Log the new format
        const totalMinutes = Math.round(newBlock.duration_hours * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const durationDisplay = minutes === 0 ? `${hours}h` : `${hours}:${minutes.toString().padStart(2, '0')}`;
        console.log("✅ New block duration:", { duration: newBlock.duration_hours, durationDisplay });
        }
        }
      }
    } catch (error) {
      console.error("❌ Error validating new block:", error);
      newBlock.error = "Error validating time block";
      newBlock.duration_hours = 0;
    }
    
    updateData({
      availability_blocks: [...(data.availability_blocks || []), newBlock]
    });
  };

  const updateAvailabilityBlock = (index, field, value) => {
    const newBlocks = [...(data.availability_blocks || [])];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    
    // Auto-calculate duration when times change
    if (field === 'start_time' || field === 'end_time') {
      try {
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const startTime = newBlocks[index].start_time;
        const endTime = newBlocks[index].end_time;
        
        if (!startTime || !endTime || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
          console.error("❌ Invalid time format:", { startTime, endTime });
          newBlocks[index].duration_hours = 0;
          newBlocks[index].error = "Invalid time format. Use HH:MM (e.g., 09:00)";
        } else {
          // Parse times properly
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          // Validate parsed numbers
          if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            console.error("❌ Invalid time values:", { startHour, startMinute, endHour, endMinute });
            newBlocks[index].duration_hours = 0;
            newBlocks[index].error = "Invalid time values";
            return;
          }
          
          // Convert to minutes for accurate calculation
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          
          // Handle overnight bookings (end time < start time)
          let durationMinutes;
          if (endMinutes <= startMinutes) {
            // Overnight booking (e.g., 22:00 to 02:00)
            durationMinutes = (24 * 60 - startMinutes) + endMinutes;
          } else {
            durationMinutes = endMinutes - startMinutes;
          }
          
          const duration = durationMinutes / 60;
          
          // Validate duration
          if (isNaN(duration) || duration <= 0) {
            newBlocks[index].duration_hours = 0;
            newBlocks[index].error = "End time must be after start time";
          } else if (duration > 24) {
            newBlocks[index].duration_hours = 24;
            newBlocks[index].error = "Maximum duration is 24 hours";
          } else {
            newBlocks[index].duration_hours = Math.round(duration * 100) / 100; // Round to 2 decimal places
            newBlocks[index].error = null; // Clear any previous errors
          }
          
          // Format duration for display
          const totalMinutes = Math.round(newBlocks[index].duration_hours * 60);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const durationDisplay = minutes === 0 ? `${hours}h` : `${hours}:${minutes.toString().padStart(2, '0')}`;
          
          console.log("✅ Time calculation:", { 
            startTime, 
            endTime, 
            startMinutes, 
            endMinutes, 
            durationMinutes, 
            duration: newBlocks[index].duration_hours,
            durationDisplay
          });
        }
      } catch (error) {
        console.error("❌ Error calculating duration:", error);
        newBlocks[index].duration_hours = 0;
        newBlocks[index].error = "Error calculating duration";
      }
    }
    
    updateData({ availability_blocks: newBlocks });
  };

  const removeAvailabilityBlock = (index) => {
    const newBlocks = (data.availability_blocks || []).filter((_, i) => i !== index);
    updateData({ availability_blocks: newBlocks });
  };

  const addSpecialPricing = () => {
    if (!selectedDate) return;
    
    // Ensure date is handled in local timezone without conversion
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    console.log('🔍 Selected date object:', selectedDate);
    console.log('🔍 Formatted date string:', dateString);
    console.log('🔍 Date timezone info:', {
      toISOString: selectedDate.toISOString(),
      toDateString: selectedDate.toDateString(),
      getTimezoneOffset: selectedDate.getTimezoneOffset()
    });
    const newSpecialPricing = [...(data.special_pricing || [])];
    
    // Remove existing pricing for this date if it exists
    const filteredPricing = newSpecialPricing.filter(p => p.date !== dateString);
    
    // Add new pricing based on type
    let newPricing;
    if (pricingType === 'hourly') {
      if (!specialPrice) return;
      newPricing = {
        date: dateString,
        pricing_type: 'hourly',
        price_per_hour: parseFloat(specialPrice) || 0,
        name: specialPricingName || null,
        start_time: specialStartTime,
        end_time: specialEndTime
      };
    } else {
      if (!specialDailyRate) return;
      newPricing = {
        date: dateString,
        pricing_type: 'daily',
        price_per_day: parseFloat(specialDailyRate) || 0,
        name: specialPricingName || null,
        start_time: specialStartTime,
        end_time: specialEndTime
      };
    }
    
    // Debug logging
    console.log('🔍 Adding special pricing:', newPricing);
    console.log('🔍 Event name value:', specialPricingName);
    console.log('🔍 Event name type:', typeof specialPricingName);
    
    filteredPricing.push(newPricing);
    
    console.log('🔍 Updated special_pricing array:', filteredPricing);
    
    console.log('🔍 Calling updateData with:', { special_pricing: filteredPricing });
    updateData({ special_pricing: filteredPricing });
    
    // Reset form
    setSelectedDate(null);
    setSpecialPrice('');
    setSpecialDailyRate('');
    setSpecialPricingName('');
    setSpecialStartTime('09:00');
    setSpecialEndTime('17:00');
  };

  const removeSpecialPricing = (dateToRemove) => {
    const newSpecialPricing = (data.special_pricing || []).filter(p => p.date !== dateToRemove);
    updateData({ special_pricing: newSpecialPricing });
  };

  // Validate all availability blocks
  const validateAllBlocks = () => {
    const blocks = data.availability_blocks || [];
    const errorBlocks = blocks.filter(b => b.error);
    return {
      isValid: errorBlocks.length === 0,
      errorCount: errorBlocks.length,
      totalBlocks: blocks.length
    };
  };

  // Get validation status for parent component
  React.useEffect(() => {
    if (data.availability_blocks) {
      const validation = validateAllBlocks();
      // Expose validation status to parent component via a callback
      // Don't add _validation to the main data object
      if (updateData && typeof updateData === 'function') {
        // Only update the main data if there are actual changes, not validation
        // The validation will be handled separately by the parent component
      }
    }
  }, [data.availability_blocks]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Pricing & Availability</h2>
      <p className="text-slate-500">Set your prices and define when your boat is available for charter.</p>

      {/* Base Pricing */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price_per_hour">Price Per Hour (AUD)</Label>
          <Input 
            id="price_per_hour" 
            type="text" 
            inputMode="decimal"
            value={data.price_per_hour || ''} 
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                updateData({ price_per_hour: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ price_per_hour: value ? parseFloat(value) || 0 : 0 });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extended_booking_price">Extended Booking Price (7+ hours)</Label>
          <Input 
            id="extended_booking_price" 
            type="text" 
            inputMode="decimal"
            value={data.extended_booking_price || ''} 
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                updateData({ extended_booking_price: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ extended_booking_price: value ? parseFloat(value) || 0 : 0 });
            }}
          />
        </div>
      </div>

      {/* Custom Availability Blocks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="font-semibold">Availability Blocks</Label>
            <p className="text-sm text-slate-500">
              Define custom time blocks when your boat is available. 
              <span className="block mt-1 text-xs text-blue-600">
                💡 Tip: Use 24-hour format (e.g., 09:00, 14:30). Duration shows as hours:minutes (e.g., 4:00 = 4 hours, 1:30 = 1.5 hours)
              </span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addAvailabilityBlock}>
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>
        
        {/* Validation Summary */}
        {(() => {
          const blocks = data.availability_blocks || [];
          const validBlocks = blocks.filter(b => !b.error && b.duration_hours > 0);
          const errorBlocks = blocks.filter(b => b.error);
          
          if (blocks.length === 0) return null;
          
          return (
            <div className={`mb-4 p-3 rounded-lg border ${
              errorBlocks.length > 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                {errorBlocks.length > 0 ? (
                  <>
                    <span className="text-red-600">⚠️</span>
                    <span className="text-red-700">
                      {errorBlocks.length} time block{errorBlocks.length > 1 ? 's' : ''} have errors. 
                      Please fix them before saving.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-green-600">✅</span>
                    <span className="text-green-700">
                      All {validBlocks.length} time block{validBlocks.length > 1 ? 's' : ''} are valid!
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })()}
        
        <div className="space-y-4">
          {(data.availability_blocks || []).map((block, index) => (
            <div key={index} className={`grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-4 border rounded-lg ${
              block.error ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="space-y-1">
                <Label>Block Name</Label>
                <Input
                  value={block.name}
                  onChange={(e) => updateAvailabilityBlock(index, 'name', e.target.value)}
                  placeholder="e.g., Morning"
                  className={block.error ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={block.start_time || ''}
                  onChange={(e) => updateAvailabilityBlock(index, 'start_time', e.target.value)}
                  className={block.error ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={block.end_time || ''}
                  onChange={(e) => updateAvailabilityBlock(index, 'end_time', e.target.value)}
                  className={block.error ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Duration</Label>
                <Badge variant={block.error ? "destructive" : "outline"}>
                  {(() => {
                    if (!block.duration_hours || block.duration_hours === 0) return "0h";
                    
                    const totalMinutes = Math.round(block.duration_hours * 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    
                    if (minutes === 0) {
                      return `${hours}h`;
                    } else {
                      return `${hours}:${minutes.toString().padStart(2, '0')}`;
                    }
                  })()}
                </Badge>
              </div>
              <div>
                <Button variant="destructive" size="icon" onClick={() => removeAvailabilityBlock(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Error Display */}
              {block.error && (
                <div className="col-span-full mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                  ⚠️ {block.error}
                </div>
              )}
              
              {/* Validation Warnings */}
              {!block.error && block.duration_hours > 0 && (
                <div className="col-span-full mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  ✅ Valid time block: {block.start_time} - {block.end_time} ({(() => {
                    const totalMinutes = Math.round(block.duration_hours * 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    
                    if (minutes === 0) {
                      return `${hours}h`;
                    } else {
                      return `${hours}:${minutes.toString().padStart(2, '0')}`;
                    }
                  })()})
                </div>
              )}
            </div>
          ))}
          
          {(data.availability_blocks || []).length === 0 && (
            <p className="text-slate-500 text-center py-4">No availability blocks defined. Add your first block above.</p>
          )}
        </div>
      </div>

      {/* Google Calendar Integration */}
      <CalendarIntegrationSelector data={data} updateData={updateData} />

      {/* Special Pricing Dates */}
      <div>
        <Label className="font-semibold">Special Pricing Dates</Label>
        <p className="text-sm text-slate-500 mb-4">Set custom hourly or daily rates for specific dates (e.g., holidays, events, peak season).</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar and Input */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Select Date</Label>
              <div className="mt-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="border rounded-lg"
                />
              </div>
            </div>
            
            {/* Pricing Type Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pricing Type</Label>
              <div className="flex border rounded-lg p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setPricingType('hourly');
                    setSpecialDailyRate('');
                    setSpecialPricingName('');
                    setSpecialStartTime('09:00');
                    setSpecialEndTime('17:00');
                  }}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    pricingType === 'hourly'
                      ? 'bg-white text-slate-900 shadow-sm border'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Per Hour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPricingType('daily');
                    setSpecialPrice('');
                    setSpecialPricingName('');
                    setSpecialStartTime('09:00');
                    setSpecialEndTime('17:00');
                  }}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    pricingType === 'daily'
                      ? 'bg-white text-slate-900 shadow-sm border'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Per Day
                </button>
              </div>
            </div>
            
            {/* Optional Name */}
            <div className="space-y-2">
              <Label htmlFor="special-pricing-name">
                Event Name (Optional)
              </Label>
              <Input
                id="special-pricing-name"
                type="text"
                value={specialPricingName}
                onChange={(e) => setSpecialPricingName(e.target.value)}
                placeholder="e.g., Christmas Day, New Year's Eve, Peak Season"
              />
            </div>

            {/* Custom Times */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Custom Booking Times</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="special-start-time" className="text-xs">Start Time</Label>
                  <Input
                    id="special-start-time"
                    type="time"
                    value={specialStartTime}
                    onChange={(e) => setSpecialStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="special-end-time" className="text-xs">End Time</Label>
                  <Input
                    id="special-end-time"
                    type="time"
                    value={specialEndTime}
                    onChange={(e) => setSpecialEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="special-price">
                {pricingType === 'hourly' ? 'Price per Hour' : 'Price per Day'} (AUD)
              </Label>
              <Input
                id="special-price"
                type="text"
                inputMode="decimal"
                value={pricingType === 'hourly' ? specialPrice : specialDailyRate}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    if (pricingType === 'hourly') {
                      setSpecialPrice(e.target.value);
                    } else {
                      setSpecialDailyRate(e.target.value);
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && !isNaN(parseFloat(value))) {
                    if (pricingType === 'hourly') {
                      setSpecialPrice(parseFloat(value).toString());
                    } else {
                      setSpecialDailyRate(parseFloat(value).toString());
                    }
                  }
                }}
                placeholder={pricingType === 'hourly' ? 'Enter price per hour' : 'Enter price per day'}
              />
            </div>
            
            <Button 
              onClick={addSpecialPricing}
              disabled={!selectedDate || (pricingType === 'hourly' ? !specialPrice : !specialDailyRate)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Special {pricingType === 'hourly' ? 'Hourly' : 'Daily'} Pricing
            </Button>
          </div>
          
          {/* Current Special Pricing List */}
          <div>
            <Label className="text-sm font-medium">Special Pricing Calendar</Label>
            <div className="mt-2 max-h-96 overflow-y-auto border rounded-lg p-4">
              {(data.special_pricing || []).length > 0 ? (
                <div className="space-y-3">
                  {(data.special_pricing || [])
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((pricing, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">
                          {format(new Date(pricing.date), 'EEEE, MMM d, yyyy')}
                          {pricing.name && (
                            <span className="ml-2 text-sm font-normal text-blue-600">
                              • {pricing.name}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {pricing.pricing_type === 'daily' || pricing.price_per_day ? (
                            <>
                              <CalendarDays className="w-4 h-4 inline mr-1" />
                              ${pricing.price_per_day || pricing.price_per_hour}/day
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 inline mr-1" />
                              ${pricing.price_per_hour}/hour
                            </>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          <Badge variant="outline" className="text-xs mr-2">
                            {pricing.pricing_type === 'daily' || pricing.price_per_day ? 'Daily Rate' : 'Hourly Rate'}
                          </Badge>
                          {pricing.start_time && pricing.end_time && (
                            <span className="text-slate-600">
                              {pricing.start_time} - {pricing.end_time}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecialPricing(pricing.date)}
                        className="text-red-600 hover:text-red-800 ml-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  {/* Changed Calendar to CalendarIcon here */}
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" /> 
                  <p>No special pricing dates set</p>
                  <p className="text-sm">Select dates on the calendar to add custom hourly or daily pricing</p>
                  <p className="text-xs mt-1">You can add event names and custom booking times</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekend Pricing */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="weekend_price">Weekend Price Per Hour (AUD)</Label>
          <Input 
            id="weekend_price" 
            type="text" 
            inputMode="decimal"
            value={data.weekend_price || ''} 
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                updateData({ weekend_price: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ weekend_price: value ? parseFloat(value) || 0 : 0 });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="off_season_discount">Off-Season Discount (%)</Label>
          <Input 
            id="off_season_discount" 
            type="text" 
            inputMode="numeric"
            value={data.off_season_discount || ''} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ off_season_discount: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ off_season_discount: value ? parseInt(value, 10) || 0 : 0 });
            }}
          />
        </div>
      </div>
      
      {/* Down Payment & Early Bird */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="down_payment">Down Payment Required (%)</Label>
          <Input 
            id="down_payment" 
            type="text" 
            inputMode="numeric"
            value={data.down_payment_percentage || ''} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ down_payment_percentage: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const parsedValue = value ? parseInt(value, 10) || 30 : 30;
              // Ensure minimum 10% down payment
              const validatedValue = Math.max(10, parsedValue);
              updateData({ down_payment_percentage: validatedValue });
            }}
            min="10"
            max="100"
          />
          <p className="text-xs text-slate-500">Minimum 10% required</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="early_bird_discount">Early Bird Discount (%)</Label>
          <Input 
            id="early_bird_discount" 
            type="text" 
            inputMode="numeric"
            value={data.early_bird_discount || ''} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ early_bird_discount: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ early_bird_discount: value ? parseInt(value, 10) || 0 : 0 });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="early_bird_days">Days in Advance</Label>
          <Input 
            id="early_bird_days" 
            type="text" 
            inputMode="numeric"
            value={data.early_bird_days || ''} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ early_bird_days: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              updateData({ early_bird_days: value ? parseInt(value, 10) || 14 : 14 });
            }}
          />
        </div>
      </div>
    </div>
  );
}
