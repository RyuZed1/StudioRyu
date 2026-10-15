# Studio.Ryu — site (versão dinâmica)

Site estático para GitHub Pages, com identidade branco, preto e roxo suave.

## Arquivos
- `index.html`: página inicial (edições, serviços, cursos, plugin, downloads, jogo, sobre, contato).
- `mini-curso.html`: página do Mini Curso de Edição.
- `curso-tiguer.html`: página do Curso TIGUER.
- `plugin.html`: página do plugin (Studios Ryu Animation Suite), com playground de curvas, versão Beta grátis e instalação.
- `downloads.html` + `downloads.js`: central de downloads com categorias, busca, filtros e carrinho. **A lista de arquivos fica no topo do `downloads.js`** (veja os comentários lá).
- `style.css`: visual, responsividade e animações.
- `script.js`: menu, revelação no scroll, microanimações, mascotes que falam, patinhas escondidas, easter eggs, playground.
- `game.js`: jogo Ryu Run (só é usado na `index.html`), com tigre animado e ranking.
- `assets/`: imagens dos tigres. `tiger-run.png`, `tiger-jump.png` e `tiger-land.png` são os sprites do jogo (corrida, pulo e aterrissagem).

## Publicar no GitHub Pages
Envie TODOS os arquivos e a pasta `assets` (substituindo os antigos) para a raiz do repositório e dê **Commit changes**.
Depois de 1 a 2 minutos, atualize o site com Ctrl + F5.

## Imagens por área
- Edição (serviços): `assets/tigre-edicao.jpeg`
- Mini Curso: `assets/tigre-mini.jpeg`
- Curso TIGUER: `assets/tigre-tiguer.jpeg`
- Plugin: `assets/tigre-plugin.jpeg`
- Downloads: `assets/tigre-downloads.jpeg`

## Segredos do site
- 5 patinhas 🐾 escondidas (index, seção de downloads da index, mini curso, TIGUER, plugin). Achando todas, liga o Modo Fogo Roxo.
- 5 cliques rápidos na logo da home.
- Código secreto: ↑ ↑ ↓ ↓ ← → ← → B A.

## Checklist
- Revise os títulos e descrições dos módulos dos cursos nas páginas internas e ajuste ao conteúdo real.
- Troque os botões de WhatsApp por links reais de compra quando existirem.
- Adicione os links de download do plugin e dos arquivos gratuitos (em `downloads.js`; os itens atuais são exemplos de estrutura com “Em breve”).
- Confirme por escrito as condições do suporte 24 horas e das atualizações do plugin.

## Ranking do jogo
- Por padrão o ranking fica **só no navegador de cada pessoa** (localStorage).
- Para um ranking **compartilhado por todos**, é preciso um banco online. O `game.js` já está pronto para o Firebase Realtime Database (grátis):
  1. Crie um projeto em firebase.google.com e um Realtime Database.
  2. Em *Regras*, permita leitura e escrita só no caminho `ranking`, por exemplo:
     `{ "rules": { "ranking": { ".read": true, "$k": { ".write": true, ".validate": "newData.hasChildren(['name','score','tries'])" } } } }`
  3. Copie a URL do banco (termina em `firebaseio.com`) e cole em `RANK_URL` no topo do `game.js`.
- Atenção: como o jogo roda no navegador, qualquer pessoa tecnicamente consegue enviar pontuação falsa. Serve para diversão, não para prêmios.

## Antes de anunciar
- Cursos mostram "Em breve" no lugar do preço; quando abrir as vendas, troque por `<div class="price">R$ ...</div>`.
