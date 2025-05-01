package server

import (
	"errors"
	"net/http"
	"strings"
	"sync"

	"github.com/tidwall/gjson"
)

const landingCardsCount = 5

type packGroup struct {
	Trending PackCardData
	Newest   PackCardData
}

type IndexPageData struct {
	LoggedIn bool
	Cards    []packGroup
}

var IndexScopes = strings.Join([]string{
	"data.id",
	"data.display.name",
	"data.display.description",
	"data.display.gallery",
	"data.display.icon",
	"data.versions",
	"data.categories",
	"meta.stats.downloads.total",
	"meta.stats.updated",
	"meta.rawId",
	"owner.displayName",
}, ",")

var dataTrendingPacks []byte = nil
var dataNewestPacks []byte = nil

func Index(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request)

	// Simple caching so that I don't spam the API when working on styles
	if dataTrendingPacks == nil || dataNewestPacks == nil {
		api := NewAPI(handler)
		var wg sync.WaitGroup
		wg.Add(2)

		go func(result *[]byte) {
			*result = api.Get(
				"/packs?sort=trending&limit=%d&scope=%s",
				landingCardsCount,
				IndexScopes,
			)
			wg.Done()
		}(&dataTrendingPacks)

		go func(result *[]byte) {
			*result = api.Get(
				"/packs?sort=newest&limit=%d&scope=%s",
				landingCardsCount,
				IndexScopes,
			)
			wg.Done()
		}(&dataNewestPacks)

		wg.Wait()
	}

	if !gjson.ValidBytes(dataTrendingPacks) || !gjson.ValidBytes(dataNewestPacks) {
		handler.writeErrInternal(errors.New("API returned an invalid JSON"))
	}

	trending := ForEach(PackCardData{Label: "trending", IsLanding: true}, dataTrendingPacks)
	newest := ForEach(PackCardData{Label: "new", IsLanding: true}, dataNewestPacks)
	cards := make([]packGroup, landingCardsCount)
	for i := range landingCardsCount {
		cards[i] = packGroup{
			Trending: trending[i],
			Newest:   newest[i],
		}
	}

	var isLoggedIn bool
	cookie, err := request.Cookie("logged_in")
	if err == nil {
		isLoggedIn = cookie.Value == "true"
	}

	handler.ParseTemplate("build/index.html", "build/htmx/pack_card.html").
		ServeIndexPage(IndexPageData{
			LoggedIn: isLoggedIn,
			Cards:    cards,
		})
}
