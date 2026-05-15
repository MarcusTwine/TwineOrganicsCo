export type TriggerKey = 'ORDER_PAID' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'CUSTOMER_WELCOME'

export type TriggerMeta = {
  label: string
  description: string
  variables: string[]
  icon: string
}

export const TRIGGER_META: Record<TriggerKey, TriggerMeta> = {
  ORDER_PAID: {
    label: 'Order Paid',
    description: 'Fires when a customer\'s payment is confirmed.',
    variables: ['customer_name', 'order_id', 'order_total', 'order_link'],
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  ORDER_SHIPPED: {
    label: 'Order Shipped',
    description: 'Fires when an admin marks an order as shipped.',
    variables: ['customer_name', 'order_id', 'order_link'],
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
  ORDER_DELIVERED: {
    label: 'Order Delivered',
    description: 'Fires when an admin marks an order as delivered.',
    variables: ['customer_name', 'order_id', 'order_link'],
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  ORDER_CANCELLED: {
    label: 'Order Cancelled',
    description: 'Fires when an order is cancelled.',
    variables: ['customer_name', 'order_id'],
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  CUSTOMER_WELCOME: {
    label: 'Welcome Email',
    description: 'Fires when a new customer creates an account.',
    variables: ['customer_name'],
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
}

export const ALL_VARIABLES = [
  'customer_name',
  'order_id',
  'order_total',
  'order_link',
  'site_name',
  'site_url',
]

export const TRIGGER_KEYS = Object.keys(TRIGGER_META) as TriggerKey[]
