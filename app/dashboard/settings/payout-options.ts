export const MOBILE_MONEY_PROVIDERS = ['MTN', 'Telecel Cash', 'AirtelTigo Money'] as const

export const BANK_PROVIDERS = [
  'Absa Bank',
  'Access Bank',
  'Agricultural Development Bank',
  'Cal Bank',
  'Consolidated Bank Ghana',
  'Ecobank',
  'Fidelity Bank',
  'First Atlantic Bank',
  'First National Bank',
  'GCB Bank',
  'GT Bank',
  'NIB Bank',
  'OmniBSIC Bank',
  'Prudential Bank',
  'Republic Bank',
  'Societe Generale',
  'Stanbic Bank',
  'Standard Chartered',
  'UBA',
  'Universal Merchant Bank',
  'Zenith Bank',
] as const

export type PayoutMethod = 'mobile_money' | 'bank_transfer'
