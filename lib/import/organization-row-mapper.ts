/**
 * Maps a raw spreadsheet row (keyed by its raw header) to
 * OrganizationFormValues. Tolerant to the Carteret County Master
 * Database Google Form export: column headers are matched via an alias
 * table, values are coerced through lowercase synonym maps, and
 * malformed optional values are dropped instead of rejecting the row.
 *
 * Only two hard rejections: missing organization name and no
 * recognizable assistance type. Everything else — address, phone,
 * zip, email, URLs, days, times — is best-effort.
 */

import type { OrganizationFormValues } from '@/lib/validations/schemas';
import {
  ASSISTANCE_TYPES,
  DONATION_TYPES,
  SERVED_POPULATIONS,
} from '@/lib/utils/constants';
import type { AssistanceType, DonationType, DayOfWeek } from '@/types/database';

export type MapperResult = OrganizationFormValues | { error: string };

// ---- aliases ----------------------------------------------------------------

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s\-]+/g, '_');
}

// DB-field -> ordered list of sheet headers we accept for it.
// All entries are normalized (lowercase, underscore-joined).
const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['name', 'name_of_organization', 'organization_name', 'organization'],
  address: ['address', 'street_address', 'location', 'street'],
  town: ['town', 'city', 'municipality'],
  zip: ['zip', 'zip_code', 'postal_code', 'zipcode'],
  contact_name: ['contact_name', 'contact', 'point_of_contact', 'poc'],
  phone: ['phone', 'phone_number', 'tel', 'telephone'],
  email: ['email', 'email_address', 'contact_email'],
  website: ['website', 'url', 'site'],
  facebook: ['facebook', 'fb', 'facebook_url', 'facebook_page'],
  assistance_types: ['assistance_types', 'type_of_assistance', 'services', 'service_type'],
  assistance_types_alt: ['type_of_assistance_2', 'additional_assistance'],
  who_served: ['who_served', 'populations_served', 'served'],
  cost: ['cost', 'price', 'fee'],
  num_meals_available: ['num_meals_available', '#_of_meals_available', 'meals_available', 'capacity'],
  operating_days: ['days_open', 'days', 'operating_days'],
  operating_open_time: ['time_open', 'open', 'opening_time', 'start_time'],
  operating_close_time: ['time_closes', 'close', 'closing_time', 'end_time'],
  hours_notes: ['hours_notes', 'notes_about_hours', 'hours_note'],
  donations_accepted: ['donations_accepted', 'types_of_donations_accepted', 'donation_types'],
  storage_capacity: [
    'storage_capacity',
    'please_provide_approximate_available_storage_space_by_type_(approximate_square_footage_is_acceptable.)',
    'storage_space',
    'storage',
  ],
  comments: ['comments', 'notes', 'description', 'additional_info'],
  is_active: ['is_active', 'active', 'enabled'],
  spanish_available: ['spanish_available', 'en_espanol', 'espanol', 'spanish'],
  updated_by: ['updated_by', 'last_update_(date_and_your_name)', 'last_updated_by', 'updater'],
};

const ASSISTANCE_VALUE_ALIASES: Record<string, AssistanceType> = {
  hot_meals_pickup: 'hot_meals_pickup',
  hot_meals_pick_up: 'hot_meals_pickup',
  'hot_meals_(pickup)': 'hot_meals_pickup',
  pickup: 'hot_meals_pickup',
  hot_meals_delivery: 'hot_meals_delivery',
  'hot_meals_(delivery)': 'hot_meals_delivery',
  meal_delivery: 'hot_meals_delivery',
  delivery: 'hot_meals_delivery',
  food_pantry: 'staffed_pantry',
  staffed_pantry: 'staffed_pantry',
  staffed_food_pantry: 'staffed_pantry',
  food_bank: 'staffed_pantry',
  self_serve_pantry: 'self_serve_pantry',
  self_serve: 'self_serve_pantry',
  food_collection: 'collection',
  collection: 'collection',
  food_collection_site: 'collection',
  food_drive: 'collection',
};

