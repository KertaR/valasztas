import React from 'react';
import { Shield, Info, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LegalTab() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Jogi nyilatkozatok</h1>
                <p className="text-slate-600 dark:text-slate-400">Impresszum, Adatvédelmi tájékoztató és Felelősségkizárás</p>
            </div>

            <div className="space-y-6">
                {/* Impresszum */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Info className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Impresszum</h2>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <p><strong>A weboldal üzemeltetője:</strong> [Üzemeltető Neve / Cégneve]</p>
                        <p><strong>Székhely:</strong> [Székhely címe]</p>
                        <p><strong>Adószám:</strong> [Adószám, ha van]</p>
                        <p><strong>Kapcsolat:</strong> [Email cím]</p>
                        <p><strong>Tárhelyszolgáltató:</strong> [Tárhelyszolgáltató Neve], [Tárhelyszolgáltató Címe]</p>
                    </div>
                </section>

                {/* Adatvédelmi Tájékoztató */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Adatkezelési Tájékoztató</h2>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-4">
                        <p>A weboldal látogatása során a rendszer rögzítheti a felhasználók IP címét, böngészőjének típusát és a látogatás idejét statisztikai és biztonsági célokból. Jelen weboldal nem gyűjt célzottan személyes adatot, és nem ad át adatot harmadik félnek, kivéve ha ezt jogszabály kötelezővé teszi.</p>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">Sütik (Cookies) használata</h3>
                        <p>A weboldal a megfelelő működés és a felhasználói élmény javítása érdekében sütiket (cookie-kat) használ. A cookie-k kis méretű szöveges fájlok, amelyeket a böngésző ment el a felhasználó eszközén.</p>
                        <ul className="list-disc pl-5">
                            <li><strong>Feltétlenül szükséges sütik:</strong> Az oldal alapvető működéséhez kellenek (pl. a sötét mód beállításának megjegyzése vagy a süti hozzájárulás tárolása).</li>
                        </ul>
                        <p>A felhasználó a bongészője beállításaiban bármikor törölheti a sütiket, vagy tilthatja azok használatát.</p>
                    </div>
                </section>

                {/* Felelősségkizárás */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                            <Scale className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Felelősségkizárás</h2>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <p>A <strong>Választás '26</strong> felületén megjelenített adatok feldolgozása a <strong>Nemzeti Választási Iroda (NVI)</strong> hivatalos adatszolgáltatása (vtr.valasztas.hu) alapján történik.</p>
                        <p className="mt-2">Ez az alkalmazás egy <strong>független, tájékoztató jellegű, civil kezdeményezés</strong>, amely semmilyen módon nem áll kapcsolatban az állami szervekkel, a Nemzeti Választási Irodával vagy politikai pártokkal.</p>
                        <p className="mt-2">Bár mindent megteszünk az adatok pontosságáért, a weboldalon szereplő elemzések, ábrák és adatok helytállóságáért jogi felelősséget nem vállalunk. A hivatalos végeredmény mindig az NVI által közölt forrás!</p>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}
