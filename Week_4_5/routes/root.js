'use strict'

module.exports = async function (fastify, opts) {

  fastify.addContentTypeParser('text/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))

  const enzymeContainer = await fastify.enzymeContainer();

  fastify.get('/api/v3/enzyme/:enzymeName', async function (request, reply) {
    const { enzymeName } = request.params;
    const result = enzymeContainer.getEnzym(enzymeName.toUpperCase());
    if (result === undefined) {
      reply
        .code(404)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ 404: 'Not found in the database' })
        return;
    }
    reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({"enzyme name": enzymeName.toUpperCase(), "synonym": result.synonym, "site": result.site})
  })


  fastify.post('/api/v3/getcuttingsites', async function (request, reply) {
    if (request.body.oligo.length < 10 | request.body.oligo.length > 100) {
      reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ 500: 'Length of the sqeuence should between 10 and 100' })
        return;
    }
    if (!(request.body.oligo.match("[ATGC]+"))) {
      reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ 500: 'This is not a correct DNA sequence' })
      return;
    }
    enzymeContainer.sequence = request.body.oligo;
    let result = enzymeContainer.getCuttingSites();
    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(result)
  })
}
