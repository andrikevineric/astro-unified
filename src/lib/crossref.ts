/**
 * Cross-Reference Analysis
 * Maps Western astrology elements to Chinese Five Elements
 * and calculates harmony between the two systems
 */

import type { WesternChart } from './western';
import type { BaziChart } from './bazi';

export interface CrossRefAnalysis {
  harmonyScore: number;
  reinforcing: Array<{ element: string; note: string }>;
  balancing: Array<{ element: string; note: string }>;
  synthesis: string;
}

// Western to Chinese element mapping
// Western has 4 elements, Chinese has 5
const ELEMENT_MAPPING: Record<string, Record<string, number>> = {
  Fire: { Fire: 1.0, Wood: 0.2 },           // Fire maps to Fire, slightly to Wood (fuel)
  Earth: { Earth: 1.0 },                     // Earth maps directly
  Air: { Metal: 0.6, Wood: 0.4 },           // Air maps to Metal (clarity) and Wood (movement)
  Water: { Water: 1.0 },                     // Water maps directly
};

/**
 * Map Western element percentages to Chinese Five Elements
 */
function mapWesternToChinese(western: { Fire: number; Earth: number; Air: number; Water: number }): Record<string, number> {
  const chinese = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  for (const [westEl, value] of Object.entries(western)) {
    const mapping = ELEMENT_MAPPING[westEl];
    if (mapping) {
      for (const [chineseEl, weight] of Object.entries(mapping)) {
        chinese[chineseEl as keyof typeof chinese] += value * weight;
      }
    }
  }
  
  // Normalize
  const total = Object.values(chinese).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of Object.keys(chinese)) {
      chinese[key as keyof typeof chinese] = Math.round((chinese[key as keyof typeof chinese] / total) * 100);
    }
  }
  
  return chinese;
}

/**
 * Generate synthesis text based on chart analysis
 */
function generateSynthesis(
  western: WesternChart,
  bazi: BaziChart,
  reinforcing: Array<{ element: string }>,
  balancing: Array<{ element: string }>
): string {
  const sunSign = western.sun.sign;
  const dayMaster = bazi.dayMaster;
  const dayMasterElement = bazi.dayMasterElement;
  
  // Get dominant Western element
  const westernElements = western.elements;
  const dominantWestern = Object.entries(westernElements).sort((a, b) => b[1] - a[1])[0][0];
  
  // Get dominant Bazi element
  const baziElements = bazi.elements;
  const dominantBazi = Object.entries(baziElements).sort((a, b) => b[1] - a[1])[0][0];
  
  let synthesis = `Your ${sunSign} Sun brings ${getElementQuality(dominantWestern)} energy to your outer expression, `;
  synthesis += `while your Bazi reveals you as a ${dayMaster} (${dayMasterElement}) Day Master - `;
  synthesis += `${getDayMasterDescription(dayMasterElement)}. `;
  
  if (reinforcing.length > 0) {
    synthesis += `Both systems emphasize ${reinforcing.map(r => r.element).join(' and ')}, `;
    synthesis += `confirming this as a core part of your nature. `;
  }
  
  if (balancing.length > 0) {
    synthesis += `Interestingly, your Western chart provides ${balancing.map(b => b.element).join(' and ')} `;
    synthesis += `energy that your Bazi chart lacks, creating a more balanced whole.`;
  }
  
  return synthesis;
}

function getElementQuality(element: string): string {
  const qualities: Record<string, string> = {
    Fire: 'passionate and dynamic',
    Earth: 'grounded and practical',
    Air: 'intellectual and communicative',
    Water: 'intuitive and emotional',
    Wood: 'growth-oriented and flexible',
    Metal: 'refined and decisive',
  };
  return qualities[element] || element.toLowerCase();
}

function getDayMasterDescription(element: string): string {
  const descriptions: Record<string, string> = {
    Wood: 'like a tree, you are principled, growth-oriented, and provide support to others',
    Fire: 'like a flame, you are passionate, expressive, and bring warmth to those around you',
    Earth: 'like a mountain, you are stable, nurturing, and provide a solid foundation',
    Metal: 'like refined gold, you are precise, principled, and value quality over quantity',
    Water: 'like flowing water, you are adaptable, wise, and find your way around obstacles',
  };
  return descriptions[element] || 'with unique qualities';
}

/**
 * Analyze cross-reference between Western and Bazi charts
 */
