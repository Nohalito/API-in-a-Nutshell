# Nutshell

## Final plan:

1. API pre-requisite & kesako ?
    - Background
    - Metaphore
    - Examples
        - Google maps
        - Weather app
    - JSON, XML, HTTP
    - TCP/IP or OSI

2. API basics
    - Styles
        - REST
        - GraphQL
        - gRPC
    - Call & Responses
        - Method
        - Endpoint
        - Parameters
        - Status
        - Header
        - Body
    - Features
        - Rate limiting
        - Pagination
        - URL & Query parameters
        - Idempotency
        - Versionning
3. API security
    - Authentication
        - API Key
        - JWT
    - Authorization
        - OAuth
        - RBAC
        - ABAC
    - Rate limiting & throttling

4. API performance
    - Contract
        - Rate limiting
        - Performance
    - Infra
        - Caching
        - Load balancing => API gateway
        - enable compression

5. Opening possibilities
    - Integration pattern
    - Implementation framework
    - HATEOAS
    - API Vs URL
    - API Vs SDK
    - API Vs MCP

## Presentation start

- Background:

## 1°/ API pre-requisite & kesako ?

- Raw definition  
Application Programming Interface (API): A connection between computers or computer programs.

- Metaphore  
> Think about electricity.
> Metal can conduct it, yes. But how can it be done safely, consistently and efficiently ? The answer is that we use cable & wire.  
>This is a method of conducting electricity to obey said criterion when connecting two devices outlets.
> Now goes back to API, this is a "connection" between computers. This mean our `elecricity` here is the information they exchange. To do so a framework need to be defined, security to avoid not everyone can acquire it, etc. This is what an API are in this metaphore, a cable.  
> But it doesn't stop there, you have different kind of cable, for different outlet models or even wireless charging now. This is the same for API, this is only a framework to connect computer. For each kind of information, programs or device, a new API might need to be defined.

- Context

> Let's step back from this example, now that we supposedly now what's an API. Why is it useful ?  
> Let's say you want to start building an app, an app that will allow your coworker to rate the best restaurant near the WeWork. To do so a simple dashboard that list all restaurant nearby could be thought off. But you quickly feel the need to display a map.  
> How do you do it ? You take your car, attach a multitudes of camera on it and recreate Google Map ? NO ! **You just query already existing data** elsewhere.  
> You want to add a chatbot that provide advices on the best food available. Do you train your own LLM ? No **you export the logic execution** to someone with an already trained model.  
> This is what API are for, to use the benefit of a connection with other programs.

- Examples
    - Google maps
    - Weather app

- JSON, XML, HTTP

> Before going further, some pre-requisite need to be covered.  
> As I spoke about connection, I already mentionned two advantages : Information and logic. In both case, you will need to exchange information (Okay this is a bit repetitive). And to do so, some basic about information display are needed.  
> You can have access to a JSON cheatSheet at your own convenience to understand how structured data can 

- TCP/IP or OSI