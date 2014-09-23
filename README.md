aata-hack
=========

XMLHttprequest sniffer with phantomjs to collect information on bus locations in the AATA


## Where are the buses?
This is a full-stack take on understanding the Ann Arbor Transportation Authority (AATA) bus system. My idea was first sparked after a few frustrating experiences attempting to access the map from the AATA, but having going through a number of non-mobile friendly selectors. Also, the information is not well organized, making it difficult to rapidly determine when I should leave the house to catch a bus. A final concern is the complete lack of context-awareness by the AATA (i.e. no geolocation and no memory of the user's previous preferences). 

## What this does to help alleviate the problem?
The solution is to listen in to the AATA site, record the data posted at regular intervals, and then make my own map using that data. I use NodeJS to run my server which conveniently harvests data from the The Ride. My map then regularly updates with this new information. As it stands, a user can see where they are, and where the buses are in relation to them. They can also click a point on the map to see other information available about their bus. 


## Improvements
1. Utilize the Leaflet routing library to get a better idea of how to move a user from point A to point B.
2. Store bus route data in a database for easier retrieval
3. Allow a user to drag a pin on the map to their destination, and recommend possible routes
4. Integrate the Uber API to provide an alternative for bus users, especially when buses are not running
5. Provide users with an estimate of when the nearest bus will arrive at the stop closest to them
