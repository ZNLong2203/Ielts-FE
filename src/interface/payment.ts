/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ICreatePaymentDto {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  description?: string;
}

export interface IPaymentCreateResponse {
  paymentId: string;
  provider: 'stripe' | 'zalopay';
  checkoutUrl: string;
  raw?: any;
}

export interface IPaymentRecord {
  id: string;
  order_id: string;
  transaction_id?: string;
  gateway_response?: any;
}

export interface IPaymentForProcessing {
  id: string;
  order_id: string;
}

export interface IStripeCheckoutSession {
  amountMajor: number;
  currency: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  description?: string;
}

export interface IZaloPayOrder {
  amount: number;
  orderId: string;
  description?: string;
  returnUrl: string;
}

export interface IZaloPayResponse {
  appTransId: string;
  respData?: {
    return_code: number;
    return_message: string;
    order_url: string;
    zp_trans_token: string;
  };
}

export interface IZaloPayCallback {
  data: string;
  mac: string;
}

export interface IZaloPayCallbackDto {
  data: string;
  mac: string;
}

export interface IZaloPayCallbackData {
  app_trans_id: string;
  zp_trans_id: number;
  app_id: number;
}

export interface IZaloPayVerificationResult {
  valid: boolean;
  reason?: string;
  data?: IZaloPayCallbackData;
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  ZALOPAY = 'zalopay'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface IPayment {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_response?: any;
  processed_at?: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPayments {
  data: IPayment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
