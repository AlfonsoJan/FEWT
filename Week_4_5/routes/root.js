'use strict'

module.exports = async function (fastify, opts) {

  fastify.addContentTypeParser('text/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))

  fastify.decorate('notFound', (request, reply, text, status) => {
    let error = {}
    error[status] = text;
    reply.code(status).type('application/json').send(error)
  })

  fastify.setNotFoundHandler(fastify.notFound)

  const enzymeContainer = await fastify.enzymeContainer();

  fastify.get('/api/v3/enzyme/:enzymeName', async function (request, reply) {
    const { enzymeName } = request.params;
    const result = enzymeContainer.getEnzym(enzymeName.toUpperCase());
    if (result === undefined) {
      return fastify.notFound(request, reply, "Not found in the database!", 404);
    }
    return {"enzyme name": enzymeName.toUpperCase(), "synonym": result.synonym, "site": result.site};
  })


  fastify.post('/api/v3/getcuttingsites', async function (request, reply) {
    if (request.body.oligo.length < 10 | request.body.oligo.length > 100) {
      return fastify.notFound(request, reply, "Length of the sqeuence should between 10 and 100", 500);
    }
    enzymeContainer.sequence = request.body.oligo;
    let result = enzymeContainer.getCuttingSites();
    return result;
  })
}
