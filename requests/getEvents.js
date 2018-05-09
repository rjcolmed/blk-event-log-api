const axios = require('axios')
const requestUri = 'https://api.buildinglink.com/EventLog/PropEmp/v1/Events'
let requestHeaders
let collectedEvents = []
let requestParams
let nextLinkEvents = []
let nextLink

module.exports = (eventLogKey, app, deviceId, occupancies) => {
  requestHeaders = {
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': eventLogKey,
    'Authorization': `Bearer ${app.locals.accessToken}`
  }

  requestParams = {
    "device-id": deviceId,
    $filter: 'IsOpen eq true',
    $select: 'Id,TypeId,UnitOccupancyId',
    $expand: 'Type($expand=Group($select=name);$select=IconTypeId,GroupId)',
    $count: true,
    $skip: 0
  }

  return axios({
    method: 'get',
    url: requestUri,
    headers: requestHeaders,
    params: requestParams
  }).then(response => {
   
    if ( response.data['@odata.nextLink'] ) {
      return getAllNextLinks(response.data.value)
    } else {
      return response.data.value
    }

  }).then(events => {
    const occupanciesEvents = [...occupancies]

    occupanciesEvents.forEach(occupancy => {
      events.forEach(event => {
        if ( occupancy.Id === event.UnitOccupancyId && event.Type.GroupId === 1 ) {
          occupancy.Events.push({
            TypeId: event.TypeId,
            IconTypeId: event.Type.IconTypeId,
            Group: event.Type.Group.Name
          })
        }
      })
    })

    return occupanciesEvents.sort((a, b) => {
        return a.Number.toLowerCase().localeCompare(b.Number.toLowerCase())
      })
  })
}

function getAllNextLinks(initialResults) {
  let allResults = [...initialResults]

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
              console.log('All events:', allResults.length)
              return allResults
            })
        
        }
      })
  }

  return getNextLink()
}

function fetchEvents() {
  return axios({
    method: 'get',
    url: requestUri,
    headers: requestHeaders,
    params: requestParams
  }).then(response => response.data)
}