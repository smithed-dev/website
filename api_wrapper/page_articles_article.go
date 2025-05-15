package server

import (
	"net/http"

	"github.com/tidwall/gjson"
)

type ArticlePageData struct {
	LoggedIn  bool
	Id        string
	Title     string
	Category  string
	Banner    string
	Timestamp int64
	Content   string
}

func Article(writer http.ResponseWriter, request *http.Request) {
	articleId := request.PathValue("id")
	handler := NewHandler(writer, request).ParseTemplate("./build/articles__article.html")
	api := NewAPI(handler)

	result := api.Get("/articles/%s", articleId)

	var isLoggedIn bool
	cookie, err := request.Cookie("logged_in")
	if err == nil {
		isLoggedIn = cookie.Value == "true"
	}
	data := ArticlePageData{
		LoggedIn:  isLoggedIn,
		Id:        articleId,
		Title:     gjson.GetBytes(result, "title").String(),
		Category:  gjson.GetBytes(result, "category").String(),
		Banner:    gjson.GetBytes(result, "banner").String(),
		Timestamp: gjson.GetBytes(result, "datePublished").Int(),
		Content:   gjson.GetBytes(result, "content").String(),
	}

	handler.ServePage(data)
}
