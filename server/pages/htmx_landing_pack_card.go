package pages

import (
	"fmt"
	"net/http"
	"time"

	"github.com/mergestat/timediff"
	"github.com/smithed-dev/website/server"
	"github.com/tidwall/gjson"
)

type packCard struct {
	Label        string
	Name         string
	Desc         string
	Versions     string
	Downloads    string
	LastUpdated  string
	ThumbnailURL string
	Categories   []string
}

var htmxTrendingCardPack = server.NewTemplate("component", []string{
	"site/components/pack_card.html",
})

func HTMXCardPack(sort string) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		logRequest(request)

		blocks := server.
			NewRequest("main", "/packs?limit=1&sort="+sort).
			ThenGet("pack", "/packs/:id", "id = @main.0.id").
			ThenGet("meta", "/packs/:id/meta", "id = @pack.id").
			Blocks

		jsonCategories := gjson.GetBytes(blocks["pack"], "@this.categories").Array()
		categories := make([]string, 0, len(jsonCategories))
		for i, category := range jsonCategories {
			categories = append(categories, category.String())
			if i == 2 {
				break // Limit to 3
			}
		}

		err := htmxTrendingCardPack.ExecuteTemplate(writer, "component", packCard{
			Label: sort,
			Name:  gjson.GetBytes(blocks["pack"], "display.name").String(),
			Desc:  gjson.GetBytes(blocks["pack"], "display.description").String(),
			Versions: fmt.Sprintf(
				"%s — %s",
				gjson.GetBytes(blocks["pack"], "versions|@reverse|0.supports.0").String(),
				gjson.GetBytes(blocks["pack"], "versions|@reverse|0.supports|@reverse|0").String(),
			),
			Downloads: server.FormatNumber(
				gjson.GetBytes(blocks["meta"], "stats.downloads.total").Int(),
			),
			LastUpdated: timediff.TimeDiff(
				time.Unix(gjson.GetBytes(blocks["meta"], "stats.updated").Int()/1000, 1),
			),
			ThumbnailURL: fmt.Sprintf(
				"%s/packs/%s/gallery/0",
				server.API,
				gjson.GetBytes(blocks["main"], "@this.0.id").String(),
			),
			Categories: categories,
		})

		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}
