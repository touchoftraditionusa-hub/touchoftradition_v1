/* Touch of Tradition: product form + catalogue backend (Google Apps Script).
   Setup steps are in SETUP.md. Change PASSCODE, then run setup() once. */
const PASSCODE = 'change-me-please';
const SHEET = 'Products';
const FOLDER = 'Touch of Tradition Products';
const COLLECTIONS = ['Silk Sarees','Designer Sarees','Kurta / Ethnic Suits','Coord Sets','Jewellery','Bridal Edit'];
const SIZE_COLLECTIONS = ['Kurta / Ethnic Suits','Coord Sets'];
const SIZES = ['S','M','L','XL','XXL'];
const STATUSES = ['In stock','Sold out','Hidden'];
const HEADERS = ['id','created','name','collection','price_usd','sizes','colour','description','image','featured','status','stock'];

function setup(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  else { const h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; if (h.indexOf('stock') < 0) sh.getRange(1,h.length+1).setValue('stock'); }
  if (!DriveApp.getFoldersByName(FOLDER).hasNext()) DriveApp.createFolder(FOLDER);
}
function doGet(e){
  if (e && e.parameter && e.parameter.action === 'catalog')
    return ContentService.createTextOutput(JSON.stringify(catalog_())).setMimeType(ContentService.MimeType.JSON);
  return HtmlService.createHtmlOutputFromFile('Form').setTitle('Touch of Tradition: Products')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function check_(p){ if (p !== PASSCODE) throw new Error('Wrong passcode.'); }
function sheet_(){ return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET); }
function rows_(){
  const v = sheet_().getDataRange().getValues(), h = v.shift().map(String);
  return v.map((r,i) => { const o = {_row:i+2}; h.forEach((k,j) => o[k] = r[j]); return o; }).filter(o => o.id);
}
function parseStock_(s){
  s = String(s == null ? '' : s).trim(); if (!s) return null;
  if (s.indexOf(':') < 0) { const n = parseInt(s,10); return isNaN(n) ? null : {qty: Math.max(0,n)}; }
  const m = {};
  s.split(',').forEach(p => { const kv = p.split(':'), k = kv[0].trim().toUpperCase(), n = parseInt(kv[1],10); if (SIZES.indexOf(k) >= 0 && !isNaN(n)) m[k] = Math.max(0,n); });
  return {sizes: m};
}
/* Public catalogue for the website. Contains availability flags only, never quantities. */
function catalog_(){
  return rows_().filter(r => r.status !== 'Hidden').map(r => {
    const st = parseStock_(r.stock); let sizes = [], out = [], sold = false;
    if (st && st.sizes) { sizes = SIZES.filter(k => k in st.sizes); out = sizes.filter(k => st.sizes[k] <= 0); sold = sizes.length > 0 && out.length === sizes.length; }
    else if (st && st.qty !== undefined) sold = st.qty <= 0;
    else sizes = String(r.sizes||'').split(',').map(x => x.trim().toUpperCase()).filter(x => SIZES.indexOf(x) >= 0);
    if (r.status === 'Sold out') sold = true;
    return {id:String(r.id), name:r.name, collection:r.collection, price:Number(r.price_usd), colour:r.colour||'', description:r.description||'', image:r.image||'', featured:String(r.featured).toLowerCase()==='yes', sizes:sizes, out:out, soldOut:sold};
  });
}
function stockString_(collection, d){
  if (SIZE_COLLECTIONS.indexOf(collection) >= 0) {
    const parts = [];
    SIZES.forEach(k => { const v = d.stock && d.stock[k]; if (v !== '' && v != null) { const n = parseInt(v,10); if (isNaN(n) || n < 0) throw new Error('Quantity for ' + k + ' must be 0 or more.'); parts.push(k + ':' + n); } });
    if (!parts.length) throw new Error('Enter a quantity for at least one size.');
    return parts.join(',');
  }
  const n = parseInt(d.qty,10);
  if (isNaN(n) || n < 0) throw new Error('Enter the quantity available (0 or more).');
  return String(n);
}
function addProduct(d){
  check_(d.passcode);
  const name = String(d.name||'').trim(), price = Number(d.price);
  if (!name) throw new Error('Product name is required.');
  if (COLLECTIONS.indexOf(d.collection) < 0) throw new Error('Choose a collection.');
  if (!(price > 0)) throw new Error('Enter a price in USD greater than 0.');
  if (!d.image) throw new Error('Please add a photo.');
  const stock = stockString_(d.collection, d);
  const sizes = SIZE_COLLECTIONS.indexOf(d.collection) >= 0 ? stock.split(',').map(x => x.split(':')[0]).join(',') : '';
  const it = DriveApp.getFoldersByName(FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.image), 'image/jpeg', name + '.jpg'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w900';
  const rec = {id:Utilities.getUuid().slice(0,8), created:new Date(), name:name, collection:d.collection, price_usd:price, sizes:sizes, colour:String(d.colour||'').trim(), description:String(d.description||'').trim(), image:url, featured:d.featured?'yes':'no', status:'In stock', stock:stock};
  const h = sheet_().getRange(1,1,1,sheet_().getLastColumn()).getValues()[0];
  sheet_().appendRow(h.map(k => rec[k] === undefined ? '' : rec[k]));
  return 'Added "' + name + '". It appears on the website right away.';
}
function listProducts(pass){
  check_(pass);
  return rows_().map(r => {
    const sized = SIZE_COLLECTIONS.indexOf(r.collection) >= 0, st = parseStock_(r.stock);
    return {id:String(r.id), name:r.name, collection:r.collection, price:r.price_usd, status:r.status, sized:sized, sizes:(st&&st.sizes)||{}, qty:(st&&st.qty!==undefined)?st.qty:''};
  }).reverse();
}
/* Save status and quantities for one product (use this to restock or to record a sale). */
function updateProduct(pass, id, status, d){
  check_(pass);
  if (STATUSES.indexOf(status) < 0) throw new Error('Bad status.');
  const r = rows_().filter(x => String(x.id) === String(id))[0];
  if (!r) throw new Error('Product not found.');
  const sh = sheet_(), h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  sh.getRange(r._row, h.indexOf('status')+1).setValue(status);
  sh.getRange(r._row, h.indexOf('stock')+1).setValue(stockString_(r.collection, d));
  return 'Saved.';
}
