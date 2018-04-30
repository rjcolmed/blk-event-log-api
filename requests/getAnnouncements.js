const axios = require('axios')

let bldgId
let loginId
const deviceId = 1
const username = process.env.MANAGER_USERNAME
const password = process.env.MANAGER_PASSWORD

const deviceDetails = `{
	"AppVersion": "1",
	"DeviceId": "${deviceId}",
	"DeviceNickname": "Test Device",
	"OSVersion": "1",
	"HasBarcodeScanner": "false",
	"AppType": "2",
	"Device": "1",
	"Platform": "1"
}`
const baseUrl = process.env.BASE_WS_URL
const getBuildingsPath = `/?u=${username}&p=${password}&t=2&d=${deviceId}&format=json`

module.exports = (res) => {
	return axios({
		method: 'get', 
		url: `${baseUrl}${getBuildingsPath}`
	})
	.then(response => {
		loginId = response.data.Buildings[0].LoginId
		bldgId = response.data.Buildings[0].Id
		const announcementsPath = process.env.ANNOUNCEMENTS_PATH

		return axios({
			method: 'get',
			url: `${baseUrl}/Buildings/${bldgId}/ScrollingAnnouncements?u=${username}&p=${password}&l=${loginId}&d=${deviceId}&format=json`
		})
		.then(response => {
			res.json(response.data)
		}).catch(err => console.log(err))
	})
}