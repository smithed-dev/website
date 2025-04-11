# Website

This is an HTMX implementation of the smithed website.

## Next to be implemented (TODO)

- [x] Adaptive UI for landing page
- [ ] Browse page
- [ ] Search bar
- [ ] Login

## Building

### Requirements

- I made this for UNIX-like systems (MacOS/Linux)
- You'll need [Go](https://go.dev/) installed.
- (Optional) You'll need [Less CSS](https://lesscss.org/) for CSS compiling.

### Running the server

```bash
# If you did changes
sh ./build.sh

# Run the server at port :8080
DEBUG=1 go run main.go
```

Navigate to [http://localhost:8080/](http://localhost:8080/) and enjoy the site.
