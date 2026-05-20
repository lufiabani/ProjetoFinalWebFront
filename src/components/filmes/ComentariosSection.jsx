// ComentariosSection.jsx — lista de comentários + formulário de novo comentário.
import { MessageCircle, Loader2 } from 'lucide-react';
import ComentarioItem from './ComentarioItem';

const MAX_CORPO = 8000;

export default function ComentariosSection({
  comentarios,
  comentariosCarregando,
  textoNovo,
  setTextoNovo,
  enviando,
  onEnviar,
  editingId,
  textoEdicao,
  setTextoEdicao,
  gravandoEdicao,
  onIniciarEdicao,
  onCancelarEdicao,
  onGuardarEdicao,
  setApagarId,
}) {
  return (
    <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="comentarios-titulo">
      <h3
        id="comentarios-titulo"
        className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500"
      >
        <MessageCircle className="h-4 w-4" />
        Discussão
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Comentários visíveis para toda a comunidade com sessão iniciada.
      </p>

      {comentariosCarregando ? (
        <div className="mt-4 space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : comentarios.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Ainda não há comentários neste filme.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comentarios.map((c) => (
            <ComentarioItem
              key={c.id}
              comentario={c}
              editingId={editingId}
              textoEdicao={textoEdicao}
              gravandoEdicao={gravandoEdicao}
              onIniciarEdicao={onIniciarEdicao}
              onCancelarEdicao={onCancelarEdicao}
              onGuardarEdicao={onGuardarEdicao}
              onSetTextoEdicao={setTextoEdicao}
              onSetApagarId={setApagarId}
            />
          ))}
        </ul>
      )}

      <form onSubmit={onEnviar} className="mt-6 space-y-2">
        <label htmlFor="novo-comentario" className="sr-only">
          Novo comentário
        </label>
        <textarea
          id="novo-comentario"
          value={textoNovo}
          onChange={(e) => setTextoNovo(e.target.value)}
          placeholder="Escreva um comentário…"
          rows={3}
          maxLength={MAX_CORPO}
          disabled={enviando}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400">
            {textoNovo.length}/{MAX_CORPO}
          </span>
          <button
            type="submit"
            disabled={enviando || !textoNovo.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Publicar
          </button>
        </div>
      </form>
    </section>
  );
}
