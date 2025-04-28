package server

import (
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
)

func HTMXBrowsePacks(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request).ParseTemplate(
		"www/htmx/browse_packs.html",
		"www/htmx/pack_card.html",
	)
	data := BrowsePageData{
		Cards: []PackCardData{},
		Pages: []pageData{},
	}

	page, _ := strconv.Atoi(request.URL.Query().Get("page"))
	sort := request.URL.Query().Get("sort")
	category := request.URL.Query().Get("category")
	if sort == "" {
		sort = "trending"
	}
	params := BrowsePageParams{
		Search:   request.URL.Query().Get("search"),
		Page:     page,
		Category: category,
	}

	var packsData []byte
	var countData []byte
	var wg sync.WaitGroup

	uri, _ := url.Parse("/packs")
	query := uri.Query()
	query.Set("sort", sort)
	query.Set("limit", fmt.Sprint(browseLimitCount))
	query.Set("start", fmt.Sprint(browseLimitCount*params.Page))
	if params.Search != "" {
		query.Set("search", params.Search)
	}
	query.Set("scope", IndexScopes)
	var suffix strings.Builder
	for category := range strings.SplitSeq(params.Category, ",") {
		value := url.QueryEscape(category)
		if value != "" {
			suffix.WriteString("&category=" + value)
		}
	}

	api := NewAPI(handler)
	wg.Add(2)

	go func(result *[]byte) {
		*result = api.Get("/packs?%s%s", query.Encode(), suffix.String())
		wg.Done()
	}(&packsData)

	go func(result *[]byte) {
		*result = api.Get(
			"/packs/count?search=%s%s",
			params.Search,
			suffix.String(),
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

	handler.Name = "browse_packs"
	handler.ServePage(data)
}
