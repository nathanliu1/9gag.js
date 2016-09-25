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
- [OBJECT Images](#images)
- [OBJECT Media](#media)
- [OBJECT Votes](#votes)
- [OBJECT Comments](#comments)

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
images     | [Image](#images)     | The images of the gag
media     | [Media](#media)     | ID of the gag | Only available if the gag is GIF
link     | String    | 9gag.com link of the gag
votes     | [Votes](#votes)     |  Contains the number of votes for the gag
comments     | [Comments](#comments)     |  Contains the number of comments for the gag

####Example
REST Call
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

###Images
An image object contains a gag image with various sizes.

####Properties
Properties | Type     | Description
--------- | --------- | ------- 
small     | String    | The picture of the gag, in small size
cover     | String    | The picture of the gag, in cover size
normal     | String    | The picture of the gag, in normal size
large     | String    | The picture of the gag, in large size

###Media
An media object contains the animation of a gag

####Properties
Properties | Type     | Description
--------- | --------- | ------- 
mp4     | string    | The animation of the gag, in .mp4
webm     | string    | The animation of the gag, in .webm

###Votes
An vote object contains the number of votes for a specific gag

####Properties
Properties | Type     | Description
--------- | --------- | ------- 
count     | Number    | Number of votes

###Comments
An comment object contains the number of comments for a specific gag

####Properties
Properties | Type     | Description
--------- | --------- | ------- 
count     | Number    | Number of comments

###Contribution
https://github.com/k3min/infinigag

