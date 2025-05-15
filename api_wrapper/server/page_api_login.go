package server

import (
	"net/http"
)

func ApiLogin(writer http.ResponseWriter, request *http.Request) {
	cookie := http.Cookie{
		Name:     "logged_in",
		Value:    "true",
		Path:     "/",
		HttpOnly: false,
		MaxAge:   30 * 24 * 60 * 60,
	}
	http.SetCookie(writer, &cookie)

	handler := NewHandler(writer, request)
	handler.ParseTemplate("../build_after_login.html").ServePage(nil)
}
