package server

import (
	"fmt"
	"io"
	"net/http"
)

var address = "https://api.smithed.dev/v2"

type Response struct {
	Name string
	Data []byte
}

type API struct {
	Handler        *Handler
	batchNames     []string
	batchEndpoints []string
}

func NewAPI(handler *Handler) *API {
	return &API{
		Handler:        handler,
		batchNames:     []string{},
		batchEndpoints: []string{},
	}
}

func (api *API) Get(name string, endpoint string, args ...any) Response {
	endpoint = fmt.Sprintf(address+endpoint, args...)
	logger.Debugf("API ==> GET %s", endpoint)

	request, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return Response{}
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return Response{}
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		api.Handler.writeErrInternal(err)
		return Response{}
	}

	return Response{
		Name: name,
		Data: body,
	}
}

func (api *API) AddBatch(name string, endpoint string) *API {
	api.batchNames = append(api.batchNames, name)
	api.batchEndpoints = append(api.batchEndpoints, endpoint)

	return api
}

func (api *API) RunBatchTasks() map[string][]byte {
	amount := len(api.batchEndpoints)
	responses := map[string][]byte{}
	channel := make(chan Response, amount)

	for i, endpoint := range api.batchEndpoints {
		go func(url string) {
			channel <- api.Get(api.batchNames[i], url)
		}(endpoint)
	}

	for range amount {
		response := <-channel
		responses[response.Name] = response.Data
	}

	api.batchNames = []string{}
	api.batchEndpoints = []string{}

	return responses
}
