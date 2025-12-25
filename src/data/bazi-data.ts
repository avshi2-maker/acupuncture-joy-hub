// BaZi (Four Pillars) calculation data

// Heavenly Stems (Tian Gan) - 天干
export const heavenlyStems = [
  { id: 1, chinese: '甲', pinyin: 'Jia', english: 'Wood Yang', element: 'Wood', polarity: 'Yang', meridian: 'GB' },
  { id: 2, chinese: '乙', pinyin: 'Yi', english: 'Wood Yin', element: 'Wood', polarity: 'Yin', meridian: 'LIV' },
  { id: 3, chinese: '丙', pinyin: 'Bing', english: 'Fire Yang', element: 'Fire', polarity: 'Yang', meridian: 'SI' },
  { id: 4, chinese: '丁', pinyin: 'Ding', english: 'Fire Yin', element: 'Fire', polarity: 'Yin', meridian: 'HT' },
  { id: 5, chinese: '戊', pinyin: 'Wu', english: 'Earth Yang', element: 'Earth', polarity: 'Yang', meridian: 'ST' },
  { id: 6, chinese: '己', pinyin: 'Ji', english: 'Earth Yin', element: 'Earth', polarity: 'Yin', meridian: 'SP' },
  { id: 7, chinese: '庚', pinyin: 'Geng', english: 'Metal Yang', element: 'Metal', polarity: 'Yang', meridian: 'LI' },
  { id: 8, chinese: '辛', pinyin: 'Xin', english: 'Metal Yin', element: 'Metal', polarity: 'Yin', meridian: 'LU' },
  { id: 9, chinese: '壬', pinyin: 'Ren', english: 'Water Yang', element: 'Water', polarity: 'Yang', meridian: 'BL' },
  { id: 10, chinese: '癸', pinyin: 'Gui', english: 'Water Yin', element: 'Water', polarity: 'Yin', meridian: 'KI' },
];

// Earthly Branches (Di Zhi) - 地支
export const earthlyBranches = [
  { id: 1, chinese: '子', pinyin: 'Zi', english: 'Rat', element: 'Water', polarity: 'Yang', hour: '23:00-01:00', meridian: 'GB', hiddenStems: ['癸'] },
  { id: 2, chinese: '丑', pinyin: 'Chou', english: 'Ox', element: 'Earth', polarity: 'Yin', hour: '01:00-03:00', meridian: 'LIV', hiddenStems: ['己', '癸', '辛'] },
  { id: 3, chinese: '寅', pinyin: 'Yin', english: 'Tiger', element: 'Wood', polarity: 'Yang', hour: '03:00-05:00', meridian: 'LU', hiddenStems: ['甲', '丙', '戊'] },
  { id: 4, chinese: '卯', pinyin: 'Mao', english: 'Rabbit', element: 'Wood', polarity: 'Yin', hour: '05:00-07:00', meridian: 'LI', hiddenStems: ['乙'] },
  { id: 5, chinese: '辰', pinyin: 'Chen', english: 'Dragon', element: 'Earth', polarity: 'Yang', hour: '07:00-09:00', meridian: 'ST', hiddenStems: ['戊', '乙', '癸'] },
  { id: 6, chinese: '巳', pinyin: 'Si', english: 'Snake', element: 'Fire', polarity: 'Yin', hour: '09:00-11:00', meridian: 'SP', hiddenStems: ['丙', '庚', '戊'] },
  { id: 7, chinese: '午', pinyin: 'Wu', english: 'Horse', element: 'Fire', polarity: 'Yang', hour: '11:00-13:00', meridian: 'HT', hiddenStems: ['丁', '己'] },
  { id: 8, chinese: '未', pinyin: 'Wei', english: 'Goat', element: 'Earth', polarity: 'Yin', hour: '13:00-15:00', meridian: 'SI', hiddenStems: ['己', '丁', '乙'] },
  { id: 9, chinese: '申', pinyin: 'Shen', english: 'Monkey', element: 'Metal', polarity: 'Yang', hour: '15:00-17:00', meridian: 'BL', hiddenStems: ['庚', '壬', '戊'] },
  { id: 10, chinese: '酉', pinyin: 'You', english: 'Rooster', element: 'Metal', polarity: 'Yin', hour: '17:00-19:00', meridian: 'KI', hiddenStems: ['辛'] },
  { id: 11, chinese: '戌', pinyin: 'Xu', english: 'Dog', element: 'Earth', polarity: 'Yang', hour: '19:00-21:00', meridian: 'PC', hiddenStems: ['戊', '辛', '丁'] },
  { id: 12, chinese: '亥', pinyin: 'Hai', english: 'Pig', element: 'Water', polarity: 'Yin', hour: '21:00-23:00', meridian: 'TH', hiddenStems: ['壬', '甲'] },
];

