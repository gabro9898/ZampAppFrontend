// src/components/CountdownTimer.js - Versione Migliorata
import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

export function CountdownTimer({ targetDate, textStyle }) {
  const [timeLeft, setTimeLeft] = useState('--:--:--');
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const calculateTimeLeft = () => {
      if (!isMountedRef.current) return false;
      
      const now = new Date();
      
      // Validazione input migliorata
      if (!targetDate) {
        console.log('⏰ CountdownTimer: nessuna targetDate fornita');
        setTimeLeft('--:--:--');
        return false;
      }
      
      let target;
      try {
        // Se è già una Date valida
        if (targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          target = targetDate;
        } 
        // Se è una stringa ISO o altro formato
        else if (typeof targetDate === 'string') {
          target = new Date(targetDate);
          
          // Se la conversione fallisce, prova a parsare diversamente
          if (isNaN(target.getTime())) {
            // Prova con formato ISO con timezone
            const isoDate = targetDate.replace(' ', 'T');
            target = new Date(isoDate);
            
            if (isNaN(target.getTime())) {
              console.log('⏰ CountdownTimer: data non valida:', targetDate);
              setTimeLeft('--:--:--');
              return false;
            }
          }
        }
        // Se è un timestamp
        else if (typeof targetDate === 'number') {
          target = new Date(targetDate);
        }
        else {
          console.log('⏰ CountdownTimer: formato non supportato:', typeof targetDate, targetDate);
          setTimeLeft('--:--:--');
          return false;
        }
        
        // Verifica finale validità data
        if (isNaN(target.getTime())) {
          console.log('⏰ CountdownTimer: data finale non valida');
          setTimeLeft('--:--:--');
          return false;
        }
      } catch (error) {
        console.error('⏰ CountdownTimer: errore parsing data:', error);
        setTimeLeft('--:--:--');
        return false;
      }
      
      const diff = target - now;
      
      // Se il tempo è scaduto
      if (diff <= 0) {
        setTimeLeft('Ora disponibile!');
        return false; // Stop timer
      }
      
      // Calcola ore, minuti, secondi
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (isMountedRef.current) {
        setTimeLeft(timeString);
      }
      
      return true; // Continue timer
    };

    // Calcola immediatamente
    const shouldContinue = calculateTimeLeft();
    
    // Avvia interval solo se necessario
    if (shouldContinue) {
      intervalRef.current = setInterval(() => {
        const stillRunning = calculateTimeLeft();
        if (!stillRunning && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetDate]);

  return (
    <Text style={textStyle || { color: 'white', fontSize: 14, fontWeight: '600' }}>
      {timeLeft}
    </Text>
  );
}