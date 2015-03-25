# Urban Heartbeat

A project by Aurelia Friedland [@AuFriedland](https://twitter.com/AuFriedland), Sanju Ashok [@sanjuashok](https://twitter.com/sanjuashok), & Steve Pepple [@stevepepple](https://twitter.com/stevepepple)

**Urban<3Beat** is an civic art project that explores real-time temporal identities and pulses of places in cities around the world. The project is part of the [Data Canvas: Sense Your City](http://datacanvas.org/) competition, a DIY sensor network project collecting and visualizing open data. To state the obvious: cities are for people—  not machines, not data scientists, not corporations. Places, particularly broken down to the scale of a neighborhood, are really hard to quantify. Places are temporal and dynamic, changing dramatically over the course of a day, week, month, year.

The primary goal of **Urban<3Beat** is to empower the ability for any citizen to curate their own civic data search, and in turn, find customized search results in the form of information-rich, yet visually simplified format(s), or "pulses".

Our team began by building a series of audiovisual experiments for representing select environmental factors, such as pollution, noise, dust, and light. [View Experiments >](http://codepen.io/collection/DRzwQR/) Over the course of three weeks, we explored, reviewed, and refined our experiments. The result is a web app/search engine that allows users to curate their own searches and compare pulses across 100 places in 7 international cities. Users will be invited to include select environmental factors as they find relevant to their search. Each environmental factor selected will contribute a “layer” onto a resulting urban pulse. As such, pulses will say as much about places as it will about people.

**View more detail about the three stages of our project process below, including Exploration, Experimentation, and Next Steps**

Start your own search now by visiting [http://urban-heartbeat.net/](http://urban-heartbeat.net/)


## PHASE I: EXPLORATION
### Data Canvas: Sense Your City Hackathon

Our team found each at SwissNexSF’s office at the [Data Canvas: Sense Your City Hackathon](http://www.swissnexsanfrancisco.org/event/datacanvasd3/). Drawn by our respective creative pitches, we swapped tables and discovered that we shared overlapping interests despite our various perspectives working with technology: front-end/back-end, UX/UI, and software/hardware development. We quickly noticed how we served as our very own test case,  aligning along a joint focus, yet with differing perspectives on what it was we were most excited to explore. Throughout the duration building our submission for Data Canvas (just short of 3 weeks), our interdisciplinary team continued to engage around the project by comparing findings and negotiating areas of interest — between back-end and front-end, and across locations and time zones.


### The Future of Data Visualization
As a collection of makers across interdisciplinary backgrounds, we share a wide range of influences and inspirations when it comes to data art-from the formation of utterly beautiful code to what we believe to be emerging innovations for the fields of data visualization, generative art, interactive media and technologies, and user experience design.

“It is not about triangles and Taurus's or motion trajectories, but about timing and patterns of interactivity, about triplets and cycles, subtractions and parallelism, switches and differentials...The architect with new computational tools is more often attracted to the visuals or behaviors of software environments than the invisible network architecture behind the screen."
–
***Keller Easterling, American architect/urbanist/writer/teacher***
(an excerpt from Organization Space..., MIT Press, 2001)

With the rapid increase of embedded products growing across microchips and macro urban scales, “big data” is moving beyond questions of “if” to “what then”? The focus is on generating “smarter” versions - not just smarter sensors, but smarter interfaces, or rather, smarter ways to engage a diverse set of participants with the increasingly complex data that surrounds them.

**Urban<3Beat** decided to approach this from the perspective of curation and “smarter aesthetics”. With access to 7 types of environmental sensors across 7 cities, we decided that the answer was to allow users the ability to navigate throughout these complex sets of data by curating simple searches as they found relevant:

 1. A Curatorial Search Engine: search through big data based on location(s) and layer(s) of interest

 2. Pulses of Place: view search results within an aesthetic format which reveals a simplified AT-A-GLANCE collection of what was searched for, or “smart aesthetics” which represent temporality and place
 3. Deeper Reads/Comparisons: follow diverse lines of inquiry if so desired by facilitating deeper dives into data, or comparative analysis

 Bigger data means a rise in the complexity of *content* for data visualization, but does not have to mean the same for its interface. We believe data visualizations will become increasingly searchable and dynamic, and as such, could inherit a kind of “smarter aesthetics” informed by considerations of time ( sneak a peek at [generative art](http://butdoesitfloat.com/index/filter/generative-art) and [processing](https://processing.org/exhibition/) and space [material design](http://www.google.de/design/spec/material-design/introduction.html) has added a whole new dimension).

<iframe src="../data/smart-aesthetics.pdf#view=fitH" width="90%" height="59%"></iframe>

Another way to frame pervasive technologies is the discussion of a smarter [“internet of things”](http://en.wikipedia.org/wiki/Internet_of_Things) (IoT). Urban<3Beat is motivated by the opportunities for the human-centered version of IoT: “[the internet of me](http://www.wired.com/2014/11/the-internet-of-me/)”, where users might be empowered to better understand their patterns and desires with greater capabilities for personalization and analysis.

<iframe src="../data/local-and-global.pdf#view=fitH" width="90%" height="59%"></iframe>

We were inspired to facilitate opportunities for better understanding self across local and global scales: explorations of individual interests, searches of local results, and side-side comparisons that bridge international boundaries.

## PHASE II: EXPERIMENTATION & ITERATION
After the hackathon, we began to explore our goals for data visualization from both ends (front-end UX and back-end code), and set out to experiment with ways for searching and displaying temporal, dynamic data.

#### The Back-End
The Data Canvas APIs and wealth of data visualizaton tool provided numerous options for presenting the data. Luckily, our own goals (supported of course by a dose of “trial and error” from the front and back-ends) presented a set of constraints:

 1. Wherever possible, data should be represented by simple, dynamic, familiar visual forms

 2. Information which can be abstracted to more familiar visual forms of representation can live on a base layer for “Higher Level” reads

 3. Denser information can live on additional top layers for “deeper dives” (such as that accompanied by larger amounts of text or corresponding assets)

 4.  “Higher Level” data should work harmoniously as layers to create one visual “pulse” (with non-competing aesthetic logics of translation such as color, value, shape, etc.)

Collaboration and open-source is important to us, and so we shared our experiments, and encouraged others to fork their own. Visit our collection of data vis experiments below, hosted on **CodePen**.

[View Experiments >](http://codepen.io/collection/DRzwQR/)
[View Github >](https://github.com/stevepepple/data-canvas-neighborhoods)

###The Front End
From the design of the very first wire at the Hackathon throughout all design iterations, we were keeping an eye on a shared end goal: an ultimately simple interface, and how to bring all layers necessary together and read as a personalized pulse, or **Urban<3Beat**.

<iframe src="../data/simplest-paradox.pdf#view=fitH" width="90%" height="59%"></iframe>

This process of iterative design helped to define constraints for success (see above), but it also revealed the Simplest Paradox: with simplicity comes more complexity. As our wires evolved to pave the simplest path for end user(s), we quickly ran into the need to weed through greater and greater complexity.

##PHASE III: NEXT STEPS

We look forward to continuing work with Urban<3Beat, and already have a few ideas of what we might do next:

 * Work with sound designers to extend the same kind of layered variability and “smart aesthetics” for audio as we did for visuals (i.e. “hear” as well as “see” a cumulative pulse of selected data).

 * Continue experiments visualizing “smart” layers across a greater range of interface formats: processing, animation, physical computing, sensors and displays

 * Explore another trajectory for experimentation: translating experiments into a site-specific feedback loop where users can see and effect data in real-time.

 <iframe src="../data/next-steps.pdf#view=fitH" width="90%" height="59%"></iframe>

 Here are some works in other mediums that inspired our project and future work:
 <iframe src="../data/audio-visual-pulses.pdf#view=fitH" width="90%" height="59%"></iframe>
