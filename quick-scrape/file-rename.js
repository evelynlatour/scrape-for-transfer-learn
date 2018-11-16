/* eslint no-restricted-syntax: 0 */

const fs = require(`fs`);

const renameFiles = async (path, baseFileName, fileStartNum) => {
  const imageFiles = fs.readdirSync(path);
  console.log(imageFiles.length);
  let fileNum = fileStartNum;
  for (const image of imageFiles) {
    await fs.rename(`${path}/${image}`, `${path}/${baseFileName}-${fileNum}.jpg`, (err) => {
      if (err) throw err;
    });
    fileNum++;
  }
  console.log(`done renaming`);
};

renameFiles(`${__dirname}/../scraped-images/short-sleeve`, `short-sleeve`, 36);
