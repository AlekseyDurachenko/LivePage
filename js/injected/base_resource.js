function BaseResource(url){
  this.url = url;

  // set the method, if it's a local file or html we need to check the HTML.
  this.method = 'HEAD';
  if (this.url.indexOf('file://') == 0 || $livePage.url.indexOf('file://') == 0 || $livePage.options.use_only_get == true) {
    this.method = 'GET';
  }

  this.headers = {
    "Etag": null,
    "Last-Modified": null,
    "Content-Length": null
  };
  this.cache = '';
  this.response = '';
  this.xhr = null;
}

/*
 * Generated a URL with a cache breaker in it.
 */
BaseResource.prototype.nonCacheURL = function() {
  if (this.url.indexOf('?') > 0) {
    return this.url + '&livePage=' + (new Date() * 1);
  }
  return this.url + '?livePage=' + (new Date() * 1);
}


/*
 * Checks if a newer version of the file is there.
 */
BaseResource.prototype.check = function(callback) {
  var _this = this;
  var _callback = callback;

  this.xhr = new XMLHttpRequest();

  this.xhr.open(this.method, this.nonCacheURL());

  this.xhr.onreadystatechange = function() {

    // If it 404s
    if (this.status == 404) {
      $livePage.removeResource(this.url);
    }

    if (this.readyState == 4){
      _callback();
    }

    if (this.readyState == 4 && this.status != 304) {
      // Pull all the headers
      this.getAllResponseHeaders();

      // Firstly, tidy up the code
      _this.response = _this.tidyCode(this.responseText);

      // If this is the first check, cache it and than move along.
      if (this.method != 'HEAD' && _this.cache == '' && _this.response != '') {
        _this.cache = _this.response;
        return;
      }

      // Compare the headers && responseText
      if (_this.checkHeaders() && _this.checkResponse()) {
        _this.refresh();
      }
    }
  }

  this.xhr.send();
}

/*
 * Cycles through the headers recieved looking for changes.
 */
BaseResource.prototype.checkHeaders = function() {
  if (this.method == 'GET' && (this.url.indexOf('file://') == 0 || $livePage.url.indexOf('file://') == 0)) { // If it's a file, it will always send bad headers. So check the content.
    return true;
  }

  var headersChanged = false;
  for (var h in this.headers) {
    if (this.headers[h] != null && (this.xhr.getResponseHeader(h) == null || this.headers[h] != this.xhr.getResponseHeader(h))) {
      headersChanged = true;
    }
    // Update the headers.
    this.headers[h] = this.xhr.getResponseHeader(h);
  }
  return headersChanged;
}

/*
 * Compares the responseText to the cached. 
 */
BaseResource.prototype.checkResponse = function() {
  if (this.method == 'HEAD' || (this.response != '' && this.cache != this.response)) {
    this.cache = this.response;
    return true;
  }
  this.cache = this.response;
  return false;
}

/*
 * Tidies up HTML (Removes comments and whitespace), if the users wants.
 */
BaseResource.prototype.tidyCode = function(html) {
  if ($livePage.options.tidy_html == true) {
    // Remove comments and whitespace.
    html = html.replace(/<!--([\s\S]*?)-->/gim, '');
    html = html.replace(/  /gim, ' ');
    html = html.replace(/(\r\n|\n|\r|\t\s)/gim, '');
  }

  if ($livePage.options.tidy_inline_html == true) {
    html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');
    //html = html.replace(/<style(.*?)>(.*?)<\/style>/gim, '');
    html = html.replace(/<input(.*?)hidden(.*?)>/gim, '');
  }
  return html;
}

/*
 * Refresh the code
 */
BaseResource.prototype.refresh = function() {
  // Now reload the page.
  try {
    // This can let us reload the page & force a cache reload.
    chrome.extension.sendMessage({
      action: 'reload'
    }, function() {});
  } catch (e) {
    // An error occoured refreshing the page with the chrome socket. Do it differently.
    document.location.reload($livePage.url);
  }
}

