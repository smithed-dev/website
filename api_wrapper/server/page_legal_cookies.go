package server

import (
	"net/http"
)

func LegalCookies(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("../build/legal__cookies.html").ServePage(nil)
}
