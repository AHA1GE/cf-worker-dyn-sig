import { UAParser } from 'ua-parser-js';
import { config } from './config';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// return 
		return handleRequest(request);
	},
};

async function handleRequest(request: Request) {
	const requestUrl = new URL(request.url);
	switch (requestUrl.pathname.toLowerCase()) {
		case "/":
			return await dynamicSignature(request);
		case "/robots.txt":
			return new Response( //use tobotsTXT from config, cache 1 year inmutable
				config.robotsTXT,
				{ headers: { "Content-Type": "text/plain", "Cache-Control": "max-age=31536000, immutable" } }
			);
		case "/ads.txt":
			return new Response( //use adsTXT from config, cache no cache
				config.adsTXT,
				{ headers: { "Content-Type": "text/plain", "Cache-Control": "no-cache" } }
			);
		case "/favicon.ico":
			return new Response( //use faviconAddress from config, cache 1 year inmutable
				await fetch(config.faviconAddress + "favicon.ico").then((res) => res.blob()),
				{ headers: { "Content-Type": "image/x-icon", "Cache-Control": "max-age=31536000, immutable" } }
			);
		case "apple-touch-icon.png":
			return new Response( //use faviconAddress from config, cache 1 year inmutable
				await fetch(config.faviconAddress + "apple-touch-icon.png").then((res) => res.blob()),
				{ headers: { "Content-Type": "image/png", "Cache-Control": "max-age=31536000, immutable" } }
			);
		default:
			//return dynamicSignature with footNote=pathName, remove the first char '/' and suffix after last '.'
			return await dynamicSignature(request, requestUrl.pathname.substring(1).split('.').slice(0, -1).join('.'));
	}

}

async function dynamicSignature(request: Request, footNote?: string) {

	// console.log(request.cf);

	// ua
	const ua: string = request.headers.get("user-agent") || '';
	const parser = new UAParser(ua);
	const result = parser.getResult();
	const uaData = {
		os: result.os.name + " " + result.os.version,
		browser: result.device.model + "-" + result.browser.name + " " + result.browser.version
	}

	// use cloudlfare provided location
	const latitude = request.cf?.latitude;
	const longitude = request.cf?.longitude;
	// use ip
	const ip = request.headers.get("cf-connecting-ip") || '';

	// get weather data
	const token = 'd4f93a05712347fff27c72ed10382d2d5c795e2c';
	const weatherEndpoint = "https://api.waqi.info/feed";
	let weatherApi = `${weatherEndpoint}/geo:${latitude};${longitude}/?token=${token}`;
	const weatherInit = { headers: { "content-type": "application/json;charset=UTF-8", }, };
	const weatherResponse = await fetch(weatherApi, weatherInit);
	const content: any = await weatherResponse.json();
	const weatherData = content.data;

	// get  ip data
	const ipApiAddress = 'http://ip-api.com/json/'
	const ipResponse = await fetch(ipApiAddress + ip);
	const ipContent: any = await ipResponse.json();
	// prepare  text, if regionName is same as city, do not repeat
	let ipDataText: string;
	if (ipContent.regionName === ipContent.city) {
		ipDataText = `${ipContent.country}, ${ipContent.regionName}`;
	} else {
		ipDataText = `${ipContent.country}, ${ipContent.regionName}, ${ipContent.city}`;
	}
	const ipData = {
		country: ipContent.country,
		regionName: ipContent.regionName,
		city: ipContent.city,
		ipText: ipDataText
	}

	// summary
	const finalData = {
		country: ipData.country,
		region: ipData.regionName,
		city: ipData.city,
		ipText: ipData.ipText,
		geoCity: weatherData.city.name,
		aqi: weatherData.aqi,
		temperature: weatherData.iaqi.t?.v,
		os: uaData.os,
		browser: uaData.browser
	}

	/****************************************************************
	const location = { lat: ipData.lat, lon: ipData.lon }
	//use location to determine weather
	const weatherApiAddress = `https://api.open-meteo.com/v1/forecast?`;
	const weatherApiParams = `&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
	const weatherResponse = await fetch(weatherApiAddress + `latitude=${location.lat}&longitude=${location.lon}` + weatherApiParams);
	const weatherData: any = await weatherResponse.json();
	const weather = weatherData.current.weather_code;
	const temperature = weatherData.current.temperature_2m;

	// today in history
	const todayResponse = await fetch('https://xhboke.com/mz/today.php');
	const todayData = await todayResponse.json();
	const today = todayData.cover.title;
	****************************************************************/


	/****************************************************************
	 * REWRITED USING CLOUDLFARE WORKER IMAGE API
	 * 
	let img = await Jimp.read('./xhxh.jpg');
	let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
	img.print(font, 10, 10, 'Welcome, friend from ' + country + '-' + region);
	img.print(font, 10, 50, 'Today is ' + new Date().toLocaleDateString() + ', ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]);
	img.print(font, 10, 90, 'Your IP is: ' + ip + ' ' + weather + ' ' + temperature + '℃');
	img.print(font, 10, 130, 'You are using ' + os);
	img.print(font, 10, 170, 'Your browser is ' + browser);
	img.print(font, 10, 210, footNote ? footNote : 'Powered by Cloudflare Workers');
	const buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
	return new Response(buffer, {
		headers: {
			'Content-Type': 'image/jpeg'
		}
	});
	****************************************************************/


	const text = {
		// line1: 'Hello! friend from ' + finalData.country + ' ' + finalData.region + ' ' + finalData.city,
		line1: `Hello! friend from ${finalData.ipText}.`,
		// line2: 'Today is ' + new Date().toLocaleDateString() + ', ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
		line2: `Today is ${new Date().toLocaleDateString()}, ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}`,
		// line3: 'The temprature at city of ' + finalData.geoCity + ' is' + finalData.temperature + '℃',
		line3: `The temprature at ${finalData.geoCity} is ${finalData.temperature}℃`,
		// line4: 'You are using ' + finalData.os,
		line4: `You are using ${finalData.os}.`,
		// line5: 'Your browser is ' + finalData.browser,
		line5: `Your browser is ${finalData.browser}.`,
		line6: footNote ? footNote : 'Powered by Cloudflare Workers.'
	}

	// use cloudflare worker image api
	const tti = 'https://text-to-image.examples.workers.dev/?' //text To Image Api Address
	const imageURL = 'https://github.com/AHA1GE/IP/blob/master/xhxh.jpg?raw=true';
	const draw: RequestInitCfPropertiesImageDraw[] = [ //draw text line by line, encode the text to uri first
		{
			url: tti + encodeURIComponent(text.line1),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 20,
		},
		{
			url: tti + encodeURIComponent(text.line2),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 55,
		},
		{
			url: tti + encodeURIComponent(text.line3),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 90,
		},
		{
			url: tti + encodeURIComponent(text.line4),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 125,
		},
		{
			url: tti + encodeURIComponent(text.line5),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 160,
		},
		{
			url: tti + encodeURIComponent(text.line6),
			height: 27,
			fit: 'contain',
			left: 15,
			top: 185,
		},
	];

	const finalResponse = await fetch(imageURL, {
		cf: {
			image: {
				width: 500,
				height: 210,
				draw: draw,
			},
		},
	});
	console.log(finalResponse); //dev
	// return finalImg;
	if (finalResponse.ok || finalResponse.redirected) {
		return finalResponse
	} else {
		// Change to a URL on your server
		return fetch("https://filesamples.com/samples/image/jpg/sample_640%C3%97426.jpg")
	}
}