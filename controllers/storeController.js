const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions =  {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto) {
			next(null, true);
		} else {
			next({ message: 'That filetype isn\'t allowed!' }, false);
		}
	}
};

exports.homePage = (req, res) => { 
	console.log(req.name);
	req.flash('error', 'Whoops! Something went wrong');
	req.flash('info', 'Here is some info');
	req.flash('warning', 'Warning!');
	req.flash('success', 'Great success!');
  res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', {title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	// check if there is no new file to resize
	if (!req.file) {
		next(); // skip to the next middleware
		return;
	}
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async (req, res) => {
	req.body.author = req.user._id;
	const store = await (new Store(req.body)).save();
	req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
// 1. Query the database for a list of all stores
const stores = await Store.find();
	res.render('stores', {title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
	// 1. Find the store given the ID
	const store = await Store.findOne({ _id: req.params.id })
	// 2. Confirm they are the owner of the store
	// TODO
	// 3. Render out the edit form so the user can update their store
	res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
	// Set the location data to be a point
	req.body.location.type = 'Point';
	// Find and update the store
	const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
		new: true, // return the new store instead of the old one
		runValidators: true
	}).exec();
	req.flash('success', `Succesfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store >></a>`);
	// Redirect them to the store and tell them it worked
	res.redirect(`/stores/${store._id}/edit`); 
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) return next();
  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true }; // show either the stores with the currently selected tag, or the stores with at least one tag of any kind
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Tags', tag, stores });
};