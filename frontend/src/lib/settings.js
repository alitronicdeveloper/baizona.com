const SETTINGS_KEY = 'baizona_settings'

const DEFAULT_SETTINGS = {
  shopName: 'Baizona Hardware',
  shopAddress: 'Kariakoo, Dar es Salaam',
  shopPhone: '0712345678',
  shopEmail: '',
  receiptFooter: 'Asante kwa kununua! Karibu tena.',
  receiptPrefix: 'RCP',
}

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (err) {
    console.error('Settings read error:', err)
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (err) {
    console.error('Settings save error:', err)
    return false
  }
}

export function generateReceiptNumber() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = String(now.getHours()).padStart(2, '0') +
               String(now.getMinutes()).padStart(2, '0') +
               String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}-${time}`
}

export default { getSettings, saveSettings, generateReceiptNumber }
