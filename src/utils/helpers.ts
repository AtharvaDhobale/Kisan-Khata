import { cropBasePrices, fetchMandiRates, locationData } from '../data/mandiData';
import type { Language } from '../data/translations';

export interface FarmerProfile {
  name: string;
  language: Language;
  state: string;
  district: string;
}

export interface ProjectExpense {
  id: string;
  date: string;
  amount: number;
  category: 'seeds' | 'fertilizers' | 'tractor' | 'labor' | 'irrigation' | 'transport' | 'rent' | 'misc';
  description: string;
}

export interface FarmProject {
  id: string;
  name: string;
  cropId: string; // 'paddy', 'wheat', etc.
  landArea: number; // in acres
  expectedYield: number; // in quintals
  sowingDate: string;
  budget: number;
  status: 'ongoing' | 'harvested' | 'sold';
  expenses: ProjectExpense[];
  state: string;
  district: string;
  useMarketPricing: boolean;
}

// Storage Helpers
const STORAGE_KEY = 'farmoholic_projects';
const SETTINGS_KEY = 'farmoholic_settings';
const PROFILE_KEY = 'farmoholic_profile';

export interface UserSettings {
  language: Language;
  state: string;
  district: string;
  useMarketPricing: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  state: 'Maharashtra',
  district: 'Pune',
  useMarketPricing: true
};

export function loadProfile(): FarmerProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveProfile(profile: FarmerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadProjects(): FarmProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load projects', e);
    return [];
  }
}

export function saveProjects(projects: FarmProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Geolocation Simulator (mocked for district lookup)
export function autoDetectLocation(): Promise<{ state: string; district: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ state: 'Maharashtra', district: 'Pune' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Deterministically map coordinates to one of our districts
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const val = Math.floor(Math.abs(lat + lng)) % locationData.length;
        const targetState = locationData[val];
        const targetDistrict = targetState.districts[Math.floor(Math.abs(lat - lng)) % targetState.districts.length];
        
        resolve({
          state: targetState.state,
          district: targetDistrict
        });
      },
      () => {
        // Default fallback if access denied or fails
        resolve({ state: 'Maharashtra', district: 'Pune' });
      },
      { timeout: 5000 }
    );
  });
}

// AI Advisory Prompts & Recommendations Generator
export interface AIAdvice {
  id: string;
  type: 'info' | 'warning' | 'success';
  text: string;
}

