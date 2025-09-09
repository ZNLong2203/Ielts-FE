import api from "@/utils/interceptor";
import { IZaloPayCallbackDto } from "@/interface/payment";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
