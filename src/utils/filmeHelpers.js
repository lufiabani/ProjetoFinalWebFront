// Funções utilitárias compartilhadas entre componentes de filmes.

/** Extrai ano (4 dígitos) de uma data em formato ISO ou string. */
export function extrairAno(dataLancamento) {
  if (!dataLancamento) return null;
  const s = String(dataLancamento);
  const y = s.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

/** Formata número de votos TMDB para exibição compacta (ex: 1.5k, 2M). */
export function formatarVotosTmdb(total) {
  if (total == null || Number.isNaN(Number(total))) return null;
  const n = Number(total);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
