
import React, { useState } from 'react';
import { ImageFile } from '../types';
import ImageUploader from './ImageUploader';
import ImageCropper from './ImageCropper';

interface ImageWorkspaceProps {
  images: ImageFile[];
  onImagesUpload: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  isUploading: boolean;
  onImageUpdate?: (index: number, newImage: ImageFile) => void;
  title?: string;
  id?: string;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white/40 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const base64ToFile = (base64: string, mimeType: string, fileName: string): File => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mimeType });
}

const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ 
  images, onImagesUpload, onImageRemove, isUploading, onImageUpdate, title = "Upload Image(s)", id = "image-workspace-uploader"
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleAddMoreUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file: File) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) onImagesUpload(imageFiles);
    }
    event.target.value = '';
  };

  const handleCropConfirm = async (croppedFile: File) => {
    if (editingIndex === null || !onImageUpdate) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageUpdate(editingIndex, { base64: base64String.split(',')[1], mimeType: croppedFile.type, name: croppedFile.name });
        setEditingIndex(null);
    };
    reader.readAsDataURL(croppedFile);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
        <div className="w-full aspect-square relative rounded-3xl overflow-hidden border border-white/5 shadow-inner">
            <ImageUploader id={id} title={title} images={images} onFileUpload={onImagesUpload} multiple={true} onRemove={onImageRemove} isUploading={isUploading && images.length === 0} onImageUpdate={onImageUpdate} />
        </div>
        
        {images.length > 0 && (
          <div className="w-full">
            <div className="flex flex-row-reverse items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
               <label htmlFor={`${id}-add-more`} className="cursor-pointer group h-12 w-12 sm:h-14 sm:w-14 shrink-0 active:scale-90 transition-all">
                  <div className="h-full w-full rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--color-accent)] flex items-center justify-center bg-white/5">
                      {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[var(--color-accent)]"></div> : <PlusIcon />}
                  </div>
               </label>
               <input id={`${id}-add-more`} type="file" className="hidden" accept="image/*" onChange={handleAddMoreUpload} multiple disabled={isUploading} />

              {images.slice(1).map((image, index) => (
                <div key={index + 1} className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 relative group rounded-xl overflow-hidden bg-black/10 border border-white/5">
                  <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`Thumbnail ${index + 2}`} className="w-full h-full object-cover" />
                  <button onClick={() => onImageRemove(index + 1)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {editingIndex !== null && images[editingIndex] && (
            <ImageCropper file={base64ToFile(images[editingIndex].base64, images[editingIndex].mimeType, images[editingIndex].name)} onConfirm={handleCropConfirm} onCancel={() => setEditingIndex(null)} />
        )}
    </div>
  );
};

export default ImageWorkspace;
