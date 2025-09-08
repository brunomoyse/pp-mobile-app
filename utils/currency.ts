export const currency = (n: number) => { return `${n.toLocaleString('fr-BE', { maximumFractionDigits: 0 })}€` }
export const currencyCents = (n: number) => { return currency(n / 100) }