var express = require('express');
var router = express.Router();
var nvpApi = require('../nvpApi');
var r = require('request');

var redirectUrl = 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout';
var reutrnUrl = 'http://localhost:3001/nvp';
var cancelUrl = 'https://www.baidu.com';

router.post('/setec', function(req, res, next) {
  console.log(req.body);
  return SetExpressCheckout(req.body.amount, req.body.paytype, function (nvpJson){
    if (nvpJson.ACK != 'Success') {
      return res.send(nvpJson);
    }
    redirectUrl = redirectUrl + '&token=' + nvpJson.TOKEN;
    res.redirect(redirectUrl);
  });
});

router.get('/doec', function(req, res, next) {
  // console.log(req.query.token);
  // console.log(req.query.PayerID);
  DoExpressCheckout("10.00", req.query.token, req.query.PayerID, function(nvpJson){
    console.log(nvpJson);
    res.send(nvpJson);
  });
});

router.get('/createrpp', function(req, res, next) {
  CreateRecurringPaymentsProfile(req.query.token, function(nvpJson){
    console.log(nvpJson);
    res.send(nvpJson);
  });
});

router.get('/createbam', function(req, res, next) {
  CreateBillingAgreement(req.query.token, function(nvpJson) {
    console.log(nvpJson);
    res.redirect('../doreference.html?agreementid=' + nvpJson.BILLINGAGREEMENTID);
  });
});

router.post('/doref', function(req, res, next) {
  console.log(req.query.agreementid);
  DoReferenceTransaction(req.query.agreementid, req.body.amount, function(nvpJson) {
    // console.log(nvpJson);
    res.send(nvpJson);  
  });
});
/*
router.get('/getec', function(req, res, next) {
  var param = {

  }
  nvpApi.post(param);
  res.send('this is in get ec');
});

router.get('/', function(req, res, next) {
  console.log('test 302');
  res.redirect('http://www.baidu.com');
  // res.send('great!!');
});
*/

function SetExpressCheckout(amount, type, callback){
  var nvpJson = {
    'METHOD':'SetExpressCheckout',
    'PAYMENTREQUEST_0_AMT':amount,
    'PAYMENTREQUEST_0_PAYMENTACTION':'Sale',
    'L_PAYMENTREQUEST_0_DESC0':'this is first test item',
    'L_PAYMENTREQUEST_0_AMT0':amount,
    'RETURNURL': reutrnUrl,
    'CANCELURL': cancelUrl
  };

  if(type == 'recurring') {
    nvpJson['L_BILLINGTYPE0'] = 'RecurringPayments';
    nvpJson['L_BILLINGAGREEMENTDESCRIPTION0'] = 'This is a test for recurring payment';
    nvpJson['RETURNURL'] += '/createrpp';
  }

  if(type == 'onetime') {
    nvpJson['RETURNURL'] += '/doec';
  }

  if(type == 'reference') {
    nvpJson['RETURNURL'] += '/createbam';
    nvpJson['L_BILLINGTYPE0'] = 'MerchantInitiatedBillingSingleAgreement';
    nvpJson['L_BILLINGAGREEMENTDESCRIPTION0'] = 'This is a test for reference transcation';
  }

  return nvpApi.post(nvpJson, callback);
}

function GetExpressCheckout(token, callback) {
  nvpApi.post({'METHOD':'GetExpressCheckout', 'TOKEN':token}, callback);
}

function DoExpressCheckout(amount, token, payerid, callback){
  var method = 'DoExpressCheckoutPayment';
  nvpApi.post({
    'METHOD': method,
    'PAYMENTREQUEST_0_PAYMENTACTION':'Sale',
    'PAYMENTREQUEST_0_AMT':amount,
    'TOKEN': token,
    'PAYERID': payerid
  }, callback);
}

function CreateRecurringPaymentsProfile(token, callback) {
  var method = 'CreateRecurringPaymentsProfile';
  nvpApi.post({
    'METHOD': method,
    'TOKEN': token,
    'PROFILESTARTDATE':'2018-07-27T10:10:00Z',
    'DESC':'This is a test for recurring payment',
    'AMT':'11.00',
    'BILLINGPERIOD':'Day',
    'BILLINGFREQUENCY':'2'
  }, callback);
}

function CreateBillingAgreement(token, callback) {
  var method = 'CreateBillingAgreement';
  nvpApi.post({
    'METHOD': method,
    'TOKEN': token
  }, callback);
}

function DoReferenceTransaction(referenceid, amount, callback) {
  var method = 'DoReferenceTransaction';
  nvpApi.post({
    'METHOD': method,
    'PAYMENTACTION':'Sale',
    'REFERENCEID': referenceid,
    'AMT': amount
  }, callback);
}

module.exports = router;
