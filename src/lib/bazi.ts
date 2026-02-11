/**
 * Chinese Bazi (Four Pillars) Calculations
 * Calculates Year, Month, Day, Hour pillars from birth data
 */

// Heavenly Stems (天干)
const HEAVENLY_STEMS = [
  { chinese: '甲', pinyin: 'Jia', element: 'Wood', polarity: 'Yang' },
  { chinese: '乙', pinyin: 'Yi', element: 'Wood', polarity: 'Yin' },
  { chinese: '丙', pinyin: 'Bing', element: 'Fire', polarity: 'Yang' },
  { chinese: '丁', pinyin: 'Ding', element: 'Fire', polarity: 'Yin' },
  { chinese: '戊', pinyin: 'Wu', element: 'Earth', polarity: 'Yang' },
  { chinese: '己', pinyin: 'Ji', element: 'Earth', polarity: 'Yin' },
  { chinese: '庚', pinyin: 'Geng', element: 'Metal', polarity: 'Yang' },
  { chinese: '辛', pinyin: 'Xin', element: 'Metal', polarity: 'Yin' },
  { chinese: '壬', pinyin: 'Ren', element: 'Water', polarity: 'Yang' },
  { chinese: '癸', pinyin: 'Gui', element: 'Water', polarity: 'Yin' },
] as const;

// Earthly Branches (地支)
const EARTHLY_BRANCHES = [
  { chinese: '子', pinyin: 'Zi', animal: 'Rat', element: 'Water', hours: [23, 0] },
  { chinese: '丑', pinyin: 'Chou', animal: 'Ox', element: 'Earth', hours: [1, 2] },
  { chinese: '寅', pinyin: 'Yin', animal: 'Tiger', element: 'Wood', hours: [3, 4] },
  { chinese: '卯', pinyin: 'Mao', animal: 'Rabbit', element: 'Wood', hours: [5, 6] },
  { chinese: '辰', pinyin: 'Chen', animal: 'Dragon', element: 'Earth', hours: [7, 8] },
  { chinese: '巳', pinyin: 'Si', animal: 'Snake', element: 'Fire', hours: [9, 10] },
  { chinese: '午', pinyin: 'Wu', animal: 'Horse', element: 'Fire', hours: [11, 12] },
  { chinese: '未', pinyin: 'Wei', animal: 'Goat', element: 'Earth', hours: [13, 14] },
  { chinese: '申', pinyin: 'Shen', animal: 'Monkey', element: 'Metal', hours: [15, 16] },
  { chinese: '酉', pinyin: 'You', animal: 'Rooster', element: 'Metal', hours: [17, 18] },
  { chinese: '戌', pinyin: 'Xu', animal: 'Dog', element: 'Earth', hours: [19, 20] },
  { chinese: '亥', pinyin: 'Hai', animal: 'Pig', element: 'Water', hours: [21, 22] },
] as const;

export interface Pillar {
  stem: string;
  stemChinese: string;
  stemElement: string;
  branch: string;
  branchChinese: string;
  branchAnimal: string;
  branchElement: string;
}

export interface BaziChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;
  dayMasterElement: string;
  elements: { Wood: number; Fire: number; Earth: number; Metal: number; Water: number };
}

/**
 * Get the Chinese New Year date for a given year
 * This is a simplified approximation - CNY falls between Jan 21 and Feb 20
 */
function getChineseNewYear(year: number): Date {
  // Simplified: Use approximate dates based on astronomical calculations
  // For accurate results, use a lunar calendar library
  const cnyDates: Record<number, [number, number]> = {
    1970: [2, 6], 1980: [2, 16], 1990: [1, 27], 2000: [2, 5],
    2010: [2, 14], 2020: [1, 25], 2024: [2, 10], 2025: [1, 29],
    2026: [2, 17],
  };
  
  // Find closest known year
  const knownYear = Object.keys(cnyDates).map(Number).filter(y => y <= year).pop() || 2000;
  const [month, day] = cnyDates[knownYear] || [2, 5];
  
  // Approximate adjustment for other years
  const yearDiff = year - knownYear;
  const adjustedDay = day + Math.round(yearDiff * 0.5) % 30;
  
  return new Date(year, month - 1, Math.min(Math.max(adjustedDay, 21), 20));
}

/**
 * Calculate the Year Pillar
 */
function calculateYearPillar(date: Date): Pillar {
  let year = date.getFullYear();
  
  // Check if before Chinese New Year
  const cny = getChineseNewYear(year);
  if (date < cny) {
    year -= 1;
  }
  
  // Stem index: (year - 4) % 10 gives the stem
  // 1984 was a Jia Zi year (stem 0, branch 0)
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  
  const stem = HEAVENLY_STEMS[(stemIndex + 10) % 10];
  const branch = EARTHLY_BRANCHES[(branchIndex + 12) % 12];
  
  return {
    stem: `${stem.chinese} ${stem.pinyin} (${stem.element})`,
    stemChinese: stem.chinese,
    stemElement: stem.element,
    branch: `${branch.chinese} ${branch.pinyin} (${branch.animal})`,
    branchChinese: branch.chinese,
    branchAnimal: branch.animal,
    branchElement: branch.element,
  };
}

/**
 * Calculate the Month Pillar
 * Month stems follow a pattern based on the year stem
 */