export function generateAIAdvice(project: FarmProject, lang: Language): AIAdvice[] {
  const adviceList: AIAdvice[] = [];
  const crop = cropBasePrices[project.cropId];
  if (!crop) return [];

  // Calculate finances
  const totalExpense = project.expenses.reduce((sum, e) => sum + e.amount, 0);
  const costPerAcre = project.landArea > 0 ? totalExpense / project.landArea : 0;
  
  // Calculate category totals
  const categories = project.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const fertTotal = (categories['fertilizers'] || 0);
  const tractorTotal = (categories['tractor'] || 0);
  const laborTotal = (categories['labor'] || 0);


  const mandis = fetchMandiRates(project.state, project.district, project.cropId);
  const marketPrice = mandis.length > 0 ? mandis[0].modalPrice : (crop.baseMin + crop.baseMax) / 2;
  const estimatedRevenue = project.expectedYield * marketPrice;
  const estimatedProfit = estimatedRevenue - totalExpense;

  // Language Dictionary for advisor responses
  const messages: Record<Language, {
    highCost: string;
    goodBudget: string;
    heavyFertilizer: string;
    heavyTractor: string;
    heavyLabor: string;
    lossWarning: string;
    profitCheer: string;
    generalComposting: string;
  }> = {
    en: {
      highCost: `Your expense per acre (₹${Math.round(costPerAcre)}) exceeds the standard average of ₹${crop.standardCostPerAcre}. Focus on optimizing raw material hire.`,
      goodBudget: `Great job! Your current cost-per-acre (₹${Math.round(costPerAcre)}) is well-optimized compared to standard average (₹${crop.standardCostPerAcre}).`,
      heavyFertilizer: `Fertilizers & Pesticides comprise more than 30% of your expenses. We recommend performing a Soil Health Card test to optimize urea/fertilizer usage.`,
      heavyTractor: `Tractor/Fuel hire is high. Consider partnering with neighboring farms to share machinery rentals or negotiate a bulk service.`,
      heavyLabor: `Labor wages comprise over 35% of your costs. Explore basic farm mechanization or direct seed drill sowing to reduce manual labor requirements.`,
      lossWarning: `Warning: Estimated expenses exceed expected Mandi market revenue. Consider searching alternative Mandis or storing the crop to wait for a price surge.`,
      profitCheer: `Excellent profit potential! Estimated ROI is ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}%. Plan your sale timeline and secure storage early to avoid moisture damage.`,
      generalComposting: `Pro Tip: Using organic bio-fertilizers and neem-coated urea can cut down chemical input costs by up to 20% while maintaining soil biology.`
    },
    hi: {
      highCost: `आपका प्रति एकड़ खर्च (₹${Math.round(costPerAcre)}) औसत मानक ₹${crop.standardCostPerAcre} से अधिक है। कच्चे माल और किराये पर नियंत्रण करें।`,
      goodBudget: `बहुत बढ़िया! आपका वर्तमान प्रति एकड़ खर्च (₹${Math.round(costPerAcre)}) मानक औसत (₹${crop.standardCostPerAcre}) की तुलना में बहुत अनुकूल है।`,
      heavyFertilizer: `उर्वरक और कीटनाशकों का खर्च कुल खर्च के 30% से अधिक है। यूरिया के संतुलित उपयोग के लिए मिट्टी परीक्षण (Soil Health Card) की सलाह दी जाती है।`,
      heavyTractor: `ट्रैक्टर और डीजल का खर्च अधिक है। लागत कम करने के लिए सहकारी रूप से पड़ोसियों के साथ मिलकर ट्रैक्टर साझा करें।`,
      heavyLabor: `मजदूरी कुल खर्च का 35% से अधिक है। श्रम लागत को घटाने के लिए आधुनिक सीड ड्रिल जैसी छोटी मशीनों का उपयोग करें।`,
      lossWarning: `चेतावनी: आपकी लागत वर्तमान मंडी मूल्य से अधिक है। अधिक लाभ के लिए दूसरे जिलों की मंडियों के भाव देखें या कुछ समय भंडारित रखें।`,
      profitCheer: `शानदार मुनाफ़ा! लागत पर संभावित रिटर्न ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% है। फसल को बारिश और नमी से बचाकर रखें।`,
      generalComposting: `कृषि ज्ञान: रासायनिक खाद के साथ जैविक कचरे और गोबर खाद का उपयोग करने से लागत में 20% तक की कमी आती है और भूमि उपजाऊ बनी रहती है।`
    },
    mr: {
      highCost: `तुमचा प्रति एकरी खर्च (₹${Math.round(costPerAcre)}) हा सरासरी खर्चापेक्षा (₹${crop.standardCostPerAcre}) जास्त आहे. भाडेतत्वावरील खर्च कमी करा.`,
      goodBudget: `उत्कृष्ट! तुमचा चालू खर्च प्रति एकर (₹${Math.round(costPerAcre)}) हा नेहमीच्या सरासरी खर्चापेक्षा (₹${crop.standardCostPerAcre}) कमी आहे.`,
      heavyFertilizer: `खते आणि औषधांवरील खर्च एकूण खर्चाच्या 30% पेक्षा जास्त आहे. युरियाचे प्रमाण निश्चित करण्यासाठी माती परीक्षण करा.`,
      heavyTractor: `ट्रॅक्टर आणि इंधनावरील भाडे जास्त आहे. शेजाऱ्यांच्या मदतीने अवजारे भाड्याने घेतल्यास खर्च वाचेल.`,
      heavyLabor: `मजुरीचा खर्च 35% पेक्षा जास्त आहे. खर्च वाचवण्यासाठी लहान शेती यंत्रांचा (उदा. पेरणी यंत्र) वापर करा.`,
      lossWarning: `सावधानता: तुमचा एकूण खर्च बाजार भावापेक्षा जास्त आहे. नजीकच्या इतर बाजारपेठेत (मंडी) दर तपासा किंवा पिकाची साठवणूक करून नंतर विक्री करा.`,
      profitCheer: `छान नफा! गुंतवणुकीवर अपेक्षित परतावा ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% आहे. वेळेवर पिकाची काढणी करा आणि धान्य सुरक्षित जागी ठेवा.`,
      generalComposting: `शेती सल्ला: सेंद्रिय खतांचा आणि शेणखताचा वापर वाढवल्यास रासायनिक खतांचा खर्च २०% पर्यंत कमी होतो.`
    },
    pa: {
      highCost: `ਤੁਹਾਡਾ ਪ੍ਰਤੀ ਏਕੜ ਖ਼ਰਚਾ (₹${Math.round(costPerAcre)}) ਔਸਤ ਖ਼ਰਚੇ (₹${crop.standardCostPerAcre}) ਤੋਂ ਵੱਧ ਹੈ। ਕਿਰਾਏ ਅਤੇ ਹੋਰ ਫਾਲਤੂ ਖ਼ਰਚਿਆਂ ਨੂੰ ਘਟਾਓ।`,
      goodBudget: `ਬਹੁਤ ਵਧੀਆ! ਤੁਹਾਡਾ ਮੌਜੂਦਾ ਖ਼ਰਚਾ ਪ੍ਰਤੀ ਏਕੜ (₹${Math.round(costPerAcre)}) ਮਿਆਰੀ ਔਸਤ (₹${crop.standardCostPerAcre}) ਦੇ ਮੁਕਾਬਲੇ ਬਹੁਤ ਸਹੀ ਹੈ।`,
      heavyFertilizer: `ਖਾਦਾਂ ਅਤੇ ਕੀਟਨਾਸ਼ਕਾਂ ਦਾ ਖ਼ਰਚਾ 30% ਤੋਂ ਵੱਧ ਹੈ। ਯੂਰੀਆ ਦੀ ਸਹੀ ਮਾਤਰਾ ਲਈ ਮਿੱਟੀ ਦੀ ਪਰਖ (Soil Health Card) ਕਰਵਾਉਣ ਦੀ ਸਲਾਹ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।`,
      heavyTractor: `ਟਰੈਕਟਰ ਅਤੇ ਡੀਜ਼ਲ ਦਾ ਕਿਰਾਇਆ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ। ਲਾਗਤ ਘਟਾਉਣ ਲਈ ਗੁਆਂਢੀ ਕਿਸਾਨਾਂ ਨਾਲ ਸਾਂਝੇ ਤੌਰ \'ਤੇ ਮਸ਼ੀਨਰੀ ਦੀ ਵਰਤੋਂ ਕਰੋ।`,
      heavyLabor: `ਮਜ਼ਦੂਰੀ ਦਾ ਖ਼ਰਚਾ 35% ਤੋਂ ਵੱਧ ਹੈ। ਲੇਬਰ ਘਟਾਉਣ ਲਈ ਖੇਤੀ ਮਸ਼ੀਨੀਕਰਨ (ਜਿਵੇਂ ਕਿ ਹੈਪੀ ਸੀਡਰ) ਦੀ ਵਰਤੋਂ ਕਰੋ।`,
      lossWarning: `ਚੇਤਾਵਨੀ: ਤੁਹਾਡਾ ਕੁੱਲ ਖ਼ਰਚਾ ਮੌਜੂਦਾ ਮੰਡੀ ਰੇਟਾਂ ਨਾਲੋਂ ਵੱਧ ਹੈ। ਫ਼ਸਲ ਨੂੰ ਸਟੋਰ ਕਰਨ ਬਾਰੇ ਸੋਚੋ ਜਾਂ ਦੂਜੀਆਂ ਮੰਡੀਆਂ ਦੇ ਭਾਅ ਚੈੱਕ ਕਰੋ।`,
      profitCheer: `ਵਧੀਆ ਮੁਨਾਫ਼ਾ! ਸੰਭਾਵਿਤ ਰਿਟਰਨ ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% ਹੈ। ਫ਼ਸਲ ਨੂੰ ਨਮੀ ਤੋਂ ਬਚਾਓ।`,
      generalComposting: `ਖੇਤੀ ਗਿਆਨ: ਰਸਾਇਣਕ ਖਾਦਾਂ ਦੀ ਥਾਂ ਰੂੜੀ ਦੀ ਖਾਦ ਅਤੇ ਜੈਵਿਕ ਤਰੀਕਿਆਂ ਦੀ ਵਰਤੋਂ ਨਾਲ ਲਾਗਤ 20% ਤੱਕ ਘਟਾਈ ਜਾ ਸਕਦੀ ਹੈ।`
    },
    te: {
      highCost: `మీ ఎకరానికి అయ్యే ఖర్చు (₹${Math.round(costPerAcre)}) ప్రామాణిక సగటు ₹${crop.standardCostPerAcre} కంటే ఎక్కువగా ఉంది. అద్దె ఖర్చులు తగ్గించండి.`,
      goodBudget: `చాలా బాగుంది! మీ ప్రస్తుత ఎకరా ఖర్చు (₹${Math.round(costPerAcre)}) ప్రామాణిక సగటుతో (₹${crop.standardCostPerAcre}) పోలిస్తే చాలా తక్కువగా ఉంది.`,
      heavyFertilizer: `ఎరువులు మరియు పురుగుమందుల ఖర్చు 30% కంటే ఎక్కువగా ఉంది. భూసార పరీక్ష చేయించుకుని తదనుగుణంగా ఎరువులు వాడండి.`,
      heavyTractor: `ట్రాక్టర్ మరియు ఇంధన అద్దె ఎక్కువగా ఉంది. ఖర్చు తగ్గించుకోవడానికి తోటి రైతులతో కలిసి యంత్రాలను పంచుకోండి.`,
      heavyLabor: `కూలీల ఖర్చు 35% పైగా ఉంది. తక్కువ ఖర్చులో పని పూర్తి కావడానికి విత్తనాలు నాటే ఆధునిక యంత్రాలను వాడండి.`,
      lossWarning: `హెచ్చరిక: ప్రస్తుత మార్కెట్ ధరల కంటే మీ పంట వ్యయం ఎక్కువగా ఉంది. ధాన్యాన్ని నిల్వ చేసి, ధరలు పెరిగాక అమ్మడం మంచిది.`,
      profitCheer: `మంచి లాభం! పెట్టుబడి పై అంచనా రాబడి ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% ఉంది. ధాన్యం తడవకుండా జాగ్రత్తపడండి.`,
      generalComposting: `వ్యవసాయ చిట్కా: రసాయన ఎరువులతో పాటు సేంద్రీయ ఎరువులను వాడటం వల్ల ఖర్చును 20% వరకు తగ్గించవచ్చు.`
    },
    ta: {
      highCost: `உங்களின் ஏக்கருக்கான செலவு (₹${Math.round(costPerAcre)}) சராசரி மதிப்பீட்டை விட (₹${crop.standardCostPerAcre}) அதிகமாக உள்ளது. வாடகைகளை உகந்ததாக்கவும்.`,
      goodBudget: `அருமை! உங்களின் ஏக்கருக்கான தற்போதைய செலவு (₹${Math.round(costPerAcre)}) சராசரி செலவை விட (₹${crop.standardCostPerAcre}) குறைவாகவே உள்ளது.`,
      heavyFertilizer: `உரங்கள் மற்றும் பூச்சிக்கொல்லிகளின் செலவு 30%க்கும் அதிகமாக உள்ளது. மண் பரிசோதனை செய்து தேவைக் கேற்ப உரங்களைப் பயன்படுத்துங்கள்.`,
      heavyTractor: `டிராக்டர் மற்றும் டீசல் வாடகை அதிகமாக உள்ளது. செலவைக் குறைக்க கூட்டு முறையில் இயந்திரங்களைப் பகிர்ந்து கொள்ளுங்கள்.`,
      heavyLabor: `ஆள் கூலி 35%க்கும் அதிகமாக உள்ளது. செலவைக் குறைக்க இயந்திர விதைப்பு முறையைப் பயன்படுத்தவும்.`,
      lossWarning: `எச்சரிக்கை: தற்போதைய சந்தை விலையை விட உங்கள் செலவு அதிகமாக உள்ளது. உகந்த விலை கிடைக்கும் வரை சேமித்து வைக்கவும்.`,
      profitCheer: `நல்ல லாபம்! மதிப்பிடப்பட்ட வருமானம் ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% உள்ளது. பயிரின் தரத்தைப் பாதுகாக்கவும்.`,
      generalComposting: `வேளாண் குறிப்பு: இயற்கை உரங்களை பயன்படுத்துவதன் மூலம் உரச் செலவை 20% வரை குறைக்கலாம்.`
    },
    bn: {
      highCost: `আপনার একর প্রতি খরচ (₹${Math.round(costPerAcre)}) আদর্শ গড়ের (₹${crop.standardCostPerAcre}) চেয়ে বেশি। খরচ কমানোর চেষ্টা করুন।`,
      goodBudget: `দারুণ! আপনার বর্তমান একর প্রতি খরচ (₹${Math.round(costPerAcre)}) আদর্শ গড়ের (₹${crop.standardCostPerAcre}) মধ্যেই আছে।`,
      heavyFertilizer: `সার এবং কীটনাশকের খরচ ৩০%-এর বেশি। মাটি পরীক্ষা করে প্রয়োজনীয় সার দিন।`,
      heavyTractor: `ট্র্যাক্টর ও তেলের ভাড়া বেশি। খরচ কমাতে অন্যান্য কৃষকদের সাথে যন্ত্রপাতি শেয়ার করুন।`,
      heavyLabor: `শ্রমিক খরচ ৩৫%-এর বেশি। শ্রমিক খরচ কমাতে বীজ বপনের আধুনিক যন্ত্র ব্যবহার করুন।`,
      lossWarning: `সতর্কতা: বর্তমান বাজার দরের চেয়ে আপনার খরচ বেশি। দাম বাড়া পর্যন্ত ফসল সংরক্ষণ করুন।`,
      profitCheer: `ভালো মুনাফা! আপনার আনুমানিক লাভ ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}%। ফসলের আর্দ্রতা নিয়ন্ত্রণ করুন।`,
      generalComposting: `কৃষি টিপস: রাসায়নিক সারের পরিবর্তে জৈব সার ব্যবহার করলে ২০% পর্যন্ত খরচ কমানো সম্ভব।`
    },
    kn: {
      highCost: `ನಿಮ್ಮ ಎಕರೆ ಮೇಲಿನ ವೆಚ್ಚ (₹${Math.round(costPerAcre)}) ಸರಾಸರಿಗಿಂತ (₹${crop.standardCostPerAcre}) ಹೆಚ್ಚಾಗಿದೆ. ಬಾಡಿಗೆ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.`,
      goodBudget: `ಉತ್ತಮ! ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಎಕರೆ ವೆಚ್ಚವು (₹${Math.round(costPerAcre)}) ಸರಾಸರಿಗಿಂತ (₹${crop.standardCostPerAcre}) ಕಡಿಮೆಯಿದೆ.`,
      heavyFertilizer: `ರಸಗೊಬ್ಬರ ಮತ್ತು ಕೀಟನಾಶಕಗಳ ವೆಚ್ಚ 30% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದೆ. ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಗೊಬ್ಬರ ಬಳಸಿ.`,
      heavyTractor: `ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಇಂಧನ ಬಾಡಿಗೆ ಹೆಚ್ಚಾಗಿದೆ. ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ಇತರರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.`,
      heavyLabor: `ಕೂಲಿ ವೆಚ್ಚ 35% ಮೀರಿದೆ. ಕೂಲಿ ಆಳುಗಳ ಬದಲಾಗಿ ಬಿತ್ತನೆ ಯಂತ್ರಗಳನ್ನು ಬಳಸಿ.`,
      lossWarning: `ಎಚ್ಚರಿಕೆ: ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಿಂತ ನಿಮ್ಮ ಬೆಳೆಯ ವೆಚ್ಚ ಹೆಚ್ಚಾಗಿದೆ. ಉತ್ತಮ ಬೆಲೆ ಬರುವವರೆಗೆ ಕಾಯ್ದಿರಿಸಿ.`,
      profitCheer: `ಒಳ್ಳೆಯ ಲಾಭ! ಅಂದಾಜು ಆದಾಯ ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% ಇದೆ. ಬೆಳೆಯ ಗುಣಮಟ್ಟ ಕಾಪಾಡಿ.`,
      generalComposting: `ಕೃಷಿ ಸಲಹೆ: ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಸುವುದರಿಂದ ಖರ್ಚನ್ನು 20% ವರೆಗೆ ಕಡಿಮೆ ಮಾಡಬಹುದು.`
    },
    gu: {
      highCost: `તમારો એકર દીઠ ખર્ચ (₹${Math.round(costPerAcre)}) સરેરાશ (₹${crop.standardCostPerAcre}) કરતા વધારે છે. ખર્ચ પર નિયંત્રણ રાખો.`,
      goodBudget: `ખૂબ સરસ! તમારો હાલનો એકર દીઠ ખર્ચ (₹${Math.round(costPerAcre)}) સરેરાશ (₹${crop.standardCostPerAcre}) કરતા ઓછો છે.`,
      heavyFertilizer: `ખાતર અને દવાઓનો ખર્ચ ૩૦% થી વધુ છે. માટી પરીક્ષણ કરાવીને જ ખાતર આપો.`,
      heavyTractor: `ટ્રેક્ટર અને ડીઝલનું ભાડું વધારે છે. ખર્ચ ઘટાડવા માટે સાધનો અન્ય ખેડૂતો સાથે શેર કરો.`,
      heavyLabor: `મજૂરી ખર્ચ ૩૫% થી વધુ છે. મજૂરી ખર્ચ બચાવવા ઓટોમેટીક ઓરણીનો ઉપયોગ કરો.`,
      lossWarning: `ચેતવણી: બજાર ભાવ કરતા તમારો ખર્ચ વધારે છે. યોગ્ય ભાવ મળે ત્યાં સુધી પાકનો સંગ્રહ કરો.`,
      profitCheer: `સારો નફો! તમારું અંદાજિત વળતર ${totalExpense > 0 ? Math.round((estimatedProfit / totalExpense) * 100) : 0}% છે. પાકને ભેજથી બચાવો.`,
      generalComposting: `ખેતીની સલાહ: રાસાયણિક ખાતરની જગ્યાએ સેન્દ્રીય ખાતર વાપરવાથી ૨૦% સુધી ખર્ચ ઘટાડી શકાય છે.`
    }
  };

  const curr = messages[lang] || messages['en'];

  
  

  // Rule 1: High Cost Check
  if (costPerAcre > crop.standardCostPerAcre * 1.1) {
    adviceList.push({ id: 'high-cost', type: 'warning', text: curr.highCost });
  } else {
    adviceList.push({ id: 'good-budget', type: 'success', text: curr.goodBudget });
  }

  // Rule 2: Fertilizer overuse
  if (totalExpense > 0 && fertTotal / totalExpense > 0.3) {
    adviceList.push({ id: 'heavy-fert', type: 'warning', text: curr.heavyFertilizer });
  }

  // Rule 3: Tractor cost
  if (totalExpense > 0 && tractorTotal / totalExpense > 0.25) {
    adviceList.push({ id: 'heavy-tractor', type: 'warning', text: curr.heavyTractor });
  }
  
  // Rule 4: Labor cost
  if (totalExpense > 0 && laborTotal / totalExpense > 0.35) {
    adviceList.push({ id: 'heavy-labor', type: 'warning', text: curr.heavyLabor });
  }

  // Rule 5: Profit check
  if (estimatedProfit < 0) {
    adviceList.push({ id: 'loss-warn', type: 'warning', text: curr.lossWarning });
  } else if (totalExpense > 0 && estimatedProfit / totalExpense > 0.2) {
    adviceList.push({ id: 'profit-cheer', type: 'success', text: curr.profitCheer });
  }

  // Rule 6: General composting advice
  if (adviceList.length < 3) {
    adviceList.push({ id: 'compost-tip', type: 'info', text: curr.generalComposting });
  }

  return adviceList;
}

