# WNV-map
A repo for the front end of WNV project, the heat map of North Dakota, the greatest state in our beloved nation.

Getting a local development copy up on Windows
======================================
* Install [XAMMP](https://www.apachefriends.org/index.html)
* In the folder where XAMPP was installed (usually C://xampp on Windows), there will be a folder named htdocs.
* Delete everything within the htdocs folder, and clone this repo in the htdocs folder.
* Restart Apache webserver on the XAMPP Control Panel, access docs in a webserver in a manner similar to the following:
  * `localhost/WNV-map/index.html`

Overview
========
This webpage uses Javascript to provide a visualization of the data contained in this [Google Fusion Table](https://www.google.com/fusiontables/DataSource?docid=1ERyLhkU4tx1_bbaU_7_z0Lh5XELJw2xUa1IeD3uD), using [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/). Another useful reference is the [Google Fusion Tables REST API](https://developers.google.com/fusiontables/?hl=en), which is used for some data fetching in the Javascript.

The data in the Fusion Table is a yearly breakdown of mosquito species trap amount by county, and by trap location in the county. The map will display the location information for each record (the county, in this case). Queries against the table must NOT return multiple records with the same location.


The CSS template used was obtained from a free CSS template site. It's source is [here](http://blacktie.co/demo/marco/).
