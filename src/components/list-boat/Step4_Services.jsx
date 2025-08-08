import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

const popularAmenities = [
  "Premium sound system", "Air conditioning", "Full bar setup", "Swim platform",
  "Kitchen/Galley", "Restroom", "BBQ Grill", "Sun deck", "Fishing gear", "WiFi"
];

export default function Step4_Services({ data, updateData }) {
  const handleAmenityChange = (amenity) => {
    const newAmenities = data.amenities.includes(amenity)
      ? data.amenities.filter(a => a !== amenity)
      : [...data.amenities, amenity];
    updateData({ amenities: newAmenities });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...data.additional_services];
    newServices[index][field] = value;
    updateData({ additional_services: newServices });
  };

  const addService = () => {
    updateData({
      additional_services: [
        ...data.additional_services,
        { name: '', price: 0, description: '' }
      ]
    });
  };

  const removeService = (index) => {
    const newServices = data.additional_services.filter((_, i) => i !== index);
    updateData({ additional_services: newServices });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Amenities & Extra Services</h2>
      <p className="text-slate-500">
        Let customers know what features your boat has and what additional services you offer.
      </p>

      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {popularAmenities.map(amenity => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={data.amenities.includes(amenity)}
                onCheckedChange={() => handleAmenityChange(amenity)}
              />
              <Label htmlFor={amenity}>{amenity}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional Services */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Additional Services</h3>
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </div>
        <div className="space-y-4">
          {data.additional_services.map((service, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end p-4 border rounded-lg">
              <div className="md:col-span-3 space-y-1">
                <Label>Service Name</Label>
                <Input
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  placeholder="e.g., Catering Package"
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <Label>Description</Label>
                <Input
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  placeholder="e.g., per person"
                />
              </div>
              <div className="md:col-span-1 space-y-1">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                />
              </div>
              <div className="md:col-span-1">
                <Button variant="destructive" size="icon" onClick={() => removeService(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}