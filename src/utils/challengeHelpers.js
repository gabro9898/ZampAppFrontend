// src/utils/challengeHelpers.js
// Funzioni helper per le challenge - VERSIONE OTTIMIZZATA

export const getTypeColor = (challenge) => {
  const gameMode = challenge.gameMode?.toLowerCase();
  const price = parseFloat(challenge.price || 0);
  
  if (gameMode === 'free' || price === 0) return '#059669';
  if (gameMode === 'premium' || price > 0) return '#2563eb';
  if (gameMode === 'vip') return '#7c3aed';
  return '#6b7280';
};

export const getTypeIcon = (challenge) => {
  const gameMode = challenge.gameMode?.toLowerCase();
  const price = parseFloat(challenge.price || 0);
  
  if (gameMode === 'free' || price === 0) return '🎁';
  if (gameMode === 'premium' || price > 0) return '⭐';
  if (gameMode === 'vip') return '👑';
  return '📋';
};

export const getTypeLabel = (challenge) => {
  const gameMode = challenge.gameMode?.toLowerCase();
  const price = parseFloat(challenge.price || 0);
  
  if (gameMode === 'free' || price === 0) return 'Gratis';
  if (gameMode === 'premium' || price > 0) return 'Premium';
  if (gameMode === 'vip') return 'VIP';
  return challenge.gameMode;
};

// ✅ CORREZIONE: Rimosso debug logging per performance
export const formatTimeLeft = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  
  if (isNaN(end.getTime())) {
    return 'Data non valida';
  }
  
  const diff = end - now;
  
  if (diff <= 0) {
    return 'Terminata';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} giorni`;
  if (hours > 0) return `${hours} ore`;
  return 'Poche ore';
};

export const formatPrize = (prize) => {
  if (typeof prize === 'number') return `€${prize}`;
  return String(prize || 'Da definire');
};

export const getGameIcon = (gameType) => {
  switch (gameType) {
    case 'timer': return '⏱️';
    case 'steps': return '👣';
    case 'photo': return '📸';
    case 'quiz': return '🧠';
    default: return '🎮';
  }
};

// ✅ CORREZIONE: Funzione ottimizzata senza debug
export const isUserParticipating = (challenge, userId) => {
  if (!userId) return false;
  
  if (challenge.participants && Array.isArray(challenge.participants)) {
    return challenge.participants.some(p => p.userId === userId);
  }
  
  if (challenge.isParticipating !== undefined) {
    return challenge.isParticipating;
  }
  
  return false;
};

// ✅ CORREZIONE: Filtro ottimizzato senza debug logging
export const filterChallenges = (challenges, activeFilter) => {
  return challenges.filter(challenge => {
    // Filtro per tipo
    if (activeFilter !== 'all') {
      const gameMode = challenge.gameMode?.toLowerCase();
      const price = parseFloat(challenge.price || 0);
      
      if (activeFilter === 'free' && !(gameMode === 'free' || price === 0)) return false;
      if (activeFilter === 'premium' && !(gameMode === 'premium' || price > 0)) return false;
      if (activeFilter === 'vip' && gameMode !== 'vip') return false;
    }
    
    // Mostra solo challenge attive
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    
    return !isNaN(endDate.getTime()) && endDate > now;
  });
};