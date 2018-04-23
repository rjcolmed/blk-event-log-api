const axios = require('axios')
const eventLogUri = 'https://api.buildinglink.com/EventLog/PropEmp/v1/Events'
let eventLogHeaders
let collectedEvents = []
let eventLogParams

module.exports = (eventLogKey, app, deviceId, occupancies) => {
  eventLogHeaders = {
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': eventLogKey,
    'Authorization': `Bearer ${app.locals.accessToken}`
  }

  eventLogParams = {
    "device-id": deviceId,
    $filter: 'IsOpen eq true',
    $select: 'Id,TypeId,UnitOccupancyId',
    $expand: 'Type($expand=Group($select=name);$select=IconTypeId)',
    $count: true,
    $skip: 0
  }

  return axios({
    method: 'get',
    url: eventLogUri,
    headers: eventLogHeaders,
    params: eventLogParams
  }).then(response => {
    collectedEvents = response.data.value

    return requestNextLink()
            .then(results => {
              eventLogParams['$skip'] += 100

              return axios({
                method: 'get',
                url: eventLogUri,
                headers: eventLogHeaders,
                params: eventLogParams
              }).then(res => {
                return [...results, ...res.data.value]
              })
            })
  })
  .then(events => {
    const occupanciesEvents = [...occupancies]

    occupanciesEvents.forEach(occupancy => {
      events.forEach(event => {
        if ( occupancy.Id === event.UnitOccupancyId ) {
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

function requestNextLink() {
  eventLogParams['$skip'] += 100
 
  return axios({
    method: 'get',
    url: eventLogUri,
    headers: eventLogHeaders,
    params: eventLogParams
  })
  .then(res => {
    collectedEvents = [...collectedEvents, ...res.data.value]

    if ( res.data['@odata.nextLink'] ) {
      requestNextLink()
    }
    return collectedEvents = [...collectedEvents, ...res.data.value]
  })
}