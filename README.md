# Website

This is an HTMX implementation of the smithed website completely redesigned from scratch.

<!-- vim-markdown-toc GFM -->

* [Building](#building)
    * [Requirements](#requirements)
    * [Generating assets](#generating-assets)
    * [Building](#building-1)
    * [Running the server](#running-the-server)

<!-- vim-markdown-toc -->

# Building

## Requirements

- I made this for UNIX-like systems (MacOS/Linux)
- You'll need [Go](https://go.dev/) installed.

## Generating assets

All CSS, JS & HTML is pregenerated. If you do modifications of any of the above you should consider regenerating them using one of the following:

- `./generate.js.sh` — Combines all the javascript
- `./generate.css.sh` — Compiles all the styles using [Less](https://lesscss.org/) (`npm install -g less`)
- `./generate.all.sh` — Run the two scripts above (async)

## Building

```bash
./build.sh
```

It creates and fills the `build/` directory: ensures [Mend](https://github.com/bbfh-dev/mend) is installed and builds all the templates.

## Running the server

Assuming the `build/` directory is intact:

```bash
# Run the server at port :8080
DEBUG=1 go run main.go
```

Navigate to [http://localhost:8080/](http://localhost:8080/) and enjoy the site.
