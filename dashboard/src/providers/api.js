export class API {
  static API_URL = process.env.REACT_APP_API_URL
  static HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('FirebaseClientToken')}`
  }

  static get (route, params) {
    let url = new URL(this.API_URL + route)
    if (params) url = Object.keys(params).forEach(key => URL.searchParams.append(key, params[key]))
    return fetch(url, { method: 'get', headers: this.HEADERS })
  }

  static post (route, body) {
    return fetch(this.API_URL + route, { method: 'post', headers: this.HEADERS, body })
  }

  static put (route, body) {
    return fetch(this.API_URL + route, { method: 'put', headers: this.HEADERS, body })
  }

  static delete (route, body) {
    return fetch(this.API_URL + route, { method: 'delete', headers: this.HEADERS })
  }
}
