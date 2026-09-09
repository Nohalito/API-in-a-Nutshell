# Presentation

## Plan:

- 0°/ API in a Nutshell
    - Personal introduction
- 1°/ Introduction
    - 1.1°/ API déf
    - 1.2°/ Pre-requisite
- 2°/ API Basics
    - 2.1°/ Styles
    - 2.2°/ Request & Response
    - 2.3°/ Special => Custom call
    - 2.4°/ Features
- 3°/ API Security
    - 3.1°/ Context & Utility of Security
    - 3.2°/ Authentication Vs Authorization definition
    - 3.3°/ Special => Custom call with security
- 4°/ API at scale
    - 4.1°/ Context & Utility of scale
    - 4.2°/ Contract & Infra
- 5°/ What's Next ?
    - 5.1°/ Iceberg illustration of API knowledge

## 0°/ API in a Nutshell

Main page, already defined.

### Personal introduction

Already defined

## 1°/ Introduction

Table of content with Axis 1 highlighted

### 1.1°/ API definition and context

Slide on hold for now

### 1.2°/ Pre-requisites

- Title:

"Prerequisites: HTTP Request"

- Main Frame:

1st component: Below the title, a page-wide paragraph explaining shortly what's the HTTP communication protocol

2nd component: a 2 columns space in the main frame containing two boxes separated by a floating vertical line:

    - On left; A box explaining the CRUD method and the request response format.
    For the request/response format, and image will be supplied, use placeholder for now. Below it, keep enoug place for a 4-items long list for HTTP method.
    Each method should be named in a small colored box and be associated to their CRUD short definition.  

    - On right; A table of the different status code with color (Green: 1xx/2xx; Orange: 3xx; Red: 4xx/5xx). The columns shall be {Category, Range, meaning{keyword; short definition}, Examples}. The color shall be applied to the category and meaning.keyword.

### 1.3°/ Pre-requisites

- Title:

"Prerequisites: JSON & TCP/IP"  

- Main frame

    - Subtitles: Two differents subtitle with an height just below the main titles, one on right, one on left.
    
    On left: "JSON"  
    On Right: "TCP/IP"

    - Subframes: Two spaces separated by a vertical line, each component below their subtitles

    ```
    - On left: A flashcard containing some random data in a table that take all the space on left. Said flashcard posses a indicator on top right to click on it to reverse it. The 2nd face of it reveal a scrollable JSON file in a code cell equivalent to the previous table. The goal is to illustrate JSON is a way to store data. 

    - On right: A quick definition of the TCP/IP framework, with a placeholder below of an image I will provide of the TCP/IP model. Said image will be an illustration of TCP/IP Layer.
    ```
<!-- Cala portal 2 ref for TCP/IP simplification ? -->

## 2°/ API Basics

Table of contents with Axis 2 highlighted

### 2.1°/ Styles

- Titles

"API Styles"

- Definition: A page-wide definition of web API that will highlight the context of the below API styles.

- Main Component: An interactive card presenting different API style

    A box with browser page navigation on top of it, each "page" should be the name of an API style.  
    Among said API style: REST, GraphQL, gRPC.  
    Said "page" should be styled similarly to a broswer page and can be clicked on.  
    When selectioned, a "page" should be highlighted. And the box content shall adapt itself.

    REST : 6 principles of REST & it's main purposes explained "simply" (non dev profile present)  
    gRPC: Short purposes explanation for non dev reader & small protobuff example  
    GraphQL: Short purposes explanation for non dev reader

### 2.2°/ Request & Response

<!-- Most important page -->
<!-- meme: API-call.jpg -->

- Title:

"Request & Response: A 2-in-1 package"

