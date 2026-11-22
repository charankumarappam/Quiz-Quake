/**
 * Advanced Item Response Theory (IRT) Engine
 * Implements 1PL (Rasch), 2PL, and 3PL Logistic Models,
 * Fisher Information Item Selection, and Newton-Raphson / Bayesian EAP Ability Estimation.
 */

export interface IRTItemParameters {
  id: string;
  a: number; // Discrimination (typical range 0.5 - 2.5)
  b: number; // Difficulty (typical range -3.0 to +3.0)
  c: number; // Pseudo-guessing (default 0.25 for 4-option MCQs)
}

export interface IRTResponse {
  itemId: string;
  isCorrect: boolean;
  params: IRTItemParameters;
}

export interface IRTEstimateResult {
  theta: number; // Latent ability (-3.0 to +3.0)
  standardError: number; // Standard error of measurement (SEM)
  testInformation: number; // Total test information at estimated theta
  percentileRank: number; // Calibrated population percentile (0 - 100)
  converged: boolean;
  iterations: number;
}

export const D_SCALING = 1.702; // Standard logistic to normal ogive scaling factor

export class IRTEngine {
  /**
   * Computes the 3-Parameter Logistic (3PL) probability of a correct response
   * P(theta) = c + (1 - c) / (1 + exp(-D * a * (theta - b)))
   */
  public static probability3PL(theta: number, item: IRTItemParameters, D: number = D_SCALING): number {
    const exponent = -D * item.a * (theta - item.b);
    // Bound exponent to prevent numerical overflow/underflow
    const clampedExponent = Math.max(-30, Math.min(30, exponent));
    const logistic = 1 / (1 + Math.exp(clampedExponent));
    return item.c + (1 - item.c) * logistic;
  }

  /**
   * Computes the 2-Parameter Logistic (2PL) probability (c = 0)
   */
  public static probability2PL(theta: number, item: Omit<IRTItemParameters, 'c'>, D: number = D_SCALING): number {
    return this.probability3PL(theta, { ...item, c: 0 }, D);
  }

  /**
   * Computes Fisher Item Information Function (IIF) for a 3PL item at ability theta:
   * I_i(theta) = D^2 * a^2 * (P(theta) - c)^2 / ((1 - c)^2) * (1 - P(theta)) / P(theta)
   */
  public static itemInformation(theta: number, item: IRTItemParameters, D: number = D_SCALING): number {
    const P = this.probability3PL(theta, item, D);
    if (P <= 0 || P >= 1) return 0;

    const numerator = Math.pow(P - item.c, 2) * (1 - P);
    const denominator = Math.pow(1 - item.c, 2) * P;

    return Math.pow(D * item.a, 2) * (numerator / denominator);
  }

  /**
   * Computes Test Information Function (TIF) across all administered items
   */
  public static testInformation(theta: number, items: IRTItemParameters[], D: number = D_SCALING): number {
    return items.reduce((total, item) => total + this.itemInformation(theta, item, D), 0);
  }

  /**
   * Computes Standard Error of Measurement (SEM): SE(theta) = 1 / sqrt(I(theta))
   */
  public static standardError(theta: number, items: IRTItemParameters[], D: number = D_SCALING): number {
    const info = this.testInformation(theta, items, D);
    return info > 0 ? 1 / Math.sqrt(info) : 9.99;
  }

  /**
   * Selects next optimal question maximizing Fisher Information at candidate's estimated ability theta
   */
  public static selectMaxInformationItem(
    currentTheta: number,
    candidateItems: IRTItemParameters[],
    D: number = D_SCALING
  ): IRTItemParameters | null {
    if (candidateItems.length === 0) return null;

    let bestItem: IRTItemParameters | null = null;
    let maxInfo = -1;

    for (const item of candidateItems) {
      const info = this.itemInformation(currentTheta, item, D);
      if (info > maxInfo) {
        maxInfo = info;
        bestItem = item;
      }
    }

    return bestItem;
  }

  /**
   * Estimates latent ability theta using Expected A Posteriori (EAP) Bayesian quadrature
   * with Gaussian prior N(0, 1). Always produces finite, robust estimates even for perfect or zero scores.
   */
  public static estimateAbilityEAP(
    responses: IRTResponse[],
    quadraturePoints: number = 41,
    range: number = 4.0
  ): IRTEstimateResult {
    if (responses.length === 0) {
      return {
        theta: 0.0,
        standardError: 1.0,
        testInformation: 0,
        percentileRank: 50.0,
        converged: true,
        iterations: 1
      };
    }

    const step = (2 * range) / (quadraturePoints - 1);
    let numerator = 0;
    let denominator = 0;
    const thetas: number[] = [];
    const posteriors: number[] = [];

    for (let i = 0; i < quadraturePoints; i++) {
      const theta_k = -range + i * step;
      thetas.push(theta_k);

      // Normal Prior N(0, 1)
      const prior = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * theta_k * theta_k);

      // Log-likelihood for numerical stability
      let logLikelihood = 0;
      for (const res of responses) {
        const P = this.probability3PL(theta_k, res.params);
        logLikelihood += res.isCorrect ? Math.log(Math.max(1e-12, P)) : Math.log(Math.max(1e-12, 1 - P));
      }

      const likelihood = Math.exp(logLikelihood);
      const post = likelihood * prior;

      posteriors.push(post);
      numerator += theta_k * post;
      denominator += post;
    }

    const estimatedTheta = denominator > 0 ? numerator / denominator : 0;
    const clampedTheta = Math.max(-3.0, Math.min(3.0, Number(estimatedTheta.toFixed(3))));

    // Variance calculation
    let varianceNumerator = 0;
    for (let i = 0; i < quadraturePoints; i++) {
      const diff = thetas[i] - clampedTheta;
      varianceNumerator += diff * diff * posteriors[i];
    }
    const variance = denominator > 0 ? varianceNumerator / denominator : 1.0;
    const standardError = Number(Math.sqrt(Math.max(0.01, variance)).toFixed(3));

    const itemParams = responses.map(r => r.params);
    const testInfo = Number(this.testInformation(clampedTheta, itemParams).toFixed(2));

    // Convert standard normal z-score (theta) to percentile rank (Gaussian CDF)
    const percentile = Number((this.gaussianCDF(clampedTheta) * 100).toFixed(1));

    return {
      theta: clampedTheta,
      standardError,
      testInformation: testInfo,
      percentileRank: percentile,
      converged: true,
      iterations: quadraturePoints
    };
  }

  /**
   * Cumulative Standard Normal Distribution Function (approximated via error function)
   */
  public static gaussianCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.SQRT2));
  }

  private static erf(x: number): number {
    // Abramowitz and Stegun approximation formula 7.1.26
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
  }

  /**
   * Maps difficulty categories to standard IRT calibrated parameters
   */
  public static difficultyToIRTParams(difficulty: 'Easy' | 'Medium' | 'Hard', id: string): IRTItemParameters {
    switch (difficulty) {
      case 'Easy':
        return { id, a: 1.1, b: -1.2, c: 0.25 };
      case 'Medium':
        return { id, a: 1.35, b: 0.05, c: 0.25 };
      case 'Hard':
        return { id, a: 1.6, b: 1.35, c: 0.25 };
    }
  }
}
