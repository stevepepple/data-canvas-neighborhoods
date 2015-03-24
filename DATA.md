# Urban Heartbeat Data & Process

Sense Your City built 14 environmental sensor nodes in 7 cities. Each sensor captures data about air quality, dust, light, sound, temperature, and humidity. One goal of our project was how to explore real-time data collection in a way that makes the process more transparent and intuitive to all citizens.  To achieve this goal, we decided to explore different types of environmental data in different mediums, including light, sound, and visual design.

Our team built a application that calls the Sense Your City API for each sensor in each city. In the Urban Heartbeat application, the sensor data is refreshed every 10 seconds.

The application allow the user to select sensors by neighborhood, using Turf.js and Google's Geocoding service to reverse geocode the sensors locations and join them with the the respective neighborhood, district, or locality.

We conducted several experiments based upon different environmental factors, such as pollution, noise, dust, and light. Each experiment explores a different factor using a different medium or visualization technique. Then we incorporate these visualizations into a single interface that gives a hyper-local, real-time snapshot of a place. The user can also view multiple places at one, to compare their current pulse.

## Noise

Noise for the current place is expressed as an audible heartbeat and sound visualization. The frequency and loudness of the heartbeat represent the amount of sound.

<img src="../images/dust.png" width="100%"/>

## Pollution
Pollution data tells about potential harmful target gases near the sensor, including smoke, carbon monoxide, and ethanol.

Pollution is visualized as an animated cloud of pollutants. When levels are high, the cloud is more green and opaque.

<img src="../images/pollution.png" width="100%"/>

## Dust

Dust data tells about the concentration of particulate matters (PM) near the sensor.

Dust is visualized as a graph of particles that appear to emanate from sensor.  

<img src="../images/dust.png" width="100%"/>

## Light

Light tells about the current amount of light (LUX) that is captured by the sensor.

High and low light are visualized by modify the exposure and brightness of the map for the selected place.

<img src="../images/night-and-day.png" width="100%"/>
