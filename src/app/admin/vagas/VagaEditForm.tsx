"use client";

import { useState } from "react";
import { atualizarVagaAdmin, VagaEditData } from "../actions";

export default function VagaEditForm({ id, inicial }: { id: string; inicial: VagaEditData }) {
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function campo<K extends keyof VagaEditData>(key: K, value: VagaEditData[K]) {
    setDados((d) => ({ ...d, [key]: value }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro("");
    try {
      await atualizarVagaAdmin(id, dados);
      setEditando(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  function handleCancelar() {
    setDados(inicial);
    setEditando(false);
    setErro("");
  }

  if (!editando) {
    return (
      <button onClick={() => setEditando(true)}
        className="text-xs text-teal-600 hover:text-teal-700 font-medium">
        ✎ Editar vaga
      </button>
    );
  }

  const input = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2";
  const label = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <div className="mt-2 bg-gray-50 rounded-xl p-3 space-y-3">
      <div>
        <label className={label}>Título</label>
        <input className={input} value={dados.titulo} onChange={(e) => campo("titulo", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Funções (separadas por vírgula)</label>
          <input className={input} value={dados.funcoes.join(", ")}
            onChange={(e) => campo("funcoes", e.target.value.split(",").map((f) => f.trim()).filter(Boolean))} />
        </div>
        <div>
          <label className={label}>Função (outro)</label>
          <input className={input} value={dados.funcao_outro} onChange={(e) => campo("funcao_outro", e.target.value)} />
        </div>
      </div>
      <div>
        <label className={label}>Descrição</label>
        <textarea className={input} rows={4} value={dados.descricao} onChange={(e) => campo("descricao", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Tipo de vínculo</label>
          <input className={input} value={dados.tipo_vinculo} onChange={(e) => campo("tipo_vinculo", e.target.value)} />
        </div>
        <div>
          <label className={label}>Faixa salarial</label>
          <input className={input} value={dados.faixa_salarial} onChange={(e) => campo("faixa_salarial", e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={label}>Comissão</label>
          <input className={input} value={dados.comissao} onChange={(e) => campo("comissao", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={label}>Endereço</label>
          <input className={input} value={dados.endereco} onChange={(e) => campo("endereco", e.target.value)} />
        </div>
        <div>
          <label className={label}>Bairro</label>
          <input className={input} value={dados.bairro} onChange={(e) => campo("bairro", e.target.value)} />
        </div>
        <div>
          <label className={label}>CEP</label>
          <input className={input} value={dados.cep} onChange={(e) => campo("cep", e.target.value)} />
        </div>
        <div>
          <label className={label}>Cidade</label>
          <input className={input} value={dados.cidade} onChange={(e) => campo("cidade", e.target.value)} />
        </div>
        <div>
          <label className={label}>UF</label>
          <input className={input} maxLength={2} value={dados.estado} onChange={(e) => campo("estado", e.target.value.toUpperCase())} />
        </div>
      </div>

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={handleCancelar} disabled={salvando} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2">
          Cancelar
        </button>
        <button onClick={handleSalvar} disabled={salvando}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
