const currency = (n, locale = 'pt-BR', curr = 'BRL') => new Intl.NumberFormat(locale, { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(n);
const kmfmt = (n) => new Intl.NumberFormat('pt-BR').format(n) + ' km';

async function loadJSON(path) { const r = await fetch(path); return r.json(); }

function qs(s, el = document) { return el.querySelector(s); }
function qsa(s, el = document) { return [...el.querySelectorAll(s)]; }

function setCompanyUI(cfg) {
  const whats = cfg.company.whatsapp;
  const social = cfg.company.social;
  const phone = cfg.company.phone;
  const email = cfg.company.email;
  const address = cfg.company.address;
  const hours = cfg.company.hours;

  const whatsBtns = [qs('#whatsTop'), qs('#whatsHero'), qs('#whatsContact')].filter(Boolean);
  whatsBtns.forEach(b => { if (b) { b.href = whats; b.textContent = 'WhatsApp'; } });

  const socialWrap = qs('#socialLinks');
  if (socialWrap) {
    const icons = Object.entries(social).filter(([k, v]) => v).map(([k, v]) => `<a target="_blank" rel="noopener" href="${v}">${k}</a>`).join('');
    socialWrap.innerHTML = icons;
  }
  const cl = qs('#contactList');
  if (cl) {
    cl.innerHTML = `
      <li><strong>Telefone:</strong> <a href="tel:${phone.replace(/\D/g, '')}">${phone}</a></li>
      <li><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></li>
      <li><strong>Endereço:</strong> <a target="_blank" rel="noopener" href="${cfg.company.map}">${address}</a></li>
      <li><strong>Horário:</strong> ${hours}</li>
    `;
  }
  const cpl = qs('#contactPageList');
  if (cpl) cpl.innerHTML = cl ? cl.innerHTML : '';
  const mapf = qs('#mapFrame');
  if (mapf && cfg.company.map) { mapf.src = cfg.company.map; }

  const yearSpan = qs('#year'); if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

// Build car card
function carCard(c) {
  const statusClass = c.status === 'vendido' ? 'status-vendido' : (c.status === 'reservado' ? 'status-reservado' : '');
  return `
  <article class="card">
    <a href="/car.html?id=${encodeURIComponent(c.id)}"><img src="${c.images[0]}" alt="${c.title}"/></a>
    <div class="content">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0 0 6px">${c.title}</h3>
        ${c.status !== 'disponivel' ? `<span class="badge ${statusClass}">${c.status.toUpperCase()}</span>` : ''}
      </div>
      <div class="meta">${c.year} • ${kmfmt(c.km)} • ${c.transmission} • ${c.fuel}</div>
      <div class="price">${currency(c.price)}</div>
      <div class="meta">${c.city} • ${c.color}</div>
    </div>
  </article>`;
}

async function mountHome() {
  const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg);
  const data = await loadJSON('/data/cars.json');
  const featured = data.cars.filter(c => c.featured).slice(0, 8);
  if (qs('#featuredGrid')) qs('#featuredGrid').innerHTML = featured.map(carCard).join('');
  if (qs('#heroHighlights')) qs('#heroHighlights').innerHTML = [
    'Laudo cautelar e procedência',
    'Atendimento direto por WhatsApp',
    'Financiamento com parceiros (exemplo)',
    'Troca com avaliação justa'
  ].map(t => `<div class="item">${t}</div>`).join('');
  // sellers placeholder
  if (qs('#sellersGrid')) qs('#sellersGrid').innerHTML = ['', '', ''].map((_, i) => `
    <article class="card seller-card">
      <img src="https://picsum.photos/seed/seller-${i}/800/800" alt="Vendedor ${i + 1}"/>
      <div class="content"><h3>Vendedor ${i + 1}</h3><div class="meta">Em breve</div></div>
    </article>`).join('');

  qs('#homeSearch')?.addEventListener('submit', e => {
    // let native submit go to inventory with query params
  });
}

function unique(list) { return [...new Set(list)]; }
function range(a, b) { const arr = []; for (let i = a; i <= b; i++) arr.push(i); return arr; }
function readParams() { return Object.fromEntries(new URLSearchParams(location.search)); }
function writeParams(p) { const sp = new URLSearchParams(p); history.replaceState({}, '', location.pathname + '?' + sp.toString()); }

async function mountInventory() {
  const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg);
  const data = await loadJSON('/data/cars.json');
  const grid = qs('#inventoryGrid');
  const params = readParams();

  // Populate filter options
  const brands = unique(data.cars.map(c => c.brand)).sort();
  const selBrand = qs('select[name=brand]'); if (selBrand) selBrand.innerHTML = '<option value="">Marca</option>' + brands.map(b => `<option ${params.brand === b ? 'selected' : ''}>${b}</option>`).join('');
  const years = unique(data.cars.map(c => c.year)).sort((a, b) => a - b);
  const selMin = qs('select[name=yearMin]'); const selMax = qs('select[name=yearMax]');
  if (selMin) selMin.innerHTML = '<option value="">Ano mín.</option>' + years.map(y => `<option ${params.yearMin == y ? 'selected' : ''}>${y}</option>`).join('');
  if (selMax) selMax.innerHTML = '<option value="">Ano máx.</option>' + years.map(y => `<option ${params.yearMax == y ? 'selected' : ''}>${y}</option>`).join('');

  function apply() {
    let list = data.cars.slice();
    const p = readParams();
    if (p.q) { const q = p.q.toLowerCase(); list = list.filter(c => `${c.brand} ${c.model} ${c.color}`.toLowerCase().includes(q)); }
    if (p.brand) { list = list.filter(c => c.brand === p.brand); }
    if (p.fuel) { list = list.filter(c => c.fuel === p.fuel); }
    if (p.transmission) { list = list.filter(c => c.transmission === p.transmission); }
    if (p.yearMin) { list = list.filter(c => c.year >= +p.yearMin); }
    if (p.yearMax) { list = list.filter(c => c.year <= +p.yearMax); }
    switch (p.sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'km_asc': list.sort((a, b) => a.km - b.km); break;
      case 'km_desc': list.sort((a, b) => b.km - a.km); break;
      default: list.sort((a, b) => b.year - a.year); // recent
    }
    const page = +(p.page || 1), per = 12;
    const total = Math.ceil(list.length / per);
    const slice = list.slice((page - 1) * per, page * per);
    grid.innerHTML = slice.map(carCard).join('') || '<p>Nenhum veículo encontrado.</p>';
    const pag = qs('#pagination');
    pag.innerHTML = range(1, total).map(i => `<button ${i === page ? 'disabled' : ''} data-page="${i}">${i}</button>`).join('');
    qsa('#pagination button').forEach(b => b.addEventListener('click', () => { p.page = b.dataset.page; writeParams(p); apply(); }));
  }

  // Bind filters
  qs('#filters').addEventListener('input', e => {
    const p = readParams();
    if (e.target.name) p[e.target.name] = e.target.value;
    p.page = 1;
    writeParams(p);
    apply();
  });

  // initialize
  ['q', 'brand', 'fuel', 'transmission', 'yearMin', 'yearMax', 'sort'].forEach(n => { if (params[n]) qs(`[name=${n}]`).value = params[n]; });
  apply();
}

function metaTag(name, content) { const m = document.createElement('meta'); m.setAttribute('property', name); m.content = content; document.head.appendChild(m); }

async function mountCar() {
  const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg);
  const { cars } = await loadJSON('/data/cars.json');
  const id = new URLSearchParams(location.search).get('id');
  const car = cars.find(c => c.id === id);
  const wrap = qs('#carDetail');
  if (!car) { wrap.innerHTML = '<p>Veículo não encontrado.</p>'; return; }

  document.title = `${car.title} | gtrcarros`;
  // Open Graph
  metaTag('og:title', `${car.title} | gtrcarros`);
  metaTag('og:type', 'product');
  metaTag('og:image', car.images[0]);

  // JSON-LD
  const ld = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": car.title,
    "brand": car.brand,
    "model": car.model,
    "vehicleTransmission": car.transmission,
    "fuelType": car.fuel,
    "color": car.color,
    "productionDate": String(car.year),
    "mileageFromOdometer": { "@type": "QuantitativeValue", "value": car.km, "unitCode": "KMT" },
    "offers": { "@type": "Offer", "priceCurrency": "BRL", "price": car.price, "availability": "https://schema.org/InStock" }
  };
  const script = document.createElement('script'); script.type = 'application/ld+json'; script.textContent = JSON.stringify(ld); document.head.appendChild(script);

  wrap.innerHTML = `
    <nav class="container" style="margin:8px 0"><a href="/inventory.html">← Voltar ao estoque</a></nav>
    <article class="card" style="padding:0">
      <div class="content" style="padding:0">
        <div class="gallery" style="display:grid;grid-template-columns:1fr;gap:6px">
          ${car.images.map(src => `<img loading="lazy" src="${src}" alt="${car.title}">`).join('')}
        </div>
        <div class="content" style="padding:16px">
          <h1 style="margin:0 0 8px">${car.title}</h1>
          <div class="meta">${car.year} • ${kmfmt(car.km)} • ${car.transmission} • ${car.fuel} • ${car.color} • ${car.city}</div>
          <div class="price" style="margin:12px 0">${currency(car.price)}</div>
          <div class="meta">Potência: ${car.power_cv} cv • Portas: ${car.doors}</div>
          <ul class="check" style="margin-top:12px">
            ${car.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
          <div class="cta-row">
            <a class="btn btn-primary" target="_blank" rel="noopener" href="${(await loadJSON('/data/company.json')).company.whatsapp}?text=${encodeURIComponent('Tenho interesse no ' + car.title + ' (' + location.href + ')')}">Chamar no WhatsApp</a>
            <a class="btn btn-outline" target="_blank" rel="noopener" href="${car.instagram}">Ver no Instagram</a>
          </div>
        </div>
      </div>
    </article>
    <section class="container">
      <h2>Especificações</h2>
      <div class="meta">${car.brand} • ${car.model} • ${car.year} • ${car.fuel} • ${car.transmission}</div>
    </section>
  `;
}

