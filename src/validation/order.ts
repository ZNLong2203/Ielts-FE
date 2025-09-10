import * as z from 'zod';

export const OrderCreateSchema = z.object({
    comboId: z.array(z.string()).min(1, "At least one combo must be selected"),
    couponId: z.string().optional(),
    paymentMethod: z.string().min(1, "Payment method is required"),
    notes: z.string().optional(),
})

export const OrderUpdateSchema = z.object({
    status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
    payment_method: z.string().optional(),
    payment_status: z.enum(["pending", "paid", "failed", "refunded", "completed"]).optional(),
    notes: z.string().optional(),
})