export interface LoanSchedule {
  year: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  totalPayment: number;
  insuranceCost: number;
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

export function generateLoanSchedule(
  loanAmount: number,
  annualRate: number,
  durationYears: number,
  deferralMonths: number,
  insuranceRate: number
): LoanSchedule[] {
  const schedule: LoanSchedule[] = [];
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInsurance = (loanAmount * insuranceRate / 100) / 12;

  let remainingBalance = loanAmount;
  let currentMonth = 1;

  const totalMonths = durationYears * 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, durationYears);

  for (let year = 1; year <= durationYears; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearlyInsurance = 0;

    for (let month = 1; month <= 12 && currentMonth <= totalMonths; month++, currentMonth++) {
      const interestPayment = remainingBalance * monthlyRate;

      let principalPayment = 0;
      if (currentMonth > deferralMonths) {
        principalPayment = monthlyPayment - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
      }

      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;
      yearlyInsurance += monthlyInsurance;
    }

    schedule.push({
      year,
      principalPayment: yearlyPrincipal,
      interestPayment: yearlyInterest,
      remainingBalance,
      totalPayment: yearlyPrincipal + yearlyInterest,
      insuranceCost: yearlyInsurance,
    });
  }

  return schedule;
}

export function calculateDepreciation(
  value: number,
  duration: number,
  currentYear: number
): number {
  if (currentYear > duration) return 0;
  return value / duration;
}

export function calculateTaxIS(profit: number): number {
  if (profit <= 0) return 0;
  if (profit <= 42500) return profit * 0.15;
  return 42500 * 0.15 + (profit - 42500) * 0.25;
}

export function calculateTaxIR(
  profit: number,
  marginalRate: number,
  socialChargesRate: number = 17.2
): number {
  if (profit <= 0) return 0;
  const incomeTax = profit * (marginalRate / 100);
  const socialCharges = profit * (socialChargesRate / 100);
  return incomeTax + socialCharges;
}

export function calculateMicroFoncierTax(
  revenue: number,
  marginalRate: number,
  socialChargesRate: number = 17.2
): number {
  const abatement = 0.30;
  const taxableIncome = revenue * (1 - abatement);
  return calculateTaxIR(taxableIncome, marginalRate, socialChargesRate);
}

export function calculateMicroBICTax(
  revenue: number,
  marginalRate: number,
  socialChargesRate: number = 17.2,
  isGite: boolean = false
): number {
  const abatement = isGite ? 0.71 : 0.50;
  const taxableIncome = revenue * (1 - abatement);
  return calculateTaxIR(taxableIncome, marginalRate, socialChargesRate);
}

export function calculateDenormandieReduction(
  purchasePrice: number,
  worksAmount: number,
  commitmentYears: number
): number {
  const totalInvestment = purchasePrice + worksAmount;

  if (worksAmount < purchasePrice * 0.25) return 0;

  let rate = 0;
  if (commitmentYears === 6) rate = 0.12;
  else if (commitmentYears === 9) rate = 0.18;
  else if (commitmentYears === 12) rate = 0.21;

  const maxInvestment = 300000;
  const eligibleAmount = Math.min(totalInvestment, maxInvestment);

  return eligibleAmount * rate;
}

export function calculateMalrauxReduction(
  worksAmount: number,
  rate: number = 0.30
): number {
  const maxAmount = 400000;
  const eligibleAmount = Math.min(worksAmount, maxAmount);
  return eligibleAmount * rate;
}

export function calculateLocAvantagesReduction(
  annualRent: number,
  level: 'LOC1' | 'LOC2' | 'LOC3',
  withIntermediation: boolean = false
): number {
  let baseRate = 0;

  if (level === 'LOC1') baseRate = 0.15;
  else if (level === 'LOC2') baseRate = 0.35;
  else if (level === 'LOC3') baseRate = 0.50;

  if (withIntermediation) {
    baseRate += 0.15;
  }

  return annualRent * baseRate;
}

