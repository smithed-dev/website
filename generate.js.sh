#!/usr/bin/bash

TMP=/tmp/smithed-dev/
mkdir -p ./web/public/generated/
mkdir -p ./web/public/generated/page/
mkdir -p $TMP

# Global main files
: > ./web/public/generated/main.js
for file in ./web/main_*.js; do
    echo "// from: $file" >> ./web/public/generated/main.js
    cat $file >> ./web/public/generated/main.js
done

# Widgets
echo "" > $TMP/scripts-order.txt
find ./web/pages/components/ -name "*.js" -exec echo {} >> $TMP/scripts-order.txt \;
while IFS= read -r file; do
    if [[ -f $file ]]; then
        echo "// from: $file" >> ./web/public/generated/main.js
        cat "$file" >> ./web/public/generated/main.js
    fi
done < <(sort $TMP/scripts-order.txt)

# Page specific script
for file in ./web/pages/*.js; do
    if [[ -f $file ]]; then
        cp $file ./web/public/generated/page/$(basename $file)
    fi
done
