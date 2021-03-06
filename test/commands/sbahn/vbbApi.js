import { expect } from 'chai'
import debug from 'debug'
import fetchMock from 'fetch-mock'
import VBBApi, { DEPARTURE_BOARD_API } from '../../../src/commands/sbahn/sbahnApi'
const log = debug('test')

const BOARD_RESPONSE = '{"Departure":[{"JourneyDetailRef":{"ref":"1|30191|9|86|1062016"},"Product":{"name":"      S7","num":"9478","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"00:41:00","date":"2016-06-02","track":"2","rtTime":"00:41:00","rtDate":"2016-06-02","rtTrack":"2","direction":"S Potsdam Hauptbahnhof","trainNumber":"9478","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|30218|11|86|1062016"},"Product":{"name":"      S7","num":"9800","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"00:42:00","date":"2016-06-02","track":"1","rtTime":"00:42:00","rtDate":"2016-06-02","rtTrack":"1","direction":"S Charlottenburg Bhf (Berlin)","trainNumber":"9800","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|44970|2|86|1062016"},"Product":{"name":"Bus 694 ","num":"2664","line":"694","catOut":"Bus     ","catIn":"BVP","catCode":"3","catOutS":"BVP","catOutL":"Bus     ","operatorCode":"ViP","operator":"Verkehrsbetrieb Potsdam GmbH","admin":"VIB---"},"name":"Bus 694 ","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"00:44:00","date":"2016-06-02","rtTime":"00:44:00","rtDate":"2016-06-02","direction":"Potsdam, Stern-Center/Gerlachstr.","trainNumber":"2664","trainCategory":"BVP"},{"JourneyDetailRef":{"ref":"1|30191|10|86|1062016"},"Product":{"name":"      S7","num":"9479","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:01:00","date":"2016-06-02","track":"2","rtTime":"01:01:00","rtDate":"2016-06-02","rtTrack":"2","direction":"S Potsdam Hauptbahnhof","trainNumber":"9479","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|30218|12|86|1062016"},"Product":{"name":"      S7","num":"9801","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:02:00","date":"2016-06-02","track":"1","rtTime":"01:02:00","rtDate":"2016-06-02","rtTrack":"1","direction":"S Charlottenburg Bhf (Berlin)","trainNumber":"9801","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|48549|2|86|1062016"},"Product":{"name":"Bus 694 ","num":"2667","line":"694","catOut":"Bus     ","catIn":"BVP","catCode":"3","catOutS":"BVP","catOutL":"Bus     ","operatorCode":"ViP","operator":"Verkehrsbetrieb Potsdam GmbH","admin":"VIB---"},"name":"Bus 694 ","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:04:00","date":"2016-06-02","rtTime":"01:04:00","rtDate":"2016-06-02","direction":"Potsdam, Konrad-Wolf-Allee/Sternstr.","trainNumber":"2667","trainCategory":"BVP"},{"JourneyDetailRef":{"ref":"1|30191|11|86|1062016"},"Product":{"name":"      S7","num":"9476","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:21:00","date":"2016-06-02","track":"2","rtTime":"01:21:00","rtDate":"2016-06-02","rtTrack":"2","direction":"S Potsdam Hauptbahnhof","trainNumber":"9476","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|30221|0|86|1062016"},"Product":{"name":"      S7","num":"9918","line":"S7","catOut":"S       ","catIn":"S-7","catCode":"0","catOutS":"S-7","catOutL":"S       ","operatorCode":"DBS","operator":"S-Bahn Berlin GmbH","admin":"DBS---"},"name":"      S7","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:22:00","date":"2016-06-02","track":"1","rtTime":"01:22:00","rtDate":"2016-06-02","rtTrack":"1","direction":"S Wannsee Bhf (Berlin)","trainNumber":"9918","trainCategory":"S-7"},{"JourneyDetailRef":{"ref":"1|48534|3|86|1062016"},"Product":{"name":"Bus 616 ","num":"3697","line":"616","catOut":"Bus     ","catIn":"Buv","catCode":"3","catOutS":"Buv","catOutL":"Bus     ","operatorCode":"ViP","operator":"Verkehrsbetrieb Potsdam GmbH","admin":"VIB---"},"name":"Bus 616 ","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:23:00","date":"2016-06-02","rtTime":"01:23:00","rtDate":"2016-06-02","direction":"S Babelsberg/Schulstr.","trainNumber":"3697","trainCategory":"Buv"},{"JourneyDetailRef":{"ref":"1|44971|3|86|1062016"},"Product":{"name":"Bus 694 ","num":"2668","line":"694","catOut":"Bus     ","catIn":"BVP","catCode":"3","catOutS":"BVP","catOutL":"Bus     ","operatorCode":"ViP","operator":"Verkehrsbetrieb Potsdam GmbH","admin":"VIB---"},"name":"Bus 694 ","type":"S","stop":"S Griebnitzsee Bhf","stopid":"A=1@O=S Griebnitzsee Bhf@X=13128925@Y=52393996@U=86@L=9230003@","stopExtId":"9230003","prognosisType":"PROGNOSED","time":"01:24:00","date":"2016-06-02","rtTime":"01:24:00","rtDate":"2016-06-02","direction":"Potsdam, Konrad-Wolf-Allee/Sternstr.","trainNumber":"2668","trainCategory":"BVP"}],"serverVersion":"1.6-SNAPSHOT","dialectVersion":"1.0"}'

describe('VBB Api', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('should get Griebnitzsee departure board', (done) => {
    const api = new VBBApi()
    fetchMock.get('*', {
      body: BOARD_RESPONSE,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    api.getDepartureBoardForStation('GRIEBNITZSEE')
      .then((departures) => {
        departures.forEach((departure) => {
          expect(departure).to.have.property('category')
            .that.is.a('string')
          expect(departure).to.have.property('direction')
            .that.is.a('string')
          expect(departure).to.have.property('name')
            .that.is.a('string')
          expect(departure).to.have.property('stop')
            .that.is.a('string')
          expect(departure).to.have.property('date')
          expect(departure.date._isAMomentObject).to.be.true
        })
        done()
      })
      .catch(done)
  })
})
