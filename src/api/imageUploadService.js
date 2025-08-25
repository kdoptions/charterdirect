import { supabase } from '@/lib/supabase';

export const imageUploadService = {
  // Upload a single image file to Supabase Storage
  uploadImage: async (file, boatId = null) => {
    try {
      console.log('📸 Starting image upload:', { fileName: file.name, fileSize: file.size, boatId });
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please use JPEG, PNG, GIF, or WebP');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `boat-images/${boatId || 'temp'}/${timestamp}-${randomId}.${fileExtension}`;
      
      console.log('📸 Generated filename:', fileName);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('boat-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('❌ Supabase storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      console.log('✅ File uploaded to storage:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('boat-images')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      console.log('✅ Public URL generated:', publicUrl);
      
      return {
        url: publicUrl,
        path: fileName,
        fileName: file.name,
        fileSize: file.size
      };
      
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  },
  
  // Upload multiple images
  uploadMultipleImages: async (files, boatId = null) => {
    try {
      console.log('📸 Starting multiple image upload:', { fileCount: files.length, boatId });
      
      const uploadPromises = Array.from(files).map(file => 
        imageUploadService.uploadImage(file, boatId)
      );
      
      const results = await Promise.all(uploadPromises);
      console.log('✅ All images uploaded successfully:', results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Multiple image upload failed:', error);
      throw error;
    }
  },
  
  // Delete an image from storage
  deleteImage: async (imagePath) => {
    try {
      console.log('🗑️ Deleting image from storage:', imagePath);
      
      const { error } = await supabase.storage
        .from('boat-images')
        .remove([imagePath]);
      
      if (error) {
        console.error('❌ Failed to delete image:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      console.log('✅ Image deleted successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Image deletion failed:', error);
      throw error;
    }
  },
  
  // Get image URL from path
  getImageUrl: (imagePath) => {
    const { data } = supabase.storage
      .from('boat-images')
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  }
};