const DONATION_VALUE_ALIASES: Record<string, DonationType> = {
  non_perishables: 'non_perishables',
  nonperishables: 'non_perishables',
  canned_goods: 'non_perishables',
  frozen_meals_or_meats: 'frozen_meals_or_meats',
  frozen_meals: 'frozen_meals_or_meats',
  frozen_meats: 'frozen_meals_or_meats',
  frozen: 'frozen_meals_or_meats',
  meat: 'frozen_meals_or_meats',
  fresh_produce: 'fresh_produce',
  produce: 'fresh_produce',
  fruit: 'fresh_produce',
  vegetables: 'fresh_produce',
  prepared_meals: 'prepared_meals',
  hygiene_or_housecleaning: 'hygiene_or_housecleaning',
  hygiene_or_housecleaning_supplies: 'hygiene_or_housecleaning',
  hygiene: 'hygiene_or_housecleaning',
  housecleaning: 'hygiene_or_housecleaning',
  toiletries: 'hygiene_or_housecleaning',
  kitchen_household_items: 'kitchen_household_items',
  kitchen_and_household_items: 'kitchen_household_items',
  kitchen_and_house_hold_items: 'kitchen_household_items',
  kitchen: 'kitchen_household_items',
  household_items: 'kitchen_household_items',
  clothing_or_shoes: 'clothing_or_shoes',
  clothing: 'clothing_or_shoes',
  shoes: 'clothing_or_shoes',
};

const DAY_ALIASES: Record<string, DayOfWeek> = {
  mon: 'monday',
  monday: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  tuesday: 'tuesday',
  wed: 'wednesday',
  weds: 'wednesday',
  wednesday: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thurs: 'thursday',
  thursday: 'thursday',
  fri: 'friday',
  friday: 'friday',
  sat: 'saturday',
  saturday: 'saturday',
  sun: 'sunday',
  sunday: 'sunday',
};

// ---- helpers ----------------------------------------------------------------

/**
 * Build `{ normalizedSheetHeader -> rawHeader }` from the first row of
 * the sheet.
 */
export function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    if (!h) continue;
    map[normalizeKey(h)] = h;
  }
  return map;
}

function coerceString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('result' in o && o.result !== undefined) return coerceString(o.result);
    if ('text' in o && o.text !== undefined) return String(o.text).trim();
    if ('hyperlink' in o && o.hyperlink) return String(o.hyperlink).trim();
    if ('richText' in o && Array.isArray(o.richText)) {
      return (o.richText as { text: string }[]).map((r) => r.text).join('').trim();
    }
    return '';
  }
  return String(v).trim();
}

function readField(
  row: Record<string, unknown>,
  headerMap: Record<string, string>,
  field: string,
): unknown {
  const aliases = COLUMN_ALIASES[field] ?? [field];
  for (const alias of aliases) {
    const raw = headerMap[alias];
    if (raw !== undefined && row[raw] !== undefined && row[raw] !== null) {
      return row[raw];
    }
  }
  return undefined;
}

function readString(
  row: Record<string, unknown>,
  headerMap: Record<string, string>,
  field: string,
): string {
  return coerceString(readField(row, headerMap, field));
}

function parseSynonymList<T extends string>(
  raw: string,
  aliasTable: Record<string, T>,
): T[] {
  if (!raw) return [];
  const out = new Set<T>();
  for (const piece of raw.split(/[;,\/]/)) {
    const key = piece.trim().toLowerCase().replace(/[\s\-]+/g, '_');
    if (aliasTable[key]) out.add(aliasTable[key]);
  }
  return [...out];
}

function parseBoolean(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  const s = coerceString(v).toLowerCase();
  if (['yes', 'true', '1', 'y', 'si'].includes(s)) return true;
  if (['no', 'false', '0', 'n', 'none'].includes(s)) return false;
  // Non-empty free text on an "en espanol" column = implicit yes
  return s.length > 0 ? true : undefined;
}

function parseExcelTime(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  let d: Date | null = null;
  if (v instanceof Date) d = v;
  else {
    const s = coerceString(v);
    if (!s) return undefined;
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) d = parsed;
  }
  if (!d) return undefined;
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function normalizeCost(raw: string): 'free' | 'sliding_scale' | 'other' {
  if (!raw) return 'free';
  const s = raw.toLowerCase();
  if (/free/.test(s) && !/cost/.test(s)) return 'free';
  if (/slid/.test(s) || /donation/.test(s)) return 'sliding_scale';
  return 'other';
}

// ---- main export ------------------------------------------------------------

