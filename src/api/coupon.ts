import api from "@/utils/interceptor";
import {API_URL} from "@/constants/api";
import { ICoupon, ICouponCreate, ICouponUpdate, ICoupons } from "@/interface/coupon";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getCoupons = async ({page}: {page: number}): Promise<ICoupons> => {
  const response = await api.get(`${BASE_URL}${API_URL.COUPON}`, {
    params: {
      page
    }
  });
  return response.data.data;
};

export const getCoupon = async (id: string): Promise<ICoupon> => {
  const response = await api.get(`${BASE_URL}${API_URL.COUPON}/${id}`);
  console.log(response)
  return response.data.data;
};

export const createCoupon = async (data: ICouponCreate): Promise<ICoupon> => {
  const response = await api.post(`${BASE_URL}${API_URL.COUPON}`, data);
  return response.data;
};

export const updateCoupon = async (id: string, data: ICouponUpdate): Promise<ICoupon> => {
  const response = await api.patch(`${BASE_URL}${API_URL.COUPON}/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${API_URL.COUPON}/${id}`);
};  
