#!/usr/bin/bash

# ============
echo "========"

cp -fr ./web/public/ ./build/public/

# ============
echo "=== Compiling CSS"

cat \
    ./web/styles/_units.less \
    ./web/styles/fonts.less \
    ./web/styles/normalize.less \
    ./web/styles/themes.less \
    ./web/styles/global.less \
    > ./build/public/styles.css
find ./web/pages/ -name "*.less" -exec cat {} >> ./build/public/styles.css \;
cat ./web/styles/_adaptive.less >> ./build/public/styles.css

lessc ./build/public/styles.css > /tmp/styles.css
mv /tmp/styles.css ./build/public/styles.css
python -m csscompressor -o ./build/public/styles.min.css ./build/public/styles.css

CSS_CHECKSUM=$(md5sum ./build/public/styles.min.css | cut -d ' ' -f1)

# ============
echo "=== Compiling JS"

cp ./web/main.js ./build/public/main.js
find ./web/pages/ -name "*.js" -exec cat {} >> ./build/public/main.js \;

JS_CHECKSUM=$(md5sum ./build/public/main.js | cut -d ' ' -f1)

cp ./web/page_index.js ./build/public/page_index.js
cp ./web/page_browse.js ./build/public/page_browse.js

# ============
echo "=== Building templates"
mkdir -p ./build/htmx/

function mend_wrapper {
    file=$1
    dir=$2
    base=$(basename $file)

    mend --work-dir ./web/pages/ \
         --input checksum.css=$CSS_CHECKSUM,checksum.js=$JS_CHECKSUM \
         --output $dir/. $file \
         2> >(sed $'s/^/\e[31m/; s/$/\e[0m/' >&2) \
         && echo "--- Built $dir/$base"
}

for file in ./web/pages/*.html; do
    if [[ -f $file ]]; then
        mend_wrapper $file ./build &
    fi
done

for file in ./web/pages/htmx/*.html; do
    if [[ -f $file ]]; then
        mend_wrapper $file ./build/htmx &
    fi
done

wait
echo "=== Done"
