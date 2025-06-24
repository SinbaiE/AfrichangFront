// Service pour récupérer les taux de change gratuits
class ExchangeRateService {
  private baseUrl = "https://api.exchangerate-api.com/v4/latest" // API gratuite
  private fallbackUrl = "https://api.fixer.io/latest" // Backup gratuit (limité)
  private cache: Map<string, { rate: number; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Devises africaines principales avec leurs codes ISO
  private africanCurrencies = {
    XOF: { name: "Franc CFA BCEAO", countries: ["SN", "CI", "ML", "BF", "NE", "TG", "BJ", "GW"] },
    XAF: { name: "Franc CFA BEAC", countries: ["CM", "CF", "TD", "CG", "GQ", "GA"] },
    NGN: { name: "Naira", countries: ["NG"] },
    GHS: { name: "Cedi", countries: ["GH"] },
    KES: { name: "Shilling kenyan", countries: ["KE"] },
    UGX: { name: "Shilling ougandais", countries: ["UG"] },
    TZS: { name: "Shilling tanzanien", countries: ["TZ"] },
    RWF: { name: "Franc rwandais", countries: ["RW"] },
    ETB: { name: "Birr", countries: ["ET"] },
    ZAR: { name: "Rand", countries: ["ZA"] },
    EGP: { name: "Livre égyptienne", countries: ["EG"] },
    MAD: { name: "Dirham", countries: ["MA"] },
    TND: { name: "Dinar tunisien", countries: ["TN"] },
    DZD: { name: "Dinar algérien", countries: ["DZ"] },
  }

  async getExchangeRates(baseCurrency = "USD"): Promise<Record<string, number>> {
    try {
      // Vérifier le cache
      const cacheKey = `rates_${baseCurrency}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return this.getAfricanRates(cached.rate, baseCurrency)
      }

      // Récupérer depuis l'API principale
      let response = await fetch(`${this.baseUrl}/${baseCurrency}`)

      if (!response.ok) {
        // Essayer l'API de fallback
        response = await fetch(`${this.fallbackUrl}?base=${baseCurrency}`)
      }

      const data = await response.json()
      const rates = data.rates || {}

      // Mettre en cache
      this.cache.set(cacheKey, { rate: rates, timestamp: Date.now() })

      return this.getAfricanRates(rates, baseCurrency)
    } catch (error) {
      console.error("Erreur récupération taux:", error)
      return this.getFallbackRates(baseCurrency)
    }
  }

  private getAfricanRates(allRates: Record<string, number>, baseCurrency: string): Record<string, number> {
    const africanRates: Record<string, number> = {}

    // Extraire seulement les devises africaines
    Object.keys(this.africanCurrencies).forEach((currency) => {
      if (allRates[currency]) {
        africanRates[currency] = allRates[currency]
      }
    })

    // Ajouter USD et EUR comme références
    if (allRates.USD) africanRates.USD = allRates.USD
    if (allRates.EUR) africanRates.EUR = allRates.EUR

    return africanRates
  }

  private getFallbackRates(baseCurrency: string): Record<string, number> {
    // Taux de fallback approximatifs (à mettre à jour régulièrement)
    const fallbackRates: Record<string, number> = {
      XOF: baseCurrency === "USD" ? 580 : 1,
      XAF: baseCurrency === "USD" ? 580 : 1,
      NGN: baseCurrency === "USD" ? 750 : 1,
      GHS: baseCurrency === "USD" ? 12 : 1,
      KES: baseCurrency === "USD" ? 110 : 1,
      UGX: baseCurrency === "USD" ? 3700 : 1,
      ZAR: baseCurrency === "USD" ? 18 : 1,
      USD: baseCurrency === "USD" ? 1 : 0.85,
      EUR: baseCurrency === "USD" ? 0.85 : 1,
    }

    return fallbackRates
  }

  async getSpecificRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const rates = await this.getExchangeRates(fromCurrency)
      return rates[toCurrency] || 0
    } catch (error) {
      console.error(`Erreur taux ${fromCurrency} -> ${toCurrency}:`, error)
      return 0
    }
  }

  async getCrossRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      // Utiliser USD comme devise de base pour les conversions croisées
      const usdRates = await this.getExchangeRates("USD")
      const fromRate = usdRates[fromCurrency] || 1
      const toRate = usdRates[toCurrency] || 1

      return toRate / fromRate
    } catch (error) {
      console.error(`Erreur taux croisé ${fromCurrency} -> ${toCurrency}:`, error)
      return 0
    }
  }

  getAfricanCurrencies() {
    return this.africanCurrencies
  }

  // Calculer le spread (marge) pour AfriChange
  calculateSpread(rate: number, fromCurrency: string, toCurrency: string): number {
    // Spread variable selon les devises
    const baseSpread = 0.02 // 2% de base

    // Spread plus élevé pour les devises moins liquides
    const lowLiquidityCurrencies = ["RWF", "UGX", "TZS", "ETB"]
    const isLowLiquidity = lowLiquidityCurrencies.includes(fromCurrency) || lowLiquidityCurrencies.includes(toCurrency)

    const finalSpread = isLowLiquidity ? baseSpread * 1.5 : baseSpread
    return rate * (1 + finalSpread)
  }

  // Obtenir l'historique des taux (simulé)
  async getRateHistory(
    fromCurrency: string,
    toCurrency: string,
    days = 30,
  ): Promise<Array<{ date: string; rate: number }>> {
    const currentRate = await this.getSpecificRate(fromCurrency, toCurrency)
    const history = []

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Simulation de variation ±5%
      const variation = (Math.random() - 0.5) * 0.1
      const historicalRate = currentRate * (1 + variation)

      history.push({
        date: date.toISOString().split("T")[0],
        rate: Number.parseFloat(historicalRate.toFixed(4)),
      })
    }

    return history
  }
}

export const exchangeRateService = new ExchangeRateService()
