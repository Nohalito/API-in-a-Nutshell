# Learning materials

This is a blueprint of what I learned, ideas I had and 

## Ideas

- Caching
- Load Balancer
- System design
- Broswer DevTools

## Learning

[Guide to caching and CDN](https://www.youtube.com/watch?v=RCdAGvtTYI0): 7min

Caching : storing method used to improve delivery time from server to the users

4 methods :
- Local Cache
- Server Cache
- Database Cache
- CDN :
    - Pull CDN
    - Push CDN

[System design explained](https://www.youtube.com/watch?v=oYxTTirKY8M): 2h04

Step 1 : Single user web app :
- Web broswer or mobile app (http call or API call)
- DNS (IP and  domain name)
- Server (web app; database; cache)

Choose a DB :
- Relational DB => good for consitency : transaction (ACID)
- Non-Relational DB

Scaling : Vertical/Scale up Vs Horizontal/Scale out

"Load balancer appear when we scale out on the Network layer" 

### Load Balancer

Load balancer strategies :
- Round Robin : 1st request to 1st server, 2nd to 2nd server
- Least Connections : redirect requests to the server with the least connections (use : session of variable lenght)
- Least Response time : redirect requests to the server with the best response time (use : fastest response time)
- IP Hash : redirect based on the IP hash of the user (use : redirect them to the same server everytime [could be used for caching])
- Weighted Algorithms : Apply weigh according to different perfomance metrics then apply one of the 4 mentionned methods from before
- Geographical Algorithms : Minimize distance between the user and server (use : global service)
- Consistent Hashing : Hash the servers in a circle and when an IP try to connect it get hashed and placed on the ring, then it get assigned to the next server on a clockwise rotation.

Load balancer can adapt to non-responsive server with health-checks request

Can be set up for Network or Application Layer

**Single point of Failure** (SPOF)

- Redundancy
- Health Checks & Monitoring
- Self-healing Systems

### API Design

Application Program Interface : Defines how software components should interact

REST API :
- Resource-based : HTTP methods
- Stateless : Contain all info needed
- Standardized Methods : GET, POST ...
- Most common API

GraphQL API

Key Design Principles :
- Consistency
- Simplicity
- Security
- Performance

API Protocols (Application layer):
- HTTP
- MQTT
- AMQP
- WebSockets
- gRPC

API Design Process :
- Identify core uses cases and user stories
- Define scope and boundaries
- Determine performance requirements
- Consider security constraints

Design Approaches :
- Top-down : start with high-level requirements & workflow
- Bottom up
- Contract first : Define the API contract before implementation

HTTP protocol :
GET, POST, PUT, DELETE, PATCH

Websockets :
Handshake, **bidirectional** communication

Advanced Message Queuing Protocol (AMQP) :
producer => message broker (queue) => Consumer accept msg when ready

gRPC :

Transport Layer :

Transmission Control Protocol (TCP) :
- Guaranteed delivery
- Connection based (3-way handshake)
- Ordered packets
- Error checkings

User Datagram Protocol (UDP) :
- No delivery Guarantee
- Connectionless (No handshake)
- Faster transmission
- Less overhead

- TCP : Reliable but slower (Banking, emails)
- UDP : Fast but unreliable (Gaming, streaming)

RESTful APIs 
Filtering : GET/product?category=books
Sorting : GET/product?category=books&sort=price_asc
Pagination : GET/product?page=2&limit=3

GET : Read
POST : Create
PUT : Update (replace)
PATCH : Update (partial)
DELETE : delete

Status Codes :
- 2xx : Success
- 3xx : Redirection
- 4xx : Clients errors
- 5xx : Server errors

Best practices :
- Plural nouns : "getUser" => "users"
- Keep URLs consistent and hierarchical
- Version APIs

### Authentication

 "Authentification : verifies that the user or service trying to access our system is who they claim to be"

#### Basic Auth Methods

Basic
- Provide credential in GET request
- Only secure with HTTPS
- Password encoded in B64

Digest
- Similar to Basic but with Hash Encryption

API Keys
- Include the API key in the request
- Check if the API is included and if it's correct
- Doesn't contain any information (on opposite to JWT), just a random string

Session
- Login
- Create session
- Set session cookie on user local
- Use request with cookie attached
- This is a **statefull** Method, server need to remember a session state

#### Token-Based Auth

Bearer & JWT Tokens
- Auth Server **&** API Server 
- Login with credential to Auth Server
- Get a JWT token
- Make request to API server with bearer token
- Verify token signature

Access & Refresh Tokens
- Access token : 15 min to 1hour
- Refresh token : 7 to 30 days

#### OAuth2 and OIDC

OAuth2 => Authorization method only
- User, Your app, Google OAuth, Google Service API

OpenID Connect (0IDC) :
- Similar to OAuth2 but is used to authenticate the user not the app

#### SSO & Identity Protocols

SSO(SAML, OIDC, OAuth2) : User experience, not authentification :

### Authorization
"We now know who the user is, but can the do and cannot

RBAC
Attribute based access control

### Security 

- Rate Limiting :
    - Per endpoint
    - Per user/IP
    - For DDoS mitigation purposes
- CORS :
    - Which domain can access your server
- SQL & NoSQL injection :
- Firewalls
- Virtual Private Networks (VPNs)
    - Server reserved for specifics IP 
- Cross-Site Request Forgery (CSRF)
- Cross-Site Scripting (XSS)

### Proxy servers

- Forward
- Reverse

- Open
- Transparent
- Anonymous
- Distorting
- High anonymity

### CDN

CDN :
- Pull
- Push

- Peer-to-peer CDNs
- Private CDNs

- Telco CDN ?
- Multi-CDN
- vCDN

### API layer :
When Sending Data (From Sender to Receiver)
Application Layer: The user’s software (like a web browser or email client) creates the data and passes it to the next layer.
Transport Layer: The data is broken into segments, and TCP or UDP adds control information to ensure reliable delivery or fast transmission.
Internet Layer: Each segment is encapsulated into packets with IP addresses so it can be routed across networks to the destination device.
Network Access (Link) Layer: The packets are converted into frames suitable for the physical network (Ethernet, Wi-Fi) and transmitted over cables or wireless signals.
When Receiving Data (At the Destination)
Network Access Layer: The frames are received from the physical medium and checked for errors.
Internet Layer: Frames are unpacked to extract packets and use the IP address to ensure it reaches the correct device.
Transport Layer: Segments are reassembled into the original message, and any missing or corrupted data is corrected (if TCP is used).
Application Layer: The complete data is delivered to the user application (like the browser displaying a webpage or the email client showing a message).