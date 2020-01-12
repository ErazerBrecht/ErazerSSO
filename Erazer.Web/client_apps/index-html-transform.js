var globToRegExp = require('glob-to-regexp');

module.exports = (targetOptions, html) => {
  const regexp = globToRegExp('<link rel="stylesheet" href="styles.*css">', { flags: 'g' });
  const startIndexLink = html.search(regexp);
  const contentLink = html.match(regexp)[0];
  const startIndexEndOfBody = html.indexOf('</body>');
  
  const deferLoadingLink = 
  `<noscript id="deferred-styles">
    ${contentLink}
  </noscript>
  <script>
    var loadDeferredStyles = function() {
      var addStylesNode = document.getElementById("deferred-styles");
      var replacement = document.createElement("div");
      replacement.innerHTML = addStylesNode.textContent;
      document.body.appendChild(replacement)
      addStylesNode.parentElement.removeChild(addStylesNode);
    };
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    if (raf) 
      raf(function() { window.setTimeout(loadDeferredStyles, 0); });
    else 
      window.addEventListener('load', loadDeferredStyles);
  </script>`;
  
  return `${html.slice(0, startIndexLink)}
   ${html.slice(startIndexLink + contentLink.length, startIndexEndOfBody)}
   ${deferLoadingLink}${html.slice(startIndexEndOfBody)}`;
};

