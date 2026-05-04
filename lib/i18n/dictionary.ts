/**
 * Public-site i18n dictionary. English + Spanish.
 *
 * Translates UI chrome only. Data from the database — organization
 * names, addresses, phone numbers, hours notes, comments — is shown
 * as the admin entered it. We DO NOT auto-translate user-submitted
 * content.
 *
 * Keys are stable identifiers; values are the display strings. Add
 * a new key here whenever copy is added to the public surface.
 */

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export type MessageKey =
  // Nav / sign-in
  | 'nav.signIn'
  | 'nav.signInStaffPartners'
  | 'nav.signInOrg'
  | 'nav.signInOrgHint'
  | 'nav.signInAdmin'
  | 'nav.signInAdminHint'
  | 'nav.openMenu'
  | 'nav.closeMenu'
  // Hero
  | 'hero.locationBadge'
  | 'hero.headline'
  | 'hero.subtitle'
  | 'hero.stat.locations'
  | 'hero.stat.towns'
  | 'hero.stat.freeServices'
  // Directory controls
  | 'dir.search.placeholder'
  | 'dir.view.card'
  | 'dir.view.list'
  | 'dir.filter.label'
  | 'dir.filter.all'
  | 'dir.filter.town'
  | 'dir.filter.assistance'
  | 'dir.filter.day'
  | 'dir.filter.donation'
  | 'dir.filter.clear'
  | 'dir.empty.title'
  | 'dir.empty.body'
  | 'dir.resultsSuffix'
  // Org cards + detail
  | 'org.details'
  | 'org.directions'
  | 'org.openNow'
  | 'org.closedNow'
  | 'org.closedToday'
  | 'org.spanishSpoken'
  | 'org.hours'
  | 'org.contact'
  | 'org.services'
  | 'org.donationsAccepted'
  | 'org.whoServed'
  | 'org.storage'
  | 'org.additionalNotes'
  | 'org.emergencyBack'
  | 'org.website'
  | 'org.facebook'
  | 'org.getDirections'
  | 'org.dayClosed'
  // Volunteers page
  | 'vol.headline'
  | 'vol.subtitle'
  | 'vol.empty.title'
  | 'vol.empty.body'
  | 'vol.contact'
  | 'vol.viewOrg'
  | 'vol.requirementsLabel'
  | 'vol.dateNeeded'
  | 'vol.timeCommitment'
  // Footer
  | 'footer.quickLinks'
  | 'footer.contact'
  | 'footer.findFood'
  | 'footer.volunteer'
  | 'footer.orgSignIn'
  | 'footer.adminSignIn'
  // Misc
  | 'common.closed'
  | 'common.open'
  | 'common.loading'
  | 'common.returnHome'
  | 'day.monday'
  | 'day.tuesday'
  | 'day.wednesday'
  | 'day.thursday'
  | 'day.friday'
  | 'day.saturday'
  | 'day.sunday'
  // Assistance type labels (user-facing)
  | 'assistance.collection'
  | 'assistance.hot_meals_eat_in'
  | 'assistance.hot_meals_pickup'
  | 'assistance.hot_meals_delivery'
  | 'assistance.staffed_pantry'
  | 'assistance.self_serve_pantry'
  // Donation type labels
  | 'donation.non_perishables'
  | 'donation.frozen_meals_or_meats'
  | 'donation.fresh_produce'
  | 'donation.prepared_meals'
  | 'donation.hygiene_or_housecleaning'
  | 'donation.kitchen_household_items'
  | 'donation.clothing_or_shoes';

export type MessageCatalog = Record<MessageKey, string>;

