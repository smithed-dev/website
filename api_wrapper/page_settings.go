package server

import (
	"net/http"
)

func Settings(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("build/pages/settings.html").ServePage(nil)
}
