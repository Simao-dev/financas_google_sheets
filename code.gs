
// Finança — Gestão Financeira Pessoal


const SHEETS = {
  CONTAS: 'Contas',
  CARTOES: 'Cartoes',
  TRANSACOES: 'Transacoes',
  FATURAS_CARTAO: 'Faturas_Cartao',
  METAS: 'Metas',
  ORCAMENTOS: 'Orcamentos',
  NOTIFICACOES: 'Notificacoes',
  USUARIO: 'Usuario',
  CATEGORIAS: 'Categorias'
};

function doGet() {
  ensureSpreadsheetStructure();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Finança — Gestão Financeira Pessoal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function ensureSpreadsheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const structures = [
    { name: SHEETS.CONTAS, headers: ['ID', 'Nome', 'Tipo', 'Saldo'] },
    { name: SHEETS.CARTOES, headers: ['ID', 'Nome', 'Ultimos4Digitos', 'LimiteTotal', 'DiaFechamento', 'DiaVencimento', 'Estilo'] },
    { name: SHEETS.TRANSACOES, headers: ['ID', 'Descricao', 'Valor', 'Data', 'Tipo', 'Categoria', 'Conta', 'SourceType', 'Status'] },
    { name: SHEETS.FATURAS_CARTAO, headers: ['ID', 'Cartao', 'Descricao', 'ValorParcela', 'Categoria', 'DataCompra', 'DataFechamento', 'DataVencimento', 'ParcelaNum', 'TotalParcelas', 'Status'] },
    { name: SHEETS.METAS, headers: ['ID', 'Titulo', 'ValorAlvo', 'Acumulado', 'DataAlvo'] },
    { name: SHEETS.ORCAMENTOS, headers: ['ID', 'Categoria', 'LimiteMensal'] },
    { name: SHEETS.NOTIFICACOES, headers: ['ID', 'Titulo', 'Mensagem', 'TempoAgo', 'Tipo', 'Lida'] },
    { name: SHEETS.USUARIO, headers: ['ID', 'NomeCompleto', 'Email', 'Tema', 'OcultarSaldos'] },
    // Estrutura da aba Categorias (Coluna A: ID, Coluna B: Categoria)
    { name: SHEETS.CATEGORIAS, headers: ['ID', 'Categoria'] }
  ];

  structures.forEach(struct => {
    let sheet = ss.getSheetByName(struct.name);
    if (!sheet) {
      sheet = ss.insertSheet(struct.name);
      sheet.appendRow(struct.headers);
      sheet.getRange(1, 1, 1, struct.headers.length).setFontWeight('bold');
      
      // Se for a primeira vez criando a aba Categorias, insere categorias padrão
      if (struct.name === SHEETS.CATEGORIAS) {
        const padroes = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Streaming', 'Educação', 'Salário', 'Freelance', 'Lazer', 'Contas', 'Investimentos', 'Outros'];
        padroes.forEach((cat, idx) => {
          sheet.appendRow([`cat-${idx + 1}`, cat]);
        });
      }
    }
  });
}

function generateSequentialId(sheetName, prefix) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) return `${prefix}-1`;

  let maxNum = 0;
  for (let i = 1; i < data.length; i++) {
    const idCell = String(data[i][0] || '');
    if (idCell.startsWith(prefix + '-')) {
      const parts = idCell.split('-');
      const numPart = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  return `${prefix}-${maxNum + 1}`;
}

function getInitialData() {
  ensureSpreadsheetStructure();

  return {
    userProfile: getUserProfile(),
    accounts: getAccounts(),
    cards: getCards(),
    transactions: getTransactions(),
    goals: getGoals(),
    budgets: getBudgets(),
    notifications: getNotifications(),
    categories: getCategories() // Retorna as categorias do banco
  };
}


// Busca todas as categorias da aba Categorias

function getCategories() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CATEGORIAS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    nome: String(r[1]).trim()
  })).filter(c => c.nome !== '');
}


// Cadastra uma nova Categoria na aba Categorias

