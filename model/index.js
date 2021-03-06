const auto = require('run-auto')
const config = require('../config')
const fs = require('fs')
const mongoose = require('mongoose')
const once = require('once')
const path = require('path')
const secret = require('../secret')
const sort = require('../lib/sort')

// Tell Mongoose to use ES6 native promises
mongoose.Promise = global.Promise

// Object that contains the exported models, useful for iterating
// over *only* the models, skipping methods like `connect`.
const models = exports.models = {}

const cache = exports.cache = {}

// Set up each Schema in the /model folder
const files = fs.readdirSync(__dirname)
files.forEach(function (file) {
  const name = path.basename(file, '.js')
  if (name === 'index' || name === 'plugin') return

  // Set Schema options
  const schema = require('./' + name)
  schema.set('autoIndex', config.isProd) // no index during dev (slow)

  // Create Model object from Schema
  const model = mongoose.model(name, schema)

  // Print index failures. This is useful when adding a new "unique" index and
  // there already exist duplicate keys in the database.
  model.on('index', function (err) {
    if (err) throw err
  })

  // Export the Model
  exports[name] = models[name] = model
})

exports.connect = function (cb) {
  cb || (cb = function () {})
  cb = once(cb)
  mongoose.set('debug', !config.isProd)

  mongoose.connect(
    'mongodb://' +
    secret.mongo.host + ':' +
    secret.mongo.port + '/' +
    secret.mongo.database,
    { poolSize: 20, useNewUrlParser: true, useUnifiedTopology: true }
  )
  mongoose.connection.on('error', cb)
  mongoose.connection.on('open', function () {
    loadCache(cb)
  })
}

function loadCache (done) {
  auto({
    courses: function (cb) {
      models.Course
        .find()
        .populate('notetypes')
        .exec(cb)
    },
    colleges: function (cb) {
      models.College
        .find()
        .exec(cb)
    }
  }, function (err, r) {
    if (err) return done(err)

    cache.courses = {}
    r.courses.forEach(function (course) {
      cache.courses[course._id] = course
    })

    cache.colleges = {}
    r.colleges.forEach(function (college) {
      cache.colleges[college._id] = college
    })
    cache.coursesByName = Object.values(cache.courses).sort(sort.byProp('name'))
    cache.coursesByHits = Object.values(cache.courses).sort(sort.byProp('hits', true))
    cache.collegesByName = Object.values(cache.colleges).sort(function (a, b) {
      // force common-app to sort first
      if (a.id === 'common-app') return -1
      if (b.id === 'common-app') return 1
      return sort.byProp('name')(a, b)
    })
    cache.collegesByShortName = Object.values(cache.colleges).sort(function (a, b) {
      // force common-app to sort first
      if (a.id === 'common-app') return -1
      if (b.id === 'common-app') return 1
      return sort.byProp('shortName')(a, b)
    })
    cache.collegesByRank = Object.values(cache.colleges).sort(sort.byProp('rank'))

    done(err)
  })
}
