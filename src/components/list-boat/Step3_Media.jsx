import React, { useState } from 'react';
// Mock file upload function
const UploadFile = async (file) => {
  console.log('Mock file upload:', file);
  return { url: 'mock-url-' + Date.now() };
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function Step3_Media({ data, updateData }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      updateData({ images: [...data.images, file_url] });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
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
        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex text-sm text-slate-600">
              <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                <span>Upload a file</span>
                <Input id="image-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {isUploading && <div className="flex items-center mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</div>}
      </div>

      {data.images.length > 0 && (
        <div>
          <h3 className="font-semibold">Uploaded Images</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.images.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={`Boat image ${index + 1}`} className="rounded-lg object-cover h-32 w-full" />
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