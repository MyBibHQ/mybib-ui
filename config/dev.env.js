var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  GOOGLE_API_KEY: '"AIzaSyBy6EHj_jVhOwsmwptKn3Vr6l5U5DkiGzA"',
  GOOGLE_API_CLIENT: '"154836275460-8v3csbevrfeu13fm3ou9j2h9t9bvd0rk.apps.googleusercontent.com"'
})
