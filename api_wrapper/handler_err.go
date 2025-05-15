package server

import "net/http"

func (handler *Handler) writeErrNotFound() {
	logger.Errorf("~ NOT FOUND %s", handler.Request.URL.String())
	http.Error(handler.Writer, "Unknown path", http.StatusNotFound)
}

func (handler *Handler) writeErrInternal(err error) {
	logger.Errorf("~ INTERNAL %s: %s", handler.Request.URL.String(), err.Error())
	http.Error(handler.Writer, err.Error(), http.StatusInternalServerError)
}

func (handler *Handler) writeErrBadRequest(msg string) {
	http.Error(handler.Writer, msg, http.StatusBadRequest)
}
