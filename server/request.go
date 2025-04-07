package server

import (
	"io"
	"net/http"
	"strings"

	"github.com/tidwall/gjson"
)

var API = "https://api.smithed.dev/v2"

type Request struct {
	Blocks   map[string][]byte
	Canceled bool
}

func sendRequest(endpoint string) ([]byte, bool) {
	Logger.Debugf("==> GET %s", API+endpoint)
	cancelled := false
	request, err := http.NewRequest("GET", API+endpoint, nil)
	if err != nil {
		Logger.Error(err)
		cancelled = true
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		Logger.Error(err)
		cancelled = true
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		Logger.Error(err)
		cancelled = true
	}

	return body, !cancelled
}

func NewRequest(name string, endpoint string) *Request {
	body, ok := sendRequest(endpoint)

	return &Request{
		Blocks: map[string][]byte{
			name: body,
		},
		Canceled: !ok,
	}
}

func (request *Request) ThenGet(name string, endpoint string, params string) *Request {
	if request.Canceled {
		return request
	}

	for pair := range strings.SplitSeq(params, ";") {
		param := strings.SplitN(pair, " = ", 2)
		if len(param) != 2 {
			panic("(ASSERT) ThenGet(..., params) parameter must be `key = value`")
		}
		key, value := param[0], param[1]

		pathPairs := strings.SplitN(value, ".", 2)
		pathTarget, pathSelector := pathPairs[0][1:], pathPairs[1]

		block, ok := request.Blocks[pathTarget]
		if !ok {
			panic("Trying to get a block that wasn't set!")
		}

		endpoint = strings.ReplaceAll(
			endpoint,
			":"+key,
			gjson.GetBytes(block, "@this."+pathSelector).String(),
		)
	}

	body, ok := sendRequest(endpoint)
	request.Blocks[name] = body
	request.Canceled = !ok

	return request
}

func (request *Request) String() string {
	var builder strings.Builder

	for key, value := range request.Blocks {
		builder.WriteString(key + ":\n")
		builder.WriteString(string(value))
		builder.WriteString("\n\n")
	}

	return builder.String()
}
