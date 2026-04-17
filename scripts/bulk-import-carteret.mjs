import ExcelJS from 'exceljs';
import fs from 'node:fs';

const FILE = '/Users/tanayvinaykya/Downloads/Food Help in Carteret County Master Database.xlsx';

const ASSIST_ALIASES = {
  'hot meals pickup': 'hot_meals_pickup',
  'hot meals pick up': 'hot_meals_pickup',
  'hot meals (pickup)': 'hot_meals_pickup',
  'hot meal pickup': 'hot_meals_pickup',
  'pickup': 'hot_meals_pickup',
  'hot meals delivery': 'hot_meals_delivery',
  'hot meals (delivery)': 'hot_meals_delivery',
  'meal delivery': 'hot_meals_delivery',
  'delivery': 'hot_meals_delivery',
  'food pantry': 'staffed_pantry',
  'staffed pantry': 'staffed_pantry',
  'staffed food pantry': 'staffed_pantry',
  'food bank': 'staffed_pantry',
  'self-serve pantry': 'self_serve_pantry',
  'self serve pantry': 'self_serve_pantry',
  'self-serve food pantry': 'self_serve_pantry',
  'self serve': 'self_serve_pantry',
  'food collection': 'collection',
  'collection': 'collection',
  'food collection site': 'collection',
  'food drive': 'collection',
};

const DONATION_ALIASES = {
  'non-perishables': 'non_perishables',
  'non perishables': 'non_perishables',
  'nonperishables': 'non_perishables',
  'canned goods': 'non_perishables',
  'frozen meals or meats': 'frozen_meals_or_meats',
  'frozen meals/meats': 'frozen_meals_or_meats',
  'frozen meats': 'frozen_meals_or_meats',
  'frozen meals': 'frozen_meals_or_meats',
  'frozen': 'frozen_meals_or_meats',
  'meat': 'frozen_meals_or_meats',
  'fresh produce': 'fresh_produce',
  'produce': 'fresh_produce',
  'fruit': 'fresh_produce',
  'vegetables': 'fresh_produce',
  'prepared meals': 'prepared_meals',
  'hygiene or housecleaning supplies': 'hygiene_or_housecleaning',
  'hygiene or housecleaning': 'hygiene_or_housecleaning',
  'hygiene/housecleaning': 'hygiene_or_housecleaning',
  'hygiene': 'hygiene_or_housecleaning',
  'housecleaning': 'hygiene_or_housecleaning',
  'toiletries': 'hygiene_or_housecleaning',
  'kitchen and house hold items': 'kitchen_household_items',
  'kitchen and household items': 'kitchen_household_items',
  'kitchen/household items': 'kitchen_household_items',
  'kitchen': 'kitchen_household_items',
  'household items': 'kitchen_household_items',
  'clothing, shoes': 'clothing_or_shoes',
  'clothing/shoes': 'clothing_or_shoes',
  'clothing': 'clothing_or_shoes',
  'shoes': 'clothing_or_shoes',
};

const DAY_ALIASES = {
  mon: 'monday', monday: 'monday',
  tue: 'tuesday', tues: 'tuesday', tuesday: 'tuesday',
  wed: 'wednesday', weds: 'wednesday', wednesday: 'wednesday',
  thu: 'thursday', thur: 'thursday', thurs: 'thursday', thursday: 'thursday',
  fri: 'friday', friday: 'friday',
  sat: 'saturday', saturday: 'saturday',
  sun: 'sunday', sunday: 'sunday',
};

function clean(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    if ('result' in v) return clean(v.result);
    if ('text' in v) return String(v.text).trim();
    if (v.hyperlink) return String(v.hyperlink).trim();
    if (v.richText) return v.richText.map(r => r.text).join('').trim();
    return '';
  }
  return String(v).trim();
}

function getRaw(row, colMap, header) {
  const i = colMap[header.toLowerCase()];
  if (i === undefined) return null;
  return row.getCell(i).value;
}
function getStr(row, colMap, header) { return clean(getRaw(row, colMap, header)); }

function parseList(raw, aliases) {
  if (!raw) return [];
  const items = raw.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  const out = new Set();
  for (const item of items) {
    if (aliases[item]) out.add(aliases[item]);
  }
  return [...out];
}

