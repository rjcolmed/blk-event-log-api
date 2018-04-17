const clientId = 'bldev-5a6f87d702a4a81fa809ff8c'
const baseUrl = 'https://auth.buildinglink.com/connect/authorize'
const redirectUri = 'http://localhost:3002/callback'
const scope = encodeURIComponent('api_identity offline_access access_control_property_employee_read event_log_prop_emp_read')

document.querySelector('#auth-link')
  .setAttribute('href', `${baseUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`)