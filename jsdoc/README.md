Using jsdoc3 to generate javascript documentation with jaguarjs template

Installation
    npm install jsdoc@"<=3.3.0" -g

documentation :
    http://usejsdoc.org/

Generate the doc :

sudo rm -rf ../docs/*;sudo jsdoc -p -t ./conf.json -d ../docs --verbose;