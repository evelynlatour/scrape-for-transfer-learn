/* eslint no-restricted-syntax: 0 */
/* eslint-env browser */
/* eslint no-await-in-loop: 0 */
/* eslint-disable no-loop-func */

const puppeteer = require(`puppeteer`);
const colors = require(`colors`);
const fs = require(`fs`);
const axios = require(`axios`);

const downloadImage = async (urlArray, baseFileName, startingNum) => {
  console.log(`downloading images locally...`.bold.yellow);
  let firstFileNum = startingNum;
  for (const url of urlArray) {
    const filePath = `${__dirname}/../scraped-images/${baseFileName}/${baseFileName}-${firstFileNum}.jpg`;
    const { data } = await axios.get(url, { responseType: `stream` });
    data.pipe(fs.createWriteStream(filePath));
    await new Promise((resolve, reject) => {
      data.on(`end`, resolve);
      data.on(`error`, reject);
    });
    firstFileNum++;
  }
  console.log(`done downloading images!`.bold.green);
};

const runScrape = async (url, baseFileName, startingNum) => {
  try {
    const browser = await puppeteer.launch({ headless: true, timeout: 0 });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: `domcontentloaded` });
    await page.setViewport({ width: 1000, height: 800 });

    // Select option to show 180 images (or other num available)
    // await Promise.all([page.click(`#pc-top > div:nth-child(2) > a`), page.waitForNavigation()]);

    // Grab each img src on the page and push to array
    console.log(`grabbing image urls from site...`.bold.yellow);

    const getImageUrls = await page.evaluate(async () => {
      const images = await document.querySelectorAll(`div.image-container-large > a img`); // .map(img => img.getAttribute(`src`));
      const imageSources = [];
      for (const image of images) {
        const imgSrc = image.getAttribute(`src`);
        imageSources.push(imgSrc);
      }
      return imageSources;
    });
    console.log(`done getting image urls!`.bold.green);
    downloadImage(getImageUrls, baseFileName, startingNum);
    browser.close();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

const sweatersLongSleeveUrl = `https://www.saksoff5th.com/Women/Apparel/Sweaters/shop/_/N-4ztf3j/Ne-6ja3nn`;
const longSleeveUrl = `https://www.saksoff5th.com/Women/Apparel/Tops/shop/_/N-4zteytZ1z13xsi?Ne=395181059&FOLDER%3C%3Efolder_id=2534374302023685`;
const shortSleeveUrl = `https://www.saksoff5th.com/Women/Apparel/Tops/T-Shirts-and-Tanks/shop/_/N-4zti47Z1z13xs3?Ne=395181059&Ne=395181059&FOLDER%3C%3Efolder_id=2534374302027767`;
const activewearShortSleeveUrl = `https://www.saksoff5th.com/Women/Apparel/Activewear/shop/_/N-4ztf0mZ1z13xs3/Ne-6ja3nn?FOLDER%3C%3Efolder_id=2534374302023750#`;

runScrape(activewearShortSleeveUrl, `short-sleeve`, 600);
