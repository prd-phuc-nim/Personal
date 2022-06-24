const start = async () => {
  const fs = require("fs");
  const axios = require("axios");

  const DEFAULT_SIZE_PER_PART = 25 * 1024 * 1024;

  const fileUrl = fs.readFileSync("urls.json");

  const urls = JSON.parse(fileUrl.toString())["presignedUrls"];

  const file = fs.readFileSync("input2.mp4");

  console.log(`Start process time: ${new Date(Date.now()).toUTCString()}`);
  var promises = [];
  urls.forEach((element, index) => {
    const startChunk = index * DEFAULT_SIZE_PER_PART;
    const endChunk = (index + 1) * DEFAULT_SIZE_PER_PART;
    const blob =
      index < urls.length
        ? file.slice(startChunk, endChunk)
        : file.slice(startChunk);
    promises.push(
      axios.put(element, blob, {
        maxContentLength: DEFAULT_SIZE_PER_PART * 20,
        maxBodyLength: DEFAULT_SIZE_PER_PART * 20,
      })
    );
  });

  console.log(`Start request time: ${new Date(Date.now()).toUTCString()}`);
  const resultUploadMultiParts = await Promise.all(promises);

  const parts = resultUploadMultiParts.map((part, index) => ({
    ETag: part.headers.etag,
    PartNumber: index + 1,
  }));
  console.log(`End at: ${new Date(Date.now()).toUTCString()}`);
  const data = {
    parts: parts,
  };
  fs.writeFile("etags.json", JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });

  console.log(`End process time: ${new Date(Date.now()).toUTCString()}`);
};
start();
