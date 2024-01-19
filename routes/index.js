var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Redirect to the catalog home page
  res.redirect('/catalog');
});

module.exports = router;
