const axios = require('axios')

module.exports = (eventLogUri, eventLogKey, app, deviceId) => {
  return axios({
    method: 'get',
    url: eventLogUri,
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': eventLogKey,
      'Authorization': `Bearer ${app.locals.accessToken}`
    },
    params: {
      "device-id": deviceId,
      $filter: 'IsOpen eq true',
      $select: 'Id,TypeId,UnitOccupancyId',
      $expand: 'Type($expand=Group($select=name);$select=IconTypeId)',
      $top: 500,
      $count: true
    }
  }).then(response => response.data)
    .catch(err => console.log('Error getting events ======> ', err))
}