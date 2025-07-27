import * as z from 'zod';

export const TeacherFormSchema = z.object({
    qualification: z.string().optional(),
    experience_years: z.coerce.number().optional(),
    specializations: z.array(z.string()).optional(),
    teaching_style: z.string().optional(),
    ielts_band_score: z.coerce.number().optional(),
    hourly_rate: z.coerce.number().optional(),
})