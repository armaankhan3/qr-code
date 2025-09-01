const paths = [
  './src/routes/driverRoutes',
  './src/routes/vehicleRoutes',
  './src/routes/userRoutes',
  './src/controllers/driverController',
  './src/controllers/userController',
  './src/controllers/vehicleController'
];
for (const p of paths) {
  try {
    console.log('Requiring', p);
    const mod = require(p);
    console.log('OK:', p, 'export type', typeof mod);
  } catch (e) {
    console.error('FAIL:', p, e && e.stack ? e.stack : e);
  }
}
console.log('done');
