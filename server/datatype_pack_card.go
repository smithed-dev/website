package server

import (
	"time"

	"github.com/mergestat/timediff"
	"github.com/tidwall/gjson"
)

type PackCardData struct {
	Uid   string
	Id    string
	RawId string
	Label string

	IsLanding bool
	First     bool

	HasGallery bool
	Name       string
	Desc       string

	Author      string
	VersionFrom string
	VersionTo   string
	Categories  []string

	Downloads string
	Updated   string
}

func (datatype PackCardData) Load(data gjson.Result, index int) Datatype {
	categoriesArray := data.Get("data.categories").Array()
	categories := make([]string, 0, len(categoriesArray))
	i := 0
loop:
	for _, element := range categoriesArray {
		element := element.String()
		switch {
		case i == 2:
			break loop
		case element == "No Resource Pack":
		default:
			categories = append(categories, element)
		}
		i++
	}

	return PackCardData{
		Uid:         data.Get("id").String(),
		Id:          data.Get("data.id").String(),
		RawId:       data.Get("meta.rawId").String(),
		IsLanding:   datatype.IsLanding,
		Label:       datatype.Label,
		First:       index == 0,
		HasGallery:  data.Get("data.display.gallery").Exists(),
		Name:        data.Get("displayName").String(),
		Desc:        data.Get("data.display.description").String(),
		Author:      data.Get("meta.owner").String(),
		VersionFrom: data.Get("data.versions|@reverse|0.supports.0").String(),
		VersionTo:   data.Get("data.versions|@reverse|0.supports|@reverse|0").String(),
		Categories:  categories,
		Downloads:   FormatAmount(data.Get("meta.stats.downloads.total").Int()),
		Updated: timediff.TimeDiff(
			time.Unix(data.Get("meta.stats.updated").Int()/1000, 1),
		),
	}
}
