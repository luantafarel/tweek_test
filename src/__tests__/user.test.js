const axios = require('axios');

process.env.NODE_ENV = 'test'

describe('Test user API', () => {
  let id
  let newUser = {
    "email": "users1@gmail.com",
    "password": "testing123",
    "name": "string",
    "telefone": [
      {
        "ddd": "031",
        "numero": "988960074"
      }
    ]
  }

  let token = ''

  let login = {
    "email": "users@gmail.com",
    "password": "testing123",
  }

  let badNewUser = {
    firstName: 'test',
    lastName: 'test'
  }

  let updateUser = {
    firstName: 'test2'
  }

  let badUpdateUser = {
    email: null
  }

  it('Create new user', async () => {
    await axios.post('http://192.168.99.100:3002/api/v1/auth/register', newUser)
      .then(function (res, err) {
        userId = res.data.id
        expect(res.status).toBe(201)
      })
  })

  it('Block new user with repeated email', async () => {
    await axios.post('http://192.168.99.100:3002/api/v1/auth/register', newUser)
      .catch(function (err) {
        expect(err.response.status).toBe(409)
      })
  })

  it('Block new user without required fields', async () => {
    await axios.post('http://192.168.99.100:3002/api/v1/auth/register', badNewUser)
      .catch(function (err) {
        expect(err.response.status).toBe(422)
      })
  })


  it('Login a user', async () => {
    await axios.post('http://192.168.99.100:3002/api/v1/auth/login', login)
      .then(function (res, err) {
        token = res.data.token
        expect(res.status).toBe(200)
      })
  })

  it('Get new user', async () => {
    axios({
      method: 'GET',
      url: `http://192.168.99.100:3002/api/v1/users/${id}`,
      headers: {
        'Authorization': token
      }
    })
      .then(function (res, err) {
        expect(res.status).toBe(200)
        expect(res.data.msg).toBe(`user with id ${id} fetched successfully`)
        user = res.body
      })
  })


  it('Update user', async () => {
    axios({
      method: 'PUT',
      url: `http://192.168.99.100:3002/api/v1/users/${id}`,
      headers: {
        'Authorization': token
      },
      data: updateUser
    })
      .then(function (res, err) {
        expect(res.status).toBe(200)
        expect(res.data.msg).toBe(`user with id ${id} fetched successfully`)
      })
  })

  it('Block email deletion', async () => {
    axios({
      method: 'PUT',
      url: `http://192.168.99.100:3002/api/v1/users/${id}`,
      headers: {
        'Authorization': token
      },
      data: badUpdateUser
    }).catch(function (err) {
      expect(err.response.status).toBe(405)
    })
  })

  it('Delete created user', async () => {
    axios({
      method: 'DELETE',
      url: `http://192.168.99.100:3002/api/v1/users/${id}`,
      headers: {
        'Authorization': token
      }
    }).then(function (res, err) {
      expect(res.status).toBe(200)
    })
  })
})