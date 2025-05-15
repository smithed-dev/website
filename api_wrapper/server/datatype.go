package server

import (
	"fmt"

	"github.com/tidwall/gjson"
)

type Datatype interface {
	Load(data gjson.Result, i int) Datatype
}

func ForEach[T Datatype](template T, data []byte) []T {
	array := gjson.GetBytes(data, "@this").Array()
	result := make([]T, len(array))

	for i, item := range array {
		result[i] = template.Load(item, i).(T)
	}

	return result
}

func FormatAmount(amount int64) string {
	if amount < 1_000 {
		return fmt.Sprintf("%d", amount)
	}

	if amount < 1_000_000 {
		return fmt.Sprintf("%.1fK", float64(amount)/1_000)
	}

	return fmt.Sprintf("%.1fK", float64(amount)/1_000_000)
}
