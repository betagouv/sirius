const express = require("express");
const bodyParser = require("body-parser");
const logMiddleware = require("./core/http/logMiddleware");
const errorMiddleware = require("./core/http/errorMiddleware");
const tryCatch = require("./core/http/tryCatchMiddleware");
const questionnairesApi = require("./questionnaires/questionnairesApi");
const contratsApi = require("./contrats/contratsApi");
const { version } = require("../package.json");

module.exports = async (components) => {
  const { db, config, logger } = components;

  const app = express();

  app.use(bodyParser.json());
  app.use(logMiddleware(logger));
  app.use(questionnairesApi(components));
  app.use(contratsApi(components));

  //Routes
  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let mongodbStatus;
      await db
        .collection("questionnaires")
        .stats()
        .then(() => {
          mongodbStatus = true;
        })
        .catch((e) => {
          mongodbStatus = false;
          logger.error("Healthcheck failed", e);
        });

      return res.json({
        version,
        env: config.env,
        healthcheck: {
          mongodb: mongodbStatus,
        },
      });
    })
  );

  app.use(errorMiddleware());

  return app;
};
