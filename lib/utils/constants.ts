import {
  AssistanceType,
  DonationType,
  ServedPopulation,
  CostType,
  DayOfWeek,
  CouncilDonationType,
} from '@/types/database';

export const ASSISTANCE_TYPE_LABELS: Record<AssistanceType, string> = {
  collection: 'Food Collection Site',
  hot_meals_pickup: 'Hot Meals (Pickup)',
  hot_meals_delivery: 'Hot Meals (Delivery)',
  staffed_pantry: 'Staffed Food Pantry',
  self_serve_pantry: 'Self-Serve Pantry',
};

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  non_perishables: 'Non-Perishables',
  frozen_meals_or_meats: 'Frozen Meals/Meats',
  fresh_produce: 'Fresh Produce',
  prepared_meals: 'Prepared Meals',
  hygiene_or_housecleaning: 'Hygiene/Housecleaning',
  kitchen_household_items: 'Kitchen/Household Items',
  clothing_or_shoes: 'Clothing/Shoes',
};

export const SERVED_POPULATION_LABELS: Record<ServedPopulation, string> = {
  children: 'Children',
  older_adults: 'Older Adults',
  all: 'All Ages',
};

export const COST_LABELS: Record<CostType, string> = {
  free: 'Free',
  sliding_scale: 'Sliding Scale',
  other: 'Other',
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const COUNCIL_DONATION_TYPE_LABELS: Record<CouncilDonationType, string> = {
  money: 'Monetary',
  food: 'Food',
  supplies: 'Supplies',
  other: 'Other',
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const ASSISTANCE_TYPES: AssistanceType[] = [
  'collection',
  'hot_meals_pickup',
  'hot_meals_delivery',
  'staffed_pantry',
  'self_serve_pantry',
];

export const DONATION_TYPES: DonationType[] = [
  'non_perishables',
  'frozen_meals_or_meats',
  'fresh_produce',
  'prepared_meals',
  'hygiene_or_housecleaning',
  'kitchen_household_items',
  'clothing_or_shoes',
];

export const SERVED_POPULATIONS: ServedPopulation[] = ['children', 'older_adults', 'all'];

export const CARTERET_COUNTY_TOWNS = [
  'Atlantic',
  'Atlantic Beach',
  'Beaufort',
  'Bettie',
  'Cedar Island',
  'Davis',
  'Emerald Isle',
  'Gloucester',
  'Harkers Island',
  'Havelock',
  'Indian Beach',
  'Marshallberg',
  'Morehead City',
  'Newport',
  'Ocean',
  'Otway',
  'Peletier',
  'Pine Knoll Shores',
  'Salter Path',
  'Sea Level',
  'Smyrna',
  'Stacy',
  'Stella',
  'Straits',
  'Swansboro',
  'Williston',
];

export const NC_ZIP_CODE_PATTERN = /^28[0-9]{3}$/;

export const PHONE_FORMAT_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;
