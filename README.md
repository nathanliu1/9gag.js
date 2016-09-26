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
Method | Endpoint
-------|---------
GET | [/gag/{gagId}](#get-gaggagid)
GET | [/{section}?subSection={subSection}&limit={limit}](#get-sectionsubsectionsubsectionlimitlimit)

Object Model |
------ |
[Images](#images) |
[Media](#media) | 
[Votes](#votes) |
[Comments](#comments) |

### GET /gag/{gagId}
Get data for a specific gag.

####Parameters
Key      | Required? | Value Type      | Default | Description
--------- | ------- |--------- | ------- | -----------
gagId     | ✓ |String    | N/A     | ID of the gag

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    |HTTP status code
message     | String    |  Message of the status code
gag | [Gag](#gag) | A gag 

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
    "gag":{
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
}
```

### GET /{section}?subSection={subSection}&limit={limit}
Get the gags from a particular section and sub-section

Currently availabe sections: 
> 'hot', 'trending', 'fresh', 'funny', 'wtf', 'gif', 'nsfw', 'gaming', 'anime-manga', 'movie-tv', 'cute', 'girl', 'awesome', 'cosplay', 'sport', 'food', 'ask9gag', 'timely'

Currently availabe sub-sections: 
> 'hot', 'fresh'

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
section    |✓ | String    | N/A     | The section of the gag
subSection  |  | String    | hot     | The sub-section of the gag
limit       | | Number     | 1 | The number of gags one would like to get

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
data     | Array | An array of [gag](#gag)

####Example
REST Call
```
localhost:3000/girl?subSection=hot&limit=2
```
Response
```json
{  
    "status":200,
    "message":"OK",
    "data":[{
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
    }, {
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
    }]
}
```

###Gag
Key | Value Type     | Description
------------|-------|-------
id     | String    | ID of the gag
caption     | String    | Caption of the gag
images     | [Image](#images)     | The images of the gag
media     | [Media](#media)     | ID of the gag (Only available if the gag is a GIF)
link     | String    | 9gag.com link of the gag
votes     | [Votes](#votes)     |  Contains the number of votes for the gag
comments     | [Comments](#comments)     |  Contains the number of comments for the gag

###Images
An image object contains a gag image with various sizes.

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
small     | String    | The picture of the gag, in small size
cover     | String    | The picture of the gag, in cover size
normal     | String    | The picture of the gag, in normal size
large     | String    | The picture of the gag, in large size

###Media
An media object contains the animation of a gag

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
mp4     | string    | The animation of the gag, in .mp4
webm     | string    | The animation of the gag, in .webm

###Votes
An vote object contains the number of votes for a specific gag

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
count     | Number    | Number of votes

###Comments
An comment object contains the number of comments for a specific gag

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
count     | Number    | Number of comments

##Contribution
https://github.com/k3min/infinigag

