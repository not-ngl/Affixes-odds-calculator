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
  calc1_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr < 1) ? 1 : 1 - p;
    
    if (NrAsked === 1) return p / Nr;
    if (NuAsked === 1) return q / S;
    if (NcAsked === 1) return 2 * q / S;
    
    return 0;
  },

  /**
   * 2-slots available, 1-selected
   * Returns probability of getting the selection made (only 1 affix selected)
   */
  calc2_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true 
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    
    if (upgrade === 3) {
      if (NrAsked === 1) return p / Nr * (1 + p1 + q);
      if (NuAsked === 1) return (q * q + q + p * q1) / S;
      if (NcAsked === 1) return 2 * (q * q + q + p * q1) / S;
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
  calc2_2: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const p = this.UPGRADE_CONFIG[upgrade].p;
    const q = (Nr < 1) ? 1 : 1 - p;
    const q1 = (Nr < 2) ? 1 : 1 - p;
    
    if (upgrade === 3) {
      if (NrAsked === 2) return 2 * p * p / Nr / (Nr-1);
      if (NrAsked === 1 && NuAsked === 1) return p / Nr / S * (q + q1);
      if (NrAsked === 1 && NcAsked === 1) return 2 * p / Nr / S * (q + q1);
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
  calc3_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
   
    if (Nr < NrAsked) return 0;
    if (upgrade === 3) {
      if (NrAsked === 1) return p / Nr * (1 + p1 + q + p1*p2 + p1*q1 + p1*q + q*q); 
      if (NuAsked === 1) return 1/S * (q + p*q1 + p*p1*q2 + p*q1*q1 + q*q + p*q*q1 + q*q*q);
      if (NcAsked === 1) return 2 * 1/S * (q + p*q1 + p*p1*q2 + p*q1*q1 + q*q + p*q*q1 + q*q*q); 
    } else {
      if (NrAsked === 1) return p / Nr;
      if (NuAsked === 1) return (3*q + 2*p) / S;
      if (NcAsked === 1) return 2 * (3*q + 2*p) / S;
    }
    return 0;

  },

  /**
   * 3-slots available, 2-selected
   * Returns probability of getting the selection made (2 affixes selected)
   */
  calc3_2: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    
    if (Nr < NrAsked) return 0;
    if (upgrade === 3) {
      if (NrAsked === 2) return 2 * p * p / Nr / (Nr-1) * (1 + 2 * p2 + q1 + q);
      if (NuAsked === 2) return 2/S/S1 * (q*q*p + p*q*q1 + p*q1*q1) + 6*q*q*q/S/S1/S2 * (Nu-2) + 4*q*q*q/S * Nc * (1/S2/S3 + 1/S1/S3 + 1/S1/S2);
      if (NcAsked === 2) return 8/S/S2 * (q*q*p + p*q*q1 + p*q1*q1) + 48*q*q*q/S/S2/S4* (Nc-2) + 8*q*q*q/S * Nu * (1/S1/S3 + 1/S2/S3 + 1/S2/S4);
      if (NrAsked === 1 && NuAsked === 1) {
        return p/Nr/S*(2*p1*q2 + q1 + 2*q1*q1*Nc/S2 + q1*q1*(Nu-1)/S1 + q1*p1 + q + p1*q + q*q + 2*q*q1*Nc/S2 + 2*q*q*Nc/S2 + q*q1*(Nu-1)/S1 + q*q*(Nu-1)/S1);
      }
      if (NrAsked === 1 && NcAsked === 1) {
        return 2*p/Nr/S*(2*p1*q2 + q1 + 2*q1*q1*Nu/S1 + q1*q1*(Nc-1)/S2 + q1*p1 +q + p1*q + q*q + q*q1*Nu/S1 + q*q*Nu/S1+ 2*q*q1*(Nc-1)/S2 + 2*q*q*(Nc-1)/S2);
      }
      if (NuAsked === 1 && NcAsked === 1) {
        const r = 2*p*(q+q1)*q1/S * (1/S1 + 1/S2);
        const ucx = 2*q*q/S * (1/S1 + 1/S2);
        const xcu = 2*q*q*q/S * ((Nu-1) * (1/S2/S1 + 1/S3/S1 + 1/S2/S3) + 2*(Nc-1) * (1/S3/S2 + 1/S4/S2 + 1/S1/S3) + (Nu-2)/S1/S2 + 2*(Nc-2)/S2/S4);
        return r + ucx + xcu;
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
  calc3_3: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    
    if (Nr < NrAsked) return 0;
    if (upgrade === 3) { 
      if (NrAsked === 3) return 6 * p * p1 * p2 / Nr / (Nr-1) / (Nr-2);
      if (NuAsked === 3) return 6 * q * q * q / S / S1 / S2;
      if (NcAsked === 3) return 48 * q * q * q / S / S2 / S4;
      if (NrAsked === 2 && NuAsked === 1) return 2 * (p*p*q2 + p*p*q1 + p*p*q) / S / Nr / (Nr-1);
      if (NrAsked === 2 && NcAsked === 1) return 4 * (p*p*q2 + p*p*q1 + p*p*q) / S / Nr / (Nr-1);
      if (NuAsked === 2 && NrAsked === 1) return 2 * (p*q1*q1 + p*q*q1 + p*q*q) / S / Nr / S1;
      if (NcAsked === 2 && NrAsked === 1) return 8 * (p*q1*q1 + p*q*q1 + p*q*q) / S / Nr / S2;
      if (NuAsked === 2 && NcAsked === 1) return 4 * q * q * q / S * ( 1/S1/S2 + 1/S1/S3 + 1/S2/S3 );
      if (NcAsked === 2 && NuAsked === 1) return 8 * q * q * q / S * ( 1/S2/S4 + 1/S2/S3 + 1/S1/S3 );
      if (NuAsked === 1 && NcAsked === 1 && NrAsked === 1) {
        return 2 * (q1*q1 + q*q1 + q*q) * p / Nr / S * ( 1/S1 + 1/S2 );
      }
    } else { 
      if (NrAsked === 1) {
        if (NuAsked === 2) return 2 * p / Nr / S / S1;
        if (NcAsked === 2) return 8 * p / Nr / S / S2;
        if (NcAsked === 1 && NuAsked === 1) return 2 * p / Nr / S * ( 1/S1 + 1/S2 );
      } 
      if (NuAsked === 3) return 6 * q / S / S1 / S2;
      if (NcAsked === 3) return 48 * q / S / S2 / S4;
      if (NcAsked === 2 && NuAsked === 1) return 8 * q / S * ( 1/S1/S3 + 1/S2/S3 + 1/S2/S4 )
      if (NcAsked === 1 && NuAsked === 2) return 4 * q / S * ( 1/S2/S3 + 1/S1/S3 + 1/S1/S2 )
    }
    return 0;

  },

  /**
   * 4-slots available, 1-selected
   * Returns probability of getting the selection made (only 1 affix selected)
   */
  calc4_1: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) {
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const S5 = S - 5;
    const S6 = S - 6;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p3 = (Nr < 4) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    const q3 = 1 - p3;
    
    if (upgrade === 3) { 
      if (NrAsked === 1) {
        const u =     q *      Nu/S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *      Nc/S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1)/Nr * this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const R = p / Nr;
        return u + c + r + R;
      }
      if (NuAsked === 1) {
        const u =     q * (Nu-1)/S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc/S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *            this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const U = q / S;
        return u + c + r + U;
      }
      if (NcAsked === 1) {
        const u =     q *     Nu/S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1)/S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *            this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const C = 2 * q / S;
        return u + c + r + C;
      }
    } else { // This section has been verified
      if (NrAsked === 1) return p / Nr;
      if (NcAsked === 1) {
        const R = 2 * p      / S * ( 1 + 2*(Nc-1)/S2 +     Nu/S1 + 4*(Nc-1)*(Nc-2)/S2/S4 + 2*(Nc-1)*    Nu/S3*(1/S1+1/S2) +     Nu*(Nu-1)/S1/S2 );
        const U = 2 * q * Nu/S/S1* ( 1 + 2*(Nc-1)/S3 + (Nu-1)/S2 + 4*(Nc-1)*(Nc-2)/S3/S5 + 2*(Nc-1)*(Nu-1)/S4*(1/S2+1/S3) + (Nu-1)*(Nu-2)/S2/S3 );
        const C = 4*q*(Nc-1)/S/S2* ( 1 + 2*(Nc-2)/S4 +     Nu/S3 + 4*(Nc-2)*(Nc-3)/S4/S6 + 2*(Nc-2)*    Nu/S5*(1/S3+1/S4) +     Nu*(Nu-1)/S3/S4 );
        return 2*q/S + R + U + C; 
      }
      if (NuAsked === 1) {
        const R = 1 * p       / S* ( 1 +     2*Nc/S2 + (Nu-1)/S1 + 4*    Nc*(Nc-1)/S2/S4 + 2*    Nc*(Nu-1)/S3*(1/S1+1/S2) + (Nu-1)*(Nu-2)/S1/S2 );
        const U = q * (Nu-1)/S/S1* ( 1 +     2*Nc/S3 + (Nu-2)/S2 + 4*    Nc*(Nc-1)/S3/S5 + 2*    Nc*(Nu-2)/S4*(1/S2+1/S3) + (Nu-2)*(Nu-3)/S2/S3 );
        const C = 2 * q * Nc/S/S2* ( 1 + 2*(Nc-1)/S4 + (Nu-1)/S3 + 4*(Nc-1)*(Nc-2)/S4/S6 + 2*(Nc-1)*(Nu-1)/S5*(1/S3+1/S4) + (Nu-1)*(Nu-2)/S3/S4 );
        return q/S + R + U + C; 
      }
    }
    return 0;

  },

  /**
   * 4-slots available, 2-selected
   * Returns probability of getting the selection made
   */
  calc4_2: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { 
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const S5 = S - 5;
    const S6 = S - 6;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p3 = (Nr < 4) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    const q3 = 1 - p3;
    
    if (upgrade === 3) {
      if (NrAsked === 2) {
        const u =     q *     Nu / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-2) /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const R =     p /Nr * this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + R;
      }
      if (NuAsked === 2) {
        const u =     q * (Nu-2) / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p              * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const U =     q /S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        return r + u + c + U;
      }
      if (NcAsked === 2) {
        const u =     q *     Nu / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-2) / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p              * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const C = 2 * q / S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        return r + u + c + C;
      }
      if (NrAsked === 1 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1) /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U = 2 * q / S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const R =     p /Nr * this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + U + R;
      }
      if (NrAsked === 1 && NcAsked === 1) {
        const u =     q *     Nu / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1) /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const C = 2 * q / S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        const R =     p /Nr * this.calc3_1(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + C + R;
      }
      if (NuAsked === 1 && NcAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U =     q / S * this.calc3_1(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const C = 2 * q / S * this.calc3_1(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        return r + u + c + U + C;
      }
    } else {
      if (NuAsked === 2) {
        const u =     q * (Nu-2) / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_2(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const U = 2 * q / S * this.calc3_1(Nr, Nu-1, Nc, 0, NrAsked, NuAsked-1, NcAsked);
        return u + c + r + U;
      }
      if (NcAsked === 2) {
        const u =     q *     Nu / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-2) / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_2(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const C = 4 * q / S * this.calc3_1(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked-1);
        return u + c + r + C;
      }
      if (NcAsked === 1 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_2(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const C = 2 * q / S * this.calc3_1(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked-1);
	const U =     q / S * this.calc3_1(Nr, Nu-1, Nc, 0, NrAsked, NuAsked-1, NcAsked);
        return u + c + r + C + U;
      }
      if (NrAsked === 1) {
        return p / Nr * this.calc3_1(Nr-1, Nu, Nc, 0, NrAsked-1, NuAsked, NcAsked);
      }
    }
    return 0;
  },


  /**
   * 4-slots available, 3-selected
   * Returns probability of getting the selection made
   */
  calc4_3: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { 
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const S5 = S - 5;
    const S6 = S - 6;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p3 = (Nr < 4) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    const q3 = 1 - p3;
    
    if (upgrade === 3) {
      if (NrAsked === 3) return 6 * p * p1 * p2 / Nr / (Nr-1) / (Nr-2) * (1 + q + q1 + q2);
      if (NuAsked === 3) {
        const u =     q * (Nu-3) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U = 3 * q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        return r + u + c + U;
      }
      if (NcAsked === 3) {
        const u =     q *     Nu / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-3) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const C = 6 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        return r + u + c + C;
      }
      if (NrAsked === 2 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-2) /Nr * this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U = 2 * q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const R =     p /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + U + R;
      }
      if (NrAsked === 2 && NcAsked === 1) {
        const u =     q *     Nu / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-2) /Nr * this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const C = 2 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        const R =     p /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + C + R;
      }
      if (NcAsked === 2 && NrAsked === 1) {
        const u =     q *     Nu / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-2) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1) /Nr * this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const C = 2 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        const R =     p /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + C + R;
      }
      if (NuAsked === 2 && NrAsked === 1) {
        const u =     q * (Nu-2) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1) /Nr * this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U = 2 * q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const R =     p /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return r + u + c + U + R;
      }
      if (NuAsked === 2 && NcAsked === 1) {
        const u =     q * (Nu-2) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U = 2 * q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const C = 2 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        return r + u + c + U + C;
      }
      if (NcAsked === 2 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-2) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U =     q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
        const C = 4 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
        return r + u + c + U + C;
      }
      if (NcAsked === 1 && NrAsked === 1 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_3(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_3(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked);
        const r =     p * (Nr-1) /Nr * this.calc3_3(Nr-1, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
	const U =     q / S * this.calc3_2(Nr, Nu-1, Nc, upgrade, NrAsked, NuAsked-1, NcAsked);
	const C = 2 * q / S * this.calc3_2(Nr, Nu, Nc-1, upgrade, NrAsked, NuAsked, NcAsked-1);
	const R =     p /Nr * this.calc3_2(Nr-1, Nu, Nc, upgrade, NrAsked-1, NuAsked, NcAsked);
        return u + c + r + U + C + R;
      }
    } else {
      if (NuAsked === 3) {
        const u =     q * (Nu-3) / S * this.calc3_3(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q *     Nc / S * this.calc3_3(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const U = 3 * q / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked-1, NcAsked);
        return u + c + r + U;
      }
      if (NcAsked === 3) {
        const u =     q *     Nu / S * this.calc3_3(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-3) / S * this.calc3_3(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const C = 6 * q / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked-1);
        return u + c + r + C;
      }
      if (NcAsked === 2 && NuAsked === 1) {
        const u =     q * (Nu-1) / S * this.calc3_3(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-2) / S * this.calc3_3(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const C = 4 * q / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked-1);
	const U =     q / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked-1, NcAsked);
        return u + c + r + C + U;
      }
      if (NuAsked === 2 && NcAsked === 1) {
        const u =     q * (Nu-2) / S * this.calc3_3(Nr, Nu-1, Nc, 0, NrAsked, NuAsked, NcAsked);
        const c = 2 * q * (Nc-1) / S * this.calc3_3(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked);
        const r =     p *              this.calc3_3(Nr-1, Nu, Nc, 0, NrAsked, NuAsked, NcAsked);
	const C = 2 * q / S * this.calc3_2(Nr, Nu, Nc-1, 0, NrAsked, NuAsked, NcAsked-1);
	const U = 2 * q / S * this.calc3_2(Nr, Nu-1, Nc, 0, NrAsked, NuAsked-1, NcAsked);
        return u + c + r + C + U;
      }
      if (NrAsked === 1) {
        return p / Nr * this.calc3_2(Nr-1, Nu, Nc, 0, NrAsked-1, NuAsked, NcAsked);
      }
    }
    return 0;
  },

  /**
   * 4-slots available, 4-selected
   * Returns probability of getting the selection made
   */
  calc4_4: function(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked) { // This function has been demonstrated to be true
    const S = this.getPoolSize(Nc, Nu);
    const S1 = S - 1;
    const S2 = S - 2;
    const S3 = S - 3;
    const S4 = S - 4;
    const S5 = S - 5;
    const S6 = S - 6;
    const p = (Nr < 1) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p1 = (Nr < 2) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p2 = (Nr < 3) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const p3 = (Nr < 4) ? 0 : this.UPGRADE_CONFIG[upgrade].p;
    const q = 1 - p;
    const q1 = 1 - p1;
    const q2 = 1 - p2;
    const q3 = 1 - p3;
    
    if (upgrade === 3) {
      if (NrAsked === 4) return 24 * p * p1 * p2 * p3 / Nr / (Nr-1) / (Nr-2) / (Nr-3);
      if (NuAsked === 4) return 24 * q * q * q * q / S / S1 / S2 / S3;
      if (NcAsked === 4) return 24 * 16 * q * q * q * q / S / S2 / S4 / S6;
      if (NrAsked === 3 && NuAsked === 1) return 6 * p * p1 * p2 / Nr / (Nr-1) / (Nr-2) / S * (q + q1 + q2 + q3);
      if (NrAsked === 3 && NcAsked === 1) return 2 * 6 * p * p1 * p2 / Nr / (Nr-1) / (Nr-2) / S * (q + q1 + q2 + q3);
      if (NcAsked === 3 && NuAsked === 1) return 48 * q * q * q * q / S * (1/S1/S3/S5 + 1/S2/S3/S5 + 1/S2/S4/S5 + 1/S2/S4/S6);//
      if (NcAsked === 3 && NrAsked === 1) return 48 * p / Nr / S / S2 / S4 * (q1*q1*q1 + q*q1*q1 + q*q*q1 + q*q*q);
      if (NuAsked === 3 && NcAsked === 1) return 12 * q * q * q * q / S * (1/S2/S3/S4 + 1/S1/S3/S4 + 1/S1/S2/S4 + 1/S1/S2/S3);//
      if (NuAsked === 3 && NrAsked === 1) return 6 * p / Nr / S / S1 / S2 * (q1*q1*q1 + q*q1*q1 + q*q*q1 + q*q*q);
      if (NrAsked === 2 && NcAsked === 2) return 16 * p * p1 / Nr / (Nr - 1) / S / S2 * (q*q + q*q1 + q*q2 + q1*q1 + q1*q2 + q2*q);
      if (NrAsked === 2 && NuAsked === 2) return 4 * p * p1 / Nr / (Nr - 1) / S / S1 * (q*q + q*q1 + q*q2 + q1*q1 + q1*q2 + q2*q);
      if (NcAsked === 2 && NuAsked === 2) return 16 * q * q * q * q / S * (1/S2/S3/S5 + 1/S2/S3/S4 + 1/S2/S4/S5 + 1/S1/S2/S4 + 1/S1/S3/S4 + 1/S1/S3/S5);//
      if (NrAsked === 2 && NuAsked === 1 && NcAsked === 1) {
        return 4 * p * p1 / Nr / (Nr-1) / S * ( q/S2*(q+q1+q2) + q/S1*(q+q1+q2) + q2*q2*(1/S1+1/S2) + q1*(q1+q2)*(1/S1+1/S1) );
      }
      if (NuAsked === 2 && NcAsked === 1 && NrAsked === 1) {
        return 4 * p / Nr / S * (q1*q1*q1 + q*q1*q1 + q*q*q1 + q*q*q) * (1/S2/S3 + 1/S1/S3 + 1/S1/S2);
      }
      if (NcAsked === 2 && NrAsked === 1 && NuAsked === 1) {
        return 8 * p / Nr / S * (q1*q1*q1 + q*q1*q1 + q*q*q1 + q*q*q) * (1/S1/S3 + 1/S2/S3 + 1/S2/S4);
      }
    } else {
      if (NuAsked === 4) return 24 * q / S / S1 / S2 / S3;
      if (NcAsked === 4) return 24 * 16 * q / S / S2 / S4 / S6;
      if (NcAsked === 3 && NuAsked === 1) return 48 * q / S * (1/S1/S3/S5 + 1/S2/S3/S5 + 1/S2/S4/S5 + 1/S2/S4/S6);
      if (NuAsked === 3 && NcAsked === 1) return 12 * q / S * (1/S2/S3/S4 + 1/S1/S3/S4 + 1/S1/S2/S4 + 1/S1/S2/S3);
      if (NcAsked === 3 && NrAsked === 1) return 48 * p / Nr / S / S2 / S4;
      if (NuAsked === 3 && NrAsked === 1) return 6 * p / Nr / S / S1 / S2;
      if (NcAsked === 2 && NuAsked === 2) return 16 * q / S * (1/S2/S3/S5 + 1/S2/S3/S4 + 1/S2/S4/S5 + 1/S1/S2/S4 + 1/S1/S3/S4 + 1/S1/S3/S5);
      if (NuAsked === 2 && NcAsked === 1 && NrAsked === 1) {
        return 4 * p / Nr / S * (1/S2/S3 + 1/S1/S3 + 1/S1/S2);
      }
      if (NcAsked === 2 && NrAsked === 1 && NuAsked === 1) {
        return 8 * p / Nr / S * (1/S1/S3 + 1/S2/S3 + 1/S2/S4);
      }
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
      case '4-1':
        return this.calc4_1(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '4-2':
        return this.calc4_2(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '4-3':
        return this.calc4_3(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      case '4-4':
        return this.calc4_4(Nr, Nu, Nc, upgrade, NrAsked, NuAsked, NcAsked);
      default:
        throw new Error(`Formula not implemented yet: ${slotsAvailable} slots, ${slotsSelected} selected`);
    }
  }
};
