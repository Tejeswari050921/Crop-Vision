import React from 'react';
import { AnalysisResult } from '../types';
import { ShieldCheck, Calendar, Hash, QrCode, Award } from 'lucide-react';

interface CertificateProps {
  data: AnalysisResult;
  timestamp: string;
  id: string;
  scannedImage?: string | null;
}

const Certificate: React.FC<CertificateProps> = ({ data, timestamp, id, scannedImage }) => {
  return (
    <div id="certificate-area" className="relative bg-[#fdfbf7] text-gray-900 w-full max-w-3xl mx-auto aspect-[1/1.414] shadow-2xl overflow-hidden print:shadow-none print:aspect-auto print:h-full print:w-full">
      {/* Decorative Border Frame */}
      <div className="absolute inset-0 border-[16px] border-[#1a472a] z-0 print:border-[16px]"></div>
      <div className="absolute inset-[20px] border-2 border-[#c5a059] z-0 print:inset-[20px]"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-[20px] left-[20px] w-16 h-16 border-t-4 border-l-4 border-[#c5a059] z-10"></div>
      <div className="absolute top-[20px] right-[20px] w-16 h-16 border-t-4 border-r-4 border-[#c5a059] z-10"></div>
      <div className="absolute bottom-[20px] left-[20px] w-16 h-16 border-b-4 border-l-4 border-[#c5a059] z-10"></div>
      <div className="absolute bottom-[20px] right-[20px] w-16 h-16 border-b-4 border-r-4 border-[#c5a059] z-10"></div>

      {/* Subtle Texture Pattern */}
      <div className="absolute inset-0 opacity-5 z-0 pointer-events-none mix-blend-multiply texture-layer" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }} 
      />

      {/* Content Container */}
      <div className="relative z-20 p-12 md:p-16 h-full flex flex-col justify-between">
        
        {/* Header Section */}
        <div className="text-center flex-shrink-0">
          <div className="flex justify-center mb-4">
             <div className="relative">
                <ShieldCheck className="w-20 h-20 text-[#1a472a]" strokeWidth={1.5} />
                <div className="absolute -bottom-2 -right-2 bg-[#fdfbf7] rounded-full p-1 border border-[#c5a059]">
                   <Award className="w-8 h-8 text-[#c5a059]" />
                </div>
             </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-[#1a472a] font-serif italic text-lg tracking-wider">Official Quality Grading</h2>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">CERTIFICATE</h1>
            <div className="flex items-center justify-center gap-4 py-2">
               <div className="h-px w-12 bg-[#c5a059]"></div>
               <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#c5a059]">Fair-Trade Verified</p>
               <div className="h-px w-12 bg-[#c5a059]"></div>
            </div>
          </div>
        </div>

        {/* Main Content: Grade & Details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 px-2 flex-grow py-8 overflow-hidden">
          
          {/* Grade Stamp */}
          <div className="flex-shrink-0 text-center relative group">
            <div className={`relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center rounded-full border-[6px] border-double ${
                data.grade === 'A' ? 'border-[#1a472a] text-[#1a472a]' : 
                data.grade === 'B' ? 'border-yellow-600 text-yellow-700' : 'border-red-700 text-red-800'
              } bg-white shadow-inner`}>
              <span className="text-8xl md:text-9xl font-serif font-bold pt-4">{data.grade}</span>
              <div className="absolute -bottom-5 bg-[#fdfbf7] px-4 py-1 border border-[#c5a059] shadow-sm">
                 <span className="text-xs font-bold uppercase tracking-widest text-[#1a472a]">Grade Class</span>
              </div>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="w-full max-w-[280px] flex-shrink-0">
            <h3 className="font-serif text-lg text-[#1a472a] font-bold mb-6 border-b-2 border-[#c5a059] pb-2 inline-block">Batch Analysis</h3>
            <div className="space-y-4 font-serif text-sm md:text-base">
              <div className="flex justify-between items-baseline group">
                <span className="text-gray-600 font-medium">Commodity</span>
                <span className="flex-grow mx-3 border-b border-dotted border-gray-400"></span>
                <span className="font-bold text-gray-900">{data.fruitType}</span>
              </div>
              <div className="flex justify-between items-baseline group">
                <span className="text-gray-600 font-medium">Unit Count</span>
                <span className="flex-grow mx-3 border-b border-dotted border-gray-400"></span>
                <span className="font-bold text-gray-900">{data.itemCount}</span>
              </div>
              <div className="flex justify-between items-baseline group">
                <span className="text-gray-600 font-medium">Avg. Diameter</span>
                <span className="flex-grow mx-3 border-b border-dotted border-gray-400"></span>
                <span className="font-bold text-gray-900">{data.avgDiameterMm} mm</span>
              </div>
              <div className="flex justify-between items-baseline group">
                <span className="text-gray-600 font-medium">Defect Rate</span>
                <span className="flex-grow mx-3 border-b border-dotted border-gray-400"></span>
                <span className={`font-bold ${data.defectPercentage > 5 ? 'text-red-600' : 'text-[#1a472a]'}`}>
                  {data.defectPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-baseline group">
                <span className="text-gray-600 font-medium">Uniformity</span>
                <span className="flex-grow mx-3 border-b border-dotted border-gray-400"></span>
                <span className="font-bold text-gray-900">{data.sizeConsistencyScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Evidence - Additive Bottom Section */}
        {scannedImage && (
          <div className="mb-4 w-full max-w-[180px] mx-auto flex-shrink-0">
            <div className="flex items-center gap-3 mb-2 opacity-60">
                <div className="h-px bg-[#c5a059] flex-grow"></div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#1a472a] font-bold whitespace-nowrap font-serif">Sample Image</span>
                <div className="h-px bg-[#c5a059] flex-grow"></div>
            </div>
            <div className="bg-white p-1 border border-[#c5a059]/30 shadow-sm">
                <img 
                    src={scannedImage} 
                    alt="Sample" 
                    className="w-full h-24 object-cover opacity-90 mix-blend-multiply contrast-125 filter sepia-[0.1]" 
                />
            </div>
          </div>
        )}

        {/* Footer / Signature Area */}
        <div className="mt-auto pt-6 border-t border-[#1a472a]/20 flex-shrink-0">
          <div className="flex flex-row justify-between items-end">
             <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                   <QrCode className="w-12 h-12 text-[#1a472a] bg-white p-1 border border-[#c5a059]" />
                   <div className="flex flex-col text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                      <span>Secure Digital</span>
                      <span>Verification</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                   <Hash size={10} />
                   <span className="max-w-[150px] truncate">{id}</span>
                </div>
             </div>
             
             <div className="text-right">
                <div className="font-serif italic text-[#1a472a] text-lg mb-1">
                   FairTrade Scan AI
                </div>
                <div className="h-px w-32 bg-[#1a472a] ml-auto mb-1"></div>
                <div className="flex items-center justify-end gap-1 text-[#1a472a] text-xs font-bold uppercase tracking-wider">
                   <Calendar size={12} />
                   <span>{timestamp.split(',')[0]}</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Certificate;