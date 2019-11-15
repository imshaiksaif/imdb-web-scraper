const fs = require('fs');
const puppeteer = require('puppeteer');

async function todo() {
	let url = 'https://www.imdb.com/chart/top?ref_=nv_mv_250';
	let browser = await puppeteer.launch();
	let page = await browser.newPage();

	await page.goto(url, { waitUntil: 'networkidle2' });
	let data = await page.evaluate(() => {
		let movies = Array.from(document.querySelectorAll('.lister-list > tr'));

		return movies.reduce((acc, cv) => {
			acc[cv.querySelector('.titleColumn > a').innerText] = {
				stars: cv.querySelector('.imdbRating').innerText,
				director:
					cv.querySelector('.titleColumn > a').getAttribute('title').split(' ')[0] +
					cv.querySelector('.titleColumn > a').getAttribute('title').split(' ')[1],
				rating: cv.querySelector('.imdbRating > strong').getAttribute('title').split(' ')[3],
				releaseDate: cv.querySelector('.secondaryInfo').innerText,
				iconUrl: cv.querySelector('.posterColumn > a > img').getAttribute('src')
			};
			return acc;
		}, {});
	});

	fs.writeFile('./imdbMovies.json', JSON.stringify(data, null, 4), (err) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log('File has been created');
	});
	await browser.close();
}

console.log('Fetching Data');
todo();
