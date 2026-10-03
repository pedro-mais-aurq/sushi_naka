(function(){
'use strict';
async function prepare(file){
if(!file||!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Selecione uma foto JPG, PNG, WebP ou GIF.');
if(file.size>10*1024*1024)throw new Error('A foto deve ter no máximo 10 MB.');
if(!file.size)throw new Error('O arquivo está vazio. Selecione outra foto.');
const source=URL.createObjectURL(file);const image=new Image();
try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Não foi possível abrir esta foto. Selecione outro arquivo.'));image.src=source});
if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw new Error('A imagem é grande demais. Escolha uma foto com até 40 megapixels.');
const scale=Math.min(1,1200/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Não foi possível preparar a foto neste navegador.');ctx.fillStyle='#f5efdf';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);let photo=canvas.toDataURL('image/jpeg',.82);if(photo.length>=2000000)photo=canvas.toDataURL('image/jpeg',.6);if(photo.length>=2000000)throw new Error('Não foi possível reduzir esta foto. Escolha um arquivo menor.');return photo;
}finally{image.onload=null;image.onerror=null;URL.revokeObjectURL(source)}
}
window.NakaPhoto={prepare};
})();
