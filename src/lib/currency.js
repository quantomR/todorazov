/** The ONLY place the EUR→BGN rate lives. */
export const EUR_TO_BGN = 1.95583;

export const eurToBgn = (eur) => Number(eur) * EUR_TO_BGN;

export const formatEur = (value) => `€${Number(value).toFixed(2)}`;

export const formatBgn = (value) => `${Number(value).toFixed(2)} лв.`;

/** BGN string derived from an EUR amount. */
export const formatEurAsBgn = (eur) => formatBgn(eurToBgn(eur));
