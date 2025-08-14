import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Ship, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Building2,
  CreditCard
} from 'lucide-react';

export default function OwnerApplicationForm({ onSubmit, onCancel }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    abn: '', // Australian Business Number
    businessAddress: '',
    businessPhone: '',
    
    // Boat Experience
    yearsOfExperience: '',
    boatTypes: [],
    certifications: [],
    
    // Insurance & Licensing
    hasInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    hasLicenses: false,
    licenseTypes: [],
    
    // Documents
    identificationDocument: null,
    businessRegistration: null,
    insuranceCertificate: null,
    boatLicenses: null,
    
    // Terms & Conditions
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToFees: false
  });

  const [fileUploads, setFileUploads] = useState({
    identification: null,
    businessReg: null,
    insurance: null,
    licenses: null
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setFileUploads(prev => ({
      ...prev,
      [field]: file
    }));
    
    // Update form data with file info
    setFormData(prev => ({
      ...prev,
      [field + 'Document']: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields
    if (!formData.fullName.trim()) errors.push('Full name is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.businessName.trim()) errors.push('Business name is required');
    if (!formData.businessType) errors.push('Business type is required');
    if (!formData.abn.trim()) errors.push('ABN is required');
    if (!formData.businessAddress.trim()) errors.push('Business address is required');
    if (!formData.yearsOfExperience) errors.push('Years of experience is required');
    
    // File uploads
    if (!fileUploads.identification) errors.push('Identification document is required');
    if (!fileUploads.businessReg) errors.push('Business registration is required');
    if (!fileUploads.insurance) errors.push('Insurance certificate is required');
    
    // Terms
    if (!formData.agreeToTerms) errors.push('You must agree to terms and conditions');
    if (!formData.agreeToPrivacy) errors.push('You must agree to privacy policy');
    if (!formData.agreeToFees) errors.push('You must agree to fee structure');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key !== 'identificationDocument' && key !== 'businessRegistration' && 
            key !== 'insuranceCertificate' && key !== 'boatLicenses') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add files
      if (fileUploads.identification) submitData.append('identification', fileUploads.identification);
      if (fileUploads.businessReg) submitData.append('businessRegistration', fileUploads.businessReg);
      if (fileUploads.insurance) submitData.append('insuranceCertificate', fileUploads.insurance);
      if (fileUploads.licenses) submitData.append('boatLicenses', fileUploads.licenses);
      
      // Submit application
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      setSuccess(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Application submission error:', error);
      setError('Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Application Submitted!</CardTitle>
          <CardDescription>
            Thank you for your application. We'll review it and get back to you within 2-3 business days.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            We'll send you an email confirmation and notify you once your application has been reviewed.
          </p>
          <Button onClick={onCancel} variant="outline">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-2xl">
          <Ship className="w-6 h-6 text-blue-600" />
          <span>Boat Owner Application</span>
        </CardTitle>
        <CardDescription>
          Complete this form to apply for boat owner status on Harbour Lux
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Pre-filled from your account</p>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+61 400 000 000"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Business Information</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleSelectChange('businessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole-trader">Sole Trader</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="abn">ABN (Australian Business Number) *</Label>
                <Input
                  id="abn"
                  name="abn"
                  value={formData.abn}
                  onChange={handleInputChange}
                  placeholder="12 345 678 901"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  placeholder="+61 2 9000 0000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="businessAddress">Business Address *</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="Enter your business address"
                rows={3}
                required
              />
            </div>
          </div>
          
          {/* Boat Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Ship className="w-5 h-5 text-blue-600" />
              <span>Boat Experience</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearsOfExperience">Years of Boat Operation Experience *</Label>
                <Select value={formData.yearsOfExperience} onValueChange={(value) => handleSelectChange('yearsOfExperience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="boatTypes">Types of Boats You Operate</Label>
                <Select value={formData.boatTypes} onValueChange={(value) => handleSelectChange('boatTypes', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select boat types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sailboat">Sailboat</SelectItem>
                    <SelectItem value="motorboat">Motorboat</SelectItem>
                    <SelectItem value="yacht">Yacht</SelectItem>
                    <SelectItem value="catamaran">Catamaran</SelectItem>
                    <SelectItem value="pontoon">Pontoon</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Insurance & Licensing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Insurance & Licensing</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInsurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasInsurance: checked }))}
                />
                <Label htmlFor="hasInsurance">I have current boat insurance</Label>
              </div>
              
              {formData.hasInsurance && (
                <div className="grid md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                      placeholder="Insurance company name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                    <Input
                      id="insurancePolicyNumber"
                      name="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={handleInputChange}
                      placeholder="Policy number"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasLicenses"
                  checked={formData.hasLicenses}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLicenses: checked }))}
                />
                <Label htmlFor="hasLicenses">I have required boat operation licenses</Label>
              </div>
            </div>
          </div>
          
          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Required Documents</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="identification">Identification Document *</Label>
                <div className="mt-2">
                  <Input
                    id="identification"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('identification', e.target.files[0])}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Driver's license, passport, or other government ID</p>
              </div>
              
              <div>
                <Label htmlFor="businessReg">Business Registration *</Label>
                <div className="mt-2">
                  <Input
                    id="businessReg"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('businessReg', e.target.files[0])}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">ABN registration or business certificate</p>
              </div>
              
              <div>
                <Label htmlFor="insurance">Insurance Certificate *</Label>
                <div className="mt-2">
                  <Input
                    id="insurance"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('insurance', e.target.files[0])}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Current boat insurance certificate</p>
              </div>
              
              <div>
                <Label htmlFor="licenses">Boat Licenses (Optional)</Label>
                <div className="mt-2">
                  <Input
                    id="licenses"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('licenses', e.target.files[0])}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Boat operation licenses or certifications</p>
              </div>
            </div>
          </div>
          
          {/* Terms & Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Terms & Conditions</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked }))}
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the Harbour Lux Terms and Conditions *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToPrivacy: checked }))}
                  required
                />
                <Label htmlFor="agreeToPrivacy" className="text-sm">
                  I agree to the Privacy Policy and consent to data processing *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToFees"
                  checked={formData.agreeToFees}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToFees: checked }))}
                  required
                />
                <Label htmlFor="agreeToFees" className="text-sm">
                  I understand and agree to the platform fee structure (10% of bookings) *
                </Label>
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 