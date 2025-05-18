package server

import (
	"net/http"
)

func Articles(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("build/pages/articles.html").ServePage(nil)
}
