#!/usr/bin/bash

MEND_VERSION=v1.0.1-alpha.4

function install_mend {
    echo "==> Mend: Installing the required version" >&2
    go install github.com/bbfh-dev/mend@$MEND_VERSION
}

if ! [ -x "$(command -v mend)" ]; then
    install_mend
fi

if mend --version | grep -q $MEND_VERSION; then
    echo "==> Mend: Installation is correct"
else
    install_mend
fi

echo "==> Mend: Started"
mkdir -p build/pages/

cp -fr ./web/public/ build/

CSS_CHECKSUM=$(md5sum build/public/generated/styles.min.css | cut -d ' ' -f1)
JS_CHECKSUM=$(md5sum build/public/generated/main.js | cut -d ' ' -f1)

function mend_wrapper {
    file=$1
    dir=$2
    base=$(basename $file)
    js="build/public/page/$(basename -s .html $file).js"

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

shopt -s globstar

for file in ./web/pages/**/*.html; do
    # skip anything in a "_*" directory
    [[ $file == */_*/* ]] && continue

    relpath=${file#./web/pages/}
    dir=$(dirname $relpath)
    reldir=${dir#./web/pages/}

    if [[ "$reldir" == "." ]]; then
        mend_wrapper $file ./build/pages &
    else
        mend_wrapper $file ./build/pages/$reldir &
    fi
done

# for file in ./web/pages/*.html; do
#     if [[ -f $file ]]; then
#         mend_wrapper $file ./build &
#     fi
# done
#
# for file in ./web/pages/htmx/*.html; do
#     if [[ -f $file ]]; then
#         mend_wrapper $file build/htmx &
#     fi
# done

wait
echo "==> Mend: Done"
