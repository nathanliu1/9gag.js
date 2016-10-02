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
GET    | [/{section}?subSection={subSection}&loadMoreId={loadMoreId}](#get-sectionsubsectionsubsectionloadmoreidloadmoreid)

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
localhost:3000/gag/aOv5VG6
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "gag": {
    "id": "a7dP8Ew",
    "title": "Consult electrician before removing plate",
    "images": {
      "small": "http://img-9gag-fun.9cache.com/photo/a7dP8Ew_220x145.jpg",
      "cover": "http://img-9gag-fun.9cache.com/photo/a7dP8Ew_460c.jpg",
      "normal": "http://img-9gag-fun.9cache.com/photo/a7dP8Ew_460s.jpg",
      "large": "http://img-9gag-fun.9cache.com/photo/a7dP8Ew_700b.jpg"
    },
    "next": "aOv5VG6",
    "url": "http://9gag.com/gag/a7dP8Ew",
    "votes": 15356,
    "comments": 744,
    "share": {
      "facebook": "https://www.facebook.com/sharer/sharer.php?u=http://9gag.com/gag/a7dP8Ew?ref=fb.s",
      "twitter": "https://twitter.com/intent/tweet?via=9GAG&source=tweetbutton&original_referer=http://9gag.com/gag/a7dP8Ew?ref=t&text=Consult%20electrician%20before%20removing%20plate!&url=http://9gag.com/gag/a7dP8Ew?ref=t",
      "googlePlus": "https://plus.google.com/share?url=http://9gag.com/gag/a7dP8Ew?ref=gp",
      "pinterest": "https://www.pinterest.com/pin/create/button/?url=http://9gag.com/gag/a7dP8Ew?ref=pn&media=http://img-9gag-fun.9cache.com/photo/a7dP8Ew_700b.jpg&description=Consult%20electrician%20before%20removing%20plate"
    }
  }
}
```

### GET /{section}?subSection={subSection}&loadMoreId={loadMoreId}
Get 10 gags from a particular section and sub-section. Since 9GAG is an infinite scrolling website, gags will never stop displaying. Use loadMoreId to find the next 10 gags.

Currently availabe sections: 
> 'hot', 'trending', 'fresh', 'funny', 'wtf', 'gif', 'nsfw', 'gaming', 'anime-manga', 'movie-tv', 'cute', 'girl', 'awesome', 'cosplay', 'sport', 'food', 'ask9gag', 'timely'

Currently availabe sub-sections: 
> 'hot', 'fresh'

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
section    |✓ | String    | N/A     | The section of the gag
subSection  |  | String    | hot     | The sub-section of the gag
loadMoreId       | | String     | N/A | The id that the user need to navigate to the next 10 gags

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
localhost:3000/wtf
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "data": [
    "aYL5B2x",
    "aK35y63",
    "a4jy84d",
    "ajDwGrG",
    "aAP5NWL",
    "adXw4RZ",
    "aDG5Pyx",
    "agGwdmn",
    "a84Onv6",
    "a7dXG1x"
  ],
  "loadMoreId": "a7dXG1x%2Ca84Onv6%2CagGwdmn",
  "section": "wtf",
  "subSection": "hot"
}
```
REST Call
```
localhost:3000/wtf?loadMoreId=a7dXG1x%2Ca84Onv6%2CagGwdmn
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "data": [
    "a5r3xQE",
    "apLw845",
    "a9Y0Dp6",
    "aGD57D6",
    "arNw85B",
    "adXwoZ2",
    "adXwo49",
    "a4jy59p",
    "aPW2oDG",
    "azAwdoZ"
  ],
  "loadMoreId": "azAwdoZ%2CaPW2oDG%2Ca4jy59p",
  "section": "wtf",
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

