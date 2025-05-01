package server

import (
	"net/http"
)

func ApiLogout(writer http.ResponseWriter, request *http.Request) {
	cookie := http.Cookie{
		Name:     "logged_in",
		Value:    "false",
		Path:     "/",
		HttpOnly: false,
		MaxAge:   -1,
	}
	http.SetCookie(writer, &cookie)
	http.Redirect(writer, request, "/", http.StatusTemporaryRedirect)
}
