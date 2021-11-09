#!/usr/bin/env bash

ttab -t 'ecom-user' yarn run be-user:dev

ttab -t 'ecom-catelog' yarn run be-catelog:dev

ttab -t 'ecom-core' yarn run be-core:dev

ttab -t 'ecom-image' yarn run be-image:dev

ttab -t 'ecom-payment' yarn run be-payment:dev

ttab -t 'ecom-search' yarn run be-search:dev

ttab -t 'ecom-order' yarn run be-order:dev

ttab -t 'ecom-notification' yarn run be-notification:dev

ttab -t 'ecom-cron-job' yarn run be-cron-job:dev

ttab -t 'ecom-solr' exec yarn run be-solr:start

echo "Server started in development mode!!"
