// ==========================================
// 1. ESTILOS CSS DO SISTEMA DE TAGS E MODAL
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  /* Painel Flutuante (Apenas para Áudios e Configurações agora) */
  #wsp-toggle-btn { position: fixed; bottom: 30px; right: 30px; width: 55px; height: 55px; background: #00a884; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; transition: transform 0.2s; border: none; }
  #wsp-toggle-btn:hover { transform: scale(1.1); }
  
  #wsp-panel { position: fixed; bottom: 100px; right: 30px; width: 320px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); font-family: -apple-system, sans-serif; overflow: hidden; border: 1px solid #e0e0e0; z-index: 10000; display: none; }
  #wsp-panel.wsp-open { display: block; }

  .wsp-header { background: #111b21; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 15px; }
  .wsp-header button { background: none; border: none; color: #00a884; cursor: pointer; font-size: 18px; }
  .wsp-body { padding: 15px; }
  .wsp-input { width: 100%; padding: 10px; border: 1px solid #d1d7db; border-radius: 8px; box-sizing: border-box; font-size: 14px; margin-bottom: 10px;}
  .wsp-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; color: white; margin-bottom: 10px; background: #00a884; }
  .wsp-audio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .wsp-btn-audio { background: #e9edef; border: 1px solid #d1d7db; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 5px; }

  /* Tags no Cabeçalho do WhatsApp - FORÇA BRUTA */
  #wsp-tags-container { display: flex; align-items: center; gap: 8px; margin-left: 15px; z-index: 9999; }
  .wsp-tag { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; }
  .wsp-tag-pagante { background: #e7fce3; color: #008f6f; border: 1px solid #00a884; }
  .wsp-tag-frio { background: #ffebee; color: #c62828; border: 1px solid #ef5350; }
  .wsp-tag-quente { background: #fff3e0; color: #ef6c00; border: 1px solid #ffb74d; }
  
  .wsp-add-tag-btn { background: #f0f2f5; border: 1px solid #d1d7db; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; cursor: pointer; color: #54656f; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  .wsp-add-tag-btn:hover { background: #e9edef; }

  /* Dropdown de Escolha de Tag */
  #wsp-tag-dropdown { position: fixed; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px; display: none; z-index: 20000; flex-direction: column; gap: 5px; }
  .wsp-dropdown-item { padding: 8px 12px; cursor: pointer; border-radius: 6px; font-size: 13px; font-weight: 500; }
  .wsp-dropdown-item:hover { background: #f0f2f5; }

  /* Modal de Conversão (Pagante) */
  #wsp-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 30000; display: none; align-items: center; justify-content: center; }
  .wsp-modal { background: white; width: 300px; padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-family: sans-serif; }
  .wsp-modal h3 { margin: 0 0 15px 0; font-size: 16px; color: #111b21; }
  .wsp-modal-row { display: flex; gap: 10px; margin-bottom: 15px; }
  .wsp-btn-cancel { background: #8696a0; }
  
  .wsp-hidden { display: none !important; }
`;
document.head.appendChild(style);

// ==========================================
// 2. EXTRAÇÃO RESILIENTE DE TELEFONE
// ==========================================
function getPhoneSilently() {
  const header = document.querySelector('header');
  if (!header) return null;
  const elementsWithTitle = header.querySelectorAll('[title]');
  for (let el of elementsWithTitle) {
    const title = el.getAttribute('title');
    if (title && (title.includes('+') || /^[\d\s\-\(\)]+$/.test(title))) {
        const num = title.replace(/\D/g, '');
        if (num.length >= 10 && num.length <= 15) return num;
    }
  }
  const headerText = header.innerText || '';
  const phoneMatch = headerText.match(/\+?\d[\d\s\-\(\)]{9,20}/);
  if (phoneMatch) {
      const num = phoneMatch[0].replace(/\D/g, '');
      if (num.length >= 10 && num.length <= 15) return num;
  }
  return null;
}

async function enviarAudio(url) {
  if (!url) return alert("Configure o link do áudio!");
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "audio.ogg", { type: "audio/ogg; codecs=opus" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.querySelector('div[contenteditable="true"]');
    if(input) input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
  } catch (e) { alert("Erro ao enviar áudio."); }
}

// ==========================================
// 3. UI: PAINEL DE ÁUDIOS, DROPDOWN E MODAL
// ==========================================
const uiContainer = document.createElement('div');
uiContainer.innerHTML = `
  <button id="wsp-toggle-btn">⚙️</button>
  <div id="wsp-panel">
    <div class="wsp-header">
      <span>🚀 CRM Config</span>
      <button id="wsp-btn-config-close">✖</button>
    </div>
    <div id="wsp-view-main" class="wsp-body">
      <div class="wsp-audio-grid">
        <button class="wsp-btn-audio" data-audio-key="audio1">🎙️ Apresentação</button>
        <button class="wsp-btn-audio" data-audio-key="audio2">🎙️ Prova Social</button>
        <button class="wsp-btn-audio" data-audio-key="audio3">🎙️ Objeção</button>
        <button class="wsp-btn-audio" data-audio-key="audio4">🎙️ Fechamento</button>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
      <label style="font-size: 12px; font-weight: bold;">Pixel ID</label>
      <input type="text" id="wsp-cfg-pixel" class="wsp-input" placeholder="Ex: 1234567890">
      <label style="font-size: 12px; font-weight: bold;">Access Token (Meta)</label>
      <input type="password" id="wsp-cfg-token" class="wsp-input" placeholder="EAAB...">
      <button id="wsp-btn-save-cfg" class="wsp-btn">💾 Salvar Configurações</button>
    </div>
  </div>

  <div id="wsp-tag-dropdown">
    <div class="wsp-dropdown-item" data-tag="pagante">🟢 Pagante (Marcar Venda)</div>
    <div class="wsp-dropdown-item" data-tag="quente">🔥 Quente</div>
    <div class="wsp-dropdown-item" data-tag="frio">❄️ Frio</div>
  </div>

  <div id="wsp-modal-overlay">
    <div class="wsp-modal">
      <h3>Registrar Pagamento</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 10px;">O valor será enviado para o Meta CAPI.</p>
      <div class="wsp-modal-row">
        <input type="number" id="wsp-modal-val" class="wsp-input" placeholder="Valor (Ex: 97.00)" step="0.01">
        <select id="wsp-modal-cur" class="wsp-input" style="width: 40%;">
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <button id="wsp-modal-confirm" class="wsp-btn">✅ Confirmar Venda</button>
      <button id="wsp-modal-cancel" class="wsp-btn wsp-btn-cancel">Cancelar</button>
    </div>
  </div>
`;
document.body.appendChild(uiContainer);

// ==========================================
// 4. LÓGICA DE INTERAÇÃO
// ==========================================
document.getElementById('wsp-toggle-btn').addEventListener('click', () => {
  document.getElementById('wsp-panel').classList.add('wsp-open');
  chrome.storage.local.get(['pixel_id', 'access_token'], (res) => {
    if(res.pixel_id) document.getElementById('wsp-cfg-pixel').value = res.pixel_id;
    if(res.access_token) document.getElementById('wsp-cfg-token').value = res.access_token;
  });
});
document.getElementById('wsp-btn-config-close').addEventListener('click', () => {
  document.getElementById('wsp-panel').classList.remove('wsp-open');
});
document.getElementById('wsp-btn-save-cfg').addEventListener('click', () => {
  chrome.storage.local.set({ 
    pixel_id: document.getElementById('wsp-cfg-pixel').value, 
    access_token: document.getElementById('wsp-cfg-token').value 
  }, () => alert('Salvo com sucesso!'));
});
document.querySelectorAll('.wsp-btn-audio').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const key = e.currentTarget.getAttribute('data-audio-key');
    chrome.storage.local.get([key], (res) => enviarAudio(res[key]));
  });
});

// Dropdown e Modal
const dropdown = document.getElementById('wsp-tag-dropdown');
const modal = document.getElementById('wsp-modal-overlay');

document.addEventListener('click', (e) => {
  if (!e.target.closest('#wsp-tag-dropdown') && !e.target.closest('.wsp-add-tag-btn')) {
    dropdown.style.display = 'none';
  }
});

document.querySelectorAll('.wsp-dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
    dropdown.style.display = 'none';
    const tagType = e.currentTarget.getAttribute('data-tag');
    let phone = getPhoneSilently();
    
    // Fallback: se não achar o telefone escondido, pede para digitar na hora da conversão
    if (!phone && tagType === 'pagante') {
        phone = prompt("O WhatsApp ocultou este número. Digite o número com DDI e DDD (Ex: 551199999999) para enviar ao Meta:");
        if(phone) phone = phone.replace(/\D/g, '');
    }
    
    if (!phone) return alert('Número não identificado.');

    if (tagType === 'pagante') {
      // Guarda temporariamente o telefone no modal para usar no envio
      modal.setAttribute('data-current-phone', phone);
      modal.style.display = 'flex'; 
    } else {
      salvarTag(phone, tagType); 
    }
  });
});

document.getElementById('wsp-modal-cancel').addEventListener('click', () => modal.style.display = 'none');

document.getElementById('wsp-modal-confirm').addEventListener('click', () => {
  const phone = modal.getAttribute('data-current-phone');
  const value = parseFloat(document.getElementById('wsp-modal-val').value);
  const currency = document.getElementById('wsp-modal-cur').value;

  if (!value || isNaN(value)) return alert('Digite um valor válido.');

  chrome.storage.local.get(['pixel_id', 'access_token'], (res) => {
    if (!res.pixel_id || !res.access_token) return alert('Configure o Pixel e Token na engrenagem primeiro!');

    const btn = document.getElementById('wsp-modal-confirm');
    btn.innerText = "⏳ Enviando...";

    chrome.runtime.sendMessage({ 
      type: 'CONVERSAO_META', phone, value, currency, pixel_id: res.pixel_id, access_token: res.access_token
    }, (response) => {
      btn.innerText = "✅ Confirmar Venda";
      
      if(response && response.status === "success") {
        modal.style.display = 'none';
        document.getElementById('wsp-modal-val').value = '';
        salvarTag(phone, 'pagante', value, currency);
      } else {
        alert('Erro ao comunicar com o Meta. O Chrome pode estar bloqueando ou as credenciais estão erradas.');
        console.error("Erro da extensão:", response?.err);
      }
    });
  });
});

function salvarTag(phone, tipo, value = 0, currency = 'BRL') {
  chrome.storage.local.get(['tags_crm'], (res) => {
    let crm = res.tags_crm || {};
    if (!crm[phone]) crm[phone] = { tipo: tipo, total: 0, count: 0, currency: currency };
    
    if (tipo === 'pagante') {
      crm[phone].tipo = 'pagante';
      crm[phone].total += value;
      crm[phone].count += 1;
    } else {
      crm[phone].tipo = tipo;
    }

    chrome.storage.local.set({ tags_crm: crm }, () => injectTags());
  });
}

// ==========================================
// 5. INJETAR TAGS: ESTRATÉGIA "FORÇA BRUTA"
// ==========================================
function injectTags() {
  const header = document.querySelector('header');
  if (!header) return; // Só tenta injetar se existir uma conversa aberta

  let tagsContainer = document.getElementById('wsp-tags-container');
  
  if (!tagsContainer) {
    tagsContainer = document.createElement('div');
    tagsContainer.id = 'wsp-tags-container';
    
    // Tenta colocar no "flexbox" principal do cabeçalho
    const headerInfoBlock = header.querySelector(':nth-child(2)'); // Onde fica a foto e o nome
    
    if (headerInfoBlock) {
        headerInfoBlock.style.display = 'flex';
        headerInfoBlock.style.alignItems = 'center';
        headerInfoBlock.appendChild(tagsContainer);
    } else {
        // Fallback: Se o WhatsApp mudar a estrutura de novo, cola absoluto no meio do header
        tagsContainer.style.position = 'absolute';
        tagsContainer.style.left = '40%';
        tagsContainer.style.top = '15px';
        header.appendChild(tagsContainer);
    }
  }

  const phone = getPhoneSilently();
  
  chrome.storage.local.get(['tags_crm'], (res) => {
    tagsContainer.innerHTML = ''; // Limpa para atualizar

    // Cria o botão principal de Adicionar Tag
    const addBtn = document.createElement('button');
    addBtn.className = 'wsp-add-tag-btn';
    addBtn.innerText = '➕ Etiquetar';
    addBtn.onclick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdown = document.getElementById('wsp-tag-dropdown');
      // Calcula a posição ignorando a barra de rolagem
      dropdown.style.top = (rect.bottom + 5) + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.style.display = 'flex';
    };
    tagsContainer.appendChild(addBtn);

    // Renderiza as tags salvas
    if (res.tags_crm && phone && res.tags_crm[phone]) {
      const dados = res.tags_crm[phone];
      const tagEl = document.createElement('span');
      
      if (dados.tipo === 'pagante') {
        tagEl.className = 'wsp-tag wsp-tag-pagante';
        const simbolo = dados.currency === 'USD' ? '$' : 'R$';
        tagEl.innerHTML = `🟢 Pago: ${simbolo} ${dados.total.toFixed(2)}`;
      } else if (dados.tipo === 'quente') {
        tagEl.className = 'wsp-tag wsp-tag-quente';
        tagEl.innerHTML = `🔥 Quente`;
      } else if (dados.tipo === 'frio') {
        tagEl.className = 'wsp-tag wsp-tag-frio';
        tagEl.innerHTML = `❄️ Frio`;
      }
      tagsContainer.appendChild(tagEl);
    }
  });
}

// Roda a verificação de injeção mais rápido (a cada 1 segundo)
setInterval(() => {
  injectTags();
  
  // Rastreador invisível de Click ID da Pressel
  const phone = getPhoneSilently();
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
}, 1000);
