/*exports.myMiddleware = (req, res, next) => {
  req.name = 'Wes';
  next();
};
*/
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer   = require('multer'); // Validate file upload in the backend (extension, type etc...)
const jimp     = require('jimp');   // Make filenames unique
const uuid     = require('uuid');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({message: "That filetype isn't allowed!"}, false);
    }
  }
};


exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
}


exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // if there is no file to resize
  if(!req.file) {
    next(); // Skip to the next Middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  // Resize photo
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  console.log('After resize photo, keep going!');
  //Once we have written the photo to our system, keep going bro!
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  console.log('Create store works!');
  req.flash('success', `Successfully created ${store.name}. Care to leave a review ?`);
  res.redirect(`store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
  // 1. Find the store giving the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm they are the store's owner
  // 3. Render out the edit form, so the user can update the store
  res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
  // 0. Set location point
  req.body.location.type = 'Point';
  // 1. Find & Update store -> MongoDB method findOneAndUpdate(query, data, options)
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)
  // 2. Redirect them to the store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  // Check what is sending through the URL
  // If ERROR: Converting circular structure to JSON
  // is Because i tried to convert req, instead of req.params to a json
  //res.json(req.params);
  const store = await Store.findOne({ slug: req.params.slug });
  if(!store) return next();
  //res.json(store);
  res.render('store', { store, title: store.title });
}

exports.getStoreByTag = async (req, res) => {
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  res.render('tags', {tags, title: 'Tags', tag})
}
