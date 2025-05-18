package server

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/tidwall/gjson"
)

type User struct {
	Uid         string
	DisplayName string
	CleanName   string
	Role        string
	Pfp         string
}

type Url struct {
	Label string
	Href  string
}

func NewUrl(href string) Url {
	label := href
	label = strings.TrimPrefix(label, "https://")
	label = strings.TrimPrefix(label, "http://")

	path := strings.Split(label, "/")
	if len(path) < 3 {
		return Url{
			Label: strings.Join(path, "/"),
			Href:  href,
		}
	}

	left := path[0]
	right := path[len(path)-1]

	var builder strings.Builder
	builder.WriteString(left)
	builder.WriteString("/")
	for _, part := range path[1 : len(path)-1] {
		builder.WriteString(part[:1] + "..")
		builder.WriteString("/")
	}
	builder.WriteString(right)

	return Url{
		Label: builder.String(),
		Href:  href,
	}
}

type PackPageData struct {
	LoggedIn       bool
	Uid            string
	Id             string
	DisplayIcon    string
	DisplayWebPage string
	DisplayName    string
	DisplayDesc    string
	GallerySize    int
	Categories     []string
	StatsAdded     int64
	StatsUpdated   int64
	StatsDownTotal int64
	StatsDownToday int64
	StatsDownWeek  int64
	UrlDiscord     Url
	UrlSource      Url
	UrlHomepage    Url
	Owner          User
	Contributors   []User
	Body           string
	MinecraftMin   string
	MinecraftMax   string
	LatestVersion  string
}

func Pack(writer http.ResponseWriter, request *http.Request) {
	packId := request.PathValue("id")
	handler := NewHandler(writer, request)
	api := NewAPI(handler)

	var packData, packMeta []byte
	var wg sync.WaitGroup
	wg.Add(2)

	go func(result *[]byte) {
		*result = api.Get("/packs/%s", packId)
		wg.Done()
	}(&packData)

	go func(result *[]byte) {
		*result = api.Get("/packs/%s/meta", packId)
		wg.Done()
	}(&packMeta)

	wg.Wait()

	var isLoggedIn bool
	cookie, err := request.Cookie("logged_in")
	if err == nil {
		isLoggedIn = cookie.Value == "true"
	}
	data := PackPageData{
		LoggedIn:       isLoggedIn,
		Uid:            packId,
		Id:             gjson.GetBytes(packData, "id").String(),
		DisplayIcon:    gjson.GetBytes(packData, "display.icon").String(),
		DisplayWebPage: gjson.GetBytes(packData, "display.webPage").String(),
		DisplayName:    gjson.GetBytes(packData, "display.name").String(),
		DisplayDesc:    gjson.GetBytes(packData, "display.description").String(),
		GallerySize:    len(gjson.GetBytes(packData, "display.gallery").Array()),
		Categories:     []string{},
		StatsAdded:     gjson.GetBytes(packMeta, "stats.added").Int(),
		StatsUpdated:   gjson.GetBytes(packMeta, "stats.updated").Int(),
		StatsDownTotal: gjson.GetBytes(packMeta, "stats.downloads.total").Int(),
		StatsDownToday: gjson.GetBytes(packMeta, "stats.downloads.today").Int(),
		StatsDownWeek:  gjson.GetBytes(packMeta, "stats.downloads.pastWeek").Int(),
		UrlDiscord:     NewUrl(gjson.GetBytes(packData, "display.urls.discord").String()),
		UrlSource:      NewUrl(gjson.GetBytes(packData, "display.urls.source").String()),
		UrlHomepage:    NewUrl(gjson.GetBytes(packData, "display.urls.homepage").String()),
		Owner:          User{},
		Contributors:   []User{},
		Body:           "",
		MinecraftMin:   gjson.GetBytes(packData, "versions.0.supports.0").String(),
		MinecraftMax:   gjson.GetBytes(packData, "versions|@reverse|0.supports|@reverse|0").String(),
		LatestVersion:  gjson.GetBytes(packData, "versions|@reverse|0.name").String(),
	}

	for _, item := range gjson.GetBytes(packData, "categories").Array() {
		data.Categories = append(data.Categories, item.String())
	}

	contributors := gjson.GetBytes(packMeta, "contributors").Array()
	owner := gjson.GetBytes(packMeta, "owner").String()
	data.Contributors = make([]User, len(contributors))

	wg.Add(len(contributors))
	for i, item := range contributors {
		go func() {
			defer wg.Done()
			result := api.Get("/users/%s", item.String())
			user := User{
				Uid:         item.String(),
				DisplayName: gjson.GetBytes(result, "displayName").String(),
				CleanName:   gjson.GetBytes(result, "cleanName").String(),
				Role:        gjson.GetBytes(result, "role").String(),
				Pfp:         fmt.Sprintf("https://api.smithed.dev/v2/users/%s/pfp", item.String()),
			}
			if item.String() == owner {
				data.Owner = user
			}
			data.Contributors[i] = user
		}()
	}

	if data.DisplayWebPage == "" {
		data.Body = data.DisplayDesc
	} else {
		wg.Add(1)
		go func() {
			defer wg.Done()
			endpoint := strings.Split(data.DisplayWebPage, "?")[0]
			result := api.GetGeneric(endpoint+"?raw=1", "")
			data.Body = string(result)
		}()
	}

	wg.Wait()

	handler.ParseTemplate("build/pages/pack.html").ServePage(data)
}
