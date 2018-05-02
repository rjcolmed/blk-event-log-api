const axios = require("axios")

module.exports = (res) => {
  axios({
    method: 'get',
    url: 'http://web.mta.info/status/serviceStatus.txt'
  })
  .then(response => {
    res.send(response.data)
  })
  .catch(err => console.log(err))
}

