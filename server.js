const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const products = JSON.parse(fs.readFileSync(path.join(__dirname,'data','products.json'),'utf8'));
const tenants = JSON.parse(fs.readFileSync(path.join(__dirname,'data','tenants.json'),'utf8'));

app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname,'public')));

app.get('/api/health', (_,res)=>res.json({ok:true,name:'Pakuwon Surplus API'}));
app.get('/api/products', (req,res)=>{
  const {q='',category=''} = req.query;
  const needle = String(q).toLowerCase();
  let result = products.filter(p => !needle || `${p.name} ${p.tenant} ${p.category}`.toLowerCase().includes(needle));
  if(category && category !== 'Semua') result = result.filter(p=>p.category===category);
  res.json(result);
});
app.get('/api/products/:id', (req,res)=>{
  const product = products.find(p=>p.id===req.params.id);
  if(!product) return res.status(404).json({message:'Produk tidak ditemukan'});
  res.json(product);
});
app.get('/api/tenants', (_,res)=>res.json(tenants));

app.post('/api/auth/:mode', (req,res)=>{
  const {name,email} = req.body || {};
  if(!email) return res.status(400).json({message:'Email wajib diisi'});
  const user = {id:crypto.randomUUID(), name:name || email.split('@')[0], email};
  res.json({ok:true,user,token:'demo-'+Buffer.from(email).toString('base64url')});
});

app.post('/api/orders', (req,res)=>{
  const {items,total,customer,fulfillment} = req.body || {};
  if(!Array.isArray(items) || !items.length) return res.status(400).json({message:'Keranjang kosong'});
  const order = {
    id:'PKW-'+Date.now().toString().slice(-8),
    createdAt:new Date().toISOString(),
    status:'Menunggu pembayaran',
    total:Number(total||0),
    customer:customer||{},
    fulfillment:fulfillment||'Pickup',
    items
  };
  res.json(order);
});

app.get('/api/payment-qr/:orderId', async (req,res)=>{
  const amount = Number(req.query.amount||0);
  const payload = `PAKUWON-SURPLUS-DEMO|ORDER=${req.params.orderId}|AMOUNT=${amount}|NOT-A-REAL-PAYMENT`;
  try{
    const dataUrl = await QRCode.toDataURL(payload,{width:360,margin:2,errorCorrectionLevel:'M'});
    res.json({dataUrl,payload,demo:true});
  }catch(err){
    res.status(500).json({message:'Gagal membuat QR'});
  }
});

app.post('/api/orders/:orderId/pay', (req,res)=>{
  res.json({ok:true,orderId:req.params.orderId,status:'Pembayaran demo berhasil'});
});

app.get('*', (_,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(PORT, ()=> console.log(`Pakuwon Surplus running on http://localhost:${PORT}`));
