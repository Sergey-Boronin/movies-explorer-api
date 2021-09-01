const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiterParams } = require('./utils/limiterParams');
const routes = require('./routes/index');

const { DB_CONN = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;

// при работе на локальном сервере менять порт на 3005
const { PORT = 3000 } = process.env;

const limiter = rateLimit(limiterParams);

const app = express();

app.use(cors());
app.use(requestLogger);
app.use(limiter);
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

app.use(errorLogger);

app.use(errors());

app.use(require('./errors/CentralError'));

mongoose.connect(DB_CONN, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: true,
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
