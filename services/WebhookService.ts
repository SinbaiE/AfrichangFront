"use client"

interface WebhookEvent {
  id: string
  event: string
  data: any
  timestamp: string
  status: "pending" | "sent" | "failed" | "retrying"
  attempts: number
  maxAttempts: number
  nextRetry?: string
  endpoint: string
  headers?: Record<string, string>
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
  failureCount: number
}

class WebhookService {
  private endpoints: WebhookEndpoint[] = []
  private eventQueue: WebhookEvent[] = []
  private isProcessing = false

  // Gestion des endpoints
  async addEndpoint(url: string, events: string[], secret?: string): Promise<WebhookEndpoint> {
    const endpoint: WebhookEndpoint = {
      id: this.generateId(),
      url,
      events,
      secret: secret || this.generateSecret(),
      isActive: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
    }

    this.endpoints.push(endpoint)
    await this.saveEndpoints()
    return endpoint
  }

  async removeEndpoint(id: string): Promise<boolean> {
    const index = this.endpoints.findIndex((ep) => ep.id === id)
    if (index === -1) return false

    this.endpoints.splice(index, 1)
    await this.saveEndpoints()
    return true
  }

  async updateEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    const endpoint = this.endpoints.find((ep) => ep.id === id)
    if (!endpoint) return null

    Object.assign(endpoint, updates)
    await this.saveEndpoints()
    return endpoint
  }

  getEndpoints(): WebhookEndpoint[] {
    return this.endpoints
  }

  // Envoi d'événements
  async sendEvent(event: string, data: any): Promise<void> {
    const relevantEndpoints = this.endpoints.filter((ep) => ep.isActive && ep.events.includes(event))

    for (const endpoint of relevantEndpoints) {
      const webhookEvent: WebhookEvent = {
        id: this.generateId(),
        event,
        data,
        timestamp: new Date().toISOString(),
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        endpoint: endpoint.url,
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": this.generateSignature(data, endpoint.secret),
          "X-Webhook-Event": event,
          "X-Webhook-ID": this.generateId(),
        },
      }

      this.eventQueue.push(webhookEvent)
    }

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  // Traitement de la queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return

    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!
      await this.processEvent(event)
    }

    this.isProcessing = false
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    try {
      event.attempts++
      event.status = "pending"

      const response = await fetch(event.endpoint, {
        method: "POST",
        headers: event.headers || {},
        body: JSON.stringify({
          id: event.id,
          event: event.event,
          data: event.data,
          timestamp: event.timestamp,
        }),
      })

      if (response.ok) {
        event.status = "sent"
        this.updateEndpointSuccess(event.endpoint)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Webhook delivery failed:", error)
      event.status = "failed"
      this.updateEndpointFailure(event.endpoint)

      if (event.attempts < event.maxAttempts) {
        event.status = "retrying"
        event.nextRetry = new Date(Date.now() + this.getRetryDelay(event.attempts)).toISOString()

        // Programmer un retry
        setTimeout(() => {
          this.eventQueue.push(event)
          if (!this.isProcessing) {
            this.processQueue()
          }
        }, this.getRetryDelay(event.attempts))
      }
    }

    // Sauvegarder l'événement pour l'historique
    await this.saveEventLog(event)
  }

  // Événements prédéfinis AfriChange
  async sendUserRegistered(userData: any): Promise<void> {
    await this.sendEvent("user.registered", {
      userId: userData.id,
      email: userData.email,
      country: userData.country,
      registeredAt: userData.createdAt,
    })
  }

  async sendKYCStatusChanged(kycData: any): Promise<void> {
    await this.sendEvent("kyc.status_changed", {
      userId: kycData.userId,
      status: kycData.status,
      previousStatus: kycData.previousStatus,
      changedAt: new Date().toISOString(),
    })
  }

  async sendTransactionCompleted(transactionData: any): Promise<void> {
    await this.sendEvent("transaction.completed", {
      transactionId: transactionData.id,
      userId: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status,
      completedAt: transactionData.completedAt,
    })
  }

  async sendTransactionFailed(transactionData: any): Promise<void> {
    await this.sendEvent("transaction.failed", {
      transactionId: transactionData.id,
      userId: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      currency: transactionData.currency,
      failureReason: transactionData.failureReason,
      failedAt: new Date().toISOString(),
    })
  }

  async sendExchangeRateUpdated(rateData: any): Promise<void> {
    await this.sendEvent("exchange_rate.updated", {
      fromCurrency: rateData.from,
      toCurrency: rateData.to,
      rate: rateData.rate,
      previousRate: rateData.previousRate,
      updatedAt: new Date().toISOString(),
    })
  }

  async sendUserSuspended(userData: any): Promise<void> {
    await this.sendEvent("user.suspended", {
      userId: userData.id,
      reason: userData.suspensionReason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: userData.suspendedBy,
    })
  }

  // Utilitaires
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private generateSecret(): string {
    return Math.random().toString(36).substr(2, 32)
  }

  private generateSignature(data: any, secret: string): string {
    // Implémentation simplifiée - en production, utiliser HMAC-SHA256
    const payload = JSON.stringify(data)
    return `sha256=${btoa(payload + secret)}`
  }

  private getRetryDelay(attempt: number): number {
    // Backoff exponentiel: 1s, 2s, 4s
    return Math.pow(2, attempt - 1) * 1000
  }

  private updateEndpointSuccess(url: string): void {
    const endpoint = this.endpoints.find((ep) => ep.url === url)
    if (endpoint) {
      endpoint.lastUsed = new Date().toISOString()
      endpoint.failureCount = 0
    }
  }

  private updateEndpointFailure(url: string): void {
    const endpoint = this.endpoints.find((ep) => ep.url === url)
    if (endpoint) {
      endpoint.failureCount++
      if (endpoint.failureCount >= 10) {
        endpoint.isActive = false
      }
    }
  }

  private async saveEndpoints(): Promise<void> {
    try {
      // En production, sauvegarder en base de données
      localStorage.setItem("webhook_endpoints", JSON.stringify(this.endpoints))
    } catch (error) {
      console.error("Failed to save endpoints:", error)
    }
  }

  private async saveEventLog(event: WebhookEvent): Promise<void> {
    try {
      // En production, sauvegarder en base de données
      const logs = JSON.parse(localStorage.getItem("webhook_logs") || "[]")
      logs.push(event)

      // Garder seulement les 1000 derniers logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000)
      }

      localStorage.setItem("webhook_logs", JSON.stringify(logs))
    } catch (error) {
      console.error("Failed to save event log:", error)
    }
  }

  // Chargement initial
  async initialize(): Promise<void> {
    try {
      const saved = localStorage.getItem("webhook_endpoints")
      if (saved) {
        this.endpoints = JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load endpoints:", error)
    }
  }

  // Statistiques
  getEventLogs(): WebhookEvent[] {
    try {
      return JSON.parse(localStorage.getItem("webhook_logs") || "[]")
    } catch {
      return []
    }
  }

  getStats(): {
    totalEndpoints: number
    activeEndpoints: number
    totalEvents: number
    successfulEvents: number
    failedEvents: number
  } {
    const logs = this.getEventLogs()

    return {
      totalEndpoints: this.endpoints.length,
      activeEndpoints: this.endpoints.filter((ep) => ep.isActive).length,
      totalEvents: logs.length,
      successfulEvents: logs.filter((log) => log.status === "sent").length,
      failedEvents: logs.filter((log) => log.status === "failed").length,
    }
  }
}

export const webhookService = new WebhookService()

// Initialiser le service
webhookService.initialize()

export default WebhookService
