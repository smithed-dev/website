package server

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"sync"
)

var browseLimitCount = 12

type pageData struct {
	Label      string
	Href       string
	IsSelected bool
}

type BrowsePageData struct {
	Cards []PackCardData
	Pages []pageData
}

type BrowsePageParams struct {
	Search string
	Page   int
}

func Browse(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request).ParseTemplate(
		"www/browse.html",
		"www/htmx/pack_card.html",
	)
	data := BrowsePageData{
		Cards: []PackCardData{},
		Pages: []pageData{},
	}

	page, _ := strconv.Atoi(request.URL.Query().Get("page"))
	sort := request.URL.Query().Get("sort")
	if sort == "" {
		sort = "trending"
	}
	params := BrowsePageParams{
		Search: request.URL.Query().Get("search"),
		Page:   page,
	}

	var packsData []byte
	var countData []byte
	var wg sync.WaitGroup

	api := NewAPI(handler)
	wg.Add(2)

	go func(result *[]byte) {
		*result = api.Get(
			"/packs?sort=%s&limit=%d&start=%d&search=%s&scope=%s",
			sort,
			browseLimitCount,
			browseLimitCount*params.Page,
			params.Search,
			IndexScopes,
		)
		wg.Done()
	}(&packsData)

	go func(result *[]byte) {
		*result = api.Get(
			"/packs/count?search=%s",
			params.Search,
		)
		wg.Done()
	}(&countData)

	wg.Wait()

	data.Cards = ForEach(PackCardData{Label: ""}, packsData)

	count, _ := strconv.ParseFloat(string(countData), 64)
	count = math.Ceil(count) / float64(browseLimitCount)
	if count < 7 {
		for i := range int(count) {
			url := *request.URL
			urlPtr := &url
			values := urlPtr.Query()
			values.Set("page", fmt.Sprintf("%d", i+1))
			data.Pages = append(data.Pages, pageData{
				Label:      fmt.Sprintf("%d", i+1),
				Href:       "/browse?" + values.Encode(),
				IsSelected: i == 0,
			})
		}
	} else {
		for i := range 4 {
			url := *request.URL
			urlPtr := &url
			values := urlPtr.Query()
			values.Set("page", fmt.Sprintf("%d", i+1))
			data.Pages = append(data.Pages, pageData{
				Label:      fmt.Sprintf("%d", i+1),
				Href:       "/browse?" + values.Encode(),
				IsSelected: i == 0,
			})
		}
		data.Pages = append(data.Pages, pageData{
			Label:      "—",
			Href:       "",
			IsSelected: false,
		})
		for i := range 3 {
			page := (int(count) - 2) + i + 1
			url := *request.URL
			urlPtr := &url
			values := urlPtr.Query()
			values.Set("page", fmt.Sprintf("%d", page))
			data.Pages = append(data.Pages, pageData{
				Label:      fmt.Sprintf("%d", page),
				Href:       "/browse?" + values.Encode(),
				IsSelected: page == 1,
			})
		}
	}

	handler.ServePage(data)
}