export function mapSpreadsheetRowToFormValues(
  row: Record<string, unknown>,
  headerMap: Record<string, string>,
): MapperResult {
  const name = readString(row, headerMap, 'name');
  if (!name) return { error: 'name: missing organization name' };

  const assistancePrimary = parseSynonymList(
    readString(row, headerMap, 'assistance_types'),
    ASSISTANCE_VALUE_ALIASES,
  );
  const assistanceSecondary = parseSynonymList(
    readString(row, headerMap, 'assistance_types_alt'),
    ASSISTANCE_VALUE_ALIASES,
  );
  const assistance_types = [...new Set([...assistancePrimary, ...assistanceSecondary])].filter(
    (v) => (ASSISTANCE_TYPES as readonly string[]).includes(v),
  ) as AssistanceType[];

  if (assistance_types.length === 0) {
    return { error: 'assistance_types: no recognized assistance type in this row' };
  }

  const donations_accepted = parseSynonymList(
    readString(row, headerMap, 'donations_accepted'),
    DONATION_VALUE_ALIASES,
  ).filter((v) => (DONATION_TYPES as readonly string[]).includes(v)) as DonationType[];

  const who_served = parseSynonymList(
    readString(row, headerMap, 'who_served'),
    Object.fromEntries(SERVED_POPULATIONS.map((v) => [v, v])),
  );

  // Operating hours — best-effort construction from Days/Open/Close triple
  const daysRaw = readString(row, headerMap, 'operating_days');
  const openTime = parseExcelTime(readField(row, headerMap, 'operating_open_time'));
  const closeTime = parseExcelTime(readField(row, headerMap, 'operating_close_time'));
  const days = daysRaw
    .split(/[,;]/)
    .map((d) => DAY_ALIASES[d.trim().toLowerCase()])
    .filter((d): d is DayOfWeek => Boolean(d));
  const operating_hours = days.map((day) => ({
    day,
    open_time: openTime,
    close_time: closeTime,
    is_closed: !openTime && !closeTime,
  }));

  // num_meals_available — keep strictly positive integers, drop otherwise
  const rawMeals = readField(row, headerMap, 'num_meals_available');
  let num_meals_available: number | undefined;
  if (typeof rawMeals === 'number' && rawMeals > 0 && Number.isInteger(rawMeals)) {
    num_meals_available = rawMeals;
  } else if (typeof rawMeals === 'string') {
    const n = parseInt(rawMeals, 10);
    if (Number.isInteger(n) && n > 0) num_meals_available = n;
  }

  // Cost — move any free-form text (e.g. "$4.85", "donation") into comments.
  const costRaw = readString(row, headerMap, 'cost');
  const cost = normalizeCost(costRaw);
  const costNote =
    cost !== 'free' && costRaw && !/^(free|other|sliding[_ ]scale|donation)$/i.test(costRaw)
      ? `Cost: ${costRaw}`
      : null;

  // Storage capacity — freeform text drop-in
  const storageRaw = readString(row, headerMap, 'storage_capacity');
  const storage_capacity =
    storageRaw && storageRaw.toLowerCase() !== 'none'
      ? {
          refrigerator: false,
          freezer: false,
          dry_storage: false,
          notes: storageRaw,
        }
      : undefined;

  const commentsBase = readString(row, headerMap, 'comments');
  const comments = costNote
    ? commentsBase
      ? `${commentsBase} | ${costNote}`
      : costNote
    : commentsBase || undefined;

  // Booleans with sensible defaults on missing data
  const activeParsed = parseBoolean(readField(row, headerMap, 'is_active'));
  const is_active = activeParsed === undefined ? true : activeParsed;

  const spanishParsed = parseBoolean(readField(row, headerMap, 'spanish_available'));
  const spanish_available = spanishParsed === undefined ? false : spanishParsed;

  // URL / email get run through the zod transformers on validation;
  // here we just pass the raw string through.
  const emailRaw = readString(row, headerMap, 'email');
  const websiteRaw = readString(row, headerMap, 'website');
  const facebookRaw = readString(row, headerMap, 'facebook');

  // ZIP — coerce numeric 28511 -> "28511"
  const zipField = readField(row, headerMap, 'zip');
  let zip = '';
  if (typeof zipField === 'number') zip = String(zipField).padStart(5, '0');
  else zip = coerceString(zipField);

  return {
    name,
    address: readString(row, headerMap, 'address'),
    town: readString(row, headerMap, 'town') || 'Carteret County',
    zip,
    contact_name: readString(row, headerMap, 'contact_name') || undefined,
    phone: readString(row, headerMap, 'phone'),
    email: emailRaw || '',
    website: websiteRaw || '',
    facebook: facebookRaw || '',
    assistance_types,
    who_served,
    cost,
    num_meals_available,
    operating_hours,
    hours_notes: readString(row, headerMap, 'hours_notes') || undefined,
    donations_accepted,
    storage_capacity,
    comments,
    is_active,
    spanish_available,
  } as OrganizationFormValues;
}
