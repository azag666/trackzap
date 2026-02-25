// Captura o telefone do contato ativo
function getActivePhone() {
  const header = document.querySelector('header');
  if (!header) return null;
  const spanTitle = header.querySelector('span[title]');
  if (!spanTitle) return null;
  return spanTitle.title.replace(/\D/g, ''); // Deixa só os números
}

// Injeta o painel de vendas se não existir
function injectPanel() {
  if (document.getElementById('vendas-pro-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'vendas-pro-panel';
  panel.innerHTML = `
    <div style="position:fixed; top:60px; right:10px; z-index:9999; background:#fff; padding:15px; border:1px solid #ccc; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; text-align:center;">Vendas Pro</h3>
      <button id="btnAudio1" style="width:100%; padding:8px; margin-bottom:10px; cursor:pointer;">🎙️ Áudio 1</button>
      <button id="btnPago" style="width:100%; padding:8px; background:green; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">✅ Marcar Pago</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Ação de Áudio
  document.getElementById('btnAudio1').addEventListener('click', async () => {
    // Altere para o link direto do seu arquivo OGG Opus
    const audioUrl = "https://seu-site.com/audio1.ogg"; 
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], "audio.ogg", { type: "audio/ogg; codecs=opus" });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const input = document.querySelector('div[contenteditable="true"]');
      if(input) {
         const event = new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true });
         input.dispatchEvent(event);
      } else {
         alert("Abra uma conversa primeiro.");
      }
    } catch (e) {
      alert("Erro ao puxar áudio.");
    }
  });

  // Ação de Marcar Pago (CAPI)
  document.getElementById('btnPago').addEventListener('click', () => {
    const phone = getActivePhone();
    if (!phone) return alert('Não consegui pegar o número do contato.');

    document.getElementById('btnPago').innerText = "Enviando...";
    
    chrome.runtime.sendMessage({ type: 'CONVERSAO_META', phone: phone, value: 97.00 }, (response) => {
      document.getElementById('btnPago').innerText = "✅ Marcar Pago";
      if(response.status === "success") {
        alert('Venda rastreada e enviada para o Meta com sucesso!');
      } else {
        alert('Erro ao enviar conversão.');
      }
    });
  });
}

// Fica escutando as mensagens para capturar o click_id (Ex: se o lead mandar "ID:XXXXX")
setInterval(() => {
  injectPanel(); // Garante que o painel está lá
  
  const phone = getActivePhone();
  if(!phone) return;

  // Verifica se na conversa atual existe um click_id na primeira mensagem
  const messages = document.querySelectorAll('.message-in');
  messages.forEach(msg => {
    const text = msg.innerText;
    // Padrão que você definiu no link do whats, ex: "Tenho interesse. ref=CLICK_ID"
    const match = text.match(/ref=([a-zA-Z0-9_-]+)/); 
    
    if (match && match[1]) {
      const click_id = match[1];
      const storageKey = `lead_${phone}`;
      
      // Salva no backend se ainda não salvamos nesta sessão local
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'saved');
        chrome.runtime.sendMessage({ type: 'SALVAR_LEAD', phone: phone, click_id: click_id });
      }
    }
  });
}, 2000);
