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
find ./web/pages/_components/ -name "*.js" -exec echo {} >> $TMP/scripts-order.txt \;
while IFS= read -r file; do
    if [[ -f $file ]]; then
        echo "// from: $file" >> ./web/public/generated/main.js
        cat "$file" >> ./web/public/generated/main.js
    fi
done < <(sort $TMP/scripts-order.txt)

# Page specific script
for file in ./web/pages/**/*.js; do
    # skip anything in a "_*" directory
    [[ $file == */_*/* ]] && continue

    relpath=${file#./web/pages/}
    dir=$(dirname $relpath)
    reldir=${dir#./web/pages/}

    if [[ "$reldir" == "." ]]; then
        cp $file ./web/public/generated/page/$(basename $file)
    else
        mkdir -p ./web/public/generated/page/$reldir/
        cp $file ./web/public/generated/page/$reldir/$(basename $file)
    fi
done
