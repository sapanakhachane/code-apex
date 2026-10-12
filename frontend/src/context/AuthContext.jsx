import React, { createContext, useContext, useState, useEffect } from 'react';

const DEMO_ACCOUNTS = {
  citizen: {
    uid: 'usr_citizen_01',
    name: 'Dr. Rajesh Sharma',
    email: 'citizen@crisismesh.ai',
    phone: '+91 98765 43210',
    role: 'Citizen',
    badge: 'Verified Citizen Reporter',
    avatar: '👨‍💼',
    approved: true
  },
  authority: {
    uid: 'usr_authority',
    name: 'Director K. Verma',
    email: 'commander@crisismesh.ai',
    phone: '+91 99999 11223',
    role: 'Authority',
    badge: 'Disaster Command Chief',
    avatar: '🎖️',
    approved: true
  },
  rescue: {
    uid: 'usr_rescue_med',
    name: 'Capt. Amit Singh',
    email: 'rescue@crisismesh.ai',
    phone: '+91 98202 22002',
    role: 'Rescue Team',
    teamId: 'TEAM-MED-02',
    teamName: 'Rapid ALS Trauma Ambulance 12',
    badge: 'Paramedic Tactical Lead',
    avatar: '🚑',
    approved: true
  },
  hospital: {
    uid: 'usr_hosp_admin',
    name: 'Dr. Ananya Roy',
    email: 'hospital@crisismesh.ai',
    phone: '+91 22 2675 1000',
    role: 'Hospital Administrator',
    hospitalName: 'Lilavati Hospital & Research Centre',
    badge: 'Trauma ICU Director',
    avatar: '🏥',
    approved: true
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to citizen user or saved user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('crisismesh_user');
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.citizen;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('crisismesh_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('crisismesh_user');
    }
  }, [currentUser]);

  const loginWithRole = (roleKey) => {
    const user = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.citizen;
    setCurrentUser(user);
    return user;
  };

  const loginWithCredentials = async (email, password) => {
    // Check demo accounts
    const match = Object.values(DEMO_ACCOUNTS).find(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setCurrentUser(match);
      return { success: true, user: match };
    }
    // Generic user login fallback
    const customUser = {
      uid: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'Citizen',
      badge: 'Citizen Account',
      avatar: '👤',
      approved: true
    };
    setCurrentUser(customUser);
    return { success: true, user: customUser };
  };

  const registerUser = async (userData) => {
    const isSpecialRole = userData.role !== 'Citizen';
    const newUser = {
      uid: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      badge: `${userData.role} Member`,
      avatar: userData.role === 'Authority' ? '🎖️' : userData.role === 'Rescue Team' ? '🚒' : userData.role === 'Hospital Administrator' ? '🏥' : '👤',
      approved: !isSpecialRole // Citizen approved directly; others require admin approval as required in Section 5
    };
    setCurrentUser(newUser);
    return { success: true, user: newUser, requiresApproval: isSpecialRole };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginWithRole,
      loginWithCredentials,
      registerUser,
      logout,
      DEMO_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
