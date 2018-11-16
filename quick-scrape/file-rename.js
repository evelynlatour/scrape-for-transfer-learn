/* eslint no-restricted-syntax: 0 */
/* eslint no-await-in-loop: 0 */

const fs = require(`fs`);
const colors = require(`colors`);


const renameFiles = async (path, baseFileName, fileStartNum) => {
  const imageFiles = fs.readdirSync(path);
  let fileNum = fileStartNum;
  for (const image of imageFiles) {
    await fs.rename(`${path}/${image}`, `${path}/${baseFileName}-${fileNum}.jpg`, (err) => {
      if (err) throw err;
    });
    fileNum += 1;
  }
  console.log(`done renaming ${imageFiles.length} images`.bold.green);
};

renameFiles(`${__dirname}/../scraped-images/long-sleeve`, `long-sleeve`, 279);
