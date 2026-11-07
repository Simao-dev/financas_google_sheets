# 💳 Finança — Web App Serverless de Gestão Financeira Pessoal

> Uma aplicação Web Full-Stack leve, moderna e responsiva de controle financeiro pessoal, construída sobre a infraestrutura serverless do **Google Apps Script** e **Google Sheets**.

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-10B981)
![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_CSS3_%7C_JS_ES6+_%7C_GAS-7C3AED)

---

## 🌟 Destaques do Projeto

* **Backend Serverless no Google Apps Script**: Sem custos de hospedagem e com integração nativa com o ecossistema Google.
* **Google Sheets como Banco de Dados Relacional**: Modelagem em abas estruturadas com IDs sequenciais (`Contas`, `Cartoes`, `Transacoes`, `Faturas_Cartao`, `Metas`, `Orcamentos`, `Notificacoes`, `Usuario`, `Categorias`).
* **Arquitetura SPA (Single Page Application)**: Navegação fluida e instantânea sem recarregamento de página.
* **Inteligência de Cartão de Crédito**:
  * Projeção automática de compras parceladas ($1/N$).
  * Cálculo dinâmico do ciclo de fechamento e vencimento: compras efetuadas no dia de fechamento ou após são transferidas automaticamente para a fatura seguinte (`dia_compra >= dia_fechamento`).
  * Agrupamento e consolidação automática de compras pendentes na aba `Transacoes`.
  * Liquidação e baixa em cadeia: ao quitar uma fatura consolidada, todas as parcelas associadas na aba `Faturas_Cartao` são baixadas simultaneamente (`Pago`).
* **Dashboard Interativo & Métricas em Tempo Real**:
  * **KPI Receitas do Mês**: Soma das entradas do mês vigente na aba `Transacoes`, com variação percentual comparativa (vs. mês anterior).
  * **KPI Despesas do Mês**: Soma das saídas do mês vigente na aba `Transacoes`, com **semântica de cor invertida** (redução de gastos $\le 0\%$ exibida em **Verde** como economia; aumento $> 0\%$ exibido em **Vermelho**).
  * **KPI Despesas Cartão**: Soma das parcelas pendentes com vencimento no mês atual na aba `Faturas_Cartao`, comparada ao total geral (pagas + pendentes) do mês anterior.
  * **Rótulos de Período Dinâmicos**: Exibição em tempo real do mês e ano de referência nos cards de KPI (ex: `11/2026`).
  * **Gráfico de Fluxo de Caixa (Chart.js)**: Linha vermelha para Despesas Pagas e linha verde para Receitas da aba `Transacoes`, com seletores interativos de horizonte temporal (`3m`, `6m`, `1a`).
  * **Despesas por Categoria (Rosca)**: Distribuição percentual com paleta dinâmica em HSL e legendas detalhadas.
* **Privacidade & Personalização**:
  * Modo ocultar saldos com filtro de desfoque (`privacy blur`), persistido nas preferências do perfil.
  * Alternância entre temas Claro e Escuro.
  * Cadastro e personalização dinâmica de novas categorias.

---

## 🛠️ Tecnologias Utilizadas

### Front-End:
* **HTML5 Semântico**: Layout estruturado, limpo e acessível.
* **CSS3 Moderno**: CSS Grid, Flexbox, Variáveis CSS (`:root`) e Design Responsivo (Mobile-First).
* **JavaScript (ES6+)**: Manipulação reativa do DOM, gerenciamento de estado global (`AppState`) e chamadas assíncronas.
* **Chart.js v3+ & Font Awesome v6**: Gráficos dinâmicos em canvas e iconografia moderna.

### Back-End / Persistência:
* **Google Apps Script (GAS)**: `HtmlService`, endpoints serverless (`google.script.run`) e regras de negócio transacionais.
* **Google Sheets API**: Leitura e gravação relacional em lote via `SpreadsheetApp`.

---

## 📊 Arquitetura e Fluxo de Dados

```text
┌────────────────────────────────────────────────────────┐
│                   NAVEGADOR (CLIENT)                   │
│  Index.html + style.html (CSS) + app.html (JS ES6+)    │
│  State: AppState (Reatividade local + Chart.js)        │
└───────────────────────────┬────────────────────────────┘
                            │ google.script.run (Assíncrono)
┌───────────────────────────▼────────────────────────────┐
│                   SERVERLESS (BACKEND)                 │
│  Code.gs (CRUD, Ciclo de Cartão, Aportes, Estornos)    │
└───────────────────────────┬────────────────────────────┘
                            │ SpreadsheetApp API
┌───────────────────────────▼────────────────────────────┐
│                   PERSISTÊNCIA (DATABASE)              │
│  Google Sheets (Abas relacionais com IDs sequenciais)  │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco de Dados (Google Sheets)

| Aba | Descrição dos Dados |
| :--- | :--- |
| **`Contas`** | Contas correntes, carteiras e investimentos com respectivos saldos. |
| **`Cartoes`** | Cartões de crédito, limites totais, dias de fechamento e vencimento. |
| **`Transacoes`** | Lançamentos de receitas, despesas em conta, transferências e faturas consolidadas. |
| **`Faturas_Cartao`** | Registro detalhado de parcelas de cartão, datas de ciclo e status de liquidação. |
| **`Metas`** | Objetivos financeiros, valores alvo, montantes acumulados e prazos. |
| **`Orcamentos`** | Tetos de gastos mensais estipulados por categoria. |
| **`Notificacoes`** | Central de avisos, confirmações e alertas do sistema. |
| **`Usuario`** | Perfil do usuário e preferências persistidas de tema e privacidade. |
| **`Categorias`** | Cadastro dinâmico de categorias para classificação de lançamentos. |

---

## ⚙️ Como Executar o Projeto

1. Abra o [Google Drive](https://drive.google.com) e crie uma nova **Planilha Google**.
2. No menu superior da planilha, acesse **Extensões** > **Apps Script**.
3. Crie os seguintes arquivos no editor do Apps Script, colando os respectivos códigos do repositório:
   - `Code.gs` *(Código do Servidor)*
   - `Index.html` *(Interface Principal)*
   - `app.html` *(Lógica JavaScript Client-Side)*
   - `style.html` *(Estilos CSS)*
4. Clique em **Implantar** > **Nova Implantação**.
5. Selecione o tipo **App da Web**, configure o acesso para **Qualquer Pessoa** (ou **Somente Você**) e conclua a implantação para obter o link do seu Web App.

---

## 👤 Autor

Desenvolvido por **Pedro Soares**

* **LinkedIn:** [linkedin.com/in/pedro-simao-dev](https://www.linkedin.com/in/pedro-simao-dev)
* **GitHub:** [github.com/Simao-dev](https://github.com/Simao-dev)

