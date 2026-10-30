const phone = '918437993098';
const cakes = [
  ['Peach Bloom','peach-bloom','vintage','A two-tier celebration in peach, ivory, delicate roses and beautifully piped bows.'],
  ['Sweetheart','sweetheart','romantic','Soft pink icing, fresh strawberries and intricate vintage detailing.'],
  ['Lavender Love','lavender-love','vintage','Lavender florals, deep berries and romantic piped garlands.'],
  ['Cherry Mocha','cherry-mocha','classic','Rich chocolate tones with red cherries and blush-pink accents.'],
  ['Blue Belle','blue-belle','vintage','Powder-blue ribbons, pearl details and sculptural ivory piping.'],
  ['Golden Day','golden-day','vintage','Butter-yellow frosting dressed with little white daisies.'],
  ['Be Mine','be-mine','romantic','A bold berry-red love note with strawberries and ribbon details.'],
  ['Mint to Be','mint-to-be','romantic','Sage green frosting, cream swirls and cherry-red accents.'],
  ['Little Joy','little-joy','vintage','Pale blush buttercream finished with dainty roses and raspberries.'],
  ['Sun Kissed','sun-kissed','occasion','A sunny palette of warm citrus, orange blooms and piping.'],
  ['Fruit Heart','fruit-heart','occasion','Heart-shaped celebration cake topped with colourful fresh fruit.'],
  ['Chocolate Celebration','chocolate-drums','classic','Chocolate shavings and piped cream around a dramatic round cake.'],
  ['Citrus Birthday','citrus-birthday','occasion','An abundant citrus-topped cake ready for a birthday surprise.'],
  ['Berry Layers','berry-layer','classic','Layers of sponge, pink filling and a glossy dark berry topping.'],
  ['Cosmic Party','cosmic-cake','occasion','A playful, planetary design for a celebration that is out of this world.'],
  ['Caramel Cream','caramel-cream','classic','A simple, timeless finish with golden glaze and cream piping.'],
  ['Character Celebration','character-cake','occasion','A vivid character-inspired birthday cake with piped detailing.']
];
const labels={vintage:'VINTAGE & FLORAL',romantic:'LOVE NOTES',occasion:'CELEBRATIONS',classic:'CLASSIC CREATIONS'};
const gallery=document.getElementById('gallery');
const dialog=document.getElementById('cake-dialog');
function card(c,i){const [title,file,cat]=c;const el=document.createElement('button');el.className='cake-card';el.type='button';el.setAttribute('aria-label',`View ${title} cake`);el.innerHTML=`<span class="cake-image"><img src="assets/${file}.jpg" loading="lazy" alt="${title} cake" /></span><span class="cake-meta"><span><small>${labels[cat]}</small><strong>${title}</strong></span><span class="round-arrow" aria-hidden="true">↗</span></span>`;el.addEventListener('click',()=>openCake(c));return el}
function renderGallery(filter='all'){gallery.replaceChildren(...cakes.filter(c=>filter==='all'||c[2]===filter).map(card));}
function openCake(c){const [title,file,cat,desc]=c;document.getElementById('dialog-image').src=`assets/${file}.jpg`;document.getElementById('dialog-image').alt=`${title} cake`;document.getElementById('dialog-title').textContent=title;document.getElementById('dialog-category').textContent=labels[cat];document.getElementById('dialog-desc').textContent=desc;document.getElementById('dialog-link').href=`https://wa.me/${phone}?text=${encodeURIComponent(`Hello Bakeology by Anjali! I'm interested in the ${title} cake. Could you please share availability and customization details?`)}`;dialog.showModal();}
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderGallery(b.dataset.filter)}));
const menus={
  cream:[['Pineapple Crush',600],['Pineacle’o’ Pine',700],['Chococia Heaven',650],['Dark Snow',650],['Kitkat Drum',700],['Oreo Magic',700],['Dusky Mud',650],['Red Velvet',700],['Blue Berry',700],['Love 2 Cappucino',650],['Fruity Love',700],['Day Night Choco',650]],
  dry:[['Vanilla',300],['Chocolate',350],['Choco Chip',450],['Marble',500],['Carrot',500],['Orange',500],['Dry Fruit',650],['Dates and Walnut',650]]
};
function renderMenu(type){document.getElementById('menu-list').innerHTML=menus[type].map(([name,price],i)=>`<div class="menu-row"><span class="menu-count">${String(i+1).padStart(2,'0')}</span><span class="menu-name">${name}</span><span class="menu-price">₹${price}</span></div>`).join('')}
document.querySelectorAll('[data-menu]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-menu]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});renderMenu(b.dataset.menu)}));
document.getElementById('enquiry-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;const name=f.elements.namedItem('name').value.trim(),occasion=f.elements.namedItem('occasion').value,desc=f.elements.namedItem('cake').value.trim();const text=`Hello Bakeology by Anjali! My name is ${name}.\nOccasion: ${occasion}\nCake details: ${desc}\nPlease let me know the options and availability.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')});
const toggle=document.querySelector('.mobile-toggle'),mobile=document.querySelector('.mobile-nav');toggle.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;toggle.setAttribute('aria-expanded',String(!mobile.hidden))});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;toggle.setAttribute('aria-expanded','false')}));
document.getElementById('year').textContent=new Date().getFullYear();
renderGallery();renderMenu('cream');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
