export interface NVIMegye {
    leiro: {
        maz: string;
        nev: string;
    };
}

export interface NVITelepules {
    leiro: {
        maz: string;
        taz: string;
        megnev: string;
    };
}

export interface NVIOevk {
    maz: string;
    evk: string;
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
    ej_id?: number;
    szj?: number;
    neve: string;
    maz: string;
    evk: string;
    allapot: string;
    jelolo_szervezetek?: number[];
    jlcs_nev?: string;
    fenykep?: number;
    allapot_valt?: string;
}

export interface NVISzervezet {
    szkod: number;
    nev: string;
    r_nev: string;
    emblema?: number;
}

export interface NVIListData {
    list: any[]; // Specific list types can be added later as needed
}
