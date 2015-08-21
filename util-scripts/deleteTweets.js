var jsonfile = require('jsonfile')

var express = require('express');
var request = require("request");
var moment = require("moment");
var cors = require('cors');
var https = require('https');

var Firebase = require('firebase');
var fs = require('fs');

var _ = require('underscore');

var sentiment = require('sentiment');
var Canvas = require('canvas');
var quantize = require('quantize');
var chroma = require ('chroma-js');

var mission_photos = new Firebase("https://data-canvas.firebaseio.com/mission/tweets");
mission_photos.remove();
