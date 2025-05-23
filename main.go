package main

import (
	"net/http"
	"os"

	"github.com/charmbracelet/log"
	server "github.com/smithed-dev/website/api_wrapper"
)

const DIR_STATIC = "build/public/"

func main() {
	http.Handle(
		"/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir(DIR_STATIC))),
	)

	http.HandleFunc("/favicon.svg", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "build/public/favicon.svg")
	})
	http.HandleFunc("/favicon.png", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "build/public/favicon.png")
	})
	http.HandleFunc("/favicon.ico", func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, "build/public/favicon.ico")
	})
	http.HandleFunc("/kaithheathcheck", func(writer http.ResponseWriter, request *http.Request) {
		writer.WriteHeader(http.StatusOK)
	})
	http.HandleFunc("/", server.Index)
	http.HandleFunc("/browse", server.Browse)
	http.HandleFunc("/login", server.Login)
	http.HandleFunc("/register", server.Register)
	http.HandleFunc("/settings", server.Settings)
	http.HandleFunc("/articles", server.Articles)
	http.HandleFunc("/article/{id}", server.Article)
	http.HandleFunc("/legal/cookies", server.LegalCookies)
	http.HandleFunc("/packs/{id}", server.Pack)

	http.HandleFunc("/api/login", server.ApiLogin)
	http.HandleFunc("/api/logout", server.ApiLogout)

	http.HandleFunc("/htmx/browse_packs", server.HTMXBrowsePacks)

	server.SetupLogger(os.Getenv("DEBUG") == "1")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
