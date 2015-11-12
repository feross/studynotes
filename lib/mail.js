var config = require('../config')
var debug = require('debug')('studynotes:email')
var nodemailer = require('nodemailer')
var secret = require('../secret')

var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: secret.gmail
})

var FROM = 'Study Notes <feross@studynotes.org>'
var TO = 'Feross Aboukhadijeh <feross@studynotes.org>'

/**
 * Send an email message.
 *
 *   var message = {
 *     from: '"Feross Aboukhadijeh" <feross@studynotes.org>',
 *     to: '"Feross Aboukhadijeh" <feross@studynotes.org>',
 *     subject: 'Subject',
 *     text: '',
 *     html:'<p><b>Hello</b> to myself</p>'
 *   }
 *
 * @param  {Object}   message
 * @param  {function=} cb
 */
exports.send = function (message, cb) {
  if (!cb) {
    cb = function (err) {
      if (err) throw err
    }
  }

  message.from = FROM
  if (!message.to) message.to = TO

  message.text += '\n\n' + config.emailFooter

  debug('Sending email: ' + message.subject)

  if (config.isProd) {
    transport.sendMail(message, cb)
  } else {
    debug('Skipping email (in dev environment)')
    debug(message.text)
    cb(null)
  }
}

exports.notifyAdmin = function (subject, obj, cb) {
  if (!cb) {
    cb = function (err) {
      if (err) throw err
    }
  }

  var message = {
    to: TO,
    subject: subject,
    text: obj && JSON.stringify(obj, null, '\t')
  }

  if (obj && obj.name) {
    message.subject += ': ' + obj.name
  }

  if (obj && obj.absoluteUrl) {
    message.text = obj.absoluteUrl + '\n\n' + message.text // prepend
  }

  exports.send(message, cb)
}