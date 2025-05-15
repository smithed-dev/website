#!/usr/bin/bash

TMP=/tmp/smithed-dev/
mkdir -p ./web/public/generated/
mkdir -p $TMP

# Global styles
cat \
    ./web/styles/_units.less \
    ./web/styles/fonts.less \
    ./web/styles/normalize.less \
    ./web/styles/themes.less \
    ./web/styles/global.less \
    > $TMP/styles.css

# Widgets
: > $TMP/styles-file-order.txt
find ./web/pages/ -name "*.less" -exec echo {} >> $TMP/styles-file-order.txt \;
cat $TMP/styles-file-order.txt | sort | xargs -I {} cat {} >> $TMP/styles.css

# Adaptive must always be in the end (@media queries)
cat ./web/styles/_adaptive.less >> $TMP/styles.css

# Compile the goods
lessc $TMP/styles.css > ./web/public/generated/styles.css
python -m csscompressor -o ./web/public/generated/styles.min.css ./web/public/generated/styles.css
