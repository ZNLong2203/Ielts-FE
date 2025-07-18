import * as z from 'zod';

export const StudentFormSchema = z.object({
    bio: z.string().optional(),
    target_ielts_score: z.number().int().min(0).optional(),
    current_level: z.string().optional(),
    learning_goals: z.array(z.string()).optional(),
    timezone: z.string().optional(),
    language_preference: z.string().optional(),
});