// Diet & Nutrition Reference Data for Patient Intake Form
// Includes Western and TCM perspectives from clinic_diet_nutrition_intake_form.csv

export interface DietHabit {
  habit: string;
  westernPerspective: string;
  tcmPerspective: string;
  estimatedCalories: string;
}

export interface DietCategory {
  category: string;
  habits: DietHabit[];
}

export const dietNutritionData: DietCategory[] = [
  {
    category: 'Meal Pattern',
    habits: [
      { habit: 'Three regular meals per day', westernPerspective: 'Standard meal pattern, supports stable blood sugar', tcmPerspective: 'Supports spleen qi, regular transformation and transportation', estimatedCalories: '1800-2400' },
      { habit: 'Two meals per day (intermittent fasting)', westernPerspective: 'May support weight loss, autophagy, insulin sensitivity', tcmPerspective: 'May weaken spleen qi if deficient, suitable for excess patterns', estimatedCalories: '1600-2200' },
      { habit: '5-6 small meals per day (grazing)', westernPerspective: 'Stabilizes blood sugar, may support metabolism', tcmPerspective: 'May overwork spleen, disrupts digestive rhythm', estimatedCalories: '1800-2400' },
      { habit: 'One meal per day (OMAD)', westernPerspective: 'Extreme calorie restriction, autophagy benefits', tcmPerspective: 'Depletes qi and blood over time, damages spleen yang', estimatedCalories: '1200-2000' },
      { habit: 'Irregular eating times', westernPerspective: 'Disrupts circadian rhythm, metabolic confusion', tcmPerspective: 'Severely damages spleen and stomach harmony', estimatedCalories: 'Variable' },
      { habit: 'Skipping breakfast', westernPerspective: 'May affect morning energy and metabolism', tcmPerspective: 'Weakens spleen qi, reduces yang qi production for day', estimatedCalories: '1400-2000' },
      { habit: 'Large dinner, light breakfast/lunch', westernPerspective: 'May interfere with sleep, evening metabolism slower', tcmPerspective: 'Creates dampness, weakens spleen, stomach qi descends poorly', estimatedCalories: '1800-2400' },
      { habit: 'Eating largest meal at lunch', westernPerspective: 'Aligns with peak metabolic activity', tcmPerspective: 'Optimal - supports spleen-stomach when qi strongest (earth time)', estimatedCalories: '1800-2400' },
    ]
  },
  {
    category: 'Dietary Approach',
    habits: [
      { habit: 'Standard Western diet', westernPerspective: 'Mixed macros, processed foods, high sugar and fat', tcmPerspective: 'Creates dampness, phlegm, heat; depletes spleen qi', estimatedCalories: '2000-3000' },
      { habit: 'Mediterranean diet', westernPerspective: 'Heart-healthy fats, whole grains, anti-inflammatory', tcmPerspective: 'Balanced, nourishes yin and blood, gentle on spleen', estimatedCalories: '1800-2500' },
      { habit: 'Vegetarian diet', westernPerspective: 'High fiber, lower saturated fat, requires B12 supplementation', tcmPerspective: 'Cooling nature, may deplete yang qi and blood over time', estimatedCalories: '1600-2200' },
      { habit: 'Vegan diet', westernPerspective: 'Plant-based, requires B12, iron, omega-3 attention', tcmPerspective: 'Very cooling, depletes blood and yang, weakens kidney', estimatedCalories: '1400-2000' },
      { habit: 'Ketogenic diet', westernPerspective: 'Very low carb, high fat, ketosis for energy', tcmPerspective: 'Warming, drying, may deplete yin and blood long-term', estimatedCalories: '1500-2200' },
      { habit: 'Paleo diet', westernPerspective: 'Whole foods, no grains/dairy, hunter-gatherer model', tcmPerspective: 'Warming, supports yang, may be too drying for some', estimatedCalories: '1800-2400' },
      { habit: 'Raw food diet', westernPerspective: 'Preserves enzymes, high nutrient density', tcmPerspective: 'Extremely damaging to spleen yang, creates cold dampness', estimatedCalories: '1200-1800' },
      { habit: 'Macrobiotic diet', westernPerspective: 'Whole grains, vegetables, Japanese-inspired', tcmPerspective: 'Balanced approach, supports spleen, harmonizes yin-yang', estimatedCalories: '1600-2200' },
      { habit: 'DASH diet (blood pressure)', westernPerspective: 'Low sodium, high potassium, heart health focus', tcmPerspective: 'Clears heat, nourishes yin, benefits kidney and heart', estimatedCalories: '1600-2400' },
      { habit: 'Carnivore diet', westernPerspective: 'All animal products, controversial, limited research', tcmPerspective: 'Extremely warming and drying, generates heat and dryness', estimatedCalories: '1800-2800' },
      { habit: 'Gluten-free diet', westernPerspective: 'Essential for celiac, trendy for others, may lack fiber', tcmPerspective: 'Reduces dampness if gluten creates phlegm for individual', estimatedCalories: '1800-2400' },
      { habit: 'Low FODMAP diet', westernPerspective: 'Reduces IBS symptoms, eliminates fermentable carbs', tcmPerspective: 'Reduces fermentation (dampness-heat in intestines)', estimatedCalories: '1600-2200' },
    ]
  },
  {
    category: 'Grain Consumption',
    habits: [
      { habit: 'White rice daily', westernPerspective: 'High glycemic, low fiber, quick energy', tcmPerspective: 'Neutral, tonifies spleen and stomach qi, easily digested', estimatedCalories: '200-400 from rice' },
      { habit: 'Brown rice daily', westernPerspective: 'Higher fiber, B vitamins, slower digestion', tcmPerspective: 'Slightly cooling, tonifies qi, more difficult to digest', estimatedCalories: '200-400 from rice' },
      { habit: 'Wheat/bread products daily', westernPerspective: 'Staple carb source, refined vs whole grain matters', tcmPerspective: 'Cooling, nourishes heart, may create dampness if excess', estimatedCalories: '300-600 from wheat' },
      { habit: 'Oats regularly', westernPerspective: 'Soluble fiber, heart health, sustained energy', tcmPerspective: 'Sweet, warming, tonifies spleen, benefits qi and blood', estimatedCalories: '150-300 from oats' },
      { habit: 'No grains (grain-free)', westernPerspective: 'Low carb approach, may lack B vitamins and fiber', tcmPerspective: 'Deprives spleen of natural tonification, may weaken qi', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Protein Source',
    habits: [
      { habit: 'Red meat 4+ times/week', westernPerspective: 'High protein, iron, B12, saturated fat concerns', tcmPerspective: 'Very warming, tonifies qi and blood, nourishes kidney yang', estimatedCalories: '400-800 from meat' },
      { habit: 'Poultry as main protein', westernPerspective: 'Lean protein, lower saturated fat than red meat', tcmPerspective: 'Warming, tonifies qi, chicken benefits spleen', estimatedCalories: '300-600 from poultry' },
      { habit: 'Fish/seafood regularly (3+ times/week)', westernPerspective: 'Omega-3 fatty acids, lean protein, heart healthy', tcmPerspective: 'Neutral to cooling, nourishes yin and blood, benefits kidney', estimatedCalories: '250-500 from seafood' },
      { habit: 'Legumes as primary protein', westernPerspective: 'Plant protein, fiber, low fat, may cause gas', tcmPerspective: 'Mostly neutral, tonifies spleen, may create dampness', estimatedCalories: '300-600 from legumes' },
      { habit: 'Eggs daily', westernPerspective: 'Complete protein, cholesterol concerns debated, nutrient-dense', tcmPerspective: 'Neutral, nourishes yin and blood, moistens dryness', estimatedCalories: '140-280 from eggs' },
      { habit: 'Dairy products daily', westernPerspective: 'Calcium, protein, vitamin D, lactose intolerance common', tcmPerspective: 'Cooling, creates dampness and phlegm, weakens spleen', estimatedCalories: '200-500 from dairy' },
      { habit: 'Protein supplements/powders', westernPerspective: 'Concentrated protein, convenient, various sources available', tcmPerspective: 'Difficult to classify, often too concentrated for spleen', estimatedCalories: '100-400 from supplements' },
    ]
  },
  {
    category: 'Vegetable Intake',
    habits: [
      { habit: '5+ servings vegetables daily', westernPerspective: 'High fiber, vitamins, minerals, antioxidants, disease prevention', tcmPerspective: 'Generally cooling, nourishes yin and blood if cooked', estimatedCalories: '100-300 from vegetables' },
      { habit: 'Mostly cooked vegetables', westernPerspective: 'Easier digestion, some nutrient loss, increased lycopene', tcmPerspective: 'Optimal - warms nature, easier for spleen to transform', estimatedCalories: '100-300 from vegetables' },
      { habit: 'Mostly raw vegetables/salads', westernPerspective: 'Maximum enzyme and vitamin C content', tcmPerspective: 'Damages spleen yang, creates cold dampness, difficult to digest', estimatedCalories: '80-250 from vegetables' },
      { habit: 'Minimal vegetables (1-2 servings/day)', westernPerspective: 'Fiber deficiency, vitamin/mineral insufficiency', tcmPerspective: 'May lack yin nourishment, depends on other foods', estimatedCalories: '25-100 from vegetables' },
    ]
  },
  {
    category: 'Fruit Intake',
    habits: [
      { habit: '3+ servings fruit daily', westernPerspective: 'Vitamins, fiber, antioxidants, natural sugars', tcmPerspective: 'Mostly cooling, nourishes yin and fluids, clears heat', estimatedCalories: '180-360 from fruit' },
      { habit: 'Tropical fruits regularly', westernPerspective: 'Vitamin C, enzymes (papaya, pineapple), high sugar', tcmPerspective: 'Very cooling and dampening, weakens spleen in excess', estimatedCalories: '150-300 from fruit' },
      { habit: 'Dried fruits regularly', westernPerspective: 'Concentrated sugars, dense calories, some nutrients preserved', tcmPerspective: 'Warming when dried, tonifies qi and blood (dates, longan)', estimatedCalories: '200-400 from dried fruit' },
      { habit: 'Low fruit intake (avoiding sugar)', westernPerspective: 'Reduces sugar intake, may lack certain vitamins', tcmPerspective: 'May lack yin nourishment and fluid generation', estimatedCalories: '30-100 from fruit' },
    ]
  },
  {
    category: 'Beverage',
    habits: [
      { habit: 'Water as primary beverage (8+ cups)', westernPerspective: 'Optimal hydration, supports all body functions', tcmPerspective: 'Neutral, supports kidney, generates fluids, avoid iced', estimatedCalories: '0' },
      { habit: 'Coffee daily (1-3 cups)', westernPerspective: 'Caffeine stimulant, antioxidants, may affect sleep', tcmPerspective: 'Warming, stimulates heart, depletes kidney yin long-term', estimatedCalories: '0-150 (with additions)' },
      { habit: 'Coffee daily (4+ cups)', westernPerspective: 'High caffeine, anxiety, insomnia risk, dependency', tcmPerspective: 'Severely depletes kidney yin, creates internal heat', estimatedCalories: '0-200 (with additions)' },
      { habit: 'Green tea daily', westernPerspective: 'Antioxidants, moderate caffeine, metabolic benefits', tcmPerspective: 'Cooling, clears heat, benefits liver, drains dampness', estimatedCalories: '0-20' },
      { habit: 'Black tea daily', westernPerspective: 'More caffeine than green tea, antioxidants', tcmPerspective: 'Warming, stimulates qi, may dry fluids', estimatedCalories: '0-30' },
      { habit: 'Herbal teas regularly', westernPerspective: 'Caffeine-free, various health benefits depending on herbs', tcmPerspective: 'Varies by herb - can tonify, clear, warm, or cool', estimatedCalories: '0-10' },
      { habit: 'Alcohol regularly (daily or most days)', westernPerspective: 'Liver stress, empty calories, health risks', tcmPerspective: 'Generates damp-heat, damages liver and spleen', estimatedCalories: '150-500 from alcohol' },
      { habit: 'Alcohol moderately (1-3 times/week)', westernPerspective: 'Cardiovascular benefits debated, moderation key', tcmPerspective: 'Small amounts move qi and blood, excess creates damp-heat', estimatedCalories: '100-300 from alcohol' },
      { habit: 'Sugary drinks/soda regularly', westernPerspective: 'High sugar, weight gain, diabetes risk, dental issues', tcmPerspective: 'Creates severe dampness and phlegm, weakens spleen', estimatedCalories: '200-600 from sugary drinks' },
      { habit: 'Fruit juice daily', westernPerspective: 'Concentrated sugars, lacks fiber, vitamin source', tcmPerspective: 'Cooling, dampening, weakens spleen if excessive', estimatedCalories: '120-300 from juice' },
      { habit: 'Energy drinks regularly', westernPerspective: 'High caffeine and sugar, heart concerns, dependency', tcmPerspective: 'Extremely heating, depletes kidney essence and yin', estimatedCalories: '100-300 from energy drinks' },
      { habit: 'Milk/plant milk daily', westernPerspective: 'Calcium, protein (cow milk), fortified nutrients', tcmPerspective: 'Cow milk creates dampness; plant milks vary by base', estimatedCalories: '80-200 from milk' },
      { habit: 'Smoothies regularly', westernPerspective: 'Nutrient-dense, fiber intact, easy to overconsume calories', tcmPerspective: 'Cold and dampening if raw/iced, bypasses chewing', estimatedCalories: '200-500 from smoothies' },
      { habit: 'Bone broth regularly', westernPerspective: 'Collagen, minerals, amino acids, gut health', tcmPerspective: 'Warming, tonifies kidney essence, nourishes blood and marrow', estimatedCalories: '40-100 from broth' },
    ]
  },
  {
    category: 'Eating Behavior',
    habits: [
      { habit: 'Eating slowly, chewing thoroughly', westernPerspective: 'Improves digestion, satiety signals, mindful eating', tcmPerspective: 'Optimal - supports spleen transformation, proper qi extraction', estimatedCalories: 'N/A - behavior' },
      { habit: 'Eating quickly, poor chewing', westernPerspective: 'Overeating, poor digestion, gas and bloating', tcmPerspective: 'Damages spleen, food stagnation, disrupts qi flow', estimatedCalories: 'N/A - behavior' },
      { habit: 'Eating while distracted (TV, phone, work)', westernPerspective: 'Mindless overeating, poor food awareness', tcmPerspective: 'Disrupts spleen-stomach harmony, qi becomes scattered', estimatedCalories: 'N/A - behavior' },
      { habit: 'Eating until very full', westernPerspective: 'Overeating, weight gain, metabolic stress', tcmPerspective: 'Severely damages spleen, creates food stagnation and dampness', estimatedCalories: 'Often excessive' },
      { habit: 'Eating until 80% full (Hara Hachi Bu)', westernPerspective: 'Supports healthy weight, longevity, proper digestion', tcmPerspective: 'Ideal - preserves spleen qi, prevents stagnation', estimatedCalories: 'Appropriate amounts' },
      { habit: 'Late night eating (after 8-9pm)', westernPerspective: 'May disrupt sleep, circadian rhythm, metabolism', tcmPerspective: 'Weakens spleen yang, creates dampness, interferes with organ rest', estimatedCalories: 'Variable timing' },
      { habit: 'Emotional eating', westernPerspective: 'Using food for comfort, stress eating, weight issues', tcmPerspective: 'Liver qi stagnation affecting spleen, disrupts harmony', estimatedCalories: 'Often excessive' },
      { habit: 'Restrictive eating/dieting cycles', westernPerspective: 'Yo-yo effect, metabolic adaptation, psychological stress', tcmPerspective: 'Depletes qi and blood, weakens spleen and kidney', estimatedCalories: 'Often inadequate' },
    ]
  },
  {
    category: 'Food Temperature',
    habits: [
      { habit: 'Mostly warm/cooked foods', westernPerspective: 'Easier digestion, kills pathogens, some nutrient loss', tcmPerspective: 'Optimal - supports spleen yang, easy transformation', estimatedCalories: 'Variable' },
      { habit: 'Cold/iced foods and drinks regularly', westernPerspective: 'Refreshing, may slow digestion temporarily', tcmPerspective: 'Severely damages spleen yang, creates cold dampness', estimatedCalories: 'Variable' },
      { habit: 'Room temperature foods preferred', westernPerspective: 'Neutral approach, less digestive shock', tcmPerspective: 'Acceptable but less supportive than warm foods', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Preparation Method',
    habits: [
      { habit: 'Steamed and boiled foods primarily', westernPerspective: 'Low fat, preserves nutrients, gentle cooking', tcmPerspective: 'Gentle, moistening, easy on spleen, nourishes yin', estimatedCalories: 'Variable' },
      { habit: 'Stir-fried foods regularly', westernPerspective: 'Quick cooking, preserves texture, added oil', tcmPerspective: 'Warming, tonifies yang, moves qi', estimatedCalories: 'Variable' },
      { habit: 'Deep-fried foods regularly', westernPerspective: 'High calories, trans fats, oxidized oils, health risks', tcmPerspective: 'Extremely heating, creates damp-heat and phlegm', estimatedCalories: 'Often excessive' },
      { habit: 'Grilled/roasted foods frequently', westernPerspective: 'Flavorful, lower added fat, possible carcinogens if charred', tcmPerspective: 'Very warming and drying, may create heat', estimatedCalories: 'Variable' },
      { habit: 'Slow-cooked soups and stews', westernPerspective: 'Tender, easy to digest, nutrient extraction into liquid', tcmPerspective: 'Optimal - tonifies qi, easy to digest, nourishes essence', estimatedCalories: 'Variable' },
      { habit: 'Microwaved meals regularly', westernPerspective: 'Convenient, uneven heating, often processed foods', tcmPerspective: 'Disrupts food qi, difficult for spleen to process', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Flavor Preference',
    habits: [
      { habit: 'Sweet flavor dominant', westernPerspective: 'Sugar cravings, blood sugar issues, dental concerns', tcmPerspective: 'Tonifies spleen in moderation, creates dampness in excess', estimatedCalories: 'Often excessive' },
      { habit: 'Salty flavor dominant', westernPerspective: 'High sodium, blood pressure concerns, fluid retention', tcmPerspective: 'Enters kidney, softens hardness, excess damages kidney', estimatedCalories: 'Variable' },
      { habit: 'Spicy/pungent foods regularly', westernPerspective: 'Capsaicin benefits, may irritate GI tract, metabolism boost', tcmPerspective: 'Disperses and moves qi, warming, depletes yin if excessive', estimatedCalories: 'Variable' },
      { habit: 'Sour flavor preference', westernPerspective: 'Acids, fermented foods, may benefit digestion', tcmPerspective: 'Astringes, gathers qi, enters liver, supports yin', estimatedCalories: 'Variable' },
      { habit: 'Bitter flavor foods', westernPerspective: 'Often nutrient-dense vegetables, acquired taste', tcmPerspective: 'Clears heat, drains dampness, enters heart, dries if excessive', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Snacking',
    habits: [
      { habit: 'Frequent snacking throughout day', westernPerspective: 'May support blood sugar but can lead to overconsumption', tcmPerspective: 'Overworks spleen, no rest for digestion, creates dampness', estimatedCalories: '300-800 from snacks' },
      { habit: 'No snacking between meals', westernPerspective: 'May help with calorie control, intermittent digestive rest', tcmPerspective: 'Optimal - allows spleen to rest and complete transformation', estimatedCalories: '0 from snacks' },
      { habit: 'Nuts and seeds regularly', westernPerspective: 'Healthy fats, protein, minerals, calorie-dense', tcmPerspective: 'Warming, tonifies kidney and lung, moistens dryness', estimatedCalories: '200-400 from nuts' },
      { habit: 'Chips/crackers/processed snacks', westernPerspective: 'High sodium, refined carbs, trans fats, low nutrients', tcmPerspective: 'Creates dampness and heat, depletes spleen qi', estimatedCalories: '300-700 from snacks' },
    ]
  },
  {
    category: 'Sweet Foods',
    habits: [
      { habit: 'Dessert daily', westernPerspective: 'Added sugars, weight gain, diabetes risk', tcmPerspective: 'Creates dampness and phlegm, weakens spleen', estimatedCalories: '200-500 from desserts' },
      { habit: 'Refined sugar avoidance', westernPerspective: 'Reduces inflammation, weight management, stable energy', tcmPerspective: 'Prevents dampness and phlegm accumulation', estimatedCalories: 'Minimal from sugar' },
      { habit: 'Natural sweeteners (honey, maple syrup)', westernPerspective: 'Less processed, some minerals, still high in sugars', tcmPerspective: 'Honey tonifies spleen, moistens lung; maple neutral-warming', estimatedCalories: '60-200 from sweeteners' },
      { habit: 'Artificial sweeteners use', westernPerspective: 'Zero calories, controversial health effects, gut microbiome impact', tcmPerspective: "No traditional use, disrupts spleen's sweet taste recognition", estimatedCalories: '0-20' },
    ]
  },
  {
    category: 'Processed Foods',
    habits: [
      { habit: 'Highly processed foods daily', westernPerspective: 'High sodium, additives, preservatives, low nutrients', tcmPerspective: 'No vitality (qi), creates dampness, difficult to transform', estimatedCalories: '800-1500 from processed' },
      { habit: 'Mostly whole, unprocessed foods', westernPerspective: 'Nutrient-dense, higher fiber, better health outcomes', tcmPerspective: 'Optimal - preserves food qi, easy to transform, nourishing', estimatedCalories: 'Variable' },
      { habit: 'Fast food regularly (3+ times/week)', westernPerspective: 'High calories, sodium, unhealthy fats, weight gain', tcmPerspective: 'Creates severe damp-heat and phlegm, damages spleen', estimatedCalories: '800-1500 from fast food' },
      { habit: 'Frozen meals regularly', westernPerspective: 'Convenient, often high sodium, variable nutrition quality', tcmPerspective: 'Depleted qi from freezing, difficult to warm and transform', estimatedCalories: '300-700 from frozen meals' },
      { habit: 'Home-cooked meals primarily', westernPerspective: 'Control over ingredients, usually healthier, cost-effective', tcmPerspective: 'Optimal - fresh qi, prepared with intention, balanced', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Special Foods',
    habits: [
      { habit: 'Fermented foods regularly (kimchi, sauerkraut)', westernPerspective: 'Probiotics, digestive health, immune support', tcmPerspective: 'Sour flavor gathers qi, aids transformation, some are warming', estimatedCalories: '20-100 from fermented' },
      { habit: 'Probiotic supplements', westernPerspective: 'Gut health support, immune function, strain-specific effects', tcmPerspective: 'Supports spleen transformation function indirectly', estimatedCalories: '0-10' },
      { habit: 'Supplements and vitamins daily', westernPerspective: 'Fill nutritional gaps, therapeutic doses for deficiencies', tcmPerspective: "May support but doesn't replace food qi and essence", estimatedCalories: '0-50' },
      { habit: 'Protein bars/meal replacements', westernPerspective: 'Convenient, portion-controlled, processed ingredients', tcmPerspective: 'Lacks proper food qi, difficult for spleen, unbalanced', estimatedCalories: '200-400 from bars' },
      { habit: 'Superfoods focus (chia, goji, spirulina)', westernPerspective: 'Nutrient-dense, antioxidants, trendy health foods', tcmPerspective: 'Goji tonifies liver-kidney, chia cooling-moistening; context matters', estimatedCalories: '50-200 from superfoods' },
      { habit: 'Organic foods exclusively', westernPerspective: 'Lower pesticide exposure, environmental benefits, cost higher', tcmPerspective: 'Cleaner qi, less toxic accumulation, more vitality', estimatedCalories: 'Variable' },
    ]
  },
  {
    category: 'Hydration',
    habits: [
      { habit: 'Adequate hydration (clear urine)', westernPerspective: 'Optimal cellular function, detoxification, energy', tcmPerspective: 'Supports kidney, generates fluids, proper qi transformation', estimatedCalories: '0' },
      { habit: 'Insufficient water intake', westernPerspective: 'Dehydration, fatigue, kidney strain, constipation', tcmPerspective: 'Depletes kidney yin and fluids, dries body', estimatedCalories: '0' },
      { habit: 'Excessive water intake (water intoxication risk)', westernPerspective: 'Electrolyte imbalance, hyponatremia, rare but dangerous', tcmPerspective: 'Weakens spleen yang, creates dampness, dilutes qi', estimatedCalories: '0' },
    ]
  },
  {
    category: 'Activity Level Context',
    habits: [
      { habit: 'Sedentary lifestyle (desk job, minimal exercise)', westernPerspective: 'Lower caloric needs, health risks, metabolic slowdown', tcmPerspective: 'Qi and blood stagnation, spleen function weakens', estimatedCalories: '1400-2000 total' },
      { habit: 'Lightly active (1-3 days exercise/week)', westernPerspective: 'Moderate caloric needs, some health benefits', tcmPerspective: 'Adequate qi and blood circulation', estimatedCalories: '1800-2400 total' },
      { habit: 'Moderately active (3-5 days exercise/week)', westernPerspective: 'Increased caloric needs, good fitness level', tcmPerspective: 'Good qi and blood flow, supports yang', estimatedCalories: '2000-2800 total' },
      { habit: 'Very active (6-7 days intense exercise/week)', westernPerspective: 'High caloric needs, athlete level, recovery important', tcmPerspective: 'May deplete yin and essence if inadequate nourishment', estimatedCalories: '2400-3500 total' },
      { habit: 'Physical labor job', westernPerspective: 'High energy expenditure, increased protein needs', tcmPerspective: 'Depletes qi and blood, requires substantial tonification', estimatedCalories: '2500-3500 total' },
    ]
  },
];

// Helper to get habit details
export function getDietHabitDetails(habitName: string): DietHabit | undefined {
  for (const category of dietNutritionData) {
    const habit = category.habits.find(h => h.habit === habitName);
    if (habit) return habit;
  }
  return undefined;
}
