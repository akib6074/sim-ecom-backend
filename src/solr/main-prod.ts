import { exec } from 'child_process';

exec('node dist/solr/product/main', (error, stdout, stderr) => {
  if (stdout) console.log('Out:Success', stdout);
  if (stderr) console.error('Out:Error', stderr);
  if (error !== null) console.log('Exec Error: ', error);
});

exec('node dist/solr/shop/main', (error, stdout, stderr) => {
  if (stdout) console.log('Out:Success', stdout);
  if (stderr) console.error('Out:Error', stderr);
  if (error !== null) console.log('Exec Error: ', error);
});
