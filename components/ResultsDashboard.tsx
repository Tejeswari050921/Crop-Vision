import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Ruler, AlertTriangle, Palette, CheckCircle, RefreshCcw, Download, Loader2, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Certificate from './Certificate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getPriceEstimate } from '../services/priceService';

interface ResultsDashboardProps {
  data: AnalysisResult;
  onReset: () => void;
  hasReferenceCoin: boolean;
  scannedImage?: string | null;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, onReset, hasReferenceCoin, scannedImage }) => {
  const timestamp = new Date().toLocaleString();
  const id = crypto.randomUUID();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Derive price estimate from the isolated price service
  const priceEstimate = useMemo(() => getPriceEstimate(data.fruitType, data.grade), [data.fruitType, data.grade]);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('certificate-area');
    if (!element) return;

    setIsGeneratingPdf(true);

    try {
      // Use html2canvas to capture the certificate
      const canvas = await html2canvas(element, {
        scale: 3, // High resolution for print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#fdfbf7', // Match certificate background
        onclone: (clonedDoc) => {
           const certElement = clonedDoc.getElementById('certificate-area');
           if (certElement) {
             // Force fixed dimensions on the clone to ensure flexbox calculations are stable
             // 794px is standard A4 width at 96 DPI
             certElement.style.width = '794px';
             certElement.style.height = '1123px';
             certElement.style.maxWidth = 'none';
             certElement.style.margin = '0';
             certElement.style.position = 'relative';
             certElement.style.display = 'block';
           }

           // html2canvas doesn't always handle mix-blend-mode correctly.
           // We adjust the texture layer in the clone to be normal blend mode with low opacity
           const textureElement = clonedDoc.querySelector('.texture-layer') as HTMLElement;
           if (textureElement) {
             textureElement.style.mixBlendMode = 'normal';
             textureElement.style.opacity = '0.03'; 
           }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm (210 x 297)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Center vertically if it's smaller than the page, or top align
      const yOffset = pdfHeight < pdf.internal.pageSize.getHeight() ? (pdf.internal.pageSize.getHeight() - pdfHeight) / 2 : 0;

      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
      pdf.save(`FairTrade-Certificate-${data.grade}-${id.slice(0, 8)}.pdf`);

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate PDF automatically. Opening print dialog instead.");
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const safeColorProfile = data.colorProfile || [];
  const safeDefects = data.defectsDetected || [];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Ruler size={16} />
              <span className="text-xs font-semibold uppercase">Avg Size</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.avgDiameterMm}<span className="text-sm font-normal text-gray-500">mm</span></p>
          </div>
          <div className={`mt-2 text-[10px] font-medium flex items-center gap-1 ${hasReferenceCoin ? 'text-green-600' : 'text-orange-600'}`}>
            <Info size={10} />
            {hasReferenceCoin ? 'High Confidence (Scale-Referenced)' : 'Medium Confidence (Estimated Scale)'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-gray-500 mb-1">
             <AlertTriangle size={16} />
             <span className="text-xs font-semibold uppercase">Defects</span>
          </div>
          <p className={`text-2xl font-bold ${data.defectPercentage < 5 ? 'text-green-600' : 'text-red-600'}`}>
            {data.defectPercentage}<span className="text-sm font-normal">%</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-gray-500 mb-1">
             <Palette size={16} />
             <span className="text-xs font-semibold uppercase">Color Score</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{data.colorScore}<span className="text-sm font-normal">/100</span></p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-gray-500 mb-1">
             <CheckCircle size={16} />
             <span className="text-xs font-semibold uppercase">Consistency</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{data.sizeConsistencyScore}<span className="text-sm font-normal">/100</span></p>
        </div>
      </div>

      {/* MARKET INSIGHTS: Price Estimation Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-300">
              <TrendingUp size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Estimated Market Value</h3>
            </div>
            {priceEstimate ? (
              <div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                       {priceEstimate.currency}{priceEstimate.minPrice} - {priceEstimate.currency}{priceEstimate.maxPrice}
                    </span>
                    <span className="text-lg text-gray-400 font-medium">/ kg</span>
                 </div>
                 <p className="text-sm text-gray-400 mt-1">
                    Based on last {priceEstimate.daysAnalyzed} days average for <span className="text-yellow-400 font-bold">Grade {data.grade}</span> {data.fruitType}
                 </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-gray-300">Price data unavailable</p>
                <p className="text-sm text-gray-500 mt-1">Insufficient historical data for {data.fruitType}</p>
              </div>
            )}
          </div>

          {priceEstimate && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 min-w-[200px]">
               <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Market Trend</div>
               <div className="flex items-center gap-2">
                  {priceEstimate.trend === 'up' ? <TrendingUp className="text-green-400" /> : 
                   priceEstimate.trend === 'down' ? <TrendingDown className="text-red-400" /> : 
                   <Minus className="text-gray-400" />}
                  <span className={`font-bold ${
                      priceEstimate.trend === 'up' ? 'text-green-400' : 
                      priceEstimate.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {priceEstimate.trend === 'up' ? 'Rising' : priceEstimate.trend === 'down' ? 'Falling' : 'Stable'}
                  </span>
               </div>
               <div className="mt-2 text-[10px] text-gray-500 leading-tight">
                  * Prices are indicative and based on recent regional market trends.
               </div>
            </div>
          )}
        </div>
        
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Color Analysis (Ripeness)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeColorProfile} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                  {safeColorProfile.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name.toLowerCase().includes('red') ? '#ef4444' : entry.name.toLowerCase().includes('green') ? '#22c55e' : '#eab308'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
             <h4 className="font-semibold text-sm mb-2">AI Reasoning:</h4>
             <p className="text-sm text-gray-600 leading-relaxed">{data.reasoning}</p>
          </div>
        </div>

        {/* Detected Defects List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold mb-4">Defect Detection</h3>
           {safeDefects.length > 0 ? (
             <ul className="space-y-3">
               {safeDefects.map((defect, i) => (
                 <li key={i} className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                   <AlertTriangle size={16} className="flex-shrink-0" />
                   {defect}
                 </li>
               ))}
             </ul>
           ) : (
             <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CheckCircle size={48} className="mb-2 text-green-200" />
                <p>No major defects detected</p>
             </div>
           )}
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">Official Certificate</h2>
           <button 
             onClick={handleDownloadPdf}
             disabled={isGeneratingPdf}
             className={`flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               isGeneratingPdf ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
             }`}
           >
             {isGeneratingPdf ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 Generating PDF...
               </>
             ) : (
               <>
                 <Download size={16} />
                 Download Certificate
               </>
             )}
           </button>
        </div>
        <div className="transform origin-top scale-100 md:scale-95 transition-transform">
           <Certificate data={data} timestamp={timestamp} id={id} scannedImage={scannedImage} />
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
         <button 
            onClick={onReset}
            className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium transition-colors"
          >
           <RefreshCcw size={18} />
           Scan Another Batch
         </button>
      </div>

    </div>
  );
};

export default ResultsDashboard;