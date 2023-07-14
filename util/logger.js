const { createLogger, format, transports } = require("winston");
const path = require("path");

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const run = async (dbString) => {

const logger = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "..", "logs", "info.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.join(__dirname, "..", "logs", "warn.log"),
      level: "warn",
    }),
    new transports.File({
      filename: path.join(__dirname, "..", "logs", "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "..", "logs", "combined.log"),
    }),
  ],
});
return logger
}
exports.logger = run;
