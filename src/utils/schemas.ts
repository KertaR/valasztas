import { z } from 'zod';

export const nviMegyeSchema = z.object({
    leiro: z.object({
        maz: z.string(),
        nev: z.string()
    })
});

export const nviTelepulesSchema = z.object({
    leiro: z.object({
        maz: z.string(),
        taz: z.string(),
        megnev: z.string()
    })
});

export const nviOevkSchema = z.object({
    maz: z.string(),
    evk: z.string(),
    evk_nev: z.string(),
    maz_nev: z.string().optional(),
    letszam: z.object({
        indulo: z.number(),
        kuvi: z.number().optional(),
        kulkep: z.number().optional(),
        atjel: z.number().optional(),
        atjelentkezo: z.number().optional(),
        atjelInnen: z.number().optional()
    }).optional()
});

export const nviJeloltSchema = z.object({
    ej_id: z.number().optional(),
    szj: z.number().optional(),
    neve: z.string(),
    maz: z.string(),
    evk: z.string(),
    allapot: z.string(),
    jelolo_szervezetek: z.array(z.number()).optional(),
    jlcs_nev: z.string().optional(),
    fenykep: z.number().optional(),
    allapot_valt: z.string().optional()
});

export const nviSzervezetSchema = z.object({
    szkod: z.number(),
    nev: z.string(),
    r_nev: z.string(),
    emblema: z.number().optional()
});

export const nviListResponseSchema = z.object({
    list: z.array(z.any()).nullable()
});

export const nviPoligonSchema = z.object({
    maz: z.string(),
    evk: z.string(),
    poligon: z.string()
});

export const nviPoligonResponseSchema = z.union([
    z.object({ type: z.literal('FeatureCollection'), features: z.array(z.any()) }),
    z.object({ list: z.array(nviPoligonSchema) })
]);
