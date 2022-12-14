import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors';

import { readFileSync } from 'fs'
import bodyParser from 'body-parser'

import { resolvers } from './resolvers'

const app = express()
const httpServer = http.createServer(app)

const typeDefs = readFileSync('src/schema.graphql', { encoding: 'utf-8' })
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

await server.start()

const apiPath = '/api'
app.use(
  apiPath,
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
)

app.use(express.static('../client/build'))

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000${apiPath}`);