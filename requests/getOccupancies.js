const axios = require('axios')
const occupanciesUri = 'https://api.buildinglink.com/AccessControl/PropEmp/v1/UnitOccupancies'
let accessControlHeaders
let collectedOccupancies = []
let accessControlParams

module.exports = (accessControlKey, app, deviceId) => {
  accessControlHeaders = {
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': accessControlKey,
    'Authorization': `Bearer ${app.locals.accessToken}`
  }

  accessControlParams = {
    "device-id": deviceId,
    $filter: 'IsActive eq true',
    $select: 'Id',
    $expand: 'PhysicalUnit($select=Number)',
    $count: true,
    $skip: 0
  }

  return axios({
    method: 'get',
    url: occupanciesUri,
    headers: accessControlHeaders,
    params: accessControlParams
  })
  .then(response => {
    collectedOccupancies = response.data.value
    return requestNextLink()
            .then(results => {
              accessControlParams['$skip'] += 100

              return axios({
                method: 'get',
                url: occupanciesUri,
                headers: accessControlHeaders,
                params: accessControlParams
              }).then(res => {
                return [...results, ...res.data.value]
              })
            })
  }).then(allOccupancies => {
    return allOccupancies.map(occupancy => {
      return {
        Id: occupancy.Id,
        Number: occupancy.PhysicalUnit ? occupancy.PhysicalUnit.Number : 'Undefined',
        Events: []
      }
    })
  })
 
  
}

function requestNextLink() {
  accessControlParams['$skip'] += 100
 
  return axios({
    method: 'get',
    url: occupanciesUri,
    headers: accessControlHeaders,
    params: accessControlParams
  })
  .then(res => {
    collectedOccupancies = [...collectedOccupancies, ...res.data.value]

    if ( res.data['@odata.nextLink'] ) {
      requestNextLink()
    }
    return collectedOccupancies = [...collectedOccupancies, ...res.data.value]

  })
}