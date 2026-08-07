export type Locale = 'en' | 'zh-cn';

export interface Messages {
	line1: string;
	line2: string;
	line3: string;
	line4: string;
	line5: string;
	line6: string;
	poweredBy: string;
}

export const messages: Record<Locale, Messages> = {
	en: {
		line1: 'Hello! friend from {ip}.',
		line2: 'Today is {date}, {weekday}',
		line3: 'It is {temp}°C and {weather} at:',
		line4: '{city}.',
		line5: 'You are using {browser} on {os}.',
		line6: '{footnote}',
		poweredBy: 'Powered by Cloudflare Workers.',
	},
	'zh-cn': {
		line1: '你好！来自 {ip} 的朋友。',
		line2: '今天是 {date}，{weekday}',
		line3: '现在气温 {temp}°C，天气：{weather}',
		line4: '{city}。',
		line5: '你正在使用 {browser}，系统：{os}。',
		line6: '{footnote}',
		poweredBy: '由 Cloudflare Workers 驱动。',
	},
};

export function detectLocale(request: Request): Locale {
	const acceptLanguage = request.headers.get('accept-language') || '';
	const preferred = acceptLanguage
		.split(',')
		.map((part) => part.split(';')[0].trim().toLowerCase())
		.find((lang) => lang === 'zh' || lang.startsWith('zh-'));
	if (preferred) {
		return 'zh-cn';
	}
	if (request.cf?.country === 'CN') {
		return 'zh-cn';
	}
	return 'en';
}

export function format(template: string, vars: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}
