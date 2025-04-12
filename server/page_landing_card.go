package server

import (
	"net/http"
)

type htmxPackCard struct {
	Uid        string
	Id         string
	Name       string
	Desc       string
	Versions   string
	Downloads  string
	Updated    string
	Categories []string
	Label      string
	HasGallery bool
}

func HTMXLandingCard(writer http.ResponseWriter, request *http.Request) {
	// handler := NewHandler(writer, request)
	// api := NewAPI(handler)
	//
	// sortBy := request.PathValue("sort")
	// switch sortBy {
	// case "trending", "newest":
	// default:
	// 	handler.writeErrBadRequest("Only /trending and /newest are accepted.")
	// 	return
	// }
	//
	// response := api.Get("main", "/packs?limit=1&sort=%s", sortBy)
	// packId := gjson.GetBytes(response.Data, "0.id").String()
	// if packId == "" {
	// 	handler.writeErrNotFound()
	// 	return
	// }
	//
	// responses := api.
	// 	AddBatch("pack", fmt.Sprintf("/packs/%s", packId)).
	// 	AddBatch("meta", fmt.Sprintf("/packs/%s/meta", packId)).
	// 	RunBatchTasks()
	//
	// jsonCategories := gjson.GetBytes(responses["pack"], "categories").Array()
	// categories := make([]string, 0, len(jsonCategories))
	// for i, category := range jsonCategories {
	// 	categories = append(categories, category.String())
	// 	if i == 2 {
	// 		break // Limit to 3
	// 	}
	// }
	//
	// pack := htmxPackCard{
	// 	Uid:  packId,
	// 	Id:   gjson.GetBytes(responses["pack"], "id").String(),
	// 	Name: gjson.GetBytes(responses["pack"], "display.name").String(),
	// 	Desc: gjson.GetBytes(responses["pack"], "display.description").String(),
	// 	Versions: fmt.Sprintf(
	// 		"%s — %s",
	// 		gjson.GetBytes(responses["pack"], "versions|@reverse|0.supports.0").String(),
	// 		gjson.GetBytes(responses["pack"], "versions|@reverse|0.supports|@reverse|0").String(),
	// 	),
	// 	Downloads: FormatNumber(
	// 		gjson.GetBytes(responses["meta"], "stats.downloads.total").Int(),
	// 	),
	// 	Updated: timediff.TimeDiff(
	// 		time.Unix(gjson.GetBytes(responses["meta"], "stats.updated").Int()/1000, 1),
	// 	),
	// 	Categories: categories,
	// 	Label:      sortBy,
	// 	HasGallery: len(gjson.GetBytes(responses["pack"], "display.gallery").Array()) > 0,
	// }
	//
	// handler.ParseTemplate("www/htmx/pack_card.html").ServePage(pack)
}
