# 📊 Dashboard ICP - Análise de Qualificação de Leads

Dashboard interativo para análise de perfil de cliente ideal (ICP) com upload de planilhas Excel e visualizações em tempo real.

![Dashboard Preview](https://img.shields.io/badge/Status-Pronto%20para%20Deploy-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)

## 🚀 Deploy Rápido

### Opção 1: Deploy Automático no Netlify (Recomendado)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Clique no botão acima
2. Conecte seu repositório GitHub
3. O Netlify vai detectar automaticamente as configurações
4. Deploy feito! 🎉

### Opção 2: Deploy Manual

1. **Subir para o GitHub:**

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Dashboard ICP - Primeira versão"

# Conectar ao seu repositório GitHub (substitua com seu link)
git remote add origin https://github.com/SEU-USUARIO/dashboard-icp.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

2. **Deploy no Netlify:**

- Acesse [Netlify](https://app.netlify.com/)
- Clique em "Add new site" → "Import an existing project"
- Conecte sua conta GitHub
- Selecione o repositório `dashboard-icp`
- Configurações detectadas automaticamente:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Clique em "Deploy site"
- Pronto! Seu site estará no ar em minutos

## 📁 Estrutura do Projeto

```
dashboard-icp/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos do dashboard
│   ├── main.jsx         # Ponto de entrada
│   └── index.css        # Estilos globais
├── index.html           # HTML base
├── package.json         # Dependências
├── vite.config.js       # Configuração Vite
├── netlify.toml         # Configuração Netlify
├── .gitignore          # Arquivos ignorados
└── README.md           # Este arquivo
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:5173
```

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Testar build localmente
npm run preview
```

## 📊 Como Usar

1. **Upload da Planilha:**
   - Arraste e solte sua planilha Excel (.xlsx)
   - Ou clique para selecionar o arquivo

2. **Formato da Planilha:**
   
   A planilha deve conter as seguintes colunas:
   
   | Coluna | Tipo | Valores |
   |--------|------|---------|
   | Nome | Texto | Nome do lead |
   | Renda | Número | 0-4 pontos |
   | Escolaridade | Número | 1-3 pontos |
   | Produto Digital | Número | 0-3 pontos |
   | Tempo semanal | Número | 1-3 pontos |
   | Comportamento de Compra | Número | 0-3 pontos |
   | ScoreFinal | Número | Soma total |
   | ICP | Texto | Classificação |

3. **Visualizações:**
   - 4 cards com métricas principais
   - Gráfico de pizza: Distribuição por ICP
   - Gráfico de barras: Leads por faixa de score
   - Gráfico de linha: Distribuição de scores
   - Tabela completa com todos os leads

## 🎨 Paleta de Cores

```css
/* Fundos */
--bg-primary: #0c121c;      /* Azul escuro */
--bg-card: #1a2332;         /* Azul médio */
--bg-secondary: #2a3441;    /* Azul acinzentado */

/* Destaque */
--accent-primary: #d2bc8f;  /* Dourado */
--accent-hover: #e6d0a3;    /* Dourado claro */

/* Texto */
--text-primary: #ffffff;    /* Branco */
--text-secondary: #888888;  /* Cinza */

/* ICP Colors */
--elite: #10b981;           /* Verde */
--black: #3b82f6;           /* Azul */
--regular: #f59e0b;         /* Laranja */
--baixo: #ef4444;           /* Vermelho */
```

## 📦 Dependências Principais

- **React 18.2** - Framework UI
- **Recharts 2.10** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos
- **XLSX 0.18** - Processamento de planilhas Excel
- **Vite 5.0** - Build tool ultra-rápido

## 🔧 Configuração do Netlify

O arquivo `netlify.toml` está configurado para:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Isso garante:
- Build automático quando você fizer push
- SPA routing funcionando corretamente
- Deploy rápido e otimizado

## 🌐 Variáveis de Ambiente (Opcional)

Se precisar adicionar variáveis de ambiente no Netlify:

1. Vá em "Site settings" → "Build & deploy" → "Environment"
2. Adicione suas variáveis
3. Prefixe com `VITE_` para usar no código:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📱 Responsividade

O dashboard é 100% responsivo e funciona perfeitamente em:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🔒 Segurança

- ✅ Sem backend - processamento client-side
- ✅ Dados não são enviados para servidor
- ✅ Planilhas processadas localmente no navegador
- ✅ Privacidade total dos dados

## 🐛 Troubleshooting

### Build falha no Netlify

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Gráficos não aparecem

- Verifique se a planilha tem o formato correto
- Confirme que todas as colunas estão presentes
- Veja o console do navegador para erros

### Upload não funciona

- Confirme que o arquivo é .xlsx ou .xls
- Verifique o tamanho do arquivo (< 10MB)
- Teste com a planilha de exemplo

## 📈 Próximos Passos

- [ ] Adicionar export de relatórios em PDF
- [ ] Implementar filtros avançados
- [ ] Criar comparação entre períodos
- [ ] Adicionar gráficos adicionais
- [ ] Implementar autenticação (opcional)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

**Everton Rodrigues**  
Estrategista Digital | Especialista em Análise Comportamental

---

**Desenvolvido com 💛 usando React + Vite**

## 🆘 Suporte

Encontrou algum problema? Abra uma issue ou entre em contato!

---

### ✅ Checklist de Deploy

- [ ] Código commitado no GitHub
- [ ] Repositório conectado ao Netlify
- [ ] Build passou sem erros
- [ ] Site acessível na URL do Netlify
- [ ] Upload de planilha funcionando
- [ ] Gráficos renderizando corretamente
- [ ] Layout responsivo testado
- [ ] Performance otimizada

🎉 **Parabéns! Seu Dashboard ICP está no ar!**
