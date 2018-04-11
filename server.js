const express = require('express')
const app = express()

const port = process.env.port || 3002
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const subscriptionKey = process.env.EL_SUBSCRIPTION_KEY

const cors = require('cors')

app.use(cors())

app.get('/', (req, res) => {
  res.send('on root')
})

app.listen(port, () => {
  console.log(`listening on ${port}`)
})