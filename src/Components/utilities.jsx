import { Trash2, Upload } from "lucide-react";

export const DeleteConfirmationModal = ({ onConfirm, onCancel, propertyTitle }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete "{propertyTitle}"? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Property
        </button>
      </div>
    </div>
  </div>
);
// Sub-components (unchanged from your original code)
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-indigo-500 text-sm font-medium">Loading</div>
    </div>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg border border-red-200 max-w-md">
      <div className="font-bold text-lg mb-2">Error</div>
      <div>{message}</div>
    </div>
  </div>
);

export const ImageGallery = ({ images, onImageClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-0">
    {images?.length > 0 && (
      <div className="md:col-span-2">
        <img
          src={images[0]}
          alt="Main view"
          className="w-full h-64 md:h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
          onClick={() => onImageClick(images[0], 0)}
        />
      </div>
    )}
    <div className="grid grid-cols-2 gap-3">
      {images?.slice(1, 5).map((image, index) => (
        <div key={index} className="relative">
          <img
            src={image}
            alt={`View ${index + 2}`}
            className="w-full h-32 md:h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
            onClick={() => onImageClick(image, index + 1)}
          />
          {index === 3 && images.length > 5 && (
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 bg-opacity-70 flex items-center justify-center rounded-lg cursor-pointer"
              onClick={() => onImageClick(images[4], 4)}
            >
              <span className="text-white text-xl font-bold">+{images.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const ImageEditor = ({ images, pendingImages, onDelete, onDeletePending, onUpload, uploading, error, fileInputRef }) => (
  <div>
    <h3 className="text-xl font-bold mb-4 text-gray-800">Manage Images</h3>
    {error && <div className="text-red-500 mb-3 bg-red-50 p-2 rounded-lg">{error}</div>}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images?.map((image, index) => (
        <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden shadow-md">
          <img src={image} alt={`View ${index + 1}`} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
          <button
            onClick={() => onDelete(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {pendingImages?.map((file, index) => (
        <div key={`pending-${index}`} className="relative group rounded-lg overflow-hidden shadow-md">
          <img
            src={URL.createObjectURL(file)}
            alt={`Pending ${index + 1}`}
            className="w-full h-32 object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
          <button
            onClick={() => onDeletePending(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Pending
          </div>
        </div>
      ))}
      <div className="border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center h-32 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          multiple
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="flex flex-col items-center text-indigo-500"
          disabled={uploading}
        >
          <Upload size={24} />
          <span className="mt-2 text-sm font-medium">Add Image</span>
        </button>
      </div>
    </div>
  </div>
);

export const ImageDialog = ({ image, index, total, onClose, onNavigate }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
    <div className="relative max-w-5xl w-full">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-full"
      >
        <XIcon size={20} />
      </button>
      <div className="relative">
        <img src={image} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain" />
        <button
          onClick={() => onNavigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => onNavigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="text-white text-center mt-4 font-medium">
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 rounded-full">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  </div>
);

export const ChevronLeft = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

export const ChevronRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export const XIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);