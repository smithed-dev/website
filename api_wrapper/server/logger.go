package server

import (
	"os"
	"time"

	"github.com/charmbracelet/log"
)

var logger = log.NewWithOptions(os.Stderr, log.Options{
	ReportCaller:    false,
	ReportTimestamp: true,
	TimeFormat:      time.TimeOnly,
	Prefix:          "",
})

func SetupLogger(debug bool) {
	if debug {
		logger.SetLevel(log.DebugLevel)
		logger.Debug("DEBUG mode is ON")
	}
	logger.Info("Serving at 127.0.0.1:8080...")
}
