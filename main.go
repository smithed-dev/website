package main

import (
	"net/http"
	"os"

	"github.com/charmbracelet/log"
	"github.com/smithed-dev/website/server"
)

const DIR_STATIC = "./www/static/"

func main() {
	http.Handle(
		"/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir(DIR_STATIC))),
	)

	http.HandleFunc("/", server.Index)

	// http.HandleFunc("/htmx/landing_card/{sort}", server.HTMXLandingCard)
	// http.HandleFunc("/htmx/landing/get_newest_card", pages.HTMXCardPack("newest"))

	server.SetupLogger(os.Getenv("DEBUG") == "1")
	err := http.ListenAndServe("127.0.0.1:8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
