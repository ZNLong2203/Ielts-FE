export interface ICoupon {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  minimum_amount: number;
  maximum_discount: number;
  usage_limit: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  applicable_combos: string[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICouponCreate {
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  minimum_amount: number;
  maximum_discount: number;
  usage_limit: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  applicable_combos: string[];
}

export interface ICouponUpdate {
  id: string;
  code?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  valid_from?: Date;
  valid_until?: Date;
  is_active?: boolean;
  applicable_combos?: string[];
}

export interface ICoupons {
  meta: {
    current: number;
    currentSize: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: ICoupon[];
}

