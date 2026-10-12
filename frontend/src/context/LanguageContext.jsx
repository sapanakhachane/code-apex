import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    navHome: "Home",
    navReport: "Report Emergency",
    navMap: "Live Map",
    navAssistant: "AI Assistant",
    navAuthority: "Authority Command",
    navRescue: "Rescue Teams",
    navHospitals: "Nearby Hospitals",
    navTracking: "Track Incident",
    navLogin: "Sign In",
    navLogout: "Sign Out",
    sosButton: "REPORT EMERGENCY",
    exploreMap: "EXPLORE LIVE MAP",
    heroTitle: "Every Second Matters. Every Life Counts.",
    heroSubtitle: "CrisisMesh AI connects citizens, artificial intelligence, and responders through a unified command intelligence network to save lives faster.",
    demoBanner: "DEMO MODE – Simulated Emergency Intelligence Data",
    emergencyDisclaimer: "For immediate life-threatening danger, dial 112 / 911 immediately.",
    totalReports: "Total Incidents",
    activeReports: "Active Emergencies",
    resolvedReports: "Resolved Incidents",
    availableTeams: "Available Rescue Teams",
    highPriority: "High & Critical Emergencies",
  },
  hi: {
    navHome: "होम",
    navReport: "आपातकाल रिपोर्ट करें",
    navMap: "लाइव नक्शा",
    navAssistant: "एआई सहायक",
    navAuthority: "प्राधिकरण कमांड",
    navRescue: "बचाव दल",
    navHospitals: "निकटतम अस्पताल",
    navTracking: "स्थिति ट्रैक करें",
    navLogin: "लॉग इन",
    navLogout: "लॉग आउट",
    sosButton: "आपातकालीन SOS",
    exploreMap: "लाइव नक्शा देखें",
    heroTitle: "हर सेकंड महत्वपूर्ण है। हर जीवन अनमोल है।",
    heroSubtitle: "क्राइसिसमेश एआई नागरिकों, एआई और बचाव दलों को एक साथ जोड़कर जीवन बचाने की गति को तेज करता है।",
    demoBanner: "डेमो मोड – सिम्युलेटेड आपातकालीन डेटा",
    emergencyDisclaimer: "तत्काल जीवन-घातक खतरे के लिए तुरंत 112 डायल करें।",
    totalReports: "कुल मामले",
    activeReports: "सक्रिय आपातकाल",
    resolvedReports: "सुलझाए गए मामले",
    availableTeams: "उपलब्ध बचाव दल",
    highPriority: "उच्च और गंभीर आपातकाल",
  },
  mr: {
    navHome: "मुख्यपृष्ठ",
    navReport: "आणीबाणी नोंदवा",
    navMap: "थेट नकाशा",
    navAssistant: "एआय सहाय्यक",
    navAuthority: "प्राधिकरण कमांड",
    navRescue: "बचाव पथके",
    navHospitals: "जवळची रुग्णालये",
    navTracking: "स्थिती ट्रॅक करा",
    navLogin: "लॉगिन",
    navLogout: "बाहेर पडा",
    sosButton: "तातडीची मदत (SOS)",
    exploreMap: "थेट नकाशा उघडा",
    heroTitle: "प्रत्येक सेकंद महत्त्वाचा आहे. प्रत्येक जीव मोलाचा आहे.",
    heroSubtitle: "क्रायसिसमेश एआय नागरिक, कृत्रिम बुद्धिमत्ता आणि बचाव दलांना एकत्र जोडून जलद प्रतिसाद सुनिश्चित करते.",
    demoBanner: "डेमो मोड – सिम्युलेटेड आणीबाणी डेटा",
    emergencyDisclaimer: "तातडीच्या धोक्यासाठी कृपया लगेच 112 डायल करा.",
    totalReports: "एकूण घटना",
    activeReports: "सक्रिय आणीबाणी",
    resolvedReports: "निकाली काढलेल्या घटना",
    availableTeams: "उपलब्ध बचाव पथके",
    highPriority: "गंभीर आणीबाणी",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
