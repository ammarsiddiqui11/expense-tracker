How to run:-
1. install dependencies:-
For Backend
(1: git init 2: npm install axios bcryptjs cors dotenv express jsonwebtoken mongoose nodemailer
3:npm install -D nodemon)
For Frontend (npm i axios tailwindcss @tailwindcss/vite)
3. run the backend using nodemon(npm run dev)
4. run the frontend (npm run dev),note:-Run the frontend and backend simultaneously by splitting the terminal
5. you will be redirected to login page,if you havent logged in before signup 
6. to validate the signup it will ask for the otp which would be in you inbox of the given mail(currently not working due to some issue with the sandbox mail service)
7. as the mail service not working you will get the otp in your backend console,paste the otp and you'll be redirected to signin page after signin you can access the dashboard
