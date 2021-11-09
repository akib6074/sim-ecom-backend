import { exec } from 'child_process';

Promise.all([
  exec("pm2 start -f dist/be-user/main.js --name 'ecom-user'"),
  exec("pm2 start -f dist/be-catelog/main.js --name 'ecom-catelog'"),
  exec("pm2 start -f dist/be-core/main.js --name 'ecom-core'"),
  exec("pm2 start -f dist/be-image/main.js --name 'ecom-image'"),
  exec("pm2 start -f dist/be-payment/main.js --name 'ecom-payment'"),
  exec("pm2 start -f dist/be-search/main.js --name 'ecom-search'"),
  exec("pm2 start -f dist/be-order/main.js --name 'ecom-order'"),
  exec("pm2 start -f dist/be-notification/main.js --name 'ecom-notification'"),
  exec("pm2 start -f dist/be-cron-job/main.js --name 'ecom-cron-job'"),
  exec('yarn run be-solr:start'),
]).then(() => {
  console.log('Server is starting. Please wait for pm2 response!');
});