function addCategory(p) {
  if (!p.nome || p.nome.trim() === '') {
    throw new Error('O nome da categoria não pode ser vazio.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CATEGORIAS);
  const nomeCat = p.nome.trim();

  // Verifica duplicação (case insensitive)
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === nomeCat.toLowerCase()) {
      throw new Error('Esta categoria já está cadastrada.');
    }
  }

  const id = generateSequentialId(SHEETS.CATEGORIAS, 'cat');
  sheet.appendRow([id, nomeCat]);

  return { success: true };
}

function getUserProfile() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USUARIO);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { name: 'Jhon', fullname: 'Jhon Doe', email: 'usuario@exemplo.com', theme: 'Escuro', hideBalances: false };

  const row = data[1];
  const fullname = row[1] || 'Jhon Doe';
  const nameParts = fullname.trim().split(' ');

  return {
    id: row[0],
    fullname: fullname,
    name: nameParts[0] || 'Jhon',
    email: row[2] || '',
    theme: row[3] || 'Escuro',
    hideBalances: row[4] === 'Sim'
  };
}

function getAccounts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONTAS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    nome: r[1],
    tipo: r[2],
    saldo: Number(r[3] || 0)
  }));
}

function getCards() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CARTOES);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    nome: r[1],
    digitos: String(r[2]),
    limite: Number(r[3] || 0),
    fechamento: Number(r[4] || 1),
    vencimento: Number(r[5] || 1),
    estilo: r[6] || 'card-purple'
  }));
}

function getTransactions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Transações Diretas de Conta
  const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
  let listTransacoes = [];
  if (txSheet && txSheet.getLastRow() >= 2) {
    const txData = txSheet.getDataRange().getValues();
    listTransacoes = txData.slice(1).map(r => ({
      id: String(r[0]),
      descricao: r[1],
      valor: Number(r[2] || 0),
      data: formatDateISO(r[3]),
      tipo: r[4],
      categoria: r[5],
      conta: r[6],
      sourceType: r[7] || 'conta',
      status: r[8] || 'Pago'
    }));
  }

  // Compras de Cartão de Crédito
  const fatSheet = ss.getSheetByName(SHEETS.FATURAS_CARTAO);
  let listFaturas = [];
  if (fatSheet && fatSheet.getLastRow() >= 2) {
    const fatData = fatSheet.getDataRange().getValues();
    listFaturas = fatData.slice(1).map(r => ({
      id: String(r[0]),
      descricao: r[2],               
      valor: Number(r[3] || 0),      
      categoria: r[4] || 'Outros',   
      data: formatDateISO(r[5]),     
      dataFechamento: formatDateISO(r[6]), 
      dataVencimento: formatDateISO(r[7]), 
      tipo: 'Despesa',
      conta: r[1],                   
      sourceType: 'cartao_parcela',
      status: r[10] === 'Pago' ? 'Pago' : 'Pendente' 
    }));
  }

  const listaCompleta = [...listTransacoes, ...listFaturas];
  return listaCompleta.sort((a, b) => new Date(b.data) - new Date(a.data));
}

function getGoals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.METAS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    titulo: r[1],
    alvo: Number(r[2] || 0),
    acumulado: Number(r[3] || 0),
    dataAlvo: formatDateISO(r[4])
  }));
}

function getBudgets() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ORCAMENTOS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    categoria: r[1],
    limite: Number(r[2] || 0)
  }));
}

function getNotifications() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.NOTIFICACOES);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1).map(r => ({
    id: String(r[0]),
    titulo: r[1],
    mensagem: r[2],
    tempoAgo: r[3],
    tipo: r[4],
    lida: r[5] === true || r[5] === 'TRUE'
  })).reverse();
}


// Registra Transações de Contas ou Compras Parceladas no Cartão


