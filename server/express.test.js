const request = require('supertest')
const server = require('./server');




beforeAll(() => {
  server = require('./server')
})

test('GET and returns 200', async () => {

    await request(server)

  .get('/')
    .expect(200)

})


afterAll(done => { server.close(done)})
