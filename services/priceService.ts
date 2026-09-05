import { PriceEstimate } from '../types';

// ENGINEERING NOTE: 
// Pricing is derived from recent historical data (last 7 days).
// This module is isolated from the ML pipeline and provides decision support.
// Currently uses mock aggregated data for common commodities.

const COMMODITY_BASE_PRICES: Record<string, number> = {
  'tomato': 38,
  'lemon': 95,
  'onion': 32,
  'potato': 24,
  'apple': 150,
  'banana': 45,
  'orange': 70,
  'mango': 140,
  'carrot': 48,
  'cucumber': 35,
  'capsicum': 65,
  'pepper': 65,
  'pomegranate': 180,
  'grape': 90,
  'strawberry': 250
};

/**
 * Estimates fair price range based on commodity type and quality grade.
 * Logic applies a multiplier to the base market average (Grade A).
 */
export const getPriceEstimate = (fruitType: string, grade: 'A' | 'B' | 'C'): PriceEstimate | null => {
  if (!fruitType) return null;
  
  const normalizedType = fruitType.toLowerCase().trim();
  
  // Simple keyword matching to find base price
  const key = Object.keys(COMMODITY_BASE_PRICES).find(k => normalizedType.includes(k));
  
  // Graceful fallback if data is unavailable
  if (!key) return null;

  const basePrice = COMMODITY_BASE_PRICES[key];
  
  // Grade-based pricing logic
  // Grade A: Market Premium (1.0x - 1.05x)
  // Grade B: Standard Market (0.85x)
  // Grade C: Discounted/Processing Market (0.60x)
  let multiplier = 1.0;
  if (grade === 'A') multiplier = 1.0;
  else if (grade === 'B') multiplier = 0.85;
  else if (grade === 'C') multiplier = 0.60;

  const estimatedAvg = basePrice * multiplier;
  
  // Calculate range (+/- 8% volatility buffer)
  const minPrice = Math.floor(estimatedAvg * 0.92);
  const maxPrice = Math.ceil(estimatedAvg * 1.08);

  return {
    minPrice,
    maxPrice,
    currency: '₹',
    daysAnalyzed: 7,
    gradeUsed: grade,
    trend: Math.random() > 0.5 ? 'up' : 'stable' // Simulated trend for UI demonstration
  };
};