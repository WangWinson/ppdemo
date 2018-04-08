var express = require('express');
var router = express.Router();
var braintree = require('braintree');

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    //NOTE: these id and keys are from Braintree Sandbox API Keys
    merchantId: 'hw2b5hxqwpw6869c',
    publicKey: 'dkw9zw2vh7yzx2py',
    privateKey: '4540334b77e1c39f26d5c06afd12935b'
});

router.post('/', function(req, res, next) {
  // Use the payment method nonce here
  console.log(req.body);
  var nonceFromTheClient = req.body.paymentMethodNonce;
  var amountTotal = req.body.amount;
  // Create a new transaction for $10
  var newTransaction = gateway.transaction.sale({
    amount: amountTotal,
    paymentMethodNonce: nonceFromTheClient,
    options: {
      // This option requests the funds from the transaction
      // once it has been authorized successfully
      submitForSettlement: true
    }
  }, function(error, result) {
      if (result) {
        res.render('transInfo', {tran: result.transaction});
        // res.send(result);
      } else {
        res.status(500).send(error);
      }
  });
});

//generate client token
router.get("/client_token", function (req, res, next) {
    gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});

module.exports = router;