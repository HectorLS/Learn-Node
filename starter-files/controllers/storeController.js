/*exports.myMiddleware = (req, res, next) => {
  req.name = 'Wes';
  next();
};
*/
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
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

exports.upload = multer(multerOptions).single('photo');


exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Edit Store'});
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
  const store = await Store. findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)
  // 2. Redirect them to the store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
}
