package main

import (
	"net/http"

	"github.com/charmbracelet/log"
	"github.com/smithed-dev/website/server"
	"github.com/smithed-dev/website/server/pages"
)

var Version string

func main() {
	http.Handle(
		"/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir("site/static/"))),
	)

	http.HandleFunc("/", pages.Index)
	http.HandleFunc("/htmx/landing/get_trending_card", pages.HTMXCardPack("trending"))
	http.HandleFunc("/htmx/landing/get_newest_card", pages.HTMXCardPack("newest"))

	server.Logger.SetLevel(log.DebugLevel)
	server.Logger.Info("Serving at 127.0.0.1:8080...")
	err := http.ListenAndServe("127.0.0.1:8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
