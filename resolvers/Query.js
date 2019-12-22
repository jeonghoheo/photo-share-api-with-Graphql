const photos = require("../phtos");

module.exports = {
  totalPhotos: () => photos.length,
  allPhotos: () => photos
};
