import api from "@/utils/interceptor";
import { 
  ICreatePaymentDto, 
  IPaymentCreateResponse,
  IPayment,
  IZaloPayCallbackDto
} from "@/interface/payment";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Create payment, return Stripe checkout URL or ZaloPay QR URL
export const createPayment = async (data: ICreatePaymentDto): Promise<IPaymentCreateResponse> => {
  const response = await api.post(`${BASE_URL}/payments/create`, data);
  console.log("Create payment response:", response);
  return response.data;
};

// Get payment by ID
export const getPayment = async (id: string): Promise<IPayment> => {
  const response = await api.get(`${BASE_URL}/payments/${id}`);
  console.log("Get payment response:", response);
  return response.data.data;
};

// Get payments with pagination and filters
export const getPayments = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  payment_method?: string;
  order_id?: string;
  transaction_id?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
  if (params?.order_id) queryParams.append('order_id', params.order_id);
  if (params?.transaction_id) queryParams.append('transaction_id', params.transaction_id);

  const response = await api.get(`${BASE_URL}/payments?${queryParams.toString()}`);
  console.log("Get payments response:", response);
  return response.data;
};

// Get payment by order ID
export const getPaymentByOrderId = async (orderId: string): Promise<IPayment> => {
  const response = await api.get(`${BASE_URL}/payments/order/${orderId}`);
  console.log("Get payment by order ID response:", response);
  return response.data.data;
};

// Stripe success callback (for frontend handling)
export const handleStripeSuccess = async (orderId: string, paymentId: string) => {
  const response = await api.get(`${BASE_URL}/payments/stripe/success`, {
    params: { orderId, paymentId }
  });
  console.log("Stripe success response:", response);
  return response.data;
};

// Stripe cancel callback (for frontend handling)
export const handleStripeCancel = async (orderId: string, paymentId: string) => {
  const response = await api.get(`${BASE_URL}/payments/stripe/cancel`, {
    params: { orderId, paymentId }
  });
  console.log("Stripe cancel response:", response);
  return response.data;
};

// Webhook endpoints
export const stripeWebhook = async (body: Buffer, signature: string) => {
  const response = await api.post(`${BASE_URL}/webhooks/stripe`, body, {
    headers: {
      'stripe-signature': signature,
      'Content-Type': 'application/octet-stream'
    }
  });
  console.log("Stripe webhook response:", response);
  return response.data;
};

export const zalopayWebhook = async (data: IZaloPayCallbackDto) => {
  const response = await api.post(`${BASE_URL}/webhooks/zalopay`, data);
  console.log("ZaloPay webhook response:", response);
  return response.data;
};
