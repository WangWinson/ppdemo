var request = require('request');

var BASE_API_SANDBOX = 'https://api-3t.sandbox.paypal.com/nvp';

var cred = {
  USER: 'wwnvptest_api1.126.com',
  PWD: 'AAD82XLUZB398EDS',
  SIGNATURE: 'ASWhbVMpq2fc-TpHUF6RY.1SZ5YLAKQCf8KLE97yxlCFWzsIMsfk1Xkz',
  VERSION: '84.0'
};

var nvpApi = {};

nvpApi.post = function (param, callback) {
  console.log('!!-----------------------');
  console.log(param);
  var paramStr = parseNvp(cred) + '&' + parseNvp(param);
  console.log(paramStr);
  return request.post({
      url: BASE_API_SANDBOX,
      body: paramStr
    }, function (err, res, body){
      if(err) {
        console.log(err);
        // return err;
      }
      console.log(res.statusCode);
      console.log('-----------------------');
      console.log(body);
      var nvpJson = fromNvp(body);
      console.log(nvpJson);
      callback(nvpJson);
    });
}

var parseNvp = function(nvpJson){
  var nvp = [];
  for(k in nvpJson) {
    var item = k + '=' + nvpJson[k];
    nvp.push(item);
  }
  return nvp.join('&');
}

var fromNvp = function(nvpStr){
  var nvpJson = {};
  var items = nvpStr.split('&');
  for(var i=0;i<items.length;i+=1){
    var kv = items[i].split('=');
    var k = kv[0];
    var v = kv[1];
    nvpJson[k] = v;
  }
  return nvpJson;
}

nvpApi.parseNvp = parseNvp;

module.exports = nvpApi;
