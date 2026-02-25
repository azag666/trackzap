const VERCEL_URL = "https://SUA_URL_DO_VERCEL.vercel.app";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SALVAR_LEAD') {
    fetch(`${VERCEL_URL}/api/save-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: request.phone, click_id: request.click_id })
    });
  }

  if (request.type === 'CONVERSAO_META') {
    fetch(`${VERCEL_URL}/api/track-conversion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: request.phone, value: request.value })
    })
    .then(r => r.json())
    .then(data => sendResponse({status: "success", data}))
    .catch(err => sendResponse({status: "error", err}));
    
    return true; // Mantém a porta aberta para o response assíncrono
  }
});