// Ten Gods (Shi Shen) - 十神
export const tenGods = [
  { id: 'friend', chinese: '比肩', pinyin: 'Bi Jian', english: 'Friend', description: 'Same element, same polarity as Day Master' },
  { id: 'rob_wealth', chinese: '劫财', pinyin: 'Jie Cai', english: 'Rob Wealth', description: 'Same element, opposite polarity as Day Master' },
  { id: 'eating_god', chinese: '食神', pinyin: 'Shi Shen', english: 'Eating God', description: 'Element produced by Day Master, same polarity' },
  { id: 'hurting_officer', chinese: '伤官', pinyin: 'Shang Guan', english: 'Hurting Officer', description: 'Element produced by Day Master, opposite polarity' },
  { id: 'indirect_wealth', chinese: '偏财', pinyin: 'Pian Cai', english: 'Indirect Wealth', description: 'Element controlled by Day Master, same polarity' },
  { id: 'direct_wealth', chinese: '正财', pinyin: 'Zheng Cai', english: 'Direct Wealth', description: 'Element controlled by Day Master, opposite polarity' },
  { id: 'qi_sha', chinese: '七杀', pinyin: 'Qi Sha', english: 'Seven Killings', description: 'Element that controls Day Master, same polarity' },
  { id: 'direct_officer', chinese: '正官', pinyin: 'Zheng Guan', english: 'Direct Officer', description: 'Element that controls Day Master, opposite polarity' },
  { id: 'indirect_resource', chinese: '偏印', pinyin: 'Pian Yin', english: 'Indirect Resource', description: 'Element that produces Day Master, same polarity' },
  { id: 'direct_resource', chinese: '正印', pinyin: 'Zheng Yin', english: 'Direct Resource', description: 'Element that produces Day Master, opposite polarity' },
];

