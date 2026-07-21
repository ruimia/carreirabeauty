"use client";

import { useState } from "react";
import { previewEmailCandidatos, dispararEmailCandidatos } from "../actions";

interface Preview {
  total: number;
  funcao: string;
  cidade: string | null;
  assuntoPadrao: string;
  mensagemPadrao: string;
  nomeExemplo: string;
  htmlPreview: string;
}

export default function DispararEmailButton({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atualizandoPreview, setAtualizandoPreview] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [resultado, setResultado] = useState<{ enviados: number; semEmail: number; total: number; falhas: number } | null>(null);

  async function handleAbrir() {
    setAberto(true);
    setResultado(null);
    setLoading(true);
    const dados = await previewEmailCandidatos(id);
    if (dados) {
      setPreview(dados);
      setAssunto(dados.assuntoPadrao);
      setMensagem(dados.mensagemPadrao);
    }
    setLoading(false);
  }

  async function handleAtualizarPreview() {
    setAtualizandoPreview(true);
    const dados = await previewEmailCandidatos(id, mensagem);
    if (dados) setPreview((prev) => (prev ? { ...prev, htmlPreview: dados.htmlPreview } : dados));
    setAtualizandoPreview(false);
  }

  async function handleDisparar() {
    setLoading(true);
    const r = await dispararEmailCandidatos(id, assunto, mensagem);
    setResultado(r);
    setLoading(false);
  }

  if (!aberto) {
    return (
      <button onClick={handleAbrir}
        className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 mt-2">
        📧 Enviar email pros candidatos
      </button>
    );
  }

  return (
    <div className="mt-2 bg-blue-50 rounded-lg p-3 text-sm space-y-3">
      {loading && !preview && <p className="text-gray-500">Buscando candidatos…</p>}

      {preview && !resultado && (
        <>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-gray-700">
              <strong>{preview.total}</strong> candidato{preview.total !== 1 ? "s" : ""} encontrado{preview.total !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Filtro: função <strong>{preview.funcao}</strong>
              {preview.cidade ? <> · cidade <strong>{preview.cidade}</strong></> : " · sem cidade definida (todas)"}
              {" "}(ainda sem filtro por raio geográfico)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Assunto</label>
            <input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mensagem de abertura</label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <button onClick={handleAtualizarPreview} disabled={atualizandoPreview}
              className="text-xs text-blue-600 font-semibold mt-1 hover:underline disabled:opacity-40">
              {atualizandoPreview ? "Atualizando…" : "Atualizar preview ↓"}
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Preview (exemplo com &quot;{preview.nomeExemplo}&quot;)
            </p>
            <iframe
              srcDoc={preview.htmlPreview}
              className="w-full rounded-lg border border-gray-200 bg-white"
              style={{ height: 340 }}
              sandbox=""
              title="Preview do email"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setAberto(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Cancelar
            </button>
            <button onClick={handleDisparar} disabled={loading || preview.total === 0}
              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40">
              {loading ? "Enviando…" : `Confirmar envio pra ${preview.total}`}
            </button>
          </div>
        </>
      )}

      {resultado && (
        <p className="text-gray-700">
          ✓ {resultado.enviados} email(s) enviado(s)
          {resultado.semEmail > 0 && `, ${resultado.semEmail} sem email cadastrado`}
          {resultado.falhas > 0 && <span className="text-rose-600">, {resultado.falhas} falharam ao enviar</span>}.
        </p>
      )}
    </div>
  );
}
