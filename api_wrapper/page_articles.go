package server

import (
	"net/http"
)

func Articles(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("./build/articles.html").ServePage(nil)
}
