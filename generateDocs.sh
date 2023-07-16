#!/bin/bash
sudo rm -rf docs
sudo jsdoc -p -r -t jsdoc/bower_components/jaguarjs-jsdoc -c jsdoc/conf.json -d docs