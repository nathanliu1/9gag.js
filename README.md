# 9gag.js - Unofficial API for 9gag.com
##Installation Guide
Pre-requisites: Node.js
```shell
$ cd 9gag.js
$ npm install
$ cd src
$ node 9gag.js
```

##Documentation
- [GET /gag/:gagId](#get-gaggagid)

### GET /gag/:gagId
Get data for a specific gag.

####Parameters
Name      | Type      | Default | Description
--------- | --------- | ------- | -----------
gagId     | String    | N/A     | ID of the gag

####Response
Name      | Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    |HTTP status code
message     | String    |  Message of the status code
id     | String    | ID of the gag
caption     | String    | Caption of the gag
images     | Image object    | The images of the gag
media     | Media object    | ID of the gag | Only available if the gag is GIF
link     | String    | 9gag.com link of the gag
votes     | Vote object    |  Contains the number of votes for the gag
comments     | Comments object    |  Contains the number of comments for the gag

####Example
REST Call:
```
localhost:3000/gag/aopAw22
```
Response
```json
{  
    "status":200,
    "message":"OK",
    "id":"aopAw22",
    "caption":"My whole life is a lie ...",
    "images":{  
        "small":"http://img-9gag-fun.9cache.com/photo/aopAw22_220x145.jpg",
        "cover":"http://img-9gag-fun.9cache.com/photo/aopAw22_460c.jpg",
        "normal":"http://img-9gag-fun.9cache.com/photo/aopAw22_460s.jpg",
        "large":"http://img-9gag-fun.9cache.com/photo/aopAw22_700b.jpg"
    },
    "media":{  
        "mp4":"http://img-9gag-fun.9cache.com/photo/aopAw22_460sv.mp4",
        "webm":"http://img-9gag-fun.9cache.com/photo/aopAw22_460svwm.webm"
    },
    "link":"http://9gag.com/gag/aopAw22",
    "votes":{  
        "count":12656
    },
    "comments":{  
        "count":628
    }
}
```


