# 9GAG.js - Unofficial API for 9gag.com
##Installation Guide
```shell
cd 9gag.js
npm install
cd src
node 9gag.js
```
To test if the server is working, in your browser, type: 
```
localhost:3000/gag/aK3n8AQ
```
Server response should be successful, along with the following data:
```json
{  
   "status":200,
   "message":"OK",
   "data":[  
      {  
         "id":"aK3n8AQ",
         "image":"http://img-9gag-fun.9cache.com/photo/aK3n8AQ_700b.jpg",
         "title":"I already miss playing Gta San andreas"
      }
   ]
}
```
