export interface MandiPriceRecord {
  mandiName: string;
  crop: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // average/market trading price
  arrivalTons: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface StateDistrictConfig {
  state: string;
  districts: string[];
}

export const locationData: StateDistrictConfig[] = [
  {
    state: 'Maharashtra',
    districts: ['Pune', 'Nashik', 'Ahmednagar', 'Nagpur', 'Jalgaon', 'Kolhapur', 'Satara']
  },
  {
    state: 'Punjab',
    districts: ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda', 'Firozpur', 'Sangrur']
  },
  {
    state: 'Haryana',
    districts: ['Karnal', 'Kurukshetra', 'Ambala', 'Hisar', 'Sirsa', 'Rohtak']
  },
  {
    state: 'Uttar Pradesh',
    districts: ['Agra', 'Bareilly', 'Aligarh', 'Kanpur', 'Gorakhpur', 'Mathura', 'Varanasi']
  },
  {
    state: 'Gujarat',
    districts: ['Rajkot', 'Ahmedabad', 'Gondal', 'Mehsana', 'Surat', 'Amreli']
  },
  {
    state: 'Andhra Pradesh',
    districts: ['Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Anantapur']
  },
  {
    state: 'Karnataka',
    districts: ['Bengaluru', 'Kolar', 'Davanagere', 'Belagavi', 'Shimoga', 'Mysuru']
  },
  {
    state: 'Tamil Nadu',
    districts: ['Salem', 'Coimbatore', 'Madurai', 'Trichy', 'Tirupur', 'Thanjavur']
  },
  {
    state: 'West Bengal',
    districts: ['Hooghly', 'Bardhaman', 'Nadia', 'Murshidabad', 'Medinipur']
  }
];

export interface CropBasePrice {
  id: string;
  nameKey: 'cropPaddy' | 'cropWheat' | 'cropCotton' | 'cropSugarcane' | 'cropOnion' | 'cropPotato' | 'cropTomato' | 'cropSoybean' | 'cropMustard' | 'cropMaize';
  baseMin: number;
  baseMax: number;
  avgYieldPerAcre: number; // in quintals per acre
  standardCostPerAcre: number; // standard investment in ₹
}

export const cropBasePrices: Record<string, CropBasePrice> = {
  paddy: { id: 'paddy', nameKey: 'cropPaddy', baseMin: 2100, baseMax: 2900, avgYieldPerAcre: 20, standardCostPerAcre: 22000 },
  wheat: { id: 'wheat', nameKey: 'cropWheat', baseMin: 2200, baseMax: 3100, avgYieldPerAcre: 18, standardCostPerAcre: 18000 },
  cotton: { id: 'cotton', nameKey: 'cropCotton', baseMin: 6000, baseMax: 8400, avgYieldPerAcre: 8, standardCostPerAcre: 28000 },
  sugarcane: { id: 'sugarcane', nameKey: 'cropSugarcane', baseMin: 290, baseMax: 410, avgYieldPerAcre: 350, standardCostPerAcre: 45000 },
  onion: { id: 'onion', nameKey: 'cropOnion', baseMin: 1200, baseMax: 3800, avgYieldPerAcre: 80, standardCostPerAcre: 32000 },
  potato: { id: 'potato', nameKey: 'cropPotato', baseMin: 1000, baseMax: 2400, avgYieldPerAcre: 90, standardCostPerAcre: 35000 },
  tomato: { id: 'tomato', nameKey: 'cropTomato', baseMin: 800, baseMax: 4800, avgYieldPerAcre: 100, standardCostPerAcre: 40000 },
  soybean: { id: 'soybean', nameKey: 'cropSoybean', baseMin: 3900, baseMax: 5200, avgYieldPerAcre: 10, standardCostPerAcre: 15000 },
  mustard: { id: 'mustard', nameKey: 'cropMustard', baseMin: 5000, baseMax: 6500, avgYieldPerAcre: 8, standardCostPerAcre: 12000 },
  maize: { id: 'maize', nameKey: 'cropMaize', baseMin: 1800, baseMax: 2600, avgYieldPerAcre: 22, standardCostPerAcre: 14000 }
};

// Returns live simulated Mandi prices based on state and district.
// Uses deterministically generated values from state + district strings so prices stay consistent yet dynamic.
export function fetchMandiRates(state: string, district: string, cropId: string): MandiPriceRecord[] {
  const crop = cropBasePrices[cropId];
  if (!crop) return [];

  // Seed value based on characters of state and district
  const seed = (state.length * 3 + district.length * 7) % 10;
  
  // Custom price offsets depending on state
  let stateMultiplier = 1.0;
  if (state === 'Punjab' || state === 'Haryana') {
    if (cropId === 'wheat' || cropId === 'paddy') stateMultiplier = 1.05; // Slightly higher due to MSP systems
  } else if (state === 'Maharashtra' || state === 'Gujarat') {
    if (cropId === 'onion' || cropId === 'cotton') stateMultiplier = 1.08;
  } else if (state === 'Uttar Pradesh') {
    if (cropId === 'sugarcane') stateMultiplier = 1.10;
  } else if (state === 'Karnataka' || state === 'Tamil Nadu') {
    if (cropId === 'tomato') stateMultiplier = 1.06;
  }

  const mainMandiName = `${district} APMC Yard`;
  const subMandiName = `${district} Sub-Market Board`;

  const getRecord = (name: string, indexOffset: number): MandiPriceRecord => {
    const variation = ((seed + indexOffset) % 5 - 2) * 0.04; // -8% to +8% variation
    const baseMin = Math.round(crop.baseMin * stateMultiplier * (1 + variation));
    const baseMax = Math.round(crop.baseMax * stateMultiplier * (1 + variation));
    const modalPrice = Math.round((baseMin + baseMax) / 2 + ((seed + indexOffset) % 3 - 1) * 100);
    const trendSeed = (seed + indexOffset) % 3;
    const trend = trendSeed === 0 ? 'up' : trendSeed === 1 ? 'down' : 'stable';
    const arrival = Math.round(15 + (seed * 8) + (indexOffset * 22));

    return {
      mandiName: name,
      crop: cropId,
      minPrice: baseMin,
      maxPrice: baseMax,
      modalPrice: Math.min(Math.max(modalPrice, baseMin), baseMax),
      arrivalTons: arrival,
      trend,
      lastUpdated: new Date().toLocaleDateString('en-IN')
    };
  };

  return [
    getRecord(mainMandiName, 0),
    getRecord(subMandiName, 1)
  ];
}

// Weather status simulation
export interface WeatherInfo {
  temp: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'windy';
  humidity: number;
  forecast: string;
  hindiForecast: string;
  marathiForecast: string;
  farmingTip: string;
  farmingTipLang: Record<string, string>;
}

export function fetchWeather(state: string, district: string): WeatherInfo {
  const seed = (state.length + district.length) % 4;
  
  const conditions: WeatherInfo['condition'][] = ['sunny', 'cloudy', 'rainy', 'sunny'];
  const condition = conditions[seed];

  let temp = 28 + seed * 2;
  let humidity = 60 + seed * 8;
  let forecast = 'Normal weather. Good conditions for harvesting and sorting.';
  let hindiForecast = 'सामान्य मौसम। कटाई और छंटाई के लिए अच्छी स्थिति।';
  let marathiForecast = 'सामान्य हवामान. काढणी आणि पिकाची विभागणी करण्यासाठी अनुकूल परिस्थिती.';
  let farmingTip = 'Maintain irrigation logs. Avoid chemical spraying if cloud coverage increases.';
  
  const farmingTipLang: Record<string, string> = {
    en: 'Maintain irrigation logs. Avoid chemical spraying if cloud coverage increases.',
    hi: 'सिंचाई का रिकॉर्ड रखें। बादलों के छाने पर रासायनिक छिड़काव से बचें।',
    mr: 'पाण्याचे नियोजन वेळेवर करा. ढगाळ हवामान असल्यास रासायनिक फवारणी टाळा.',
    pa: 'ਸਿੰਚਾਈ ਦਾ ਰਿਕਾਰਡ ਰੱਖੋ। ਜੇਕਰ ਬੱਦਲਵਾਈ ਵਧੇ ਤਾਂ ਰਸਾਇਣਕ ਛਿੜਕਾਅ ਤੋਂ ਬਚੋ।',
    te: 'నీటి పారుదల రికార్డులను నిర్వహించండి. మేఘావృతంగా ఉంటే రసాయన పిచికారీని నివారించండి.',
    ta: 'நீர் பாசனத்தை சீராக வைக்கவும். மேகமூட்டம் அதிகமாக இருந்தால் பூச்சிக்கொல்லி தெளிப்பதைத் தவிர்க்கவும்.',
    bn: 'সেচ কাজ ঠিকমতো পরিচালনা করুন। মেঘলা আকাশ থাকলে কীটনাশক ছড়ানো এড়িয়ে চলুন।',
    kn: 'ನೀರಾವರಿ ನಿಯಂತ್ರಣದಲ್ಲಿಡಿ. ಮೋಡ ಕವಿದ ವಾತಾವರಣ ಇದ್ದರೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.',
    gu: 'પિયત નિયમિત રાખો. જો વાદળછાયું વાતાવरण હોય તો રાસાયણિક છંટકાવ ટાળો.'
  };

  if (condition === 'rainy') {
    temp = 24;
    humidity = 92;
    forecast = 'Showers expected. Advised to post-pone fertilizer sprays and secure harvested grains.';
    hindiForecast = 'बारिश की संभावना। खाद छिड़काव टालें और कटी हुई फसल को सुरक्षित स्थान पर रखें।';
    marathiForecast = 'पावसाची शक्यता. खत फवारणी पुढे ढकला आणि काढलेले पीक सुरक्षित ठिकाणी ठेवा.';
    farmingTipLang.en = 'Secure grains in moisture-proof storages. Provide proper drainage to fields.';
    farmingTipLang.hi = 'अनाज को नमी-मुक्त गोदामों में रखें। खेतों में जल निकासी की व्यवस्था करें।';
    farmingTipLang.mr = 'धान्य कोरड्या जागी सुरक्षित ठेवा. शेतात पाणी साचणार नाही याची काळजी घ्या.';
    farmingTipLang.pa = 'ਅਨਾਜ ਨੂੰ ਨਮੀ-ਰਹਿਤ ਸਟੋਰਾਂ ਵਿੱਚ ਰੱਖੋ। ਖੇਤਾਂ ਵਿੱਚੋਂ ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।';
    farmingTipLang.te = 'ధాన్యాన్ని తడి తగలకుండా భద్రపరచండి. పొలాల్లో నీటి నిల్వ లేకుండా చూసుకోండి.';
    farmingTipLang.ta = 'தானியங்களை ஈரப்பதமில்லாத சேமிப்புக் கிடங்கில் பாதுகாக்கவும். வயல்களில் வடிகால் வசதி செய்யவும்.';
    farmingTipLang.bn = 'শস্য শুষ্ক স্থানে সংরক্ষণ করুন। জমিতে জমা জল বের করার ব্যবস্থা করুন।';
    farmingTipLang.kn = 'ಧಾನ್ಯಗಳನ್ನು ತೇವಾಂಶವಿಲ್ಲದ ಜಾಗದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯಲು ವ್ಯವಸ್ಥೆ ಮಾಡಿ.';
    farmingTipLang.gu = 'અનાજને ભેજ-મુક્ત ગોદામોમાં રાખો. ખેતરોમાં પાણીના નિકાલની વ્યવસ્થા કરો.';
  } else if (condition === 'cloudy') {
    temp = 27;
    humidity = 78;
    forecast = 'Partly cloudy. High humidity might trigger pest growth. Keep checking crop health.';
    hindiForecast = 'आंशिक रूप से बादल। अधिक नमी से कीट पनप सकते हैं। फसल स्वास्थ्य की जांच करते रहें।';
    marathiForecast = 'अंशतः ढगाळ हवामान. दमट वातावरणामुळे कीड वाढू शकते. पिकाची पाहणी करत राहा.';
    farmingTipLang.en = 'Inspect leaf undersides for aphid colonies. Apply pest prevention sprays if recommended.';
    farmingTipLang.hi = 'पत्तियों के नीचे कीड़ों की जांच करें। आवश्यक हो तो कीटनाशक का छिड़काव करें।';
    farmingTipLang.mr = 'पानांच्या खालील बाजूस किडींची तपासणी करा. शिफारसीनुसार कीड प्रतिबंधक फवारणी करा.';
    farmingTipLang.pa = 'ਪੱਤਿਆਂ ਦੇ ਹੇਠਾਂ ਕੀੜਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ। ਲੋੜ ਪੈਣ \'ਤੇ ਕੀਟਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।';
    farmingTipLang.te = 'ఆకుల కింద పురుగులు ఉన్నాయేమో పరిశీలించండి. అవసరమైన పురుగుల నివారణ చర్యలు చేపట్టండి.';
    farmingTipLang.ta = 'இலைகளின் அடியில் பூச்சிகள் உள்ளதா எனப் பார்க்கவும். தேவைப்பட்டால் பூச்சி விரட்டி தெளிக்கவும்.';
    farmingTipLang.bn = 'পাতার নিচে পোকার আক্রমণ পরীক্ষা করুন। পরামর্শ মেনে কীটনাশক স্প্রে করুন।';
    farmingTipLang.kn = 'ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಕೀಟಗಳಿದ್ದರೆ ಗಮನಿಸಿ. ಅಗತ್ಯವಿದ್ದರೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.';
    farmingTipLang.gu = 'પાંદડાની નીચે જીવાતોની તપાસ કરો. જરૂર જણાય તો જંતુનાશકનો છંટકાવ કરો.';
  }

  return {
    temp,
    condition,
    humidity,
    forecast,
    hindiForecast,
    marathiForecast,
    farmingTip,
    farmingTipLang
  };
}