- Main frame: Two spaces separated

    Reference yourself to this file "C:\Users\nboimond\Documents\dataschools\API-in-a-Nutshell\templates\candidate-api-anatomy.html" for the box content style ONLY. Do not copy it's content, only placeholder for method, status... etc. And the legend for the simple request Do not use anything else aside.

    Additionally, add on the top of the page, on the middle, a GET & POST button to switch the content of the below content.

    - Left side:

    ```
    Add a request box display.
    But this time with additional content, add on the box title 4 buttons: {Request, Python, Javascript, cURL}. Each button will change the box content.
    
    Request, is the baseline, it will serve as a breakdown of each component of an API call.
    As needed, make the body part scrollable

    Python, Javascript and cURL, will then use the placeholder value to demonstrate where each component goes in an actual request. This won't need the previous highlight of the base Request display (no highlighted text box and font).
    Said code example will be displayed in a code cell in dark theme of their own languages (cURL being in terminal, a black background white font will suffice).
    Also, as the code might be longer to display, make the code cell scrollable when the content is too long

    Also, on the box top-right, remove the method label/tag.

    For the content:
    GET method: Use https://catfact.ninja/#/Facts/getRandomFact API. For the Header, use the content type, Accept parameter.
    POST Method : Parse this example :
fetch('https://dummyjson.com/carts/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    products: [
      {
        id: 144,
        quantity: 4,
      },
      {
        id: 98,
        quantity: 1,
      },
    ]
  })
})
.then(res => res.json())
.then(console.log);
    ```

    - Right Side

    ```
    Add a response box display.
    Remove the statue tag of the template I gave you on top-right.
    Make the body scrollable
    For the Content:    
    GET method: Just try an API call to the cat fact url and parse the answer
    POST Method: Use this template and parse it:
    "
    HTTP/1.1 200 OK
    Content-Type: application/json
    <!-- Add the usual header for the delay (56ms) -->

 {
    "id": 51,
    "products": [ // products were added by id
      {
        "id": 98,
        "title": "Rolex Submariner Watch",
        "price": 13999.99,
        "quantity": 4,
        "total": 55999.96,
        "discountPercentage": 0.82,
        "discountedPrice": 55541,
        "thumbnail": "https://cdn.dummyjson.com/products/images/mens-watches/Rolex%20Submariner%20Watch/thumbnail.png"
      },
      {
        "id": 144,
        "title": "Cricket Helmet",
        "price": 44.99,
        "quantity": 1,
        "total": 44.99,
        "discountPercentage": 10.75,
        "discountedPrice": 40,
        "thumbnail": "https://cdn.dummyjson.com/products/images/sports-accessories/Cricket%20Helmet/thumbnail.png"
      }
    ],
    "total": 56044.95, // total was calculated with quantity
    "discountedTotal": 55581,
    "userId": 1, // user id is 1
    "totalProducts": 2,
    "totalQuantity": 5 // total quantity of items
}
    ```

### 2.3°/ Special => Custom call

- Title

""

- Main frame 

Same display as call and request.  
Remove python, js & curl, only request display  
Add a make API call button.
The API call shall be a 2 in 1:  
First :
API call to https://catfact.ninja/fact
Only keep the brief minimum in the header

### 2.4°/ Features



## 3°/ API Security

Already done

### 3.1°/ Context & Utility of Security

- Title

"What about security ?"

- Main Frame: Two space composed of bullet points and a flashcards

- Left side: Bullet point

```
Context:
Stakes:
```

- Right side: flashcard

```
Similar to ### 1.3°/ Pre-requisites JSON flash card in terms of animation.
A flashcard that will hold both Authentication and Authorization information
Front: Title: "401 - Authentication"; Def: "Who are you ?" + image from with js API call at https://http.cat/401
Back: Title: "403 - Authorization"; Def: "What may you do ?" + image from with js API call at https://http.cat/403

Can be swapped by clicking on it
```

### 3.2°/ Authentication Vs Authorization framework

- Title

"Methods and Framework"

- Main frame

Need to present API KEY Vs JWT

Define RBAC as a whole.
Introduce most used method: OAuth

### 3.3°/ Special => Custom call with security

- API Key

import os
import requests

API_KEY = os.getenv("API_KEY")

city = "Delhi"

url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}"

response = requests.get(url)

print(response.json())

- Token

/* Missing accessToken in bearer */
fetch('https://dummyjson.com/auth/me', {
  method: 'GET',
  <!-- headers: {
    'Authorization': 'Bearer /* YOUR_ACCESS_TOKEN_HERE */', // Pass JWT via Authorization header
  },   -->
  credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
.then(res => res.json())
.then(console.log);

---

fetch('https://dummyjson.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    
    username: 'emilys',
    password: 'emilyspass',
    expiresInMins: 30, // optional, defaults to 60
  }),
  credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
.then(res => res.json())
.then(console.log);

---

/* providing accessToken in bearer */
fetch('https://dummyjson.com/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer /* YOUR_ACCESS_TOKEN_HERE */', // Pass JWT via Authorization header
  }, 
  credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
.then(res => res.json())
.then(console.log);

--- 
<!-- Optional: Refresh token -->

fetch('https://dummyjson.com/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: '/* YOUR_REFRESH_TOKEN_HERE */', // Optional, if not provided, the server will use the cookie
    expiresInMins: 30, // optional (FOR ACCESS TOKEN), defaults to 60 
  }),
  credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
.then(res => res.json())
.then(console.log);

## 4°/ API at scale
### 4.1°/ Context & Utility of scale + Contract

- Title

"And for performance ?"

- Main Frame: Two bullet points lists

- Left side: Bullet point

```
Context:
<!-- Mention at some point contract and infra level -->
Stakes:
```

- Right Side: 2nd bullet point

Describe shortly Rate limiting and Pagination

### 4.2°/ Infra

- Title

"Infrastruture Best Practices"

- Main frame

Re-use the API style box with pages.  
One for caching, one for load balancing.  
Use placeholder box for now (1 lorem ipsum paragrah each)

## 5°/ What's Next ?
### 5.1°/ Iceberg illustration of API knowledge