async function mountAbout() {
  const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg);
  const about = cfg.about;
  qs('#story').textContent = about.story;
  qs('#missionValues').innerHTML = about.mission_values.map(v => `<li>${v}</li>`).join('');
}

async function mountSellers() {
  const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg);
  // Placeholder cards
  if (qs('#sellersPageGrid')) qs('#sellersPageGrid').innerHTML = ['', '', '', ''].map((_, i) => `
    <article class="card seller-card">
      <img src="https://picsum.photos/seed/sellerpage-${i}/800/800" alt="Vendedor ${i + 1}"/>
      <div class="content"><h3>Vendedor ${i + 1}</h3><div class="meta">Perfil em breve</div></div>
    </article>`).join('');
}

function initMenu() {
  const btn = qs('.menu-toggle'); const nav = qs('.nav');
  btn?.addEventListener('click', () => {
    if (nav.style.display === 'flex') nav.style.display = 'none'; else nav.style.display = 'flex';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initMenu();
  const p = location.pathname;
  if (p.endsWith('/index.html') || p === '/') mountHome();
  else if (p.endsWith('/inventory.html')) mountInventory();
  else if (p.endsWith('/car.html')) mountCar();
  else if (p.endsWith('/about.html')) mountAbout();
  else if (p.endsWith('/sellers.html')) mountSellers();
  else if (p.endsWith('/contact.html')) { const cfg = await loadJSON('/data/company.json'); setCompanyUI(cfg); }
});
