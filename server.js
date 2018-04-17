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
const eventLogUri = 'https://api.buildinglink.com/EventLog/PropEmp/v1/Events'
const occupanciesUri = 'https://api.buildinglink.com/AccessControl/PropEmp/v1/UnitOccupancies'
const tokenEndpoint = 'https://auth.buildinglink.com/connect/token'
const grantType = 'authorization_code'

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
  return axios({
    method: 'get',
    url: occupanciesUri,
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': accessControlKey,
      'Authorization': `Bearer ${app.locals.accessToken}`
    },
    params: {
      "device-id": deviceId,
      $filter: 'IsActive eq true',
      $select: 'Id',
      $expand: 'PhysicalUnit($select=Number)',
      $top: 500,
      $count: true
    }
  }).then(response => {
    console.log(response.data)
  }).catch(err => console.log('Error getting occupancies ======> ', err))
})

app.listen(port, () => {
  console.log(`listening on ${port}`)
})