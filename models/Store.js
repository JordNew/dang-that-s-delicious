const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of wes, wes-1, wes-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

// storeSchema.pre('findOneAndUpdate', async function(next) {

//   // Find and compare original details to new ones.
//   const store = await this.findOne({});
//   if(!this._update.name || store.name === this._update.name) {
//     return next();
//   }

//   // See if any stores with slug already exist.
//   let   storeSlug = slug(this._update.name);
//   const slugRegEx = new RegExp(`^(${storeSlug})((-[0-9]*$)?)$`, 'i');
//   const storesWithSlug = await Store.find({slug: slugRegEx});

//   // Set slug with incremement if store exists.
//   if(storesWithSlug.length) storeSlug = `${storeSlug}-${storesWithSlug.length + 1}`;

//   // Update store with new slug.
//   const newSlug = promisify(this.update({}, { slug: storeSlug }), this);
//   await newSlug;
//   next();

// });

module.exports = mongoose.model('Store', storeSchema);