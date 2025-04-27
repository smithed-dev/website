package server

import (
	"html/template"
	"net/http"
)

type Handler struct {
	Writer   http.ResponseWriter
	Request  *http.Request
	Template *template.Template
	Name     string
}

func NewHandler(writer http.ResponseWriter, request *http.Request) *Handler {
	return &Handler{
		Writer:   writer,
		Request:  request,
		Template: nil,
		Name:     "index",
	}
}

func (handler *Handler) ParseTemplate(path ...string) *Handler {
	templ, err := template.ParseFiles(path...)
	if err != nil {
		handler.writeErrInternal(err)
	}

	handler.Template = templ
	return handler
}

func (handler *Handler) ServePage(data any) {
	logger.Infof("%s %s", handler.Request.Method, handler.Request.URL.String())

	err := handler.Template.ExecuteTemplate(handler.Writer, handler.Name, data)
	if err != nil {
		handler.writeErrInternal(err)
	}
}

func (handler *Handler) ServeIndexPage(data any) {
	if handler.Request.URL.Path != "/" {
		switch handler.Request.URL.Path {
		case "/.git/config",
			"/info.php",
			"/config.json",
			"/.env",
			"/@vite/env":
			logger.Debug(
				"Probably a bot",
				"path",
				handler.Request.URL.Path,
				"addr",
				handler.Request.RemoteAddr,
				"agent",
				handler.Request.UserAgent(),
				"cookies",
				handler.Request.Cookies(),
			)
		}
		handler.writeErrNotFound()
		return
	}
	handler.ServePage(data)
}
