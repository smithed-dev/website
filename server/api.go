package server

import (
	"fmt"
	"io"
	"net/http"
)

var address = "https://api.smithed.dev/v2"

type API struct {
	Handler *Handler
}

func NewAPI(handler *Handler) *API {
	return &API{
		Handler: handler,
	}
}

func (api *API) Get(endpoint string, args ...any) []byte {
	endpoint = fmt.Sprintf(address+endpoint, args...)
	logger.Debugf("API ==> GET %s", endpoint)

	request, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return nil
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return nil
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return nil
	}

	return body
}
