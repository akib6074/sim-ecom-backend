#!/usr/bin/env bash

kill-port 3102 3103 3104 3105 3106 3107 3108 3109 3110
yarn run be-solr:stop

echo "Development server stopped!!"
