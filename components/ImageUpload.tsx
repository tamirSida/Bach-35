'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DrillImage } from '@/types/drill';

interface ImageUploadProps {
  images: DrillImage[];
  onImagesChange: (images: DrillImage[]) => void;
}

export default function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'bach35/drills');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.secure_url,
          publicId: data.public_id
        };
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: DrillImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = await uploadToCloudinary(file);
      
      if (uploadResult) {
        newImages.push({
          url: uploadResult.url,
          title: file.name.split('.')[0], // Default title from filename
          publicId: uploadResult.publicId
        });
      }
    }

    onImagesChange([...images, ...newImages]);
    setUploading(false);
    
    // Reset file input
    event.target.value = '';
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], title: newTitle };
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">תמונות</label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <button
            type="button"
            disabled={uploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}
            {uploading ? 'מעלה...' : 'הוסף תמונות'}
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded p-4">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="text-red-600 hover:text-red-800 flex-shrink-0"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              
              <img
                src={image.url}
                alt={image.title}
                className="w-12 h-12 object-cover rounded flex-shrink-0"
              />
              
              <input
                type="text"
                value={image.title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder="כותרת התמונה"
                className="flex-1 p-2 border border-gray-300 rounded text-right text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}