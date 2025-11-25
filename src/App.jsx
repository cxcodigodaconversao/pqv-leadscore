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
    setDebugLog(prev => [...prev, msg]);
  };

  const ICP_COLORS = {
    'ICP 1 ELITE': '#10b981',
    'ICP 1 BLACK': '#3b82f6',
    'ICP 2': '#f59e0b',
    'ICP 3': '#ef4444'
  };

  // Buscar coluna
  const buscarColuna = (row, palavras) => {
    const colunas = Object.keys(row);
    for (const palavra of palavras) {
      for (const coluna of colunas) {
        if (coluna.toLowerCase().includes(palavra.toLowerCase())) {
          return row[coluna];
        }
      }
    }
    return null;
  };

  // Conversões (só usadas se precisar calcular)
  const convertRenda = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor) return 0;
    const texto = String(valor).toLowerCase();
    if (texto.includes('mais de 20')) return 4;
    if (texto.includes('10.001') || texto.includes('20.000')) return 3;
    if (texto.includes('5001') || texto.includes('10.000')) return 2;
    if (texto.includes('3001') || texto.includes('5000')) return 1;
    if (texto.includes('1501') || texto.includes('3000')) return 1;
    return 0;
  };

  const convertEscolaridade = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor) return 1;
    const texto = String(valor).toLowerCase();
    if (texto.includes('mestrado') || texto.includes('doutorado') || texto.includes('pós')) return 3;
    if (texto.includes('superior')) return 2;
    return 1;
  };

  const convertProduto = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor) return 0;
    const texto = String(valor).toLowerCase();
    if (texto.includes('já vendo') || texto.includes('escalar')) return 3;
    if (texto.includes('mas preciso melhorar') || texto.includes('vender mais')) return 2;
    if (texto.includes('ideia') || texto.includes('não sei como')) return 1;
    return 0;
  };

  const convertTempo = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor) return 1;
    const texto = String(valor).toLowerCase();
    if (texto.includes('11') || texto.includes('20')) return 3;
    if (texto.includes('6') || texto.includes('10')) return 2;
    return 1;
  };

  const classificarICP = (score) => {
    if (score >= 13) return 'ICP 1 ELITE';
    if (score >= 10) return 'ICP 1 BLACK';
    if (score >= 6) return 'ICP 2';
    return 'ICP 3';
  };

  const processarLead = (row, index, temScoreFinal, temICP) => {
    const nome = buscarColuna(row, ['nome', 'name', 'aluno']) || '';
    
    // ========================================
    // DECISÃO: USA SCORE JÁ CALCULADO OU CALCULA?
    // ========================================
    let scoreFinal;
    let icp;
    let renda, escolaridade, produto, tempo, comportamento;
    
    if (temScoreFinal) {
      // TEM SCOREFINAL → USA DIRETO!
      scoreFinal = Number(buscarColuna(row, ['scorefinal', 'score final', 'score']) || 0);
      
      if (temICP) {
        // TEM ICP TAMBÉM → USA DIRETO!
        icp = buscarColuna(row, ['icp']) || classificarICP(scoreFinal);
      } else {
        // NÃO TEM ICP → CLASSIFICA
        icp = classificarICP(scoreFinal);
      }
      
      // Pega os valores individuais só pra mostrar na tabela (não calcula nada)
      const rendaValor = buscarColuna(row, ['renda']) || 0;
      const escolaridadeValor = buscarColuna(row, ['escolaridade', 'escolar']) || 0;
      const produtoValor = buscarColuna(row, ['produto']) || 0;
      const tempoValor = buscarColuna(row, ['tempo']) || 0;
      
      renda = Number(rendaValor) || 0;
      escolaridade = Number(escolaridadeValor) || 0;
      produto = Number(produtoValor) || 0;
      tempo = Number(tempoValor) || 0;
      comportamento = Number(buscarColuna(row, ['comportamento']) || 0);
      
      if (index === 0) {
        addDebug(`\n✅ USANDO SCORE JÁ CALCULADO!`);
        addDebug(`   ${nome}: Score = ${scoreFinal} → ${icp}`);
      }
      
    } else {
      // NÃO TEM SCOREFINAL → PRECISA CALCULAR!
      const rendaValor = buscarColuna(row, ['renda']) || 0;
      const escolaridadeValor = buscarColuna(row, ['escolaridade', 'escolar']) || 0;
      const produtoValor = buscarColuna(row, ['produto']) || 0;
      const tempoValor = buscarColuna(row, ['tempo']) || 0;
      const comportamentoValor = buscarColuna(row, ['comportamento']) || 0;
      
      renda = convertRenda(rendaValor);
      escolaridade = convertEscolaridade(escolaridadeValor);
      produto = convertProduto(produtoValor);
      tempo = convertTempo(tempoValor);
      comportamento = typeof comportamentoValor === 'number' ? comportamentoValor : 0;
      
      scoreFinal = renda + escolaridade + produto + tempo + comportamento;
      icp = classificarICP(scoreFinal);
      
      if (index === 0) {
        addDebug(`\n✅ CALCULANDO SCORE:`);
        addDebug(`   ${nome}: ${renda} + ${escolaridade} + ${produto} + ${tempo} + ${comportamento} = ${scoreFinal} → ${icp}`);
      }
    }
    
    return {
      nome,
      renda,
      escolaridade,
      produtoDigital: produto,
      tempoSemanal: tempo,
      comportamentoCompra: comportamento,
      scoreFinal,
      icp
    };
  };

  const processExcelData = useCallback((arrayBuffer) => {
    try {
      setLoading(true);
      setDebugLog([]);
      addDebug('🚀 Processando...');
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      addDebug(`📊 ${jsonData.length} linhas encontradas`);
      
      if (jsonData.length === 0) {
        throw new Error('Planilha vazia!');
      }
      
      // DETECTAR: Tem coluna ScoreFinal?
      const colunas = Object.keys(jsonData[0]);
      const temScoreFinal = colunas.some(c => 
        c.toLowerCase().includes('scorefinal') || 
        c.toLowerCase().includes('score final') ||
        c.toLowerCase() === 'score'
      );
      
      const temICP = colunas.some(c => c.toLowerCase() === 'icp');
      
      addDebug(`\n🔍 DETECÇÃO:`);
      addDebug(`   Tem coluna ScoreFinal? ${temScoreFinal ? '✅ SIM' : '❌ NÃO'}`);
      addDebug(`   Tem coluna ICP? ${temICP ? '✅ SIM' : '❌ NÃO'}`);
      
      if (temScoreFinal) {
        addDebug(`   → Vai USAR o score já calculado`);
      } else {
        addDebug(`   → Vai CALCULAR o score`);
      }
      
      // Processar leads
      const processedLeads = jsonData.map((row, index) => 
        processarLead(row, index, temScoreFinal, temICP)
      );
      
      const leadsCompletos = processedLeads.filter(lead => lead.nome && lead.nome.trim() !== '');
      
      addDebug(`\n✅ ${leadsCompletos.length} leads válidos`);
      
      if (leadsCompletos.length === 0) {
        throw new Error('Nenhum lead com nome!');
      }
      
      const processedData = {
        leads: leadsCompletos,
        totalLeads: leadsCompletos.length,
        scoreTotal: leadsCompletos.reduce((sum, lead) => sum + lead.scoreFinal, 0),
        scoreMedia: leadsCompletos.reduce((sum, lead) => sum + lead.scoreFinal, 0) / leadsCompletos.length
      };
      
      // Distribuição ICP
      const icpDist = {};
      processedData.leads.forEach(lead => {
        icpDist[lead.icp] = (icpDist[lead.icp] || 0) + 1;
      });
      
      processedData.icpDistribution = Object.entries(icpDist).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / processedData.totalLeads) * 100).toFixed(1)
      }));
      
      addDebug(`\n📊 DISTRIBUIÇÃO:`);
      processedData.icpDistribution.forEach(item => {
        addDebug(`   ${item.name}: ${item.value} (${item.percentage}%)`);
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
      const scoreDist = {};
      processedData.leads.forEach(lead => {
        scoreDist[lead.scoreFinal] = (scoreDist[lead.scoreFinal] || 0) + 1;
      });
      
      processedData.scoreDistribution = Object.entries(scoreDist)
        .map(([score, count]) => ({ score: parseInt(score), count }))
        .sort((a, b) => a.score - b.score);
      
      addDebug(`\n🎉 PRONTO! Score Médio: ${processedData.scoreMedia.toFixed(1)}`);
      
      setData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('ERRO:', error);
      addDebug(`\n❌ ERRO: ${error.message}`);
      alert(`Erro: ${error.message}`);
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
    const reader = new FileReader();
    reader.onload = (e) => processExcelData(e.target.result);
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
          Ver Critérios
        </button>
      </div>

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
          fontSize: '0.9rem',
          color: 'white'
        }}>
          <h4 style={{ color: '#d2bc8f', marginBottom: '0.5rem' }}>📋 Log:</h4>
          {debugLog.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.25rem' }}>{log}</div>
          ))}
        </div>
      )}

      {showLegend && (
        <div className="modal-overlay" onClick={() => setShowLegend(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Critérios de Pontuação</h2>
              <button className="modal-close" onClick={() => setShowLegend(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="criteria-grid">
                <div className="criteria-card">
                  <h3>💰 Renda</h3>
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
                  <h3>🎓 Escolaridade</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>Mestrado/Doutorado/Pós</td><td className="score-badge">3</td></tr>
                      <tr><td>Superior completo</td><td className="score-badge">2</td></tr>
                      <tr><td>Ensino médio</td><td className="score-badge">1</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card">
                  <h3>💻 Produto Digital</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>Já vendo</td><td className="score-badge">3</td></tr>
                      <tr><td>Preciso melhorar</td><td className="score-badge">2</td></tr>
                      <tr><td>Tenho ideia</td><td className="score-badge">1</td></tr>
                      <tr><td>Vou criar</td><td className="score-badge">0</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="criteria-card">
                  <h3>⏰ Tempo</h3>
                  <table className="criteria-table">
                    <tbody>
                      <tr><td>11h a 20h</td><td className="score-badge">3</td></tr>
                      <tr><td>6h a 10h</td><td className="score-badge">2</td></tr>
                      <tr><td>2h a 5h</td><td className="score-badge">1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="classification-section">
                <h2>🎯 Classificação ICP</h2>
                <div className="classification-grid">
                  <div className="classification-item elite">
                    <div className="class-badge">ICP 1 ELITE</div>
                    <div className="class-score">≥ 13 pontos</div>
                  </div>
                  <div className="classification-item black">
                    <div className="class-badge">ICP 1 BLACK</div>
                    <div className="class-score">≥ 10 pontos</div>
                  </div>
                  <div className="classification-item regular">
                    <div className="class-badge">ICP 2</div>
                    <div className="class-score">6-9 pontos</div>
                  </div>
                  <div className="classification-item baixo">
                    <div className="class-badge">ICP 3</div>
                    <div className="class-score">1-5 pontos</div>
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
              <h3>Arraste sua planilha</h3>
              <p>Com score calculado OU para calcular - funciona com ambos!</p>
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
          <h3 style={{ color: 'white' }}>Processando...</h3>
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
                <div className="stat-label">Total Leads</div>
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
                <div className="stat-label">Elite + Black</div>
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
              <h3>Leads por Faixa</h3>
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
            <h3>Todos os Leads</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Renda</th>
                    <th>Escolaridade</th>
                    <th>Produto</th>
                    <th>Tempo</th>
                    <th>Score</th>
                    <th>ICP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.sort((a, b) => b.scoreFinal - a.scoreFinal).map((lead, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{lead.nome}</td>
                      <td>{lead.renda}</td>
                      <td>{lead.escolaridade}</td>
                      <td>{lead.produtoDigital}</td>
                      <td>{lead.tempoSemanal}</td>
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
              Nova Planilha
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
