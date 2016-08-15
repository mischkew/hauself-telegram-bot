import debug from 'debug'
import _ from 'lodash'
import moment from 'moment'
import Api from 'fetch-api'
const log = debug('sbahnCommand:api')

const URL_API = 'http://demo.hafas.de/openapi/vbb-proxy/'
export const DEPARTURE_BOARD_API = 'departureBoard'
export const LOCATION_API = 'location.name'

export const GRIEBNITZSEE_ID = 'A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=009230003@B=1@V=3.9,@p=1464258076@'
export const STATION_IDS = {
  GRIEBNITZSEE: {
    locationId: GRIEBNITZSEE_ID,
    name: 'S Griebnitzsee'
  }
}

if (process.env.NODE_ENV === 'development') {
  if (!process.env.VBB_TOKEN) {
    throw new Error('Environment variable VBB_TOKEN is not defined.')
  }
}

export default class VBBApi extends Api {
  constructor(options = {}) {
    const extendedOptions = {
      ...options,
      query: {
        accessId: process.env.VBB_TOKEN,
        format: 'json'
      }
    }
    super(URL_API, extendedOptions)
  }

  predefinedStations() {
    return STATION_IDS
  }

  transformDepartures({ data }) {
    return data['Departure'].map((departure) => {
      log(departure)
      return {
        category: departure['Product'].catOut.trim(),
        name: departure.name.trim(),
        stop: departure.stop.trim(),
        direction: departure.direction,
        date: moment(departure.date + 'T' + departure.time)
      }
    })
  }

  //
  // API Calls
  //

  getLocation(locationId) {
    return this.get(LOCATION_API, {
      query: {
        id: locationId
      }
    }).then(({ data }) => data.StopLocation[0])
  }

  getDepartureBoard(locationId) {
    return this.get(DEPARTURE_BOARD_API, {
      query: {
        id: locationId
      }
    }).then(this.transformDepartures)
  }

  getDepartureBoardForStation(stationName) {
    return this.getDepartureBoard(STATION_IDS[stationName].locationId)
  }
}
