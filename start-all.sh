#!/bin/bash

echo "start server"
npm run start-server &
sleep 1
echo 'start client'
PORT=8000 npm run start-client &
wait