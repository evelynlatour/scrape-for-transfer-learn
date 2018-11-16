/* eslint no-restricted-syntax: 0 */
/* eslint-env browser */
/* eslint no-await-in-loop: 0 */
/* eslint-disable no-loop-func */

const puppeteer = require(`puppeteer`);
const colors = require(`colors`);
const fs = require(`fs`);
const axios = require(`axios`);
const { saksOff5th, carbon38, f21 } = require(`./scrape-urls`);

const placeholderUrl = `https://sspride.org/wp-content/uploads/2017/03/image-placeholder-500x500.jpg`;

const downloadImage = async (urlArray, baseFileName, startingNum) => {
  try {
    console.log(`downloading images locally...`.bold.yellow);
    let firstFileNum = startingNum;
    for (let url of urlArray) {
      if (!url.startsWith(`http` || `https`)) url = placeholderUrl; // in case a non-image gets through
      const filePath = `${__dirname}/../scraped-images/${baseFileName}/${baseFileName}-${firstFileNum}.jpg`;
      const { data } = await axios.get(url, { responseType: `stream` });
      data.pipe(fs.createWriteStream(filePath));
      await new Promise((resolve, reject) => {
        data.on(`end`, resolve);
        data.on(`error`, reject);
      });
      firstFileNum += 1;
    }
    console.log(`done downloading images!`.bold.green);
  } catch (err) {
    console.log(err);
  }
};


const runScrape = async (url, baseFileName, startingNum) => {
  try {
    const browser = await puppeteer.launch({ headless: false, timeout: 0 });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: `networkidle0` });
    await page.setViewport({ width: 1000, height: 800 });

    /** call a helper func here if needed * */


    console.log(`grabbing image urls from site...`.bold.yellow);
    const getImageUrls = await page.evaluate(async () => {
      const images = await document.querySelectorAll(`.p_item div:nth-child(2) > a img`);
      const imageSources = [];
      for (const image of images) {
        const imgAttr1 = image.getAttribute(`src`);
        // const imgAttr2 = image.getAttribute(`data-hover-image`);
        imageSources.push(imgAttr1);
      }
      return imageSources;
    });
    console.log(`done getting image urls!`.bold.green);
    console.log(getImageUrls);
    console.log(`There are ${getImageUrls.length} images`);
    downloadImage(getImageUrls, baseFileName, startingNum);
    browser.close();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};


runScrape(f21.longSleeveUrl, `long-sleeve`, 700);


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


async function carbon38Helper(page) {
  // Scroll more images into view & dismiss popup for Carbon38
  page.evaluate(() => {
    window.scrollBy(0, document.body.scrollHeight, { behavior: `smooth` }); // go to bottom
  });
  await page.waitFor(2000); // wait for page load more images
  page.evaluate(() => { // force pop-up to appear
    window.scrollBy(0, -200, { behavior: `smooth` });
  });
  await page.waitFor(4000); // wait for pop up to render on dom
  page.click(`#popup-subscribe-first > div > div > p`); // dismiss pop-up
  await page.waitFor(3000);
}

async function saksOff5thHelper(page) {
  // Select option to show 180 images (or other num available) on saksoff5th
  await Promise.all([page.click(`#pc-top > div:nth-child(2) > a`), page.waitForNavigation()]);
}

async function f21Helper(page) {
  page.evaluate(() => {
    window.scrollBy(0, document.body.scrollHeight, { behavior: `smooth` });
    window.scrollBy(0, -1000, { behavior: `smooth` });
  });
  await page.waitFor(4000);
  page.click(`#bx-element-743676-nENzD9J > button`); // dismiss pop-up
  await page.waitFor(4000);
  page.evaluate(() => {
    window.scrollBy(0, 500, { behavior: `smooth` });
  });
  await page.waitFor(4000);
}
