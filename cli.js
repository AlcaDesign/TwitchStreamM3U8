/*
	Copyright 2017 Jacob "Alca" Foster

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to
	deal in the Software without restriction, including without limitation the
	rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	sell copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
	IN THE SOFTWARE.
*/

const request = require('request'),
	
	_ = require('./'),
	
	// Basic headers for most requests. Required by API.
	headers = { 'Client-ID': '4g5an0yjebpf93392k4c5zll7d7xcec' };

// If being run by command line.
if(require.main !== module) {
	return;
}

let args = process.argv.slice(2);

// Exit if no params.
if(args.length === 0) {
	process.exit(0);
}

let channel = args[0],
	// Defaulst to "chunked" quality.
	quality = args[1] || 'chunked';

// Main chain.
_.getM3U8ForChannel(channel)
	.then(quality === 'list' ?
			_.getQualityList :
			_.findByQuality.bind(null, quality)
		)
	.then(console.log)
	.catch(console.log);