export function calculateDeficitFoncier(
  charges: number,
  interestExpense: number,
  revenue: number,
  hasEnergyWorks: boolean = false
): number {
  const maxDeficit = hasEnergyWorks ? 21400 : 10700;

  const nonInterestCharges = charges - interestExpense;
  const deficit = Math.max(0, nonInterestCharges - revenue);

  return Math.min(deficit, maxDeficit);
}

export interface YearlyResult {
  year: number;
  grossRevenue: number;
  effectiveRevenue: number;
  operatingCharges: number;
  financialCharges: number;
  depreciation: number;
  resultBeforeTax: number;
  taxAmount: number;
  netResult: number;
  capitalRepayment: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  loanBalance: number;
  grossYield: number;
  netYield: number;
}

export function calculateProjectFinancials(
  totalInvestment: number,
  annualRent: number,
  vacancyRate: number,
  operatingCharges: number,
  loanSchedule: LoanSchedule[],
  depreciableAssets: { value: number; duration: number }[],
  fiscalRegime: string,
  taxRate: number,
  socialChargesRate: number,
  rentGrowthRate: number,
  chargesInflationRate: number,
  years: number
): YearlyResult[] {
  const results: YearlyResult[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= years; year++) {
    const inflationFactor = Math.pow(1 + rentGrowthRate / 100, year - 1);
    const chargesInflationFactor = Math.pow(1 + chargesInflationRate / 100, year - 1);

    const grossRevenue = annualRent * inflationFactor;
    const effectiveRevenue = grossRevenue * (1 - vacancyRate / 100);
    const yearlyOperatingCharges = operatingCharges * chargesInflationFactor;

    const loanData = loanSchedule[year - 1] || {
      interestPayment: 0,
      principalPayment: 0,
      remainingBalance: 0,
      insuranceCost: 0,
    };

    const financialCharges = loanData.interestPayment + loanData.insuranceCost;

    let totalDepreciation = 0;
    for (const asset of depreciableAssets) {
      totalDepreciation += calculateDepreciation(asset.value, asset.duration, year);
    }

    let resultBeforeTax = effectiveRevenue - yearlyOperatingCharges - financialCharges;

    let taxAmount = 0;
    if (fiscalRegime === 'SCI_IS') {
      resultBeforeTax -= totalDepreciation;
      taxAmount = calculateTaxIS(resultBeforeTax);
    } else if (fiscalRegime === 'LMNP_REEL' || fiscalRegime === 'LMP') {
      resultBeforeTax -= totalDepreciation;
      taxAmount = calculateTaxIR(resultBeforeTax, taxRate, socialChargesRate);
    } else if (fiscalRegime === 'LOCATION_NUE_REEL' || fiscalRegime === 'SCI_IR') {
      taxAmount = calculateTaxIR(resultBeforeTax, taxRate, socialChargesRate);
    } else if (fiscalRegime === 'LOCATION_NUE_MICRO') {
      taxAmount = calculateMicroFoncierTax(effectiveRevenue, taxRate, socialChargesRate);
    } else if (fiscalRegime === 'LMNP_MICRO') {
      taxAmount = calculateMicroBICTax(effectiveRevenue, taxRate, socialChargesRate);
    }

    const netResult = resultBeforeTax - taxAmount;
    const cashFlow = netResult + totalDepreciation - loanData.principalPayment;
    cumulativeCashFlow += cashFlow;

    const grossYield = totalInvestment > 0 ? (grossRevenue / totalInvestment) * 100 : 0;
    const netYield = totalInvestment > 0 ? (netResult / totalInvestment) * 100 : 0;

    results.push({
      year,
      grossRevenue,
      effectiveRevenue,
      operatingCharges: yearlyOperatingCharges,
      financialCharges,
      depreciation: totalDepreciation,
      resultBeforeTax,
      taxAmount,
      netResult,
      capitalRepayment: loanData.principalPayment,
      cashFlow,
      cumulativeCashFlow,
      loanBalance: loanData.remainingBalance,
      grossYield,
      netYield,
    });
  }

  return results;
}
