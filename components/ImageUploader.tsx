import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Camera, Upload, AlertCircle, X, Check, ArrowRight, RefreshCw, Image as ImageIcon, CircleDollarSign } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
  hasReferenceCoin: boolean;
  onToggleCoin: (hasCoin: boolean) => void;
}

/**
 * ENGINEERING NOTE:
 * CameraCapture is strictly isolated to prevent lifecycle interruptions.
 * It mounts once and handles its own stream cleanup.
 * No external state props are passed to avoid re-renders that would freeze the preview.
 */
const CameraCapture: React.FC<{ onCapture: (file: File) => void; onClose: () => void }> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });

        if (mounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          // Component unmounted before stream started
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Camera Error:", err);
          setError("Could not access camera. Please check permissions.");
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw only the video frame to the canvas (overlays are ignored)
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-white p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p>{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-800 rounded">Close</button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute w-full h-full object-contain"
            />
            
            {/* Visual Guide: Coin Alignment Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center z-10 opacity-80">
                 <div className="w-16 h-16 border-2 border-dashed border-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)] mb-2 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-xs opacity-50">₹5</span>
                 </div>
                 <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-yellow-400/20">
                   Align Coin
                 </p>
            </div>
          </>
        )}
        
        {!error && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md text-white rounded-full z-20 hover:bg-black/60 transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {!error && (
        <div className="bg-black py-6 flex flex-col items-center justify-center shrink-0 space-y-4">
           {/* Helper Text */}
           <p className="text-gray-400 text-xs text-center px-4 font-medium">
              Adjust distance so the real coin matches this circle
           </p>

           <button 
             onClick={handleCapture}
             className="group relative flex items-center justify-center"
           >
             <div className="w-20 h-20 rounded-full border-4 border-white opacity-100 transition-transform group-active:scale-95"></div>
             <div className="absolute w-16 h-16 bg-white rounded-full transition-all group-active:scale-90 group-active:bg-green-500"></div>
           </button>
        </div>
      )}
    </div>
  );
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isProcessing, hasReferenceCoin, onToggleCoin }) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle file capture/selection
  const handleFileIncoming = (file: File) => {
    setPreviewFile(file);
    setIsCameraOpen(false); // Close camera if it was open
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleConfirm = () => {
    if (previewFile) {
      onImageSelected(previewFile);
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Dropzone Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileIncoming(e.target.files[0]);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileIncoming(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };


  // --- VIEW 1: CAMERA CAPTURE (Isolated) ---
  if (isCameraOpen) {
    return <CameraCapture onCapture={handleFileIncoming} onClose={() => setIsCameraOpen(false)} />;
  }

  // --- VIEW 2: CONFIRMATION (Post-Capture) ---
  if (previewFile && previewUrl) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        <div className="relative aspect-video bg-gray-100">
           <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
           <button 
             onClick={handleRetake}
             disabled={isProcessing}
             className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
           >
             <RefreshCw size={16} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Confirm Analysis</h3>
              
              {/* Coin Confirmation Checkbox (Post-Capture Only) */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${hasReferenceCoin ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                        {hasReferenceCoin && <Check size={16} className="text-white" strokeWidth={3} />}
                        <input 
                            type="checkbox" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            checked={hasReferenceCoin}
                            onChange={() => onToggleCoin(!hasReferenceCoin)}
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold text-sm">I have placed a coin for better accuracy</span>
                      <span className="text-xs text-gray-500">Helps calibrate size measurements</span>
                    </div>
                </label>
              </div>
           </div>

           <button 
             onClick={handleConfirm}
             disabled={isProcessing}
             className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 transform transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             {isProcessing ? (
               <span>Processing...</span>
             ) : (
               <>
                 <span>Analyze Harvest</span>
                 <ArrowRight size={20} />
               </>
             )}
           </button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: DROPZONE (Default) ---
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scan Your Harvest</h3>
            <p className="text-sm text-gray-500 mt-1">
              Spread produce on a white sheet. Ensure good lighting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
            <button
              onClick={() => setIsCameraOpen(true)}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera size={20} />
              Take Photo
            </button>

            <label
              className={`flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload size={20} />
              Upload File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onClick={(e) => (e.currentTarget.value = '')}
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg text-left">
          <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p>
            For best results, avoid overlapping items. Place a reference coin if you need precise sizing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;