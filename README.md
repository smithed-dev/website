# Website

This is an HTMX implementation of the smithed website.

## Next to be implemented (TODO)

- [x] Adaptive UI for landing page
- [x] Browse page
- [x] Search bar
- [ ] Login

## Building

### Requirements

- I made this for UNIX-like systems (MacOS/Linux)
- You'll need [Go](https://go.dev/) installed.

#### If you are going to be doing modifications to ./src/

To build the project:

- You'll need [Less CSS](https://lesscss.org/) for CSS compiling:
    - `npm install -g less`
- You will need my templating language [Mend v1.0.1-alpha.2](https://github.com/bbfh-dev/mend) to be installed:
    - `go install github.com/bbfh-dev/mend@v1.0.1-alpha.2`

### Running the server

```bash
# If you made changes, assuming you have both mend and lessc installed
sh ./build.sh

# Run the server at port :8080
DEBUG=1 go run main.go
```

Navigate to [http://localhost:8080/](http://localhost:8080/) and enjoy the site.
