package server

import (
	"fmt"
	"html/template"
	"io"
	"net/http"

	"github.com/tidwall/gjson"
)

type page struct {
	Endpoint string
	Writer   http.ResponseWriter
	Request  *http.Request
	Template string

	apiBlocks map[string][]byte
}

func (page *page) ServePage() {
	if page.Endpoint != "*" && page.Request.URL.Path != page.Endpoint {
		page.writeErrNotFound()
		return
	}
	logger.Infof("%s %s", page.Request.Method, page.Request.URL.String())

	templ, err := template.ParseFiles(page.Template)
	if err != nil {
		page.writeErrInternal(err)
		return
	}

	err = templ.Execute(page.Writer, nil)
	if err != nil {
		page.writeErrInternal(err)
	}
}

func (page *page) PrepareForAPIAccess() *page {
	page.apiBlocks = map[string][]byte{}
	return page
}

func (page *page) RequestAPI(name string, endpoint string, args ...any) (ok bool) {
	endpoint = fmt.Sprintf(endpoint, args...)
	logger.Debugf("API ==> GET %s", endpoint)

	request, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		page.writeErrAPI(err)
		return false
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		page.writeErrAPI(err)
		return false
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		page.writeErrAPI(err)
		return false
	}

	page.apiBlocks[name] = body
	return true
}

func (page *page) Obtain(name string, selector string) string {
	return gjson.GetBytes(page.apiBlocks[name], selector).String()
}

func (page *page) writeErrNotFound() {
	logger.Errorf("~ NOT FOUND %s", page.Request.URL.String())
	http.Error(page.Writer, "Unknown path", http.StatusNotFound)
}

func (page *page) writeErrInternal(err error) {
	logger.Errorf("~ INTERNAL %s: %s", page.Request.URL.String(), err.Error())
	http.Error(page.Writer, err.Error(), http.StatusInternalServerError)
}

func (page *page) writeErrBadRequest(msg string) {
	http.Error(page.Writer, msg, http.StatusBadRequest)
}

func (page *page) writeErrAPI(err error) {
	logger.Errorf("~ API %s: %s", page.Request.URL.String(), err.Error())
	http.Error(page.Writer, err.Error(), http.StatusInternalServerError)
}
