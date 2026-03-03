
import React, { useState } from 'react';
import { ImageFile } from '../types';
import ImageCropper from './ImageCropper';

interface ImageUploaderProps {
  onFileUpload: (files: File[]) => void;
  images: ImageFile[];
  title: string;
  id: string;
  multiple?: boolean;
  onRemove?: (index: number) => void;
  isUploading?: boolean;
  onImageUpdate?: (index: number, newImage: ImageFile) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FFD700] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileUpload, images, title, id, multiple = false, onRemove, isUploading = false, onImageUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full min-h-[180px] relative overflow-hidden rounded-[2rem] bg-black/40 group/container" onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) onFileUpload(Array.from(e.dataTransfer.files)); }}>
      <label htmlFor={id} className="cursor-pointer group block w-full h-full">
        <div className={`w-full h-full relative border-4 rounded-[2rem] text-center transition-all duration-500 bg-transparent flex flex-col justify-center items-center ${isDragging ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-dashed border-white/5 hover:border-[#FFD700]/40 hover:bg-white/5'}`}>
          {images.length > 0 ? (
            <div className="absolute inset-0 w-full h-full group/image bg-transparent p-4">
                <img src={`data:${images[0].mimeType};base64,${images[0].base64}`} alt={title} className="w-full h-full object-contain rounded-xl" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove?.(0); }} className="bg-red-500 text-white rounded-full p-2.5 shadow-xl hover:bg-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD700] mb-2"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Processing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center px-6">
              <UploadIcon />
              <p className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors">{title}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">أو اسحب الصورة هنا</p>
            </div>
          )}
        </div>
      </label>
      <input id={id} type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(Array.from(e.target.files || []))} multiple={multiple} disabled={isUploading} />
    </div>
  );
};

export default ImageUploader;
