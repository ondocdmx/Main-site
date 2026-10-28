/**
 * ONDO · Hoja "Pedidos" (Apps Script). Recibe los pedidos del webhook de Stripe (api/stripe-webhook.ts).
 *
 * Instalación (una vez), ver docs/checkout.md §4:
 * 1. En la hoja de Google donde quieres los pedidos: Extensiones → Apps Script, pega este archivo.
 * 2. Configuración del proyecto → Propiedades del script → añade TOKEN con una clave larga al azar
 *    (la misma va en Vercel como ORDERS_WEBHOOK_TOKEN).
 * 3. Implementar → Nueva implementación → Aplicación web: ejecutar como "Yo", acceso "Cualquier persona".
 *    Copia la URL y ponla en Vercel como ORDERS_WEBHOOK_URL.
 *
 * Una fila por pedido (session_id de Stripe). Si el mismo pedido llega otra vez (reintento de Stripe
 * o cambio de estado de OXXO), se actualiza su fila: nunca se duplica. El correo de revisión se
 * manda una sola vez por pedido.
 */

var SHEET_NAME = 'Pedidos';
var HEADERS = [
  'session_id', 'Estado', 'Pago', 'Actualizado', 'Fecha de entrega', 'Franja', 'Nombre', 'Correo', 'Teléfono',
  'Dirección', 'CP Stripe', 'CP carrito', 'Sopas', 'Subtotal', 'Descuento', 'Tipo de descuento', 'Envío', 'Total',
  'Revisar', 'Correo de revisión enviado',
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // dos avisos del mismo pedido a la vez no crean dos filas
  try {
    var data = JSON.parse(e.postData.contents);
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!token || data.token !== token) return json({ ok: false, error: 'token' });

    var o = data.order;
    var sheet = getSheet();
    var row = findRow(sheet, o.session_id);
    var alreadyEmailed = row > 0 && sheet.getRange(row, HEADERS.length).getValue() !== '';

    var reasons = (o.review_reasons || []).join(' · ');
    var values = [
      o.session_id, o.status, o.payment_method, o.updated_at, o.delivery_date, o.delivery_slot, o.name, o.email,
      o.phone, o.address, o.stripe_postal, o.cart_postal, o.items, o.subtotal, o.discount, o.discount_type,
      o.shipping, o.total, reasons, alreadyEmailed ? sheet.getRange(row, HEADERS.length).getValue() : '',
    ];

    if (reasons && !alreadyEmailed && data.reviewEmail) {
      MailApp.sendEmail(data.reviewEmail, 'Revisar pedido Ondo: ' + (o.name || o.email),
        'Este pedido necesita revisión antes de entregarlo:\n\n' + reasons +
        '\n\nCliente: ' + o.name + ' · ' + o.email + ' · ' + o.phone +
        '\nDirección (Stripe): ' + o.address + ' · CP ' + o.stripe_postal +
        '\nCP del carrito: ' + o.cart_postal +
        '\nEntrega: ' + o.delivery_date + ' · ' + o.delivery_slot +
        '\nSopas: ' + o.items + '\nTotal: $' + o.total +
        '\n\nPedido en Stripe: ' + o.session_id);
      values[HEADERS.length - 1] = new Date().toISOString();
    }

    if (row > 0) sheet.getRange(row, 1, 1, values.length).setValues([values]);
    else sheet.appendRow(values);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function findRow(sheet, sessionId) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === sessionId) return i + 2;
  return -1;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
