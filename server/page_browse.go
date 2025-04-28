package server

import (
	"net/http"
)

var browseLimitCount = 12

type pageData struct {
	Label      string
	Href       string
	IsSelected bool
}

type BrowsePageData struct {
	Cards      []PackCardData
	Pages      []pageData
	Categories []string
}

type BrowsePageParams struct {
	Search   string
	Page     int
	Category string
}

func Browse(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request).ParseTemplate(
		"www/browse.html",
		"www/htmx/pack_card.html",
		"www/htmx/browse_packs.html",
	)
	data := BrowsePageData{
		Cards: []PackCardData{},
		Pages: []pageData{},
		Categories: []string{
			"Extensive",
			"Lightweight",
			"QoL",
			"Vanilla+",
			"Tech",
			"Magic",
			"Exploration",
			"World Overhaul",
			"Library",
		},
	}

	handler.ServePage(data)
}
