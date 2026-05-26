import { z } from 'zod';

// Zod schemas for each onboarding step

export const step1Schema = z.object({
    techs: z
        .array(
            z.object({
                id: z.number(),
                proficiency: z.number().int().min(1).max(5),
            })
        )
        .min(1, 'Debes seleccionar al menos una tecnología'),
});

export const step2Schema = z.object({
    bio: z.string().max(1000, 'La bio no puede exceder 1000 caracteres').nullable(),
});

export const step3Schema = z.object({
    avatar: z.instanceof(File).refine(
        (file) => {
            if (!file) return true; // optional
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            return validTypes.includes(file.type);
        },
        { message: 'El avatar debe ser una imagen (JPG, PNG o WEBP)' }
    ).nullable(),
});

export const step4Schema = z.object({
    join_requests: z.array(z.number()).nullable(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;

export function useOnboardingValidation() {
    return {
        step1: {
            schema: step1Schema,
            validate: (data: unknown) => step1Schema.safeParse(data),
        },
        step2: {
            schema: step2Schema,
            validate: (data: unknown) => step2Schema.safeParse(data),
        },
        step3: {
            schema: step3Schema,
            validate: (data: unknown) => step3Schema.safeParse(data),
        },
        step4: {
            schema: step4Schema,
            validate: (data: unknown) => step4Schema.safeParse(data),
        },
    };
}
