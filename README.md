# 9gag.js - Unofficial API for 9gag.com
##Installation Guideline
Pre-requisites: Node.js
```shell
$ cd 9gag.js
$ npm install
$ cd src
$ node 9gag.js
```
For developing and debugging, use ```nodemon 9gag.js``` instead of ```node 9gag.js```. ```nodemon``` is a useful tool that automatically restart the server when it detects changes in ```9gag.js``` 

##Contribution Guideline
1. Use **spaces** instead of **tabs** for indention
2. Use `'` instead of `"` for strings
3. Do not directly commit to `master`, checkout a seperate branch and make a pull request if necessary
4. Be modular! (Create seperate methods in ```_util``` object instead of craming everything into one method)
5. Please reference the GitHub issue as you make a PR
6. Please comment!

##Documentation
Method | Endpoint
-------|---------
GET    | [/gag/{gagId}](#get-gaggagid)
GET    | [/{section}?subSection={subSection}&limit={limit}](#get-sectionsubsectionsubsectionlimitlimit)

Object Model          |
--------------------- |
[Gag](#gag)           |
[Images](#images)     |
[Media](#media)       | 
[Share](#share)       |

### GET /gag/{gagId}
Get data for a specific gag.

####Parameters
Key       | Required? | Value Type | Default | Description
--------- | --------- |----------- | ------- | -----------
gagId     | ✓         | String     | N/A     | ID of the gag

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
        "next":"aGDrYqZ",
        "media":{  
            "mp4":"http://img-9gag-fun.9cache.com/photo/aopAw22_460sv.mp4",
            "webm":"http://img-9gag-fun.9cache.com/photo/aopAw22_460svwm.webm"
        },
        "url":"http://9gag.com/gag/aopAw22",
        "votes":17985,
        "comments":878
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
data     | Array | An array of gag id
section | String | The section of the gag
subSection | String | The sub-section of the gag

####Example
REST Call
```
localhost:3000/girl?subSection=hot&limit=8
```
Response
```json
{  
    "status":200,
    "message":"OK",
    "data": [
        "a9Y43jL",
        "axDeMo2",
        "ae6yx1p",
        "amzbxr9",
        "ajDGQW1",
        "axDnXBb",
        "aDGrw4G",
        "aK3ngdg"
    ],
    "section": "girl",
    "subSection": "hot"
}
```

###Gag
A gag object contains information about the gag.

####Properties
Key | Value Type     | Description
------------|-------|-------
id     | String    | ID of the gag
caption     | String    | Caption of the gag
images     | [Image](#images)     | The images of the gag
media     | [Media](#media)     | ID of the gag (Only available if the gag is a GIF)
link     | String    | 9gag.com link of the gag
next     | String    | The gag id for the next gag
share    | [Share](#share) | The share links of the gag
votes     | Number     |  Contains the number of votes for the gag
comments     | Number     |  Contains the number of comments for the gag

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

###Share
A Share object contains various URL which enable users to share the gag

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
facebook     | String    | A share link for Facebook
twitter     | String    | A share link for Twitter
googlePlus     | String    | A share link for Google+
pinterest     | String    | A share link for Pinterest

##Contribution
https://github.com/k3min/infinigag

