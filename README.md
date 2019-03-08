# TrainScheduler

This is a train schedule application that incorporates Firebase to host arrival and departure data. 

* It retrieves and manipulates train data from Firebase with Moment.js. 

* The appprovides up-to-date information about all the trains in the database, namely their arrival times and how many minutes remain until they arrive at their station.
  
* Administrators can submit the following to add a train to the database: 

    * Train Name

    * Destination 

    * First Train Time -- in military time

    * Frequency -- in minutes

* The current time is shown for reference

* Every time the minute changes on the current change the train time information updates and remains relevant