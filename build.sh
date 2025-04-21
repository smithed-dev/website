#!/usr/bin/env bash

echo "=== Compiling less"
lessc ./src/styles/_styles.less > ./www/static/styles.css
lessc ./src/styles/_fonts.less > ./www/static/fonts.css

echo "=== Building templates"
mkdir -p ./www/htmx/

function build {
    base=$(basename $1)
    mend --input "{\"filename\":\"$base\"}" $1 > $2$base && echo "--- Built $2$base"
}

for file in ./src/pages/*.html; do
    build $file ./www/ &
done

for file in ./src/pages/htmx/*.html; do
    build $file ./www/htmx/ &
done

wait
echo "=== Finished building"
