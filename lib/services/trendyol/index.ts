// Client & utils
export { testTrendyolConnection, TrendyolError, BASE_URL } from './client'

// Orders
export {
  getOrders,
  getOrdersStream,
  getPendingOrders,
  getTodaysOrders,
  getRecentOrders,
  mapTrendyolStatus,
  mapTrendyolOrder,
} from './orders'

// Shipment
export {
  updatePackageStatus,
  markAsShipped,
  markAsPicking,
  markAsInvoiced,
  cancelPackage,
  createLabel,
  getLabel,
  splitPackage,
  updateBoxInfo,
  changeCargoProvider,
} from './shipment'

// Products
export { updateStockAndPrice, getBatchResult, getProducts } from './products'

// Claims (İade)
export {
  getClaims,
  getClaimReasons,
  getClaimIssueReasons,
  approveClaim,
  rejectClaim,
} from './claims'

// Invoice (Fatura)
export { sendInvoiceLink, sendInvoiceFile, deleteInvoiceLink } from './invoice'

// Webhook
export {
  createWebhook,
  listWebhooks,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  processTrendyolWebhook,
} from './webhook'

// Types
export * from './types'
