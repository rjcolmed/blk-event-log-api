const GtfsRealtimeBindings = require("gtfs-realtime-bindings")
const fs = require("fs")
const request = require("request")

const requestUri = process.env.MTA_GTFS

module.exports = res => {
  request({
    url: requestUri,
    method: 'get',
    encoding: null
  }, (err, response, body) => {
    const feed = GtfsRealtimeBindings.FeedMessage.decode(body)

    const results = feed.entity.map(entity => {
      if ( entity.trip_update ) {
        return entity.trip_update
      }
    })

    return res.json(results)

  })
}