function calcularCicloFatura(dataCompraStr, diaFechamento, diaVencimento, parcelaIndex = 0) {
  const parts = dataCompraStr.split('-');
  const ano = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10) - 1; 
  const dia = parseInt(parts[2], 10);

  let dataFechamento = new Date(ano, mes, diaFechamento);

  // Se a compra foi realizada NO DIA do fechamento ou DEPOIS, vai para o próximo fechamento
  if (dia >= diaFechamento) {
    dataFechamento.setMonth(dataFechamento.getMonth() + 1);
  }

  // Defasagem das parcelas futuras
  dataFechamento.setMonth(dataFechamento.getMonth() + parcelaIndex);

  // Data de Vencimento (Mês seguinte ou mesmo mês, dependendo dos dias)
  let dataVencimento = new Date(dataFechamento.getFullYear(), dataFechamento.getMonth(), diaVencimento);
  if (diaVencimento <= diaFechamento) {
    dataVencimento.setMonth(dataVencimento.getMonth() + 1);
  }

  const formatISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    dataFechamento: formatISO(dataFechamento),
    dataVencimento: formatISO(dataVencimento)
  };
}

function calcularDataVencimentoFatura(dataCompraStr, diaFechamento, diaVencimento, parcelaIndex = 0) {
  const parts = dataCompraStr.split('-');
  const ano = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10) - 1; 
  const dia = parseInt(parts[2], 10);

  let dataCiclo = new Date(ano, mes, 1);

  // Se a compra foi feita no dia de fechamento ou depois, pertence ao próximo ciclo
  if (dia >= diaFechamento) {
    dataCiclo.setMonth(dataCiclo.getMonth() + 1);
  }

  // Adiciona a defasagem das parcelas
  dataCiclo.setMonth(dataCiclo.getMonth() + parcelaIndex);

  let mesVencimento = dataCiclo.getMonth();
  let anoVencimento = dataCiclo.getFullYear();

  // Se o dia de vencimento for menor ou igual ao dia de fechamento, o vencimento cai no mês seguinte ao fechamento do ciclo
  if (diaVencimento <= diaFechamento) {
    mesVencimento += 1;
    if (mesVencimento > 11) {
      mesVencimento = 0;
      anoVencimento += 1;
    }
  }

  // Ajusta para o último dia do mês se o mês tiver menos dias que o diaVencimento (ex: fev/28)
  const ultimoDiaMes = new Date(anoVencimento, mesVencimento + 1, 0).getDate();
  const diaFinal = Math.min(diaVencimento, ultimoDiaMes);

  const mesFormatted = String(mesVencimento + 1).padStart(2, '0');
  const diaFormatted = String(diaFinal).padStart(2, '0');

  return `${anoVencimento}-${mesFormatted}-${diaFormatted}`;
}

function addTransaction(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const isCard = checkIsCard(p.origem);

  if (!isCard) {
    const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
    const id = generateSequentialId(SHEETS.TRANSACOES, 'tx');
    txSheet.appendRow([
      id, p.descricao, p.valor, p.data, p.tipo, p.categoria, p.origem, 'conta', p.status
    ]);

    if (p.status === 'Pago') {
      updateAccountBalance(p.origem, p.tipo === 'Despesa' ? -p.valor : p.valor);
    }
  } else {
    const cardSheet = ss.getSheetByName(SHEETS.FATURAS_CARTAO);
    const cartaoObj = getCards().find(c => c.nome === p.origem);
    if (!cartaoObj) throw new Error('Cartão não encontrado.');

    const numParcelas = parseInt(p.parcelas || 1, 10);
    const valorParcela = Number((p.valor / numParcelas).toFixed(2));
    const currentFatIdStr = generateSequentialId(SHEETS.FATURAS_CARTAO, 'fat');
    let baseFatNum = parseInt(currentFatIdStr.replace('fat-', ''), 10);

    for (let i = 0; i < numParcelas; i++) {
      const descParcela = numParcelas > 1 ? `${p.descricao} (${i + 1}/${numParcelas})` : p.descricao;
      const idFat = `fat-${baseFatNum + i}`;

      const ciclo = calcularCicloFatura(p.data, cartaoObj.fechamento, cartaoObj.vencimento, i);

      cardSheet.appendRow([
        idFat,
        p.origem,
        descParcela,
        valorParcela,
        p.categoria || 'Outros',
        p.data,                
        ciclo.dataFechamento,  
        ciclo.dataVencimento,  
        i + 1,
        numParcelas,
        'Pendente'
      ]);
    }
  }

  return { success: true };
}

