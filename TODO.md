- Acceso a creacion de Organizaciones tiene que ser restringido (Book a demo)
- Webhook para facturacion
- Scanner

- Terminar event_days y Events 
- Palcos, silla enum. 
- Programa de referidos 
- apple wallet 
- Analytics de ruta de eventos (organizaciones)
- descargar tickets
- reembolsos con Oscar
- en /entradas hacer que salga el card del evento en vez del nombre, y al presionar salen todos los tiquetes comprados de ese tipo de evento
- en el webhook, acceder del pago la informacion sobre impuestos y guardarlos en la db

├ ƒ /profile/[userId]/organizaciones/[organizationId]/administrador/event/[eventId] 13.6 kB 571 kB
├ ƒ /profile/[userId]/organizaciones/[organizationId]/administrador/event/[eventId]/entradas 9.93 kB 537 kB
├ ƒ /profile 40.5 kB 274 kB
├ ○ /productor 129 kB 234 kB

Notes
<!-- 41.1.1. Advantages of Using PL/pgSQL 
SQL is the language PostgreSQL and most other relational databases use as query language. It's portable and easy to learn. But every SQL statement must be executed individually by the database server.

That means that your client application must send each query to the database server, wait for it to be processed, receive and process the results, do some computation, then send further queries to the server. All this incurs interprocess communication and will also incur network overhead if your client is on a different machine than the database server.

With PL/pgSQL you can group a block of computation and a series of queries inside the database server, thus having the power of a procedural language and the ease of use of SQL, but with considerable savings of client/server communication overhead.

Extra round trips between client and server are eliminated

Intermediate results that the client does not need do not have to be marshaled or transferred between server and client

Multiple rounds of query parsing can be avoided

This can result in a considerable performance increase as compared to an application that does not use stored functions.

Also, with PL/pgSQL you can use all the data types, operators and functions of SQL. -->