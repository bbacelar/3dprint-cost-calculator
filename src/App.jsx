import React, { useState } from 'react';
import { saveAs } from 'file-saver';

export default function App() {
  // Campos do formulário com valores default
  const campos = [
    { name: 'cor', label: 'Cor', default: '' },
    { name: 'quantidade', label: 'Quantidade', default: 1 },
    { name: 'peso', label: 'Peso (g)', default: '' },
    { name: 'precoRolo', label: 'Preço do Rolo (R$)', default: 90 },
    { name: 'pesoRolo', label: 'Peso do Rolo (g)', default: 1000 },
    { name: 'consumo', label: 'Consumo da Impressora (W)', default: 150 },
    { name: 'kwh', label: 'Valor do kWh (R$)', default: 0.92 },
    { name: 'valorImpressora', label: 'Valor da Impressora (R$)', default: 4500 },
    { name: 'vidaUtil', label: 'Vida Útil da Impressora (h)', default: 2000 },
    { name: 'fatiamento', label: 'Tempo de Fatiamento (min)', default: '' },
    { name: 'acabamento', label: 'Tempo de Acabamento (min)', default: '' },
    { name: 'valorHora', label: 'Valor da Hora de Trabalho (R$)', default: '' },
    { name: 'margem', label: 'Margem de Lucro (%)', default: 40 }
  ];

  const initialForm = Object.fromEntries(campos.map(c => [c.name, c.default]));

  const [form, setForm] = useState({ cliente: '', nome: '', material: '', tempo: '', ...initialForm });
  const [unidadeTempo, setUnidadeTempo] = useState('horas');
  const [resultados, setResultados] = useState([]);

  const columns = [
    'cliente', 'nome', 'material', 'cor', 'quantidade', 'peso', 'tempo', 'unidadeTempo',
    'custoMaterial', 'custoEnergia', 'custoTrabalho', 'custoDepreciacao', 'custoTotal', 'precoVenda', 'margem'
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcularCustos = () => {
    let tempo = parseFloat(form.tempo) || 0;
    if (unidadeTempo === 'minutos') tempo /= 60;

    const peso = parseFloat(form.peso) || 0;
    const precoRolo = parseFloat(form.precoRolo) || 90;
    const pesoRolo = parseFloat(form.pesoRolo) || 1000;
    const consumo = parseFloat(form.consumo) || 150;
    const kwh = parseFloat(form.kwh) || 0.92;
    const valorImpressora = parseFloat(form.valorImpressora) || 4500;
    const vidaUtil = parseFloat(form.vidaUtil) || 2000;
    const fatiamento = parseFloat(form.fatiamento) || 0;
    const acabamento = parseFloat(form.acabamento) || 0;
    const valorHora = parseFloat(form.valorHora) || 0;
    const margem = parseFloat(form.margem) || 40;
    const quantidade = parseFloat(form.quantidade) || 1;

    const custoMaterial = (peso * (precoRolo / pesoRolo)) * quantidade;
    const custoEnergia = ((consumo * tempo) / 1000) * kwh * quantidade;
    const custoTrabalho = (((fatiamento + acabamento) / 60) * valorHora) * quantidade;
    const custoDepreciacao = ((valorImpressora / vidaUtil) * tempo) * quantidade;

    const custoTotal = custoMaterial + custoEnergia + custoTrabalho + custoDepreciacao;
    const precoVenda = custoTotal * (1 + margem / 100);

    return { custoMaterial, custoEnergia, custoTrabalho, custoDepreciacao, custoTotal, precoVenda, margem };
  };

  const columnLabels = {
    cliente: 'Cliente',
    nome: 'Nome da Peça',
    material: 'Material',
    cor: 'Cor',
    quantidade: 'Quantidade',
    peso: 'Peso (g)',
    tempo: 'Tempo',
    unidadeTempo: 'Unidade Tempo',
    custoMaterial: 'Custo Material',
    custoEnergia: 'Custo Energia',
    custoTrabalho: 'Custo Trabalho',
    custoDepreciacao: 'Custo Depreciação',
    custoTotal: 'Custo Total',
    precoVenda: 'Preço de Venda',
    margem: 'Margem (%)'
  };

  const adicionarResultado = (e) => {
    e.preventDefault();
    const custos = calcularCustos();

    const row = {
      cliente: form.cliente || '',
      nome: form.nome || '',
      material: form.material || '',
      cor: form.cor || '',
      quantidade: Number(form.quantidade) || 1,
      peso: Number(form.peso) || 0,
      tempo: form.tempo || '',
      unidadeTempo: unidadeTempo,
      custoMaterial: custos.custoMaterial,
      custoEnergia: custos.custoEnergia,
      custoTrabalho: custos.custoTrabalho,
      custoDepreciacao: custos.custoDepreciacao,
      custoTotal: custos.custoTotal,
      precoVenda: custos.precoVenda,
      margem: custos.margem
    };

    setResultados(prev => [row, ...prev]);
  };

  const limparFormulario = () => {
    setForm({ cliente: '', nome: '', material: '', tempo: '', ...initialForm });
    setUnidadeTempo('horas');
  };

  const removerResultado = (index) => {
    setResultados(prev => prev.filter((_, i) => i !== index));
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const gerarCSV = () => {
    if (resultados.length === 0) return;

    const header = columns.join(';');
    const rows = resultados.map(r => columns.map(c => {
      const v = r[c];
      if (['custoMaterial', 'custoEnergia', 'custoTrabalho', 'custoDepreciacao', 'custoTotal', 'precoVenda'].includes(c)) {
        return v.toFixed(2);
      }
      return v ?? '';
    }).join(';'));

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'custos_impressao_3d.csv');
  };

  // Função para gerar o conteúdo CSV como string
  const gerarCSVString = (comHeader = true) => {
    if (resultados.length === 0) return '';
    const header = columns.join(';');
    const rows = resultados.map(r => columns.map(c => {
      const v = r[c];
      if (['custoMaterial', 'custoEnergia', 'custoTrabalho', 'custoDepreciacao', 'custoTotal', 'precoVenda'].includes(c)) {
        return v.toFixed(2);
      }
      return v ?? '';
    }).join(';'));
    return comHeader ? [header, ...rows].join('\n') : rows.join('\n');
  };

  // Copia o CSV para o clipboard
  const copiarCSV = (comHeader = true) => {
    const csv = gerarCSVString(comHeader);
    if (!csv) return;
    navigator.clipboard.writeText(csv);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">Calculadora de Custo de Impressão 3D</h1>

      <form onSubmit={adicionarResultado} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 sm:p-6 rounded-xl shadow relative">

        {/* Cliente */}
        <div className="relative">
          <label className="text-xs text-gray-500 absolute -top-3 left-2 bg-white px-1">Nome do Cliente</label>
          <input
            name="cliente"
            type="text"
            value={form.cliente}
            onChange={handleChange}
            className="border p-2 rounded w-full text-sm sm:text-base"
          />
        </div>

        {/* Nome da Peça */}
        <div className="relative">
          <label className="text-xs text-gray-500 absolute -top-3 left-2 bg-white px-1">Nome da Peça</label>
          <input
            name="nome"
            type="text"
            value={form.nome}
            onChange={handleChange}
            className="border p-2 rounded w-full text-sm sm:text-base"
          />
        </div>

        {/* Material Dropdown */}
        <div className="relative">
          <label className="text-xs text-gray-500 absolute -top-3 left-2 bg-white px-1">Material</label>
          <select
            name="material"
            value={form.material}
            onChange={handleChange}
            className="border p-2 rounded w-full text-sm sm:text-base bg-white"
          >
            <option value="">Selecione</option>
            <option value="PLA">PLA</option>
            <option value="PLA SILK">PLA SILK</option>
            <option value="PETG">PETG</option>
          </select>
        </div>

        {/* Tempo de impressão com unidade */}
        <div className="relative">
          <label className="text-xs text-gray-500 absolute -top-3 left-2 bg-white px-1">Tempo de Impressão</label>
          <div className="flex gap-2">
            <input
              name="tempo"
              type="text"
              value={form.tempo}
              onChange={handleChange}
              className="border p-2 rounded w-full text-sm sm:text-base"
              placeholder="Digite o tempo"
            />
            <select
              value={unidadeTempo}
              onChange={(e) => setUnidadeTempo(e.target.value)}
              className="border p-2 rounded text-sm sm:text-base"
            >
              <option value="horas">Horas</option>
              <option value="minutos">Minutos</option>
            </select>
          </div>
        </div>

        {/* Outros campos */}
        {campos.map((campo) => (
          <div key={campo.name} className="relative">
            <label className="text-xs text-gray-500 absolute -top-3 left-2 bg-white px-1">{campo.label}</label>
            <input
              name={campo.name}
              type="text"
              value={form[campo.name]}
              onChange={handleChange}
              className="border p-2 rounded w-full text-sm sm:text-base"
            />
          </div>
        ))}
        <div className="col-span-full flex gap-2 justify-end">
          <button type="submit" className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Calcular e Adicionar
          </button>
          <button type="button" onClick={limparFormulario} className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition">
            Limpar Formulário
          </button>
        </div>
      </form >

      {
        resultados.length > 0 && (
          <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Resultados</h2>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                 {columns.map(col => (
                    <th key={col} className="border px-2 py-1 text-left">
                      {columnLabels[col] || col}
                    </th>
                  ))}
                  <th className="border px-2 py-1 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    {columns.map((col, j) => (
                      <td key={j} className="border px-2 py-1">
                        {['custoMaterial', 'custoEnergia', 'custoTrabalho', 'custoDepreciacao', 'custoTotal', 'precoVenda'].includes(col)
                          ? formatarMoeda(r[col])
                          : r[col] ?? ''}
                      </td>
                    ))}
                    <td className="border px-2 py-1">
                      <button
                        onClick={() => removerResultado(i)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap gap-2 mt-4 justify-end">
              <button onClick={gerarCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Salvar CSV
              </button>
              <button
                onClick={() => copiarCSV(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                type="button"
              >
                Copiar CSV (com cabeçalho)
              </button>
              <button
                onClick={() => copiarCSV(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                type="button"
              >
                Copiar CSV (sem cabeçalho)
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}
