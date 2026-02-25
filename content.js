// Função para simular o envio de áudio (Simplificada)
async function enviarAudio(urlAudio) {
  const response = await fetch(urlAudio);
  const blob = await response.blob();
  const file = new File([blob], "audio.ogg", { type: "audio/ogg; codecs=opus" });

  // Aqui usamos o DataTransfer para simular um "Drop" de arquivo no chat
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  
  const input = document.querySelector('div[contenteditable="true"]');
  const event = new ClipboardEvent('drop', { dataTransfer: dataTransfer, bubbles: true });
  input.dispatchEvent(event);
}

// Criação da Interface de Vendas
const panel = document.createElement('div');
panel.innerHTML = `
  <div style="position:fixed; top:10px; right:10px; z-index:9999; background:#fff; padding:15px; border:1px solid #ccc; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <h3>Vendas Pro</h3>
    <button id="btnAudio1">🎙️ Áudio Apresentação</button><br><br>
    <button id="btnPago" style="background:green; color:white;">✅ Marcar Pago (CAPI)</button>
  </div>
`;
document.body.appendChild(panel);

document.getElementById('btnPago').addEventListener('click', () => {
  const phone = document.querySelector('header span[title]')?.title.replace(/\D/g, '');
  // Envia para o background.js processar a CAPI
  chrome.runtime.sendMessage({ type: 'CONVERSAO_META', phone: phone, value: 97.00 });
  alert('Conversão enviada para o Meta!');
});
