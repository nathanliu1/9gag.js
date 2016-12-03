# 9gag.js
9gag.js is an Node.js-based API for 9gag.com. Available in both API server and npm module, it enables third-party applications to access various data from 9gag. Unofficially.

##Documentation
Method | Endpoint | USAGE
-------|--------- | ---------
GET    | [/gag/:gagId](#get-gaggagid) | Get data for a specific gag
GET    | [/:section?subSection=:subSection&loadMoreId=:loadMoreId](#get-sectionsubsectionsubsectionloadmoreidloadmoreid) | Get 10 gags from a particular section and sub-section
GET    | [/user/:userId](#get-useruserid) | Get the overview of a user
GET    | [/user/:userId/posts?loadMoreId=:loadMoreId](#get-useruseridpostsloadmoreidloadmoreid) | Get the gags posted by the gag
GET    | [/user/:userId/upvotes?loadMoreId=:loadMoreId](#get-useruseridupvotesloadmoreidloadmoreid) | Get the gags upvoted by the user
GET    | [/comment/:gagId?loadMoreId=:loadMoreId](#get-commentgagidloadmoreidloadmoreid) | Get comments of a post
GET    | [/comment/:gagId/:commentId?loadMoreId=:loadMoreId](#get-commentgagidcommentidloadmoreidloadmoreid) | Get children of the comment


Object Model          |
--------------------- |
[Gag](#gag)           |
[Images](#images)     |
[Media](#media)       | 
[Share](#share)       |
[Comment](#comment)       |

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
Get the gags posted by the user

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
userId    |✓ | String    | N/A     | The user id of the user
loadMoreId       | | String     | N/A | The id that the user need to navigate to the next 10 gags

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
Get the gags upvoted by the user

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
userId    |✓ | String    | N/A     | The user id of the user
loadMoreId       | | String     | N/A | The id that the user need to navigate to the next 10 gags

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
data     | Array | An array of gag id that the user upvotes
loadMoreId | String | The id that the user need to navigate to the next 10 gags
userId | String | The user id of the user

####Example
REST Call
```
localhost:3000/user/_s4tan_/upvotes
```
Response
```json
{
  "status": 200,
  "message": "OK",
  "data": [
    "aQxwBWK",
    "aOvgAdR",
    "ay8gDNX",
    "a1XzXRP",
    "aM9RYQW",
    "aAPo65Z",
    "aB1A6MD",
    "aEn90Pn",
    "a7dYb5L",
    "aWMr0oq"
  ],
  "loadMoreId": "a0af81961e4d174282d038bcee2fb5d890e70042",
  "userId": "_s4tan_"
}
```

### GET /comment/:gagId?loadMoreId=:loadMoreId

Get comments of a post

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
gagId    |✓ | String    | N/A     | ID of the gag
loadMoreId       | | String     | N/A | The id that the user need to navigate to the next 10 gags

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
loadMoreId     | String | An array of gag id that the user upvotes
comments | Array | An array of [Comment](#comment) object

####Example
REST Call
```
localhost:3000/comment/a6QW77b
```

Response
```json
{
  "status": 200,
  "message": "OK",
  "loadMoreId": "d155be8f52735a44283d10e4cd6a692f2d6b22b8",
  "comments": [
    {
      "commentId": "c_147661498453336211",
      "userId": "mceldafis",
      "text": "What beer are you drinking that you do this After 5 beer",
      "isOp": false,
      "isChild": false,
      "childrenCount": 24,
      "timestamp": 1476614984,
      "likeCount": 119
    },
    {
      "commentId": "c_147661349528888236",
      "userId": "salt4breakfast",
      "text": "Release the kraken",
      "isOp": false,
      "isChild": false,
      "childrenCount": 1,
      "timestamp": 1476613495,
      "likeCount": 25
    },
    {
      "commentId": "c_147667310840322068",
      "userId": "asain_dude",
      "text": "I wish he could ride on me like that ;)",
      "isOp": false,
      "isChild": false,
      "childrenCount": 2,
      "timestamp": 1476673108,
      "likeCount": 9
    },
    {
      "commentId": "c_147661524197753012",
      "userId": "byczpliz",
      "text": "Im sorry for your weak head :D",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476615241,
      "likeCount": 9
    },
    {
      "commentId": "c_147661373737021977",
      "userId": "alveenajanjua",
      "text": "Hahaha not a bad one though",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476613737,
      "likeCount": 6
    },
    {
      "commentId": "c_147668017667556176",
      "userId": "cesardedios94",
      "text": "Weak!!",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476680176,
      "likeCount": 4
    },
    {
      "commentId": "c_147667363212451239",
      "userId": "psychoticcunt",
      "text": "this is the cutest thing i&#039;ve seen today!",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476673632,
      "likeCount": 3
    },
    {
      "commentId": "c_147667292986437530",
      "userId": "jdmzibby",
      "text": "They shouldn&#039;t be drinking at that age especially around uncle Ronnie",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476672929,
      "likeCount": 3
    },
    {
      "commentId": "c_147667324824303328",
      "userId": "21yohipster",
      "text": "after 5 lemonades",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476673248,
      "likeCount": 2
    },
    {
      "commentId": "c_147667297282053391",
      "userId": "randomredpanda",
      "text": "What are you doing with your life?",
      "isOp": false,
      "isChild": false,
      "childrenCount": 0,
      "timestamp": 1476672972,
      "likeCount": 2
    }
  ]
}
```

### GET /comment/:gagId/:commentId?loadMoreId=:loadMoreId
Get children of the comment

####Parameters
Key      | Required? |Value Type      | Default | Description
--------- | ------ |--------- | ------- | -----------
gagId    |✓ | String    | N/A     | ID of the gag
commentId    |✓ | String    | N/A     | ID of the gag
loadMoreId       | | String     | N/A | The id that the user need to navigate to the next 10 gags

####Response
Key      | Value Type      |  Description | Note
--------- | --------- | ------- | -----------
status     | Number    | HTTP status code
message     | String    |  Message of the status code
loadMoreId     | String | An array of gag id that the user upvotes
comments | Array | An array of [Comment](#comment) object
parent | String | The ID of the parent

####Example
REST Call
```
localhost:3000/comment/a6QW77b/c_147661498453336211
```

Response
```json
{
  "status": 200,
  "message": "OK",
  "comments": [
    {
      "commentId": "c_147667307765857704",
      "userId": "furiousdeer",
      "text": "@mceldafis certainly not American",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476673077,
      "likeCount": 96
    },
    {
      "commentId": "c_147667371119417716",
      "userId": "hebbby",
      "text": "@mceldafis exactly what i was thinking, i want whatever this beer is OP",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476673711,
      "likeCount": 11
    },
    {
      "commentId": "c_147667410697736520",
      "userId": "jjj04",
      "text": "@bill_h Are we talking adults here? A 30 pound teenager maybe.",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476674106,
      "likeCount": 16
    },
    {
      "commentId": "c_147667464474315983",
      "userId": "sanirockz",
      "text": "@mceldafis Asking the right questions here",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476674644,
      "likeCount": 0
    },
    {
      "commentId": "c_147667495622697663",
      "userId": "barneyonmeth",
      "text": "@jjj04 a 30 pound teenager would be a dead teenager",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476674956,
      "likeCount": 13
    },
    {
      "commentId": "c_147667670659204091",
      "userId": "coolnomore",
      "text": "@jjj04 People have different alcohol tolerance. I&#039;ve seen many adults get quite drunk after 3 beer. It&#039;s not that surprising. Its just your ego, mr.badass.",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476676706,
      "likeCount": 3
    },
    {
      "commentId": "c_147667712641169495",
      "userId": "xThatSwissGuyx",
      "text": "@mceldafis this new vodka beer u know",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476677126,
      "likeCount": 3
    },
    {
      "commentId": "c_147667719227015293",
      "userId": "jjj04",
      "text": "@coolnomore First time I&#039;ve been called a badass for being able to drink 3 beers lol",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476677192,
      "likeCount": 7
    },
    {
      "commentId": "c_147667802001922247",
      "userId": "cthedogg",
      "text": "@jjj04 dude my ex was 90lbs and not even one beer and she was already buzzed. I&#039;m 210 and at least 5 beers to start to feel something.",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476678020,
      "likeCount": 0
    },
    {
      "commentId": "c_147668150772941017",
      "userId": "master_raccoon",
      "text": "@mceldafis plot twist. 5 barrels of beer",
      "isOp": false,
      "isChild": true,
      "timestamp": 1476681507,
      "likeCount": 2
    }
  ],
  "loadMoreId": "d67a4f14d99086b756fd46428e0ed361dcca788d",
  "parent": "c_147661498453336211"
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
mp4     | String    | The animation of the gag, in .mp4
webm     | String    | The animation of the gag, in .webm

###Share
A Share object contains various URL which enable users to share the gag

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
facebook     | String    | A share link for Facebook
twitter     | String    | A share link for Twitter
googlePlus     | String    | A share link for Google+
pinterest     | String    | A share link for Pinterest

###Comment
A Comment object contains information about a comment

####Properties
Key | Value Type     | Description
--------- | --------- | ------- 
commentId     | String    | The ID of the comment
userId     | String    | The ID of the user who commented
text     | String    | The text of the comment
isOp     | Boolean    | True if the user is OP of the gag. Otherwises, false.
isChild     | Boolean    | True if the comment is a child comment. Otherwises, false.
childrenCount     | Number    | The number of children the comment has
timestamp     | Number    | The time when the comment was made
likeCount     | Number    | The number of likes the comment has


##Contribution Guideline
1. Use **spaces** instead of **tabs** for indention
2. Use `'` instead of `"` for strings
3. Do not directly commit to `master`, checkout a seperate branch and make a pull request if necessary
4. Be modular! (Create seperate methods in ```_util``` object instead of craming everything into one method)
5. Please reference the GitHub issue as you make a PR
6. Please comment!


