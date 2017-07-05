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
	
	// Basic headers for most requests. Required by API.
	headers = { 'Client-ID': '4g5an0yjebpf93392k4c5zll7d7xcec' };

// Get the access token and signature from the API for a channel.
function getAccessToken(channel) {
	return new Promise((resolve, reject) =>
		request({
			baseUrl: 'https://api.twitch.tv/api/',
			url: `channels/${channel}/access_token`,
			json: true,
			headers
		}, (err, res, body) => {
			if(res.statusCode !== 200) {
				return reject(body.message);
			}
			resolve(body);
		})
	);
}

// Get the M3U8 using the token and signature from the API for a channel.
function getM3U8(channel, qs) {
	return new Promise((resolve, reject) =>
		request({
			baseUrl: 'https://usher.ttvnw.net/api/',
			url: `channel/hls/${channel}.m3u8`,
			qs: Object.assign({ allow_source: true, allow_spectre: true }, qs),
			headers
		}, (err, res, body) => {
			if(res.statusCode !== 200) {
				return reject('Error retrieving m3u8');
			}
			resolve(body);
		})
	);
}

// Split an array into arrays of len size.
function chunk(arr, len) {
	return arr.reduce((p, n, i) => {
		if(p[p.length - 1].length < len) {
			p[p.length - 1].push(n);
		}
		else {
			p.push([ n ]);
		}
		return p;
	}, [[]]);
}

// Parse the M3U8 comment strings.
function parseM3U8Comment(n) {
	if(!n.startsWith('#')) {
		return n;
	}
	return n.split(':')[1]
		.split(',')
		.map(j => j.split('='))
		.reduce((p, [key = '', value = '']) => {
			let fixedKey = key.replace(/\-/g, '_').toLowerCase(),
				fixedValue = value.replace(/^"(.*)"$/, '$1');
			if(fixedValue === 'YES') {
				fixedValue = true;
			}
			else if(fixedValue === 'NO') {
				fixedValue = false;
			}
			p[fixedKey] = fixedValue;
			return p;
		}, {});
}

// Parse the full M3U8 data.
function parseM3U8(data) {
	data = data.split('\n')
		.filter(n => n);

	let headers = data.splice(0, 2)
			.slice(1)
			.map(parseM3U8Comment);

	data = chunk(data, 3)
		.map(d => {
			let f = d.map(parseM3U8Comment),
				url = f.pop();
			return Object.assign({ url }, ...f);
		});
	
	return { headers, data };
}

// Find a specific quality source from the data.
function findByQuality(quality, { data }) {
	return data.find(n => n.video === quality) || null;
}

// Get list of all of the available stream qualities from the data.
function getQualityList({ data }) {
	return data.map(n => n.video).join(' | ');
}

// Altogether now!
function getM3U8ForChannel(channel) {
	return getAccessToken(channel)
		.then(getM3U8.bind(null, channel))
		.then(parseM3U8);
}

module.exports = {
	getAccessToken,
	getM3U8,
	parseM3U8Comment,
	parseM3U8,
	findByQuality,
	getQualityList,
	getM3U8ForChannel
};
