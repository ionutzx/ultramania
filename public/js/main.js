var worldState;
var updateTime;

//Cetus timer stuff
var cetusIsDay;
var cetusCycleExpiryTime;
var cetusCurrentTitle;
var cetusCurrentTitleTimezone;
var cetusCurrentIndicator;
var cetusCurrentIndicatorColor;

//Earth timer stuff
var earthIsDay;
var earthCycleExpiryTime;
var earthCurrentTitle;
var earthCurrentTitleTimezone;
var earthCurrentIndicator;
var earthCurrentIndicatorColor;

//Timer instances for killing purposes
var earthDayCycle;
var cetusDayCycle;
var bountyCycle;
var voidTraderCycle;

// Update worldstate timestamp
function updateWorldStateTime() {
    document.getElementById( 'worldstateinfo' ).setAttribute( 'data-original-title', 'World State updated at ' +
        moment( updateTime ).format( 'MMMM Do YYYY, h:mm:ss a' ) );
}

// Helper function to display duration in human readable format
function formatDuration(duration) {
    var timeText = '';
    if (duration.days()) {
        if (duration.days() !== 1) {
            timeText += duration.days() + ' days ';
        } else {
            timeText += duration.days() + ' day ';
        }
        if (duration.hours() !== 1) {
            timeText += duration.hours() + ' hours ';
        } else {
            timeText += duration.hours() + ' hour ';
        }
        if (duration.minutes() !== 1) {
            timeText += duration.minutes() + ' minutes ';
        } else {
            timeText += duration.minutes() + ' minute ';
        }
    }
    else if (duration.hours()) {
        if (duration.hours() !== 1) {
            timeText += duration.hours() + ' hours ';
        } else {
            timeText += duration.hours() + ' hour ';
        }
        if (duration.minutes() !== 1) {
            timeText += duration.minutes() + ' minutes ';
        } else {
            timeText += duration.minutes() + ' minute ';
        }
    }
    else if (duration.minutes()) {
        if (duration.minutes() !== 1) {
            timeText += duration.minutes() + ' minutes ';
        } else {
            timeText += duration.minutes() + ' minute ';
        }
    }
    if (duration.seconds() !== 1) {
        timeText += duration.seconds() + ' seconds';
    } else {
        timeText += duration.seconds() + ' seconds';
    }
    return timeText;
}

// Helper function to display duration in human readable format, short version
function formatDurationShort(duration) {
    var timeText = '';
    if (duration.days()) {
        timeText += duration.days() + 'd ' + duration.hours() + 'h ' + duration.minutes() + 'm ' + duration.seconds() + 's';
    }
    else if (duration.hours()) {
        timeText += duration.hours() + 'h ' + duration.minutes() + 'm ' + duration.seconds() + 's';
    }
    else if (duration.minutes()) {
        timeText += duration.minutes() + 'm ' + duration.seconds() + 's';
    }
    else{
        timeText += duration.seconds() + 's';
    }
    return timeText;
}

// Helper function to grab objects based on inner tags
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty( i )) {
            continue;
        }
        if (typeof obj[ i ] === 'object') {
            objects = objects.concat( getObjects( obj[ i ], key, val ) );
        } else if (i === key && obj[ key ] === val) {
            objects.push( obj );
        }
    }
    return objects;
}

// Update data that is being used by this page
function updateDataDependencies() {
    cetusCycleExpiryTime = (new Date( worldState.cetusCycle.expiry )).getTime() / 1000;
    cetusIsDay = worldState.cetusCycle.isDay;
    earthCycleExpiryTime = (new Date( worldState.earthCycle.expiry )).getTime() / 1000;
    earthIsDay = worldState.earthCycle.isDay;
}

function getCetusCycleSecondsLeft() {
    var currentTime = (new Date()).getTime() / 1000;
    if(currentTime > cetusCycleExpiryTime){
        if(cetusIsDay){
            cetusIsDay = false;
            cetusCycleExpiryTime += 3000; // Manually update expire time until end of night
        }else{
            cetusIsDay = true;
            cetusCycleExpiryTime += 6000; // Manually update expire time until end of day
        }
    }
    return cetusCycleExpiryTime - currentTime;
}

function getEarthCycleSecondsLeft() {
    var currentTime = (new Date()).getTime() / 1000;
    if(currentTime > earthCycleExpiryTime){
        earthIsDay = !earthIsDay;
        earthCycleExpiryTime += 14400;
    }
    return earthCycleExpiryTime - currentTime;
}

