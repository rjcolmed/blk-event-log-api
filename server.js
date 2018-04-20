require('dotenv').config()
const express = require('express')
const app = express()
const qs = require('qs')
const axios = require('axios')

const port = process.env.port || 3002
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const eventLogKey = process.env.EL_SUBSCRIPTION_KEY
const accessControlKey = process.env.AC_SUBSCRIPTION_KEY
const deviceId = process.env.DEVICE_ID

const redirectUri = 'http://localhost:3002/callback'
const tokenEndpoint = 'https://auth.buildinglink.com/connect/token'

const getOccupancies = require('./requests/getOccupancies')
const getEvents = require('./requests/getEvents')

const cors = require('cors')

app.use(express.static('public'))
app.use(cors())

app.get('/', (req, res) => {
  res.sendFile('index')
})

app.get('/callback', (req, res) => {
  let data = qs.stringify({
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })

  return axios.post(
    tokenEndpoint, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  ).then(response => {
    app.locals.accessToken = response.data.access_token
    app.locals.refreshToken = response.data.refresh_token

    res.send('auth successful. make requests to /api/events.')
  }).catch(err => console.log('Access token error =====> ', err))
})

app.get('/api/events', (req, res) => {
  getOccupancies(accessControlKey, app, deviceId)
    .then(occupancies => {
      getEvents(eventLogKey, app, deviceId, occupancies)
        .then(events => res.json(events))
        .catch(err => console.log(err))
    })
    .catch(err => {
      console.log('An error occurred ======>', err)
      if ( err.response.status === 401  ) {
        console.log('need refresh')

        let refreshData = qs.stringify({
          grant_type: 'refresh_token',
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: app.locals.refreshToken
        })

        return axios.post(tokenEndpoint, refreshData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(response => {
          app.locals.accessToken = response.data.access_token

          res.redirect('/api/events')
        }).catch(err => {
          console.log('Refresh token error: ', err)
        })
      } else if ( err.response.status === 429 ) {
        res.send('Too many requests...')
      } else {
        console.log('This one fell through:', err)
      }
    })
})

app.listen(port, () => {
  console.log(`listening on ${port}`)
})