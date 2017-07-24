var $ = require("jquery");
require("gsap");

var SimpleSwiper = require("../index.js").SimpleSwiper;

/**
 * Normally of course all the JS code would go here 
 * and CSS code would go to .scss file, but for the purpose
 * of education I'll put all the code in .html file.
 */

global.SimpleSwiper = SimpleSwiper;
global.$ = $;
