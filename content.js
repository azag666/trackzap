// ==========================================
// 1. ESTILOS CSS PROFISSIONAIS E INJEÇÃO
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  /* Painel Flutuante e Recolhível */
  #wsp-toggle-btn { position: fixed; bottom: 30px; right: 30px; width: 55px; height: 55px; background: #00a884; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; transition: transform 0.2s; border: none; }
  #wsp-toggle-btn:hover { transform: scale(1.1); }
  
  #wsp-panel { position: fixed; bottom: 100px; right: 30px; width: 320px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); font-family: -apple-system, sans-serif; overflow: hidden; border: 1px solid #e0e0e0; z-index: 10000; transition: opacity 0.3s, transform 0.3s; transform-origin: bottom right; display: none; }
  #wsp-panel.wsp-open { display: block; animation: popUp 0.3s ease-out forwards; }
  @keyframes popUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

  /* Cabeçalho do Painel */
  .wsp-header { background: #111b21; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 15px; }
  .wsp-header button { background: none; border: none; color: #00a884; cursor: pointer; font-size: 18px; transition: color 0.2s; }
  .wsp-header button:hover { color: #fff; }

  /* Corpo e Inputs */
  .wsp-body { padding: 15px; max-height: 400px; overflow-y: auto; }
  .wsp-group { margin-bottom: 12px; }
  .wsp-label { display: block; font-size: 12px; color: #667781; margin-bottom: 5px; font-weight: 500; }
  .wsp-input { width: 100%; padding: 10px; border: 1px solid #d1d7db; border-radius: 8px; box-sizing: border-box; font-size: 14px; background: #f0f2f5; color: #111b21; outline: none; }
  .wsp-input:focus { border-color: #00a884; background: #fff; }
  
  /* Botões e Grid de Áudios */
  .wsp-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background 0.2s; color: white; margin-bottom: 10px; }
  .wsp-btn-success { background: #00a884; }
  .wsp-btn-success:hover { background: #008f6f; }
  .wsp-btn-secondary { background: #8696a0; }
  .wsp-btn-secondary:hover { background: #667781; }
  
  .wsp-audio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
  .wsp-btn-audio { background: #e9edef; color: #111b21; border: 1px solid #d1d7db; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: background 0.2s;}
  .wsp-btn-audio:hover { background: #d1d7db; }

  /* Injeções no Contato (Cabeçalho do WhatsApp) */
  .wsp-inline-btn { background: #00a884; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-left: 10px; font-size: 13px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
  .wsp-inline-btn:hover { background: #008f6f; }
  .wsp-badge { background: #e7fce3; color: #008f6f; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 8px; border: 1px solid #00a884; display: flex; align-items: center; gap: 4px; }
  
  .wsp-hidden { display: none !important; }
`;
document.head.appendChild(style);

// ==========================================
// 2. FUNÇÕES DE SUPORTE
// ==========================================

// Tenta achar o telefone de várias formas (se for contato salvo, pede o número)
function getActivePhone() {
  const header = document.querySelector('header');
  if (!header) return null;

  let phone = null;
  // Tenta extrair do título ou alt da imagem
  const textElements = header.querySelectorAll('div[dir="auto"], span[title], img[alt]');
  for (let el of textElements) {
    const text = el.getAttribute('title') || el.getAttribute('alt') || el.innerText;
    if (text) {
      const numbers = text.replace(/\D/g, '');
      if (numbers.length >= 10 && numbers.length <= 15) {
        phone = numbers;
        break;
      }
    }
  }

  // Fallback: Contato salvo sem número visível
  if (!phone) {
    phone = prompt("O contato parece estar salvo com nome. Qual o número dele com DDD (Ex: 551199999999) para registrar a venda?");
    if (phone) phone = phone.replace(/\D/g, '');
  }
  return phone;
}

// Simula envio de áudio
async function enviarAudio(url) {
  if (!url) return alert("Configure o link do áudio na engrenagem!");
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "audio.ogg", { type: "audio/ogg; codecs=opus" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const input = document.querySelector('div[contenteditable="true"]');
    if(input) {
       input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true }));
    } else {
       alert("Abra uma conversa primeiro para enviar o áudio.");
    }
  } catch (e) {
    alert("Erro ao puxar o áudio. Verifique se o link está correto e acessível.");
  }
}

// ==========================================
// 3. INTERFACE DA EXTENSÃO (HTML INJETADO)
// ==========================================
const uiContainer = document.createElement('div');
uiContainer.innerHTML = `
  <button id="wsp-toggle-btn" title="Vendas Pro">💰</button>
  
  <div id="wsp-panel">
    <div class="wsp-header">
      <span>🚀 CRM Vendas</span>
      <button id="wsp-btn-config" title="Configurações">⚙️</button>
    </div>
    
    <div id="wsp-view-main" class="wsp-body">
      <div class="wsp-label" style="text-align: center; margin-bottom: 10px;">Áudios de Conversão</div>
      <div class="wsp-audio-grid">
        <button class="wsp-btn-audio" data-audio-key="audio1"><span>🎙️</span> Apresentação</button>
        <button class="wsp-btn-audio" data-audio-key="audio2"><span>🎙️</span> Prova Social</button>
        <button class="wsp-btn-audio" data-audio-key="audio3"><span>🎙️</span> Quebra Objeção</button>
        <button class="wsp-btn-audio" data-audio-key="audio4"><span>🎙️</span> Fechamento</button>
      </div>
      
      <div style="border-top: 1px solid #e0e0e0; margin: 15px 0; padding-top: 15px;">
        <span style="font-size: 13px; font-weight: bold; color:#111b21; display:block; margin-bottom:10px;">Registrar Conversão (Meta CAPI)</span>
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <input type="number" id="wsp-val-input" class="wsp-input" placeholder="Valor (Ex: 97.00)" step="0.01">
          <select id="wsp-currency-input" class="wsp-input" style="width: 40%;">
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button id="wsp-btn-convert" class="wsp-btn wsp-btn-success">✅ Enviar Venda e Etiquetar</button>
      </div>
    </div>

    <div id="wsp-view-config" class="wsp-body wsp-hidden">
      <div class="wsp-group">
        <label class="wsp-label">Pixel ID (Meta)</label>
        <input type="text" id="wsp-cfg-pixel" class="wsp-input" placeholder="Ex: 1234567890">
      </div>
      <div class="wsp-group">
        <label class="wsp-label">Access Token (CAPI)</label>
        <input type="password" id="wsp-cfg-token" class="wsp-input" placeholder="EAAB...">
      </div>
      <div class="wsp-group">
        <label class="wsp-label">Link Áudio 1 (Apresentação)</label>
        <input type="text" id="wsp-cfg-audio1" class="wsp-input" placeholder="https://...arquivo.ogg">
      </div>
      <button id="wsp-btn-save-cfg" class="wsp-btn wsp-btn-success" style="margin-top: 10px;">Salvar Configurações</button>
      <button id="wsp-btn-voltar" class="wsp-btn wsp-btn-secondary">Voltar</button>
    </div>
  </div>
`;
document.body.appendChild(uiContainer);

// ==========================================
// 4. LÓGICA DE EVENTOS (CLICKS)
// ==========================================

// Abrir/Fechar Painel
document.getElementById('wsp-toggle-btn').addEventListener('click', () => {
  document.getElementById('wsp-panel').classList.toggle('wsp-open');
});

// Navegação Configurações
document.getElementById('wsp-btn-config').addEventListener('click', () => {
  document.getElementById('wsp-view-main').classList.add('wsp-hidden');
  document.getElementById('wsp-view-config').classList.remove('wsp-hidden');
  chrome.storage.local.get(['pixel_id', 'access_token', 'audio1'], (res) => {
    if(res.pixel_id) document.getElementById('wsp-cfg-pixel').value = res.pixel_id;
    if(res.access_token) document.getElementById('wsp-cfg-token').value = res.access_token;
    if(res.audio1) document.getElementById('wsp-cfg-audio1').value = res.audio1;
  });
});

document.getElementById('wsp-btn-voltar').addEventListener('click', () => {
  document.getElementById('wsp-view-config').classList.add('wsp-hidden');
  document.getElementById('wsp-view-main').classList.remove('wsp-hidden');
});

// Salvar Configurações
document.getElementById('wsp-btn-save-cfg').addEventListener('click', () => {
  chrome.storage.local.set({ 
    pixel_id: document.getElementById('wsp-cfg-pixel').value, 
    access_token: document.getElementById('wsp-cfg-token').value, 
    audio1: document.getElementById('wsp-cfg-audio1').value 
  }, () => {
    alert('Configurações salvas!');
    document.getElementById('wsp-btn-voltar').click();
  });
});

// Disparar Áudios
document.querySelectorAll('.wsp-btn-audio').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const key = e.currentTarget.getAttribute('data-audio-key');
    chrome.storage.local.get([key], (res) => enviarAudio(res[key]));
  });
});

// Converter Manual pelo Painel
document.getElementById('wsp-btn-convert').addEventListener('click', processarVenda);

function processarVenda() {
  const phone = getActivePhone();
  if (!phone) return;

  const valueStr = document.getElementById('wsp-val-input').value;
  const value = parseFloat(valueStr);
  const currency = document.getElementById('wsp-currency-input').value;

  if (!valueStr || isNaN(value)) return alert('Digite um valor numérico válido.');

  chrome.storage.local.get(['pixel_id', 'access_token', 'sales'], (res) => {
    if (!res.pixel_id || !res.access_token) return alert('Configure o Pixel e Token na engrenagem!');

    document.getElementById('wsp-btn-convert').innerText = "⏳ Processando...";
    
    // Envia para o Backend/Meta
    chrome.runtime.sendMessage({ 
      type: 'CONVERSAO_META', phone, value, currency, pixel_id: res.pixel_id, access_token: res.access_token
    }, (response) => {
      document.getElementById('wsp-btn-convert').innerText = "✅ Enviar Venda e Etiquetar";
      
      if(response && response.status === "success") {
        // Atualiza a etiqueta local (Múltiplas Conversões)
        let sales = res.sales || {};
        if (!sales[phone]) sales[phone] = { count: 0, total: 0 };
        sales[phone].count += 1;
        sales[phone].total += value;
        
        chrome.storage.local.set({ sales: sales }, () => {
          document.getElementById('wsp-val-input').value = '';
          alert('Venda registrada no Meta e Etiqueta atualizada!');
          injectHeaderButtons(); // Força atualização visual
        });
      } else {
        alert('Erro ao enviar conversão. Verifique os logs.');
      }
    });
  });
}

// ==========================================
// 5. OBSERVER: INJETAR NO CABEÇALHO DO WHATSAPP
// ==========================================
function injectHeaderButtons() {
  const header = document.querySelector('header');
  if (!header) return;

  // Evita duplicar
  let actionContainer = document.getElementById('wsp-header-actions');
  if (!actionContainer) {
    actionContainer = document.createElement('div');
    actionContainer.id = 'wsp-header-actions';
    actionContainer.style.display = 'flex';
    actionContainer.style.alignItems = 'center';
    // Insere logo após o nome do contato
    const titleContainer = header.querySelector('div[dir="auto"]').parentNode;
    if(titleContainer) titleContainer.appendChild(actionContainer);
  }

  // Tenta extrair o número "frio" para checar etiquetas
  let phoneStr = header.innerText.replace(/\D/g, '');
  
  chrome.storage.local.get(['sales'], (res) => {
    actionContainer.innerHTML = ''; // Limpa para re-renderizar
    
    // Cria botão de Venda Expressa no cabeçalho
    const btnVender = document.createElement('button');
    btnVender.className = 'wsp-inline-btn';
    btnVender.innerText = '💰 Vender';
    btnVender.onclick = () => {
      document.getElementById('wsp-panel').classList.add('wsp-open');
      document.getElementById('wsp-val-input').focus();
    };
    actionContainer.appendChild(btnVender);

    // Se o contato já comprou, mostra a Etiqueta de Múltiplas conversões
    if (res.sales) {
      // Como o telefone pode não ser extraído perfeitamente se salvo, varremos o storage
      // procurando se alguma chave (telefone) bate parcialmente com a tela atual.
      let savedPhoneData = null;
      for (const [key, data] of Object.entries(res.sales)) {
         if (phoneStr.includes(key) || key.includes(phoneStr.substring(0, 10))) {
            savedPhoneData = data; break;
         }
      }

      if (savedPhoneData) {
        const badge = document.createElement('span');
        badge.className = 'wsp-badge';
        badge.innerHTML = `✅ Pago: R$ ${savedPhoneData.total.toFixed(2)} <span>(${savedPhoneData.count}x)</span>`;
        actionContainer.appendChild(badge);
      }
    }
  });
}

// Roda a verificação de injeção a cada 1.5 segundos
setInterval(() => {
  injectHeaderButtons();
  
  // Lógica antiga de salvar lead invisível se chegar link com REF
  const phone = document.querySelector('header')?.innerText.replace(/\D/g, '');
  if(!phone) return;
  const messages = document.querySelectorAll('.message-in');
  messages.forEach(msg => {
    const match = msg.innerText.match(/ref=([a-zA-Z0-9_-]+)/); 
    if (match && match[1]) {
      const storageKey = `lead_${phone}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'saved');
        chrome.runtime.sendMessage({ type: 'SALVAR_LEAD', phone: phone, click_id: match[1] });
      }
    }
  });
}, 1500);
