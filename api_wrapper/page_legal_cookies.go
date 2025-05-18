package server

import (
	"net/http"
)

func LegalCookies(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	handler.ParseTemplate("build/pages/legal/cookies.html").ServePage(nil)
}
