import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, Users, Award, Target, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

const App = () => {
  const [data, setData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  // Cores para cada categoria ICP
  const ICP_COLORS = {
    'ICP 1 ELITE': '#10b981',
    'ICP 1 BLACK': '#3b82f6',
    'ICP 2': '#f59e0b',
    'ICP 3': '#ef4444'
  };

  const processExcelData = useCallback((arrayBuffer) => {
    try {
      setLoading(true);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Processar dados
      const processedData = {
        leads: jsonData.map(row => ({
          nome: row.Nome || '',
          renda: row.Renda || 0,
          escolaridade: row.Escolaridade || 0,
          produtoDigital: row['Produto Digital'] || 0,
          tempoSemanal: row['Tempo semanal'] || 0,
          comportamentoCompra: row['Comportamento de Compra'] || 0,
          scoreFinal: row.ScoreFinal || 0,
          icp: row.ICP || ''
        })),
        totalLeads: jsonData.length,
        scoreTotal: jsonData.reduce((sum, row) => sum + (row.ScoreFinal || 0), 0),
        scoreMedia: jsonData.length > 0 ? jsonData.reduce((sum, row) => sum + (row.ScoreFinal || 0), 0) / jsonData.length : 0
      };

      // Calcular distribuição por ICP
      const icpDistribution = {};
      processedData.leads.forEach(lead => {
        icpDistribution[lead.icp] = (icpDistribution[lead.icp] || 0) + 1;
      });

      processedData.icpDistribution = Object.entries(icpDistribution).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / processedData.totalLeads) * 100).toFixed(1)
      }));

      // Distribuição por score
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

      // Distribuição individual de scores
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

      setData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao processar planilha:', error);
      alert('Erro ao processar a planilha. Verifique se o formato está correto.');
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
      </div>

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
            accept=".xlsx,.xls"
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
                Formatos aceitos: .xlsx, .xls
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
          <h3 style={{ color: 'white' }}>Processando sua planilha...</h3>
          <p>Aguarde enquanto analisamos seus dados</p>
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
                    <th>Comportamento</th>
                    <th>Score Final</th>
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
                      <td>{lead.comportamentoCompra}</td>
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
