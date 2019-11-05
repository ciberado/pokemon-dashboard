const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');

const socketio = require('socket.io');

const monitor = require('./monitor.js');


const app = express();

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


let healthy = true;
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', { title: 'Express'  });
  });
  router.get('/health', (req, res) => {
    if (healthy === false) {
      res.status(500).send('I really don\' feel well.');
    } else {
      res.send('Looks everything is ok.');
    }
  });
  router.delete('/poison', (req, res) => {
    healthy = false;
    res.send('Done');
  });
  
app.use('/', router);

/// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

app.set('port', process.env.PORT || 80);

const server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

const io = socketio.listen(server);
console.log('Creating websocket server.');
let websockets = [];
io.sockets.on('connection', function(socket){
  console.log('New websocket client connection stablished.');
  websockets.push(socket);
});
io.sockets.on('disconnect', function(socket){
  console.log('Client disconnected.');
  websockets =  websockets.filter(s => s != socket);
});

monitor.on(monitor.NEW_BEAT_RECEIVED_EVENT, message => {
  websockets.forEach(socket => socket.emit('healthbeat', message))
});

monitor.start();

module.exports = app;
