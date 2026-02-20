const BASE = '/api/bridge'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Bridge API error ${res.status}`)
  }
  return res.json()
}

// ── KYC ──────────────────────────────────────────────────────────────

export function createKycLink({ fullName, email, type = 'individual' }) {
  return request('/v0/kyc_links', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      type,
      endorsements: ['base', 'cards'],
    }),
  })
}

export function getKycLinkStatus(kycLinkId) {
  return request(`/v0/kyc_links/${kycLinkId}`)
}

// ── Customers ────────────────────────────────────────────────────────

export function createCustomer(data) {
  return request('/v0/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getCustomer(customerId) {
  return request(`/v0/customers/${customerId}`)
}

// ── On-Ramp (Virtual Accounts) ───────────────────────────────────────

export function createVirtualAccount(customerId, { sourceCurrency, destCurrency, chain, toAddress }) {
  return request(`/v0/customers/${customerId}/virtual_accounts`, {
    method: 'POST',
    body: JSON.stringify({
      source_currency: sourceCurrency,
      destination_currency: destCurrency,
      destination_payment_rail: chain,
      destination_address: toAddress,
    }),
  })
}

// ── Off-Ramp (External Accounts + Liquidation Addresses) ─────────────

export function createExternalAccount(customerId, bankData) {
  return request(`/v0/customers/${customerId}/external_accounts`, {
    method: 'POST',
    body: JSON.stringify(bankData),
  })
}

export function createLiquidationAddress(customerId, { chain, currency, externalAccountId }) {
  return request(`/v0/customers/${customerId}/liquidation_addresses`, {
    method: 'POST',
    body: JSON.stringify({
      chain,
      currency,
      external_account_id: externalAccountId,
    }),
  })
}

// ── Winmo Card ───────────────────────────────────────────────────────

export function createCardAccount(customerId, { currency, chain, walletAddress }) {
  return request(`/v0/customers/${customerId}/card_accounts`, {
    method: 'POST',
    body: JSON.stringify({
      currency,
      chain,
      wallet_address: walletAddress,
    }),
  })
}

export function getCardAccount(customerId, cardAccountId) {
  return request(`/v0/customers/${customerId}/card_accounts/${cardAccountId}`)
}

export function freezeCard(customerId, cardAccountId) {
  return request(`/v0/customers/${customerId}/card_accounts/${cardAccountId}/freeze`, {
    method: 'POST',
  })
}

export function unfreezeCard(customerId, cardAccountId) {
  return request(`/v0/customers/${customerId}/card_accounts/${cardAccountId}/unfreeze`, {
    method: 'POST',
  })
}

export function getCardTransactions(customerId, cardAccountId) {
  return request(`/v0/customers/${customerId}/card_accounts/${cardAccountId}/transactions`)
}
