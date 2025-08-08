import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Step6_Legal({ data, updateData }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Terms & Conditions</h2>
      <p className="text-slate-500">
        Set your terms and conditions that customers will need to agree to when booking your boat.
      </p>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These terms will be displayed to customers during the booking process. They must agree to your terms before completing their reservation.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
          <p className="text-sm text-slate-600 mb-2">
            Specify your booking terms, rules, and requirements. Include things like arrival time, dress code, prohibited items, etc.
          </p>
          <Textarea
            id="terms_and_conditions"
            value={data.terms_and_conditions || ''}
            onChange={(e) => updateData({ terms_and_conditions: e.target.value })}
            placeholder="e.g., Guests must arrive 15 minutes before departure time. No smoking on board. Life jackets will be provided. Maximum capacity strictly enforced..."
            className="h-32"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
          <p className="text-sm text-slate-600 mb-2">
            Define your cancellation and refund policy. Be clear about deadlines and any fees.
          </p>
          <Textarea
            id="cancellation_policy"
            value={data.cancellation_policy || ''}
            onChange={(e) => updateData({ cancellation_policy: e.target.value })}
            placeholder="e.g., Free cancellation up to 48 hours before charter. Cancellations within 48 hours are subject to 50% cancellation fee. No refund for cancellations within 24 hours or no-shows..."
            className="h-32"
          />
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> You are responsible for ensuring your terms comply with Australian consumer law. SydneyCharter acts only as a booking platform and is not liable for charter operations.
        </AlertDescription>
      </Alert>
    </div>
  );
}