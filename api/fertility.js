// Fertility calculation algorithm based on symptothermal method

export const calculateFertilityStatus = (entry) => {
  const { basal_temp, mucus_type, mucus_quantity } = entry;
  
  const fertileMucusTypes = ['watery', 'egg_white'];
  const possiblyFertileMucus = ['creamy'];
  
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
  
  if (basal_temp && basal_temp >= 37.0) {
    return {
      status: 'infertile',
      confidence: 0.7,
      reason: 'Elevated temperature - likely luteal phase'
    };
  }
  
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
