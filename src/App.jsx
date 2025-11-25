import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, Users, Award, Target, FileSpreadsheet, Info, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

const App = () => {
  const [data, setData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  const addDebug = (msg) => {
    console.log(msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const ICP_COLORS = {
    'ICP 1 ELITE': '#10b981',
    'ICP 1 BLACK': '#3b82f6',
    'ICP 2': '#f59e0b',
    'ICP 3': '#ef4444',
    'ICP 4': '#888'
  };

  // ========================================
  // DETECÇÃO AUTOMÁTICA DE FORMATO
  // ========================================
  const detectarFormato = (row) => {
    const colunas = Object.keys(row);
    
    // FORMATO 1: Manual (colunas com nomes curtos)
    const temColunasManuais = 
      colunas.some(c => c.toLowerCase() === 'renda') ||
      colunas.some(c => c.toLowerCase() === 'escolaridade') ||
      colunas.some(c => c.toLowerCase().includes('produto digital'));
    
    // FORMATO 2: Formulário (colunas com perguntas)
    const temColunasFormulario =
      colunas.some(c => c.includes('Qual sua faixa de renda')) ||
      colunas.some(c => c.includes('Qual seu grau de escolaridade')) ||
      colunas.some(c => c.includes('Você já possui algum produto'));
    
    if (temColunasManuais) {
      return 'MANUAL';
    } else if (temColunasFormulario) {
      return 'FORMULARIO';
    }
    
    // Tentar detectar pelo valor
    const primeiroValor = row[colunas[1]]; // Segunda coluna geralmente tem dados
    if (typeof primeiroValor === 'number' && primeiroValor <= 4) {
      return 'MANUAL';
    }
    
    return 'FORMULARIO'; // Default
  };

  // ========================================
  // FUNÇÕES DE CONVERSÃO (para formulário)
  // ========================================
  const convertRenda = (renda) => {
    if (!renda) return 0;
    const rendaLower = String(renda).toLowerCase();
    
    if (rendaLower.includes('mais de 20')) return 4;
    if (rendaLower.includes('10.001') || rendaLower.includes('20.000')) return 3;
    if (rendaLower.includes('5001') || rendaLower.includes('10.000')) return 2;
    if (rendaLower.includes('3001') || rendaLower.includes('5000')) return 1;
    if (rendaLower.includes('1501') || rendaLower.includes('3000')) return 1;
    return 0;
  };

  const convertEscolaridade = (escolaridade) => {
    if (!escolaridade) return 1;
    const escLower = String(escolaridade).toLowerCase();
    
    if (escLower.includes('mestrado') || escLower.includes('doutorado') || escLower.includes('pós')) return 3;
    if (escLower.includes('superior')) return 2;
    return 1;
  };

  const convertProdutoDigital = (produto) => {
    if (!produto) return 0;
    const prodLower = String(produto).toLowerCase();
    
    if (prodLower.includes('já vendo') || prodLower.includes('escalar')) return 3;
    if (prodLower.includes('mas preciso melhorar') || prodLower.includes('vender mais')) return 2;
    if (prodLower.includes('ideia') || prodLower.includes('não sei como')) return 1;
    return 0;
  };

  const convertTempoSemanal = (tempo) => {
    if (!tempo) return 1;
    const tempoLower = String(tempo).toLowerCase();
    
    if (tempoLower.includes('11') || tempoLower.includes('20')) return 3;
    if (tempoLower.includes('6') || tempoLower.includes('10')) return 2;
    return 1;
  };

  const classificarICP = (scoreFinal) => {
    if (scoreFinal >= 13) return 'ICP 1 ELITE';
    if (scoreFinal >= 10) return 'ICP 1 BLACK';
    if (scoreFinal >= 6) return 'ICP 2';
    return 'ICP 3';
  };

  // ========================================
  // BUSCAR COLUNA POR SIMILARIDADE
  // ========================================
  const buscarColuna = (row, palavrasChave) => {
    const colunas = Object.keys(row);
    
    for (const palavra of palavrasChave) {
      const coluna = colunas.find(c => 
        c.toLowerCase().includes(palavra.toLowerCase())
      );
      if (coluna) return row[coluna];
    }
    
    return null;
  };

  // ========================================
  // PROCESSAR FORMATO MANUAL
  // ========================================
  const processarManual = (row) => {
    const nome = buscarColuna(row, ['nome', 'name']) || '';
    const renda = buscarColuna(row, ['renda', 'income']) || 0;
    const escolaridade = buscarColuna(row, ['escolaridade', 'education', 'escola']) || 0;
    const produto = buscarColuna(row, ['produto digital', 'produto', 'product']) || 0;
    const tempo = buscarColuna(row, ['tempo semanal', 'tempo', 'time', 'horas']) || 0;
    const comportamento = buscarColuna(row, ['comportamento', 'compra', 'behavior']) || 0;
    
    // Converter para número caso venha como string
    const rendaPts = Number(renda) || 0;
    const escolaridadePts = Number(escolaridade) || 0;
    const produtoPts = Number(produto) || 0;
    const tempoPts = Number(tempo) || 0;
    const comportamentoPts = Number(comportamento) || 0;
    
    const scoreFinal = rendaPts + escolaridadePts + produtoPts + tempoPts + comportamentoPts;
    const icp = classificarICP(scoreFinal);
    
    return {
      nome,
      renda: rendaPts,
      escolaridade: escolaridadePts,
      produtoDigital: produtoPts,
      tempoSemanal: tempoPts,
      comportamentoCompra: comportamentoPts,
      scoreFinal,
      icp
    };
  };

  // ========================================
  // PROCESSAR FORMATO FORMULÁRIO
  // ========================================
  const processarFormulario = (row) => {
    const nome = buscarColuna(row, ['seu nome completo', 'nome', 'name']) || '';
    const rendaTexto = buscarColuna(row, ['qual sua faixa de renda', 'renda mensal', 'renda']) || '';
    const escolaridadeTexto = buscarColuna(row, ['qual seu grau de escolaridade', 'escolaridade']) || '';
    const produtoTexto = buscarColuna(row, ['você já possui algum produto', 'possui produto', 'produto']) || '';
    const tempoTexto = buscarColuna(row, ['quanto tempo consegue se dedicar', 'tempo semanal', 'tempo']) || '';
    
    const rendaPts = convertRenda(rendaTexto);
    const escolaridadePts = convertEscolaridade(escolaridadeTexto);
    const produtoPts = convertProdutoDigital(produtoTexto);
    const tempoPts = convertTempoSemanal(tempoTexto);
    
    const scoreFinal = rendaPts + escolaridadePts + produtoPts + tempoPts;
    const icp = classificarICP(scoreFinal);
    
    return {
      nome,
      renda: rendaPts,
      escolaridade: escolaridadePts,
      produtoDigital: produtoPts,
      tempoSemanal: tempoPts,
      comportamentoCompra: 0,
      scoreFinal,
      icp,
      rendaOriginal: rendaTexto,
      escolaridadeOriginal: escolaridadeTexto,
      produtoOriginal: produtoTexto,
      tempoOriginal: tempoTexto
    };
  };

  // ========================================
  // PROCESSAMENTO PRINCIPAL
  // ========================================
  const processExcelData = useCallback((arrayBuffer) => {
    try {
      setLoading(true);
      setDebugLog([]);
      addDebug('🚀 Iniciando processamento...');
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      addDebug(`📄 Planilha encontrada: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      addDebug(`📊 Total de linhas: ${jsonData.length}`);
      
      if (jsonData.length === 0) {
        throw new Error('Planilha vazia!');
      }
      
      // DETECÇÃO AUTOMÁTICA
      const formato = detectarFormato(jsonData[0]);
      addDebug(`\n🔍 FORMATO DETECTADO: ${formato}`);
      
      const colunas = Object.keys(jsonData[0]);
      addDebug(`📋 Colunas encontradas: ${colunas.length}`);
      addDebug(`🔍 Primeiras colunas: ${colunas.slice(0, 3).join(', ')}...`);
      
      // Processar de acordo com o formato
      const processedLeads = jsonData.map((row, index) => {
        let lead;
        
        if (formato === 'MANUAL') {
          lead = processarManual(row);
        } else {
          lead = processarFormulario(row);
        }
        
        // Debug do primeiro lead
        if (index === 0) {
          addDebug(`\n✅ EXEMPLO DO 1º LEAD:`);
          addDebug(`Nome: ${lead.nome}`);
          addDebug(`Renda: ${lead.renda} pts`);
          addDebug(`Escolaridade: ${lead.escolaridade} pts`);
          addDebug(`Produto: ${lead.produtoDigital} pts`);
          addDebug(`Tempo: ${lead.tempoSemanal} pts`);
          if (lead.comportamentoCompra > 0) {
            addDebug(`Comportamento: ${lead.comportamentoCompra} pts`);
          }
          addDebug(`SCORE: ${lead.scoreFinal} → ${lead.icp}`);
        }
        
        return lead;
      });
      
      const leadsCompletos = processedLeads.filter(lead => lead.nome && lead.nome.trim() !== '');
      addDebug(`\n✅ Leads válidos: ${leadsCompletos.length}`);
      
      const processedData = {
        leads: leadsCompletos,
        totalLeads: leadsCompletos.length,
        scoreTotal: leadsCompletos.reduce((sum, lead) => sum + lead.scoreFinal, 0),
        scoreMedia: leadsCompletos.length > 0 
          ? leadsCompletos.reduce((sum, lead) => sum + lead.scoreFinal, 0) / leadsCompletos.length 
          : 0
      };
      
      // Distribuição por ICP
      const icpDistribution = {};
      processedData.leads.forEach(lead => {
        icpDistribution[lead.icp] = (icpDistribution[lead.icp] || 0) + 1;
      });
      
      processedData.icpDistribution = Object.entries(icpDistribution).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / processedData.totalLeads) * 100).toFixed(1)
      }));
      
      addDebug(`\n📊 DISTRIBUIÇÃO POR ICP:`);
      processedData.icpDistribution.forEach(item => {
        addDebug(`${item.name}: ${item.value} (${item.percentage}%)`);
      });
      
      // Score groups
      const scoreGroups = {
        '13-16 (Elite)': 0,
        '10-12 (Black)': 0,
        '6-9 (Regular)': 0,
        '1-5 (Baixo)': 0
      };
      
      processedData.leads.forEach(lead => {
        if (lead.scoreFinal >= 13) scoreGroups['13-16 (Elite)']++;
        else if (lead.scoreFinal >= 10) scoreGroups['10-12 (Black)']++;
        else if (lead.scoreFinal >= 6) scoreGroups['6-9 (Regular)']++;
        else scoreGroups['1-5 (Baixo)']++;
      });
      
      processedData.scoreGroups = Object.entries(scoreGroups).map(([name, value]) => ({
        name,
        value
      }));
      
      // Score distribution
      const scoreDistribution = {};
      processedData.leads.forEach(lead => {
        scoreDistribution[lead.scoreFinal] = (scoreDistribution[lead.scoreFinal] || 0) + 1;
      });
      
      processedData.scoreDistribution = Object.entries(scoreDistribution)
        .map(([score, count]) => ({
          score: parseInt(score),
          count
        }))
        .sort((a, b) => a.score - b.score);
      
      addDebug(`\n🎉 PROCESSAMENTO CONCLUÍDO!`);
      addDebug(`Formato usado: ${formato}`);
      addDebug(`Score Total: ${processedData.scoreTotal}`);
      addDebug(`Score Médio: ${processedData.scoreMedia.toFixed(1)}`);
      
      setData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('ERRO:', error);
      addDebug(`\n❌ ERRO: ${error.message}`);
      alert(`Erro ao processar: ${error.message}`);
      setLoading(false);
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback((file) => {
    setFileName(file.name);
    addDebug(`📁 Arquivo selecionado: ${file.name}`);
    const reader = new FileReader();
    reader.onload = (e) => {
      processExcelData(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }, [processExcelData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{payload[0].name}</p>
          <p className="value">
            {payload[0].value} leads {payload[0].payload.percentage ? `(${payload[0].payload.percentage}%)` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Dashboard ICP</h1>
        <p>Análise Inteligente de Qualificação de Leads</p>
        <button className="legend-button" onClick={() => setShowLegend(true)}>
          <Info size={20} />
          Ver Critérios de Pontuação
        </button>
      </div>

      {/* Debug Log */}
      {debugLog.length > 0 && (
        <div style={{
          background: '#1a2332',
          border: '1px solid #444',
          borderRadius: '12px',
          padding: '1rem',
          margin: '2rem auto',
          maxWidth: '800px',
          maxHeight: '300px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: '#d2bc8f'
        }}>
          <h4 style={{ color: '#d2bc8f', marginBottom: '0.5rem' }}>📋 Log de Processamento:</h4>
          {debugLog.map((log, i) => (
            <div key={i} style={{ color: log.includes('❌') ? '#ef4444' : log.includes('✅') ? '#10b981' : 'white', marginBottom: '0.25rem' }}>
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Legenda */}
      {showLegend && (
        <div className="modal-overlay" onClick={() => setShowLegend(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Critérios de Pontuação (Score)</h2>
              <button className="modal-close" onClick={() => setShowLegend(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="criteria-grid">
                <div className="criteria-card">
                  <h3>💰 Renda (Renda_pts)</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>Mais de R$ 20.000</td><td className="score-badge">4</td></tr>
                      <tr><td>R$ 10.001 - 20.000</td><td className="score-badge">3</td></tr>
                      <tr><td>R$ 5.001 - 10.000</td><td className="score-badge">2</td></tr>
                      <tr><td>R$ 1.501 - 5.000</td><td className="score-badge">1</td></tr>
                      <tr><td>Até R$ 1.500</td><td className="score-badge">0</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card">
                  <h3>🎓 Escolaridade (Escolaridade_pts)</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>Mestrado / Doutorado / Pós</td><td className="score-badge">3</td></tr>
                      <tr><td>Superior completo/cursando</td><td className="score-badge">2</td></tr>
                      <tr><td>Ensino médio/fundamental</td><td className="score-badge">1</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card">
                  <h3>💻 Produto Digital (ProdutoDigital_pts)</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>Já vendo, mas quero escalar</td><td className="score-badge">3</td></tr>
                      <tr><td>Preciso melhorar e vender mais</td><td className="score-badge">2</td></tr>
                      <tr><td>Tenho ideia, mas não sei executar</td><td className="score-badge">1</td></tr>
                      <tr><td>Vou criar do zero</td><td className="score-badge">0</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card">
                  <h3>⏰ Tempo Semanal (Tempo_pts)</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>11h a 20h por semana</td><td className="score-badge">3</td></tr>
                      <tr><td>6h a 10h por semana</td><td className="score-badge">2</td></tr>
                      <tr><td>2h a 5h por semana</td><td className="score-badge">1</td></tr>
                      <tr><td>Menos de 2h por semana</td><td className="score-badge">1</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card full-width">
                  <h3>ℹ️ Detecção Automática</h3>
                  <p style={{color: '#888', fontSize: '0.9rem', lineHeight: '1.6'}}>
                    Este dashboard detecta <strong>automaticamente</strong> qual formato sua planilha está:
                    <br/>• <strong>Formato Manual:</strong> colunas com pontos já calculados (Renda=4, Escolaridade=3...)
                    <br/>• <strong>Formato Formulário:</strong> colunas com respostas em texto ("Mais de 20.000 reais"...)
                  </p>
                </div>
              </div>

              <div className="classification-section">
                <h2>🎯 Classificação Final ICP (por ScoreFinal)</h2>
                <div className="classification-grid">
                  <div className="classification-item elite">
                    <div className="class-badge">ICP 1 ELITE</div>
                    <div className="class-score">Score ≥ 13</div>
                  </div>
                  <div className="classification-item black">
                    <div className="class-badge">ICP 1 BLACK</div>
                    <div className="class-score">Score ≥ 10</div>
                  </div>
                  <div className="classification-item regular">
                    <div className="class-badge">ICP 2 REGULAR</div>
                    <div className="class-score">Score entre 6 e 9</div>
                  </div>
                  <div className="classification-item baixo">
                    <div className="class-badge">ICP 3 BAIXO</div>
                    <div className="class-score">Score entre 1 e 5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div
          className={`upload-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <div className="upload-content">
            <div className="upload-icon">
              <Upload size={40} color="#0c121c" />
            </div>
            <div className="upload-text">
              <h3>Arraste sua planilha aqui</h3>
              <p>ou clique para selecionar</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>
                Aceita QUALQUER formato: Pontos ou Respostas!
              </p>
            </div>
            {fileName && (
              <div className="file-name">
                <FileSpreadsheet size={16} />
                {fileName}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <h3 style={{ color: 'white' }}>Detectando formato...</h3>
          <p>Processando automaticamente</p>
        </div>
      )}

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Users size={28} color="#d2bc8f" />
                </div>
                <div className="stat-label">Total de Leads</div>
              </div>
              <div className="stat-value">{data.totalLeads}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Award size={28} color="#d2bc8f" />
                </div>
                <div className="stat-label">Score Total</div>
              </div>
              <div className="stat-value">{data.scoreTotal}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <TrendingUp size={28} color="#d2bc8f" />
                </div>
                <div className="stat-label">Score Médio</div>
              </div>
              <div className="stat-value">{data.scoreMedia.toFixed(1)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Target size={28} color="#d2bc8f" />
                </div>
                <div className="stat-label">Leads Elite + Black</div>
              </div>
              <div className="stat-value">
                {data.leads.filter(l => l.icp.includes('ELITE') || l.icp.includes('BLACK')).length}
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3>Distribuição por ICP</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.icpDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.icpDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ICP_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Leads por Faixa de Score</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.scoreGroups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#d2bc8f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Distribuição de Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="score" tick={{ fill: '#888' }} />
                  <YAxis tick={{ fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#d2bc8f" 
                    strokeWidth={3}
                    dot={{ fill: '#d2bc8f', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-container">
            <h3>Detalhamento dos Leads</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Renda</th>
                    <th>Escolaridade</th>
                    <th>Produto Digital</th>
                    <th>Tempo Semanal</th>
                    <th>Score Final</th>
                    <th>ICP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.sort((a, b) => b.scoreFinal - a.scoreFinal).map((lead, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{lead.nome}</td>
                      <td>{lead.renda} pts</td>
                      <td>{lead.escolaridade} pts</td>
                      <td>{lead.produtoDigital} pts</td>
                      <td>{lead.tempoSemanal} pts</td>
                      <td className="score-cell">{lead.scoreFinal}</td>
                      <td>
                        <span className={`icp-badge ${
                          lead.icp.includes('ELITE') ? 'icp-elite' :
                          lead.icp.includes('BLACK') ? 'icp-black' :
                          lead.icp.includes('ICP 2') ? 'icp-2' : 'icp-3'
                        }`}>
                          {lead.icp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="footer-actions">
            <button
              onClick={() => {
                setData(null);
                setFileName('');
                setDebugLog([]);
              }}
              className="btn-primary"
            >
              Carregar Nova Planilha
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
