const axios = require('axios')

module.exports = (occupanciesUri, accessControlKey, app, deviceId) => {
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
    return response.data
  }).catch(err => console.log('Error getting occupancies ======> ', err))
}