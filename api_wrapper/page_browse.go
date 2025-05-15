package server

import (
	"net/http"
	"strings"
)

var browseLimitCount = 20

var GlobalVersions = genVersions()

type pageData struct {
	Label      string
	Href       string
	IsCurrent  bool
	IsEllipsis bool
}

type versionData struct {
	Version      string
	Snapshots    []string
	SnapshotLast int
}

type BrowsePageData struct {
	LoggedIn     bool
	Cards        []PackCardData
	Pages        []pageData
	Categories   []string
	CategoryLast int
	Versions     []versionData
	VersionLast  int
}

type BrowsePageParams struct {
	Search     string
	Page       int
	Categories []string
	Versions   []string
}

func Browse(writer http.ResponseWriter, request *http.Request) {
	handler := NewHandler(writer, request).ParseTemplate(
		"./build/browse.html",
		"./build/htmx/pack_card.html",
		"./build/htmx/browser.html",
	)
	var isLoggedIn bool
	cookie, err := request.Cookie("logged_in")
	if err == nil {
		isLoggedIn = cookie.Value == "true"
	}

	data := BrowsePageData{
		LoggedIn: isLoggedIn,
		Cards:    []PackCardData{},
		Pages:    []pageData{},
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
		Versions: genVersions(),
	}
	data.CategoryLast = len(data.Categories) - 1
	data.VersionLast = len(data.Versions) - 1

	queryPacks(handler, request, &data)

	cookie, err = request.Cookie("prefered-layout")
	if err == nil {
		if cookie.Value != "grid" {
			for i := range data.Cards {
				data.Cards[i].HasGallery = false
			}
		}
	}
	handler.ServePage(data)
}

func genVersions() []versionData {
	versions := []string{
		"1.21.5",
		"1.21.5-rc-2",
		"1.21.5-rc-1",
		"1.21.5-pre-3",
		"1.21.5-pre-2",
		"1.21.5-pre-1",
		"1.21.5-25w10a",
		"1.21.5-25w09b",
		"1.21.5-25w09a",
		"1.21.5-25w08a",
		"1.21.5-25w07a",
		"1.21.5-25w06a",
		"1.21.5-25w05a",
		"1.21.5-25w04a",
		"1.21.5-25w03a",
		"1.21.5-25w02a",
		"1.21.4",
		"1.21.4-rc3",
		"1.21.4-rc2",
		"1.21.4-rc1",
		"1.21.4-pre3",
		"1.21.4-pre2",
		"1.21.4-pre1",
		"1.21.4-24w46a",
		"1.21.4-24w45a",
		"1.21.4-24w44a",
		"1.21.3",
		"1.21.2",
		"1.21.2-rc2",
		"1.21.2-rc1",
		"1.21.2-pre5",
		"1.21.2-pre4",
		"1.21.2-pre3",
		"1.21.2-pre2",
		"1.21.2-pre1",
		"1.21.2-24w40a",
		"1.21.2-24w39a",
		"1.21.2-24w38a",
		"1.21.2-24w37a",
		"1.21.2-24w36a",
		"1.21.2-24w35a",
		"1.21.2-24w34a",
		"1.21.2-24w33a",
		"1.21.1",
		"1.21",
		"1.21-rc1",
		"1.21-pre4",
		"1.21-pre3",
		"1.21-pre2",
		"1.21-pre1",
		"1.21-24w21a",
		"1.21-24w20a",
		"1.21-24w19b",
		"1.21-24w19a",
		"1.21-24w18a",
		"1.20.6",
		"1.20.5",
		"1.20.5-rc3",
		"1.20.5-rc2",
		"1.20.5-rc1",
		"1.20.5-pre4",
		"1.20.5-pre3",
		"1.20.5-pre2",
		"1.20.5-pre1",
		"1.20.5-24w14a",
		"1.20.5-24w13a",
		"1.20.5-24w12a",
		"1.20.5-24w10a",
		"1.20.5-24w09a",
		"1.20.5-23w51b",
		"1.20.4",
		"1.20.4-rc1",
		"1.20.3",
		"1.20.3-rc1",
		"1.20.3-pre4",
		"1.20.2",
		"1.20.1",
		"1.20",
		"1.19.4",
		"1.19",
		"1.18.2",
		"1.18.1",
		"1.18",
		"1.17.1",
		"1.17",
	}

	var result = []versionData{}

	for _, version := range versions {
		if !strings.Contains(version, "-") {
			result = append(result, versionData{
				Version:   version,
				Snapshots: []string{},
			})
			continue
		}
		result[len(result)-1].Snapshots = append(
			result[len(result)-1].Snapshots,
			version,
		)
	}

	for _, version := range result {
		version.SnapshotLast = len(version.Snapshots) - 1
	}

	return result
}
