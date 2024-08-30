/**
 *  no-es6.js
 */

// Used to detect if current browser doesn't support es6

// Check for IE
const ua = window.navigator.userAgent;
const msie = ua.indexOf('MSIE '); // IE 10 or older
const trident = ua.indexOf('Trident/'); //IE 11
console.log('msie: ' + msie)
console.log('trident: ' + trident)
if(msie > 0 || trident > 0) {
    console.log('browser is ie');
    window.location = 'microsoft-edge:' + window.location;

    setTimeout(function() {
        window.location = "https://support.microsoft.com/en-us/topic/this-website-works-better-in-microsoft-edge-160fa918-d581-4932-9e4e-1075c4713595"
    }, 0);
} else {
    console.log('browser is not ie');
}