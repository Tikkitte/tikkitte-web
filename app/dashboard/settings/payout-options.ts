export const MOBILE_MONEY_PROVIDERS = ['MTN', 'Vodafone Cash', 'AirtelTigo Money'] as const

export const BANK_PROVIDERS = [
  'Absa Bank',
  'Access Bank',
  'Cal Bank',
  'Ecobank',
  'FBN Bank',
  'Fidelity Bank',
  'First National Bank',
  'GCB Bank',
  'GT Bank',
  'NIB Bank',
  'Prudential Bank',
  'Republic Bank',
  'Societe Generale',
  'Stanbic Bank',
  'Standard Chartered',
  'UBA',
  'Zenith Bank',
] as const

export type PayoutMethod = 'mobile_money' | 'bank_transfer'
