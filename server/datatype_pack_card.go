package server

import (
	"time"

	"github.com/mergestat/timediff"
	"github.com/tidwall/gjson"
)

type PackCardData struct {
	Uid   string
	Id    string
	Label string

	HasGallery bool
	Name       string
	Desc       string

	VersionFrom string
	VersionTo   string
	Categories  []string

	Downloads int64
	Updated   string
}

func (datatype PackCardData) Load(data gjson.Result) Datatype {
	return PackCardData{
		Uid:         data.Get("id").String(),
		Id:          data.Get("data.id").String(),
		Label:       datatype.Label,
		HasGallery:  data.Get("data.display.gallery").Exists(),
		Name:        data.Get("displayName").String(),
		Desc:        data.Get("data.display.description").String(),
		VersionFrom: data.Get("data.versions|@reverse|0.supports.0").String(),
		VersionTo:   data.Get("data.versions|@reverse|0.supports|@reverse|0").String(),
		Categories:  []string{},
		Downloads:   data.Get("meta.stats.downloads.total").Int(),
		Updated: timediff.TimeDiff(
			time.Unix(data.Get("meta.stats.updated").Int()/1000, 1),
		),
	}
}
