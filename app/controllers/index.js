var CloudPush = require('ti.cloudpush');
var Cloud = require("ti.cloud");
Ti.App.Properties.setDouble("log",0.0);
Ti.App.Properties.setDouble("lat",0.0);
function pushNotification(){
	var deviceToken =null;
	CloudPush.debug = true;
    CloudPush.enabled = true;
	CloudPush.showTrayNotificationsWhenFocused = true;
	CloudPush.focusAppOnPush = false;
	
	Cloud.debug = true;
	 
	CloudPush.retrieveDeviceToken({
    	success: deviceTokenSuccess,
    	error: deviceTokenError
	});
	
	function deviceTokenSuccess(e) {
    		deviceToken = e.deviceToken;
	}
	function deviceTokenError(e) {
    		alert('Failed to register for push notifications! ' + e.error);
	}
	
	
	CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
    		Ti.API.info('Tray Click Launched App (app was not running)');
	});
	CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
    		Ti.API.info('Tray Click Focused App (app was already running)');
	});
	
	
	CloudPush.addEventListener('callback', function (evt) {
		var notificacion=JSON.parse(evt.payload);
    	alert("Notification received: " + notificacion.android.alert);
	});
	
	setTimeout(function(){
		Cloud.PushNotifications.subscribeToken({
        	device_token: deviceToken,
        	channel: 'news_alerts',
			user:'appc_app_user_dev',
        	type: Ti.Platform.name === 'android' ? 'android' : 'ios'
    	}, function (e) {
        if (e.success) {
            Ti.App.Properties.setBool('subscrito',true);
        } else {
            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
        }
    	});
	},10000);
	
	setTimeout(function(){
	var latitude;
	var longitude; 
	var pushDeviceToken; // Device token obtained earlier...

		Titanium.Geolocation.getCurrentPosition(function(e) {
	    	if (e.error) {
	        	Ti.API.error('Error: ' + e.error);
	    	} else {
	        	latitude = e.coords.latitude;
	        	longitude = e.coords.longitude;
	        	Ti.App.Properties.setDouble("log",longitude);
	        	Ti.App.Properties.setDouble("lat",latitude);
	        	Cloud.PushNotifications.updateSubscription({
	        	device_token: deviceToken,
	       		loc: [longitude, latitude]
	       }, function (e) {
	            if (e.success) {
	                alert('Subscription Updated.');
	            }
	            else {
	                alert(e);
	            }
	        });                        
	    }
		});
	},20000);
}

function notificar(){
	var longitude;
	var latitude;
	longitude=Ti.App.Properties.getDouble("log");
	latitude=Ti.App.Properties.getDouble("lat");
	Cloud.PushNotifications.notify({
    	channel: 'news_alerts',
    	payload: 'Welcome to push notifications',
    	where:{"loc": { "$nearSphere" : { "$geometry" : { "type" : "Point" , "coordinates" : [longitude,latitude] } , "$maxDistance" : 300 }}}
		}, function (e) {
    		if (e.success) {
        		alert('Success');
    		} else {
        		alert('Error:\n' +
            	((e.error && e.message) || JSON.stringify(e)));
    	}
	});
}

pushNotification();	
$.index.open();
