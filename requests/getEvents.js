const axios = require('axios')

module.exports = (eventLogUri, eventLogKey, app, deviceId, occupancies) => {
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
  }).then(response => {
    const occupanciesEvents = [...occupancies]

    occupanciesEvents.forEach(occupancy => {
      response.data.value.forEach(event => {
        if ( occupancy.Id === event.UnitOccupancyId ) {
          occupancy.Events.push({
            TypeId: event.TypeId,
            IconTypeId: event.Type.IconTypeId,
            Group: event.Type.Group.Name
          })
        }
      })
    })

    return occupanciesEvents
  })
}