package server

import "fmt"

func FormatNumber(number int64) string {
	if number < 1_000 {
		return fmt.Sprintf("%d", number)
	}

	if number < 1_000_000 {
		return fmt.Sprintf("%dK", number/1_000)
	}

	return fmt.Sprintf("%dM", number/1_000_000)
}