// Element relationships
export const elementRelations = {
  produces: { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' },
  controls: { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' },
  producedBy: { Wood: 'Water', Fire: 'Wood', Earth: 'Fire', Metal: 'Earth', Water: 'Metal' },
  controlledBy: { Wood: 'Metal', Fire: 'Water', Earth: 'Wood', Metal: 'Fire', Water: 'Earth' },
};

// Season to Element mapping
export const seasonElements = {
  spring: 'Wood',
  summer: 'Fire',
  autumn: 'Metal',
  winter: 'Water',
  // Late summer (transition periods) = Earth
};

// Lunar month starting dates (approximate)
export const lunarMonthStarts = [
  { month: 1, name: 'Tiger', branch: '寅', startDate: '02-04' },
  { month: 2, name: 'Rabbit', branch: '卯', startDate: '03-06' },
  { month: 3, name: 'Dragon', branch: '辰', startDate: '04-05' },
  { month: 4, name: 'Snake', branch: '巳', startDate: '05-06' },
  { month: 5, name: 'Horse', branch: '午', startDate: '06-06' },
  { month: 6, name: 'Goat', branch: '未', startDate: '07-07' },
  { month: 7, name: 'Monkey', branch: '申', startDate: '08-08' },
  { month: 8, name: 'Rooster', branch: '酉', startDate: '09-08' },
  { month: 9, name: 'Dog', branch: '戌', startDate: '10-08' },
  { month: 10, name: 'Pig', branch: '亥', startDate: '11-07' },
  { month: 11, name: 'Rat', branch: '子', startDate: '12-07' },
  { month: 12, name: 'Ox', branch: '丑', startDate: '01-06' },
];

// Calculate BaZi pillars from date and time
export function calculateBaZi(date: Date, hour: number, minute: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Calculate Year Pillar
  const yearStemIndex = (year - 4) % 10;
  const yearBranchIndex = (year - 4) % 12;
  
  // Calculate Month Pillar (simplified - would need solar terms for accuracy)
  const monthBranchIndex = (month + 1) % 12;
  const yearStemNum = yearStemIndex === 0 ? 10 : yearStemIndex;
  let monthStemBase = 0;
  if ([1, 6].includes(yearStemNum)) monthStemBase = 2;
  else if ([2, 7].includes(yearStemNum)) monthStemBase = 4;
  else if ([3, 8].includes(yearStemNum)) monthStemBase = 6;
  else if ([4, 9].includes(yearStemNum)) monthStemBase = 8;
  else if ([5, 10].includes(yearStemNum)) monthStemBase = 0;
  const monthStemIndex = (monthStemBase + month - 1) % 10;
  
  // Calculate Day Pillar (simplified algorithm)
  const baseDate = new Date(1900, 0, 31); // Reference date: Feb 1, 1900 = 甲子
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayStemIndex = diffDays % 10;
  const dayBranchIndex = diffDays % 12;
  
  // Calculate Hour Pillar
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);
  const dayStemNum = dayStemIndex === 0 ? 10 : dayStemIndex;
  let hourStemBase = 0;
  if ([1, 6].includes(dayStemNum)) hourStemBase = 0;
  else if ([2, 7].includes(dayStemNum)) hourStemBase = 2;
  else if ([3, 8].includes(dayStemNum)) hourStemBase = 4;
  else if ([4, 9].includes(dayStemNum)) hourStemBase = 6;
  else if ([5, 10].includes(dayStemNum)) hourStemBase = 8;
  const hourStemIndex = (hourStemBase + hourBranchIndex) % 10;
  
  // Get actual stems and branches
  const getIndex = (idx: number, len: number) => idx === 0 ? len : idx;
  
  return {
    year: {
      stem: heavenlyStems[getIndex(yearStemIndex, 10) - 1],
      branch: earthlyBranches[getIndex(yearBranchIndex, 12) - 1],
    },
    month: {
      stem: heavenlyStems[monthStemIndex],
      branch: earthlyBranches[monthBranchIndex],
    },
    day: {
      stem: heavenlyStems[getIndex(dayStemIndex, 10) - 1],
      branch: earthlyBranches[getIndex(dayBranchIndex, 12) - 1],
    },
    hour: {
      stem: heavenlyStems[hourStemIndex],
      branch: earthlyBranches[hourBranchIndex],
    },
  };
}

// Calculate element strengths
export function calculateElementStrengths(bazi: ReturnType<typeof calculateBaZi>) {
  const strengths: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  const weights = [1, 1.5, 1, 0.5]; // Month has strongest seasonal influence
  
  pillars.forEach((pillar, i) => {
    const weight = weights[i];
    // Count stem element
    strengths[pillar.stem.element] += 10 * weight;
    // Count branch element
    strengths[pillar.branch.element] += 10 * weight;
    // Count hidden stems
    pillar.branch.hiddenStems.forEach((hs, j) => {
      const stem = heavenlyStems.find(s => s.chinese === hs);
      if (stem) {
        const hsWeight = j === 0 ? 7 : j === 1 ? 3 : 1;
        strengths[stem.element] += hsWeight * weight;
      }
    });
  });
  
  return strengths;
}

// Determine if chart is balanced
export function analyzeBalance(strengths: Record<string, number>, dayMasterElement: string) {
  const total = Object.values(strengths).reduce((a, b) => a + b, 0);
  const dayMasterStrength = strengths[dayMasterElement];
  const ratio = dayMasterStrength / total;
  
  if (ratio > 0.35) return { status: 'Strong', description: 'Day Master is strong - may need to weaken or exhaust' };
  if (ratio < 0.15) return { status: 'Weak', description: 'Day Master is weak - may need to support or strengthen' };
  return { status: 'Balanced', description: 'Chart is relatively balanced' };
}

// Get acupuncture recommendations based on BaZi
export function getAcupunctureRecommendations(bazi: ReturnType<typeof calculateBaZi>, strengths: Record<string, number>) {
  const dayMaster = bazi.day.stem;
  const balance = analyzeBalance(strengths, dayMaster.element);
  
  const recommendations: Array<{point: string; reason: string}> = [];
  
  // Based on Day Master meridian
  recommendations.push({
    point: `${dayMaster.meridian} Source Point`,
    reason: `Support Day Master (${dayMaster.pinyin} - ${dayMaster.english})`
  });
  
  // Based on weak/strong elements
  const sortedElements = Object.entries(strengths).sort((a, b) => a[1] - b[1]);
  const weakestElement = sortedElements[0][0];
  const strongestElement = sortedElements[sortedElements.length - 1][0];
  
  const elementToMeridian: Record<string, string[]> = {
    Wood: ['LIV', 'GB'],
    Fire: ['HT', 'SI', 'PC', 'TH'],
    Earth: ['SP', 'ST'],
    Metal: ['LU', 'LI'],
    Water: ['KI', 'BL'],
  };
  
  if (balance.status === 'Weak') {
    const supportMeridians = elementToMeridian[elementRelations.producedBy[dayMaster.element as keyof typeof elementRelations.producedBy]];
    recommendations.push({
      point: `${supportMeridians[0]} Tonification Point`,
      reason: `Strengthen weak Day Master via ${elementRelations.producedBy[dayMaster.element as keyof typeof elementRelations.producedBy]} element`
    });
  } else if (balance.status === 'Strong') {
    const drainMeridians = elementToMeridian[elementRelations.produces[dayMaster.element as keyof typeof elementRelations.produces]];
    recommendations.push({
      point: `${drainMeridians[0]} Sedation Point`,
      reason: `Drain excess via ${elementRelations.produces[dayMaster.element as keyof typeof elementRelations.produces]} element`
    });
  }
  
  // Add ZWLZ (Zi Wu Liu Zhu) recommendation based on hour
  recommendations.push({
    point: `${bazi.hour.branch.meridian} Opening Point`,
    reason: `Zi Wu Liu Zhu - optimal meridian for current hour (${bazi.hour.branch.hour})`
  });
  
  return { recommendations, balance };
}
