import { initFederation } from '@angular-architects/native-federation';

initFederation('/assets/manifest.json')
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
