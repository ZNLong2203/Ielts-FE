import * as z from 'zod';

export const CouponCreateSchema = z.object({
    code: z.string().min(1, "Coupon code is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    discount_type: z.string().min(1, "Discount type is required"),
    discount_value: z.number().min(0, "Discount value must be positive"),
    minimum_amount: z.number().min(0, "Minimum amount must be positive"),
    maximum_discount: z.number().min(0, "Maximum discount must be positive"),
    usage_limit: z.number().min(1, "Usage limit must be at least 1"),
    valid_from: z.date().min(new Date(), "Valid from date must be in the future"),
    valid_until: z.date(),
    is_active: z.boolean(),
    applicable_combos: z.array(z.string()),
}).refine((data) => data.valid_until > data.valid_from, {
    message: "Valid until date must be after valid from date",
    path: ["valid_until"],
})

export const CouponUpdateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    discount_type: z.string().optional(),
    discount_value: z.number().min(0, "Discount value must be positive").optional(),
    minimum_amount: z.number().min(0, "Minimum amount must be positive").optional(),
    maximum_discount: z.number().min(0, "Maximum discount must be positive").optional(),
    usage_limit: z.number().min(1, "Usage limit must be at least 1").optional(),
    valid_from: z.date().min(new Date(), "Valid from date must be in the future"),
    valid_until: z.date(),
    is_active: z.boolean().optional(),
    applicable_combos: z.array(z.string()),
}).refine((data) => data.valid_until > data.valid_from, {
    message: "Valid until date must be after valid from date",
    path: ["valid_until"],
})
