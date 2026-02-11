/**
 * Cross-Reference Engine
 * 
 * Maps Western astrology elements to Chinese Five Elements
 * and finds reinforcing/balancing patterns.
 */

interface CrossRefResult {
  harmonyScore: number;
  reinforcing: Array<{ element: string; note: string }>;
  balancing: Array<{ element: string; note: string }>;
  conflicting: Array<{ element: string; note: string }>;
  synthesis: string;
}

// Western to Chinese element mapping weights
const ELEMENT_MAPPING: Record<string, Record<string, number>> = {
  Fire: { Fire: 1.0, Wood: 0.2 },
  Earth: { Earth: 1.0 },
  Air: { Metal: 0.6, Wood: 0.4 },
  Water: { Water: 1.0 }
};

/**
 * Analyze cross-reference between Western and Bazi charts
 */
export async function analyzeeCrossReference(
  westernChart: any,
  baziChart: any
): Promise<CrossRefResult> {
  // Map Western elements to Chinese Five Elements
  const westernMapped = mapWesternToChinese(westernChart.elements);
  const baziElements = baziChart.elements;
  
  const reinforcing: CrossRefResult['reinforcing'] = [];
  const balancing: CrossRefResult['balancing'] = [];
  const conflicting: CrossRefResult['conflicting'] = [];
  
  // Find patterns
  const fiveElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
  
  for (const element of fiveElements) {
    const western = westernMapped[element] || 0;
    const bazi = baziElements[element] || 0;
    
    if (western > 20 && bazi > 20) {
      // Reinforcing: strong in both
      reinforcing.push({
        element,
        note: `Strong in both systems - this ${element} energy is a core part of your nature`
      });
    } else if ((western > 20 && bazi < 10) || (bazi > 20 && western < 10)) {
      // Balancing: one compensates the other
      const source = western > bazi ? 'Western' : 'Bazi';
      balancing.push({
        element,
        note: `${source} chart provides ${element} that the other system lacks`
      });
    } else if (Math.abs(western - bazi) > 25) {
      // Conflicting: significant difference
      conflicting.push({
        element,
        note: `Tension between systems regarding ${element} energy`
      });
    }
  }
  
  // Calculate harmony score
  let harmonyScore = 50;
  harmonyScore += reinforcing.length * 12;
  harmonyScore += balancing.length * 5;
  harmonyScore -= conflicting.length * 8;
  harmonyScore = Math.max(0, Math.min(100, harmonyScore));
  
  // Generate synthesis (in production, use LLM)
  const synthesis = generateSynthesis(westernChart, baziChart, { reinforcing, balancing, conflicting });
  
  return {
    harmonyScore,
    reinforcing,
    balancing,
    conflicting,
    synthesis
  };
}

function mapWesternToChinese(westernElements: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  for (const [westEl, value] of Object.entries(westernElements)) {
    const mapping = ELEMENT_MAPPING[westEl];
    if (mapping) {
      for (const [chineseEl, weight] of Object.entries(mapping)) {
        result[chineseEl] += value * weight;
      }
    }
  }
  
  return result;
}

function generateSynthesis(western: any, bazi: any, patterns: any): string {
  // In production, this would use LLM with proper prompt
  // For prototype, return a template-based synthesis
  
  return `Your Western chart emphasizes ${getTopElement(western.elements)}, while your Bazi reveals 
a ${bazi.dayMasterElement}-dominant nature. This creates an interesting dynamic where your outer 
expression (Western) and inner core (Bazi) work together to create your unique personality. 
The ${patterns.reinforcing.length > 0 ? 'reinforcing patterns show consistency in your nature' : 
'balancing patterns show complementary energies'}.`;
}

function getTopElement(elements: Record<string, number>): string {
  return Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
}
