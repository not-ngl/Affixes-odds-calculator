// probability.js - Single value probability calculator

window.ProbabilityCalculator = {
  UPGRADE_CONFIG: {
    0: { p: 0, q: 1, maxRare: 0 },
    1: { p: 0.05, q: 0.95, maxRare: 1 },
    2: { p: 0.10, q: 0.90, maxRare: 1 },
    3: { p: 0.10, q: 0.90, maxRare: 4 }
  },

  getPoolSize: function(Nc, Nu) {
    return 2 * Nc + Nu;
  },

  /**
   * 1-slot, 1-selected
   * Returns probability of getting the selection made
   */
  calc1_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    
    if (NrAsked === 1) return p / Nr;
    if (NuAsked === 1) return q / S;
    if (NcAsked === 1) return 2 * q / S;
    
    return 0;
  },

  /**
   * 2-slots available, 1-selected
   * Returns probability of getting the selection made (only 1 affix selected)
   */
  calc2_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 1) return 2 * p / Nr;
      if (NuAsked === 1) return 2 * p * q / S + 2 * q * q / S * ((Nu - 1) / S1 + Nc / S1 + Nc / S2);
      if (NcAsked === 1) return 4 * p * q / S + 2 * q * q / S * (Nu / S1 + Nu / S2 + 4 * (Nc - 1) / S2);
    } else {
      if (NrAsked === 1) return p / Nr;
      if (NuAsked === 1) return p / S + 2 * q / S * ((Nu - 1) / S1 + Nc / S1 + Nc / S2);
      if (NcAsked === 1) return 2 * p / S + 2 * q / S * (Nu / S1 + Nu / S2 + 4 * (Nc - 1) / S2);
    }
    
    return 0;
  },

  /**
   * 2-slots available, 2-selected
   * Returns probability of getting the selection made
   * nrAsked, nuAsked, nCAsked must sum to slotsSelected
   */
  calc2_2: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    const q1 = (Nr === 1) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 2) return 2 * p * p / Nr / (Nr-1);
      if (NrAsked === 1 && NuAsked === 1) return 2 * p * q1 / Nr / S;
      if (NrAsked === 1 && NcAsked === 1) return 4 * p * q1 / Nr / S;
      if (NuAsked === 2) return 2 * q * q / S / S1;
      if (NcAsked === 2) return 2 * q * q * 4 / S / S2;
      if (NuAsked === 1 && NcAsked === 1) return 2 * q * q / S * (1/S1 + 1/S2);
    } else {
      if (NrAsked === 1 && NuAsked === 1) return p / Nr / S;
      if (NrAsked === 1 && NcAsked === 1) return 2 * p / Nr / S;
      if (NuAsked === 2) return 2 * q / S / S1;
      if (NcAsked === 2) return 2 * q * 4 / S / S2;
      if (NuAsked === 1 && NcAsked === 1) return 2 * q / S * (1/S1 + 1/S2);
    }
    return 0;
  },

  /**
   * 3-slots available, 1-selected
   * Returns probability of getting the selection made (only 1 affix selected)
   */
  calc3_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 1) return 3 * p / Nr;
      if (NuAsked === 1) {
        const rr = 3 * p * p * q / S;
        const ru = 2 * p * q * q / S * ( 2*(Nu-1)/S1 + 3*Nc/S1 + 3*Nc/S2 );
        const u = q * q * q / S * ( 4*Nc*(Nc+Nu-2)/S2/S3 + (Nu-1)*(2*Nc+3*Nu-6)/S1/S2 + 4*Nc/S1 + 4*Nc*(Nc-1)/S2/S4 );
        return rr + ru + u;
      }
      if (NcAsked === 1) {
        const rr = 6 * p * p * q / S;
        const rc = 6 * p * q * q / S * ( Nu/S1 + Nu/S2 + 4*(Nc-1)/S2 );
        const c = 2 * q * q * q / S * ( Nu*(2*Nu+Nc-1)/S2/S3 + 2*(Nc-1)*(6*Nc+Nu-12)/S2/S4 + Nu*(4*Nc+Nu-5)/S1/S3 + (Nu-1)*Nu/S1/S2 );
        return rr + rc + c;
      }
    } else {
      if (NrAsked === 1) return p / Nr;
      if (NuAsked === 1) {
        const r = 2 * p / S * ( (Nu-1)/S1 + Nc/S1 + Nc/S2 );
        const c = 4 * q / S * Nc * ( (Nu-1)/S2/S3 + (Nc-1)/S2/S3 + (Nc-1)/S2/S4 );
        const u = q / S / S1 * ( 3*(Nu-1)*(Nu-2)/S2 + 4*(Nu-1)*Nc/S2 + 4*(Nu-1)*Nc/S3 + 4*Nc*(Nc-1)/S3 );
        return r + c + u;
      }
      if (NcAsked === 1) {
        const r = 2 * p / S * ( Nu/S1 + Nu/S2 + 4*(Nc-1)/S2 );
        const u = 2 * q / S * Nu * ( (Nu-1)/S1/S2 + (Nu-1)/S1/S3 + 4*(Nc-1)/S1/S3 );
        const c = 2 * q / S / S2 * ( Nu*(Nu-1)/S3 + 2*Nu*(Nc-1)/S3 + 4*Nu*(Nc-1)/S4 + 12*(Nc-1)*(Nc-2)/S4 );
        return r + c + u;
      }
    }
    return 0;

  },

  /**
   * 3-slots available, 2-selected
   * Returns probability of getting the selection made (2 affixes selected)
   */
  calc3_2: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    const q1 = (Nr === 1) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 2) return 6 * p * p / Nr / (Nr-1);
      if (NuAsked === 2) return 6 * p * q * q / S / S1 + q * q * q / S * ( 4*Nc/S2/S3 + 4*Nc/S1/S2 + 4*Nc/S1/S3 + 3*(Nu-2)/S1/S2 );
      if (NcAsked === 2) return 24 * p * q * q / S / S2 + 8 * q * q * q / S * ( Nu/S1/S3 + Nu/S3/S2 + Nu/S2/S4 + 3*(Nc-2)/S2/S4 );
      if (NrAsked === 1 && NuAsked === 1) return 6 * p * p * q1 / S / Nr + 6 * p * q1 * q / S / Nr * ( (Nu-1)/S1 + Nc/S1 + Nc/S2 );
      if (NrAsked === 1 && NcAsked === 1) return 12 * p * p * q1 / S / Nr + 6 * p * q1 * q / S / Nr * ( 4*(Nc-1)/S2 + Nu/S1 + Nu/S2 );
      if (NuAsked === 1 && NcAsked === 1) {
        const r = 6 * p * q * q / S * ( 1/S1 + 1/S2 );
        const uc = 4 * q * q * q / S * ( 2*(Nc-1)/S3*(1/S1+1/S2) + (Nu-1)/S2*(1/S1+1/S3) + (Nu-1)/S1/S3 + 2*(Nc-1)/S2/S4 );
        return r + uc;
      }
    } else {
      if (NrAsked === 1 && NuAsked === 1) return 2 * p / Nr / S * ( (Nu-1)/S1 + Nc/S1 + Nc/S2 );
      if (NrAsked === 1 && NcAsked === 1) return 2 * p / Nr / S * ( 4*(Nc-1)/S2 + Nu/S2 + Nu/S1 );
      if (NuAsked === 2) {
        const r = 2 * p / S / S1;
        const u = 2 * q / S * ( 2*Nc/S1/S2 + 2*Nc/S1/S3 + 2*Nc/S2/S3 + 3*(Nu-2)/S1/S2 );
        return r + u;
      }
      if (NcAsked === 2) {
        const r = 8 * p / S / S2;
        const c = 8 * q / S * ( Nu/S2/S4 + Nu/S2/S3 + Nu/S1/S3 + 6*(Nc-2)/S2/S4 );
        return r + c;
      }
      if (NcAsked === 1 && NuAsked === 1) {
        const r = 2 * p / S * ( 1/S2 + 1/S1 );
        const c = 8 * q / S * (Nc - 1) * ( 1/S2/S4 + 1/S2/S3 + 1/S1/S3 );
        const u = 4 * q / S * (Nu - 1) * ( 1/S1/S2 + 1/S1/S3 + 1/S2/S3 );
        return r + c + u;
      }
    }
    return 0;

  },

  /**
   * 3-slots available, 3-selected
   * Returns probability of getting the selection made
   */
  calc3_3: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr === 0) ? 1 : 1 - p;
    const q1 = (Nr === 1) ? 1 : 1 - p;
    const q2 = (Nr === 2) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 3) return 6 * p * p * p / Nr / (Nr-1) / (Nr-2);
      if (NuAsked === 3) return 6 * q * q * q / S / S1 / S2;
      if (NcAsked === 3) return 6 * 8 * q * q * q / S / S2 / S4;
      if (NrAsked === 2 && NuAsked === 1) return 2 * 3 * p * p * q2 / S / Nr / (Nr-1);
      if (NrAsked === 2 && NcAsked === 1) return 2 * 6 * p * p * q2 / S / Nr / (Nr-1);
      if (NuAsked === 2 && NrAsked === 1) return 2 * 3 * p * q * q1 / S / Nr / S1;
      if (NuAsked === 2 && NcAsked === 1) return 2 * 2 * q * q * q / S * ( 1/S1/S2 + 1/S1/S3 + 1/S2/S3 );
      if (NcAsked === 2 && NrAsked === 1) return 2 * 12 * p * q * q1 / S / Nr / S2;
      if (NcAsked === 2 && NuAsked === 1) return 2 * 4 * q * q * q / S * ( 1/S2/S4 + 1/S2/S3 + 1/S1/S3 );
      if (NuAsked === 1 && NcAsked === 1 && NrAsked === 1) {
        return 3 * p * q * q1 / Nr / S * ( 1/S1 + 1/S2 );
      }
    } else {
      if (NrAsked === 1) {
        if (NuAsked === 2) return p / Nr / S / S1;
        if (NcAsked === 2) return 4 * p / Nr / S / S1;
        if (NcAsked === 1 && NuAsked === 1) return 2 * p / Nr / S * ( 1/S1 + 1/S2 );
      } 
      if (NuAsked === 3) return 6 * q / S / S1 / S2;
      if (NcAsked === 3) return 6 * 8 * q / S / S2 / S4;
      if (NcAsked === 2 && NuAsked === 1) return 8 * q / S * ( 1/S1/S3 + 1/S2/S3 + 1/S2/S4 )
      if (NcAsked === 1 && NuAsked === 2) return 4 * q / S * ( 1/S2/S3 + 1/S1/S3 + 1/S1/S2 )
    }
    return 0;

  },


  /**
   * Main dispatcher - returns single probability value
   */
  calculateProbabilities: function(Nr, Nu, Nc, upgrade, slotsAvailable, slotsSelected, NrAsked, NuAsked, NcAsked) {
    if (Nr < 0 || Nu < 0 || Nc < 0) throw new Error('Affix counts cannot be negative');
    if (slotsSelected > slotsAvailable) throw new Error('Cannot select more slots than available');
    if (NrAsked + NuAsked + NcAsked !== slotsSelected) throw new Error('Requested affix count does not match slots selected');
    if (slotsSelected === 0) return 0;
    
    const config = this.UPGRADE_CONFIG[upgrade];
    if (!config) throw new Error(`Invalid upgrade level: ${upgrade}. Must be 0-3.`);
    
    const key = `${slotsAvailable}-${slotsSelected}`;
    
    switch (key) {
      case '1-1':
        return this.calc1_1(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '2-1':
        return this.calc2_1(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '2-2':
        return this.calc2_2(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '3-1':
        return this.calc3_1(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '3-2':
        return this.calc3_2(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '3-3':
        return this.calc3_3(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      default:
        throw new Error(`Formula not implemented yet: ${slotsAvailable} slots, ${slotsSelected} selected`);
    }
  }
};
