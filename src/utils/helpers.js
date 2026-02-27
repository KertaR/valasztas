export const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase();
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('hu-HU');
};

export const getImageUrl = (fenykep) => {
    if (!fenykep) return null;
    const strId = String(fenykep);
    const lastDigit = strId.slice(-1);
    const secondToLastDigit = strId.length > 1 ? strId.slice(-2, -1) : '0';
    const url = `vtr.valasztas.hu/ogy2026/kepek/${secondToLastDigit}/${lastDigit}/Kep-${fenykep}.JPG`;
    return `https://wsrv.nl/?url=${url}`;
};
