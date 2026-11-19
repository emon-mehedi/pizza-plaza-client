export interface IUser {
  name: string
  email: string
  image:string
  role: "vendor" | "customer" | "admin"
  isBlocked: boolean
  businessName?: string //vendor only
  subscriptionPlan: "free" | "premium",
  subscriptionExpiresAt?: string
}

export interface IMenuItem {
  vendorId: string //ref: users
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string
  status: "pending" | "approved" | "rejected" | "inactive"
  createdAt: string
}

export interface IOrders {
  itemId: string //ref: menuItems
  vendorId: string //ref: users
  customerId: string //ref: users
  deliveryDate: string
  deliveryAddress: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  createdAt: string
}

export interface ITransactions {
  vendorId: string //ref: users 
  plan: string
  amount: number
  currency: string
  stripeSessionId: string
  stripeSubscriptionId: string
  status: string
  createdAt: string
}