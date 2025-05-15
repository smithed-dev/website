#!/usr/bin/bash
# This is a helper script to run all the scripts

function do_css {
    echo "==> CSS: Started"
    ./generate.css.sh
    echo "==> CSS: Done"
}

function do_js {
    echo "==> JS: Started"
    ./generate.js.sh
    echo "==> JS: Done"
}

do_css &
do_js &
wait
