import React from "react";
import {
  Sun,
  Smartphone,
  LayoutGrid,
  FileImage,
  CloudOff,
  Palette,
  EyeOff,
  Layers,
  Check,
  X,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";

interface IntroGuideProps {
  onContinue: () => void;
}

const IntroGuide: React.FC<IntroGuideProps> = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in pb-8 px-4">
      
      {/* Hero */}
      <div className="text-center space-y-4 my-6">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Take Photo Like This ✅
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto font-medium">
          Follow these rules for accurate grading.
        </p>
      </div>

      {/* DO / AVOID */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* DO */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 p-2 rounded-full shadow-sm">
              <Check className="w-6 h-6 text-green-700" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-green-800">Do This</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <DoCard icon={<FileImage />} text="Plain white background" />
            <DoCard icon={<Sun />} text="Bright daylight" />
            <DoCard icon={<Smartphone />} text="Camera directly above" />
            <DoCard icon={<LayoutGrid />} text="Spread fruits apart" />
          </div>
        </div>

        {/* AVOID */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-100 p-2 rounded-full shadow-sm">
              <X className="w-6 h-6 text-red-700" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-red-800">Avoid This</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <DontCard icon={<CloudOff />} text="Shadows on fruits" />
            <DontCard icon={<Palette />} text="Colored cloth or floor" />
            <DontCard icon={<EyeOff />} text="Blurry image" />
            <DontCard icon={<Layers />} text="Fruits stacked" />
          </div>
        </div>
      </div>

      {/* Coin Calibration Section (UNCHANGED) */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <CircleDollarSign className="w-6 h-6 text-blue-600" />
          </div>
          Place a Coin for Accurate Size Measurement
        </h3>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* Visual Diagram */}
          <div className="relative w-full md:w-64 h-48 bg-white rounded-xl shadow-inner border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <div className="absolute inset-2 border border-dashed border-gray-300 rounded-lg"></div>

            {/* Fruits */}
            <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-red-400 rounded-full opacity-90 shadow-sm"></div>
            <div className="absolute top-1/2 left-1/2 w-14 h-14 bg-orange-400 rounded-full opacity-90 shadow-sm -ml-4 mt-2"></div>
            <div className="absolute top-1/4 left-2/3 w-10 h-10 bg-red-500 rounded-full opacity-90 shadow-sm"></div>

            {/* Coin */}
            <div className="absolute bottom-6 right-8 w-8 h-8 bg-gray-300 rounded-full border-2 border-gray-400 flex items-center justify-center z-10 shadow-md">
              <span className="text-[10px] font-bold text-gray-600">₹</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-5 w-full">
            <p className="text-blue-900 font-medium text-lg">
              Place one coin next to the fruits on the white sheet.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                Supported Coins:
              </span>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 border-4 border-yellow-500 flex items-center justify-center font-bold text-yellow-800 text-lg shadow-sm">
                  ₹5
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-200 border-4 border-gray-400 flex items-center justify-center font-bold text-gray-700 text-lg shadow-sm">
                  ₹10
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <button 
        onClick={onContinue}
        className="w-full max-w-sm bg-gray-900 hover:bg-black text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3 hover:shadow-2xl"
      >
        <span>I Understand – Continue</span>
        <ArrowRight size={24} />
      </button>

    </div>
  );
};

export default IntroGuide;

/* Cards */

const DoCard = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="bg-white border-2 border-green-100 rounded-xl p-5 min-h-[140px] flex flex-col items-center justify-center text-center shadow-sm hover:border-green-400 transition">
    <div className="w-12 h-12 text-green-600 mb-3">
      {icon}
    </div>
    <span className="font-bold text-gray-800 text-sm md:text-base leading-snug">
      {text}
    </span>
  </div>
);


const DontCard = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="bg-white border-2 border-red-100 rounded-xl p-5 min-h-[140px] flex flex-col items-center justify-center text-center shadow-sm hover:border-red-400 transition">
    <div className="w-12 h-12 text-red-500 mb-3">
      {icon}
    </div>
    <span className="font-semibold text-gray-700 text-sm md:text-base leading-snug">
      {text}
    </span>
  </div>
);

