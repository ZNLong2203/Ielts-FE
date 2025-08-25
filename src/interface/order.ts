/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IOrderItem {
  id: string;
  order_id: string;
  course_id?: string;
  course_title?: string;
  combo_id?: string;
  combo_name?: string;
  item_type: 'course' | 'combo';
  price: number;
  discount_amount: number;
  deleted: boolean;
  created_at: string;
  updated_at: string;
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

export interface ICouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  combo_id?: string;
  discount_amount: number;
  used_at: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface IOrder {
  id: string;
  user_id: string;
  order_code: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: OrderStatus;
  payment_method?: string;
  payment_status: PaymentStatus;
  notes?: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  order_items: IOrderItem[];
  payments?: IPayment[];
  coupon_usage?: ICouponUsage[];
}

export interface IOrders {
  data: IOrder[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface IOrderCreate {
  comboId: string;
  couponId?: string;
  paymentMethod: string;
  notes?: string;
}

export interface IOrderUpdate {
  status?: OrderStatus;
  payment_method?: string;
  payment_status?: PaymentStatus;
  notes?: string;
}

export interface IRetryPayment {
  method: string;
  description?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}
