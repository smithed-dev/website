package server

import (
	"net/http"
)

func Login(writer http.ResponseWriter, request *http.Request) {
	cookie := http.Cookie{
		Name:     "logged_in",
		Value:    "true",
		HttpOnly: false,
	}
	http.SetCookie(writer, &cookie)
	http.Redirect(writer, request, "/", http.StatusPermanentRedirect)
}
