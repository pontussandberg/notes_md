import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { readFileSync } from 'fs'
import express from 'express'
import http from 'http'
import cors from 'cors';
import bodyParser from 'body-parser'

import { resolvers } from './resolvers'
import { loginRouter } from './routes'

;(async () => {
  /**
   * Init express
   */
  const app = express()
  const httpServer = http.createServer(app)

  /**
   * Init apollo
   */
  const typeDefs = readFileSync('src/schema.graphql', { encoding: 'utf-8' })
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  /**
   * Start apollo
   */
  await server.start()

  /**
   * Server client with static
   */
  app.use(express.static('../client/build'))

  /**
   * Route graphql api
   */
  app.use(
    '/api',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  )
  
  /**
   * Route routes
   */
  app.use('/login', loginRouter)


  // Listen http
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000`)
})()
