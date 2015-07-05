function CSSResource(url){
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

CSSResource.prototype = new BaseResource();
CSSResource.prototype.constructor = CSSResource;

/*
 * Refresh the code
 */
CSSResource.prototype.refresh = function() {
  var cssElement = document.createElement('link');
  cssElement.setAttribute("type", "text/css");
  cssElement.setAttribute("rel", "stylesheet");
  cssElement.setAttribute("href", this.nonCacheURL());
  cssElement.setAttribute("media", this.media);

  $livePage.html.insertBefore(cssElement, this.element);
  $livePage.html.removeChild(this.element);

  this.element = cssElement;
}
