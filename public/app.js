
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={
  products:[],tenants:[],cart:JSON.parse(localStorage.getItem('ps_cart')||'[]'),
  user:JSON.parse(localStorage.getItem('ps_user')||'null'),
  orders:JSON.parse(localStorage.getItem('ps_orders')||'[]'),
  addresses:JSON.parse(localStorage.getItem('ps_addresses')||'[]'),
  selectedAddressId:localStorage.getItem('ps_selected_address')||null,
  category:'Semua', search:''
};
let pendingAuthAction=null;
const rupiah=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
function save(){
  localStorage.setItem('ps_cart',JSON.stringify(state.cart));
  localStorage.setItem('ps_orders',JSON.stringify(state.orders));
  localStorage.setItem('ps_addresses',JSON.stringify(state.addresses));
  if(state.selectedAddressId)localStorage.setItem('ps_selected_address',state.selectedAddressId); else localStorage.removeItem('ps_selected_address');
  if(state.user)localStorage.setItem('ps_user',JSON.stringify(state.user));
  updateHeader();
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function updateHeader(){
  const n=state.cart.reduce((a,b)=>a+b.qty,0);$('#cartCount').textContent=n;
  const l=$('.account-label'); if(l)l.textContent=state.user?state.user.name:'Masuk';
  const av=$('.avatar');if(av)av.textContent=(state.user?.name||'A').charAt(0).toUpperCase();
  const selected=state.addresses.find(a=>a.id===state.selectedAddressId);
  const loc=$('#locationText'); if(loc)loc.textContent=selected ? selected.label : 'Pilih alamat';
}
async function api(url,opt){const r=await fetch(url,opt);const d=await r.json();if(!r.ok)throw new Error(d.message||'Terjadi kesalahan');return d}
function discount(p){return Math.round((1-p.price/p.originalPrice)*100)}

function brandSlug(name){return String(name||'brand').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function brandMark(name,variant='card'){
 const slug=brandSlug(name);
 const special={
  'uniqlo':'<span class="uniqlo-grid"><i>UNI</i><i>QLO</i></span>',
  'starbucks':'<span class="round-monogram">S</span><span class="brand-text">STARBUCKS</span>',
  'jco':'<span class="round-monogram">J</span><span class="brand-text">J.CO</span>',
  'aeon':'<span class="brand-text">AEON</span>',
  'lotte-mart':'<span class="brand-text">LOTTE MART</span>',
  'gramedia':'<span class="brand-text">GRAMEDIA</span>',
  'mako':'<span class="brand-symbol">〽</span><span class="brand-text">MAKO</span>',
  'sephora':'<span class="brand-text spaced">SEPHORA</span>',
  'l-occitane':'<span class="brand-text serif">L’OCCITANE</span>',
  'kiehl-s':'<span class="brand-text serif">KIEHL’S</span>',
  'executive':'<span class="brand-text spaced">EXECUTIVE</span>',
  'colorbox':'<span class="brand-text">COLORBOX</span>',
  'butterman':'<span class="brand-text serif">BUTTERMAN</span>',
  'paris-baguette':'<span class="brand-text serif">PARIS BAGUETTE</span>',
  'erafone':'<span class="brand-text">erafone</span>',
  'azko':'<span class="brand-text">AZKO</span>',
  'mr-d-i-y-premium':'<span class="brand-text">MR.D.I.Y.</span>',
  'studio-tas':'<span class="brand-text serif">STUDIO TAS</span>'
 };
 return `<span class="brand-logo brand-${slug} brand-logo-${variant}" title="${name}">${special[slug]||`<span class="brand-text">${name}</span>`}</span>`;
}
function iconBox(){return `<svg class="meta-icon" viewBox="0 0 24 24"><path d="M5 8h14v11H5z"></path><path d="M8 8V5h8v3"></path><path d="M9 12h6"></path></svg>`}
function iconClock(){return `<svg class="meta-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`}

function card(p){return `<article class="product-card">
  <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="badge">${p.badge} · -${discount(p)}%</span><button class="heart" onclick="toast('Disimpan ke favorit demo')" aria-label="Simpan favorit">♡</button></div>
  <div class="product-body">
    <div class="tenant-row brand-row"><button class="brand-link" onclick="event.stopPropagation();location.hash='#/brand/${encodeURIComponent(p.tenant)}'">${brandMark(p.tenant,'card')}</button><span class="floor">Lt. ${p.floor}</span></div>
    <div class="product-title">${p.name}</div>
    <div class="price-line"><span class="price">${rupiah(p.price)}</span><span class="old">${rupiah(p.originalPrice)}</span></div>
    <div class="meta"><span>${iconBox()} Stok ${p.stock}</span><span>${iconClock()} ${p.pickup}</span></div>
    <div class="card-actions"><button class="add" onclick="addCart('${p.id}',1)">+ Keranjang</button><button class="detail" onclick="location.hash='#/product/${p.id}'" aria-label="Lihat detail">→</button></div>
  </div></article>`}
function requireAuth(action,message='Masuk atau daftar untuk melanjutkan pembelian.'){
 if(state.user)return true;
 pendingAuthAction=action||null;
 openAuth(message);
 return false;
}
function addCart(id,qty=1){
 const p=state.products.find(x=>x.id===id); if(!p)return;
 if(!state.user){
   requireAuth(()=>addCart(id,qty),`Masuk atau daftar dulu untuk menambahkan ${p.name} ke keranjang.`);
   return;
 }
 const x=state.cart.find(x=>x.id===id);
 if(x)x.qty=Math.min(x.qty+qty,p.stock); else state.cart.push({id,qty:Math.min(qty,p.stock)});
 save();toast(`${p.name} masuk keranjang`);
}
function buyNow(id,qty=1){
 const p=state.products.find(x=>x.id===id); if(!p)return;
 if(!state.user){
   requireAuth(()=>buyNow(id,qty),`Masuk atau daftar dulu untuk membeli ${p.name}.`);
   return;
 }
 const x=state.cart.find(x=>x.id===id);
 if(x)x.qty=Math.min(x.qty+qty,p.stock); else state.cart.push({id,qty:Math.min(qty,p.stock)});
 save();location.hash='#/cart';
}
function cartData(){return state.cart.map(c=>({...state.products.find(p=>p.id===c.id),qty:c.qty})).filter(x=>x.id)}
function total(){return cartData().reduce((a,b)=>a+b.price*b.qty,0)}
function route(){return location.hash.slice(2).split('/').filter(Boolean)}
function setActiveHero(i){$$('.slide').forEach((s,n)=>s.classList.toggle('active',n===i));$$('.hero-dots button').forEach((b,n)=>b.classList.toggle('active',n===i))}
let heroTimer;
function startHero(){clearInterval(heroTimer);let i=0;heroTimer=setInterval(()=>{i=(i+1)%3;setActiveHero(i)},4500)}
function home(){
 const cats=['Semua','Makanan','Grocery','Fashion','Beauty','Lifestyle','Home','Electronics'];
 const featured=state.products.slice(0,8);
 $('#app').innerHTML=`<div class="container hero-shell">
  <section class="hero">
   <div class="slides">
    <article class="slide active"><div class="hero-copy"><span class="eyebrow" style="color:#ffd1d4">PAKUWON SURPLUS</span><h1>Belanja hemat.<br>Kurangi sisa.</h1><p>Temukan produk surplus tenant Pakuwon Mall dengan stok terbatas, harga spesial, dan waktu pickup yang jelas.</p><div class="hero-actions"><a class="btn btn-primary" href="#/catalog">Lihat penawaran</a><button class="btn btn-ghost" onclick="openAddressModal()">Atur alamat</button></div></div><div class="hero-art"><div class="orb"></div><div class="floating a">Stok terbatas</div><div class="floating b">hingga 45% lebih hemat</div></div></article>
    <article class="slide"><div class="hero-copy"><span class="eyebrow" style="color:#ffe6d2">CLOSING DEALS</span><h1>Fresh food,<br>bukan food waste.</h1><p>Ambil paket bakery, fresh produce, atau food rescue pack sebelum tenant tutup.</p><div class="hero-actions"><button class="btn btn-primary" onclick="setCategory('Makanan')">Jelajahi makanan</button></div></div><div class="hero-art"><div class="orb"></div><div class="floating a">Pickup 20.00–22.00</div><div class="floating b">Fresh today</div></div></article>
    <article class="slide"><div class="hero-copy"><span class="eyebrow" style="color:#d4fff1">LAST STOCK</span><h1>Temukan stok akhir<br>yang masih bernilai.</h1><p>Fashion, beauty, home, dan produk display pilihan dari tenant dalam satu pengalaman belanja.</p><div class="hero-actions"><a class="btn btn-primary" href="#/catalog">Eksplor semuanya</a></div></div><div class="hero-art"><div class="orb"></div><div class="floating a">Last size</div><div class="floating b">Sealed & display</div></div></article>
   </div><div class="hero-dots">${[0,1,2].map(i=>`<button class="${i===0?'active':''}" onclick="setActiveHero(${i})"></button>`).join('')}</div>
  </section>
  <div class="quickbar">
   <div class="quick"><div class="ico"><svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.4"></circle></svg></div><div><strong>Alamat fleksibel</strong><small>Pilih alamat pengiriman</small></div></div>
   <div class="quick"><div class="ico"><svg viewBox="0 0 24 24"><path d="m13 2-8 12h6l-1 8 9-13h-6z"></path></svg></div><div><strong>Deal terbatas</strong><small>Stok berubah cepat</small></div></div>
   <div class="quick"><div class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></div><div><strong>Pickup terjadwal</strong><small>Waktu ambil jelas</small></div></div>
   <div class="quick"><div class="ico"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM14 14h2v2h-2z"></path></svg></div><div><strong>QRIS demo</strong><small>Checkout prototype</small></div></div>
  </div>
 </div>
 <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Hari ini di mall</div><h2>Penawaran pilihan</h2></div><a href="#/catalog" class="muted"><b>Lihat semua →</b></a></div><div class="chips">${cats.slice(0,6).map((c,i)=>`<button class="chip ${i===0?'active':''}" onclick="quickFilter('${c}',this)">${c}</button>`).join('')}</div><div class="product-grid" id="homeProducts" style="margin-top:17px">${featured.map(card).join('')}</div></div></section>
 <section class="section" style="background:#faf8f8"><div class="container"><div class="section-head"><div><div class="eyebrow">Tenant directory</div><h2>Brand di Pakuwon Mall</h2></div><span class="muted">Demo katalog tenant</span></div><div class="tenant-strip">${state.tenants.slice(0,12).map(t=>`<div class="tenant-card" onclick="location.hash='#/brand/${encodeURIComponent(t.name)}'">${brandMark(t.name,'tenant')}<small>${t.category} · Level ${t.floor}</small><span style="font-size:12px;color:var(--red);font-weight:800">Lihat brand →</span></div>`).join('')}</div></div></section>
 <section class="section"><div class="container"><div class="banner"><div><div class="eyebrow">PAKUWON SURPLUS</div><h3>Satu tempat untuk surplus tenant.</h3><p class="muted">Cari produk, masukkan ke keranjang, pilih pickup, lalu selesaikan pembayaran demo via QR.</p></div><a class="btn btn-red" href="#/catalog">Mulai belanja</a></div></div></section>`;
 startHero();
}
function quickFilter(c,el){$$('.chip').forEach(x=>x.classList.remove('active'));el.classList.add('active');$('#homeProducts').innerHTML=(c==='Semua'?state.products:state.products.filter(p=>p.category===c)).slice(0,8).map(card).join('')}
function setCategory(c){state.category=c;location.hash='#/catalog'}
function catalog(){
 const cats=['Semua',...new Set(state.products.map(p=>p.category))];
 let list=state.products.filter(p=>(state.category==='Semua'||p.category===state.category) && (!state.search||`${p.name} ${p.tenant} ${p.category}`.toLowerCase().includes(state.search.toLowerCase())));
 $('#app').innerHTML=`<div class="container"><div class="catalog-top"><div><div class="eyebrow">Eksplor</div><h1>Semua penawaran</h1><p class="muted">${list.length} item demo tersedia</p></div><div class="filters"><select id="sort"><option value="featured">Rekomendasi</option><option value="low">Harga terendah</option><option value="discount">Diskon terbesar</option></select></div></div><div class="chips" style="margin:20px 0">${cats.map(c=>`<button class="chip ${c===state.category?'active':''}" onclick="state.category='${c}';render()">${c}</button>`).join('')}</div><div class="product-grid" id="catalogGrid">${list.map(card).join('')}</div></div>`;
 $('#sort').onchange=e=>{let x=[...list];if(e.target.value==='low')x.sort((a,b)=>a.price-b.price);if(e.target.value==='discount')x.sort((a,b)=>discount(b)-discount(a));$('#catalogGrid').innerHTML=x.map(card).join('')}
}
function productPage(id){
 const p=state.products.find(x=>x.id===id);if(!p)return catalog();
 $('#app').innerHTML=`<div class="container detail-page"><div class="detail-image"><img src="${p.image}" alt="${p.name}"></div><div class="detail-copy"><div class="detail-brand-line">${brandMark(p.tenant,'detail')}<span class="muted">Level ${p.floor} · Pakuwon Mall</span></div><h1>${p.name}</h1><div class="price-line"><span class="bigprice">${rupiah(p.price)}</span><span class="old">${rupiah(p.originalPrice)}</span><span class="badge" style="position:static">-${discount(p)}%</span></div><p class="muted" style="font-size:17px;line-height:1.7">${p.desc}</p><div class="detail-info"><div class="info-box"><small>Stok</small><b><br>${p.stock} tersedia</b></div><div class="info-box"><small>Pickup</small><b><br>${p.pickup}</b></div><div class="info-box"><small>Lokasi</small><b><br>Level ${p.floor}</b></div></div><p><b>Jumlah</b></p><div class="qty"><button onclick="qtyChange(-1)">−</button><input id="qtyInput" value="1" readonly><button onclick="qtyChange(1,${p.stock})">+</button></div><div class="hero-actions" style="margin-top:24px"><button class="btn btn-red" onclick="addCart('${p.id}',Number($('#qtyInput').value))">+ Tambah ke keranjang</button><button class="btn" style="background:#f4f1f1" onclick="buyNow('${p.id}',Number($('#qtyInput').value))">Beli sekarang</button></div><div class="banner" style="margin-top:28px;padding:18px"><div><b>Catatan prototype</b><p class="muted" style="margin:5px 0">Penawaran surplus ini adalah data demo untuk simulasi project charter, bukan listing komersial aktif.</p></div></div></div></div>`
}
function qtyChange(d,max=99){const q=$('#qtyInput');q.value=Math.max(1,Math.min(max,Number(q.value)+d))}

function brandPage(name){
 const brand=decodeURIComponent(name||'');
 const tenant=state.tenants.find(t=>t.name.toLowerCase()===brand.toLowerCase()) || {name:brand,category:'Tenant',floor:'-'};
 const items=state.products.filter(p=>p.tenant.toLowerCase()===brand.toLowerCase());
 $('#app').innerHTML=`<div class="container">
   <section class="brand-page-hero">
     <div class="brand-hero-main">
       <div class="brand-hero-logo">${brandMark(tenant.name,'hero')}</div>
       <div>
         <div class="eyebrow" style="color:#ffb8bc">TENANT PAGE</div>
         <h1>${tenant.name}</h1>
         <div class="brand-meta">${tenant.category} · Level ${tenant.floor} · Pakuwon Mall</div>
       </div>
     </div>
     <a class="btn btn-primary" href="#/catalog">Kembali ke katalog</a>
   </section>
   <div class="section-head"><div><div class="eyebrow">Penawaran brand</div><h2>${items.length ? items.length+' produk tersedia' : 'Belum ada penawaran aktif'}</h2></div></div>
   ${items.length?`<div class="product-grid">${items.map(card).join('')}</div>`:`<div class="empty"><h2>Belum ada stok surplus dari ${tenant.name}</h2><p class="muted">Halaman brand sudah siap. Produk akan muncul otomatis saat data produk tenant ditambahkan.</p><a href="#/catalog" class="btn btn-red">Lihat tenant lain</a></div>`}
 </div>`;
}

function cart(){
 if(!state.user){
   requireAuth(()=>{location.hash='#/cart'},'Masuk atau daftar dulu untuk membuka keranjang belanja.');
   $('#app').innerHTML=`<div class="container"><div class="empty auth-required"><div class="lock-illustration"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></div><h2>Masuk untuk melihat keranjang</h2><p class="muted">Keranjang dan proses pembelian hanya tersedia setelah kamu login atau membuat akun.</p><button class="btn btn-red" onclick="openAuth('Masuk atau daftar dulu untuk membuka keranjang belanja.')">Masuk / Daftar</button></div></div>`;
   return;
 }
 const items=cartData();
 $('#app').innerHTML=`<div class="container"><div class="catalog-top"><div><div class="eyebrow">Keranjang</div><h1>Keranjang belanja</h1></div></div>${items.length?`<div class="cart-layout"><div class="cart-list">${items.map(p=>`<div class="cart-item"><img src="${p.image}"><div><b>${p.name}</b><div class="muted">${p.tenant} · Level ${p.floor}</div><div class="price" style="font-size:18px;margin-top:8px">${rupiah(p.price)}</div></div><div><div class="qty"><button onclick="cartQty('${p.id}',-1)">−</button><b>${p.qty}</b><button onclick="cartQty('${p.id}',1)">+</button></div><button class="btn" style="padding:8px 10px;margin-top:10px" onclick="removeCart('${p.id}')">Hapus</button></div></div>`).join('')}</div>${summaryHTML(true)}</div>`:`<div class="empty"><div class="empty-cart-icon"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.1 10.2h9.8L19 7H6.2"></path><circle cx="9" cy="19" r="1.25"></circle><circle cx="17" cy="19" r="1.25"></circle></svg></div><h2>Keranjang masih kosong</h2><p class="muted">Cari penawaran surplus yang menarik buat kamu.</p><a class="btn btn-red" href="#/catalog">Mulai belanja</a></div>`}</div>`
}
function cartQty(id,d){const x=state.cart.find(i=>i.id===id),p=state.products.find(p=>p.id===id);x.qty=Math.max(1,Math.min(p.stock,x.qty+d));save();cart()}
function removeCart(id){state.cart=state.cart.filter(x=>x.id!==id);save();cart()}
function summaryHTML(checkout=false){const sub=total(),service=Math.round(sub*.02),grand=sub+service;return `<aside class="summary"><h3>Ringkasan</h3><div class="sum-row"><span>Subtotal</span><b>${rupiah(sub)}</b></div><div class="sum-row"><span>Service demo 2%</span><b>${rupiah(service)}</b></div><div class="sum-row"><span>Diskon</span><b style="color:var(--green)">Rp0</b></div><div class="sum-row total"><span>Total</span><span>${rupiah(grand)}</span></div>${checkout?`<a href="#/checkout" class="btn btn-red" style="width:100%;margin-top:10px">Lanjut checkout</a>`:''}<small class="muted" style="display:block;margin-top:12px">Pembayaran QR pada prototype ini bersifat simulasi dan tidak memproses uang asli.</small></aside>`}
function checkout(){
 if(!state.user){
   requireAuth(()=>{location.hash='#/checkout'},'Masuk atau daftar dulu untuk melanjutkan checkout.');
   return;
 }
 if(!state.cart.length){location.hash='#/cart';return}
 $('#app').innerHTML=`<div class="container"><div class="catalog-top"><div><div class="eyebrow">Checkout</div><h1>Selesaikan pesanan</h1></div></div><div class="checkout-layout"><div><h3>Data pengambil</h3><div class="form-grid"><div class="field"><label>Nama</label><input id="cName" value="${state.user?.name||''}" placeholder="Nama lengkap"></div><div class="field"><label>No. WhatsApp</label><input id="cPhone" placeholder="08xxxxxxxxxx"></div><div class="field full"><label>Email</label><input id="cEmail" value="${state.user?.email||''}" placeholder="email@contoh.com"></div></div><h3 style="margin-top:28px">Metode penerimaan</h3><div class="fulfill"><div class="choice active" data-mode="Pickup" onclick="chooseFulfill(this)"><b><svg class="icon-inline" viewBox="0 0 24 24"><path d="M4 10h16v10H4z"></path><path d="M3 10l2-5h14l2 5"></path><path d="M8 20v-6h8v6"></path></svg>Pickup di tenant</b><p class="muted">Ambil sesuai jam pickup masing-masing item.</p></div><div class="choice" data-mode="Delivery" onclick="chooseFulfill(this)"><b><svg class="icon-inline" viewBox="0 0 24 24"><path d="M3 7h11v9H3z"></path><path d="M14 10h4l3 3v3h-7z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>Kirim ke alamat</b><p class="muted">Gunakan alamat yang kamu pilih.</p></div></div><div class="delivery-address-card" id="checkoutAddressBox"><b>Alamat pengiriman</b><p class="muted" id="checkoutAddressText">${selectedAddressText()}</p><button class="btn" style="background:#f4f1f1;padding:9px 12px" onclick="openAddressModal()">Pilih / kelola alamat</button></div><h3 style="margin-top:28px">Pembayaran</h3><div class="choice active"><b>▣ QRIS Demo</b><p class="muted">QR akan dibuat setelah konfirmasi pesanan.</p></div></div>${summaryHTML(false)}<button class="btn btn-red" style="grid-column:2;width:100%;margin-top:-100px;height:50px;z-index:2" onclick="createOrder()">Buat QR pembayaran</button></div></div>`
}
function chooseFulfill(el){$$('.fulfill .choice').forEach(x=>x.classList.remove('active'));el.classList.add('active')}
async function createOrder(){
 const name=$('#cName').value.trim(),phone=$('#cPhone').value.trim(),email=$('#cEmail').value.trim();if(!name||!phone){toast('Nama dan WhatsApp wajib diisi');return}
 const mode=$('.fulfill .choice.active')?.dataset.mode||'Pickup';
 const selectedAddress=state.addresses.find(a=>a.id===state.selectedAddressId)||null;
 if(mode==='Delivery' && !selectedAddress){toast('Pilih alamat pengiriman dulu');openAddressModal();return}
 const sub=total(),grand=sub+Math.round(sub*.02);
 const body={items:cartData().map(x=>({id:x.id,name:x.name,tenant:x.tenant,qty:x.qty,price:x.price})),total:grand,customer:{name,phone,email},fulfillment:mode,address:selectedAddress};
 try{const order=await api('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); state.orders.unshift(order);save();showPayment(order)}catch(e){toast(e.message)}
}
async function showPayment(order){
 const q=await api(`/api/payment-qr/${order.id}?amount=${order.total}`);
 $('#app').innerHTML=`<div class="container"><div class="success" style="max-width:820px"><div class="eyebrow">QRIS DEMO</div><h1 style="font-size:45px">Scan untuk simulasi pembayaran</h1><p class="muted">Order ${order.id} · ${rupiah(order.total)}</p><div class="qrbox"><img src="${q.dataUrl}" alt="QR demo"><p><b>QR ini bukan pembayaran sungguhan.</b></p><p class="muted">Klik tombol di bawah untuk mensimulasikan status pembayaran berhasil.</p></div><button class="btn btn-red" onclick="payDemo('${order.id}')">Saya sudah “bayar”</button><a class="btn" href="#/home">Kembali</a></div></div>`
}
async function payDemo(id){await api(`/api/orders/${id}/pay`,{method:'POST'});const o=state.orders.find(x=>x.id===id);if(o)o.status='Dibayar (demo)';state.cart=[];save();$('#app').innerHTML=`<div class="container"><div class="success"><div class="check">✓</div><h1>Pembayaran demo berhasil</h1><p class="muted">Pesanan <b>${id}</b> sudah tercatat di browser ini. Tunjukkan kode pesanan saat pickup.</p><a class="btn btn-red" href="#/account">Lihat pesanan</a><a class="btn" href="#/home">Belanja lagi</a></div></div>`}
function accountPage(){
 if(!state.user){openAuth();location.hash='#/home';return}
 $('#app').innerHTML=`<div class="container account-panel"><aside class="side-card"><div class="profile-card"><div class="avatar" style="background:#fff;color:#2a1113;width:55px;height:55px;font-size:22px">${state.user.name[0].toUpperCase()}</div><h2>${state.user.name}</h2><p style="opacity:.7">${state.user.email}</p></div><button class="btn" style="width:100%;margin-top:12px;background:#f6f2f2" onclick="logout()">Keluar</button></aside><section><div class="eyebrow">Account</div><h1 style="font-size:42px;margin-top:6px">Pesanan saya</h1>${state.orders.length?state.orders.map(o=>`<div class="order-card"><div style="display:flex;justify-content:space-between"><b>${o.id}</b><span class="badge" style="position:static">${o.status}</span></div><p class="muted">${new Date(o.createdAt).toLocaleString('id-ID')} · ${o.fulfillment}</p><b>${rupiah(o.total)}</b></div>`).join(''):`<div class="empty"><div class="emoji">📦</div><h3>Belum ada pesanan</h3><p class="muted">Pesanan demo yang kamu buat akan muncul di sini.</p></div>`}</section></div>`
}
function openAuth(message='Akun demo disimpan di browser, jadi tidak perlu database.'){
 const m=$('#modal'),c=$('#modalCard');m.classList.remove('hidden');c.innerHTML=`<button class="close-modal" onclick="closeModal()">×</button><div class="eyebrow">PAKUWON SURPLUS</div><h2>Masuk atau daftar</h2><p class="muted">${message}</p><div class="tabs"><button class="active" onclick="authTab('login',this)">Masuk</button><button onclick="authTab('signup',this)">Daftar</button></div><div class="field" id="nameField" style="display:none"><label>Nama</label><input id="authName" placeholder="Nama kamu"></div><div class="field" style="margin-top:10px"><label>Email</label><input id="authEmail" placeholder="nama@email.com"></div><div class="field" style="margin-top:10px"><label>Password</label><input type="password" id="authPass" placeholder="••••••••"></div><button class="btn btn-red" style="width:100%;margin-top:15px" id="authSubmit" onclick="submitAuth('login')">Masuk</button><small class="muted" style="display:block;margin-top:12px">Prototype only — jangan gunakan password asli.</small>`
}
function authTab(mode,b){$$('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#nameField').style.display=mode==='signup'?'block':'none';$('#authSubmit').textContent=mode==='signup'?'Buat akun':'Masuk';$('#authSubmit').onclick=()=>submitAuth(mode)}
async function submitAuth(mode){
 const email=$('#authEmail').value.trim(),name=$('#authName')?.value.trim();
 if(!email){toast('Isi email dulu');return}
 if(mode==='signup' && !name){toast('Isi nama dulu');return}
 try{
   const r=await api('/api/auth/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email})});
   state.user=r.user;localStorage.setItem('ps_user',JSON.stringify(r.user));closeModal();updateHeader();toast(`Halo, ${r.user.name}!`);
   const next=pendingAuthAction;pendingAuthAction=null;
   if(next)setTimeout(()=>next(),80);
 }catch(e){toast(e.message)}
}
function closeModal(){$('#modal').classList.add('hidden')}function logout(){state.user=null;pendingAuthAction=null;localStorage.removeItem('ps_user');updateHeader();location.hash='#/home';toast('Berhasil keluar')}
function selectedAddressText(){
 const a=state.addresses.find(x=>x.id===state.selectedAddressId);
 return a ? `${a.label} — ${a.recipient}, ${a.phone}<br>${a.address}${a.note?' · '+a.note:''}` : 'Belum ada alamat dipilih.';
}
function openAddressModal(editId=null){
 const m=$('#modal'),c=$('#modalCard');m.classList.remove('hidden');
 const editing=editId?state.addresses.find(a=>a.id===editId):null;
 c.innerHTML=`<button class="close-modal" onclick="closeModal()">×</button>
 <div class="eyebrow">ALAMAT</div><h2>${editing?'Edit alamat':'Alamat pengiriman'}</h2>
 <p class="muted">Simpan beberapa alamat, lalu pilih alamat yang akan digunakan saat checkout.</p>
 ${!editing?`<div class="address-list">${state.addresses.length?state.addresses.map(a=>`<div class="address-item ${a.id===state.selectedAddressId?'active':''}" onclick="selectAddress('${a.id}')"><div><b>${a.label}</b><div style="margin-top:5px">${a.recipient} · ${a.phone}</div><div class="muted" style="margin-top:4px">${a.address}${a.note?' · '+a.note:''}</div></div><div class="address-actions"><button onclick="event.stopPropagation();openAddressModal('${a.id}')">Edit</button><button class="danger" onclick="event.stopPropagation();deleteAddress('${a.id}')">Hapus</button></div></div>`).join(''):`<div class="address-empty">Belum ada alamat tersimpan.</div>`}</div>`:''}
 <div class="address-form">
   <input id="addrLabel" placeholder="Label, mis. Rumah / Kos" value="${editing?.label||''}">
   <input id="addrRecipient" placeholder="Nama penerima" value="${editing?.recipient||''}">
   <input id="addrPhone" placeholder="No. WhatsApp" value="${editing?.phone||''}">
   <input id="addrCity" placeholder="Kota / Kecamatan" value="${editing?.city||''}">
   <textarea class="full" id="addrAddress" rows="3" placeholder="Alamat lengkap">${editing?.address||''}</textarea>
   <input class="full" id="addrNote" placeholder="Catatan patokan (opsional)" value="${editing?.note||''}">
 </div>
 <button class="btn btn-red" style="width:100%;margin-top:14px" onclick="saveAddress('${editing?.id||''}')">${editing?'Simpan perubahan':'Tambah alamat'}</button>`;
}
function saveAddress(id=''){
 const data={label:$('#addrLabel').value.trim(),recipient:$('#addrRecipient').value.trim(),phone:$('#addrPhone').value.trim(),city:$('#addrCity').value.trim(),address:$('#addrAddress').value.trim(),note:$('#addrNote').value.trim()};
 if(!data.label||!data.recipient||!data.phone||!data.address){toast('Lengkapi label, penerima, WhatsApp, dan alamat');return}
 if(id){const i=state.addresses.findIndex(a=>a.id===id);state.addresses[i]={...state.addresses[i],...data}}
 else{const newId='ADDR-'+Date.now();state.addresses.push({id:newId,...data});if(!state.selectedAddressId)state.selectedAddressId=newId}
 save();openAddressModal();toast(id?'Alamat diperbarui':'Alamat ditambahkan');
}
function selectAddress(id){state.selectedAddressId=id;save();closeModal();const x=$('#checkoutAddressText');if(x)x.innerHTML=selectedAddressText();toast('Alamat dipilih')}
function deleteAddress(id){state.addresses=state.addresses.filter(a=>a.id!==id);if(state.selectedAddressId===id)state.selectedAddressId=state.addresses[0]?.id||null;save();openAddressModal();toast('Alamat dihapus')}
function render(){clearInterval(heroTimer);const [p,id]=route();if(!p||p==='home')home();else if(p==='catalog')catalog();else if(p==='product')productPage(id);else if(p==='brand')brandPage(id);else if(p==='cart')cart();else if(p==='checkout')checkout();else if(p==='account')accountPage();else home();window.scrollTo({top:0,behavior:'instant'})}
async function init(){try{[state.products,state.tenants]=await Promise.all([api('/api/products'),api('/api/tenants')])}catch(e){$('#app').innerHTML='<div class="container"><div class="empty"><h2>API belum berjalan</h2><p>Jalankan npm install lalu npm start.</p></div></div>';return}updateHeader();render()}
window.addEventListener('hashchange',render);
$('#accountBtn').onclick=()=>state.user?location.hash='#/account':openAuth();
$('#mobileAccount').onclick=()=>state.user?location.hash='#/account':openAuth();
$('#locationBtn').onclick=()=>openAddressModal();
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){state.search=e.target.value.trim();state.category='Semua';location.hash='#/catalog'}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}});
init();
