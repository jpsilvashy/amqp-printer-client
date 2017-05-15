# AQMP Printer Client

**What is this?** This is a Node app that runs on a Raspberry PI, when connected to an DYMO Label printer it can: 
 
 - Listen to a queue in RabbitMQ
 - **Exclusivly** print a shipping label, optionally making a HTTP request before printing (imagine charging a CC via Stripe?)
 - ACK a message after successfully printing
 - POST a status response to other services after printing
