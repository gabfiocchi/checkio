export const environment = {
  production: true,
  apirest: {
    base: 'https://checkio.thinkapp.dev/api',
    configuration: '/items/configuration?single=1&fields=*,background_image.data.*',
    languages: '/items/languages',
    reservation: '/items/reservations?single=1&fields=*.*.*&filter[uuid][eq]=',
  }
};
