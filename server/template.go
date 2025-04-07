package server

import "html/template"

func NewTemplate(name string, files []string) *template.Template {
	templ, err := template.ParseFiles(files...)
	if err != nil {
		Logger.Fatal("Can't parse a template", "name", name, "err", err)
	}

	return templ
}