function processarFaturasMensais() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const faturasSheet = ss.getSheetByName(SHEETS.FATURAS_CARTAO);
  const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);

  if (!faturasSheet || !txSheet) {
    Logger.log('Erro: Abas Faturas_Cartao ou Transacoes não encontradas.');
    return;
  }

  const fatData = faturasSheet.getDataRange().getValues();
  if (fatData.length < 2) {
    Logger.log('Nenhuma compra/parcela encontrada na aba Faturas_Cartao.');
    return;
  }

  // Data atual no formato ISO (YYYY-MM-DD)
  const hoje = new Date();
  const hojeISO = formatDateISO(hoje);

  const faturasAgrupadas = {};

  for (let i = 1; i < fatData.length; i++) {
    const row = fatData[i];

    const nomeCartao = String(row[1] || '').trim(); 
    const valor = Number(row[3] || 0);              
    const rawDataFechamento = row[6];               
    const rawDataVencimento = row[7];               
    const status = String(row[10] || '').trim();    

    if (status === 'Pendente' && nomeCartao !== '') {
      const dataFechamento = formatDateISO(rawDataFechamento);

      // A fatura só é consolidada se HOJE for igual ou posterior à DataFechamento
      if (hojeISO >= dataFechamento) {
        const dataVencimento = formatDateISO(rawDataVencimento);

        let mesAnoRef = '--/----';
        if (dataVencimento && dataVencimento.includes('-')) {
          const partsVenc = dataVencimento.split('-');
          mesAnoRef = `${partsVenc[1]}/${partsVenc[0]}`;
        } else if (dataFechamento && dataFechamento.includes('-')) {
          const partsFech = dataFechamento.split('-');
          mesAnoRef = `${partsFech[1]}/${partsFech[0]}`;
        }

        const chave = `${nomeCartao}_${dataFechamento}`;

        if (!faturasAgrupadas[chave]) {
          faturasAgrupadas[chave] = {
            nomeCartao: nomeCartao,
            dataFechamento: dataFechamento,
            dataVencimento: dataVencimento,
            mesAnoRef: mesAnoRef,
            valorTotal: 0
          };
        }

        faturasAgrupadas[chave].valorTotal += valor;
      }
    }
  }

  const chavesEnc = Object.keys(faturasAgrupadas);
  Logger.log(`Faturas fechadas prontas para consolidação: ${chavesEnc.length}`);

  if (chavesEnc.length === 0) return;

  const txData = txSheet.getDataRange().getValues();

  chavesEnc.forEach(chave => {
    const fat = faturasAgrupadas[chave];
    const descFatura = `Fatura ${fat.mesAnoRef} - ${fat.nomeCartao}`;
    let txRowIndex = -1;

    for (let j = 1; j < txData.length; j++) {
      if (String(txData[j][1]).trim() === descFatura && txData[j][7] === 'cartao_consolidado') {
        txRowIndex = j + 1;
        break;
      }
    }

    if (txRowIndex !== -1) {
      if (txData[txRowIndex - 1][8] === 'Pendente') {
        txSheet.getRange(txRowIndex, 3).setValue(fat.valorTotal);
        txSheet.getRange(txRowIndex, 4).setValue(fat.dataFechamento);
        Logger.log(`Fatura atualizada na linha ${txRowIndex}: ${descFatura} -> R$ ${fat.valorTotal}`);
      }
    } else {
      const idTx = generateSequentialId(SHEETS.TRANSACOES, 'tx');
      txSheet.appendRow([
        idTx,
        descFatura,
        fat.valorTotal,
        fat.dataFechamento,
        'Despesa',
        'Cartão de Crédito',
        fat.nomeCartao,
        'cartao_consolidado',
        'Pendente'
      ]);
      Logger.log(`Nova fatura gerada na data de fechamento: ${descFatura} -> R$ ${fat.valorTotal}`);
    }
  });
}

