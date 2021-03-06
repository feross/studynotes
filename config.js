const extend = require('xtend/mutable')

/**
 * Is site running in production?
 * @type {Boolean}
 */
const isProd = exports.isProd = process.browser
  ? !/^local/.test(window.location.hostname)
  : process.env.NODE_ENV === 'production'

/**
 * Website hostname
 * @type {string}
 */
exports.siteHost = isProd
  ? 'www.apstudynotes.org'
  : 'localhost:4000'

/**
 * Origin of the website
 * @type {string}
 */
exports.siteOrigin = (isProd ? 'https' : 'http') + '://' + exports.siteHost

/**
 * Price of paid products (in cents!)
 * @type {Object}
 */
exports.product = {
  pro: {
    price: 2900,
    desc: '100+ Top College Essays'
  },
  'review-proofreading': {
    price: 19900,
    desc: 'Essay Review (Proofreading)'
  },
  'review-standard': {
    price: 39900,
    desc: 'Essay Review (Standard)'
  },
  'review-premium': {
    price: 79900,
    desc: 'Essay Review (Premium)'
  }
}

/**
 * Stripe publishable token
 * @type {string}
 */
exports.stripe = isProd
  ? 'pk_live_uQgfjT84EYgqyXWasBY0xuOE'
  : 'pk_test_7PVccMkybStuChGcJD0HAi40'

const config = require('./config-node')
extend(exports, config)
