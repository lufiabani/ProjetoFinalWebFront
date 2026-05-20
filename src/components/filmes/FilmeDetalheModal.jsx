// FilmeDetalheModal.jsx — overlay com sinopse, favorito e CRUD de comentários (orquestra subcomponentes).
import { useCallback, useEffect, useState } from 'react';
import { X, Heart, Star } from 'lucide-react';
import { posterUrl } from '../../services/tmdb';
import {
  apagarComentario,
  criarComentario,
  editarComentario,
  listarComentariosPorFilme,
} from '../../services/comentariosService';
import { mensagemErroApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../ui/ConfirmDialog';
import ComentariosSection from './ComentariosSection';

const MAX_CORPO = 8000;

export default function FilmeDetalheModal({
  aberto,
  filme,
  favorito,
  onFechar,
  onToggleFavorito,
  // Opcional: notifica o feed (ex. comentários em destaque) sem re-fetch da página.
  onComentarioPublicado,
  onComentarioAtualizado,
  onComentarioApagado,
}) {
  const { success, error: toastError } = useToast();
  const [comentarios, setComentarios] = useState([]);
  const [comentariosCarregando, setComentariosCarregando] = useState(false);
  const [textoNovo, setTextoNovo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [gravandoEdicao, setGravandoEdicao] = useState(false);
  const [apagarId, setApagarId] = useState(null);
  const [apagando, setApagando] = useState(false);

  useEffect(() => {
    if (!aberto || !filme?.id) {
      setComentarios([]);
      setTextoNovo('');
      setEditingId(null);
      setTextoEdicao('');
      setApagarId(null);
      return;
    }

    let cancelado = false;
    (async () => {
      setComentariosCarregando(true);
      try {
        const lista = await listarComentariosPorFilme(filme.id);
        if (!cancelado) setComentarios(lista);
      } catch (e) {
        if (!cancelado) {
          setComentarios([]);
          toastError(mensagemErroApi(e, 'Não foi possível carregar os comentários.'));
        }
      } finally {
        if (!cancelado) setComentariosCarregando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [aberto, filme?.id, toastError]);

  const enviarComentario = useCallback(
    async (e) => {
      e.preventDefault();
      if (!filme?.id || enviando) return;
      const corpo = textoNovo.trim();
      if (!corpo) {
        toastError('Escreve algo antes de publicar.');
        return;
      }
      if (corpo.length > MAX_CORPO) {
        toastError(`O comentário tem no máximo ${MAX_CORPO} caracteres.`);
        return;
      }
      setEnviando(true);
      try {
        const novo = await criarComentario({ filmeId: filme.id, corpo });
        setComentarios((prev) => [novo, ...prev]);
        onComentarioPublicado?.(novo, filme);
        setTextoNovo('');
        success('Comentário publicado.');
      } catch (err) {
        toastError(mensagemErroApi(err, 'Não foi possível publicar o comentário.'));
      } finally {
        setEnviando(false);
      }
    },
    [filme, textoNovo, enviando, success, toastError, onComentarioPublicado],
  );

  const iniciarEdicao = useCallback((c) => {
    setEditingId(c.id);
    setTextoEdicao(c.corpo ?? '');
  }, []);

  const cancelarEdicao = useCallback(() => {
    setEditingId(null);
    setTextoEdicao('');
  }, []);

  const guardarEdicao = useCallback(async () => {
    if (editingId == null || gravandoEdicao) return;
    const corpo = textoEdicao.trim();
    if (!corpo) {
      toastError('O comentário não pode ficar vazio.');
      return;
    }
    if (corpo.length > MAX_CORPO) {
      toastError(`O comentário tem no máximo ${MAX_CORPO} caracteres.`);
      return;
    }
    setGravandoEdicao(true);
    try {
      const atualizado = await editarComentario(editingId, corpo);
      setComentarios((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...atualizado } : c)),
      );
      onComentarioAtualizado?.(atualizado);
      cancelarEdicao();
      success('Comentário atualizado.');
    } catch (err) {
      toastError(mensagemErroApi(err, 'Não foi possível guardar.'));
    } finally {
      setGravandoEdicao(false);
    }
  }, [editingId, textoEdicao, gravandoEdicao, cancelarEdicao, success, toastError, onComentarioAtualizado]);

  const confirmarApagar = useCallback(async () => {
    if (apagarId == null || apagando) return;
    setApagando(true);
    try {
      await apagarComentario(apagarId);
      setComentarios((prev) => prev.filter((c) => c.id !== apagarId));
      onComentarioApagado?.(apagarId);
      setApagarId(null);
      success('Comentário removido.');
    } catch (err) {
      toastError(mensagemErroApi(err, 'Não foi possível apagar.'));
    } finally {
      setApagando(false);
    }
  }, [apagarId, apagando, success, toastError, onComentarioApagado]);

  if (!aberto || !filme) return null;

  const desc = filme.filmeDescricao;
  const tituloOriginal = desc?.tituloOriginal ?? filme.tituloOriginal;
  const resumo = desc?.resumo ?? filme.sinopse;
  const notaMediaTmdb = desc?.notaMediaTmdb ?? filme.notaMediaTmdb;

  const src = posterUrl(filme.posterPath, 'w500');

  return (
    <>
      {/* pointer-events: painel clicável por cima do backdrop (evita stacking estranho com flex/blur) */}
      <div className="fixed inset-0 z-50 isolate">
        <button
          type="button"
          className="absolute inset-0 z-0 bg-slate-900/70"
          onClick={onFechar}
          aria-label="Fechar"
        />
        <div className="relative z-10 flex min-h-full w-full items-end justify-center p-0 sm:items-center sm:p-4 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filme-modal-titulo"
          >
          <div className="sticky top-0 flex justify-end bg-gradient-to-b from-white to-transparent p-2 z-10">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="-mt-8 px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 shadow sm:w-28">
                {src ? (
                  <img src={src} alt="" className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="aspect-[2/3] flex items-center justify-center text-xs text-slate-500 p-2 text-center">
                    Sem capa
                  </div>
                )}
              </div>
              <div className="min-w-0 w-full text-center sm:w-auto sm:text-left">
                <h2
                  id="filme-modal-titulo"
                  className="text-base font-bold leading-tight text-slate-900 sm:text-lg"
                >
                  {filme.titulo}
                </h2>
                {tituloOriginal && tituloOriginal !== filme.titulo ? (
                  <p className="mt-0.5 text-sm text-slate-500">{tituloOriginal}</p>
                ) : null}
                {filme.genero?.nome ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-violet-600">
                    {filme.genero.nome}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-slate-600 sm:justify-start">
                  {filme.dataLancamento ? <span>{String(filme.dataLancamento).slice(0, 4)}</span> : null}
                  {notaMediaTmdb != null ? (
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      {Number(notaMediaTmdb).toFixed(1)} TMDB
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {resumo ? (
              <p className="mt-4 text-sm text-slate-700 leading-relaxed">{resumo}</p>
            ) : (
              <p className="mt-4 text-sm text-slate-400 italic">Sem sinopse.</p>
            )}
            {onToggleFavorito ? (
              <button
                type="button"
                onClick={onToggleFavorito}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-colors ${
                  favorito
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorito ? 'fill-current' : ''}`} />
                {favorito ? 'Nos teus favoritos' : 'Adicionar aos favoritos'}
              </button>
            ) : null}

            <ComentariosSection
              comentarios={comentarios}
              comentariosCarregando={comentariosCarregando}
              textoNovo={textoNovo}
              setTextoNovo={setTextoNovo}
              enviando={enviando}
              onEnviar={enviarComentario}
              editingId={editingId}
              textoEdicao={textoEdicao}
              setTextoEdicao={setTextoEdicao}
              gravandoEdicao={gravandoEdicao}
              onIniciarEdicao={iniciarEdicao}
              onCancelarEdicao={cancelarEdicao}
              onGuardarEdicao={guardarEdicao}
              setApagarId={setApagarId}
            />
          </div>
        </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={apagarId != null}
        onClose={() => !apagando && setApagarId(null)}
        onConfirm={confirmarApagar}
        title="Apagar comentário"
        message="Tens a certeza? Esta ação não pode ser desfeita."
      />
    </>
  );
}