// Simulated Interactive Q&A Response Generator
export function getAIAnswer(question: string, project?: FarmProject | null, lang?: Language): string {
  const text = question.toLowerCase();
  const selectedLang = lang || 'en';

  // Guess crop from text if no project is active
  let cropId = 'wheat';
  if (project) {
    cropId = project.cropId;
  } else {
    if (text.includes('paddy') || text.includes('rice') || text.includes('धान') || text.includes('भात') || text.includes('వరి') || text.includes('நெல்') || text.includes('ধান') || text.includes('ಭತ್ತ') || text.includes('ડાંગર')) {
      cropId = 'paddy';
    } else if (text.includes('onion') || text.includes('प्याज') || text.includes('कांदा') || text.includes('ਪਿਆਜ਼') || text.includes('ఉల్లి') || text.includes('வெங்காயம்') || text.includes('পিয়াজ') || text.includes('ಈರುಳ್ಳಿ') || text.includes('ડુંગળી')) {
      cropId = 'onion';
    } else if (text.includes('tomato') || text.includes('टमाटर') || text.includes('टोमॅटो') || text.includes('ਟਮਾਟਰ') || text.includes('టమోటా') || text.includes('தக்காளி') || text.includes('টমেটো') || text.includes('ಟೊಮೆಟೊ') || text.includes('ટમેટા')) {
      cropId = 'tomato';
    } else if (text.includes('cotton') || text.includes('कपास') || text.includes('कापूस') || text.includes('ਕਪਾਹ') || text.includes('ప్రత్తి') || text.includes('பருத்தி') || text.includes('তুলা') || text.includes('ಹತ್ತಿ') || text.includes('કપાસ')) {
      cropId = 'cotton';
    } else if (text.includes('potato') || text.includes('आलू') || text.includes('बटाटा') || text.includes('ਆਲੂ') || text.includes('బంగాళదుంప') || text.includes('உருளை') || text.includes('আলু') || text.includes('ಆಲೂಗಡ್ಡೆ') || text.includes('બટાકા')) {
      cropId = 'potato';
    } else if (text.includes('sugarcane') || text.includes('गन्ना') || text.includes('ऊस') || text.includes('ਗੰਨਾ') || text.includes('చెరకు') || text.includes('கரும்பு') || text.includes('আখ') || text.includes('ಕಬ್ಬು') || text.includes('શેરડી')) {
      cropId = 'sugarcane';
    }
  }

  const crop = cropBasePrices[cropId] || cropBasePrices.wheat;
  const minVal = crop.baseMin;
  const maxVal = crop.baseMax;

  // Localized agricultural templates
  const answers: Record<Language, {
    fertilizer: string;
    pestBug: string;
    rain: string;
    timing: string;
    labor: string;
    profit: string;
    welcome: string;
  }> = {
    en: {
      fertilizer: `Fertilizer advice for ${cropId.toUpperCase()}: Apply 10 tons of organic manure per acre during soil prep. Recommended N:P:K is ${cropId === 'paddy' ? '120:60:60' : cropId === 'wheat' ? '120:60:40' : '150:80:120'} kg/hectare. ${cropId === 'paddy' ? 'Add Zinc Sulfate (25kg/ha) to prevent leaf yellowing.' : cropId === 'tomato' ? 'Spray Calcium Chloride (0.5%) to stop fruit rot.' : 'Apply potash for bulb growth.'}`,
      pestBug: `Pest and Bug control for ${cropId.toUpperCase()}: ${cropId === 'paddy' ? 'For Stem Borer, use Cartap Hydrochloride 4G (8kg/acre). For unwanted grass weeds, apply Pretilachlor herbicide within 3 days of transplanting.' : cropId === 'wheat' ? 'For Yellow Rust fungus, spray Propiconazole (Tilt 25% EC) at 200ml/acre. For Phalaris minor weed, spray Clodinafop.' : cropId === 'cotton' ? 'For Pink Bollworm, use pheromone traps (5/acre) or spray Profenophos 50EC.' : 'For aphids and blight fungus, spray Mancozeb 75WP (600g/acre). Weed out wild grasses manually at 25 days.'}`,
      rain: `Rain Prediction: Moderate rainfall (12-18mm) with high cloud cover is forecast in your district for the next 48-72 hours. Pro-Tip: Postpone all chemical spraying and fertilizer applications immediately so they are not washed away. Clear field drainage channels to prevent waterlogging.`,
      timing: `Sowing & Harvesting Timing for ${cropId.toUpperCase()}: ${cropId === 'paddy' ? 'Best sowing window is June-July (Kharif monsoon). Harvest in November-December.' : cropId === 'wheat' ? 'Best sowing window is November 1 to November 25 (Rabi). Harvest in late March to April.' : 'Sow at the beginning of the monsoon season. Harvest when crop color changes to standard dry gold.'}`,
      labor: `To reduce labor costs: Partner with neighboring farms to share heavy machinery, use mechanical seed-drill systems for sowing, and deploy power weeders for weed removal instead of manual labor.`,
      profit: `Profit Forecast: Regional APMC rates for ${cropId.toUpperCase()} are currently ₹${minVal}-₹${maxVal} per quintal. If you dry your crop properly before auction, you can fetch up to 15% higher returns. Storing for 1 month often yields better pricing.`,
      welcome: `Hello! I am your Kisan Khata AI assistant — \u0906\u092a\u0915\u093e \u0915\u093f\u0938\u093e\u0928 \u0938\u093e\u0925\u0940! Click the buttons below or ask me about fertilizer tips, bug/weed controls, rain predictions, or crop sowing timings in your local language.`
    },
    hi: {
      fertilizer: `${cropId === 'paddy' ? 'धान' : 'गेहूं'} के लिए खाद सलाह: बुवाई से पहले 10 टन गोबर खाद डालें। अनुशंसित N:P:K मात्रा ${cropId === 'paddy' ? '120:60:60' : '120:60:40'} किग्रा/हेक्टेयर है। ${cropId === 'paddy' ? 'खैरा रोग से बचाव के लिए 25 किग्रा जिंक सल्फेट डालें।' : 'कंदों के विकास के लिए पोटेशियम खाद का प्रयोग करें।'}`,
      pestBug: `कीट और खरपतवार नियंत्रण: ${cropId === 'paddy' ? 'तना छेदक (Stem Borer) के लिए कार्टाप हाइड्रोक्लोराइड 4G (8 किग्रा/एकड़) का उपयोग करें। खरपतवार नियंत्रण के लिए प्रीटीलाक्लोर का छिड़काव करें।' : cropId === 'wheat' ? 'पीला रतुआ (Yellow Rust) कवक के लिए प्रोपिकोनाजोल (टिल्ट 25% EC) 200 मिली/एकड़ की दर से छिड़कें।' : 'माहू और ब्लाइट रोग के लिए मैंकोजेब 75WP (600 ग्राम/एकड़) का छिड़काव करें। जंगली घासों को बुवाई के 25 दिन बाद हाथ से उखाड़ें।'}`,
      rain: `बारिश का पूर्वानुमान: अगले 48-72 घंटों में आपके जिले में हल्की से मध्यम वर्षा (12-18 मिमी) की संभावना है। सलाह: किसी भी प्रकार के कीटनाशक छिड़काव और यूरिया डालने को अभी रोक दें। जलभराव रोकने के लिए खेतों की नालियों को साफ रखें。`,
      timing: `${cropId === 'paddy' ? 'धान' : 'गेहूं'} का सही समय: ${cropId === 'paddy' ? 'बुवाई का सर्वोत्तम समय जून-जुलाई (खरीफ मानसून) है। कटाई नवंबर-दिसंबर में करें।' : 'गेहूं की बुवाई 1 से 25 नवंबर के बीच करें। कटाई मार्च के अंत से अप्रैल तक करें।'}`,
      labor: `श्रम लागत कम करने के उपाय: खेतों की निराई के लिए पावर वीडर का उपयोग करें, हाथ से बुवाई के स्थान पर ट्रैक्टर सीड-ड्रिल का प्रयोग करें और पड़ोसियों के साथ श्रम साझा करें。`,
      profit: `मंडी भाव और मुनाफ़ा: आपकी फ़सल का वर्तमान मंडी भाव ₹${minVal}-₹${maxVal} प्रति क्विंटल के बीच है। फसल को सुखाकर और छानकर बेचने से 12-15% अधिक मूल्य प्राप्त किया जा सकता है。`,
      welcome: `नमस्कार! मैं फ़ार्मोहोलिक एआई सहायक हूँ। नीचे दिए गए बटनों पर क्लिक करें या मुझसे खाद के उपयोग, कीट/खरपतवार नियंत्रण, मौसम और बुवाई के समय के बारे में अपनी भाषा में पूछें।`
    },
    mr: {
      fertilizer: `${cropId === 'paddy' ? 'भातासाठी' : 'गव्हासाठी'} खत नियोजन: पेरणीपूर्वी प्रति एकरी १० टन शेणखत टाका. शिफारसीत N:P:K प्रमाण ${cropId === 'paddy' ? '१२०:६०:६०' : '१२०:६०:४०'} किलो/हेक्टर आहे. ${cropId === 'paddy' ? 'पान पिवळे पडू नये म्हणून २५ किलो झिंक सल्फेट वापरा.' : 'कांदा/बटाटा पिकासाठी पोटॅश खताचा वापर वाढवा.'}`,
      pestBug: `कीड व तण नियंत्रण: ${cropId === 'paddy' ? 'खोडकिड्यासाठी (Stem Borer) कार्टाप हायड्रोक्लोराईड ४G (८ किलो/एकर) वापरा. पेरणीनंतर ३ दिवसांच्या आत प्रिटीलाक्लोर तणनाशक वापरा.' : cropId === 'wheat' ? 'तांबेरा (Yellow Rust) रोगासाठी प्रोपिकोनाझोल (टिल्ट २५% EC) २०० मिली/एकर फवारा.' : 'मावा आणि करपा रोगासाठी मॅन्कोझेब ७५WP (६०० ग्रॅम/एकर) फवारा. तण नियंत्रणासाठी २५ व्या दिवशी हाताने खुरपणी करा.'}`,
      rain: `पावसाचा अंदाज: तुमच्या जिल्ह्यात पुढील ४८ ते ७२ तासांत मध्यम स्वरूपाचा पाऊस (१२-१८ मिमी) पडण्याची शक्यता आहे. सल्ला: औषध फवारणी आणि रासायनिक खते टाकणे त्वरित थांबवा जेणेकरून ती वाहून जाणार नाहीत. शेतात पाणी साचू देऊ नका.`,
      timing: `${cropId === 'paddy' ? 'भात' : 'गहू'} पीक नियोजन वेळ: ${cropId === 'paddy' ? 'पेरणीचा सर्वोत्तम काळ जून-जुलै (खरीप) आहे. काढणी नोव्हेंबर-डिसेंबरमध्ये करा.' : 'गव्हाची पेरणी १ ते २५ नोव्हेंबर दरम्यान करा. काढणी मार्च अखेर ते एप्रिल दरम्यान करा.'}`,
      labor: `मजुरीचा खर्च वाचवण्यासाठी: कष्टाची कामे कमी करण्यासाठी पेरणी यंत्र (सीड-ड्रिल) आणि तण काढण्यासाठी पॉवर वीडरचा वापर करा.`,
      profit: `बाजारभाव अंदाज: तुमच्या पिकाला सध्या बाजारात ₹${minVal}-₹${maxVal} प्रति क्विंटल दर मिळत आहे. माल चांगला वाळवून आणल्यास १५% जास्त भाव मिळेल.`,
      welcome: `नमस्कार! मी आपला फार्मोहोलिक एआय सल्लागार आहे. खालील बटणावर क्लिक करा किंवा खत शिफारस, कीड/तण नियंत्रण, पावसाचा अंदाज किंवा पीक पेरणीच्या वेळेबद्दल विचारून पहा.`
    },
    pa: {
      fertilizer: `ਖਾਦ ਸਲਾਹ: ਬਿਜਾਈ ਸਮੇਂ ਰੂੜੀ ਦੀ ਖਾਦ ਪਾਓ। ${cropId === 'paddy' ? 'ਝੋਨੇ ਲਈ 120:60:60' : 'ਕਣਕ ਲਈ 120:60:40'} ਕਿਲੋ NPK ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ਪਾਓ। ਝੋਨੇ ਵਿੱਚ ਪੀਲਾਪਣ ਰੋਕਣ ਲਈ 25 ਕਿਲੋ ਜ਼ਿੰਕ ਸਲਫੇਟ ਵਰਤੋ।`,
      pestBug: `ਕੀੜੇ ਅਤੇ ਨਦੀਨ ਰੋਕਥਾਮ: ${cropId === 'paddy' ? 'ਤਣਾ ਛੇਦਕ ਲਈ ਕਾਰਟਾਪ ਹਾਈਡ੍ਰੋਕਲੋਰਾਈਡ 4G ਪਾਓ। ਨਦੀਨਾਂ ਲਈ ਪ੍ਰੀਟੀਲਾਕਲੋਰ ਦੀ ਵਰਤੋਂ ਕਰੋ.' : 'ਪੀਲੀ ਕੁੰਗੀ (Yellow Rust) ਲਈ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ (Tilt 25% EC) 200ml ਸਪਰੇਅ ਕਰੋ। ਗੁੱਲੀ ਡੰਡੇ ਲਈ ਕਲੋਡੀਨਾਫੋਪ ਵਰਤੋ.'}`,
      rain: `ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ: ਅਗਲੇ 2-3 ਦਿਨਾਂ ਵਿੱਚ ਮੱਧਮ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਸਪਰੇਅ ਅਤੇ ਖਾਦ ਪਾਉਣਾ ਰੋਕ ਦਿਓ ਤਾਂ ਜੋ ਖਾਦਾਂ ਵਹਿ ਨਾ ਜਾਣ। ਖੇਤਾਂ ਵਿੱਚੋਂ ਪਾਣੀ ਨਿਕਾਸੀ ਦਾ ਪ੍ਰਬੰਧ ਰੱਖੋ।`,
      timing: `ਬਿਜਾਈ ਦਾ ਸਮਾਂ: ${cropId === 'paddy' ? 'ਝੋਨਾ ਲਾਉਣ ਦਾ ਸਮਾਂ ਜੂਨ-ਜੁਲਾਈ ਹੈ। ਕਟਾਈ ਨਵੰਬਰ-ਦਸੰਬਰ ਵਿੱਚ ਕਰੋ.' : 'ਕਣਕ ਦੀ ਬਿਜਾਈ 1 ਤੋਂ 25 ਨਵੰਬਰ ਤੱਕ ਕਰੋ। ਕਟਾਈ ਅਪ੍ਰੈਲ ਵਿੱਚ ਕਰੋ.'}`,
      labor: `ਲੇਬਰ ਖ਼ਰਚ ਘਟਾਉਣ ਦੇ ਤਰੀਕੇ: ਹੈਪੀ ਸੀਡਰ ਅਤੇ ਸੀਡ ਡ੍ਰਿਲ ਮਸ਼ੀਨਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ, ਨਦੀਨਾਂ ਲਈ ਪਾਵਰ ਵੀਡਰ ਚਲਾਓ।`,
      profit: `ਮੰਡੀ ਦਾ ਭਾਅ: ਤੁਹਾਡੀ ਫ਼ਸਲ ਦਾ ਮੰਡੀ ਰੇਟ ₹${minVal}-₹${maxVal} ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ। ਫ਼ਸਲ ਚੰਗੀ ਤਰ੍ਹਾਂ ਸੁਕਾ ਕੇ ਮੰਡੀ ਲੈ ਕੇ ਜਾਓ ਤਾਂ ਜੋ ਸਹੀ ਭਾਅ ਮਿਲੇ।`,
      welcome: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਫਾਰਮੋਹੋਲਿਕ ਏਆਈ ਹਾਂ। ਖਾਦਾਂ, ਕੀੜੇ-ਮਕੌੜੇ, ਨਦੀਨ ਰੋਕਥਾਮ, ਅਤੇ ਮੌਸਮ ਬਾਰੇ ਜਾਣਕਾਰੀ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਦਬਾਓ।`
    },
    te: {
      fertilizer: `ఎరువుల యాజమాన్యం: ఎకరాకు 10 టన్నుల పశువుల ఎరువు వేయండి. సిఫార్సు చేసిన NPK మోతాదు ${cropId === 'paddy' ? '120:60:60' : '120:60:40'} కిలోలు/హెక్టారుకు. వరిలో ఆకులు పసుపు రంగులోకి మారకుండా 25 కిలోల జింక్ సల్ఫేట్ వాడండి.`,
      pestBug: `పురుగులు మరియు కలుపు నివారణ: ${cropId === 'paddy' ? 'వరి కాండం తొలిచే పురుగు నివారణకు కార్టాప్ హైడ్రోక్లోరైడ్ 4G వాడండి. నాటిన 3 రోజుల్లో కలుపు నివారణకు ప్రిటిలాక్లోర్ చల్లండి.' : 'గోధుమ పల్లా తెగులుకు ప్రొపికోనజోల్ 200ml స్ప్రే చేయండి. కలుపు మొక్కలను 25వ రోజున చేతితో తీసివేయండి.'}`,
      rain: `వర్షపాత అంచనా: రాబోయే 48-72 గంటల్లో మీ జిల్లాలో మోస్తరు వర్షం (12-18mm) కురిసే అవకాశం ఉంది. సలహా: మందులు పిచికారీ చేయడం నిలిపివేయండి. నీరు నిల్వ ఉండకుండా చూసుకోండి.`,
      timing: `సాగు సమయం: ${cropId === 'paddy' ? 'వరి నాటడానికి జూన్-జూలై అనుకూలం. నవంబర్-డిసెంబర్‌లో కోతలు కోయాలి.' : 'గోధుమ సాగు నవంబర్ 1-25 మధ్య చేయండి. మార్చి చివరిలో కోయాలి.'}`,
      labor: `కూలీల ఖర్చులు తగ్గించుటకు: విత్తనాలు నాటడానికి సీడ్ డ్రిల్ వాడండి, కలుపు తీయుటకు పవర్ వీడర్లు ఉపయోగించండి.`,
      profit: `లాభాల అంచనా: మీ పంటకు ప్రస్తుత మార్కెట్ ధర క్వింటాల్‌కు ₹${minVal}-₹${maxVal} వరకు ఉంది. ఎండబెట్టి అమ్మితే అధిక ధర లభిస్తుంది.`,
      welcome: `నమస్కారం! నేను ఫార్మోహోలిక్ AI సలహాదారును. ఎరువులు, కలుపు నివారణ, వర్ష సూచన మరియు పంట సాగు సమయం గురించి తెలుసుకోవడానికి క్రింది బటన్లపై క్లిక్ చేయండి.`
    },
    ta: {
      fertilizer: `உரப்பரிந்துரை: ஏக்கருக்கு 10 டன் மட்கிய தொழுவுரம் இடவும். பரிந்துரைக்கப்பட்ட NPK அளவு ${cropId === 'paddy' ? '120:60:60' : '120:60:40'} கிலோ/ஹெக்டேர். நெற்பயிரில் இலை மஞ்சள் நிறமாவதைத் தடுக்க 25 கிலோ துத்தநாக சல்பேட் இடவும்.`,
      pestBug: `பூச்சி மற்றும் களை மேலாண்மை: ${cropId === 'paddy' ? 'நெல் குருத்துப்பூச்சிக்கு கார்டாப் ஹைட்ரோகுளோரைடு 4G இடவும். களைகளைக் கட்டுப்படுத்த நடுவு நட்ட 3 நாட்களுக்குள் பிரிட்டிலாகுளோர் பயன்படுத்தவும்.' : 'கோதுமை துரு நோய்க்கு புரோபிகோனசோல் தெளிக்கவும். 25ம் நாளில் களைகளை கையால் அகற்றவும்.'}`,
      rain: `மழைப்பொழிவு கணிப்பு: அடுத்த 48-72 மணி நேரத்திற்குள் உங்கள் மாவட்டத்தில் மிதமான மழை பெய்யக்கூடும். அறிவுரை: உரமிடுதல் மற்றும் மருந்து தெளிப்பதை தற்காலிகமாக நிறுத்தவும். வயலில் தண்ணீர் தேங்குவதைத் தவிர்க்கவும்.`,
      timing: `விதைப்பு காலம்: ${cropId === 'paddy' ? 'நெல் விதைக்க ஜூன்-ஜூலை ஏற்றது. நவம்பர்-டிசம்பரில் அறுவடை செய்யவும்.' : 'கோதுமையை நவம்பர் 1-25க்குள் விதைக்கவும். மார்ச்-ஏப்ரலில் அறுவடை செய்யவும்.'}`,
      labor: `ஆள் கூலி குறைக்க: விதைப்பதற்கு இயந்திரங்களையும், களை எடுக்க பவர் வீடர்களையும் பயன்படுத்தவும்.`,
      profit: `வருவாய் கணிப்பு: தற்போதைய சந்தை விலை குவிண்டாலுக்கு ₹${minVal}-₹${maxVal} ஆகும். அறுவடை செய்த பின் ஈரப்பதம் போக்கி விற்பனை செய்தால் 15% கூடுதல் லாபம் பெறலாம்.`,
      welcome: `வணக்கம்! நான் பார்மோஹோலிக் AI. உரங்கள், பூச்சிகள் மேலாண்மை, மழை கணிப்பு மற்றும் விதைப்பு காலம் பற்றி அறிய கீழே உள்ள பொத்தான்களை அழுத்தவும்.`
    },
    bn: {
      fertilizer: `সারের পরামর্শ: চাষের সময় প্রতি একরে ১০ টন জৈব সার প্রয়োগ করুন। NPK সারের অনুপাত ${cropId === 'paddy' ? '১২০:৬০:৬০' : '১২০:৬০:৪০'} কেজি/হেক্টর রাখুন। ধানের পাতা হলুদ হওয়া রোধ করতে জিঙ্ক সালফেট ব্যবহার করুন।`,
      pestBug: `পোকা ও আগাছা দমন: ${cropId === 'paddy' ? 'ধানের মাজরা পোকার জন্য কারটাপ হাইড্রোক্লোরাইড ৪G ব্যবহার করুন। চারা রোপণের ৩ দিনের মধ্যে প্রীটিলাক্লোর আগাছানাশক ছড়ান।' : 'গমের মরিচা রোগের জন্য প্রোপিকোনাজোল স্প্রে করুন। ২৫ দিনে আগাছা পরিষ্কার করুন।'}`,
      rain: `বৃষ্টির পূর্বাভাস: আগামী ৪৮-৭২ ঘণ্টার মধ্যে মাঝারি বৃষ্টিপাতের সম্ভাবনা রয়েছে। সতর্কতা: সারের উপরিপ্রয়োগ ও কীটনাশক স্প্রে করা স্থগিত রাখুন, অন্যথায় বৃষ্টির জলে তা ধুয়ে যাবে। নিষ্কাশন নালা পরিষ্কার রাখুন।`,
      timing: `চাষের সময়: ${cropId === 'paddy' ? 'ধান রোপণের সেরা সময় জুন-জুলাই। নভেম্বর-ডিসেম্বরে ফসল কাটুন।' : 'গমের বপন ১-২৫ নভেম্বরের মধ্যে সম্পন্ন করুন। মার্চ-এপ্রিলে ফসল কাটুন।'}`,
      labor: `শ্রমিক খরচ কমাতে: যান্ত্রিক বীজ বপন যন্ত্র ব্যবহার করুন এবং হাত দিয়ে নিড়ানির বদলে পাওয়ার উইডার চালান।`,
      profit: `মুনাফার পূর্বাভাস: আপনার ফসলের বাজার দর বর্তমানে ₹${minVal}-₹${maxVal} প্রতি কুইন্টাল। ভালো করে শুকিয়ে বিক্রি করলে ১৫% বেশি দাম মিলবে।`,
      welcome: `নমস্কার! আমি ফার্মোহোলিক এআই। সার প্রয়োগের টিপস, পোকা দমন, বৃষ্টিপাত ও চাষের সঠিক সময় জানতে নিচের বোতামগুলি ক্লিক করুন।`
    },
    kn: {
      fertilizer: `ರಸಗೊಬ್ಬರ ಮಾಹಿತಿ: ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ. ಶಿಫಾರಸು ಮಾಡಿದ NPK ಪ್ರಮಾಣ ${cropId === 'paddy' ? '120:60:60' : '120:60:40'} ಕೆಜಿ/ಹೆಕ್ಟೇರ್. ಭತ್ತದ ಎಲೆ ಹಳದಿಯಾಗುವುದನ್ನು ತಡೆಯಲು 25 ಕೆಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಬಳಸಿ.`,
      pestBug: `ಕೀಟ ಹಾಗೂ ತಣ ನಿಯಂತ್ರಣ: ${cropId === 'paddy' ? 'ಭತ್ತದ ಕಾಂಡ ಕೊರಕಕ್ಕೆ ಕಾರ್ಟಾಪ್ ಹೈಡ್ರೋಕ್ಲೋರೈಡ್ 4G ಬಳಸಿ. ತಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಪ್ರಿಟಿಲಾಕ್ಲೋರ್ ಸಿಂಪಡಿಸಿ.' : 'ಗೋಧಿಯ ಹಳದಿ ತುಕ್ಕು ರೋಗಕ್ಕೆ ಪ್ರೊಪಿಕೋನಜೋಲ್ ಸ್ಪ್ರೇ ಮಾಡಿ. ಬಿತ್ತನೆಯ 25 ನೇ ದಿನದಂದು ಕಳೆ ಕೀಳಿ.'}`,
      rain: `ಮಳೆ ಮುನ್ಸೂಚನೆ: ಮುಂದಿನ 2-3 ದಿನಗಳಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಗೊಬ್ಬರ ಮತ್ತು ಔಷಧಿ ಸಿಂಪಡಿಸುವುದನ್ನು ತಡೆಹಿಡಿಯಿರಿ. ಗದ್ದೆಗಳಲ್ಲಿ ನೀರು ಹರಿದು ಹೋಗಲು ಜಾಗ ಮಾಡಿ.`,
      timing: `ಬಿತ್ತನೆ ಸಮಯ: ${cropId === 'paddy' ? 'ಭತ್ತ ಬಿತ್ತಲು ಜೂನ್-ಜುಲೈ ಸೂಕ್ತ. ನವೆಂಬರ್-ಡಿಸೆಂಬರ್‌ನಲ್ಲಿ ಕಟಾವು ಮಾಡಿ.' : 'ಗೋಧಿಯನ್ನು ನವೆಂಬರ್ 1 ರಿಂದ 25 ರೊಳಗೆ ಬಿತ್ತಿ. ಮಾರ್ಚ್-ಏಪ್ರಿಲ್‌ನಲ್ಲಿ ಕಟಾವು ಮಾಡಿ.'}`,
      labor: `ಕೂಲಿ ವೆಚ್ಚ ತಗ್ಗಿಸಲು: ಮೆಕ್ಯಾನಿಕಲ್ ಬಿತ್ತನೆ ಯಂತ್ರ ಮತ್ತು ಕಳೆ ತೆಗೆಯಲು ಪವರ್ ವೀಡರ್ ಬಳಸಿ.`,
      profit: `ಮಂಡಿ ಆದಾಯ: ಬೆಳೆಯ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹${minVal}-₹${maxVal} ಇದೆ. ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ ಮಾರಾಟ ಮಾಡಿದರೆ ಹೆಚ್ಚಿನ ಲಾಭ ಸಿಗುತ್ತದೆ.`,
      welcome: `ನಮಸ್ಕಾರ! ನಾನು ಫಾರ್ಮೋಹಾಲಿಕ್ AI. ರಸಗೊಬ್ಬರ, ಕೀಟ/ಕಳೆ ನಿಯಂತ್ರಣ, ಮಳೆ ಮಾಹಿತಿ ಮತ್ತು ಬಿತ್ತನೆ ಸಮಯ ತಿಳಿಯಲು ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ.`
    },
    gu: {
      fertilizer: `ખાતર વ્યવસ્થાપન: વાવણી પહેલા પૂરતું સેન્દ્રિય ખાતર આપો. NPK નું પ્રમાણ ${cropId === 'paddy' ? '120:60:60' : '120:60:40'} કિગ્રા/હેક્ટર રાખો. ડાંગરમાં પાન પીળા પડતા અટકાવવા ઝીંક સલ્ફેટ વાપરો.`,
      pestBug: `રોગ અને નીંદણ નિયંત્રણ: ${cropId === 'paddy' ? 'કાંસિયા કોરી ખાનાર જીવાત માટે કાર્ટાપ હાઇડ્રોક્લોરાઇડ 4G વાપરો. નીંદણ માટે પ્રીટીલાક્લોરનો છંટકાવ કરો.' : 'ઘઉંના ગેરુ રોગ માટે પ્રોપીકોનાઝોલ દવા છાંટો. ૨૫ દિવસે હાથથી નીંદામણ કરો.'}`,
      rain: `વરસાદની આગાહી: આગામી ૪૮-૭૨ કલાકમાં મધ્યમ વરસાદ પડવાની સંભાવના છે. ખેડૂત મિત્રો, દવાનો છંટકાવ અને ખાતર આપવાનું ટાળો, જેથી દવા ધોવાઈ ન જાય.`,
      timing: `વાવણીનો સમય: ${cropId === 'paddy' ? 'ડાંગર વાવવાનો યોગ્ય સમય જૂન-જુલાઈ છે. લણણી નવેમ્બર-ડિસેમ્બરમાં કરો.' : 'ઘઉંની વાવણી ૧ થી ૨૫ નવેમ્બર વચ્ચે કરો. લણણી માર્ચ-એપ્રિલમાં કરો.'}`,
      labor: `મજૂરી ખર્ચ ઘટાડવા: વાવણી માટે સીડ ડ્રીલનો ઉપયોગ કરો અને નીંદામણ કાઢવા પાવર વીડર ચલાવો.`,
      profit: `નફાની ગણતરી: માર્કેટ યાર્ડના ભાવો હાલ ₹${minVal}-₹${maxVal} પ્રતિ ક્વિન્ટલ છે. પાક સુકવીને વેચવાથી વધુ કિંમત મળશે.`,
      welcome: `નમસ્તે! હું ફાર્મોહોલિક AI સલાહકાર છું. ખાતરની જરૂરિયાત, રોગ/નીંદણ નિયંત્રણ, વરસાદ અને વાવણી સમય માટે નીચેના બટનો દબાવો.`
    }
  };

  const curr = answers[selectedLang] || answers['en'];

  if (text.includes('fertilizer') || text.includes('fertiliser') || text.includes('खाद') || text.includes('खत') || text.includes('ಗೊಬ್ಬರ') || text.includes('ఎరువులు') || text.includes('உரம்') || text.includes('সার')) {
    return curr.fertilizer;
  }
  if (text.includes('pest') || text.includes('bug') || text.includes('weed') || text.includes('disease') || text.includes('insect') || text.includes('कीट') || text.includes('कीड') || text.includes('ಕೀಟ') || text.includes('పురుగులు') || text.includes('பூச்சி') || text.includes('পোকা') || text.includes('જીવાત') || text.includes('खरपतवार') || text.includes('तण') || text.includes('ನದಿನ್') || text.includes('కలుపు') || text.includes('களை') || text.includes('আগাছা') || text.includes('નિંદામણ') || text.includes('rot') || text.includes('blight') || text.includes('rust')) {
    return curr.pestBug;
  }
  if (text.includes('weather') || text.includes('rain') || text.includes('forecast') || text.includes('precipitation') || text.includes('मौसम') || text.includes('हवामान') || text.includes('ਮੀਂਹ') || text.includes('వర్షం') || text.includes('மழை') || text.includes('বৃষ্টি') || text.includes('ಮಳೆ') || text.includes('વરસાદ') || text.includes('monsoon')) {
    return curr.rain;
  }
  if (text.includes('time') || text.includes('timing') || text.includes('sowing') || text.includes('harvest') || text.includes('month') || text.includes('season') || text.includes('बुवाई') || text.includes('पेरणी') || text.includes('બિજઈ') || text.includes('నాటడం') || text.includes('விதைப்பு')) {
    return curr.timing;
  }
  if (text.includes('labor') || text.includes('labour') || text.includes('मजदूरी') || text.includes('कामगार')) {
    return curr.labor;
  }
  if (text.includes('price') || text.includes('rate') || text.includes('profit') || text.includes('sell') || text.includes('भाव')) {
    return curr.profit;
  }

  return curr.welcome;
}

// Generate Exportable CSV format content
export function exportToCSV(project: FarmProject): string {
  let csvContent = `Project Name,${project.name}\n`;
  csvContent += `Crop,${project.cropId.toUpperCase()}\n`;
  csvContent += `State,${project.state}\n`;
  csvContent += `District,${project.district}\n`;
  csvContent += `Land Area (Acres),${project.landArea}\n`;
  csvContent += `Expected Yield (Quintals),${project.expectedYield}\n`;
  csvContent += `Budget (₹),${project.budget}\n`;
  csvContent += `Status,${project.status}\n\n`;
  
  csvContent += `Expense ID,Date,Category,Description,Amount (₹)\n`;
  project.expenses.forEach(e => {
    csvContent += `"${e.id}","${e.date}","${e.category}","${e.description.replace(/"/g, '""')}",${e.amount}\n`;
  });
  
  const total = project.expenses.reduce((s, e) => s + e.amount, 0);
  csvContent += `,,,,Total Expenses,${total}\n`;
  
  return csvContent;
}
