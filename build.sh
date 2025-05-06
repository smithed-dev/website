#!/usr/bin/bash

# ============
echo "========"

cp -fr ./web/public/ ./build/

# ============

function build_css {
    cat \
        ./web/styles/_units.less \
        ./web/styles/fonts.less \
        ./web/styles/normalize.less \
        ./web/styles/themes.less \
        ./web/styles/global.less \
        > ./build/public/styles.css

    echo "" > /tmp/smithed-dev.css
    find ./web/pages/ -name "*.less" -exec echo {} >> /tmp/smithed-dev.css \;
    cat /tmp/smithed-dev.css | sort | xargs -I {} cat {} >> ./build/public/styles.css

    cat ./web/styles/_adaptive.less >> ./build/public/styles.css

    lessc ./build/public/styles.css > /tmp/styles.css
    mv /tmp/styles.css ./build/public/styles.css
    python -m csscompressor -o ./build/public/styles.min.css ./build/public/styles.css

    export CSS_CHECKSUM=$(md5sum ./build/public/styles.min.css | cut -d ' ' -f1)
    echo "=== Built CSS"
}

function build_js {
    cp ./web/main.js ./build/public/main.js

    echo "" > /tmp/smithed-dev.js
    find ./web/pages/components/ -name "*.js" -exec echo {} >> /tmp/smithed-dev.js \;
    cat /tmp/smithed-dev.js | sort | xargs -I {} cat {} >> ./build/public/main.js

    export JS_CHECKSUM=$(md5sum ./build/public/main.js | cut -d ' ' -f1)

    mkdir -p ./build/public/page/
    for file in ./web/pages/*.js; do
        if [[ -f $file ]]; then
            cp $file ./build/public/page/$(basename $file)
        fi
    done
    echo "=== Built JS"
}

build_css &
build_js

wait

# ============

mkdir -p ./build/htmx/

function mend_wrapper {
    file=$1
    dir=$2
    base=$(basename $file)
    js="./build/public/page/$(basename -s .html $file).js"

    PAGE_CHECKSUM=""
    if [[ -f $js ]]; then
        PAGE_CHECKSUM=$(md5sum $js | cut -d ' ' -f1)
    fi

    mend --work-dir ./web/pages/ \
         --input checksum.css=$CSS_CHECKSUM,checksum.js=$JS_CHECKSUM,checksum.page_js=$PAGE_CHECKSUM \
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
