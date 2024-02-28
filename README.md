# Apptyped

This is a package that creates a fully typed SDK based on your Appwrite collections

- Build using `npm run build`
- Create `.env` with the following:
  - `APPWRITE_ENDPOINT` - The endpoint of your Appwrite instance
  - `APPWRITE_PROJECT_ID` - The ID of your Appwrite project
  - `APPWRITE_API_KEY` - An Appwrite API key is required to generate the types from your collections as well as using the server-side client
- Run `node lib/index g` to generate the fully typed SDK

> This SDK is compatible with Appwrite server version 1.4.x

### Example

```typescript
// Import location will depend on if you're using it for server-side or client-side
// Server-side SDK import
import { Databases, Client } from 'apptyped/server'
// Client-side SDK import
import { Databases, Client } from 'apptyped/client';

const client = new Client();
// Databases will return as an object of all your collections which can be access as shown below
const { BlogPosts } = new Databases(client);

// Fully typed queries can be accessed from .q of each collection
const data = await BlogPosts.list([
    BlogPosts.q.equal("published", true),
]);
```
