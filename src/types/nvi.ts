export interface NVIMegye {
    leiro: {
        maz: string;
        nev: string;
    };
}

export interface NVITelepules {
    maz: string;
    tan: string;
    nev: string;
}

export interface NVIOevk {
    maz: string;
    evk: number;
    evk_nev: string;
    maz_nev?: string;
    letszam?: {
        indulo: number;
        kuvi?: number;
        kulkep?: number;
        atjel?: number;
        atjelentkezo?: number;
        atjelInnen?: number;
    };
}

export interface NVIJelolt {
    ej_id?: string;
    szj?: string;
    neve: string;
    maz: string;
    evk: string;
    allapot: string;
    jelolo_szervezetek?: string[];
    jlcs_nev?: string;
    fenykep?: string;
}

export interface NVISzervezet {
    szkod: string;
    nev: string;
    r_nev: string;
    emblema?: string;
}

export interface NVIListData {
    list: any[]; // Specific list types can be added later as needed
}
