export interface ICoupon {
  id: string;
  name: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: string;
  minimum_amount: string;
  maximum_discount: string;
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
  name: string;
  description: string;
  discount_type: string;
  discount_value: string;
  minimum_amount: string;
  maximum_discount: string;
  usage_limit: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  applicable_combos: string[];
}

export interface ICouponUpdate {
  code?: string;
  name?: string;
  description?: string;
  discount_type?: string;
  discount_value?: string;
  minimum_amount?: string;
  maximum_discount?: string;
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

