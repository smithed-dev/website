package server

import (
	"net/http"
)

func Index(writer http.ResponseWriter, request *http.Request) {
	NewHandler(writer, request).ParseTemplate("www/index.html").ServePage(nil)
}