function calculateMonthPillar(date: Date, yearStemIndex: number): Pillar {
  // Chinese months are roughly offset from Western months
  // Month 1 (Tiger) starts around Feb 4
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // Approximate solar term dates (when months change)
  const solarTerms = [
    [2, 4],   // Month 1 starts (Tiger)
    [3, 6],   // Month 2 (Rabbit)
    [4, 5],   // Month 3 (Dragon)
    [5, 6],   // Month 4 (Snake)
    [6, 7],   // Month 5 (Horse)
    [7, 7],   // Month 6 (Goat)
    [8, 8],   // Month 7 (Monkey)
    [9, 8],   // Month 8 (Rooster)
    [10, 8],  // Month 9 (Dog)
    [11, 7],  // Month 10 (Pig)
    [0, 6],   // Month 11 (Rat)
    [1, 4],   // Month 12 (Ox)
  ];
  
  // Find which Chinese month we're in
  let chineseMonth = 0;
  for (let i = 0; i < 12; i++) {
    const [m, d] = solarTerms[i];
    if (month > m || (month === m && day >= d)) {
      chineseMonth = i;
    }
  }
  
  // Branch: months cycle through Tiger (2) to Ox (1)
  const branchIndex = (chineseMonth + 2) % 12;
  
  // Stem: follows a pattern based on year stem
  // Year stems 0,5 -> month stems start at 2 (Bing)
  // Year stems 1,6 -> month stems start at 4 (Wu)
  // etc.
  const monthStemStart = (yearStemIndex % 5) * 2 + 2;
  const stemIndex = (monthStemStart + chineseMonth) % 10;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    stem: `${stem.chinese} ${stem.pinyin} (${stem.element})`,
    stemChinese: stem.chinese,
    stemElement: stem.element,
    branch: `${branch.chinese} ${branch.pinyin} (${branch.animal})`,
    branchChinese: branch.chinese,
    branchAnimal: branch.animal,
    branchElement: branch.element,
  };
}

/**
 * Calculate the Day Pillar
 * Uses the formula based on days since reference date
 */
function calculateDayPillar(date: Date): Pillar {
  // Reference: Jan 1, 1900 was a Jia Xu day (stem 0, branch 10)
  const reference = new Date(1900, 0, 1);
  const diffTime = date.getTime() - reference.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Stem cycles every 10 days, branch every 12
  const stemIndex = (diffDays + 0) % 10; // Jia = 0 on reference
  const branchIndex = (diffDays + 10) % 12; // Xu = 10 on reference
  
  const stem = HEAVENLY_STEMS[(stemIndex + 10) % 10];
  const branch = EARTHLY_BRANCHES[(branchIndex + 12) % 12];
  
  return {
    stem: `${stem.chinese} ${stem.pinyin} (${stem.element})`,
    stemChinese: stem.chinese,
    stemElement: stem.element,
    branch: `${branch.chinese} ${branch.pinyin} (${branch.animal})`,
    branchChinese: branch.chinese,
    branchAnimal: branch.animal,
    branchElement: branch.element,
  };
}

/**
 * Calculate the Hour Pillar
 */
function calculateHourPillar(date: Date, dayStemIndex: number): Pillar {
  const hour = date.getHours();
  
  // Find branch based on hour
  // Each branch covers 2 hours, starting with Zi (23:00-01:00)
  let branchIndex: number;
  if (hour === 23 || hour === 0) branchIndex = 0;
  else branchIndex = Math.floor((hour + 1) / 2);
  
  // Stem follows pattern based on day stem
  // Day stems 0,5 -> hour stems start at 0 (Jia) for Zi hour
  const hourStemStart = (dayStemIndex % 5) * 2;
  const stemIndex = (hourStemStart + branchIndex) % 10;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    stem: `${stem.chinese} ${stem.pinyin} (${stem.element})`,
    stemChinese: stem.chinese,
    stemElement: stem.element,
    branch: `${branch.chinese} ${branch.pinyin} (${branch.animal})`,
    branchChinese: branch.chinese,
    branchAnimal: branch.animal,
    branchElement: branch.element,
  };
}

/**
 * Calculate Five Elements distribution from the chart
 */
function calculateElements(pillars: Pillar[]): { Wood: number; Fire: number; Earth: number; Metal: number; Water: number } {
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  pillars.forEach(pillar => {
    // Count stem element
    counts[pillar.stemElement as keyof typeof counts] += 1;
    // Count branch element
    counts[pillar.branchElement as keyof typeof counts] += 1;
  });
  
  // Convert to percentages
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    Wood: Math.round((counts.Wood / total) * 100),
    Fire: Math.round((counts.Fire / total) * 100),
    Earth: Math.round((counts.Earth / total) * 100),
    Metal: Math.round((counts.Metal / total) * 100),
    Water: Math.round((counts.Water / total) * 100),
  };
}

/**
 * Calculate complete Bazi chart from birth date/time
 */
export function calculateBaziChart(birthDate: Date): BaziChart {
  const yearPillar = calculateYearPillar(birthDate);
  
  // Get year stem index for month calculation
  let year = birthDate.getFullYear();
  const cny = getChineseNewYear(year);
  if (birthDate < cny) year -= 1;
  const yearStemIndex = (year - 4) % 10;
  
  const monthPillar = calculateMonthPillar(birthDate, yearStemIndex);
  const dayPillar = calculateDayPillar(birthDate);
  
  // Get day stem index for hour calculation
  const reference = new Date(1900, 0, 1);
  const diffDays = Math.floor((birthDate.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));
  const dayStemIndex = (diffDays + 0) % 10;
  
  const hourPillar = calculateHourPillar(birthDate, dayStemIndex);
  
  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const elements = calculateElements(allPillars);
  
  // Day Master is the day stem
  const dayMasterStem = HEAVENLY_STEMS[(dayStemIndex + 10) % 10];
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster: `${dayMasterStem.chinese} ${dayMasterStem.pinyin}`,
    dayMasterElement: dayMasterStem.element,
    elements,
  };
}
