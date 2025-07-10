import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

async function startServer() {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }: any) => {
      // Handle both HTTP requests and WebSocket connections
      if (connection) {
        // WebSocket connection
        return connection.context;
      }
      // HTTP request
      return {
        req: req || {},
        headers: req?.headers || {}
      };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 Apollo Studio available at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(console.error); 