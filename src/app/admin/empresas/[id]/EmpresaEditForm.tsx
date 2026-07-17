"use client";

import { useState } from "react";
import { atualizarEmpresaAdmin, EmpresaEditData } from "../../actions";

export default function EmpresaEditForm({ id, inicial }: { id: string; inicial: EmpresaEditData }) {
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function campo<K extends keyof EmpresaEditData>(key: K, value: EmpresaEditData[K]) {
    setDados((d) => ({ ...d, [key]: value }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro("");
    try {
      await atualizarEmpresaAdmin(id, dados);
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
        className="text-xs font-medium px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
        ✎ Editar dados da empresa
      </button>
    );
  }

  const input = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2";
  const label = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Nome do estabelecimento</label>
          <input className={input} value={dados.nome_estabelecimento} onChange={(e) => campo("nome_estabelecimento", e.target.value)} />
        </div>
        <div>
          <label className={label}>Responsável</label>
          <input className={input} value={dados.responsavel} onChange={(e) => campo("responsavel", e.target.value)} />
        </div>
        <div>
          <label className={label}>Telefone</label>
          <input className={input} value={dados.telefone} onChange={(e) => campo("telefone", e.target.value)} />
        </div>
        <div>
          <label className={label}>CNPJ</label>
          <input className={input} value={dados.cnpj} onChange={(e) => campo("cnpj", e.target.value)} />
        </div>
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
        <div>
          <label className={label}>Categoria</label>
          <input className={input} value={dados.categoria_negocio} onChange={(e) => campo("categoria_negocio", e.target.value)} />
        </div>
        <div>
          <label className={label}>Faixa de funcionários</label>
          <input className={input} value={dados.faixa_funcionarios} onChange={(e) => campo("faixa_funcionarios", e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={label}>Instagram (sem @)</label>
          <input className={input} value={dados.instagram} onChange={(e) => campo("instagram", e.target.value)} />
        </div>
      </div>

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={handleCancelar} disabled={salvando} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2">
          Cancelar
        </button>
        <button onClick={handleSalvar} disabled={salvando}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
