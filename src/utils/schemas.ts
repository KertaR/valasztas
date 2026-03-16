import { z } from 'zod';

export const nviMegyeSchema = z.object({
    leiro: z.object({
        maz: z.union([z.string(), z.number()]).transform(val => String(val)),
        nev: z.string()
    })
});

export const nviTelepulesSchema = z.object({
    leiro: z.object({
        maz: z.union([z.string(), z.number()]).transform(val => String(val)),
        taz: z.union([z.string(), z.number()]).transform(val => String(val)),
        megnev: z.string().optional(),
        nev: z.string().optional()
    })
});

export const nviOevkSchema = z.object({
    maz: z.union([z.string(), z.number()]).transform(val => String(val)),
    evk: z.union([z.string(), z.number()]).transform(val => String(val)),
    evk_nev: z.string(),
    maz_nev: z.string().optional(),
    letszam: z.object({
        indulo: z.number().optional().default(0),
        kuvi: z.number().optional().default(0),
        kulkep: z.number().optional().default(0),
        atjel: z.number().optional().default(0),
        atjelentkezo: z.number().optional().default(0),
        atjelInnen: z.number().optional().default(0)
    }).optional().default({
        indulo: 0,
        kuvi: 0,
        kulkep: 0,
        atjel: 0,
        atjelentkezo: 0,
        atjelInnen: 0
    })
});

export const nviJeloltSchema = z.object({
    ej_id: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
    szj: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
    neve: z.string().optional().default('Ismeretlen'),
    maz: z.union([z.string(), z.number()]).transform(val => String(val)),
    evk: z.union([z.string(), z.number()]).transform(val => String(val)),
    allapot: z.union([z.string(), z.number()]).transform(val => String(val)),
    jelolo_szervezetek: z.array(z.union([z.string(), z.number()]).transform(val => Number(val))).optional().default([]),
    jlcs_nev: z.string().optional(),
    fenykep: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? Number(val) : undefined),
    allapot_valt: z.string().optional()
});

export const nviSzervezetSchema = z.object({
    szkod: z.union([z.string(), z.number()]).transform(val => Number(val)),
    nev: z.string(),
    r_nev: z.string().optional().default(''),
    emblema: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined)
});

export const nviListResponseSchema = z.object({
    list: z.array(z.any()).nullable().optional().default([])
});

export const nviPoligonSchema = z.object({
    maz: z.union([z.string(), z.number()]).transform(val => String(val)),
    evk: z.union([z.string(), z.number()]).transform(val => String(val)),
    poligon: z.string()
});

export const nviPoligonResponseSchema = z.union([
    z.object({ type: z.literal('FeatureCollection'), features: z.array(z.any()) }),
    z.object({ list: z.array(nviPoligonSchema) })
]);
