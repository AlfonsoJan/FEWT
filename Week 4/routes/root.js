'use strict'

module.exports = async function (fastify, opts) {

  const enzymeContainer = await fastify.enzymeContainer();

  fastify.get('/api/v3/enzyme/:enzymeName', async function (request, reply) {
    const { enzymeName } = request.params;
    const result = enzymeContainer.getEnzym(enzymeName)
    if (result === undefined) {
      return {"Not found": "In the database"};
    }
    return {"enzyme name": enzymeName, "synonym": result.synonym, "site": result.site};
  })
}
