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

// PNG já vem com fundo transparente (usa como está). JPG precisa apagar o fundo preto.
carregarImagem(["assets/Dellalos.png", "assets/dellalos.png", "assets/dellalos.jpg", "dellalos.jpg"], (img) => {
  folha = /\.png(\?|$)/i.test(img.src) ? img : prepararFolha(img);
  dellalosOk = true;
});

// A imagem é JPG, então o preto do fundo não é transparente.
// Copiamos para um canvas escondido e apagamos o preto ligado às bordas.
function prepararFolha(img, limite) {
  try {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const cx = c.getContext("2d");
    cx.drawImage(img, 0, 0);
    const dados = cx.getImageData(0, 0, w, h);
    const px = dados.data;
    const LIMITE = limite || 38;   // quanto mais baixo, mais cabelo preto é preservado
    const visitado = new Uint8Array(w * h);
    const pilha = new Int32Array(w * h);     // cada pixel entra no máximo uma vez
    let topo = 0;
    const escuro = (i) => px[i*4] < LIMITE && px[i*4+1] < LIMITE && px[i*4+2] < LIMITE;
    const empurrar = (i) => { if (!visitado[i] && escuro(i)) { visitado[i] = 1; pilha[topo++] = i; } };
    empurrar(0); empurrar(w - 1); empurrar((h - 1) * w); empurrar(h * w - 1);
    while (topo > 0) {
      const i = pilha[--topo];
      px[i*4+3] = 0;
      const x = i % w;
      if (x > 0) empurrar(i - 1);
      if (x < w - 1) empurrar(i + 1);
      if (i >= w) empurrar(i - w);
      if (i < w * (h - 1)) empurrar(i + w);
    }
    cx.putImageData(dados, 0, 0);
    return c;
  } catch (erro) {
    console.warn("Não consegui remover o fundo preto (abra pelo servidor do Acode).", erro);
    return img;
  }
}

// A imagem tem fundo opaco (JPG, ou PNG salvo sem transparência)? Olha os 4 cantos.
function temFundoOpaco(img) {
  try {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const c = document.createElement("canvas");
    c.width = 1; c.height = 1;
    const cx = c.getContext("2d");
    for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) {
      cx.clearRect(0, 0, 1, 1);
      cx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
      if (cx.getImageData(0, 0, 1, 1).data[3] < 250) return false;   // tem transparência
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Folhas enormes (ex.: 2048 px) ficam lentas de processar: reduz para no máximo "max" px
function reduzirFolha(img, max) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  if (w <= max) return img;
  const e = max / w;
  const c = document.createElement("canvas");
  c.width = Math.round(w * e); c.height = Math.round(h * e);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c;
}
