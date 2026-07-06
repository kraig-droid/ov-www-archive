(function($){
	"use strict";

	// create the alert message
	window.goodlayers_core_course_alert_box = function(options){
	
        var settings = $.extend({
			status: '',
			head: '',
			message: '',
			duration: 1500
        }, options);

		if( settings.status == 'success' ){
			settings.icon = 'fa fa-check';
		}else if( settings.status == 'failed' ){
			settings.icon = 'fa fa-remove';
		}
		
		var alert_box = $('<div class="goodlayers-core-course-alert-box-wrapper">\
				<div class="goodlayers-core-course-alert-box-head">\
					<span class="goodlayers-core-course-alert-box-icon ' + settings.icon + '"></span>\
					<span class="goodlayers-core-course-alert-box-head">' + settings.head + '</span>\
				</div>' +
				((settings.message.length > 0)? '<div class="goodlayers-core-course-alert-box-text">' + settings.message + '</div>': '') +
			'</div>').appendTo($('body'));
		
		alert_box.css({opacity: 0}).animate({opacity:1}, 150);
		
		// center the alert box position
		alert_box.css({
			'margin-left': -(alert_box.outerWidth() / 2),
			'margin-top': -(alert_box.outerHeight() / 2)
		});
				
		// animate the alert box
		alert_box.animate({opacity:1}, function(){
			$(this).delay(settings.duration).fadeOut(200, function(){
				$(this).remove();
			});
		});
		
	} // goodlayers_core_course_alert_box
	
	// create the conformation message
	window.goodlayers_core_course_confirm_box = function(options){

        var settings = $.extend({
			head: goodlayers_core_course_utility.confirm_head,
			text: goodlayers_core_course_utility.confirm_text,
			sub: goodlayers_core_course_utility.confirm_sub,
			success:  function(){}
        }, options);
		
		var confirm_overlay = $('<div class="goodlayers-core-course-conform-box-overlay"></div>').appendTo($('body'));
		var confirm_button = $('<span class="goodlayers-core-course-confirm-box-button goodlayers-core-course-yes">' + goodlayers_core_course_utility.confirm_yes + '</span>');
		var decline_button = $('<span class="goodlayers-core-course-confirm-box-button goodlayers-core-course-no">' + goodlayers_core_course_utility.confirm_no + '</span>');
		
		var confirm_box = $('<div class="goodlayers-core-course-confirm-box-wrapper">\
				<div class="goodlayers-core-course-confirm-box-head">' + settings.head + '</div>\
				<div class="goodlayers-core-course-confirm-box-content-wrapper" >\
					<div class="goodlayers-core-course-confirm-box-text">' + settings.text + '</div>\
					<div class="goodlayers-core-course-confirm-box-sub">' + settings.sub + '</div>\
				</div>\
			</div>').insertAfter(confirm_overlay);
	
	
		$('<div class="goodlayers-core-course-confirm-box-button-wrapper"></div>')
			.append(decline_button).append(confirm_button)
			.appendTo(confirm_box);
		
		// center the alert box position
		confirm_box.css({
			'margin-left': -(confirm_box.outerWidth() / 2),
			'margin-top': -(confirm_box.outerHeight() / 2)
		});
				
		// animate the alert box
		confirm_overlay.css({opacity: 0}).animate({opacity:0.6}, 200);
		confirm_box.css({opacity: 0}).animate({opacity:1}, 200);
		
		confirm_button.click(function(){
			if(typeof(settings.success) == 'function'){ 
				settings.success();
			}
			confirm_overlay.fadeOut(200, function(){
				$(this).remove();
			});
			confirm_box.fadeOut(200, function(){
				$(this).remove();
			});
		});
		decline_button.click(function(){
			confirm_overlay.fadeOut(200, function(){
				$(this).remove();
			});
			confirm_box.fadeOut(200, function(){
				$(this).remove();
			});
		});
		
	} // goodlayers_core_course_confirm_box
	
	// ref : http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	// ensure 1 is fired
	window.goodlayers_core_course_debounce = function(func, threshold, execAsap){
		
		var timeout;

		return function debounced(){
			
			var obj = this, args = arguments;
			
			function delayed(){
				if( !execAsap ){
					func.apply(obj, args);
				}
				timeout = null;
			};

			if( timeout ){
				clearTimeout(timeout);
			}else if( execAsap ){
				func.apply(obj, args);
			}
			timeout = setTimeout(delayed, threshold);
		};
	}	
	
	// reduce the event occurance
	window.goodlayers_core_course_throttling = function(func, threshold){
		
		var timeout;

		return function throttled(){
			var obj = this, args = arguments;
			
			function delayed(){
				func.apply(obj, args);
				timeout = null;
			};

			if( !timeout ){
				timeout = setTimeout(delayed, threshold);
			}
		};
	}

})(jQuery);	