package server

import (
	"net/http"
)

func Logout(writer http.ResponseWriter, request *http.Request) {
	cookie := http.Cookie{
		Name:     "logged_in",
		HttpOnly: false,
		MaxAge:   0,
	}
	http.SetCookie(writer, &cookie)
	http.Redirect(writer, request, "/", http.StatusPermanentRedirect)
}
