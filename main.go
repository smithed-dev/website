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

	http.HandleFunc("/favicon.svg", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "www/favicon.svg")
	})
	http.HandleFunc("/favicon.png", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "www/favicon.png")
	})
	http.HandleFunc("/favicon.ico", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "www/favicon.ico")
	})
	http.HandleFunc("/kaithhealthcheck", func(writer http.ResponseWriter, request *http.Request) {
		writer.WriteHeader(http.StatusOK)
	})
	http.HandleFunc("/", server.Index)
	http.HandleFunc("/browse", server.Browse)

	server.SetupLogger(os.Getenv("DEBUG") == "1")
	err := http.ListenAndServe("127.0.0.1:8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
