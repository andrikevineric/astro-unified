/**
 * Compatibility Engine
 * 
 * Calculates compatibility between two people using
 * both Western synastry and Bazi harmony.
 */

interface CompatibilityResult {
  overallScore: number;
  western: {
    emotional: number;
    attraction: number;
    communication: number;
    longevity: number;
  };
  bazi: {
    dayMasterHarmony: number;
    branchCombinations: number;
    elementComplement: number;
  };
  strengths: string[];
  challenges: string[];
  funSummary: string;
}

// Five Element productive cycle
const PRODUCES: Record<string, string> = {
  Wood: 'Fire',
  Fire: 'Earth',
  Earth: 'Metal',
  Metal: 'Water',
  Water: 'Wood'
};

// Five Element control cycle
const CONTROLS: Record<string, string> = {
  Wood: 'Earth',
  Fire: 'Metal',
  Earth: 'Water',
  Metal: 'Wood',
  Water: 'Fire'
};

/**
 * Calculate compatibility between two people
 */
export async function calculateCompatibility(
  personA: { western: any; bazi: any },
  personB: { western: any; bazi: any }
): Promise<CompatibilityResult> {
  // Calculate Western synastry scores
  const western = calculateWesternSynastry(personA.western, personB.western);
  
  // Calculate Bazi compatibility scores
  const bazi = calculateBaziHarmony(personA.bazi, personB.bazi);
  
  // Calculate overall score (weighted average)
  const westernAvg = (western.emotional + western.attraction + western.communication + western.longevity) / 4;
  const baziAvg = (bazi.dayMasterHarmony + bazi.branchCombinations + bazi.elementComplement) / 3;
  const overallScore = Math.round(westernAvg * 0.5 + baziAvg * 0.5);
  
  // Generate strengths and challenges
  const { strengths, challenges } = analyzeRelationship(western, bazi, personA, personB);
  
  // Generate fun summary (in production, use LLM)
  const funSummary = generateFunSummary(overallScore, strengths, challenges);
  
  return {
    overallScore,
    western,
    bazi,
    strengths,
    challenges,
    funSummary
  };
}

function calculateWesternSynastry(chartA: any, chartB: any) {
  // TODO: Implement proper synastry aspect calculation
  // Mock implementation for prototype
  return {
    emotional: 85,
    attraction: 72,
    communication: 68,
    longevity: 78
  };
}

function calculateBaziHarmony(baziA: any, baziB: any) {
  // Day Master relationship
  const dmA = baziA?.dayMasterElement || 'Wood';
  const dmB = baziB?.dayMasterElement || 'Fire';
  
  let dayMasterHarmony = 60; // Base score
  
  if (PRODUCES[dmA] === dmB || PRODUCES[dmB] === dmA) {
    dayMasterHarmony = 90; // Productive relationship
  } else if (dmA === dmB) {
    dayMasterHarmony = 70; // Same element - understanding but competition
  } else if (CONTROLS[dmA] === dmB || CONTROLS[dmB] === dmA) {
    dayMasterHarmony = 45; // Control relationship - challenging
  }
  
  // Branch combinations (simplified)
  const branchCombinations = 75; // TODO: Calculate actual 六合, 三合
  
  // Element complement
  const elementComplement = calculateElementComplement(baziA?.elements, baziB?.elements);
  
  return {
    dayMasterHarmony,
    branchCombinations,
    elementComplement
  };
}

function calculateElementComplement(elementsA: any, elementsB: any): number {
  if (!elementsA || !elementsB) return 60;
  
  let score = 50;
  const fiveElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  
  for (const element of fiveElements) {
    const a = elementsA[element] || 0;
    const b = elementsB[element] || 0;
    
    // One fills the other's gap
    if ((a < 10 && b > 25) || (b < 10 && a > 25)) {
      score += 10;
    }
  }
  
  return Math.min(100, score);
}

function analyzeRelationship(western: any, bazi: any, personA: any, personB: any) {
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  if (western.emotional > 80) {
    strengths.push('Deep emotional understanding and connection');
  }
  if (western.attraction > 75) {
    strengths.push('Strong physical and romantic chemistry');
  }
  if (bazi.dayMasterHarmony > 80) {
    strengths.push('Day Masters in productive relationship - natural flow');
  }
  if (bazi.branchCombinations > 80) {
    strengths.push('Favorable branch combinations enhance harmony');
  }
  
  if (western.communication < 70) {
    challenges.push('Communication styles may differ - practice active listening');
  }
  if (bazi.elementComplement < 60) {
    challenges.push('Similar elemental lacks - work together to compensate');
  }
  if (bazi.dayMasterHarmony < 50) {
    challenges.push('Day Masters in tension - respect differences');
  }
  
  return { strengths, challenges };
}

function generateFunSummary(score: number, strengths: string[], challenges: string[]): string {
  // In production, use LLM for creative summaries
  
  if (score > 80) {
    return "You two are basically a cosmic power couple. The universe shipped it before you even met.";
  } else if (score > 65) {
    return "You've got solid compatibility with just enough spice to keep things interesting. A good balance of harmony and growth.";
  } else if (score > 50) {
    return "An interesting match that'll keep you both on your toes. The differences can become your greatest teachers.";
  } else {
    return "A challenging match, but hey, some of the best love stories are about overcoming odds. Communication is your superpower here.";
  }
}
