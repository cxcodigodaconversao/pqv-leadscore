# 📋 Exemplo de Planilha ICP

## Formato Esperado

Sua planilha Excel (.xlsx) deve seguir este formato:

### Colunas Obrigatórias:

| # | Nome da Coluna | Tipo | Valores Aceitos | Descrição |
|---|----------------|------|-----------------|-----------|
| 1 | Nome | Texto | Qualquer texto | Nome completo do lead |
| 2 | Renda | Número | 0, 1, 2, 3 ou 4 | Pontuação de renda |
| 3 | Escolaridade | Número | 1, 2 ou 3 | Pontuação de escolaridade |
| 4 | Produto Digital | Número | 0, 1, 2 ou 3 | Pontuação de produto digital |
| 5 | Tempo semanal | Número | 1, 2 ou 3 | Pontuação de tempo disponível |
| 6 | Comportamento de Compra | Número | 0, 1, 2 ou 3 | Pontuação de comportamento |
| 7 | ScoreFinal | Número | Soma dos anteriores | Score total calculado |
| 8 | ICP | Texto | Ver classificações | Categoria ICP do lead |

## 📊 Critérios de Pontuação

### 1. Renda (0-4 pontos)
- **4 pontos:** +20k
- **3 pontos:** 10k-20k
- **2 pontos:** 5k-10.5k
- **1 ponto:** 3k-5k
- **0 pontos:** Abaixo de 3k

### 2. Escolaridade (1-3 pontos)
- **3 pontos:** Pós-graduação / Mestrado / Doutorado
- **2 pontos:** Superior completo
- **1 ponto:** Ensino médio

### 3. Produto Digital (0-3 pontos)
- **3 pontos:** Já vende bem
- **2 pontos:** Tem, mas vende pouco
- **1 ponto:** Tentou / tem ideia
- **0 pontos:** Não tem

### 4. Tempo Semanal (1-3 pontos)
- **3 pontos:** +20h ou 11-20h
- **2 pontos:** 6-10h
- **1 ponto:** 2-5h

### 5. Comportamento de Compra (0-3 pontos)
- **3 pontos:** Pagou à vista / PIX alto / entrada alta
- **2 pontos:** Cartão com limite
- **1 ponto:** Parcelamento recorrente
- **0 pontos:** Sem dado / não pagou / saiu

## 🎯 Classificação ICP (baseada no ScoreFinal)

| Classificação | Score | Descrição |
|--------------|-------|-----------|
| **ICP 1 ELITE** | 13-16 pontos | Leads premium, maior potencial |
| **ICP 1 BLACK** | 10-12 pontos | Leads qualificados, alto valor |
| **ICP 2** | 6-9 pontos | Leads com potencial moderado |
| **ICP 3** | 1-5 pontos | Leads com menor prioridade |

## 📝 Exemplo de Dados

```
Nome                    | Renda | Escola | Produto | Tempo | Compra | Score | ICP
------------------------|-------|--------|---------|-------|--------|-------|-------------
Patricia Cardoso        | 4     | 3      | 3       | 3     | 3      | 16    | ICP 1 ELITE
Iriane                  | 3     | 2      | 3       | 3     | 3      | 14    | ICP 1 ELITE
Larissa Carvalho        | 3     | 2      | 2       | 3     | 2      | 12    | ICP 1 BLACK
Dra. Isabela Rodrigues  | 3     | 2      | 2       | 2     | 2      | 11    | ICP 1 BLACK
Ana Catarina            | 2     | 2      | 2       | 2     | 2      | 10    | ICP 1 BLACK
Samanta Rocha           | 2     | 2      | 2       | 1     | 2      | 9     | ICP 2
Gabriela                | 3     | 2      | 0       | 1     | 2      | 8     | ICP 2
Bia Correa              | 2     | 2      | 1       | 1     | 1      | 7     | ICP 2
Mariana Moulaz          | 2     | 2      | 0       | 1     | 1      | 6     | ICP 2
Jonas Fortes            | 0     | 1      | 0       | 0     | 1      | 2     | ICP 3
```

## ⚠️ Regras Importantes

1. **Primeira linha DEVE ser o cabeçalho** com os nomes das colunas exatamente como mostrado
2. **Não deixe células vazias** - use 0 para valores não preenchidos
3. **Nomes das colunas são case-sensitive** - respeite maiúsculas/minúsculas
4. **ScoreFinal** deve ser a soma de todas as pontuações
5. **ICP** deve seguir exatamente o padrão: "ICP 1 ELITE", "ICP 1 BLACK", "ICP 2", "ICP 3"

## 🔧 Como Criar Sua Planilha

### Opção 1: Excel / Google Sheets

1. Abra Excel ou Google Sheets
2. Crie as 8 colunas conforme tabela acima
3. Preencha com os dados dos seus leads
4. Salve como .xlsx

### Opção 2: Usar Planilha Existente

Se você já tem uma planilha com dados de leads:

1. Adicione as colunas necessárias
2. Calcule a pontuação para cada critério
3. Some para obter o ScoreFinal
4. Classifique em ICP baseado no score

### Opção 3: Importar de Formulário

Se você coleta dados via formulário:

1. Exporte os dados para Excel
2. Crie uma coluna para cada critério de pontuação
3. Use fórmulas do Excel para calcular automaticamente:

```excel
// Exemplo de fórmula para calcular ScoreFinal
=SOMA(B2:F2)

// Exemplo de fórmula para classificar ICP
=SE(G2>=13;"ICP 1 ELITE";SE(G2>=10;"ICP 1 BLACK";SE(G2>=6;"ICP 2";"ICP 3")))
```

## 💡 Dicas

- **Mantenha um backup** da planilha original
- **Padronize os nomes** dos leads (sem abreviações estranhas)
- **Revise as pontuações** antes de fazer upload
- **Teste com poucos leads primeiro** para ver se está funcionando
- **Use a planilha de exemplo** que já vem com o projeto

## 🎯 Planilha de Exemplo Incluída

O projeto já vem com uma planilha de exemplo (`ICP_PQV_COMPLETO_V2.xlsx`) que você pode usar como referência ou para testar o dashboard.

Você encontra na pasta raiz do projeto.

## ❓ FAQ

**P: Posso ter mais colunas na planilha?**  
R: Sim! O dashboard vai ignorar colunas extras. Mas as 8 colunas obrigatórias devem estar presentes.

**P: E se eu não tiver todos os dados de um lead?**  
R: Use 0 para pontuações não disponíveis. O lead ainda será processado.

**P: Posso mudar os nomes das colunas?**  
R: Não. Os nomes devem ser exatamente como especificado para o dashboard funcionar.

**P: Qual o tamanho máximo da planilha?**  
R: Recomendamos até 1000 leads por arquivo para melhor performance.

**P: Posso usar .xls (formato antigo)?**  
R: Sim, o dashboard aceita .xls e .xlsx.

---

**💡 Dica Final:** Mantenha um template da planilha salvo para reutilizar sempre que precisar fazer novas análises!
