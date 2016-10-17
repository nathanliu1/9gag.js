# 9gag.js
9gag.js is an Node.js-based API for 9gag.com. Available in both API server and npm module, it enables third-party applications to access various data from 9gag. Unofficially.

##Documentation
Method | Endpoint
-------|---------
GET    | [/gag/:gagId](#get-gaggagid)
GET    | [/:section?subSection=:subSection&loadMoreId=:loadMoreId](#get-sectionsubsectionsubsectionloadmoreidloadmoreid)

Object Model          |
--------------------- |
[Gag](#gag)           |
[Images](#images)     |
[Media](#media)       | 
[Share](#share)       |

### GET /gag/:gagId
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

### GET /:section?subSection=:subSection&loadMoreId=:loadMoreId
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
data     | Array | An array of gag id in the particular section/sub-section
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
    "aAPnow9",
    "a1X49m2",
    "adX3EpZ",
    "aDGBy3w",
    "a6QW0Vm",
    "aXw86m2",
    "ajD24Lp",
    "a84rgqZ",
    "a4jMyew",
    "awVq29x"
  ],
  "loadMoreId": "284462104345419892549df177d9fb07859625f6",
  "section": "wtf",
  "subSection": "hot"
}
```

### GET /user/:userId
Get the overview of a user

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
userId    |✓ | String    | N/A     | The user id of the user

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
userId     | String | The user id of the user
profileImage | String | The URL of the user's profile image
url | String | The URL of the user profile

####Example
REST Call
```
localhost:3000/user/lovinghist
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "userId": "lovinghist",
  "profileImage": "http://accounts-cdn.9gag.com/media/avatar/1668205_100_1.jpg",
  "url": "http://9gag.com/u/lovinghist"
}
```

### GET /user/:userId/posts?loadMoreId=:loadMoreId
Get the gags posted by the gag

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
userId    |✓ | String    | N/A     | The user id of the user

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
data     | Array | An array of gag id that the user posts
loadMoreId | String | The id that the user need to navigate to the next 10 gags
userId | String | The user id of the user

####Example
REST Call
```
localhost:3000/user/_s4tan_/posts
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "data": [
    "aQxwBWK",
    "aM9RYQW",
    "aAPo65Z",
    "aB1A6MD",
    "aEn90Pn",
    "aDGKwV9",
    "a84gKXQ",
    "amzZp5d",
    "azA3A2m",
    "aWMXBvd"
  ],
  "loadMoreId": "da94091aa3def7366f7aea3bae18cfd8525b1a34",
  "userId": "_s4tan_"
}
```

### GET /user/:userId/upvotes?loadMoreId=:loadMoreId
### GET /comment/:gagId?loadMoreId=:loadMoreId
### GET /comment/:gagId/:commentId?loadMoreId=:loadMoreId

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


##Contribution Guideline
1. Use **spaces** instead of **tabs** for indention
2. Use `'` instead of `"` for strings
3. Do not directly commit to `master`, checkout a seperate branch and make a pull request if necessary
4. Be modular! (Create seperate methods in ```_util``` object instead of craming everything into one method)
5. Please reference the GitHub issue as you make a PR
6. Please comment!


