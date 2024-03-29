let http

if (process.env.BACKEND_PROTOCOL === 'https') {
  http = require('https')
} else {
  http = require('http')
}

const defaults = {
  host: process.env.BACKEND_HOST || 'localhost',
  port: process.env.BACKEND_PORT || 5100,
  method: 'GET'
}

const request = (opts, postData) => {
  const options = Object.assign({}, defaults, opts)

  return new Promise((resolve, reject) => {
    let req = http.request(options, (res) => {
      if (res.statusCode.toString()[0] === '2') {
        res.on('data', (b) => resolve(JSON.parse(b)))
      } else {
        reject(`Unexpected Status Code ${res.statusCode}`)
      }
    })

    req.setTimeout(1000, () => {
      reject('Timeout for backend service')
    })

    req.on('error', reject)

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

exports.contracts = (id) => request({ path: `/vertraege?partnerId=${id}` })
exports.templates = (contractId) => request({ path: `/vertrag/${contractId}/briefvorlagen` })
exports.recipients = (contractId) => request({ path: `/vertrag/${contractId}/briefempfaenger` })
