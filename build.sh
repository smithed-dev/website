#!/usr/bin/env bash

TMP=./src/styles/__build.less

echo "=== Compiling less"
cat ./src/styles/_fonts.less ./src/styles/_styles.less > $TMP
find ./src/pages -name "*.less" -exec cat {} >> $TMP \;
cat ./src/styles/_adaptive.less >> $TMP
lessc $TMP > ./www/static/styles.css
rm $TMP
python -m csscompressor -o www/static/styles.min.css www/static/styles.css

css_checksum=$(md5sum ./www/static/styles.min.css | cut -d ' ' -f1)

echo "=== Compiling javascript together"
echo "" > ./www/static/main.js
find ./src/pages -name "*.js" -exec cat {} >> ./www/static/main.js \;
cat ./src/main.js >> ./www/static/main.js

js_checksum=$(md5sum ./www/static/main.js | cut -d ' ' -f1)

echo "=== Building templates"
mkdir -p ./www/htmx/

function build {
    base=$(basename $1)
    mend --work-dir ./src/pages/ --input css_checksum=$css_checksum,js_checksum=$js_checksum --output $2/. $1 && echo "--- Built $2/$base"
}

for file in ./src/pages/*.html; do
    if [[ -f $file ]]; then
        build $file ./www &
    fi
done

for file in ./src/pages/htmx/*.html; do
    if [[ -f $file ]]; then
        build $file ./www/htmx &
    fi
done

wait
echo "=== Finished building"
