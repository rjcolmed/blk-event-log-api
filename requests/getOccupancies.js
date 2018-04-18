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
  }).then(allOccupancies => {
    return allOccupancies.data.value.map(occupancy => {
      return {
        Id: occupancy.Id,
        Number: occupancy.PhysicalUnit.Number,
        Events: []
      }
    })
  })
  
}