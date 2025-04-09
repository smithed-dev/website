package server

import (
	"html/template"
	"net/http"
)

type Handler struct {
	Writer   http.ResponseWriter
	Request  *http.Request
	Template *template.Template
}

func NewHandler(writer http.ResponseWriter, request *http.Request) *Handler {
	return &Handler{
		Writer:   writer,
		Request:  request,
		Template: nil,
	}
}

func (handler *Handler) ParseTemplate(path string) *Handler {
	templ, err := template.ParseFiles(path)
	if err != nil {
		handler.writeErrInternal(err)
	}

	handler.Template = templ
	return handler
}

func (handler *Handler) ServePage(data any) {
	logger.Infof("%s %s", handler.Request.Method, handler.Request.URL.String())

	err := handler.Template.Execute(handler.Writer, data)
	if err != nil {
		handler.writeErrInternal(err)
	}
}

func (handler *Handler) ServeIndexPage(data any) {
	if handler.Request.URL.Path != "/" {
		handler.writeErrNotFound()
		return
	}
	handler.ServePage(data)
}
