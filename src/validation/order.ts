import * as z from 'zod';

export const OrderCreateSchema = z.object({
    comboId: z.string().min(1, "Combo ID is required"),
    couponId: z.string().min(1, "Coupon ID is required").optional(),
    paymentMethod: z.string().min(1, "Payment method is required"),
    notes: z.string().optional(),
})

export const OrderUpdateStatusSchema = z.object({
    status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
})