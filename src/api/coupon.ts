import api from "@/utils/interceptor";
import {API_URL} from "@/constants/api";
import { ICoupon, ICouponCreate, ICouponUpdate, ICoupons, IValidateCouponResponse } from "@/interface/coupon";

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

export const getAvailableCoupons = async (comboIds: string[]): Promise<ICoupon[]> => {
  if (!comboIds || comboIds.length === 0) {
    console.log("[API] getAvailableCoupons: No comboIds provided");
    return [];
  }

  const params = new URLSearchParams();
  comboIds.forEach((id) => params.append("courseIds", id)); // Backend query param is "courseIds" but expects combo IDs

  const url = `${BASE_URL}${API_URL.COUPON}/available?${params.toString()}`;
  console.log("[API] getAvailableCoupons: Calling", url, "with comboIds:", comboIds);

  try {
    const response = await api.get(url);
    console.log("[API] getAvailableCoupons: Response", response.data);
    return (response.data?.data ?? response.data) as ICoupon[];
  } catch (error) {
    console.error("[API] getAvailableCoupons: Error", error);
    throw error;
  }
};

interface ValidateCouponPayload {
  code: string;
  combo_ids: string[];
  total_amount?: number;
}

export const validateCouponCode = async (
  payload: ValidateCouponPayload
): Promise<IValidateCouponResponse> => {
  const response = await api.post(
    `${BASE_URL}${API_URL.COUPON}/validate`,
    payload
  );

  return (response.data?.data ?? response.data) as IValidateCouponResponse;
};  
