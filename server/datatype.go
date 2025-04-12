package server

import "github.com/tidwall/gjson"

type Datatype interface {
	Load(data gjson.Result) Datatype
}

func ForEach[T Datatype](template T, data []byte) []T {
	array := gjson.GetBytes(data, "@this").Array()
	result := make([]T, len(array))

	for i, item := range array {
		result[i] = template.Load(item).(T)
	}

	return result
}