function updateEarthTitle() {
    if (!earthIsDay) {
        earthCurrentIndicator = 'Night';
        earthCurrentIndicatorColor = 'darkblue';
        earthCurrentTitle = 'Time until day: ';
        earthCurrentTitleTimezone = 'Time at day: ';
    } else {
        earthCurrentIndicator = 'Day';
        earthCurrentIndicatorColor = 'orange';
        earthCurrentTitle = 'Time until night: ';
        earthCurrentTitleTimezone = 'Time at night: ';
    }
}

function updateCetusTitle() {
    if (!cetusIsDay) {
        cetusCurrentIndicator = 'Night';
        cetusCurrentIndicatorColor = 'darkblue';
        cetusCurrentTitle = 'Time until day: ';
        cetusCurrentTitleTimezone = 'Time at day: ';
    } else {
        cetusCurrentIndicator = 'Day';
        cetusCurrentIndicatorColor = 'orange';
        cetusCurrentTitle = 'Time until night: ';
        cetusCurrentTitleTimezone = 'Time at night: ';
    }
}

function updateCetusCycle() {
    var expiryTime = moment(worldState.cetusCycle.expiry).unix();
    var currentTime = moment().unix();

    // Oh no, cycle expired before we can fetch a new one
    if(currentTime > expiryTime){
        cetusIsDay = !cetusIsDay;
        if(cetusIsDay){
            expiryTime = moment(worldState.cetusCycle.expiry).add(100, 'm').unix(); // Add 100 min for day, temporarily
        }else{
            expiryTime = moment(worldState.cetusCycle.expiry).add(50, 'm').unix(); // Add 50 min for night, temporarily
        }
    }

    updateCetusTitle();

    var cycleIndicator = $( '#cetuscycleindicator' );
    cycleIndicator.html(cetusCurrentIndicator);
    if (!cycleIndicator.hasClass( cetusCurrentIndicatorColor )) {
        cycleIndicator.attr( 'class', cetusCurrentIndicatorColor );
        cycleIndicator.addClass( 'pull-right' );
    }

    $('#cetuscycletitle').html(cetusCurrentTitle);
    $('#cetustimezonetitle').html(cetusCurrentTitleTimezone);
    $('#cetustimezonetime').html(moment.unix(expiryTime).format( 'h:mm:ss a, MM/DD/YYYY' ));

    var timeBadge = $('#cetuscycletime');
    timeBadge.attr( 'data-endtime', expiryTime );
    timeBadge.addClass('label timer');
}

function updateEarthCycle() {
    var expiryTime = moment(worldState.earthCycle.expiry).unix();
    var currentTime = moment().unix();

    // Oh no, cycle expired before we can fetch a new one
    if(currentTime > expiryTime){
        cetusIsDay = !cetusIsDay;
        expiryTime = moment(worldState.cetusCycle.expiry).add(4, 'h').unix(); // Add 4hrs, temporarily
    }

    updateEarthTitle();

    var cycleIndicator = $( '#earthcycleindicator' );
    cycleIndicator.html(earthCurrentIndicator);
    if (!cycleIndicator.hasClass( earthCurrentIndicatorColor )) {
        cycleIndicator.attr( 'class', earthCurrentIndicatorColor );
        cycleIndicator.addClass( 'pull-right' );
    }

    $('#earthcycletitle').html(earthCurrentTitle);
    $('#earthtimezonetitle').html(earthCurrentTitleTimezone);
    $('#earthtimezonetime').html(moment.unix(expiryTime).format( 'h:mm:ss a, MM/DD/YYYY' ));

    var timeBadge = $('#earthcycletime');
    timeBadge.attr( 'data-endtime', expiryTime );
    timeBadge.addClass('label timer');
}

function updateCetusBountyTimer() {
    var cetusBlock = getObjects( worldState, 'syndicate', 'Ostrons' );
    if (cetusBlock !== null && cetusBlock[ 0 ]) {
        var cetus = cetusBlock[ 0 ];

        var expiryTime = moment(cetus.expiry).unix();
        var activateTime = moment(cetus.activation).unix();
        var currentTime = moment().unix();

        if(currentTime < activateTime){
            $('#cetusbountytitle').html('New bounties in:');
            var timeBadge = $('#cetusbountytime');
            timeBadge.attr( 'data-endtime', activateTime );
            timeBadge.addClass('label timer');
            timeBadge.show();
        }else if(currentTime > activateTime && currentTime < expiryTime){
            $('#cetusbountytitle').html('Bounties expire in:');
            var timeBadge = $('#cetusbountytime');
            timeBadge.attr( 'data-endtime', expiryTime );
            timeBadge.addClass('label timer');
            timeBadge.show();
        }else{
            $('#cetusbountytitle').html('Bounties expired, waiting for update...');
            var timeBadge = $('#cetusbountytime');
            timeBadge.removeClass('label timer');
            timeBadge.hide();
        }
    }
    else {
        $('#cetusbountytitle').html('No bounty information, waiting for update...');
        var timeBadge = $('#cetusbountytime');
        timeBadge.removeClass('label timer');
        timeBadge.hide();
    }
}

