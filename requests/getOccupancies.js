const axios = require('axios')
const requestUri = 'https://api.buildinglink.com/AccessControl/PropEmp/v1/UnitOccupancies'
let requestHeaders
let collectedOccupancies = []
let requestParams

module.exports = (accessControlKey, app, deviceId) => {
  requestHeaders = {
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': accessControlKey,
    'Authorization': `Bearer ${app.locals.accessToken}`
  }

  requestParams = {
    "device-id": deviceId,
    $filter: 'IsActive eq true',
    $select: 'Id',
    $expand: 'PhysicalUnit($select=Number)',
    $count: true,
    $skip: 0
  }

  return axios({
    method: 'get',
    url: requestUri,
    headers: requestHeaders,
    params: requestParams
  })
  .then(response => {
    
    if ( response.data['@odata.nextLink'] ) {
      return getAllNextLinks(response.data.value)
    } else {
      return response.data.value
    }

  }).then(occupancies => {
    console.log('Final occupancies', occupancies.length)
    return occupancies.map(occupancy => {
      return {
        Id: occupancy.Id,
        Number: occupancy.PhysicalUnit ? occupancy.PhysicalUnit.Number : 'Undefined',
        Events: []
      }
    })
  })
 
  
}

function getAllNextLinks(initialResults) {
  let allResults = [...initialResults] //this will contain all events
  console.log('In get all getAllNextLinks', allResults.length)

  const getNextLink = () => {
    requestParams['$skip'] += 100

    return fetchEvents()
      .then(response => {
        console.log(response.value.length)
        allResults = [...allResults, ...response.value]
        if ( response['@odata.nextLink'] ) {
          return getNextLink()
        } else {
          console.log('in else statememt')
          requestParams['$skip'] += 100
          return fetchEvents()
            .then(response => {
              allResults = [...allResults, ...response.value]
              console.log('All occupancies:', allResults.length)
              return allResults
            })
        
        }
      })
  }

  return getNextLink()
}

function fetchEvents() {
  console.log('in fetch')
  return axios({
    method: 'get',
    url: requestUri,
    headers: requestHeaders,
    params: requestParams
  }).then(response => response.data)
}

// function requestNextLink() {
//   requestParams['$skip'] += 100
 
//   return axios({
//     method: 'get',
//     url: requestUri,
//     headers: requestHeaders,
//     params: requestParams
//   })
//   .then(res => {
//     collectedOccupancies = [...collectedOccupancies, ...res.data.value]

//     if ( res.data['@odata.nextLink'] ) {
//       requestNextLink()
//     }
//     return collectedOccupancies = [...collectedOccupancies, ...res.data.value]

//   })
// }