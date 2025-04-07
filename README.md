# Website

This is an HTMX implementation of the smithed website.

## Building

### Requirements

- I made this for UNIX-like systems (MacOS/Linux)
- You'll need [Go](https://go.dev/) installed.
- (Optional) You'll need [Less CSS](https://lesscss.org/) for CSS compiling.

### Running the server

```bash
# If you did changes to styles
lessc ./site/styles/_styles.less > ./site/static/styles.css
lessc ./site/styles/_fonts.less > ./site/static/fonts.css

# Run the server at port :8080
go run main.go
```

Navigate to [http://localhost:8080/](http://localhost:8080/) and enjoy the site.
