Using jsdoc3 to generate javascript documentation with jaguarjs template

Installation
    npm install jsdoc -g

documentation :
    http://usejsdoc.org/

Generate the doc :

rm -rf ../docs/*;jsdoc -p -t ./bower_components/jaguarjs-jsdoc -c ./conf.json -d ../docs --verbose;