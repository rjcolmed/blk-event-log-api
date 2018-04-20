const axios = require('axios')

module.exports = (occupanciesUri, accessControlKey, app, deviceId) => {
  let accessControlHeaders = {
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': accessControlKey,
    'Authorization': `Bearer ${app.locals.accessToken}`
  }

  return axios({
    method: 'get',
    url: occupanciesUri,
    headers: accessControlHeaders ,
    params: {
      "device-id": deviceId,
      $filter: 'IsActive eq true',
      $select: 'Id',
      $expand: 'PhysicalUnit($select=Number)',
      $count: true
    }
  })
  .then(response => {
    let nextLink = response.data['@odata.nextLink']
    console.log(response.data['@odata.nextLink'])
    let collectedOccupancies = []

    if ( nextLink ) {
      while (nextLink) {
        axios({
          method: 'get',
          url: nextLink,
          headers: accessControlHeaders
        }).then(res => {
          collectedOccupancies.push(res.data.value)
          nextLink = res.data['@odata.nextLink']
        }).catch(err => console.log('Err in while loop:', err))
      }
    } else {
      collectedOccupancies = response.data.value
    }

    return collectedOccupancies
  })
  .then(allOccupancies => {
    return allOccupancies.map(occupancy => {
      return {
        Id: occupancy.Id,
        Number: occupancy.PhysicalUnit ? occupancy.PhysicalUnit.Number : 'Undefined',
        Events: []
      }
    })
  })
  
}