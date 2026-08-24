# API in a nutshell

## Questionning

What are API ?

Why are they useful

What it look like

Wtf am I reading

Wtf is REST

What's a non REST API

What's the terminologies useful for ?

What's the difference public/private/partners API

API vs. SDK ?

Was API the first thing to exist ?
Alternative to API ? (SDK, MCP)

HTTP methods for all kind of API

What's an API style ?

What the hell is HATEOAS

What are API ? Vs. How to create an API ?  
=> Which topic do I cover ?

What actually distinguishes "API A" from "API B"

In the context of API, what are client application

"Uniform interface" ??? REST API

## API final

### Dataschool plan

> Context:  
> Dataschool to initiate fellow colleague to understand what are web APIs.  
> To illustrate it, I will provide an API example that will adapt itself for each aspect presented.  

---

1. API Basics
    <!-- Present web API, indicate that HTTP basics are required -->
    <!-- Illustrate with a button click transition that display a awful json -->
    - Web APIs
    - API typology
        <!-- Quick introduction only, reading material exist, but no wasting oral time on it. -->
        - Public APIs
        - Private APIs
        - Partner APIs
        - Composite APIs
    <!-- Illustration of an API call and response with every component detailled -->
    - API request
        - Endpoint
        - Method
        - Parameters
        - Request headers
        - Request body
    - API response
        - Status code
        - Response header
        - Response body
2. API Styles
    - Main character
        <!-- Introduce REST, its feature and why it's famous -->
        - REST
    - Other
        <!-- Present quickly other API styles, languages and features -->
        - GraphQL
        - gRPC
        - SOAP
3. API Features
    <!-- Present in one or multiples example the listed feature with an API call and response -->
    - Rate limiting & Throttling (for security & performance )
    - Pagination (for performance)
    - URL & Query parameters
    - Idempotency
    - Versioning
    - Optional: HATEOAS
    - Optional: Content negotiation
4. API Authentication & Authorization
    <!-- Introduce the use of authentication & authorization in in the web, how is it done through API -->
    <!-- Do not explain each method in detail, only their uses -->
    - Optional: Basic Auth => outdated
    - Token => JWT
    - OAuth => Most used (can still be combined with JWT)
    - Session Auth (Need to understand where it sit here)
    - RBAC
    - ABAC
5. API Security
    <!-- Need to merge it with authentication & authorization -->
    <!-- Present API key, what they're used for and how it's used  -->
    - API Key
    - Rate limiting & Throttling
6. API Performance
    - Plan for scaling
    - API contract
        - Rate limiting & Throttling
        - Pagination
        - Statelessness
        - Idempotency keys on write operation
    - Infra
        - Caching
        - Enable compression
        - Load balancing => API Gateway
        - Database indexing
        - API Monitoring
        - Performance testing
7. Integration Patterns
    - Synchronous vs Asynchronous
    - Event Driven Architecture
    - Microservice Architecture
    - API Gateway
    - Webhook vs API Polling
    - Batch Processing
    - Message Queue
8. Implementation framework
    - Python
        - Flask
        - Django
        - FastAPI
    - Node.js
        - Express 
        - NestJS 
        - Fastify
    - Java
        - Spring
9. API Documentation
    - SwaggerUI
    - Postman
    - OpenAPI Spec
    - Redoc
    - DapperDox
10. Optional: Testing
    - API Testing
    - Mocking APIs
    - API contracts

---

- Live demo:

- Potential topic:
    - example with API key use in weather app: https://www.youtube.com/watch?v=6ULyxuHKxg8

## Abstract
### Types of API

https://www.abstractapi.com/guides/api-glossary/types-of-api

- Types of APIs
- API protocol
- API structures
    - Monolithic APIs
    - Microservices APIs
    - Unified APIs
    - Stateless vs. Statefull
- API Security
    - API Key
    - OAuth & JWT
    - Rate limiting

> However, when you dive deeper, API types multiply, categorized by several distinct features at once.  
> Communication protocols, structures, and whether they are web or system APIs

## Geeksforgeeks
### Roadmap

https://www.geeksforgeeks.org/blogs/api-design-roadmap/

1. API Basics
2. API Styles
3. API Features
4. API Auth & Security
5. API Documentation tools
6. API Security
7. API Performance
8. API Integration Patterns
9. API Testing

## ByteByteGo
### API explained

https://www.youtube.com/watch?v=hltLrjabkiY

1 - Introduction to APIs

API is a set of rule that allow program to communicate

Public API
Private API
Partners API

2 - API terminologies

HTTP Headers
HTTP Methods => CRUD
HTTP Status code
HTTP Cookies
Caching

3 - API Styles

REST API
GraphQL
gRPC
SOAP
Websockets

4 - API Authentication

Basic Auth
Token
JWT
OAuth
Session Auth

5 - API documentation

Swagger
Postman
OpenAPI Spec
Redoc
DapperDox

6 - API features

Pagination
URL, Query, Path parameters
Idempotency
API Versionning
HATEOAS
Content Negotiation

7 - API performance

Caching
Rate limiting
Load balancing
Pagination
Indexing
Scaling
Performance testing

8 - API Gateway

AWS API Gateway
Apigee
Nginx

9 - API Implementation Frameworks

Flask
Node.js
Django
Spring
FastAPI

10 - Integration patterns

Sync Vs Async
API Gateway
Microservices
Webhooks
Polling
Batch Processing
Message Queue

### Top 9 API protocols

https://www.youtube.com/watch?v=hltLrjabkiY

REST
GraphQL
Webhook
SOAP
WebSocket
gRPC

https://www.youtube.com/watch?v=4vLxWqE94l4

SOAP
RESTful
GraphQL
gRPC
WebSocket
Webhook

### 12 tips for API security

https://www.youtube.com/watch?v=6WZ6S-qmtqY

Https
OAuth2
WebAuthn
Implement Authorization
Leveled API Keys
Rate Limiting
API Versioning 
Allow Listing
OWASP Security Risks
API Gateway
Error Handling
Input Validation

### Design effective APIs

https://www.youtube.com/watch?v=_gQaygjm_hg

### Types of API testing

https://www.youtube.com/watch?v=qquIJ1Ivusg

Smoke Testing
Functional Testing
Integration Testing
Regression Testing
Loa

### API Gateway

https://www.youtube.com/watch?v=6ULyxuHKxg8

## Java Brains

### HATEOAS

https://www.youtube.com/watch?v=NK3HNEwDXUk

`rel` attribute

```shell
HTTP/1.1 200 OK
Content-Type: application/json
Link: <https://api.example.com/v2/products?category=shoes&page=3&limit=10>; rel="next",
      <https://api.example.com/v2/products?category=shoes&page=1&limit=10>; rel="prev"

{
  "data": [
    {"id": 101, "name": "Trail Runner", "price": 79.99 },
    {"id": 102, "name": "Road Racer", "price": 89.50 }
  ],
  "pagination": { "page": 2, "limit": 10, "total_pages": 8, "total_items": 76 },
  "_links": {
    # "rel(ation)": "", "href": ""
    "self": "/v2/products?category=shoes&page=2&limit=10",
    "next": "/v2/products?category=shoes&page=3&limit=10",
    "prev": "/v2/products?category=shoes&page=1&limit=10"
  }
}
```

## Kiki's Bytes
### HATEOAS

https://www.youtube.com/watch?v=HNTSrytKCoQ

Web API are not restful on the web since they're removing HATEOAS uniform interface key constraint of REST.