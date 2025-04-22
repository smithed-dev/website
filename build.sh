#!/usr/bin/env bash

echo "=== Compiling less"
lessc ./src/styles/_fonts.less > ./www/static/styles.css
lessc ./src/styles/_styles.less >> ./www/static/styles.css
python -m csscompressor -o www/static/styles.min.css www/static/styles.css

checksum=$(md5sum ./www/static/styles.min.css | cut -d ' ' -f1)

echo "=== Building templates"
mkdir -p ./www/htmx/

function build {
    base=$(basename $1)
    mend --input "{\"filename\":\"$base\",\"checksum\":\"$checksum\"}" $1 > $2$base && echo "--- Built $2$base"
}

for file in ./src/pages/*.html; do
    if [[ -f $file ]]; then
        build $file ./www/ &
    fi
done

for file in ./src/pages/htmx/*.html; do
    if [[ -f $file ]]; then
        build $file ./www/htmx/ &
    fi
done

wait
echo "=== Finished building"
