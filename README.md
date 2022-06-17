# Getting Started with Glints Assignment

FrontEnd : https://62ac27829b668e17c676dcef--glints-assignment.netlify.app/

BackEnd: https://nodejs-mongo-api-app.herokuapp.com/

BackEnd Repository : https://github.com/ArslanRamzan/glints-assignment-backend

## Tech Stack

FrontEnd: ReactJS, Typescript, Antd, s3  
BackEnd: NodeJS, Mongoose, Express

### `How images work`

Currently, some dummy images are uploaded. While image is changed, it is first uploaded to s3 and it's url is saved on backend. Same for profile photo and company logos. Images uploading is not funcional in offline mode

### `Unit Tests`

Unit Tests are witten for UserProfileView component to demonstrate the familiarity with test cases. 

### `How to run`

Navigate to browser, open https://62ac27829b668e17c676dcef--glints-assignment.netlify.app/ link, and here you can see the profiles card with the deisred data. For editing the information, click edit button at the bottom of each card to navigate to edit section. Editing is possible both in offline and online modes with the exception of images.
