var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var methodOverride = require("method-override");
var logger = require('morgan');
var rfs = require("rotating-file-stream");
var sequelize = require("./models").sequelize;

var app = express();

/* Morgan 셋팅 */
const logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //sync붙으면 동기화처리 안붙으면 비동기! 이놈 리턴값은 true/false
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
}); //인터벌이 1day 하루지나면 사라짐 로그 디렉토리에 접속기록 저장
// create a write stream (in append mode)
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), { flags: 'a' }); //이놈은 무제한?
// setup the logger
app.use(logger('combined', { stream: accessLogStream }));

/* Method-Override 셋팅 갖다붙혀 */
app.use(methodOverride('X-HTTP-Method')) //          Microsoft
app.use(methodOverride('X-HTTP-Method-Override')) // Google/GData
app.use(methodOverride('X-Method-Override')) //      IBM
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

/* Sequelize */
sequelize.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.pretty = true;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


module.exports = app;
