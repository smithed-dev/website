package pages

import (
	"net/http"

	"github.com/smithed-dev/website/server"
)

var indexTemplate = server.NewTemplate("root", []string{
	"site/root.html",
	"site/index.html",
})

func Index(writer http.ResponseWriter, request *http.Request) {
	if request.URL.Path != "/" {
		notFound(writer, request)
		return
	}
	logRequest(request)

	err := indexTemplate.ExecuteTemplate(writer, "root", nil)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}
}

func logRequest(request *http.Request) {
	server.Logger.Infof("<-- %s %s", request.Method, request.URL.String())
}

func notFound(writer http.ResponseWriter, request *http.Request) {
	server.Logger.Errorf("<-- NOT FOUND %s", request.URL.String())
	http.Error(writer, "Unknown path", http.StatusNotFound)
}
