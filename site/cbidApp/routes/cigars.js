var express = require('express');
var AWS = require('aws-sdk');
var moment = require('moment')
var router = express.Router();
var config = require('./../../../config.js')

AWS.config.update(config);

router.get('/', function(req, res, next) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var time = new Date().getTime() - (1000*60*60*24*7); //records updated within a week

  var params = {
    'TableName': 'cigarbid',
    'FilterExpression' : 'updateDate > :updateDate',
    'ExpressionAttributeValues': {
      ':updateDate' : time
    }
  };

  docClient.scan(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    }
    data.Items.forEach(function(e){
      e.formattedDate = moment(e.updateDate).format('YYYY/MM/DD HH:mm')
    });
    res.render('cigars', { title: 'CigarBid', results: data.Items });
  });
});

module.exports = router;