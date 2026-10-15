/* =====================================================
   imagens.js - Carregamento de imagens
   ===================================================== */

// Tenta carregar uma imagem testando vários caminhos (Android diferencia maiúsculas de minúsculas)
function carregarImagem(caminhos, aoCarregar) {
  const img = new Image();
  let n = 0;
  img.onload = () => aoCarregar(img);
  img.onerror = () => {
    console.warn("Não achei " + caminhos[n]);
    n++;
    if (n < caminhos.length) img.src = caminhos[n];
  };
  img.src = caminhos[0];
  return img;
}

// --- Dellalos ---
let dellalosOk = false;
let folha = null;   // spritesheet já com o fundo preto transparente

carregarImagem(["assets/dellalos.jpg", "dellalos.jpg"], (img) => {
  folha = prepararFolha(img);
  dellalosOk = true;
});

// A imagem é JPG, então o preto do fundo não é transparente.
// Copiamos para um canvas escondido e apagamos o preto ligado às bordas.
function prepararFolha(img, limite) {
  try {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const cx = c.getContext("2d");
    cx.drawImage(img, 0, 0);
    const dados = cx.getImageData(0, 0, w, h);
    const px = dados.data;
    const LIMITE = limite || 38;   // quanto mais baixo, mais cabelo preto é preservado
    const visitado = new Uint8Array(w * h);
    const pilha = [0, w - 1, (h - 1) * w, h * w - 1];
    const escuro = (i) => px[i*4] < LIMITE && px[i*4+1] < LIMITE && px[i*4+2] < LIMITE;
    while (pilha.length) {
      const i = pilha.pop();
      if (visitado[i] || !escuro(i)) continue;
      visitado[i] = 1;
      px[i*4+3] = 0;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) pilha.push(i - 1);
      if (x < w - 1) pilha.push(i + 1);
      if (y > 0) pilha.push(i - w);
      if (y < h - 1) pilha.push(i + w);
    }
    cx.putImageData(dados, 0, 0);
    return c;
  } catch (erro) {
    console.warn("Não consegui remover o fundo preto (abra pelo servidor do Acode).", erro);
    return img;
  }
}