function updateVoidTraderInventory() {
    var voidTraderInventory = worldState.voidTrader.inventory;
    if (voidTraderInventory.length !== 0) {
        if (document.getElementById( worldState.voidTrader.id ) === null) {
            var inventoryString = '<div class="panel panel-primary" style="margin-left:5%; margin-right:5%" ' +
                'class="voidTraderInventory" id="' + worldState.voidTrader.id + '">\n<div class="panel-heading">\n' +
                '<h3 class="panel-title">' + worldState.voidTrader.character + ' Inventory' +
                '<a href="#voidTraderInventoryPanel" data-toggle="collapse">' +
                '<span class="glyphicon glyphicon-triangle-bottom pull-right"></span></a></h3>\n' +
                '</div>\n' +
                '<div class="panel-body collapse" id="voidTraderInventoryPanel">\n' +
                '<table class="table table-striped table-hover ">\n' +
                '<thead>\n' +
                '<tr>\n' +
                '<th class="text-center">Item Name</th>\n' +
                '<th class="text-center">Ducats</th>\n' +
                '<th class="text-center">Credits</th>\n' +
                '</tr>\n' +
                '</thead>\n' +
                '<tbody id="voidTraderInventoryContent">\n' +
                '</tbody>\n' +
                '</table>\n' +
                '</div>\n' +
                '</div>';
            var elementBody = $( '#voidTraderBody' );
            elementBody.append( inventoryString );
            elementBody.show();
            for (var item = 0; item < voidTraderInventory.length; item++) {
                var currentItem = voidTraderInventory[ item ];
                var itemString = '<tr><td>' + currentItem.item + '</td>' +
                    '<td>' + currentItem.ducats + '</td>' + '<td>' + currentItem.credits + '</td></tr>';
                $( '#voidTraderInventoryContent' ).append(itemString);
            }
        }
    }
    else {
        if (document.getElementsByClassName( 'voidTraderInventory' )) {
            $( '.voidTraderInventory' ).remove();
        }
        $( '#voidTraderBody' ).hide();
    }
}

function updateVoidTrader() {
    var voidTrader = worldState.voidTrader;
    if (voidTrader) {
        var expiryTime = moment(voidTrader.expiry).unix();
        var activateTime = moment(voidTrader.activation).unix();
        var currentTime = moment().unix();

        if(currentTime < activateTime){
            $('#voidtradertitle').html(voidTrader.character + ' arrives in:');
            $('#voidtradertimezonetitle').html('Arrives at:');
            $('#voidtradertimezonetime').html(moment.unix(activateTime).format( 'h:mm:ss a, MM/DD/YYYY' ));

            var timeBadge = $('#voidtradertime');
            timeBadge.attr( 'data-endtime', activateTime );
            timeBadge.addClass('label timer');
            timeBadge.show();
        }else if(currentTime > activateTime && currentTime < expiryTime){
            $('#voidtradertitle').html(voidTrader.character + ' leaves in:');
            $('#voidtradertimezonetitle').html('Leaves at:');
            $('#voidtradertimezonetime').html(moment.unix(expiryTime).format( 'h:mm:ss a, MM/DD/YYYY' ));

            var timeBadge = $('#voidtradertime');
            timeBadge.attr( 'data-endtime', expiryTime );
            timeBadge.addClass('label timer');
            timeBadge.show();
        }else{
            $('#voidtradertitle').html('Void Trader expired, waiting for update...');
            $('#voidtradertimezonetitle').html('');
            $('#voidtradertimezonetime').html('');

            var timeBadge = $('#voidtradertime');
            timeBadge.removeClass('label timer');
            timeBadge.hide();
        }
    }
    else {
        $('#voidtradertitle').html('No Void Trader available, waiting for update...');
        $('#voidtradertimezonetitle').html('');
        $('#voidtradertimezonetime').html('');

        var timeBadge = $('#voidtradertime');
        timeBadge.removeClass('label timer');
        timeBadge.hide();
    }
}

function calculateDiscount(original, sale){
    return Math.floor((sale - original) / original * 100) + '%';
}

function calculateInventory(total, sold){
    return (total - sold) + '/' + total;
}

