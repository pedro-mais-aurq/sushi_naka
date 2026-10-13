# Sushi Naka · Tradição japonesa desde 1987

Atualização do projeto enviado: novo hero, seção imersiva, cardápio ilustrado com filtros e páginas individuais. O site usa HTML, CSS e JavaScript, com funcionamento estático e painel local.

## O que foi atualizado

- Hero com a última imagem enviada, integrado à composição em papel creme e vermelho.
- Seção antes do cardápio com quatro sabores selecionáveis, recortes transparentes e movimento discreto. Respeita a preferência de movimento reduzido.
- Cardápio em `cardapio/`: 16 pratos em quatro fileiras de quatro itens no desktop. Em telas pequenas, cada fileira adapta os itens para duas colunas.
- Filtros por categoria, busca por prato ou ingrediente, tratamento de acentos, contagem de resultados e estado de busca vazia. Os filtros são mantidos na URL.
- 16 páginas físicas em `cardapio/<nome-do-prato>/`, com composição ilustrada, texto, imagem, detalhes e pratos relacionados. Produtos adicionados no painel recebem uma página pela rota `prato/?id=<id>`.
- Hover nas comidas, botões e links, menu para celular com suporte a Escape e navegação por teclado.
- Faixa que vinha abaixo do hero removida. O ano fictício de 2018 foi substituído por 1987.
- Painel atualizado para quatro categorias, novas imagens, texto da página, ingredientes ilustrados, alérgenos, destaques e preço opcional. Upload mantém transparência.
- Migração do banco anterior mantém produtos, preços, contatos e fotos personalizados. Os três produtos e contatos demonstrativos que ainda estiverem intactos recebem a nova versão. Exclusões feitas no novo painel continuam excluídas.
- Imagens de navegação em WebP transparente; os PNGs permanecem em `assets/food/` para edição e reaproveitamento.

## Abrir no computador

Descompacte o ZIP, entre na pasta `sushi_naka-main` e execute:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080/`. O painel fica em `http://localhost:8080/admin/`. Use um servidor HTTP para manter navegação e banco local consistentes.

## Cardápio e painel

Os 16 pratos formam uma seleção ilustrativa para a nova apresentação. A disponibilidade, as receitas, as porções e os valores precisam ser validados pela casa. Os valores do projeto anterior eram demonstrativos; por isso a nova base usa **Consulte a casa** até receber uma tabela atual. No painel, preencher um preço o exibe em reais; deixar vazio mantém essa mensagem.

O painel guarda as alterações no IndexedDB deste navegador e deste domínio. A mesma pessoa vê as mudanças no início, no cardápio e nas páginas dos pratos. Para atualizar o catálogo publicado para todos os visitantes, edite `catalog.json`, execute `python3 scripts/build.py` e publique a nova versão. Não é necessário instalar pacotes para gerar o site.

## GitHub Pages

O workflow `.github/workflows/deploy.yml` gera o site, valida suas rotas e publica a pasta `dist/` nas branches `main` ou `master`. No repositório, escolha **Settings → Pages → Source → GitHub Actions**. Os links e recursos são relativos para funcionar em um domínio próprio ou em uma página de projeto.

O ZIP também contém o HTML já gerado; é possível usar seu conteúdo diretamente em hospedagem estática. `catalog.json` é a fonte do catálogo e `scripts/build.py` gera todas as páginas. Edite as seções no script para preservar essas mudanças em builds futuros.

## Pesquisa e direção editorial

A narrativa da família Nakao, da tradição no preparo e do cuidado com o peixe foi apoiada em reportagens sobre o restaurante. O ano **1987**, informado no briefing, também consta no BHAZ e no Destemperados. Há outras publicações que citam 1988; o site mantém a data do briefing.

O endereço, o telefone e os horários adotados seguem o Portal Oficial de Belo Horizonte consultado em 13/10/2026: Avenida Afonso Pena, 2828, Savassi; (31) 3287-2714; terça a domingo, 11h–14h e 18h–23h. O código anterior continha endereço, telefone e e-mail fictícios. A casa pode atualizar esses dados no painel e no catálogo.

O guia da Organização Nacional de Turismo do Japão ajudou a orientar os textos sobre shari, nigiri, sashimi e temaki. O posicionamento anti-fusion foi aplicado aos novos textos e preparos ilustrados, sem inventar prêmios, avaliações, fornecedores ou depoimentos.

As referências Hokkaido e Nashy orientaram o destaque à experiência, a descoberta do cardápio e a clareza dos caminhos para visitar a casa. A marca e a composição do Sushi Naka foram preservadas.

Fontes:

- [Portal Oficial de Belo Horizonte · Restaurante Sushi Naka](https://portalbelohorizonte.com.br/o-que-fazer/comer-e-beber/restaurante/restaurante-sushi-naka)
- [BHAZ · Melhor comida japonesa, 2018](https://bhaz.com.br/melhoresbhaz2018/melhor-comida-japonesa/?fromt=yes)
- [Destemperados · Sushi Naka, o japonês tradicional de BH](https://gauchazh.clicrbs.com.br/destemperados/experiencias/noticia/2016/09/sushi-naka-o-japones-tradicional-de-bh-ckbq3ocjs0093ivslmg6ist72.html)
- [JNTO · Sushi in Japan Guide](https://www.japan.travel/en/guide/sushi-in-japan/)
- [Hokkaido](https://hokkaido.com.br/)
- [Nashy Sushi](https://www.nashysushi.com/)
- [GitHub Docs · Workflows para GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Verificação

Execute `npm test`, ou:

```bash
node --test tests/contracts.test.cjs
python3 tests/static.py
```

Nove testes verificam busca, categorias, URLs sob subdiretório, preços opcionais, cadastro, edição, exclusão, migração e rejeição de dados inválidos. A validação estática confere as 20 páginas, âncoras, imagens, ordem dos scripts, quatro fileiras e os estados previstos no código. Os recortes PNG e WebP tiveram seu canal alpha verificado.

A ferramenta de validação visual no navegador não estava disponível no ambiente de criação. Os breakpoints e estados de navegação foram conferidos no código, e os recortes foram inspecionados visualmente. A verificação do IndexedDB usa um mock em Node; uma revisão visual em navegadores e dispositivos reais permanece recomendada antes de uma publicação comercial.
