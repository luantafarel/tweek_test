Images upload API
Create an API to enable system users to securely upload images provided that they are authenticated.
Requirements
  The API must be written using Nodejs.
  The API must be deployable to AWS Lambda (you can either use a free aws account or use the serverless-offline library).
  The images must be stored into AWS S3 (you can either create a free aws account or use localstack).
  Think about security while developing your APIs (it's impossible to have a system 100% secure).
  Create a GitHub repository with your project.
Extra (optionals):
  Expose a User API to Register and Login system users.
  Extract image metadata (EXIF, IPTC) using exiftool (https://www.npmjs.com/package/exiftool).
  Store the extracted metadata as a JSON file in the same S3 location the image was saved.
Estimated time is 6 hours.
Please share the GitHub back to us when the code is completed.

The test was done using the idea of a serveless structure, it has 4 routes, /users/login, /users and /users/upload from POST methods and /hello GET for testing.