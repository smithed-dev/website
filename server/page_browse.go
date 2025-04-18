package server

import "net/http"

func Browse(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)
	handler.ParseTemplate("www/browse.html").ServePage(nil)
}
