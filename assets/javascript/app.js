// Train Times and Database Controller
var trainDataController = (function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBqZpQsaz1OvKf2tn9MvqYAZMTcPtIvE18",
        authDomain: "train-scheduler-53b48.firebaseapp.com",
        databaseURL: "https://train-scheduler-53b48.firebaseio.com",
        projectId: "train-scheduler-53b48",
        storageBucket: "train-scheduler-53b48.appspot.com",
        messagingSenderId: "1016262083383"
    };

    firebase.initializeApp(config);
    var database = firebase.database();

    var Train = function(name, destination, firstTime, frequency) {
        this.name = name;
        this.destination = destination;
        this.firstTime = firstTime;
        this.frequency = frequency;
    };

    return {
        addTrain: function(name, des, time, freq) {
            var newTrain = new Train(name, des, time, freq);

            database.ref().push(newTrain);
            return newTrain;
        },
        getTrainArray: function(obj) {
            var objArray = [];
            for (var key in obj.val()) {
                objArray.push(obj.val()[key]);
            }
            return objArray;
        },
        getDatabase: function() {
            return database;
        }
    }
})();

// UI Controller
var UIController = (function() {

    var DOMstrings = {
        currentTime: '#current_time',
        submitBtn: '#submit_btn',
        inputName: '#train_form_name' ,
        inputDestination: '#train_form_dest',
        inputFirstTime: '#train_form_time',
        inputFrequency: '#train_form_freq',
        tableBody: '#train_table_body'
    };

    return {
        getDOMstrings: function() {
            return DOMstrings;
        },
        displayCurrentTime: function(time) {
            document.querySelector(DOMstrings.currentTime).textContent = time;
        },
        getInput: function() {
            return {
                name: document.querySelector(DOMstrings.inputName).value,
                destination: document.querySelector(DOMstrings.inputDestination).value,
                firstTime: document.querySelector(DOMstrings.inputFirstTime).value,
                frequency: parseInt(document.querySelector(DOMstrings.inputFrequency).value)
            }
        },
        displayTrainData: function(obj) {
            var element, html;
            element = DOMstrings.tableBody;
            html = '<tr><td>%name%</td><td>%destination%</td><td>%frequency%</td><td>%nextTrain%</td><td>%minutesAway%</td></tr>'
            var row = document.createElement("tr");
            // Replace placeholder text with some actual data
            html = html.replace('%name%', obj.name);
            html = html.replace('%destination%', obj.destination);
            html = html.replace('%frequency%', obj.frequency);
            html = html.replace('%nextTrain%', obj.nextArrival);
            html = html.replace('%minutesAway%', obj.minutesAway);
            row.innerHTML = html;
            document.querySelector(element).appendChild(row);
        },
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputName + ', ' 
                + DOMstrings.inputDestination + ', ' 
                + DOMstrings.inputFirstTime + ', ' 
                + DOMstrings.inputFrequency);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },
        clearTable: function() {
            document.querySelector(DOMstrings.tableBody).innerHTML = '';
        }

    }

})();

// Global App Controller
var controller = (function(trainCtrl, UICtrl) {
    var dataSnapshot;

    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();
        var database = trainCtrl.getDatabase();
        document.querySelector(DOM.submitBtn).addEventListener('click', ctrlAddTrain);

        database.ref().on("value", function(snapshot) {
            updateTrainTable(snapshot);
            dataSnapshot = snapshot;
        });
    };

    var updateCurrentTime = function() {
        var currentTime = moment().format('h:mm:ss A');
        UIController.displayCurrentTime(currentTime)
        
    };

    var updateTrainTable = function(obj) {

        trainArray = trainCtrl.getTrainArray(obj);
        UICtrl.clearTable();
        for (var i = 0; i < trainArray.length; i++) {
            var train = trainArray[i];
            showTrainInfo(train);
        }

    };

    var getNextTrainTime = function(train) {
        // First Time (pushed back 1 year to make sure it comes before current time)
        var tFrequency = train.frequency;
        var firstTimeConverted = moment(train.firstTime, "HH:mm").subtract(1, "years");

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        var tRemainder = diffTime % tFrequency;

        // Minute Until Train
        var tMinutesTillTrain = tFrequency - tRemainder;

        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        var convertedNextTrain = moment(nextTrain).format("h:mmA");

        return {
            name: train.name,
            destination: train.destination,
            frequency: tFrequency,
            nextArrival: convertedNextTrain,
            minutesAway: tMinutesTillTrain
        }
    }

    var showTrainInfo = function(train) {
        // 1. Manipulate train data with Moment.js
        var convertedTrain = getNextTrainTime(train);

        // 2. Display the data in the UI
        UICtrl.displayTrainData(convertedTrain);
    }

    var ctrlAddTrain = function() {
        var input, newTrain, convertedTrain;

        // 1. Get the field input data
        input = UICtrl.getInput();

        // Check if valid inputs have been entered
        if (input.name !== '' && input.destination !== '' 
            && !isNaN(input.frequency) && input.frequency > 0 
            && moment(input.firstTime, 'HH:mm').format('HH:mm') === input.firstTime) {

            // 2. Add data it to Firebase
            newTrain = trainCtrl.addTrain(input.name, input.destination, input.firstTime, input.frequency)

            // 3. Calculate required information from train data and display it in the UI
            //showTrainInfo(newTrain);

            // 4. Clear the fields
            UICtrl.clearFields();
        }
    }

    return {
        init: function() {
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
            setupEventListeners();
            setInterval(function() {
                updateTrainTable(dataSnapshot);
            }, 5000);
        }
    }

})(trainDataController, UIController);

controller.init();

