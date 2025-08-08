
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const boatTypes = [
  { value: "yacht", label: "Yacht" },
  { value: "catamaran", label: "Catamaran" },
  { value: "sailing_boat", label: "Sailing Boat" },
  { value: "motor_boat", label: "Motor Boat" },
  { value: "pontoon", label: "Pontoon" },
  { value: "speedboat", label: "Speedboat" },
  { value: "luxury_yacht", label: "Luxury Yacht" }
];

export default function Step1_Details({ data, updateData }) {
  const handleChange = (e) => {
    updateData({ [e.target.id]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Boat Details</h2>
      <p className="text-slate-500">
        Start by telling us about your boat. This information will be used to create your public listing page.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Boat Name</Label>
          <Input id="name" value={data.name} onChange={handleChange} placeholder="e.g., The Sea Breeze" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="boat_type">Boat Type</Label>
          <Select value={data.boat_type} onValueChange={(value) => updateData({ boat_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select boat type" />
            </SelectTrigger>
            <SelectContent>
              {boatTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={data.description} onChange={handleChange} placeholder="Describe what makes your boat special..." className="h-32" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="max_guests">Max Guests</Label>
          <Input
            id="max_guests"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.max_guests}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              updateData({ max_guests: val === '' ? '' : Number(val) });
            }}
            placeholder="e.g., 12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location / Marina</Label>
          <Input id="location" value={data.location} onChange={handleChange} placeholder="e.g., Darling Harbour" />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Captain</Label>
        <RadioGroup
          value={data.with_captain ? "true" : "false"}
          onValueChange={(value) => updateData({ with_captain: value === "true" })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="with-captain" />
            <Label htmlFor="with-captain">With Captain (I will operate the boat)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="without-captain" />
            <Label htmlFor="without-captain">Self-Drive (Bareboat charter)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
