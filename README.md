# Apptyped

This is a package that creates a fully typed SDK based on your Appwrite collections

- Build using `npm run build`
- Create `.env` with the following:
  - `APPWRITE_ENDPOINT` - The endpoint of your Appwrite instance
  - `APPWRITE_PROJECT_ID` - The ID of your Appwrite project
  - `APPWRITE_API_KEY` - An Appwrite API key is required to generate the types from your collections.
- Run `node lib/index g` to generate the fully typed SDK
