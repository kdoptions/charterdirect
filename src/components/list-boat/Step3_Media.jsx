import React, { useState } from 'react';
import { imageUploadService } from '@/api/imageUploadService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Step3_Media({ data, updateData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('📸 Starting upload for file:', file.name);
      
      // Upload the image
      const uploadResult = await imageUploadService.uploadImage(file);
      
      console.log('✅ Upload successful:', uploadResult);
      
      // Add the image URL to the form data
      const newImages = [...(data.images || []), uploadResult.url];
      updateData({ images: newImages });
      
      console.log('📸 Updated images array:', newImages);
      
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // For now, just upload the first image
      await handleFileUpload(imageFiles[0]);
    }
  };

  const removeImage = (index) => {
    const newImages = data.images.filter((_, i) => i !== index);
    updateData({ images: newImages });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Photos & Media</h2>
      <p className="text-slate-500">
        High-quality photos are crucial for attracting bookings. Upload at least one photo of your boat.
      </p>

      <div>
        <Label htmlFor="image-upload" className="font-semibold">Upload Images</Label>
        <div 
          className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <ImageIcon className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-400' : 'text-slate-400'}`} />
            <div className="flex text-sm text-slate-600">
              <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                <span>Upload a file</span>
                <Input 
                  id="image-upload" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleFileInputChange} 
                  accept="image/*" 
                  disabled={isUploading} 
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP up to 10MB</p>
            {isDragOver && (
              <p className="text-xs text-blue-600 font-medium">Drop your image here</p>
            )}
          </div>
        </div>
        {isUploading && (
          <div className="flex items-center mt-2 text-blue-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Uploading image...
          </div>
        )}
        {uploadError && (
          <Alert className="mt-2 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {data.images && data.images.length > 0 && (
        <div>
          <h3 className="font-semibold">Uploaded Images ({data.images.length})</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.images.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`Boat image ${index + 1}`} 
                  className="rounded-lg object-cover h-32 w-full border border-gray-200"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', url);
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Failed+To+Load';
                  }}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            💡 Images will be saved when you complete the boat listing process.
          </p>
        </div>
      )}

      {/* Placeholder for other media */}
      <div>
        <Label htmlFor="other-media" className="font-semibold">Other Media (e.g., YouTube link)</Label>
        <Input id="other-media" placeholder="https://youtube.com/watch?v=..." disabled />
        <p className="text-sm text-slate-400 mt-1">Video support is coming soon.</p>
      </div>
    </div>
  );
}