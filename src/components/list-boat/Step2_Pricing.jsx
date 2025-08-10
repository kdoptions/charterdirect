
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'; // Added CalendarIcon import
import { format } from 'date-fns';

export default function Step2_Pricing({ data, updateData }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [specialPrice, setSpecialPrice] = useState('');

  const addAvailabilityBlock = () => {
    const newBlock = {
      name: '',
      start_time: '09:00',
      end_time: '13:00',
      duration_hours: 4
    };
    updateData({
      availability_blocks: [...(data.availability_blocks || []), newBlock]
    });
  };

  const updateAvailabilityBlock = (index, field, value) => {
    const newBlocks = [...(data.availability_blocks || [])];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    
    // Auto-calculate duration when times change
    if (field === 'start_time' || field === 'end_time') {
      const start = new Date(`2000-01-01T${newBlocks[index].start_time}`);
      const end = new Date(`2000-01-01T${newBlocks[index].end_time}`);
      const duration = (end - start) / (1000 * 60 * 60);
      newBlocks[index].duration_hours = Math.max(0, duration);
    }
    
    updateData({ availability_blocks: newBlocks });
  };

  const removeAvailabilityBlock = (index) => {
    const newBlocks = (data.availability_blocks || []).filter((_, i) => i !== index);
    updateData({ availability_blocks: newBlocks });
  };

  const addSpecialPricing = () => {
    if (!selectedDate || !specialPrice) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const newSpecialPricing = [...(data.special_pricing || [])];
    
    // Remove existing pricing for this date if it exists
    const filteredPricing = newSpecialPricing.filter(p => p.date !== dateString);
    
    // Add new pricing
    filteredPricing.push({
      date: dateString,
      price_per_hour: parseFloat(specialPrice)
    });
    
    updateData({ special_pricing: filteredPricing });
    setSelectedDate(null);
    setSpecialPrice('');
  };

  const removeSpecialPricing = (dateToRemove) => {
    const newSpecialPricing = (data.special_pricing || []).filter(p => p.date !== dateToRemove);
    updateData({ special_pricing: newSpecialPricing });
  };

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
            value={data.price_per_hour} 
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                updateData({ price_per_hour: e.target.value });
              }
            }}
            onBlur={(e) => updateData({ price_per_hour: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extended_booking_price">Extended Booking Price (7+ hours)</Label>
          <Input 
            id="extended_booking_price" 
            type="text" 
            inputMode="decimal"
            value={data.extended_booking_price} 
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                updateData({ extended_booking_price: e.target.value });
              }
            }}
            onBlur={(e) => updateData({ extended_booking_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Custom Availability Blocks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="font-semibold">Availability Blocks</Label>
            <p className="text-sm text-slate-500">Define custom time blocks when your boat is available.</p>
          </div>
          <Button variant="outline" size="sm" onClick={addAvailabilityBlock}>
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>
        
        <div className="space-y-4">
          {(data.availability_blocks || []).map((block, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Block Name</Label>
                <Input
                  value={block.name}
                  onChange={(e) => updateAvailabilityBlock(index, 'name', e.target.value)}
                  placeholder="e.g., Morning"
                />
              </div>
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={block.start_time}
                  onChange={(e) => updateAvailabilityBlock(index, 'start_time', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={block.end_time}
                  onChange={(e) => updateAvailabilityBlock(index, 'end_time', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Duration</Label>
                <Badge variant="outline">{block.duration_hours || 0}h</Badge>
              </div>
              <div>
                <Button variant="destructive" size="icon" onClick={() => removeAvailabilityBlock(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {(data.availability_blocks || []).length === 0 && (
            <p className="text-slate-500 text-center py-4">No availability blocks defined. Add your first block above.</p>
          )}
        </div>
      </div>

      {/* Special Pricing Dates */}
      <div>
        <Label className="font-semibold">Special Pricing Dates</Label>
        <p className="text-sm text-slate-500 mb-4">Set custom prices for specific dates (e.g., holidays, events).</p>
        
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
            
            <div className="space-y-2">
              <Label htmlFor="special-price">Price for Selected Date (AUD)</Label>
              <Input
                id="special-price"
                type="text"
                inputMode="decimal"
                value={specialPrice}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    setSpecialPrice(e.target.value);
                  }
                }}
                placeholder="Enter price per hour"
              />
            </div>
            
            <Button 
              onClick={addSpecialPricing}
              disabled={!selectedDate || !specialPrice}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Special Pricing
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
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {format(new Date(pricing.date), 'EEEE, MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-slate-600">
                          ${pricing.price_per_hour}/hour
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecialPricing(pricing.date)}
                        className="text-red-600 hover:text-red-800"
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
                  <p className="text-sm">Select dates on the calendar to add custom pricing</p>
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
            onBlur={(e) => updateData({ weekend_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="off_season_discount">Off-Season Discount (%)</Label>
          <Input 
            id="off_season_discount" 
            type="text" 
            inputMode="numeric"
            value={data.off_season_discount} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ off_season_discount: e.target.value });
              }
            }}
            onBlur={(e) => updateData({ off_season_discount: parseInt(e.target.value, 10) || 0 })}
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
            value={data.down_payment_percentage} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ down_payment_percentage: e.target.value });
              }
            }}
            onBlur={(e) => {
              const value = parseInt(e.target.value, 10) || 30;
              // Ensure minimum 10% down payment
              const validatedValue = Math.max(10, value);
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
            value={data.early_bird_discount} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ early_bird_discount: e.target.value });
              }
            }}
            onBlur={(e) => updateData({ early_bird_discount: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="early_bird_days">Days in Advance</Label>
          <Input 
            id="early_bird_days" 
            type="text" 
            inputMode="numeric"
            value={data.early_bird_days} 
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                updateData({ early_bird_days: e.target.value });
              }
            }}
            onBlur={(e) => updateData({ early_bird_days: parseInt(e.target.value, 10) || 14 })}
          />
        </div>
      </div>
    </div>
  );
}
