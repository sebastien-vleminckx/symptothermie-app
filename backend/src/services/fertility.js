// Fertility calculation algorithm based on symptothermal method

export const calculateFertilityStatus = (entry) => {
  const { basal_temp, mucus_type, mucus_quantity } = entry;
  
  // Fertile mucus types
  const fertileMucusTypes = ['watery', 'egg_white'];
  const possiblyFertileMucus = ['creamy'];
  
  // Check mucus first (primary indicator)
  if (fertileMucusTypes.includes(mucus_type)) {
    return {
      status: 'fertile',
      confidence: 0.9,
      reason: 'Fertile cervical mucus detected'
    };
  }
  
  if (possiblyFertileMucus.includes(mucus_type)) {
    return {
      status: 'possibly_fertile',
      confidence: 0.6,
      reason: 'Possibly fertile mucus'
    };
  }
  
  // Temperature check (requires historical data for coverline)
  // For now, basic temperature check
  if (basal_temp) {
    // High temperature (>37°C) typically indicates luteal phase
    if (basal_temp >= 37.0) {
      return {
        status: 'infertile',
        confidence: 0.7,
        reason: 'Elevated temperature - likely luteal phase'
      };
    }
  }
  
  // Dry mucus = typically infertile
  if (mucus_type === 'dry' || mucus_quantity === 'none') {
    return {
      status: 'infertile',
      confidence: 0.5,
      reason: 'Dry day - likely infertile'
    };
  }
  
  return {
    status: 'unknown',
    confidence: 0,
    reason: 'Insufficient data'
  };
};

// Calculate coverline for temperature shift detection
export const calculateCoverline = (temps) => {
  if (temps.length < 6) return null;
  
  // Take first 6 valid temperatures
  const firstSix = temps.slice(0, 6).filter(t => t !== null);
  if (firstSix.length < 6) return null;
  
  const sum = firstSix.reduce((a, b) => a + b, 0);
  const average = sum / firstSix.length;
  
  // Coverline is 0.1°C above the highest of the first 6 temps
  const max = Math.max(...firstSix);
  return max + 0.1;
};

// Detect ovulation via temperature shift (3 temps above coverline)
export const detectOvulation = (entries) => {
  const temps = entries.map(e => e.basal_temp).filter(t => t !== null);
  const coverline = calculateCoverline(temps);
  
  if (!coverline) return null;
  
  // Look for 3 consecutive temps above coverline
  for (let i = 0; i <= entries.length - 3; i++) {
    const threeTemps = entries.slice(i, i + 3).map(e => e.basal_temp);
    
    if (threeTemps.every(t => t !== null && t > coverline)) {
      // Ovulation occurred before the first high temp
      return {
        detected: true,
        ovulationIndex: i - 1,
        coverline
      };
    }
  }
  
  return { detected: false, coverline };
};
