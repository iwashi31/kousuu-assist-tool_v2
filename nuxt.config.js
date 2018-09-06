module.exports = {
	head: {
		title: '工数入力支援ツール',
		meta: [
			{ charset: 'utf-8' },
			{ hid: 'description', name: 'description', content: '工数入力支援ツール v2' },
			{ name: 'twitter:card', content: 'summary' },
			{ name: 'twitter:site', content: '@iwashi31' },
			{ name: 'og:url', content: 'http://kousuu.iwashibowl.net' },
			{ name: 'og:title', content: "工数入力支援ツール" },
			{ name: 'og:description', content: "工数を集計するツール" },
			{ name: 'og:image', content: "http://kousuu.iwashibowl.net/img/iwashi.png" }
		]
	},
	modules: [
		'@nuxtjs/vuetify'
	],
	vuetify: {
	}
}
