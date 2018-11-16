/* eslint no-restricted-syntax: 0 */
/* eslint-env browser */
/* eslint no-await-in-loop: 0 */
/* eslint-disable no-loop-func */

const puppeteer = require(`puppeteer`);
const colors = require(`colors`);
const fs = require(`fs`);
const path = require(`path`);
const axios = require(`axios`);


const sweatersUrl = `https://www.saksfifthavenue.com/Women-s-Apparel/Sweaters/shop/_/N-52g463/Ne-6lvnb5?FOLDER%3C%3Efolder_id=2534374306442011`;

const getDataFromImageUrl = async () =>
  document.addEventListener(`click`, async (event) => {
    event.preventDefault();
    const imageUrl = event.path[0].src;
    const response = await fetch(imageUrl);
    const data = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.addEventListener(`loadend`, () => resolve(reader.result));
      reader.readAsDataURL(data);
    });
  });

const downloadImage = async (dataUrl) => {
  const filePath = `${__dirname}/../scraped-images/test.jpg`;
  const { data } = await axios.get(dataUrl, { responseType: `stream` });
  data.pipe(fs.createWriteStream(filePath));
  return new Promise((resolve, reject) => {
    data.on(`end`, resolve);
    data.on(`error`, reject);
  });
};

const getPage = async (url) => {
  const browser = await puppeteer.launch({ headless: false, timeout: 0 });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: `domcontentloaded` });
  await page.setViewport({ width: 1000, height: 800 });
  const imageData = await page.evaluate(downloadImage(getDataFromImageUrl));
  console.log(`data...`, imageData);
};


getPage(sweatersUrl);

/*
const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on(`close`, callback);
  });
};
*/

/*
const downloadImage = async (event) => {
  const filePath = `${__dirname}/../scraped-images/test.jpg`;
  const { data } = await axios.get(imageUrl, { responseType: `stream` });
  data.pipe(fs.createWriteStream(filePath));
  return new Promise((resolve, reject) => {
    data.on(`end`, resolve);
    data.on(`error`, reject);
  });
};
*/
