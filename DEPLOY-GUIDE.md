# 🚀 Guia Rápido: GitHub → Netlify

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- [ ] Conta no GitHub (https://github.com)
- [ ] Conta no Netlify (https://netlify.com) - pode usar login social do GitHub
- [ ] Git instalado no seu computador

---

## 🔥 Método 1: SUPER RÁPIDO (Recomendado)

### Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `dashboard-icp`
3. Deixe **privado** (ou público, sua escolha)
4. **NÃO** marque "Add a README file"
5. Clique em "Create repository"
6. **DEIXE A PÁGINA ABERTA** - você vai precisar das instruções

### Passo 2: Subir os Arquivos

Abra o terminal/prompt na pasta do projeto e execute:

```bash
# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Dashboard ICP - Versão inicial"

# Conectar ao GitHub (SUBSTITUA 'SEU-USUARIO' pelo seu usuário GitHub)
git remote add origin https://github.com/SEU-USUARIO/dashboard-icp.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

**Vai pedir usuário e senha do GitHub:**
- Usuário: seu username do GitHub
- Senha: use um **Personal Access Token** (não sua senha normal)

**Como criar o Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Marque: `repo` (todos os sub-items)
4. Generate token
5. **COPIE E SALVE** (não vai aparecer novamente!)
6. Use esse token como senha quando o Git pedir

### Passo 3: Deploy no Netlify

1. Acesse https://app.netlify.com/
2. Clique em **"Add new site"**
3. Escolha **"Import an existing project"**
4. Clique em **"Deploy with GitHub"**
5. Autorize o Netlify a acessar seu GitHub
6. Escolha o repositório `dashboard-icp`
7. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Deixe o resto como está
8. Clique em **"Deploy site"**

**Aguarde 2-3 minutos...**

✅ **PRONTO!** Seu dashboard está no ar!

O Netlify vai te dar uma URL tipo:
`https://seu-site-nome-aleatorio.netlify.app`

---

## 🎨 Método 2: Usando GitHub Desktop (Mais Fácil)

### Passo 1: Instalar GitHub Desktop

1. Baixe: https://desktop.github.com/
2. Instale e faça login com sua conta GitHub

### Passo 2: Adicionar o Projeto

1. Abra GitHub Desktop
2. File → Add Local Repository
3. Escolha a pasta `dashboard-icp-github`
4. Se pedir para criar, clique em "Create Repository"

### Passo 3: Publicar no GitHub

1. No GitHub Desktop, clique em **"Publish repository"**
2. Nome: `dashboard-icp`
3. Escolha se quer privado ou público
4. Clique em **"Publish repository"**

Pronto! Agora vá para o **Passo 3** do Método 1 (Deploy no Netlify)

---

## 🔄 Como Atualizar Depois

Quando você fizer mudanças no código:

### Usando Terminal:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

### Usando GitHub Desktop:

1. Escreva a descrição no campo "Summary"
2. Clique em "Commit to main"
3. Clique em "Push origin"

**O Netlify vai atualizar automaticamente!** 🎉

---

## 🎯 Personalizando a URL no Netlify

1. Acesse seu site no Netlify
2. Site settings → Domain management
3. Options → Edit site name
4. Escolha um nome: `seu-dashboard-icp`
5. Sua URL será: `https://seu-dashboard-icp.netlify.app`

---

## 📱 Testando o Site

Depois do deploy:

1. ✅ Acesse a URL do Netlify
2. ✅ Teste o upload de planilha
3. ✅ Verifique se os gráficos aparecem
4. ✅ Teste no celular também!

---

## 🆘 Problemas Comuns

### "Permission denied" ao fazer push

**Solução:** Use Personal Access Token em vez da senha normal
- GitHub → Settings → Developer settings → Personal access tokens
- Crie um token com permissão `repo`
- Use como senha quando o Git pedir

### Build falha no Netlify com erro de memória

**Solução:** O Netlify free tier às vezes tem limite
1. Vá em Site settings → Build & deploy → Environment
2. Adicione: `NODE_OPTIONS="--max-old-space-size=4096"`
3. Faça um novo deploy

### Site no ar mas mostra página em branco

**Solução:** Verifique o console do navegador (F12)
- Provavelmente erro de caminho
- Confirme que `vite.config.js` tem `base: '/'`

### Gráficos não carregam

**Solução:** 
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Tente em aba anônima
3. Verifique se a planilha está no formato correto

---

## 📊 Estrutura de Pastas no GitHub

Depois do upload, seu repositório terá:

```
dashboard-icp/
├── 📁 src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── 📄 index.html
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 netlify.toml
├── 📄 .gitignore
└── 📄 README.md
```

---

## ✨ Dicas Pro

1. **Domínio Customizado:**
   - Netlify → Domain settings → Add custom domain
   - Adicione seu domínio próprio (ex: dashboard.seusite.com.br)

2. **HTTPS Automático:**
   - Netlify ativa SSL automaticamente
   - Seu site sempre será https:// 🔒

3. **Preview de Branches:**
   - Crie uma branch nova no Git
   - Netlify cria preview automático
   - Teste antes de fazer merge

4. **Analytics:**
   - Netlify Analytics (pago, mas simples)
   - Ou adicione Google Analytics no index.html

5. **Senha no Site:**
   - Netlify → Site settings → Access control
   - Adicione password protection se quiser

---

## 🎓 Comandos Git Essenciais

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Desfazer mudanças não commitadas
git checkout .

# Ver diferenças
git diff

# Criar nova branch
git checkout -b nova-funcionalidade

# Voltar para main
git checkout main

# Atualizar do GitHub
git pull
```

---

## 🔗 Links Úteis

- **Seu Projeto GitHub:** https://github.com/SEU-USUARIO/dashboard-icp
- **Seu Site Netlify:** https://seu-site.netlify.app
- **Netlify Dashboard:** https://app.netlify.com/
- **GitHub Desktop:** https://desktop.github.com/
- **Documentação Vite:** https://vitejs.dev/
- **Documentação Netlify:** https://docs.netlify.com/

---

## 📞 Precisa de Ajuda?

Se encontrar qualquer problema:

1. Verifique os logs de build no Netlify
2. Abra o console do navegador (F12)
3. Consulte a documentação do Netlify
4. GitHub Issues do projeto

---

## ✅ Checklist Final

Antes de compartilhar o link:

- [ ] Site carrega sem erros
- [ ] Upload de arquivo funciona
- [ ] Gráficos aparecem corretamente
- [ ] Tabela mostra os dados
- [ ] Responsivo no mobile
- [ ] HTTPS ativo (cadeado verde)
- [ ] URL personalizada (opcional)

---

**🎉 Parabéns! Seu Dashboard ICP está no ar e pronto para uso profissional!**

*Qualquer atualização no código → git push → Netlify atualiza automaticamente!*