function pagarFaturaConsolidada(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
  const fatSheet = ss.getSheetByName(SHEETS.FATURAS_CARTAO);

  const txData = txSheet.getDataRange().getValues();
  let txRow = -1;
  let nomeCartao = '';
  let dataFechamento = '';

  for (let i = 1; i < txData.length; i++) {
    if (String(txData[i][0]) === String(p.txId)) {
      txRow = i + 1;
      nomeCartao = txData[i][6]; 
      dataFechamento = formatDateISO(txData[i][3]); 
      break;
    }
  }

  if (txRow === -1) throw new Error('Fatura não encontrada.');

  // Atualiza a transação consolidada para PAGO e atribui a Conta bancária Pagadora
  txSheet.getRange(txRow, 7).setValue(p.contaPagadora); 
  txSheet.getRange(txRow, 9).setValue('Pago');           

  // Abate do saldo da conta bancária de onde saiu o dinheiro
  updateAccountBalance(p.contaPagadora, -p.valor);

  //  Baixa em Cadeia: Altera status de todas as parcelas associadas àquele fechamento na aba FATURAS_CARTAO
  const fatData = fatSheet.getDataRange().getValues();
  for (let k = 1; k < fatData.length; k++) {
    const fCartao = String(fatData[k][1] || '').trim();         
    const fFech = formatDateISO(fatData[k][6]);                 
    const fStatus = String(fatData[k][10] || '').trim();        

    if (fCartao === nomeCartao && fFech === dataFechamento && fStatus === 'Pendente') {
      fatSheet.getRange(k + 1, 11).setValue('Pago'); // Coluna K (11): Status
    }
  }

  return { success: true };
}


// Função utilitária/invocadora projetada para ser chamada por Acionadores (Triggers).

function trigger_processarFaturasMensais() {
  try {
    Logger.log('Iniciando processamento automático de faturas...');
    processarFaturasMensais();
    Logger.log('Processamento de faturas concluído com sucesso.');
  } catch (erro) {
    Logger.log('Erro ao processar faturas via acionador: ' + erro.toString());
  }
}


function addAccount(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONTAS);
  const id = generateSequentialId(SHEETS.CONTAS, 'acc');
  sheet.appendRow([id, p.nome, p.tipo, p.saldo]);
  return { success: true };
}

function addCard(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CARTOES);
  const id = generateSequentialId(SHEETS.CARTOES, 'card');
  sheet.appendRow([id, p.nome, p.digitos, p.limite, p.fechamento, p.vencimento, p.estilo]);
  return { success: true };
}

function transferBetweenAccounts(p) {
  if (p.origem === p.destino) {
    throw new Error('A conta de origem e destino devem ser diferentes!');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const accountsSheet = ss.getSheetByName(SHEETS.CONTAS);
  const accData = accountsSheet.getDataRange().getValues();

  let origemRow = -1;
  let origemSaldo = 0;
  let destinoRow = -1;
  let destinoSaldo = 0;

  for (let i = 1; i < accData.length; i++) {
    if (accData[i][1] === p.origem) { origemRow = i + 1; origemSaldo = Number(accData[i][3]); }
    if (accData[i][1] === p.destino) { destinoRow = i + 1; destinoSaldo = Number(accData[i][3]); }
  }

  if (origemRow === -1 || destinoRow === -1) {
    throw new Error('Conta de origem ou destino não localizada.');
  }

  if (origemSaldo < p.valor) {
    throw new Error('Saldo insuficiente na conta de origem!');
  }

  accountsSheet.getRange(origemRow, 4).setValue(origemSaldo - p.valor);
  accountsSheet.getRange(destinoRow, 4).setValue(destinoSaldo + p.valor);

  const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
  const id = generateSequentialId(SHEETS.TRANSACOES, 'tx');
  txSheet.appendRow([
    id, `Transferência: ${p.origem} ➔ ${p.destino}`, p.valor, p.data, 'Transferência', 'Transferência', p.origem, 'conta', 'Pago'
  ]);

  return { success: true };
}

function addGoal(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.METAS);
  const id = generateSequentialId(SHEETS.METAS, 'goal');

  sheet.appendRow([id, p.titulo, p.alvo, p.acumuladoInicial || 0, p.dataAlvo]);

  if (p.acumuladoInicial > 0 && p.contaOrigem) {
    updateAccountBalance(p.contaOrigem, -p.acumuladoInicial);

    const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
    const idTx = generateSequentialId(SHEETS.TRANSACOES, 'tx');
    txSheet.appendRow([
      idTx, `Aporte Inicial Meta: ${p.titulo}`, p.acumuladoInicial, new Date().toISOString().split('T')[0], 'Despesa', 'Investimentos', p.contaOrigem, 'conta', 'Pago'
    ]);
  }

  return { success: true };
}