export const dictionary: Record<Locale, MessageCatalog> = {
  en: {
    'nav.signIn': 'Sign In',
    'nav.signInStaffPartners': 'Staff & Partners',
    'nav.signInOrg': 'Organization Portal',
    'nav.signInOrgHint': 'Manage your listing',
    'nav.signInAdmin': 'Administrator',
    'nav.signInAdminHint': 'Council staff only',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',

    'hero.locationBadge': 'Carteret County, NC',
    'hero.headline': 'Find Food Assistance Near You',
    'hero.subtitle':
      'Connect with local food pantries, hot meals, and community programs in your area.',
    'hero.stat.locations': 'locations',
    'hero.stat.towns': 'towns',
    'hero.stat.freeServices': 'Free services',

    'dir.search.placeholder': 'Search by name, town, or service…',
    'dir.view.card': 'Card',
    'dir.view.list': 'List',
    'dir.filter.label': 'Filter',
    'dir.filter.all': 'All',
    'dir.filter.town': 'Town',
    'dir.filter.assistance': 'Assistance type',
    'dir.filter.day': 'Day open',
    'dir.filter.donation': 'Accepts donations',
    'dir.filter.clear': 'Clear filters',
    'dir.empty.title': 'No organizations match those filters',
    'dir.empty.body': 'Try clearing a filter or searching for a different town or service.',
    'dir.resultsSuffix': 'results',

    'org.details': 'Details',
    'org.directions': 'Directions',
    'org.openNow': 'Open now',
    'org.closedNow': 'Closed now',
    'org.closedToday': 'Closed today',
    'org.spanishSpoken': 'Spanish spoken',
    'org.hours': 'Hours',
    'org.contact': 'Contact',
    'org.services': 'Services',
    'org.donationsAccepted': 'Donations accepted',
    'org.whoServed': 'Who is served',
    'org.storage': 'Storage',
    'org.additionalNotes': 'Additional notes',
    'org.emergencyBack': 'Back to directory',
    'org.website': 'Website',
    'org.facebook': 'Facebook',
    'org.getDirections': 'Get directions',
    'org.dayClosed': 'Closed',

    'vol.headline': 'Volunteer Opportunities',
    'vol.subtitle':
      'Help your neighbors by giving time to a local food assistance partner.',
    'vol.empty.title': 'No volunteer opportunities right now',
    'vol.empty.body': 'Check back soon — partner organizations post new opportunities regularly.',
    'vol.contact': 'Contact',
    'vol.viewOrg': 'View organization',
    'vol.requirementsLabel': 'Requirements',
    'vol.dateNeeded': 'Date needed',
    'vol.timeCommitment': 'Time commitment',

    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.findFood': 'Find Food Assistance',
    'footer.volunteer': 'Volunteer Opportunities',
    'footer.orgSignIn': 'Organization Sign-In',
    'footer.adminSignIn': 'Administrator Sign-In',

    'common.closed': 'Closed',
    'common.open': 'Open',
    'common.loading': 'Loading…',
    'common.returnHome': 'Return to directory',

    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',

    'assistance.collection': 'Food collection site',
    'assistance.hot_meals_eat_in': 'Hot meals (eat in)',
    'assistance.hot_meals_pickup': 'Hot meals (pickup)',
    'assistance.hot_meals_delivery': 'Hot meals (delivery)',
    'assistance.staffed_pantry': 'Staffed food pantry',
    'assistance.self_serve_pantry': 'Self-serve pantry',

    'donation.non_perishables': 'Non-perishables',
    'donation.frozen_meals_or_meats': 'Frozen meals / meats',
    'donation.fresh_produce': 'Fresh produce',
    'donation.prepared_meals': 'Prepared meals',
    'donation.hygiene_or_housecleaning': 'Hygiene / housecleaning',
    'donation.kitchen_household_items': 'Kitchen / household items',
    'donation.clothing_or_shoes': 'Clothing / shoes',
  },

  es: {
    'nav.signIn': 'Iniciar sesión',
    'nav.signInStaffPartners': 'Personal y socios',
    'nav.signInOrg': 'Portal de organización',
    'nav.signInOrgHint': 'Administra tu organización',
    'nav.signInAdmin': 'Administrador',
    'nav.signInAdminHint': 'Solo personal del concilio',
    'nav.openMenu': 'Abrir menú',
    'nav.closeMenu': 'Cerrar menú',

    'hero.locationBadge': 'Condado de Carteret, NC',
    'hero.headline': 'Encuentre asistencia alimentaria cerca de usted',
    'hero.subtitle':
      'Conéctese con despensas locales, comidas calientes y programas comunitarios en su área.',
    'hero.stat.locations': 'ubicaciones',
    'hero.stat.towns': 'pueblos',
    'hero.stat.freeServices': 'Servicios gratuitos',

    'dir.search.placeholder': 'Buscar por nombre, pueblo o servicio…',
    'dir.view.card': 'Tarjeta',
    'dir.view.list': 'Lista',
    'dir.filter.label': 'Filtrar',
    'dir.filter.all': 'Todos',
    'dir.filter.town': 'Pueblo',
    'dir.filter.assistance': 'Tipo de asistencia',
    'dir.filter.day': 'Día abierto',
    'dir.filter.donation': 'Acepta donaciones',
    'dir.filter.clear': 'Borrar filtros',
    'dir.empty.title': 'Ninguna organización coincide con estos filtros',
    'dir.empty.body':
      'Intente borrar un filtro o buscar otro pueblo o servicio.',
    'dir.resultsSuffix': 'resultados',

    'org.details': 'Detalles',
    'org.directions': 'Direcciones',
    'org.openNow': 'Abierto ahora',
    'org.closedNow': 'Cerrado ahora',
    'org.closedToday': 'Cerrado hoy',
    'org.spanishSpoken': 'Se habla español',
    'org.hours': 'Horario',
    'org.contact': 'Contacto',
    'org.services': 'Servicios',
    'org.donationsAccepted': 'Donaciones aceptadas',
    'org.whoServed': 'A quién se sirve',
    'org.storage': 'Almacenamiento',
    'org.additionalNotes': 'Notas adicionales',
    'org.emergencyBack': 'Volver al directorio',
    'org.website': 'Sitio web',
    'org.facebook': 'Facebook',
    'org.getDirections': 'Cómo llegar',
    'org.dayClosed': 'Cerrado',

    'vol.headline': 'Oportunidades de voluntariado',
    'vol.subtitle':
      'Ayude a sus vecinos dedicando tiempo a un socio local de asistencia alimentaria.',
    'vol.empty.title': 'No hay oportunidades de voluntariado en este momento',
    'vol.empty.body':
      'Vuelva pronto — las organizaciones asociadas publican nuevas oportunidades con regularidad.',
    'vol.contact': 'Contacto',
    'vol.viewOrg': 'Ver organización',
    'vol.requirementsLabel': 'Requisitos',
    'vol.dateNeeded': 'Fecha requerida',
    'vol.timeCommitment': 'Tiempo requerido',

    'footer.quickLinks': 'Enlaces rápidos',
    'footer.contact': 'Contacto',
    'footer.findFood': 'Encontrar asistencia alimentaria',
    'footer.volunteer': 'Oportunidades de voluntariado',
    'footer.orgSignIn': 'Inicio de sesión para organizaciones',
    'footer.adminSignIn': 'Inicio de sesión del administrador',

    'common.closed': 'Cerrado',
    'common.open': 'Abierto',
    'common.loading': 'Cargando…',
    'common.returnHome': 'Volver al directorio',

    'day.monday': 'Lunes',
    'day.tuesday': 'Martes',
    'day.wednesday': 'Miércoles',
    'day.thursday': 'Jueves',
    'day.friday': 'Viernes',
    'day.saturday': 'Sábado',
    'day.sunday': 'Domingo',

    'assistance.collection': 'Sitio de recolección de alimentos',
    'assistance.hot_meals_eat_in': 'Comidas calientes (comer aquí)',
    'assistance.hot_meals_pickup': 'Comidas calientes (recoger)',
    'assistance.hot_meals_delivery': 'Comidas calientes (entrega)',
    'assistance.staffed_pantry': 'Despensa de alimentos con personal',
    'assistance.self_serve_pantry': 'Despensa de autoservicio',

    'donation.non_perishables': 'No perecederos',
    'donation.frozen_meals_or_meats': 'Comidas / carnes congeladas',
    'donation.fresh_produce': 'Productos frescos',
    'donation.prepared_meals': 'Comidas preparadas',
    'donation.hygiene_or_housecleaning': 'Higiene / limpieza',
    'donation.kitchen_household_items': 'Artículos de cocina / hogar',
    'donation.clothing_or_shoes': 'Ropa / zapatos',
  },
};

/**
 * Translate a key for an explicit locale. Safe for both server and
 * client code paths. Falls back to English, then to the key itself
 * so a missing translation never crashes the page.
 */
export function translate(key: MessageKey, locale: Locale = 'en'): string {
  return (
    dictionary[locale]?.[key] ??
    dictionary.en[key] ??
    (key as string)
  );
}
