# Imagens do Sushi Naka

A imagem panorâmica final enviada é o hero em `assets/hero-naka.webp`. Sua composição e marca foram mantidas, com ajuste do enquadramento pelo CSS para cada tamanho de tela. As sete cenas alimentares enviadas estão otimizadas em `assets/scenes/`.

Os recortes finais estão em `assets/food/`, em PNG e WebP com transparência. Foram preparados com a ferramenta integrada imagegen, sem CLI externa. Os WebPs são versões para navegação dos mesmos PNGs.

| Arquivo PNG | Origem e uso |
| --- | --- |
| `nigiri.png` | Nigiri de salmão com hashis da imagem PM-2(1); seção imersiva e prato |
| `temaki.png` | Temaki da imagem PM-1(1); mão e fundo removidos, pepino substitui avocado |
| `uramaki.png` | Peça da imagem PM-3(1); hashis e fundo removidos, pepino substitui avocado |
| `ebi.png` | Camarão da imagem PM-4; mão, hashis e fundo removidos |
| `combinado-novo.png` | Composição de sushi e sashimi da imagem PM-1 |
| `lamen.png` | Tigela, noodles suspensos e hashis da imagem PM-2 |
| `tempura.png` | Travessa principal da imagem PM-3 |
| `gyoza.png` | Primeiro prato da ilustração de cardápio |
| `shimeji.png` | Segunda tigela da ilustração de cardápio |
| `sashimi-salmao.png` | Salmão da imagem de combinado, apresentado em pequena travessa |
| `sashimi-misto.png` | Travessa de sashimi da imagem de combinado |
| `teishoku-cutout.png` | Refeição da foto existente no código, com cenário e mão removidos |
| `sunomono.png` | Nova composição de pepino, wakame e gergelim, usando o cardápio como referência visual |
| `yakisoba.png` | Nova composição de noodles, carne e legumes, usando o lámen como referência de acabamento |

## Especificação dos prompts

Prompt comum dos recortes: “Extraia apenas a comida e sua louça principal da imagem de referência; preserve luz, ângulo, textura apetecível e aparência moderadamente ilustrativa. Remova cenário e objetos alheios ao prato. Entregue o objeto inteiro com pequena margem, fundo realmente transparente em canal alpha, sem texto, logotipo ou padrão quadriculado incorporado.”

As variações especificaram o objeto de cada linha da tabela. Nigiri conserva os hashis; lámen conserva os noodles suspensos e seus hashis; temaki remove a mão; ebi remove mão e hashis; gyoza conserva a pequena molheira. As bordas que estavam cortadas foram completadas para que a louça ficasse inteira. No temaki e no uramaki, o avocado foi substituído por pepino para acompanhar a proposta editorial anti-fusion.

Prompt para sunomono: “Uma pequena tigela preta de sunomono japonês, com fatias finas de pepino, wakame, gergelim branco e delicado tempero de vinagre; mesmo acabamento apetecível da referência, tigela completa e isolada em transparência.”

Prompt para yakisoba: “Uma travessa preta de yakisoba japonês com noodles salteados, carne em tiras, repolho, cenoura, cebolinha e um pequeno toque de beni shoga; luz quente e acabamento levemente ilustrativo da referência, prato completo e isolado em transparência.”

Todas as imagens e composições de produtos são ilustrativas. As fotos do acervo original continuam disponíveis como opções no painel.