function depositToGoal(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const goalsSheet = ss.getSheetByName(SHEETS.METAS);
  const data = goalsSheet.getDataRange().getValues();

  let targetRow = -1;
  let currentAcc = 0;
  let title = '';

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.metaId)) {
      targetRow = i + 1;
      title = data[i][1];
      currentAcc = Number(data[i][3] || 0);
      break;
    }
  }

  if (targetRow === -1) throw new Error('Meta não encontrada.');

  updateAccountBalance(p.contaOrigem, -p.valor);
  goalsSheet.getRange(targetRow, 4).setValue(currentAcc + p.valor);

  const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
  const idTx = generateSequentialId(SHEETS.TRANSACOES, 'tx');
  txSheet.appendRow([
    idTx, `Aporte Meta: ${title}`, p.valor, new Date().toISOString().split('T')[0], 'Despesa', 'Investimentos', p.contaOrigem, 'conta', 'Pago'
  ]);

  return { success: true };
}

function deleteGoalWithRefund(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.METAS);
  const data = sheet.getDataRange().getValues();

  let targetRow = -1;
  let title = '';
  let acumulado = 0;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.metaId)) {
      targetRow = i + 1;
      title = data[i][1];
      acumulado = Number(data[i][3] || 0);
      break;
    }
  }

  if (targetRow !== -1) {
    sheet.deleteRow(targetRow);

    if (acumulado > 0 && p.contaReembolso) {
      updateAccountBalance(p.contaReembolso, acumulado);

      const txSheet = ss.getSheetByName(SHEETS.TRANSACOES);
      const idTx = generateSequentialId(SHEETS.TRANSACOES, 'tx');
      txSheet.appendRow([
        idTx, `Estorno Meta: ${title}`, acumulado, new Date().toISOString().split('T')[0], 'Receita', 'Investimentos', p.contaReembolso, 'conta', 'Pago'
      ]);
    }
  }

  return { success: true };
}

function saveBudget(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ORCAMENTOS);
  const data = sheet.getDataRange().getValues();

  let existingRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === p.categoria) {
      existingRow = i + 1;
      break;
    }
  }

  if (existingRow !== -1) {
    sheet.getRange(existingRow, 3).setValue(p.limite);
  } else {
    const id = generateSequentialId(SHEETS.ORCAMENTOS, 'bg');
    sheet.appendRow([id, p.categoria, p.limite]);
  }

  return { success: true };
}

function deleteBudget(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ORCAMENTOS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.budgetId)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

function deleteTransaction(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.TRANSACOES);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

function updateUserProfile(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USUARIO);
  const fullname = `${p.nome} ${p.sobrenome}`.trim();
  sheet.getRange(2, 2).setValue(fullname);
  sheet.getRange(2, 3).setValue(p.email);
  return { success: true };
}

function updatePrivacyPreference(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USUARIO);
  sheet.getRange(2, 5).setValue(p.hideBalances ? 'Sim' : 'Nao');
  return { success: true };
}

function updateThemePreference(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USUARIO);
  sheet.getRange(2, 4).setValue(p.theme);
  return { success: true };
}

function markAllNotificationsRead() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.NOTIFICACOES);
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.getRange(2, 6, lastRow - 1, 1).setValue(true);
  }
  return { success: true };
}

function updateAccountBalance(accountName, deltaAmount) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONTAS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === accountName) {
      const currentSaldo = Number(data[i][3] || 0);
      sheet.getRange(i + 1, 4).setValue(currentSaldo + deltaAmount);
      break;
    }
  }
}

function checkIsCard(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CARTOES);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name) return true;
  }
  return false;
}

function formatDateISO(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val).split('T')[0];
}