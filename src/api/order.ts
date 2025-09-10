import api from "@/utils/interceptor";
import { 
  IOrder, 
  IOrderCreate, 
  IOrders, 
  IOrderUpdate, 
  IRetryPayment
} from "@/interface/order";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Create order from combo
export const createOrder = async (data: IOrderCreate) => {
  const response = await api.post(`${BASE_URL}/orders`, data);
  console.log("Create order response:", response);
  return response.data;
};

// List orders (with pagination and filters)
export const getOrders = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  payment_status?: string;
  search?: string;
  user_id?: string;
  order_code?: string;
}): Promise<IOrders> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.order_code) queryParams.append('order_code', params.order_code);

  const response = await api.get(`${BASE_URL}/orders?${queryParams.toString()}`);
  console.log("List orders response:", response);
  return response.data;
};

// Get order details
export const getOrder = async (id: string): Promise<IOrder> => {
  const response = await api.get(`${BASE_URL}/orders/${id}`);
  console.log("Get order response:", response);
  return response.data.data;
};

// Cancel order
export const cancelOrder = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/orders/${id}/cancel`);
  console.log("Cancel order response:", response);
  return response.data;
};

// Update order status (admin)
export const updateOrderStatus = async (id: string, data: IOrderUpdate) => {
  const response = await api.patch(`${BASE_URL}/orders/${id}/status`, data);
  console.log("Update order status response:", response);
  return response.data;
};

// Soft delete order
export const deleteOrder = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/orders/${id}`);
  console.log("Delete order response:", response);
  return response.data;
};

// Retry payment for order
export const retryPayment = async (id: string, data: IRetryPayment) => {
  const response = await api.post(`${BASE_URL}/orders/${id}/retry-payment`, data);
  console.log("Retry payment response:", response);
  return response.data;
};