function updateDarvoDeals() {
    var dailyDeals = worldState.dailyDeals;
    if (dailyDeals.length !== 0) {
        $('#darvotitle').hide();
        if (document.getElementById( dailyDeals[0].id ) === null) {
            var inventoryString = '<table class="table table-striped table-hover dailyDealsInventory" id="' +
                dailyDeals[0].id + '">\n' +
                '<thead>\n' +
                '<tr>\n' +
                '<th class="text-center">Item Name</th>\n' +
                '<th class="text-center">Discount</th>\n' +
                '<th class="text-center">Platinum</th>\n' +
                '<th class="text-center">Stock</th>\n' +
                '<th class="text-center">Time Left</th>\n' +
                '</tr>\n' +
                '</thead>\n' +
                '<tbody id="dailyDealsInventory">\n' +
                '</tbody>\n' +
                '</table>\n' +
                '</div>\n' +
                '</div>';
            $( '#darvobody' ).append( inventoryString );
            for (var item = 0; item < dailyDeals.length; item++) {
                var currentItem = dailyDeals[ item ];
                var itemString = '<tr><td>' + currentItem.item + '</td><td>' + calculateDiscount(currentItem.originalPrice,
                    currentItem.salePrice) + '</td>' + '<td>' + currentItem.salePrice + '</td><td>' +
                    calculateInventory(currentItem.total, currentItem.sold) + '</td>' +
                    '<td><span class="label timer" data-endtime="' + moment(currentItem.expiry).unix() + '"></span></td></tr>';
                $( '#dailyDealsInventory' ).append(itemString);
            }
        }
    }
    else {
        if (document.getElementsByClassName( 'dailyDealsInventory' )) {
            $( '.dailyDealsInventory' ).remove();
            document.getElementById( 'darvotitle' ).innerText = 'No current deals :(';
            $( '#darvotitle' ).show();
        }
    }
}

function updatePage() {
    updateEarthCycle();
    updateCetusCycle();
    updateVoidTrader();
    updateVoidTraderInventory();
    updateDarvoDeals();
    updateCetusBountyTimer();
    updateWorldStateTime();
}

// Retrieves the easy to parse worldstate from WFCD
function getWorldState() {
    $.getJSON( 'https://ws.warframestat.us/pc', function (data) {
        worldState = JSON.parse( JSON.stringify( data ) );
        updateTime = (new Date()).getTime();
        updateDataDependencies();
        updatePage();
    } );
}

function removeTimeBadgeColor(element){
    element.removeClass('label-success');
    element.removeClass('label-primary');
    element.removeClass('label-danger');
    element.removeClass('label-warning');
    element.removeClass('label-default');
}

function updateTimeBadges() {
    var labels = document.getElementsByClassName('timer');
    for(var i = 0; i < labels.length; i++){
        var currentLabel = $(labels[i]);
        var diff = moment().diff(moment.unix(currentLabel.attr('data-endtime'))) * -1;
        var duration = moment.duration( diff, 'milliseconds' );
        //Expired
        if(diff < 0){
            if(!currentLabel.hasClass('label-default')){
                removeTimeBadgeColor(currentLabel);
            }
            currentLabel.addClass('label-default');
            currentLabel.html('Expired: ' + formatDurationShort( duration ));
        }
        //0 min to 10 min
        else if(diff < 600000) {
            if(!currentLabel.hasClass('label-danger')){
                removeTimeBadgeColor(currentLabel);
            }
            currentLabel.addClass('label-danger');
            currentLabel.html(formatDurationShort( duration ));
        }
        //10 min to 30 min
        else if(diff < 1800000) {
            if(!currentLabel.hasClass('label-warning')){
                removeTimeBadgeColor(currentLabel);
            }
            currentLabel.addClass('label-warning');
            currentLabel.html(formatDurationShort( duration ));
        }
        //30 min to 1 hour
        else if(diff < 3600000) {
            if(!currentLabel.hasClass('label-success')){
                removeTimeBadgeColor(currentLabel);
            }
            currentLabel.addClass('label-success');
            currentLabel.html(formatDurationShort( duration ));
        }
        //More than 1 hour
        else if(diff > 3600000) {
            if(!currentLabel.hasClass('label-primary')){
                removeTimeBadgeColor(currentLabel);
            }
            currentLabel.addClass('label-primary');
            currentLabel.html(formatDurationShort( duration ));
        }

    }
    setTimeout(updateTimeBadges, 1000);
}

function updateResetTime() {
    var nextReset = (new Date()).setUTCHours(24, 0, 0, 0) / 1000; //We want unix seconds, not unix millis
    $('#resettimertitle').html( 'Time until new server day:' );
    var timeBadge = $('#resettimertime');
    timeBadge.attr( 'data-endtime', nextReset );
    timeBadge.addClass('label timer');
}

// Main data refresh loop every 60 minutes
function update(){
    getWorldState();
    setTimeout(update, 60000);
}

update();
updateTimeBadges(); // Method has its own 1 second timeout
updateResetTime(); // This should not be called again unless the timer expires