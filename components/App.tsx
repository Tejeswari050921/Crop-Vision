import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult } from '../types';
import { analyzeProduceImage, fileToGenerativePart } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import ProcessingView from './ProcessingView';
import ResultsDashboard from './ResultsDashboard';
import IntroGuide from './IntroGuide';
import { Sprout, AlertCircle } from 'lucide-react';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
    <style>{`
      @keyframes logo-enter {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-logo-enter {
        animation: logo-enter 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }
    `}</style>
    <div className="flex flex-col items-center animate-logo-enter">
      <div className="bg-green-600 p-6 rounded-3xl shadow-2xl shadow-green-200 mb-6">
        <Sprout className="text-white w-20 h-20" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          FairTrade<span className="text-green-600">Scan</span>
        </h1>
        <p className="text-gray-400 font-medium mt-3 text-sm uppercase tracking-[0.2em]">
          Quality Grading AI
        </p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<AnalysisResult | null>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  
  /**
   * FUTURE: The coin metadata (hasReferenceCoin) enables future pixel-to-millimeter calibration.
   * Currently used to display confidence levels in the UI.
   * Known coin diameter can later be used for real-world scale normalization in the ML pipeline.
   */
  const [hasReferenceCoin, setHasReferenceCoin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSelected = async (file: File) => {
    try {
      setState(AppState.ANALYZING);
      setError(null);
      setPendingResult(null);
      setIsAnimationComplete(false);
      
      const base64Data = await fileToGenerativePart(file);
      setCurrentImage(`data:image/jpeg;base64,${base64Data}`);

      const result = await analyzeProduceImage(base64Data);
      setPendingResult(result);

    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
      setState(AppState.ERROR);
    }
  };

  const handleProcessingComplete = () => {
    setIsAnimationComplete(true);
  };

  // Sync state only when both animation is done and result is ready
  useEffect(() => {
    if (isAnimationComplete && pendingResult) {
      setAnalysisData(pendingResult);
      setState(AppState.RESULTS);
    }
  }, [isAnimationComplete, pendingResult]);

  const handleReset = () => {
    setState(AppState.IDLE);
    setAnalysisData(null);
    setPendingResult(null);
    setCurrentImage(null);
    setError(null);
    setIsAnimationComplete(false);
    // Note: We do NOT reset hasReferenceCoin here, as the setup likely persists for the session
  };

  const handleIntroContinue = () => {
    setShowIntro(false);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Sprout className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">FairTrade<span className="text-green-600">Scan</span></span>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            v1.0.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          
          {showIntro ? (
            <IntroGuide onContinue={handleIntroContinue} />
          ) : (
            <>
              {state === AppState.IDLE && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
                  <div className="text-center max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                      Empower Your Harvest Negotiation
                    </h1>
                    <p className="text-lg text-gray-600">
                      Get instant, objective quality grading for your produce using computer vision.
                      Generate a certificate in seconds.
                    </p>
                  </div>
                  <ImageUploader 
                    onImageSelected={handleImageSelected} 
                    isProcessing={false} 
                    hasReferenceCoin={hasReferenceCoin}
                    onToggleCoin={setHasReferenceCoin}
                  />
                </div>
              )}

              {state === AppState.ANALYZING && (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  {currentImage && (
                    <div className="w-32 h-32 mb-8 rounded-lg overflow-hidden border-4 border-white shadow-lg relative">
                        <img src={currentImage} alt="Scanning" className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
                    </div>
                  )}
                  <ProcessingView onComplete={handleProcessingComplete} />
                  {isAnimationComplete && !pendingResult && (
                    <p className="mt-4 text-gray-500 animate-pulse">Finalizing results...</p>
                  )}
                </div>
              )}

              {state === AppState.RESULTS && analysisData && (
                <ResultsDashboard 
                  data={analysisData} 
                  onReset={handleReset} 
                  hasReferenceCoin={hasReferenceCoin}
                  scannedImage={currentImage}
                />
              )}

              {state === AppState.ERROR && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                  <p className="text-gray-600 mb-6 max-w-md">
                    {error || "We couldn't process this image. Please ensure the produce is clearly visible on a plain background."}
                  </p>
                  <button 
                    onClick={handleReset}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
         <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} FairTrade Scanner. Built by Team TAPS Code.
         </div>
      </footer>
    </div>
  );
};

export default App;
