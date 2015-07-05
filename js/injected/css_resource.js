function CSSResource(url, ownerNode){
  this.url = url;
  this.element = ownerNode;
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
