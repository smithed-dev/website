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
		"build/htmx/browser.html",
		"build/htmx/pack_card.html",
	)
	data := BrowsePageData{
		Cards: []PackCardData{},
		Pages: []pageData{},
	}

	queryPacks(handler, request, &data)

	handler.Name = "browser"
	handler.ServePage(data)
}

func queryPacks(handler *Handler, request *http.Request, data *BrowsePageData) {
	page, _ := strconv.Atoi(request.URL.Query().Get("page"))
	page = max(page, 1)
	sort := request.URL.Query().Get("sort")
	if sort == "" {
		sort = "trending"
	}
	categories := request.URL.Query()["category"]
	versions := request.URL.Query()["version"]
	params := BrowsePageParams{
		Search:     request.URL.Query().Get("search"),
		Page:       page,
		Categories: categories,
		Versions:   versions,
	}

	var packsData []byte
	var countData []byte
	var wg sync.WaitGroup

	uri, _ := url.Parse("/packs")
	query := uri.Query()
	query.Set("sort", sort)
	query.Set("limit", fmt.Sprint(browseLimitCount))
	query.Set("page", fmt.Sprint(params.Page))
	if params.Search != "" {
		query.Set("search", params.Search)
	}
	query.Set("scope", IndexScopes)
	var suffix strings.Builder
	for _, category := range params.Categories {
		value := url.QueryEscape(category)
		if value != "" {
			suffix.WriteString("&category=" + value)
		}
	}
	for _, version := range params.Versions {
		value := url.QueryEscape(version)
		if value != "" {
			suffix.WriteString("&version=" + value)
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

	totalPages, _ := strconv.ParseFloat(string(countData), 64)
	data.Pages = Paginate(
		int(math.Ceil(totalPages/float64(browseLimitCount))),
		params.Page,
	)
	values := request.URL.Query()
	for i, page := range data.Pages {
		values.Set("page", page.Label)
		page.Href = "/browse?" + values.Encode()
		data.Pages[i] = page
	}
}

// Paginate returns up to 7 slots: first/last, ellipses, current ± neighbors.
func Paginate(total, current int) []pageData {
	if total < 1 {
		return nil
	}
	// clamp current
	if current < 1 {
		current = 1
	} else if current > total {
		current = total
	}

	var out []pageData
	add := func(num int) {
		out = append(out, pageData{Label: fmt.Sprint(num), IsCurrent: num == current})
	}
	addEllipsis := func() {
		out = append(out, pageData{IsEllipsis: true})
	}

	switch {
	// small enough to show all pages
	case total <= 7:
		for i := 1; i <= total; i++ {
			add(i)
		}

	// near the front: show 1–5, “…”, last
	case current <= 4:
		for i := 1; i <= 5; i++ {
			add(i)
		}
		addEllipsis()
		add(total)

	// near the back: show 1, “…”, total−4…total
	case current >= total-3:
		add(1)
		add(2)
		addEllipsis()
		for i := total - 3; i <= total; i++ {
			add(i)
		}

	// middle: show 1, “…”, current−1, current, current+1, “…”, last
	default:
		add(1)
		addEllipsis()
		for i := current - 1; i <= current+1; i++ {
			add(i)
		}
		addEllipsis()
		add(total)
	}

	return out
}
