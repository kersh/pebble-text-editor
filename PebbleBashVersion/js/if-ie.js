// Global variable to detect if browser is IE.
window.isMSIE = /*@cc_on!@*/0;

if(isMSIE)
{
    // fix for text editor
    loadScript("js/ie-pebble-text-editor.js");
}

function loadScript(url) {
    // adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // fire the loading
    head.appendChild(script);
}