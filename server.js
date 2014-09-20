var express = require('express');
var app = express();
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('map');
});

var server = app.listen(process.env.PORT || 8000, function() {
  console.log('listening');
});
