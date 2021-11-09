import { exec } from 'child_process';

exec(
  'NODE_ENV=development tsnd --transpile-only src/solr/shop/main.ts',
  (error, stdout, stderr) => {
    if (stdout) console.log('Out:Success', stdout);
    if (stderr) console.error('Out:Error', stderr);
    if (error !== null) console.log('Exec Error: ', error);
  },
);

exec(
  'NODE_ENV=development tsnd --transpile-only src/solr/product/main.ts',
  (error, stdout, stderr) => {
    if (stdout) console.log('Out:Success', stdout);
    if (stderr) console.error('Out:Error', stderr);
    if (error !== null) console.log('Exec Error: ', error);
  },
);