export function analyzeCrossReference(western: WesternChart, bazi: BaziChart): CrossRefAnalysis {
  const westernMapped = mapWesternToChinese(western.elements);
  const baziElements = bazi.elements;
  
  const reinforcing: Array<{ element: string; note: string }> = [];
  const balancing: Array<{ element: string; note: string }> = [];
  
  const fiveElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
  
  for (const element of fiveElements) {
    const westernVal = westernMapped[element] || 0;
    const baziVal = baziElements[element] || 0;
    
    if (westernVal >= 20 && baziVal >= 20) {
      // Both systems show strong element
      reinforcing.push({
        element,
        note: `Strong ${element} in both systems (Western: ${westernVal}%, Bazi: ${baziVal}%) - this is a core part of your nature`
      });
    } else if (westernVal >= 25 && baziVal <= 10) {
      // Western compensates for weak Bazi
      balancing.push({
        element,
        note: `Your Western chart provides ${element} (${westernVal}%) that your Bazi lacks (${baziVal}%)`
      });
    } else if (baziVal >= 25 && westernVal <= 10) {
      // Bazi compensates for weak Western
      balancing.push({
        element,
        note: `Your Bazi provides ${element} (${baziVal}%) that your Western chart lacks (${westernVal}%)`
      });
    }
  }
  
  // Calculate harmony score
  let harmonyScore = 50; // Base score
  harmonyScore += reinforcing.length * 15; // Reinforcing patterns add harmony
  harmonyScore += balancing.length * 8;    // Balancing patterns add some harmony
  harmonyScore = Math.min(100, Math.max(0, harmonyScore));
  
  const synthesis = generateSynthesis(western, bazi, reinforcing, balancing);
  
  return {
    harmonyScore,
    reinforcing,
    balancing,
    synthesis,
  };
}

/**
 * Calculate compatibility between two people
 */
export function calculateCompatibility(
  personA: { western: WesternChart; bazi: BaziChart },
  personB: { western: WesternChart; bazi: BaziChart }
): {
  overall: number;
  western: { emotional: number; attraction: number; communication: number; longevity: number };
  bazi: { dayMaster: number; branches: number; elements: number };
  strengths: string[];
  challenges: string[];
  funSummary: string;
} {
  // Western synastry (simplified)
  const sunA = personA.western.sun.sign;
  const sunB = personB.western.sun.sign;
  const moonA = personA.western.moon.sign;
  const moonB = personB.western.moon.sign;
  
  // Element compatibility (same element = good, compatible elements = okay)
  const elementCompat: Record<string, string[]> = {
    Fire: ['Fire', 'Air'],
    Earth: ['Earth', 'Water'],
    Air: ['Air', 'Fire'],
    Water: ['Water', 'Earth'],
  };
  
  const getSignElement = (sign: string): string => {
    const map: Record<string, string> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
    };
    return map[sign] || 'Fire';
  };
  
  const sunElA = getSignElement(sunA);
  const sunElB = getSignElement(sunB);
  const moonElA = getSignElement(moonA);
  const moonElB = getSignElement(moonB);
  
  // Calculate Western scores
  const attraction = elementCompat[sunElA]?.includes(sunElB) ? 80 : 55;
  const emotional = moonElA === moonElB ? 90 : (elementCompat[moonElA]?.includes(moonElB) ? 75 : 55);
  const communication = Math.round((attraction + emotional) / 2);
  const longevity = Math.round((attraction + emotional + 60) / 3);
  
  // Bazi compatibility
  const dmA = personA.bazi.dayMasterElement;
  const dmB = personB.bazi.dayMasterElement;
  
  // Productive cycle: Wood->Fire->Earth->Metal->Water->Wood
  const produces: Record<string, string> = {
    Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood'
  };
  
  let dayMasterScore = 60;
  if (dmA === dmB) dayMasterScore = 70; // Same element - understanding
  if (produces[dmA] === dmB || produces[dmB] === dmA) dayMasterScore = 85; // Productive
  
  const branchesScore = 75; // Simplified
  const elementsScore = Math.round((dayMasterScore + branchesScore) / 2);
  
  // Overall
  const westernAvg = (attraction + emotional + communication + longevity) / 4;
  const baziAvg = (dayMasterScore + branchesScore + elementsScore) / 3;
  const overall = Math.round(westernAvg * 0.5 + baziAvg * 0.5);
  
  // Strengths and challenges
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  if (emotional > 80) strengths.push('Deep emotional understanding');
  if (attraction > 75) strengths.push('Strong natural chemistry');
  if (dayMasterScore > 80) strengths.push('Day Masters in harmonious relationship');
  
  if (emotional < 60) challenges.push('May need to work on emotional connection');
  if (communication < 65) challenges.push('Communication styles differ');
  
  // Fun summary
  let funSummary: string;
  if (overall > 80) {
    funSummary = "Cosmic power couple alert! The stars (and the pillars) are definitely shipping this.";
  } else if (overall > 65) {
    funSummary = "Solid compatibility with enough differences to keep things interesting. You balance each other well.";
  } else if (overall > 50) {
    funSummary = "An interesting match - you'll learn a lot from each other. Growth opportunity disguised as a relationship.";
  } else {
    funSummary = "Challenging but not impossible. The best love stories often involve overcoming cosmic odds.";
  }
  
  return {
    overall,
    western: { emotional, attraction, communication, longevity },
    bazi: { dayMaster: dayMasterScore, branches: branchesScore, elements: elementsScore },
    strengths,
    challenges,
    funSummary,
  };
}
