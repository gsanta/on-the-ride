/* Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released under the MIT license. This notice must remain intact. */
!function(a,b){"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?module.exports=b():a.store=b()}(this,function(){var a={checkType:function(a){return{}.toString.call(a).match(/\s([a-zA-Z]+)/)[1].toLowerCase()},set:function(a,b,c){("object"===this.checkType(b)||"array"===this.checkType(b))&&(b=JSON.stringify(b)),this.getStorage(c).setItem(a,b)},get:function(a,b){var c;try{c=JSON.parse(this.getStorage(b).getItem(a))}catch(d){c=this.getStorage(b).getItem(a)}return c},remove:function(a,b){this.getStorage(b).removeItem(a)},getStorage:function(a){return a?sessionStorage:localStorage}};return a});