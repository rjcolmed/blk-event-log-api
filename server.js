const express = require('express')
const app = express()

const port = process.env.port || 3002
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const subscriptionKey = process.env.EL_SUBSCRIPTION_KEY
const deviceId = process.env.DEVICE_ID

const redirectUri = 'http://localhost:3002/callback'
const eventLogUri = 'https://api.buildinglink.com/EventLog/PropEmp/v1/Events'
const tokenEndpoint = 'https://auth.buildinglink.com/connect/token'
const grantType = 'authorization_code'

const cors = require('cors')

app.use(express.static('public'))
app.use(cors())

app.get('/', (req, res) => {
  res.sendFile('index')
})

app.listen(port, () => {
  console.log(`listening on ${port}`)
})