function parseExcelTime(v) {
  if (!v) return null;
  let d = v instanceof Date ? v : null;
  if (!d) {
    const s = clean(v);
    if (!s) return null;
    d = new Date(s);
  }
  if (!d || isNaN(d.getTime())) return null;
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

function parseDays(raw) {
  if (!raw) return [];
  return raw.split(/[,;]/).map(s => DAY_ALIASES[s.trim().toLowerCase()]).filter(Boolean);
}

function sqlEsc(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlEscStr(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlArr(a) {
  if (!a || a.length === 0) return `ARRAY[]::TEXT[]`;
  return `ARRAY[${a.map(x => sqlEscStr(x)).join(',')}]::TEXT[]`;
}
function sqlJsonb(o) {
  if (o === null || o === undefined) return 'NULL';
  return `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(FILE);
const sheet = wb.getWorksheet('Form Responses 1');

const headers = sheet.getRow(1).values.map(clean);
const colMap = {};
headers.forEach((h, i) => { if (h) colMap[h.toLowerCase()] = i; });

const rows = [];
const skipped = [];

for (let r = 2; r <= sheet.rowCount; r++) {
  const row = sheet.getRow(r);
  const name = getStr(row, colMap, 'Name of organization');
  if (!name) continue;

  const assistA = parseList(getStr(row, colMap, 'Type of assistance'), ASSIST_ALIASES);
  const assistB = parseList(getStr(row, colMap, 'Type of assistance 2'), ASSIST_ALIASES);
  const assistance_types = [...new Set([...assistA, ...assistB])];
  if (assistance_types.length === 0) {
    skipped.push({ row: r, name, reason: 'no recognized assistance type' });
    continue;
  }

  const address = getStr(row, colMap, 'street address');
  const town = getStr(row, colMap, 'town') || 'Carteret County';
  const zipRaw = getRaw(row, colMap, 'zip');
  const zip = zipRaw ? String(zipRaw).padStart(5, '0') : '';
  const phone = getStr(row, colMap, 'phone number');

  const donations = parseList(getStr(row, colMap, 'Types of Donations Accepted'), DONATION_ALIASES);
  const days = parseDays(getStr(row, colMap, 'Days open'));
  const openTime = parseExcelTime(getRaw(row, colMap, 'Time Open'));
  const closeTime = parseExcelTime(getRaw(row, colMap, 'Time Closes'));
  const operating_hours = days.map(day => ({
    day,
    open_time: openTime,
    close_time: closeTime,
    is_closed: !openTime && !closeTime,
  }));

  const spanish = getStr(row, colMap, 'en espanol');
  const mealsRaw = getRaw(row, colMap, '# of meals available');
  const mealsNum = typeof mealsRaw === 'number' && mealsRaw > 0 ? mealsRaw : null;
  const costRaw = getStr(row, colMap, 'Cost').toLowerCase();
  const cost = /free/.test(costRaw) ? 'free' : (costRaw ? 'other' : 'free');
  const costNote = (cost === 'other' && costRaw) ? costRaw : null;

  const emailRaw = getStr(row, colMap, 'email');
  const email = /@/.test(emailRaw) ? emailRaw : null;
  const websiteRaw = getStr(row, colMap, 'website');
  const website = websiteRaw
    ? (websiteRaw.match(/^https?:/i) ? websiteRaw : `https://${websiteRaw.replace(/^www\./i, '')}`)
    : null;
  const fbRaw = getStr(row, colMap, 'Facebook');
  const facebook = fbRaw
    ? (fbRaw.match(/^https?:/i) ? fbRaw : `https://${fbRaw.replace(/^www\./i, '')}`)
    : null;

  const storageRaw = getStr(row, colMap, 'Please Provide Approximate Available Storage Space By Type (Approximate square footage is acceptable.)');
  const storage_capacity = (storageRaw && storageRaw.toLowerCase() !== 'none')
    ? { refrigerator: false, freezer: false, dry_storage: false, notes: storageRaw }
    : null;

  const baseComments = getStr(row, colMap, 'comments');
  const comments = costNote
    ? (baseComments ? `${baseComments} | Cost: ${costNote}` : `Cost: ${costNote}`)
    : (baseComments || null);

  rows.push({
    name,
    address: address || '',
    town,
    zip: zip || '',
    phone: phone || '',
    contact_name: getStr(row, colMap, 'contact name') || null,
    email,
    website,
    facebook,
    assistance_types,
    who_served: [],
    cost,
    num_meals_available: mealsNum,
    operating_hours,
    hours_notes: getStr(row, colMap, 'Notes about hours') || null,
    donations_accepted: donations,
    storage_capacity,
    comments,
    is_active: true,
    spanish_available: !!spanish,
    updated_by: getStr(row, colMap, 'last update (date and your name)') || null,
  });
}

console.log(`Parsed ${rows.length} importable, skipped ${skipped.length}`);

const CHUNK = 100;
const chunks = [];
for (let i = 0; i < rows.length; i += CHUNK) {
  const slice = rows.slice(i, i + CHUNK);
  const values = slice.map(r => `(${[
    sqlEscStr(r.name),
    sqlEscStr(r.address),
    sqlEscStr(r.town),
    sqlEscStr(r.zip),
    sqlEscStr(r.contact_name),
    sqlEscStr(r.phone),
    sqlEscStr(r.email),
    sqlEscStr(r.website),
    sqlEscStr(r.facebook),
    sqlArr(r.assistance_types),
    sqlArr(r.who_served),
    sqlEscStr(r.cost),
    r.num_meals_available === null ? 'NULL' : r.num_meals_available,
    sqlJsonb(r.operating_hours),
    sqlEscStr(r.hours_notes),
    sqlArr(r.donations_accepted),
    sqlJsonb(r.storage_capacity),
    sqlEscStr(r.comments),
    r.is_active ? 'TRUE' : 'FALSE',
    r.spanish_available ? 'TRUE' : 'FALSE',
    sqlEscStr(r.updated_by),
  ].join(',')})`).join(',\n');
  const sql = `INSERT INTO public.organizations (name, address, town, zip, contact_name, phone, email, website, facebook, assistance_types, who_served, cost, num_meals_available, operating_hours, hours_notes, donations_accepted, storage_capacity, comments, is_active, spanish_available, updated_by) VALUES\n${values};`;
  chunks.push(sql);
}

fs.writeFileSync('/tmp/import_chunks.json', JSON.stringify({ count: rows.length, skipped: skipped.length, chunks }));
console.log(`Wrote ${chunks.length} SQL chunks to /tmp/import_chunks.json`);
