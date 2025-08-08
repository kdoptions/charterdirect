import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default function Step5_Payments({ data, updateData }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Payments & Confirmation</h2>
      <p className="text-slate-500">
        Finally, set up your payments and confirm you meet all legal requirements.
      </p>

      {/* Stripe Connect */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Payment Setup</h3>
        <p className="text-sm text-slate-600 mb-2">
          We use Stripe for secure payments directly to you. Please enter your Stripe Account ID.
        </p>
        <p className="text-xs text-slate-500 mb-4">
          In a real application, you would be redirected to Stripe to securely connect your account.
        </p>
        <div className="space-y-2">
          <Label htmlFor="stripe_account_id">Stripe Account ID</Label>
          <Input 
            id="stripe_account_id" 
            value={data.stripe_account_id} 
            onChange={(e) => updateData({ stripe_account_id: e.target.value })}
            placeholder="acct_..." 
          />
        </div>
      </div>

      {/* Disclaimer */}
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle className="font-bold">Host Responsibility Agreement</AlertTitle>
        <AlertDescription>
          <p className="mt-2 mb-4">
            By listing your boat on SydneyCharter, you confirm that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>You possess all necessary local and national licenses to operate a commercial charter vessel.</li>
            <li>Your boat has valid and current liability insurance that covers paying passengers.</li>
            <li>You are fully responsible for the safety and operation of your vessel at all times.</li>
          </ul>
          <p className="mt-4">
            SydneyCharter acts as a booking platform and is not liable for any incidents.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="terms" 
          checked={agreed}
          onCheckedChange={() => setAgreed(!agreed)}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and agree to the Host Responsibility Agreement.
        </label>
      </div>
    </div>
  );
}