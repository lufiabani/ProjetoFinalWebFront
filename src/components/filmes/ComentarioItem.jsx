// ComentarioItem.jsx — item individual de comentário com ações de editar/apagar.
import { Pencil, Trash2, Loader2 } from 'lucide-react';

function formatarData(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export default function ComentarioItem({
  comentario,
  editingId,
  textoEdicao,
  gravandoEdicao,
  onIniciarEdicao,
  onCancelarEdicao,
  onGuardarEdicao,
  onSetTextoEdicao,
  onSetApagarId,
}) {
  const isEditing = editingId === comentario.id;

  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-medium text-slate-800">{comentario.autorNome ?? 'Utilizador'}</span>
          <span className="mx-1.5 text-slate-400">·</span>
          <time className="text-xs text-slate-500" dateTime={comentario.criadoEm}>
            {formatarData(comentario.criadoEm)}
          </time>
          {comentario.editadoEm && comentario.editadoEm !== comentario.criadoEm ? (
            <span className="ml-1 text-xs text-slate-400">(editado)</span>
          ) : null}
        </div>
        {comentario.souAutor ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onIniciarEdicao(comentario)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-violet-600"
              aria-label="Editar comentário"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSetApagarId(comentario.id)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-red-600"
              aria-label="Apagar comentário"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={textoEdicao}
            onChange={(e) => onSetTextoEdicao(e.target.value)}
            rows={3}
            maxLength={8000}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={gravandoEdicao}
              onClick={onGuardarEdicao}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {gravandoEdicao ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Guardar
            </button>
            <button
              type="button"
              disabled={gravandoEdicao}
              onClick={onCancelarEdicao}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">{comentario.corpo}</p>
      )}
    </li>
  );
}
