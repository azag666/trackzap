// Captura o telefone do contato ativo
function getActivePhone() {
  const header = document.querySelector('header');
  if (!header) return null;
  const spanTitle = header.querySelector('span[title]');
  if (!spanTitle) return null;
  return spanTitle.title.replace(/\D/g, ''); 
}

// Injeta o painel profissional
function injectPanel() {
  if (document.getElementById('wsp-panel')) return;

  const style = document.createElement('style');
  style.innerHTML = `
    #wsp-panel { position:fixed; top:60px; right:20px; z-index:9999; background:#ffffff; width: 300px; border-radius:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; border: 1px solid #e0e0e0; }
    .wsp-header { background: #00a884; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 15px; }
    .wsp-header button { background: none; border: none; color: white; cursor: pointer; font-size: 18px; transition: transform 0.2s; }
    .wsp-header button:hover { transform: rotate(90deg); }
    .wsp-body { padding: 15px; }
    .wsp-group { margin-bottom: 12px; }
    .wsp-label { display: block; font-size: 12px; color: #555; margin-bottom: 4px; font-weight: 500; }
    .wsp-input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
    .wsp-row { display: flex; gap: 10px; }
    .wsp-btn { width: 100%; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .wsp-btn-audio { background: #f0f2f5; color: #333; border: 1px solid #d1d7db; margin-bottom: 15px; }
    .wsp-btn-audio:hover { background: #e4e6e9; }
    .wsp-btn-success { background: #00a884; color: white; }
    .wsp-btn-success:hover { background: #008f6f; }
    .wsp-hidden { display: none; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'wsp-panel';
  panel.innerHTML = `
    <div class="wsp-header">
      <span>🚀 Vendas Pro</span>
      <button id="wsp-btn-config" title="Configurações">⚙️</button>
    </div>
    
    <div id="wsp-view-main" class="wsp-body">
      <button id="wsp-btn-audio" class="wsp-btn wsp-btn-audio">🎙️ Enviar Áudio de Venda</button>
      
      <div style="border-top: 1px solid #eee; margin: 15px 0; padding-top: 10px;">
        <span style="font-size: 13px; font-weight: bold; color:#333; display:block; margin-bottom:10px;">Registrar Conversão</span>
        <div class="wsp-row wsp-group">
          <div style="flex: 2;">
            <label class="wsp-label">Valor Pago</label>
            <input type="number" id="wsp-val-input" class="wsp-input" placeholder="97.00" step="0.01">
          </div>
          <div style="flex: 1;">
            <label class="wsp-label">Moeda</label>
            <select id="wsp-currency-input" class="wsp-input">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
        <button id="wsp-btn-convert" class="wsp-btn wsp-btn-success">✅ Marcar Pago</button>
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
        <label class="wsp-label">Link do Áudio (.ogg)</label>
        <input type="text" id="wsp-cfg-audio" class="wsp-input" placeholder="https://...">
      </div>
      <button id="wsp-btn-save-cfg" class="wsp-btn wsp-btn-success">Salvar Configurações</button>
      <button id="wsp-btn-voltar" class="wsp-btn wsp-btn-audio" style="margin-top:10px;">Voltar</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Navegação das abas
  document.getElementById('wsp-btn-config').addEventListener('click', () => {
    document.getElementById('wsp-view-main').classList.add('wsp-hidden');
    document.getElementById('wsp-view-config').classList.remove('wsp-hidden');
    // Carregar dados salvos
    chrome.storage.local.get(['pixel_id', 'access_token', 'audio_url'], (res) => {
      if(res.pixel_id) document.getElementById('wsp-cfg-pixel').value = res.pixel_id;
      if(res.access_token) document.getElementById('wsp-cfg-token').value = res.access_token;
      if(res.audio_url) document.getElementById('wsp-cfg-audio').value = res.audio_url;
    });
  });

  document.getElementById('wsp-btn-voltar').addEventListener('click', () => {
    document.getElementById('wsp-view-config').classList.add('wsp-hidden');
    document.getElementById('wsp-view-main').classList.remove('wsp-hidden');
  });

  // Salvar Configurações
  document.getElementById('wsp-btn-save-cfg').addEventListener('click', () => {
    const pixel = document.getElementById('wsp-cfg-pixel').value;
    const token = document.getElementById('wsp-cfg-token').value;
    const audio = document.getElementById('wsp-cfg-audio').value;
    
    chrome.storage.local.set({ pixel_id: pixel, access_token: token, audio_url: audio }, () => {
      alert('Configurações salvas!');
      document.getElementById('wsp-btn-voltar').click();
    });
  });

  // Ação: Enviar Áudio
  document.getElementById('wsp-btn-audio').addEventListener('click', () => {
    chrome.storage.local.get(['audio_url'], async (res) => {
      if(!res.audio_url) return alert("Configure o link do áudio na engrenagem primeiro.");
      try {
        const response = await fetch(res.audio_url);
        const blob = await response.blob();
        const file = new File([blob], "audio.ogg", { type: "audio/ogg; codecs=opus" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.querySelector('div[contenteditable="true"]');
        if(input) {
           input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true }));
        } else {
           alert("Abra uma conversa primeiro.");
        }
      } catch (e) {
        alert("Erro ao puxar áudio. Verifique o link.");
      }
    });
  });

  // Ação: Conversão Manual
  document.getElementById('wsp-btn-convert').addEventListener('click', () => {
    const phone = getActivePhone();
    const value = document.getElementById('wsp-val-input').value;
    const currency = document.getElementById('wsp-currency-input').value;

    if (!phone) return alert('Abra a conversa com o lead primeiro.');
    if (!value) return alert('Digite o valor pago.');

    chrome.storage.local.get(['pixel_id', 'access_token'], (res) => {
      if (!res.pixel_id || !res.access_token) return alert('Configure o Pixel e o Token na engrenagem!');

      const btn = document.getElementById('wsp-btn-convert');
      btn.innerText = "⏳ Enviando...";
      
      chrome.runtime.sendMessage({ 
        type: 'CONVERSAO_META', 
        phone: phone, 
        value: value,
        currency: currency,
        pixel_id: res.pixel_id,
        access_token: res.access_token
      }, (response) => {
        btn.innerText = "✅ Marcar Pago";
        if(response && response.status === "success") {
          alert('Venda enviada para o Meta!');
          document.getElementById('wsp-val-input').value = ''; // Limpa o campo
        } else {
          alert('Erro ao enviar conversão. Verifique os logs.');
        }
      });
    });
  });
}

// Mantém o painel injetado e rastreia click_id em background
setInterval(() => {
  injectPanel();
  const phone = getActivePhone();
  if(!phone) return;

  const messages = document.querySelectorAll('.message-in');
  messages.forEach(msg => {
    const text = msg.innerText;
    const match = text.match(/ref=([a-zA-Z0-9_-]+)/); 
    if (match && match[1]) {
      const click_id = match[1];
      const storageKey = `lead_${phone}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'saved');
        chrome.runtime.sendMessage({ type: 'SALVAR_LEAD', phone: phone, click_id: click_id });
      }
    }
  });
}, 2000);
