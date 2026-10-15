# 💳 Finança — Web App Serverless de Gestão Financeira Pessoal

> Uma aplicação Web Full-Stack leve, moderna e responsiva de controle financeiro pessoal, construída sobre a infraestrutura serverless do **Google Apps Script** e **Google Sheets**.

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-10B981)
![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_CSS3_%7C_JS_ES6+_%7C_GAS-7C3AED)

---

## 🌟 Destaques do Projeto

* **Backend Serverless no Google Apps Script**: Sem custos de hospedagem e com integração nativa com o ecossistema Google.
* **Google Sheets como Banco de Dados Relacional**: Modelagem em abas estruturadas (`Contas`, `Cartoes`, `Transacoes`, `Faturas_Cartao`, `Metas`, `Orcamentos`, etc.).
* **Arquitetura SPA (Single Page Application)**: Navegação fluida sem recarregamento de página.
* **Inteligência de Cartão de Crédito**:
  * Projeção automática de parcelamentos ($1/N$).
  * Cálculo dinâmico de datas de fechamento e vencimento de fatura.
  * Baixa em cadeia ao realizar pagamento da fatura consolidada.
* **Dashboard Interativo com Chart.js**: Gráficos de fluxo de caixa (linha) e despesas por categoria (rosca) com suporte a paletas dinâmicas HSL.
* **Privacidade & Personalização**:
  * Modo ocultar saldos com filtro de desfoque (`privacy blur`).
  * Alternância entre temas (Escuro / Claro / Sistema).
  * Categorias personalizadas dinâmicas.

---

## 🛠️ Tecnologias Utilizadas

### Front-End:
* **HTML5 Semântico**: Layout estruturado e acessível.
* **CSS3 Moderno**: CSS Grid, Flexbox, Variáveis CSS (`:root`) e Design Responsivo (Mobile-First).
* **JavaScript (ES6+)**: Manipulação reativa do DOM, gerenciamento de estado global (`AppState`), rotinas assíncronas (`Promises`).
* **Chart.js v3+ & Font Awesome v6**: Visualização de dados dinâmica e iconografia moderna.

### Back-End / Persistência:
* **Google Apps Script (GAS)**: `HtmlService`, endpoints serverless e validações de regra de negócio.
* **Google Sheets API**: Leitura/escrita em lote para otimização de cotas.

---

## 📊 Arquitetura e Fluxo de Dados

```text
┌────────────────────────────────────────────────────────┐
│                   NAVEGADOR (CLIENT)                   │
│  Index.html + style.html (CSS) + app.html (JS ES6+)    │
│  State: AppState (Reatividade local + Chart.js)        │
└───────────────────────────┬────────────────────────────┘
                            │ google.script.run (Assíncrono)
┌───────────────────────────▼────────────────────────────┘
│                   SERVERLESS (BACKEND)                 │
│  Code.gs (CRUD, Regras de Cartão, Aportes, Estornos)   │
└───────────────────────────┬────────────────────────────┘
                            │ SpreadsheetApp API
┌───────────────────────────▼────────────────────────────┘
│                   PERSISTÊNCIA (DATABASE)              │
│  Google Sheets (Abas relacionais com IDs sequenciais)  │
└────────────────────────────────────────────────────────┘


⚙️ Como Executar o Projeto

1. Abra o Google Drive e crie uma nova Planilha Google.

2. No menu superior, acesse Extensões > Apps Script.

3. Crie os arquivos conforme o repositório:

3.1 Code.gs (Código do Servidor)

3.2 Index.html (Interface Principal)

3.3 app.html (Lógica JavaScript Client-Side)

3.4 style.html (Estilos CSS)

4. Clique em Implantar > Nova Implantação.

5. Escolha o tipo App da Web, configure o acesso para Qualquer Pessoa (ou Somente Você) e execute o Web App!

👤 Autor
Desenvolvido por Pedro Soares

LinkedIn: www.linkedin.com/in/pedro-simao-dev

GitHub: https://github.com/Simao-dev